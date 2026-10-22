# Cloud Kitchen Management System (SEM-5)

A web app to run a cloud kitchen: customers browse the menu and order online; the kitchen team manages
orders, recipes, stock, suppliers, purchases, staff, salaries, billing and payments.

| Part | Tech |
|---|---|
| **Frontend** (`frontend/`) | React 18, Vite, Material UI, React Router |
| **Backend** (`backend/`) | Node.js, Express, Sequelize ORM, **MySQL** (PostgreSQL/SQLite supported), JWT auth, bcrypt |
| **Design** (`docs/`) | draw.io ER diagrams, schema + API documentation |

## Project structure
```
Cloud_Kitchen_SEM-5/
├── README.md                     ← you are here
├── .gitignore
│
├── frontend/                     React + Vite app (http://localhost:3000)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── routes/AppRoutes.jsx          all page routes
│       ├── pages/
│       │   ├── Landing/LandingPage.jsx
│       │   ├── Auth/SignInPage.jsx, SignUpPage.jsx
│       │   ├── Menu/MenuPage.jsx
│       │   └── Admin/AdminDashboard.jsx
│       ├── components/landing/           Navbar, Hero, Features, HowItWorks, Footer
│       ├── components/common/            (shared components — empty for now)
│       ├── services/                     (API calls go here — empty for now)
│       ├── context/, hooks/, utils/      (placeholders)
│       └── theme/theme.js
│
├── backend/                      Express + SQL REST API (http://localhost:5000)
│   ├── server.js                 starts Express, mounts routes, connects to the DB
│   ├── config.js                 .env settings + user roles
│   ├── models.js                 ALL tables, relationships and the DB connection
│   ├── middleware.js             login check, role check, 404 + error handler
│   ├── utils.js                  small helpers
│   ├── seed.js                   creates the admin user + sample menu
│   ├── package.json
│   ├── .env.example              copy to .env
│   └── routes/                   one file per component (logic lives here)
│       ├── index.js              mounts everything under /api
│       ├── auth.js  users.js  menu.js  orders.js
│       ├── staff.js  salaries.js
│       ├── ingredients.js  inventory.js  suppliers.js  purchases.js
│       └── billing.js  payments.js  dashboard.js
│
└── docs/
    ├── README.md                 documentation index
    ├── database-schema.md        relationship diagram + ER → model mapping
    ├── api-reference.md          all endpoints + examples
    ├── er-diagrams/              open with diagrams.net
    │   ├── er-overview.drawio
    │   ├── er-part1-orders-billing-staff-menu.drawio
    │   └── er-part2-purchasing-inventory.drawio
    └── archive/structure-old.txt
```

## Getting started

**Prerequisites:** Node.js 18+, and a running **MySQL** server (XAMPP, MySQL Workbench or Docker).
No MySQL? Use SQLite instead: `npm i sqlite3` in `backend/` and set `DB_DIALECT=sqlite` in `.env`.

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env      # set DB_USER, DB_PASSWORD (MySQL login) and JWT_SECRET
npm run seed              # creates the database + tables, an admin user, and the sample menu
npm run dev               # API on http://localhost:5000
```
Check it works: open <http://localhost:5000/api/health> or `http://localhost:5000/api/menu/test`.
Default admin: `admin@cloudkitchen.com` / `Admin@12345` (change it in `.env` before seeding).

**2. Frontend** (second terminal)
```bash
cd frontend
npm install
npm run dev               # app on http://localhost:3000
```

The backend only accepts browser requests from `CLIENT_URL` (default `http://localhost:3000`, set in `backend/.env`).

## Features (backend API)
- **Auth & roles** — JWT sign-up/sign-in; roles: admin, manager, chef, delivery, customer
- **Menu & recipes** — dishes (Veg / Non-Veg, category, price) with per-serving ingredient recipes
- **Orders** — server-side pricing, automatic bill, status workflow, cancellation, delivery partner assignment
- **Kitchen stock** — ingredients and inventory, automatic ingredient deduction when cooking starts, low-stock count
- **Purchasing** — suppliers, purchase orders, "receive" to add stock
- **People & money** — staff, monthly salary records, bills, payments, dashboard summary

See [`docs/api-reference.md`](docs/api-reference.md) for every endpoint.

## Project status
| Area | Status |
|---|---|
| Database design (ER diagrams) | ✅ done — `docs/er-diagrams/` |
| Backend API | ✅ written (all components) — **not yet tested against a live database**, run the steps above and report any issue |
| Frontend pages | ✅ UI only: landing, sign in, sign up, menu, admin dashboard |
| Frontend ↔ backend connection | ⏳ not done — add API calls in `frontend/src/services/` |
| Real payment gateway | ⏳ not done — payments are simulated (hook point marked in `backend/routes/payments.js`) |

## Documentation
- [Database schema](docs/database-schema.md) · [API reference](docs/api-reference.md) · [ER diagrams](docs/er-diagrams/)
- [Backend README](backend/README.md) · [Frontend README](frontend/README.md)
