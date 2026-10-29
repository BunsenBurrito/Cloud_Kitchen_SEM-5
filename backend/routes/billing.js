// /api/billing — bills are created automatically with each order (see orders.js).
// Customers see only their own bills; admin/manager manage all.
const router = require('express').Router();
const { Billing, Order, User } = require('../models');
const { ROLES } = require('../config');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList } = require('../utils');

const fullInclude = [
  { model: Order, as: 'order', attributes: ['id', 'totalCost', 'status', 'orderTime'] },
  { model: User, as: 'customer', attributes: ['id', 'name', 'email'] },
];
const scope = (req) => (req.user.role === ROLES.CUSTOMER ? { customerId: req.user.id } : {});


router.use(protect);

// GET /api/billing?paymentStatus=unpaid&orderId=5
router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = { ...filters(req.query, ['orderId', 'customerId', 'paymentStatus']), ...scope(req) };
  sendList(res, await Billing.findAndCountAll({ where, include: fullInclude, order: [['createdAt', 'DESC']], limit: p.limit, offset: p.offset }), p);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const bill = await Billing.findOne({ where: { id: parseId(req.params.id), ...scope(req) }, include: fullInclude });
  if (!bill) throw new ApiError(404, 'Bill not found');
  res.json({ success: true, data: bill });
}));

// Normally bills are automatic; this lets admin/manager create one by hand
router.post('/', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const body = pick(req.body, ['orderId', 'customerId', 'totalAmount', 'address']);
  body.orderId = parseId(body.orderId, 'orderId');
  body.customerId = parseId(body.customerId, 'customerId');
  res.status(201).json({ success: true, data: await Billing.create(body) });
}));

router.put('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const bill = await Billing.findByPk(parseId(req.params.id));
  if (!bill) throw new ApiError(404, 'Bill not found');
  await bill.update(pick(req.body, ['totalAmount', 'address', 'paymentStatus']));
  res.json({ success: true, data: bill });
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const bill = await Billing.findByPk(parseId(req.params.id));
  if (!bill) throw new ApiError(404, 'Bill not found');
  await bill.destroy(); // blocked (409) if payments exist
  res.json({ success: true, message: 'Bill deleted' });
}));

module.exports = router;
