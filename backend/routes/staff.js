// /api/staff — admin/manager manage staff; chef/delivery can view
const router = require('express').Router();
const { Staff } = require('../models');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList, searchWhere } = require('../utils');

const FIELDS = ['firstName', 'lastName', 'email', 'contactNumber', 'role', 'salary', 'hiringDate', 'isActive', 'userId'];

router.get('/test', (req, res) => res.json({ success: true, message: 'Staff routes are working ✅' }));

router.use(protect);

// GET /api/staff?role=chef&isActive=true&q=ravi
router.get('/', authorize('admin', 'manager', 'chef', 'delivery'), asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = { ...filters(req.query, ['role', 'isActive']), ...searchWhere(req.query.q, ['firstName', 'lastName', 'email', 'contactNumber']) };
  sendList(res, await Staff.findAndCountAll({ where, order: [['firstName', 'ASC']], limit: p.limit, offset: p.offset }), p);
}));

router.get('/:id', authorize('admin', 'manager', 'chef', 'delivery'), asyncHandler(async (req, res) => {
  const staff = await Staff.findByPk(parseId(req.params.id));
  if (!staff) throw new ApiError(404, 'Staff member not found');
  res.json({ success: true, data: staff });
}));

router.post('/', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Staff.create(pick(req.body, FIELDS)) });
}));

router.put('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const staff = await Staff.findByPk(parseId(req.params.id));
  if (!staff) throw new ApiError(404, 'Staff member not found');
  await staff.update(pick(req.body, FIELDS));
  res.json({ success: true, data: staff });
}));

router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const staff = await Staff.findByPk(parseId(req.params.id));
  if (!staff) throw new ApiError(404, 'Staff member not found');
  await staff.destroy(); // blocked (409) if salary records exist — set isActive=false instead
  res.json({ success: true, message: 'Staff member deleted' });
}));

module.exports = router;
