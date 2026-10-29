// Auth middleware + 404 + error handler, all in one file.
const jwt = require('jsonwebtoken');
const { jwtSecret, nodeEnv, ROLES } = require('./config');
const { User } = require('./models');
const { ApiError, asyncHandler } = require('./utils');

// Reads "Authorization: Bearer <token>" and returns the matching active user (or null).
const getUser = async (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], jwtSecret);
  } catch (e) {
    throw new ApiError(401, 'Invalid or expired token. Please sign in again.');
  }
  const user = await User.findByPk(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'User no longer exists or is deactivated.');
  return user;
};

// Must be logged in. Sets req.user.
const protect = asyncHandler(async (req, res, next) => {
  const user = await getUser(req);
  if (!user)
    throw new ApiError(401, 'Not authenticated. Please sign in.');
  if (user.role !== ROLES.ADMIN)
    throw new ApiError(403, 'Admin access only.');
  req.user = user;
  next();
});

// Logged in OR anonymous (used for the public menu). Sets req.user if a valid token is sent.
const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await getUser(req);
  next();
});

// Role guard: authorize('admin', 'manager'). Use after protect.
const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user && req.user.role)
    ? next()
    : next(new ApiError(403, 'You do not have permission to perform this action.'));

// No route matched
const notFound = (req, res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// Turns every error into a JSON response
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  switch (err.name) {
    case 'SequelizeUniqueConstraintError': // duplicate in a unique column
      status = 409;
      message = `Already exists: ${err.errors.map((e) => e.path).join(', ')}`;
      break;
    case 'SequelizeValidationError': // required / min / isEmail ...
      status = 400;
      message = err.errors.map((e) => e.message).join(', ');
      break;
    case 'SequelizeForeignKeyConstraintError': // bad reference, or row still in use
      status = 409;
      message = 'Blocked: referenced record does not exist, or this record is still used by other records';
      break;
    case 'SequelizeDatabaseError': // wrong data type etc.
      status = 400;
      message = 'Invalid data for the database';
      break;
    default:
      if (err.type === 'entity.parse.failed') {
        status = 400;
        message = 'Invalid JSON in request body';
      }
  }

  if (status >= 500 || err.name === 'SequelizeDatabaseError') console.error(err);
  res.status(status).json({
    success: false,
    message: status === 500 && nodeEnv === 'production' ? 'Internal server error' : message,
    ...(nodeEnv === 'development' && status === 500 ? { stack: err.stack } : {}),
  });
};

module.exports = { protect, optionalAuth, authorize, notFound, errorHandler };
