# Cloud Kitchen Management System (SEM-5)

A web app for the kitchen admin to run a cloud kitchen: take orders, manage the menu and recipes, stock, suppliers, purchases, staff, salaries, billing and payments. One admin account signs in. Customers are stored as records and not allowed to log in.

| Part | Tech |
|---|---|
| **Frontend** (`frontend/`) | React 18, Vite, Material UI, React Router |
| **Backend** (`backend/`) | Node.js, Express, Sequelize ORM, **MySQL** (PostgreSQL/SQLite supported), JWT auth |
| **Design** (`docs/`) | draw.io ER diagrams, schema + API documentation |

## Project structure
```
Cloud_Kitchen_SEM-5/
├── README.md                     
├── .gitignore
│
├── frontend/                     React + Vite app (http://localhost:3000)
│   └── src/                      main.jsx, routes/, pages/, components/, context/, hooks/, services/, theme/ (see frontend/README.md)
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
    ├── er-overview.drawio
    ├── er-part1-orders-billing-staff-menu.drawio
    └── er-part2-purchasing-inventory.drawio
```

## Getting started

**Prerequisites:** Node.js 18+, and a running **MySQL** server.

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env      # set DB_USER, DB_PASSWORD (MySQL login) and JWT_SECRET
npm run seed              # creates the database + tables, an admin user, and the sample menu
npm run dev               # API on http://localhost:5000
```

Default admin: `admin@cloudkitchen.com` / `Admin@12345`

**2. Frontend**
```bash
cd frontend
npm install
npm run dev               # app on http://localhost:3000
```

The backend only accepts browser requests from `CLIENT_URL` (default `http://localhost:3000`, set in `backend/.env`).

## Features (backend API)
- **Authentication** - JWT sign-in for the admin account only
- **Menu & recipes** - dishes with per-serving ingredient recipes
- **Orders** - pricing, automatic bill, status workflow, cancellation, delivery partner assignment
- **Kitchen stock** - ingredients and inventory, automatic ingredient deduction when cooking starts, low-stock count
- **Purchasing** - suppliers, purchase orders, "receive" to add stock
- **Staff & users** - staff, monthly salary records, customer records
- **Billings & payment** - bill for each order and payment status

Endpoints in [`docs/api-reference.md`](docs/api-reference.md).
