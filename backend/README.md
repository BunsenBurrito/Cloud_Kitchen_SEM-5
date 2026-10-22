# Backend — Cloud Kitchen API

Node.js + Express + SQL (Sequelize). Default database **MySQL**; PostgreSQL and SQLite also work via `DB_DIALECT` in `.env`.
Deliberately simple: **no controllers** — the logic lives directly inside each file in `routes/`.

## Setup
```bash
npm install
cp .env.example .env      # set DB_USER, DB_PASSWORD, JWT_SECRET
npm run seed              # creates DB + tables, admin user, sample menu
npm run dev               # http://localhost:5000
```
- No MySQL? `npm i sqlite3` and set `DB_DIALECT=sqlite`. PostgreSQL: `npm i pg pg-hstore`, `DB_DIALECT=postgres`, `DB_PORT=5432`.
- `CLIENT_URL` (CORS) must match the frontend address — default `http://localhost:3000`.
- Default admin: `admin@cloudkitchen.com` / `Admin@12345` (from `.env`).

## Files
| File | Purpose |
|---|---|
| `server.js` | Starts Express, mounts `/api`, connects to the database |
| `config.js` | `.env` settings and user roles |
| `models.js` | **All tables**, relationships (foreign keys) and the DB connection |
| `middleware.js` | `protect` (logged in?), `authorize(...roles)`, 404 and error handler |
| `utils.js` | Helpers: `ApiError`, `asyncHandler`, `parseId`, `pick`, `filters`, `paginate`… |
| `seed.js` | Creates the first admin and the sample menu |
| `routes/*.js` | One file per component: `auth users menu orders staff salaries ingredients inventory suppliers purchases billing payments dashboard` |

## Quick checks
```bash
curl localhost:5000/api/health
curl localhost:5000/api/menu/test          # "Menu routes are working ✅" (every component has /test)
curl -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
     -d '{"email":"admin@cloudkitchen.com","password":"Admin@12345"}'
```

## More
- All endpoints, roles and examples: [`../docs/api-reference.md`](../docs/api-reference.md)
- Tables and relationships: [`../docs/database-schema.md`](../docs/database-schema.md)
