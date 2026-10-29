// /api/payments — customers pay their own bills; admin/manager confirm or refund.
const router = require('express').Router();
const { Payment, Billing, User, sequelize } = require('../models');
const { ROLES } = require('../config');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList } = require('../utils');

const withCustomer = [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }];
const scope = (req) => (req.user.role === ROLES.CUSTOMER ? { customerId: req.user.id } : {});

// Keeps the bill's paymentStatus in sync with the payment's status
const syncBill = async (payment, t) => {
  const map = { success: 'paid', refunded: 'refunded' };
  if (map[payment.status]) await Billing.update({ paymentStatus: map[payment.status] }, { where: { id: payment.billId }, transaction: t });
};


router.use(protect);

// GET /api/payments?status=success&method=upi&billId=3
router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = { ...filters(req.query, ['billId', 'orderId', 'customerId', 'status', 'method']), ...scope(req) };
  sendList(res, await Payment.findAndCountAll({ where, include: withCustomer, order: [['createdAt', 'DESC']], limit: p.limit, offset: p.offset }), p);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ where: { id: parseId(req.params.id), ...scope(req) }, include: withCustomer });
  if (!payment) throw new ApiError(404, 'Payment not found');
  res.json({ success: true, data: payment });
}));

// POST /api/payments  { billId, method: cash|card|upi|wallet, transactionId? }
// The amount ALWAYS comes from the bill. There is no real payment gateway yet: card/upi/wallet are
// marked "success" immediately (demo) and cash stays "pending" until staff confirm it.
// >>> Add Razorpay/Stripe verification here when you connect a real gateway.
router.post('/', asyncHandler(async (req, res) => {
  const { billId, method, transactionId } = req.body;

  const payment = await sequelize.transaction(async (t) => {
    const bill = await Billing.findOne({ where: { id: parseId(billId, 'billId'), ...scope(req) }, transaction: t, lock: t.LOCK.UPDATE });
    if (!bill) throw new ApiError(404, 'Bill not found');
    if (bill.paymentStatus === 'paid') throw new ApiError(400, 'This bill is already paid');

    const online = method !== 'cash';
    const created = await Payment.create(
      {
        billId: bill.id,
        orderId: bill.orderId,
        customerId: bill.customerId,
        amount: bill.totalAmount,
        method,
        transactionId: typeof transactionId === 'string' ? transactionId : null,
        status: online ? 'success' : 'pending',
        paidAt: online ? new Date() : null,
      },
      { transaction: t }
    );
    await syncBill(created, t);
    return created;
  });
  res.status(201).json({ success: true, data: payment });
}));

// PATCH /api/payments/:id/status  { status: pending|success|failed|refunded }  (admin, manager)
router.patch('/:id/status', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'success', 'failed', 'refunded'].includes(status)) throw new ApiError(400, 'Invalid payment status');

  const payment = await sequelize.transaction(async (t) => {
    const found = await Payment.findByPk(parseId(req.params.id), { transaction: t, lock: t.LOCK.UPDATE });
    if (!found) throw new ApiError(404, 'Payment not found');
    await found.update({ status, paidAt: status === 'success' ? new Date() : found.paidAt }, { transaction: t });
    await syncBill(found, t);
    return found;
  });
  res.json({ success: true, data: payment });
}));

// PUT /api/payments/:id — fix the method / transaction id (admin, manager)
router.put('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(parseId(req.params.id));
  if (!payment) throw new ApiError(404, 'Payment not found');
  await payment.update(pick(req.body, ['method', 'transactionId']));
  res.json({ success: true, data: payment });
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const payment = await Payment.findByPk(parseId(req.params.id));
  if (!payment) throw new ApiError(404, 'Payment not found');
  await payment.destroy();
  res.json({ success: true, message: 'Payment deleted' });
}));

module.exports = router;
