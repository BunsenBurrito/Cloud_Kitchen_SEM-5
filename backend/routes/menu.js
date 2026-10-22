// /api/menu — anyone can read; admin/manager can create/update/delete.
// A dish can have a recipe: "recipe": [{ "ingredientId": 1, "quantityRequired": 0.25 }]  (per 1 serving)
// Staff see the recipe when reading; the public does not.
const router = require('express').Router();
const { MenuItem, MenuIngredient, Ingredient, sequelize } = require('../models');
const { STAFF_ROLES } = require('../config');
const { protect, optionalAuth, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, filters, paginate, sendList, searchWhere } = require('../utils');

const FIELDS = ['name', 'category', 'foodType', 'price', 'description', 'imageUrl', 'isAvailable'];
const writers = [protect, authorize('admin', 'manager')];

const includeFor = (req) =>
  req.user && STAFF_ROLES.includes(req.user.role)
    ? [{ model: MenuIngredient, as: 'recipe', include: [{ model: Ingredient, as: 'ingredient', attributes: ['id', 'name', 'unit'] }] }]
    : [];

// Replaces a dish's recipe rows with the ones sent in the request (runs inside a transaction)
const saveRecipe = async (menuItemId, recipe, t) => {
  if (!Array.isArray(recipe)) throw new ApiError(400, 'recipe must be an array');
  const rows = recipe.map((r) => ({ menuItemId, ingredientId: parseId(r.ingredientId, 'ingredientId'), quantityRequired: Number(r.quantityRequired) }));
  if (new Set(rows.map((r) => r.ingredientId)).size !== rows.length) throw new ApiError(400, 'Duplicate ingredient in recipe');
  if (rows.some((r) => !(r.quantityRequired > 0))) throw new ApiError(400, 'quantityRequired must be > 0');
  await MenuIngredient.destroy({ where: { menuItemId }, transaction: t });
  await MenuIngredient.bulkCreate(rows, { transaction: t });
};

router.get('/test', (req, res) => res.json({ success: true, message: 'Menu routes are working ✅' }));

// GET /api/menu?category=Starter&foodType=Veg&isAvailable=true&q=paneer
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = { ...filters(req.query, ['category', 'foodType', 'isAvailable']), ...searchWhere(req.query.q, ['name', 'category']) };
  sendList(res, await MenuItem.findAndCountAll({ where, include: includeFor(req), order: [['name', 'ASC']], limit: p.limit, offset: p.offset, distinct: true }), p);
}));

router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const item = await MenuItem.findByPk(parseId(req.params.id), { include: includeFor(req) });
  if (!item) throw new ApiError(404, 'Menu item not found');
  res.json({ success: true, data: item });
}));

router.post('/', ...writers, asyncHandler(async (req, res) => {
  const item = await sequelize.transaction(async (t) => {
    const created = await MenuItem.create(pick(req.body, FIELDS), { transaction: t });
    if (req.body.recipe !== undefined) await saveRecipe(created.id, req.body.recipe, t);
    return created;
  });
  res.status(201).json({ success: true, data: item });
}));

router.put('/:id', ...writers, asyncHandler(async (req, res) => {
  const item = await MenuItem.findByPk(parseId(req.params.id));
  if (!item) throw new ApiError(404, 'Menu item not found');
  await sequelize.transaction(async (t) => {
    await item.update(pick(req.body, FIELDS), { transaction: t });
    if (req.body.recipe !== undefined) await saveRecipe(item.id, req.body.recipe, t);
  });
  res.json({ success: true, data: item });
}));

router.delete('/:id', ...writers, asyncHandler(async (req, res) => {
  const item = await MenuItem.findByPk(parseId(req.params.id));
  if (!item) throw new ApiError(404, 'Menu item not found');
  await item.destroy(); // old orders keep their name/price snapshot
  res.json({ success: true, message: 'Menu item deleted' });
}));

module.exports = router;
