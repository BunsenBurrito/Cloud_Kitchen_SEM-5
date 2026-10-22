// ALL database tables (schemas), their relationships, and the DB connection — in one file.
// Import what you need:  const { User, Order } = require('./models');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { db, ROLES } = require('./config');

// ============================================================ connection
const common = { dialect: db.dialect, logging: false, define: { timestamps: true } }; // logging: console.log shows SQL
const sequelize =
  db.dialect === 'sqlite'
    ? new Sequelize({ ...common, storage: db.sqliteFile })
    : new Sequelize(db.name, db.user, db.password, { ...common, host: db.host, port: db.port });

// Connects, creates the MySQL database if missing, and creates any missing tables.
async function connectDB() {
  if (db.dialect === 'mysql') {
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({ host: db.host, port: db.port, user: db.user, password: db.password });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.end();
  }
  await sequelize.authenticate();
  await sequelize.sync(); // creates tables that don't exist yet
  console.log(`SQL database connected (${db.dialect})`);
}

// ============================================================ helpers
// MySQL returns DECIMAL as a string ("220.00"). This makes the API return a number (220).
const decimal = (field, { precision = 10, scale = 2, label } = {}) => ({
  type: DataTypes.DECIMAL(precision, scale),
  allowNull: false,
  defaultValue: 0,
  validate: { min: { args: [0], msg: `${label || field} cannot be negative` } },
  get() {
    const v = this.getDataValue(field);
    return v === null || v === undefined ? v : parseFloat(v);
  },
});
const required = (label) => ({ notEmpty: { msg: `${label} is required` } });

// Address columns reused by User and Order (flat/house_no, street/area, society, city, state, geo coordinates)
const addressColumns = {
  flatNo: DataTypes.STRING(50),
  street: DataTypes.STRING(150),
  societyName: DataTypes.STRING(150),
  city: DataTypes.STRING(80),
  state: DataTypes.STRING(80),
  latitude: DataTypes.DOUBLE,
  longitude: DataTypes.DOUBLE,
};

// ============================================================ TABLES

// USER — customers AND login accounts for staff/admin
const User = sequelize.define(
  'User',
  {
    name: { type: DataTypes.STRING(100), allowNull: false, validate: required('Name') },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      set(v) { this.setDataValue('email', typeof v === 'string' ? v.trim().toLowerCase() : v); },
      validate: { isEmail: { msg: 'Please provide a valid email' } },
    },
    password: { type: DataTypes.STRING(100), allowNull: false, validate: { len: { args: [6, 72], msg: 'Password must be 6–72 characters' } } },
    role: { type: DataTypes.ENUM(...Object.values(ROLES)), allowNull: false, defaultValue: ROLES.CUSTOMER },
    phone: DataTypes.STRING(20),
    dateOfBirth: DataTypes.DATEONLY,
    ...addressColumns,
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    defaultScope: { attributes: { exclude: ['password'] } }, // hash never returned; use User.unscoped() at login
    hooks: {
      beforeSave: async (user) => { // hash the password whenever it is new/changed
        if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
      },
    },
  }
);
User.prototype.comparePassword = function (plain) { return bcrypt.compare(plain, this.password); };

// STAFF — chefs, delivery partners, managers...
const Staff = sequelize.define('Staff', {
  firstName: { type: DataTypes.STRING(80), allowNull: false, validate: required('First name') },
  lastName: DataTypes.STRING(80),
  email: { type: DataTypes.STRING(150), unique: true, validate: { isEmail: { msg: 'Invalid staff email' } } },
  contactNumber: { type: DataTypes.STRING(20), allowNull: false, validate: required('Contact number') },
  role: { type: DataTypes.ENUM('manager', 'chef', 'delivery', 'helper', 'cashier'), allowNull: false },
  salary: decimal('salary', { label: 'Salary' }),
  hiringDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

// INGREDIENTS — raw materials in stock
const Ingredient = sequelize.define('Ingredient', {
  name: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: required('Ingredient name') },
  category: DataTypes.STRING(80),
  isVeg: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  availableQuantity: decimal('availableQuantity', { precision: 12, scale: 3, label: 'Stock' }),
  unit: { type: DataTypes.ENUM('kg', 'g', 'l', 'ml', 'pcs'), allowNull: false, defaultValue: 'kg' },
  reorderLevel: decimal('reorderLevel', { precision: 12, scale: 3, label: 'Reorder level' }), // at/below => low stock
});

// INVENTORY — non-food stock (packaging, utensils...)
const InventoryItem = sequelize.define('InventoryItem', {
  name: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: required('Item name') },
  availableQuantity: decimal('availableQuantity', { precision: 12, scale: 3, label: 'Stock' }),
  unit: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pcs' },
  reorderLevel: decimal('reorderLevel', { precision: 12, scale: 3, label: 'Reorder level' }),
});

