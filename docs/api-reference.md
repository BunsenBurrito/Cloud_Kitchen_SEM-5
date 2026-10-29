# API reference

Base URL (local): `http://localhost:5000/api` · JSON in, JSON out · ids are integers.
Protected routes need the header `Authorization: Bearer <token>` (the token comes from `/auth/login`).

Every component also has an open `GET /api/<name>/test` route that returns `"<Name> routes are working ✅"`.
Responses look like `{ "success": true, "data": ... }`; errors like `{ "success": false, "message": "..." }`.
List endpoints return `{ count, total, page, pages, data }` and accept `?page=&limit=` (max 100) and, where noted, `?q=` (search) and filters.

## Roles
`admin` · `manager` · `chef` · `delivery` · `customer`.
There is no public sign-up. **Only `admin` accounts can sign in**, and every protected route needs an admin token.
`customer` records are created by the admin via `/users` (a random password is set; they cannot sign in).

## Endpoints

| Component (file) | Access | Endpoints |
|---|---|---|
| **Auth** `routes/auth.js` | public / logged in | `POST /auth/login` · `GET /auth/me` · `PATCH /auth/me` · `PATCH /auth/change-password` |
| **Users** `routes/users.js` | admin | `GET /users` (`role`, `isActive`, `q`) · `GET /users/:id` · `POST /users` · `PUT /users/:id` · `DELETE /users/:id` |
| **Menu** `routes/menu.js` | read: public · write: admin, manager | `GET /menu` (`category`, `foodType`, `isAvailable`, `q`) · `GET /menu/:id` · `POST /menu` · `PUT /menu/:id` · `DELETE /menu/:id` |
| **Orders** `routes/orders.js` | logged in (customers see only their own) | `GET /orders` (`status`, `customerId`, `deliveryPartnerId`) · `GET /orders/:id` · `POST /orders` · `PATCH /orders/:id/status` (admin, manager, chef, delivery) · `PATCH /orders/:id/cancel` · `PUT /orders/:id` (admin, manager) · `DELETE /orders/:id` (admin) |
| **Staff** `routes/staff.js` | read: admin, manager, chef, delivery · write: admin, manager · delete: admin | `GET /staff` (`role`, `isActive`, `q`) · `GET /staff/:id` · `POST /staff` · `PUT /staff/:id` · `DELETE /staff/:id` |
| **Ingredients** `routes/ingredients.js` | admin, manager, chef | `GET /ingredients` (`category`, `isVeg`, `unit`, `q`) · `GET /ingredients/:id` · `POST` · `PUT /:id` · `DELETE /:id` (admin, manager) |
| **Inventory** `routes/inventory.js` | read: admin, manager, chef · write: admin, manager | `GET /inventory` (`q`) · `GET /inventory/:id` · `POST` · `PUT /:id` · `DELETE /:id` |
| **Suppliers** `routes/suppliers.js` | admin, manager | `GET /suppliers` (`q`) · `GET /suppliers/:id` · `POST` · `PUT /:id` · `DELETE /:id` |
| **Purchases** `routes/purchases.js` | admin, manager | `GET /purchases` (`supplierId`, `status`, `paymentStatus`) · `GET /purchases/:id` · `POST` · `PUT /:id` · `PATCH /:id/receive` · `PATCH /:id/cancel` · `DELETE /:id` (admin) |
| **Salaries** `routes/salaries.js` | admin, manager | `GET /salaries` (`staffId`, `month`, `paymentStatus`) · `GET /salaries/:id` · `POST` · `PUT /:id` · `DELETE /:id` (admin) |
| **Billing** `routes/billing.js` | logged in (customers: own bills) | `GET /billing` (`orderId`, `customerId`, `paymentStatus`) · `GET /billing/:id` · `POST` / `PUT /:id` (admin, manager) · `DELETE /:id` (admin) |
| **Payments** `routes/payments.js` | logged in (customers: own payments) | `GET /payments` · `GET /payments/:id` · `POST /payments` · `PATCH /payments/:id/status` (admin, manager) · `PUT /:id` (admin, manager) · `DELETE /:id` (admin) |
| **Dashboard** `routes/dashboard.js` | admin, manager | `GET /dashboard/summary` (counts, revenue and `lowStockItems`) |

## Request examples

**Sign in (admin)**
```json
POST /api/auth/login      { "email": "admin@cloudkitchen.com", "password": "Admin@12345" }
→ { "success": true, "token": "<jwt>", "user": { ... } }
```

**Add a dish with a recipe** (admin / manager)
```json
POST /api/menu
{ "name": "Paneer Tikka", "category": "Starter", "foodType": "Veg", "price": 220,
  "recipe": [ { "ingredientId": 1, "quantityRequired": 0.25 } ] }
```

**Place an order** — `customerId` is required; the address defaults to the customer's saved one; prices always come from the database; a bill is created automatically
```json
POST /api/orders
{ "customerId": 2, "items": [ { "menuItemId": 1, "quantity": 2 } ],
  "deliveryAddress": { "flatNo": "B-12", "street": "MG Road", "city": "Ahilyanagar", "state": "Maharashtra" },
  "notes": "Less spicy" }
```

**Pay the bill** — amount is taken from the bill
```json
POST /api/payments   { "billId": 1, "method": "upi", "transactionId": "T123" }
```
Methods: `cash` (stays *pending* until staff confirm), `card` / `upi` / `wallet` (marked *success* immediately — demo only, no real gateway yet).

**Receive a purchase** (adds stock)
```json
POST /api/purchases   { "supplierId": 1, "items": [ { "ingredientId": 1, "quantity": 20, "unitPrice": 45 } ] }
PATCH /api/purchases/1/receive
```

## Order workflow
```
placed → confirmed → preparing → out_for_delivery → delivered
   └────────┴──→ cancelled        (customers can cancel only while "placed")
```
- Moving to **preparing** deducts the recipe ingredients from stock inside a database transaction.
  If any ingredient is short you get `409` and nothing changes.
- Moving to **out_for_delivery** can include `{ "deliveryPartnerId": <staff id> }` (must be a `delivery` staff member).

## Status codes
`200` ok · `201` created · `400` invalid input · `401` not signed in · `403` role not allowed ·
`404` not found · `409` duplicate / still in use / out of stock · `500` server error.
