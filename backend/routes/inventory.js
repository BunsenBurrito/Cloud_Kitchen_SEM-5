// /api/inventory — non-food stock: packaging, utensils... (read: admin/manager/chef, write: admin/manager)
const router = require('express').Router();
const { InventoryItem } = require('../models');
const { protect, authorize } = require('../middleware');
const { ApiError, asyncHandler, parseId, pick, paginate, sendList, searchWhere } = require('../utils');

const FIELDS = ['name', 'availableQuantity', 'unit', 'reorderLevel'];

router.get('/test', (req, res) => res.json({ success: true, message: 'Inventory routes are working ✅' }));

router.use(protect);

router.get('/', authorize('admin', 'manager', 'chef'), asyncHandler(async (req, res) => {
  const p = paginate(req);
  const where = searchWhere(req.query.q, ['name']);
  sendList(res, await InventoryItem.findAndCountAll({ where, order: [['name', 'ASC']], limit: p.limit, offset: p.offset }), p);
}));

router.get('/:id', authorize('admin', 'manager', 'chef'), asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByPk(parseId(req.params.id));
  if (!item) throw new ApiError(404, 'Inventory item not found');
  res.json({ success: true, data: item });
}));

router.post('/', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await InventoryItem.create(pick(req.body, FIELDS)) });
}));

router.put('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByPk(parseId(req.params.id));
  if (!item) throw new ApiError(404, 'Inventory item not found');
  await item.update(pick(req.body, FIELDS));
  res.json({ success: true, data: item });
}));

router.delete('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const item = await InventoryItem.findByPk(parseId(req.params.id));
  if (!item) throw new ApiError(404, 'Inventory item not found');
  await item.destroy();
  res.json({ success: true, message: 'Inventory item deleted' });
}));

module.exports = router;
