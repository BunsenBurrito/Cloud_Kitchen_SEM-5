# CloudKitchen Frontend

React + Material UI admin app for the Cloud Kitchen Management System. A public landing page, one **admin sign-in**,
and the admin screens for orders, billing, customers, menu and recipes, stock, suppliers, purchases, staff and salaries.

## Run
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000  (start the backend first, see ../README.md)
```
Sign in with the admin account created by `npm run seed` in the backend (default `admin@cloudkitchen.com` / `Admin@12345`).

## Structure
```
src/
├── main.jsx                    ThemeProvider + Router + Toast/Auth providers
├── routes/AppRoutes.jsx        all routes; everything except / and /signin needs the admin signed in
├── theme/theme.js              colour palette + Inter (edit here, components only use theme tokens)
├── services/api.js             fetch wrapper (adds the admin token)
├── context/                    AuthContext (admin session), ToastContext (notify messages)
├── hooks/                      useList (paginated list + search), useOptions (dropdown data)
├── utils/format.js             money, date helpers
├── components/
│   ├── landing/                Navbar, Hero, Features, HowItWorks, Footer
│   └── common/                 AppLayout (sidebar), CrudPage, DataTable, FormDialog, ConfirmDialog, PageHeader, StatusChip
└── pages/
    ├── Landing/ Auth/SignInPage.jsx
    ├── Dashboard/              totals, recent orders, low stock
    ├── Orders/                 new order (existing or walk-in customer), status workflow, dispatch, cancel, details
    ├── Billing/                bills, record payment, confirm / fail / refund payments
    ├── Menu/                   dishes + recipe editor
    ├── Purchases/              create purchase, receive (adds stock), cancel, mark paid
    └── Manage/                 Ingredients, Inventory, Suppliers, Customers, Staff, Salaries (all built on CrudPage)
```

## Notes
- Only the admin can sign in. Customers are records the admin creates (they have no login).
- To add another table page, copy one of the pages in `pages/Manage/` and change the `columns` and `fields`.
