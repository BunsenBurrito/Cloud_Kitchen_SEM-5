// Admin shell: sidebar navigation, top bar with sign out, and the page content.
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Button, Divider, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GrainIcon from '@mui/icons-material/Grain';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import GroupsIcon from '@mui/icons-material/Groups';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleIcon from '@mui/icons-material/People';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { useAuth } from '../../context/AuthContext';

const width = 232;
const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/orders', label: 'Orders', icon: <ReceiptLongIcon /> },
  { to: '/billing', label: 'Billing', icon: <PaymentsIcon /> },
  { to: '/customers', label: 'Customers', icon: <PeopleIcon /> },
  { to: '/menu', label: 'Menu', icon: <MenuBookIcon /> },
  { to: '/ingredients', label: 'Ingredients', icon: <GrainIcon /> },
  { to: '/inventory', label: 'Inventory', icon: <Inventory2Icon /> },
  { to: '/suppliers', label: 'Suppliers', icon: <LocalShippingIcon /> },
  { to: '/purchases', label: 'Purchases', icon: <ShoppingBasketIcon /> },
  { to: '/staff', label: 'Staff', icon: <GroupsIcon /> },
  { to: '/salaries', label: 'Salaries', icon: <RequestQuoteIcon /> },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wide = useMediaQuery(useTheme().breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box>
      <Toolbar sx={{ gap: 1 }}>
        <RestaurantIcon color="primary" />
        <Typography variant="h3">CloudKitchen</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1.5 }}>
        {nav.map((n) => (
          <ListItemButton key={n.to} component={NavLink} to={n.to} onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 2, mb: 0.5, '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'inherit' } } }}>
            <ListItemIcon sx={{ minWidth: 38 }}>{n.icon}</ListItemIcon>
            <ListItemText primary={n.label} slotProps={{ primary: { fontWeight: 600, fontSize: '0.875rem' } }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer variant={wide ? 'permanent' : 'temporary'} open={wide || mobileOpen} onClose={() => setMobileOpen(false)}
        sx={{ width: wide ? width : 0, '& .MuiDrawer-paper': { width, boxSizing: 'border-box' } }}>
        {drawer}
      </Drawer>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
          <Toolbar>
            {!wide && <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>}
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" sx={{ mr: 2 }}>{user.name}</Typography>
            <Button variant="outlined" size="small" onClick={() => { logout(); navigate('/signin'); }}>Sign out</Button>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
