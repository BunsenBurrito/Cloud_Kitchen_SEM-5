// /api/dashboard — numbers for the Admin Dashboard cards (admin/manager)
const router = require('express').Router();
const { Op, where, col } = require('sequelize');
const { Order, MenuItem, Ingredient, Staff, Supplier, Payment } = require('../models');
const { protect, authorize } = require('../middleware');
const { asyncHandler } = require('../utils');

router.get('/test', (req, res) => res.json({ success: true, message: 'Dashboard routes are working ✅' }));

// GET /api/dashboard/summary
router.get('/summary', protect, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const [orders, activeOrders, menuItems, staff, suppliers, lowStock, revenue] = await Promise.all([
    Order.count(),
    Order.count({ where: { status: { [Op.in]: ['placed', 'confirmed', 'preparing', 'out_for_delivery'] } } }),
    MenuItem.count(),
    Staff.count({ where: { isActive: true } }),
    Supplier.count(),
    Ingredient.count({ where: where(col('availableQuantity'), Op.lte, col('reorderLevel')) }), // stock <= reorder level
    Payment.sum('amount', { where: { status: 'success' } }),
  ]);

  const lowStockItems = await Ingredient.findAll({ where: where(col('availableQuantity'), Op.lte, col('reorderLevel')), attributes: ['id', 'name', 'unit', 'availableQuantity', 'reorderLevel'], limit: 8 });
  res.json({
    success: true,
    data: { lowStockItems, orders, activeOrders, menuItems, staff, suppliers, lowStockIngredients: lowStock, revenue: Number(revenue) || 0 },
  });
}));

module.exports = router;
