// /api/purchases — stock bought from suppliers (admin/manager).
// Create body: { supplierId, purchaseDate?, paymentStatus?,
//                items: [{ ingredientId | inventoryItemId, quantity, unitPrice }] }
// Stock only goes up when you call PATCH /:id/receive.
const router = require('express').Router();
const { Purchase, PurchaseItem, Supplier, Ingredient, InventoryItem, sequelize } = require('../models');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList } = require('../utils');

const fullInclude = [
  { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'contactNumber'] },
  {
    model: PurchaseItem,
    as: 'items',
    include: [
      { model: Ingredient, as: 'ingredient', attributes: ['id', 'name', 'unit'] },
      { model: InventoryItem, as: 'inventoryItem', attributes: ['id', 'name', 'unit'] },
    ],
  },
];

router.get('/test', (req, res) => res.json({ success: true, message: 'Purchases routes are working ✅' }));

router.use(protect, authorize('admin', 'manager'));

// GET /api/purchases?supplierId=1&status=ordered&paymentStatus=pending
router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = filters(req.query, ['supplierId', 'status', 'paymentStatus']);
  sendList(res, await Purchase.findAndCountAll({ where, include: fullInclude, order: [['createdAt', 'DESC']], limit: p.limit, offset: p.offset, distinct: true }), p);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const purchase = await Purchase.findByPk(parseId(req.params.id), { include: fullInclude });
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  res.json({ success: true, data: purchase });
}));

// POST /api/purchases — the total is calculated here from the items
router.post('/', asyncHandler(async (req, res) => {
  const { supplierId, items, purchaseDate, paymentStatus } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, 'A purchase needs at least one item');

  const lines = items.map((i) => {
    const ingredientId = i.ingredientId != null ? parseId(i.ingredientId, 'ingredientId') : null;
    const inventoryItemId = i.inventoryItemId != null ? parseId(i.inventoryItemId, 'inventoryItemId') : null;
    const quantity = Number(i.quantity);
    const unitPrice = Number(i.unitPrice);
    if (!(quantity > 0) || !(unitPrice >= 0)) throw new ApiError(400, 'Each item needs quantity > 0 and unitPrice >= 0');
    return { ingredientId, inventoryItemId, quantity, unitPrice };
  });
  const totalAmount = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const purchase = await sequelize.transaction(async (t) => {
    const created = await Purchase.create({ supplierId: parseId(supplierId, 'supplierId'), purchaseDate, paymentStatus, totalAmount }, { transaction: t });
    await PurchaseItem.bulkCreate(lines.map((l) => ({ ...l, purchaseId: created.id })), { transaction: t, validate: true });
    return created;
  });
  res.status(201).json({ success: true, data: await Purchase.findByPk(purchase.id, { include: fullInclude }) });
}));

// PUT /api/purchases/:id — only the date and payment status can be edited
router.put('/:id', asyncHandler(async (req, res) => {
  const purchase = await Purchase.findByPk(parseId(req.params.id));
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  await purchase.update(pick(req.body, ['purchaseDate', 'paymentStatus']));
  res.json({ success: true, data: purchase });
}));

// PATCH /api/purchases/:id/receive — marks as received and adds the quantities to stock (all-or-nothing)
router.patch('/:id/receive', asyncHandler(async (req, res) => {
  const purchase = await sequelize.transaction(async (t) => {
    const p = await Purchase.findByPk(parseId(req.params.id), { transaction: t, lock: t.LOCK.UPDATE });
    if (!p) throw new ApiError(404, 'Purchase not found');
    if (p.status !== 'ordered') throw new ApiError(400, `Purchase is already ${p.status}`);

    const lines = await PurchaseItem.findAll({ where: { purchaseId: p.id }, transaction: t });
    for (const line of lines) {
      const Model = line.ingredientId ? Ingredient : InventoryItem;
      await Model.increment('availableQuantity', { by: line.quantity, where: { id: line.ingredientId || line.inventoryItemId }, transaction: t });
    }
    await p.update({ status: 'received', receivedAt: new Date() }, { transaction: t });
    return p;
  });
  res.json({ success: true, message: 'Purchase received and stock updated', data: purchase });
}));

// PATCH /api/purchases/:id/cancel
router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  const purchase = await Purchase.findByPk(parseId(req.params.id));
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  if (purchase.status !== 'ordered') throw new ApiError(400, `Cannot cancel a purchase that is ${purchase.status}`);
  await purchase.update({ status: 'cancelled' });
  res.json({ success: true, data: purchase });
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const purchase = await Purchase.findByPk(parseId(req.params.id));
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  await purchase.destroy(); // its items are deleted with it
  res.json({ success: true, message: 'Purchase deleted' });
}));

module.exports = router;
