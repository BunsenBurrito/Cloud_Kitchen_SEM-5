// Run with: npm run seed
// Creates the first admin account (public sign-up only makes customers)
// and the sample menu that the frontend MenuPage currently hard-codes.
const { connectDB, sequelize, User, MenuItem } = require('./models');
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

(async () => {
  try {
    await connectDB(); // also creates the tables

    const email = (process.env.SEED_ADMIN_EMAIL || 'admin@cloudkitchen.com').toLowerCase();
    const [, created] = await User.findOrCreate({
      where: { email },
      defaults: { name: process.env.SEED_ADMIN_NAME || 'Admin', password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', role: ROLES.ADMIN },
    });
    console.log(created ? `Admin created: ${email}` : `Admin already exists: ${email}`);

    for (const item of menu) await MenuItem.findOrCreate({ where: { name: item.name }, defaults: item });
    console.log(`Menu seeded (${menu.length} items)`);

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
