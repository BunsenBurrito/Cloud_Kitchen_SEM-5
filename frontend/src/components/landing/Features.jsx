// Features: one card per area of the ER diagram. Edit the `features` array to change cards.
import { Box, Container, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2'; // MUI v6 grid that supports the `size` prop
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GroupsIcon from '@mui/icons-material/Groups';
import PaymentsIcon from '@mui/icons-material/Payments';

const features = [
  { icon: <ReceiptLongIcon />, title: 'Orders', text: 'Track every order from placed to delivered.' },          // USER, ORDERS, COOKS, DELIVERS
  { icon: <MenuBookIcon />, title: 'Menu and recipes', text: 'Manage dishes, prices and their ingredients.' },   // ITEMS, HAS_RECIPE
  { icon: <Inventory2Icon />, title: 'Stock', text: 'See what is available and what is running low.' },         // INGREDIENTS, INVENTORY
  { icon: <LocalShippingIcon />, title: 'Suppliers', text: 'Record purchases and payment status.' },            // SUPPLIER, PURCHASE
  { icon: <GroupsIcon />, title: 'Staff', text: 'Keep roles and monthly salaries in one place.' },             // STAFF, SALARY
  { icon: <PaymentsIcon />, title: 'Billing', text: 'A bill for every order, with payment details.' },          // BILLING
];

export default function Features() {
  return (
    <Box id="features" sx={{ py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ mb: 5 }}>Features</Typography>
        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>{f.icon}</Box>
                <Typography variant="h3" sx={{ mb: 1 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.text}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
