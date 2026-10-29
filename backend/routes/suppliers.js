// /api/suppliers — admin/manager only.
// Link what a supplier provides with  "ingredientIds": [1,2]  and/or  "inventoryItemIds": [3]
const router = require('express').Router();
const { Supplier, Ingredient, InventoryItem, sequelize } = require('../models');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, paginate, sendList, searchWhere } = require('../utils');

const FIELDS = ['name', 'contactNumber', 'email', 'address'];
const withLinks = [
  { model: Ingredient, as: 'ingredients', attributes: ['id', 'name', 'unit'], through: { attributes: [] } },
  { model: InventoryItem, as: 'inventoryItems', attributes: ['id', 'name', 'unit'], through: { attributes: [] } },
];

const toIds = (arr, label) => {
  if (!Array.isArray(arr)) throw new ApiError(400, `${label} must be an array`);
  return arr.map((v) => parseId(v, label));
};

// Saves the many-to-many links, if they were sent
const saveLinks = async (supplier, body, t) => {
  if (body.ingredientIds !== undefined) await supplier.setIngredients(toIds(body.ingredientIds, 'ingredientIds'), { transaction: t });
  if (body.inventoryItemIds !== undefined) await supplier.setInventoryItems(toIds(body.inventoryItemIds, 'inventoryItemIds'), { transaction: t });
};

router.get('/test', (req, res) => res.json({ success: true, message: 'Suppliers routes are working ✅' }));

router.use(protect, authorize('admin', 'manager'));

router.get('/', asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = searchWhere(req.query.q, ['name', 'email', 'contactNumber']);
  sendList(res, await Supplier.findAndCountAll({ where, include: withLinks, order: [['name', 'ASC']], limit: p.limit, offset: p.offset, distinct: true }), p);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByPk(parseId(req.params.id), { include: withLinks });
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  res.json({ success: true, data: supplier });
}));

router.post('/', asyncHandler(async (req, res) => {
  const supplier = await sequelize.transaction(async (t) => {
    const created = await Supplier.create(pick(req.body, FIELDS), { transaction: t });
    await saveLinks(created, req.body, t);
    return created;
  });
  res.status(201).json({ success: true, data: supplier });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByPk(parseId(req.params.id));
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  await sequelize.transaction(async (t) => {
    await supplier.update(pick(req.body, FIELDS), { transaction: t });
    await saveLinks(supplier, req.body, t);
  });
  res.json({ success: true, data: supplier });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByPk(parseId(req.params.id));
  if (!supplier) throw new ApiError(404, 'Supplier not found');
  await supplier.destroy(); // blocked (409) if purchases exist for this supplier
  res.json({ success: true, message: 'Supplier deleted' });
}));

module.exports = router;
