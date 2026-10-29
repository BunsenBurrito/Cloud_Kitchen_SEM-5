// Small helpers used by the route files.
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { jwtSecret, jwtExpiresIn } = require('./config');

// An Error with an HTTP status code (formatted by errorHandler in middleware.js).
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.statusCode = status;
  }
}

// Wraps an async route so errors go to the error handler (no try/catch needed in routes).
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Turns a value from the client into an integer id, or throws 400.
const parseId = (value, label = 'id') => {
  if ((typeof value !== 'string' && typeof value !== 'number') || !/^\d+$/.test(String(value))) {
    throw new ApiError(400, `${label} must be a valid numeric id`);
  }
  return parseInt(value, 10);
};

// Copies ONLY the listed keys from an object. Used on req.body so clients can't set fields we don't allow.
const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj && obj[k] !== undefined).map((k) => [k, obj[k]]));

// Builds a WHERE object from ?query=params. Only listed keys, only plain strings
// ("true"/"false" become booleans). Blocks things like ?status[$ne]=x.
const filters = (query, keys) => {
  const where = {};
  keys.forEach((k) => {
    const v = query[k];
    if (typeof v === 'string') where[k] = v === 'true' ? true : v === 'false' ? false : v;
  });
  return where;
};

// ?page=2&limit=20  ->  { page, limit, offset }
const paginate = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

// Sends a list response in a standard shape. `result` comes from Model.findAndCountAll().
const sendList = (res, result, { page, limit }) =>
  res.json({
    success: true,
    count: result.rows.length,
    total: result.count,
    page,
    pages: Math.ceil(result.count / limit) || 1,
    data: result.rows,
  });

// Escapes % and _ so a search text is treated literally inside SQL LIKE.
const likeEscape = (s) => s.replace(/[\\%_]/g, '\\$&');

// ?q=text  ->  WHERE (field1 LIKE %text% OR field2 LIKE %text% ...). Returns {} if no search text.
const searchWhere = (q, fields) =>
  typeof q === 'string' && q ? { [Op.or]: fields.map((f) => ({ [f]: { [Op.like]: `%${likeEscape(q)}%` } })) } : {};

const signToken = (userId) => jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });

module.exports = { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList, likeEscape, searchWhere, signToken };
