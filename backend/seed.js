// Run with: npm run seed
// Creates the admin account if it doesn't already exist.

const { connectDB, sequelize, User } = require('./models');
const { ROLES } = require('./config');

(async () => {
  try {
    await connectDB();

    const email = (
      process.env.SEED_ADMIN_EMAIL || 'admin@cloudkitchen.com'
    ).trim().toLowerCase();

    const [, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name: process.env.SEED_ADMIN_NAME || 'Admin',
        password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
        role: ROLES.ADMIN,
      },
    });

    console.log(
      created
        ? `Admin created: ${email}`
        : `Admin already exists: ${email}`
    );

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);

    try {
      await sequelize.close();
    } catch (_) {}

    process.exit(1);
  }
})();
