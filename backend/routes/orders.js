// /api/orders
//  - any logged-in user can place an order; customers only ever see their OWN orders
//  - kitchen staff move orders through the status workflow
//  - bills are created automatically; ingredients are deducted when cooking starts
// Multi-table writes run in SQL transactions: everything is saved, or nothing is.
const router = require('express').Router();
const { Op, literal } = require('sequelize');
const { Order, OrderItem, OrderStatusHistory, Billing, MenuItem, MenuIngredient, Ingredient, Staff, User, sequelize } = require('../models');
const { ROLES } = require('../config');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList } = require('../utils');

// Allowed status changes. Anything else is rejected.
const TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

const ADDRESS_FIELDS = ['flatNo', 'street', 'societyName', 'city', 'state', 'latitude', 'longitude'];

const fullInclude = [
  { model: OrderItem, as: 'items' },
  { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
  { model: Staff, as: 'deliveryPartner', attributes: ['id', 'firstName', 'lastName', 'contactNumber'] },
  { model: OrderStatusHistory, as: 'statusHistory' },
];

// Customers can only touch their own orders; staff can touch all
const scope = (req) => (req.user.role === ROLES.CUSTOMER ? { customerId: req.user.id } : {});

router.get('/test', (req, res) => res.json({ success: true, message: 'Orders routes are working ✅' }));

router.use(protect);

// GET /api/orders?status=placed&customerId=2&deliveryPartnerId=1
router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = { ...filters(req.query, ['status', 'customerId', 'deliveryPartnerId']), ...scope(req) };
  sendList(res, await Order.findAndCountAll({ where, include: fullInclude, order: [['createdAt', 'DESC']], limit: p.limit, offset: p.offset, distinct: true }), p);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ where: { id: parseId(req.params.id), ...scope(req) }, include: fullInclude });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: order });
}));

// POST /api/orders
// Body: { items: [{ menuItemId: 1, quantity: 2 }], deliveryAddress?: { flatNo, street, ... }, notes? }
// (staff may also send customerId to order on behalf of a customer)
// Prices are read from the database — never trusted from the client.
router.post('/', asyncHandler(async (req, res) => {
  const { items, deliveryAddress, notes } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, 'Order must contain at least one item');

  const requested = items.map((i) => ({ menuItemId: parseId(i.menuItemId, 'menuItemId'), quantity: Number(i.quantity) }));
  const menuDocs = await MenuItem.findAll({ where: { id: { [Op.in]: requested.map((r) => r.menuItemId) } } });
  const menuById = new Map(menuDocs.map((m) => [m.id, m]));

  const lines = requested.map((r) => {
    const menu = menuById.get(r.menuItemId);
    if (!menu) throw new ApiError(400, `Menu item not found: ${r.menuItemId}`);
    if (!menu.isAvailable) throw new ApiError(400, `"${menu.name}" is currently unavailable`);
    if (!Number.isInteger(r.quantity) || r.quantity < 1) throw new ApiError(400, `Invalid quantity for "${menu.name}"`);
    return { menuItemId: menu.id, name: menu.name, quantity: r.quantity, price: menu.price, subtotal: menu.price * r.quantity };
  });
  const totalCost = lines.reduce((sum, l) => sum + l.subtotal, 0);

  const customer = await User.findByPk(parseId(req.body.customerId, 'customerId'));
  if (!customer || customer.role !== ROLES.CUSTOMER)
    throw new ApiError(400, 'customerId must be an existing customer');
  const customerId = customer.id;
  const address = pick(deliveryAddress || customer, ADDRESS_FIELDS); // default: the customer's saved address
  const addressText = [address.flatNo, address.societyName, address.street, address.city, address.state].filter(Boolean).join(', ');

  const { order, bill } = await sequelize.transaction(async (t) => {
    const created = await Order.create({ customerId, totalCost, notes, ...address }, { transaction: t });
    await OrderItem.bulkCreate(lines.map((l) => ({ ...l, orderId: created.id })), { transaction: t });
    await OrderStatusHistory.create({ orderId: created.id, status: 'placed', changedById: req.user.id }, { transaction: t });
    const billing = await Billing.create({ orderId: created.id, customerId, totalAmount: totalCost, address: addressText }, { transaction: t });
    return { order: created, bill: billing };
  });

  res.status(201).json({ success: true, data: { order: await Order.findByPk(order.id, { include: fullInclude }), bill } });
}));

