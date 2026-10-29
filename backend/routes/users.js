// /api/users — admin only: list / read / create / update / delete users (customers, staff logins, admins)
const router = require('express').Router();
const crypto = require('crypto');
const { User } = require('../models');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList, searchWhere } = require('../utils');

const FIELDS = ['name', 'email', 'password', 'role', 'phone', 'dateOfBirth', 'flatNo', 'street', 'societyName', 'city', 'state', 'latitude', 'longitude', 'isActive'];


router.use(protect, authorize('admin')); // everything below: admin only

// GET /api/users?role=chef&isActive=true&q=ravi&page=1&limit=20
router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = { ...filters(req.query, ['role', 'isActive']), ...searchWhere(req.query.q, ['name', 'email', 'phone']) };
  sendList(res, await User.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: p.limit, offset: p.offset }), p);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(parseId(req.params.id));
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
}));

router.post('/', asyncHandler(async (req, res) => {
  const user = await User.create({ ...pick(req.body, FIELDS), password: req.body.password || crypto.randomBytes(12).toString('hex') });
  const safe = user.toJSON();
  delete safe.password;
  res.status(201).json({ success: true, data: safe });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(parseId(req.params.id));
  if (!user) throw new ApiError(404, 'User not found');
  await user.update(pick(req.body, FIELDS)); // a new password is hashed by the model hook
  res.json({ success: true, data: user });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === req.user.id) throw new ApiError(400, 'You cannot delete your own account');
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found');
  await user.destroy(); // blocked (409) if the user still has orders
  res.json({ success: true, message: 'User deleted' });
}));

module.exports = router;
