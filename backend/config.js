require('dotenv').config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
}

// Only the admin signs in; customers are stored as records (role "customer") so orders and bills can point to them.
const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  db: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'cloud_kitchen',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    sqliteFile: process.env.DB_SQLITE_FILE || './cloud_kitchen.sqlite',
    ssl: process.env.DB_SSL === 'true',   // cloud MySQL (e.g. Aiven) requires SSL
    sslCa: process.env.DB_SSL_CA || '',   // optional path to the provider's CA certificate
  },
  ROLES,
};