// PATCH /api/orders/:id/status  { status, deliveryPartnerId? }   (admin, manager, chef, delivery)
// Moving to "preparing" deducts the recipe ingredients from stock. If any ingredient is short,
// the whole change is rolled back and a 409 is returned.
router.patch('/:id/status', authorize('admin', 'manager', 'chef', 'delivery'), asyncHandler(async (req, res) => {
  const next = req.body.status;

  const order = await sequelize.transaction(async (t) => {
    const found = await Order.findByPk(parseId(req.params.id), { transaction: t, lock: t.LOCK.UPDATE });
    if (!found) throw new ApiError(404, 'Order not found');
    if (!(TRANSITIONS[found.status] || []).includes(next)) {
      throw new ApiError(400, `Cannot change status from "${found.status}" to "${next}"`);
    }

    const changes = { status: next };

    if (next === 'preparing' && !found.inventoryDeducted) {
      // Total ingredient quantity needed = recipe quantity x number of servings
      const lines = await OrderItem.findAll({ where: { orderId: found.id }, transaction: t });
      const menuIds = lines.map((l) => l.menuItemId).filter(Boolean);
      const recipes = await MenuIngredient.findAll({ where: { menuItemId: { [Op.in]: menuIds } }, transaction: t });

      const needed = new Map(); // ingredientId -> quantity
      for (const line of lines) {
        for (const r of recipes.filter((x) => x.menuItemId === line.menuItemId)) {
          needed.set(r.ingredientId, (needed.get(r.ingredientId) || 0) + r.quantityRequired * line.quantity);
        }
      }
      for (const [ingredientId, qty] of needed) {
        if (!(qty > 0)) continue;
        // The UPDATE only succeeds if enough stock is left
        const [affected] = await Ingredient.update(
          { availableQuantity: literal(`availableQuantity - ${Number(qty)}`) }, // qty is a number we computed
          { where: { id: ingredientId, availableQuantity: { [Op.gte]: qty } }, transaction: t }
        );
        if (affected === 0) {
          const ing = await Ingredient.findByPk(ingredientId, { transaction: t });
          throw new ApiError(409, `Insufficient stock for ingredient: ${ing ? ing.name : ingredientId}`);
        }
      }
      changes.inventoryDeducted = true;
    }

    if (next === 'out_for_delivery' && req.body.deliveryPartnerId != null) {
      const partner = await Staff.findByPk(parseId(req.body.deliveryPartnerId, 'deliveryPartnerId'), { transaction: t });
      if (!partner || partner.role !== 'delivery') throw new ApiError(400, 'deliveryPartnerId must be a delivery staff member');
      changes.deliveryPartnerId = partner.id;
    }

    await found.update(changes, { transaction: t });
    await OrderStatusHistory.create({ orderId: found.id, status: next, changedById: req.user.id }, { transaction: t });
    return found;
  });

  res.json({ success: true, data: order });
}));

// PATCH /api/orders/:id/cancel — customers: only while "placed"; staff: "placed" or "confirmed"
router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ where: { id: parseId(req.params.id), ...scope(req) } });
  if (!order) throw new ApiError(404, 'Order not found');

  const allowed = req.user.role === ROLES.CUSTOMER ? ['placed'] : ['placed', 'confirmed'];
  if (!allowed.includes(order.status)) throw new ApiError(400, `An order that is "${order.status}" can no longer be cancelled`);

  await sequelize.transaction(async (t) => {
    await order.update({ status: 'cancelled' }, { transaction: t });
    await OrderStatusHistory.create({ orderId: order.id, status: 'cancelled', changedById: req.user.id }, { transaction: t });
  });
  res.json({ success: true, data: order });
}));

// PUT /api/orders/:id — edit notes / delivery address only (admin, manager)
router.put('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const order = await Order.findByPk(parseId(req.params.id));
  if (!order) throw new ApiError(404, 'Order not found');
  await order.update(pick(req.body, ['notes', ...ADDRESS_FIELDS]));
  res.json({ success: true, data: order });
}));

// DELETE /api/orders/:id (admin). Orders with payments can't be deleted (409) — cancel them instead.
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const order = await Order.findByPk(parseId(req.params.id));
  if (!order) throw new ApiError(404, 'Order not found');
  await order.destroy(); // items, status history and the bill are deleted with it
  res.json({ success: true, message: 'Order deleted' });
}));

module.exports = router;