// SUPPLIER
const Supplier = sequelize.define('Supplier', {
  name: { type: DataTypes.STRING(150), allowNull: false, validate: required('Supplier name') },
  contactNumber: { type: DataTypes.STRING(20), allowNull: false, validate: required('Contact number') },
  email: { type: DataTypes.STRING(150), validate: { isEmail: { msg: 'Invalid supplier email' } } },
  address: DataTypes.TEXT,
});

// MENU — field names match the frontend MenuPage (name, category, foodType, price)
const MenuItem = sequelize.define('MenuItem', {
  name: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: required('Dish name') },
  category: { type: DataTypes.STRING(80), allowNull: false, validate: required('Category') },
  foodType: { type: DataTypes.ENUM('Veg', 'Non-Veg'), allowNull: false, validate: { isIn: { args: [['Veg', 'Non-Veg']], msg: 'foodType must be Veg or Non-Veg' } } },
  price: decimal('price', { label: 'Price' }),
  description: DataTypes.TEXT,
  imageUrl: DataTypes.STRING(500),
  isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

// MENU_INGREDIENTS (recipe) — how much of an ingredient ONE serving of a dish needs
const MenuIngredient = sequelize.define(
  'MenuIngredient',
  {
    menuItemId: { type: DataTypes.INTEGER, primaryKey: true },
    ingredientId: { type: DataTypes.INTEGER, primaryKey: true },
    quantityRequired: decimal('quantityRequired', { precision: 12, scale: 3, label: 'Quantity' }),
  },
  { timestamps: false }
);

// ORDERS
const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const Order = sequelize.define('Order', {
  totalCost: decimal('totalCost', { label: 'Total' }),
  status: { type: DataTypes.ENUM(...ORDER_STATUSES), allowNull: false, defaultValue: 'placed' },
  ...addressColumns, // delivery address copied at order time
  notes: DataTypes.TEXT,
  inventoryDeducted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // ingredients used once cooking starts
  orderTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// ORDER_ITEMS — name/price are copied at order time so later menu price changes don't alter old orders
const OrderItem = sequelize.define(
  'OrderItem',
  {
    name: { type: DataTypes.STRING(150), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: { args: [1], msg: 'Quantity must be at least 1' } } },
    price: decimal('price', { label: 'Price' }),
    subtotal: decimal('subtotal', { label: 'Subtotal' }),
  },
  { timestamps: false }
);

// Order status log (who changed what, when)
const OrderStatusHistory = sequelize.define(
  'OrderStatusHistory',
  { status: { type: DataTypes.STRING(30), allowNull: false } },
  { updatedAt: false }
);

// BILLING — one bill per order, created automatically when an order is placed
const Billing = sequelize.define('Billing', {
  totalAmount: decimal('totalAmount', { label: 'Total' }),
  address: DataTypes.TEXT,
  paymentStatus: { type: DataTypes.ENUM('unpaid', 'paid', 'refunded'), allowNull: false, defaultValue: 'unpaid' },
});

// PAYMENTS — a payment attempt against a bill
const Payment = sequelize.define('Payment', {
  amount: decimal('amount', { label: 'Amount' }),
  method: { type: DataTypes.ENUM('cash', 'card', 'upi', 'wallet'), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
  transactionId: DataTypes.STRING(100),
  paidAt: DataTypes.DATE,
});

// SALARY — one record per staff member per month
const Salary = sequelize.define(
  'Salary',
  {
    month: { type: DataTypes.STRING(7), allowNull: false, validate: { is: { args: [/^\d{4}-(0[1-9]|1[0-2])$/], msg: 'Month must be in YYYY-MM format' } } },
    amount: decimal('amount', { label: 'Amount' }),
    paymentStatus: { type: DataTypes.ENUM('pending', 'paid'), allowNull: false, defaultValue: 'pending' },
    paymentDate: DataTypes.DATEONLY,
  },
  { indexes: [{ unique: true, fields: ['staffId', 'month'] }] }
);

// PURCHASE — stock bought from a supplier (stock increases only when "received")
const Purchase = sequelize.define('Purchase', {
  purchaseDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  totalAmount: decimal('totalAmount', { label: 'Total' }),
  paymentStatus: { type: DataTypes.ENUM('pending', 'partial', 'paid'), allowNull: false, defaultValue: 'pending' },
  status: { type: DataTypes.ENUM('ordered', 'received', 'cancelled'), allowNull: false, defaultValue: 'ordered' },
  receivedAt: DataTypes.DATE,
});

// PURCHASE_ITEMS — each line is EITHER an ingredient OR an inventory item
const PurchaseItem = sequelize.define(
  'PurchaseItem',
  {
    quantity: decimal('quantity', { precision: 12, scale: 3, label: 'Quantity' }),
    unitPrice: decimal('unitPrice', { label: 'Unit price' }),
  },
  {
    timestamps: false,
    validate: {
      oneTarget() {
        if (!this.ingredientId === !this.inventoryItemId) {
          throw new Error('Each purchase item needs either an ingredient or an inventoryItem (not both)');
        }
      },
    },
  }
);

// ============================================================ RELATIONSHIPS (foreign keys)
const fk = (name, nullable = false) => ({ name, allowNull: nullable });

Staff.belongsTo(User, { as: 'account', foreignKey: fk('userId', true), onDelete: 'SET NULL' }); // optional login for staff

MenuItem.hasMany(MenuIngredient, { as: 'recipe', foreignKey: fk('menuItemId'), onDelete: 'CASCADE' });
MenuIngredient.belongsTo(MenuItem, { as: 'menuItem', foreignKey: fk('menuItemId'), onDelete: 'CASCADE' });
MenuIngredient.belongsTo(Ingredient, { as: 'ingredient', foreignKey: fk('ingredientId'), onDelete: 'RESTRICT' });

// Supplier <-> Ingredient / InventoryItem (many-to-many join tables)
Supplier.belongsToMany(Ingredient, { as: 'ingredients', through: 'supplier_ingredients', foreignKey: 'supplierId', otherKey: 'ingredientId', timestamps: false });
Supplier.belongsToMany(InventoryItem, { as: 'inventoryItems', through: 'supplier_inventory', foreignKey: 'supplierId', otherKey: 'inventoryItemId', timestamps: false });

Purchase.belongsTo(Supplier, { as: 'supplier', foreignKey: fk('supplierId'), onDelete: 'RESTRICT' });
Purchase.hasMany(PurchaseItem, { as: 'items', foreignKey: fk('purchaseId'), onDelete: 'CASCADE' });
PurchaseItem.belongsTo(Purchase, { foreignKey: fk('purchaseId'), onDelete: 'CASCADE' });
PurchaseItem.belongsTo(Ingredient, { as: 'ingredient', foreignKey: fk('ingredientId', true), onDelete: 'RESTRICT' });
PurchaseItem.belongsTo(InventoryItem, { as: 'inventoryItem', foreignKey: fk('inventoryItemId', true), onDelete: 'RESTRICT' });

Order.belongsTo(User, { as: 'customer', foreignKey: fk('customerId'), onDelete: 'RESTRICT' });
Order.belongsTo(Staff, { as: 'deliveryPartner', foreignKey: fk('deliveryPartnerId', true), onDelete: 'SET NULL' });
Order.hasMany(OrderItem, { as: 'items', foreignKey: fk('orderId'), onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: fk('orderId'), onDelete: 'CASCADE' });
OrderItem.belongsTo(MenuItem, { as: 'menuItem', foreignKey: fk('menuItemId', true), onDelete: 'SET NULL' }); // old orders keep the name/price snapshot
Order.hasMany(OrderStatusHistory, { as: 'statusHistory', foreignKey: fk('orderId'), onDelete: 'CASCADE' });
OrderStatusHistory.belongsTo(Order, { foreignKey: fk('orderId'), onDelete: 'CASCADE' });
OrderStatusHistory.belongsTo(User, { as: 'changedBy', foreignKey: fk('changedById', true), onDelete: 'SET NULL' });

Order.hasOne(Billing, { as: 'bill', foreignKey: { name: 'orderId', allowNull: false, unique: true }, onDelete: 'CASCADE' });
Billing.belongsTo(Order, { as: 'order', foreignKey: { name: 'orderId', allowNull: false, unique: true }, onDelete: 'CASCADE' });
Billing.belongsTo(User, { as: 'customer', foreignKey: fk('customerId'), onDelete: 'RESTRICT' });

Payment.belongsTo(Billing, { as: 'bill', foreignKey: fk('billId'), onDelete: 'RESTRICT' });
Payment.belongsTo(Order, { as: 'order', foreignKey: fk('orderId'), onDelete: 'RESTRICT' });
Payment.belongsTo(User, { as: 'customer', foreignKey: fk('customerId'), onDelete: 'RESTRICT' });

Salary.belongsTo(Staff, { as: 'staff', foreignKey: fk('staffId'), onDelete: 'RESTRICT' });

module.exports = {
  sequelize, connectDB, ORDER_STATUSES,
  User, Staff, Ingredient, InventoryItem, Supplier,
  MenuItem, MenuIngredient,
  Order, OrderItem, OrderStatusHistory,
  Billing, Payment, Salary,
  Purchase, PurchaseItem,
};
