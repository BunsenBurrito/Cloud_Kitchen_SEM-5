// /api/auth — admin sign in and profile (there is no public sign-up)
const router = require('express').Router();
const { User } = require('../models');
const { ROLES } = require('../config');
const { protect } = require('../middleware');
const { ApiError, asyncHandler, pick, signToken } = require('../utils');

const isString = (v) => typeof v === 'string' && v.length > 0;

// Sends { token, user } back (the password hash is never included)
const sendAuth = (res, status, user) => {
  const safe = user.toJSON();
  delete safe.password;
  res.status(status).json({ success: true, token: signToken(user.id), user: safe });
};

// Quick check that this route file is mounted
router.get('/test', (req, res) => res.json({ success: true, message: 'Auth routes are working ✅' }));

// POST /api/auth/login  { email, password }
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!isString(email) || !isString(password)) throw new ApiError(400, 'email and password are required');

  const user = await User.unscoped().findOne({ where: { email: email.trim().toLowerCase() } }); // unscoped => includes the hash
  // Same message for "no such user" and "wrong password" so emails can't be discovered
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated');
  if (user.role !== ROLES.ADMIN)
    throw new ApiError(403, 'Only the admin can sign in');
  sendAuth(res, 200, user);
}));

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

// PATCH /api/auth/me — update own profile (role, email and password can't be changed here)
router.patch('/me', protect, asyncHandler(async (req, res) => {
  await req.user.update(pick(req.body, ['name', 'phone', 'dateOfBirth', 'flatNo', 'street', 'societyName', 'city', 'state', 'latitude', 'longitude']));
  res.json({ success: true, user: req.user });
}));

// PATCH /api/auth/change-password  { currentPassword, newPassword }
router.patch('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!isString(currentPassword) || !isString(newPassword)) throw new ApiError(400, 'currentPassword and newPassword are required');

  const user = await User.unscoped().findByPk(req.user.id);
  if (!(await user.comparePassword(currentPassword))) throw new ApiError(401, 'Current password is incorrect');
  await user.update({ password: newPassword }); // hashed by the model hook
  sendAuth(res, 200, user);
}));

module.exports = router;
