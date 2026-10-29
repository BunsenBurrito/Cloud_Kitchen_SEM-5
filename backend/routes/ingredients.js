// /api/ingredients — kitchen stock of raw materials (admin, manager, chef)
const router = require('express').Router();
const { Ingredient } = require('../models');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList, searchWhere } = require('../utils');

const FIELDS = ['name', 'category', 'isVeg', 'availableQuantity', 'unit', 'reorderLevel'];


router.use(protect, authorize('admin', 'manager', 'chef'));

router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = { ...filters(req.query, ['category', 'isVeg', 'unit']), ...searchWhere(req.query.q, ['name', 'category']) };
  sendList(res, await Ingredient.findAndCountAll({ where, order: [['name', 'ASC']], limit: p.limit, offset: p.offset }), p);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const item = await Ingredient.findByPk(parseId(req.params.id));
  if (!item) throw new ApiError(404, 'Ingredient not found');
  res.json({ success: true, data: item });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await Ingredient.create(pick(req.body, FIELDS)) });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const item = await Ingredient.findByPk(parseId(req.params.id));
  if (!item) throw new ApiError(404, 'Ingredient not found');
  await item.update(pick(req.body, FIELDS));
  res.json({ success: true, data: item });
}));

router.delete('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const item = await Ingredient.findByPk(parseId(req.params.id));
  if (!item) throw new ApiError(404, 'Ingredient not found');
  await item.destroy(); // blocked (409) if a recipe or purchase still uses it
  res.json({ success: true, message: 'Ingredient deleted' });
}));

module.exports = router;
