// Single source of truth for colors and typography (Tomato palette + Inter).
// Components must use theme tokens (e.g. color="primary", bgcolor="background.paper")
// and never hard-code hex values, so changing this file restyles the whole app.
import { createTheme } from '@mui/material/styles';

const colors = {
  primary: '#E94F37',    // Tomato     - main actions
  secondary: '#F28C28',  // Orange     - secondary accents / "placed" status
  success: '#35A66F',    // Green      - delivered, paid, in stock
  warning: '#F6C453',    // Amber      - preparing, low stock, pending
  danger: '#D93636',     // Red        - cancelled, failed, out of stock
  text: '#252525',       // Charcoal
  background: '#F8F7F4', // Off-white  - page background
  card: '#FFFFFF',       // White      - cards
  border: '#E8E8E5',     // Light gray - borders and dividers
};

const theme = createTheme({
  palette: {
    primary: { main: colors.primary, contrastText: '#FFFFFF' },
    secondary: { main: colors.secondary, contrastText: '#FFFFFF' },
    success: { main: colors.success, contrastText: '#FFFFFF' },
    warning: { main: colors.warning, contrastText: colors.text }, // dark text: amber is light
    error: { main: colors.danger, contrastText: '#FFFFFF' },
    text: { primary: colors.text, secondary: '#6B6B66' },
    background: { default: colors.background, paper: colors.card },
    divider: colors.border,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },          // 32px
    h2: { fontSize: '1.5rem', fontWeight: 700 },        // 24px
    h3: { fontSize: '1.25rem', fontWeight: 600 },       // 20px
    body1: { fontSize: '1rem', fontWeight: 400 },       // 16px
    body2: { fontSize: '0.875rem', fontWeight: 400 },   // 14px
    caption: { fontSize: '0.75rem', fontWeight: 500 },  // 12px label
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
    // Prices: use sx={{ fontSize: '1.25rem', fontWeight: 700 }} or add a variant later
  },
  shape: { borderRadius: 8 },
  components: {
    // Flat, bordered cards instead of shadows to keep the UI minimal
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: `1px solid ${colors.border}` } } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default theme;
