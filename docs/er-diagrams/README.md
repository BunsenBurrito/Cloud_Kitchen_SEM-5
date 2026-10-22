# ER diagrams

Open the `.drawio` files with [diagrams.net](https://app.diagrams.net) (draw.io) — web, VS Code extension, or desktop app.

| File | What it shows |
|---|---|
| `er-overview.drawio` | First, high-level model: USER, STAFF, ORDERS, BILLING, PAYMENTS, SALARY and how they connect (places, generates, pays, delivers, is paid). |
| `er-part1-orders-billing-staff-menu.drawio` | Detailed ordering side: adds MENU, ORDER_ITEMS (contains) and MENU_INGREDIENTS (has recipe) to the overview. |
| `er-part2-purchasing-inventory.drawio` | Stock side: SUPPLIER, PURCHASE, INGREDIENTS, INVENTORY and the SUPPLIES_INGREDIENTS / SUPPLIES_INVENTORY links. |

Together, **part 1 + part 2** are the full database design. The backend implements them in
[`backend/models.js`](../../backend/models.js); see [`../database-schema.md`](../database-schema.md) for the table-by-table mapping.
