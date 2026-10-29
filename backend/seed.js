// Run with: npm run seed
// Creates the admin account and sample data (menu, recipes, stock, staff, suppliers, customers, orders). Safe to run again.
const { connectDB, sequelize, User, MenuItem, MenuIngredient, Ingredient, InventoryItem, Staff, Supplier, Order, OrderItem, OrderStatusHistory, Billing, Payment } = require('./models');
const { ROLES } = require('./config');

const menu = [
  { name: 'Paneer Tikka', category: 'Starter', foodType: 'Veg', price: 220 },
  { name: 'Veg Biryani', category: 'Main Course', foodType: 'Veg', price: 250 },
  { name: 'Margherita Pizza', category: 'Main Course', foodType: 'Veg', price: 280 },
  { name: 'Masala Dosa', category: 'Breakfast', foodType: 'Veg', price: 150 },
  { name: 'Chicken Biryani', category: 'Main Course', foodType: 'Non-Veg', price: 320 },
  { name: 'Chicken Tikka', category: 'Starter', foodType: 'Non-Veg', price: 280 },
  { name: 'Butter Chicken', category: 'Main Course', foodType: 'Non-Veg', price: 350 },
  { name: 'Chicken Burger', category: 'Fast Food', foodType: 'Non-Veg', price: 240 },
];
const ingredients = [
  { name: 'Paneer', category: 'Dairy', availableQuantity: 12, unit: 'kg', reorderLevel: 4 },
  { name: 'Basmati Rice', category: 'Grains', availableQuantity: 40, unit: 'kg', reorderLevel: 10 },
  { name: 'Chicken', category: 'Meat', isVeg: false, availableQuantity: 3, unit: 'kg', reorderLevel: 5 },
  { name: 'Butter', category: 'Dairy', availableQuantity: 8, unit: 'kg', reorderLevel: 2 },
  { name: 'Mixed Vegetables', category: 'Produce', availableQuantity: 15, unit: 'kg', reorderLevel: 5 },
  { name: 'Pizza Dough', category: 'Bakery', availableQuantity: 60, unit: 'pcs', reorderLevel: 20 },
  { name: 'Burger Bun', category: 'Bakery', availableQuantity: 80, unit: 'pcs', reorderLevel: 30 },
];
const recipes = {
  'Paneer Tikka': { Paneer: 0.2 },
  'Veg Biryani': { 'Basmati Rice': 0.15, 'Mixed Vegetables': 0.1 },
  'Margherita Pizza': { 'Pizza Dough': 1, Paneer: 0.05 },
  'Chicken Biryani': { 'Basmati Rice': 0.15, Chicken: 0.2 },
  'Chicken Tikka': { Chicken: 0.25 },
  'Butter Chicken': { Chicken: 0.25, Butter: 0.03 },
  'Chicken Burger': { 'Burger Bun': 1, Chicken: 0.12 },
};
const inventory = [
  { name: 'Takeaway Container 500ml', availableQuantity: 450, unit: 'pcs', reorderLevel: 100 },
  { name: 'Paper Bags', availableQuantity: 90, unit: 'pcs', reorderLevel: 100 },
  { name: 'Cooking Gas Cylinder', availableQuantity: 3, unit: 'pcs', reorderLevel: 1 },
];
const staff = [
  { firstName: 'Ramesh', lastName: 'Pawar', email: 'ramesh@cloudkitchen.com', contactNumber: '9822000001', role: 'chef', salary: 35000 },
  { firstName: 'Suresh', lastName: 'Kulkarni', email: 'suresh@cloudkitchen.com', contactNumber: '9822000002', role: 'manager', salary: 40000 },
  { firstName: 'Vikram', lastName: 'Singh', email: 'vikram@cloudkitchen.com', contactNumber: '9822000003', role: 'delivery', salary: 18000 },
];
const suppliers = [
  { name: 'FreshDairy Co.', contactNumber: '9811100001', email: 'sales@freshdairy.example', address: 'Market Yard, Pune' },
  { name: 'Metro Grain Wholesalers', contactNumber: '9811100002', email: 'orders@metrograin.example', address: 'APMC, Pune' },
];
const customers = [
  { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9822012345', flatNo: '402', societyName: 'Greenwoods Society', street: 'Kothrud', city: 'Pune', state: 'Maharashtra' },
  { name: 'Priya Patel', email: 'priya@example.com', phone: '9822054321', flatNo: 'B-12', societyName: 'Marvel Annex', street: 'Viman Nagar', city: 'Pune', state: 'Maharashtra' },
];

const upsert = async (Model, rows) => {
  const out = {};
  for (const row of rows)
    out[row.name] = (await Model.findOrCreate({ where: { name: row.name }, defaults: row }))[0];
  return out;
};

(async () => {
  try {
    await connectDB(); // also creates the tables

    const email = (process.env.SEED_ADMIN_EMAIL || 'admin@cloudkitchen.com').toLowerCase();
    const [, created] = await User.findOrCreate({
      where: { email },
      defaults: { name: process.env.SEED_ADMIN_NAME || 'Admin', password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', role: ROLES.ADMIN },
    });
    console.log(created ? `Admin created: ${email}` : `Admin already exists: ${email}`);

    const dishes = await upsert(MenuItem, menu);
    const stock = await upsert(Ingredient, ingredients);
    await upsert(InventoryItem, inventory);
    await upsert(Supplier, suppliers);
    for (const s of staff)
      await Staff.findOrCreate({ where: { email: s.email }, defaults: s });
    for (const [dish, parts] of Object.entries(recipes))
      for (const [ing, quantityRequired] of Object.entries(parts))
        await MenuIngredient.findOrCreate({ where: { menuItemId: dishes[dish].id, ingredientId: stock[ing].id }, defaults: { quantityRequired } });
    const people = [];
    for (const c of customers)
      people.push((await User.findOrCreate({ where: { email: c.email }, defaults: { ...c, password: 'Customer@123', role: ROLES.CUSTOMER } }))[0]);

    if (await Order.count() === 0) {
      const sample = [
        { customer: people[0], status: 'placed', lines: [['Paneer Tikka', 2], ['Veg Biryani', 1]], paid: false },
        { customer: people[1], status: 'delivered', lines: [['Butter Chicken', 1], ['Chicken Biryani', 2]], paid: true },
      ];
      for (const o of sample) {
        const lines = o.lines.map(([name, quantity]) => ({ menuItemId: dishes[name].id, name, quantity, price: dishes[name].price, subtotal: dishes[name].price * quantity }));
        const totalCost = lines.reduce((sum, l) => sum + l.subtotal, 0);
        const c = o.customer;
        const order = await Order.create({ customerId: c.id, totalCost, status: o.status, flatNo: c.flatNo, societyName: c.societyName, street: c.street, city: c.city, state: c.state });
        await OrderItem.bulkCreate(lines.map((l) => ({ ...l, orderId: order.id })));
        for (const status of ['placed', ...(o.status === 'delivered' ? ['confirmed', 'preparing', 'out_for_delivery', 'delivered'] : [])])
          await OrderStatusHistory.create({ orderId: order.id, status });
        const bill = await Billing.create({ orderId: order.id, customerId: c.id, totalAmount: totalCost, address: [c.flatNo, c.societyName, c.street, c.city].join(', '), paymentStatus: o.paid ? 'paid' : 'unpaid' });
        if (o.paid)
          await Payment.create({ billId: bill.id, orderId: order.id, customerId: c.id, amount: totalCost, method: 'upi', status: 'success', transactionId: 'SEED-UPI-1', paidAt: new Date() });
      }
    }
    console.log('Sample data ready (menu, recipes, stock, staff, suppliers, customers, orders)');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
