// /api/salaries — monthly salary records, one per staff member per month ("YYYY-MM") (admin/manager)
const router = require('express').Router();
const { Salary, Staff } = require('../models');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList } = require('../utils');

const FIELDS = ['staffId', 'month', 'amount', 'paymentStatus', 'paymentDate'];
const withStaff = [{ model: Staff, as: 'staff', attributes: ['id', 'firstName', 'lastName', 'role', 'salary'] }];


router.use(protect, authorize('admin', 'manager'));

// GET /api/salaries?staffId=3&month=2026-10&paymentStatus=pending
router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = filters(req.query, ['staffId', 'month', 'paymentStatus']);
  sendList(res, await Salary.findAndCountAll({ where, include: withStaff, order: [['month', 'DESC']], limit: p.limit, offset: p.offset }), p);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const salary = await Salary.findByPk(parseId(req.params.id), { include: withStaff });
  if (!salary) throw new ApiError(404, 'Salary record not found');
  res.json({ success: true, data: salary });
}));

router.post('/', asyncHandler(async (req, res) => {
  const body = pick(req.body, FIELDS);
  body.staffId = parseId(body.staffId, 'staffId');
  res.status(201).json({ success: true, data: await Salary.create(body) });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const salary = await Salary.findByPk(parseId(req.params.id));
  if (!salary) throw new ApiError(404, 'Salary record not found');
  await salary.update(pick(req.body, ['month', 'amount', 'paymentStatus', 'paymentDate']));
  res.json({ success: true, data: salary });
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const salary = await Salary.findByPk(parseId(req.params.id));
  if (!salary) throw new ApiError(404, 'Salary record not found');
  await salary.destroy();
  res.json({ success: true, message: 'Salary record deleted' });
}));

module.exports = router;
