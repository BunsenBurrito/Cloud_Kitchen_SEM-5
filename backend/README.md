# Backend — Cloud Kitchen API

Node.js + Express + SQL (Sequelize). Default database **MySQL**; PostgreSQL and SQLite also work via `DB_DIALECT` in `.env`.

## Setup
```bash
npm install
cp .env.example .env      # set DB_USER, DB_PASSWORD, JWT_SECRET
npm run seed              # creates DB + tables, admin user, sample menu
npm run dev               # http://localhost:5000
```
- No MySQL? `npm i sqlite3` and set `DB_DIALECT=sqlite`. PostgreSQL: `npm i pg pg-hstore`, `DB_DIALECT=postgres`, `DB_PORT=5432`.
- `CLIENT_URL` (CORS) must match the frontend address — default `http://localhost:3000`.
- Only the admin account can sign in; there is no public sign-up. Default admin: `admin@cloudkitchen.com` / `Admin@12345` (from `.env`).

## Files
| File | Purpose |
|---|---|
| `server.js` | Starts Express, mounts `/api`, connects to the database |
| `config.js` | `.env` settings and user roles |
| `models.js` | **All tables**, relationships (foreign keys) and the DB connection |
| `middleware.js` | `protect` (logged in?), `authorize(...roles)`, 404 and error handler |
| `utils.js` | Helpers: `ApiError`, `asyncHandler`, `parseId`, `pick`, `filters`, `paginate`… |
| `seed.js` | Creates the first admin |
| `routes/*.js` | One file per component: `auth users menu orders staff salaries ingredients inventory suppliers purchases billing payments dashboard` |

## Quick checks
```bash
curl localhost:5000/api/health
curl -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
     -d '{"email":"admin@cloudkitchen.com","password":"Admin@12345"}'
```
