# CloudKitchen Frontend

React + Material UI frontend for the Cloud Kitchen Management System.
Current status: **landing page only** (public page before sign in).

## Prerequisites
- Node.js 18 or newer (check with `node -v`)
- npm (comes with Node)

## Run the project
```bash
cd cloud-kitchen-frontend   # 1. go into the project folder
npm install                 # 2. install dependencies
npm run dev                 # 3. start the dev server
```
Open http://localhost:3000 in your browser.

Other commands:
- `npm run build`   production build in `dist/`
- `npm run preview` serve the production build locally

## Project structure
```
cloud-kitchen-frontend/
├── index.html                  # HTML shell, loads Google Fonts
├── vite.config.js              # Vite + React config, dev port 3000
├── package.json
└── src/
    ├── main.jsx                # Entry: ThemeProvider + Router
    ├── App.jsx                 # Root component
    ├── routes/AppRoutes.jsx    # All routes in one place
    ├── theme/theme.js          # Tomato palette + Inter (edit here)
    ├── pages/
    │   ├── Landing/LandingPage.jsx   # Public landing page
    │   └── Auth/SignInPage.jsx       # Placeholder, built next
    ├── components/
    │   ├── landing/            # Navbar, Hero, Features, HowItWorks, Footer
    │   └── common/             # Shared reusable components (empty for now)
    ├── services/               # API calls (empty for now)
    ├── hooks/                  # Custom hooks (empty for now)
    ├── context/                # Context providers, e.g. auth (empty for now)
    ├── utils/                  # Helpers (empty for now)
    └── assets/                 # Images, logos
```

## Changing the color palette
Edit the `palette` object at the top of `src/theme/theme.js`. Components only use
theme tokens (`primary.main`, `background.default`...), so nothing else needs changing.
Palette: Tomato (#E94F37) plus status colors (success, warning, danger). Font: Inter.

## Next steps
1. Status chips for order, payment and stock status
2. Sign-in / sign-up pages
3. Pages for the ER entities: Orders, Items, Ingredients, Inventory, Supplier, Purchase, Staff, Salary, Billing
