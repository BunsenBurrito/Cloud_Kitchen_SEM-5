import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import {
  ShoppingCart,
  RestaurantMenu,
  Inventory,
  People,
  LocalShipping,
  Receipt,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const dashboardItems = [
  {
    title: 'Orders',
    description: 'View and manage customer orders',
    icon: <ShoppingCart />,
  },
  {
    title: 'Menu',
    description: 'Manage dishes and menu items',
    icon: <RestaurantMenu />,
  },
  {
    title: 'Stock',
    description: 'Monitor inventory and ingredients',
    icon: <Inventory />,
  },
  {
    title: 'Staff',
    description: 'Manage kitchen and restaurant staff',
    icon: <People />,
  },
  {
    title: 'Suppliers',
    description: 'Manage suppliers and purchases',
    icon: <LocalShipping />,
  },
  {
    title: 'Billing',
    description: 'View payments and billing information',
    icon: <Receipt />,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/signin');
  };

  const handleManage = (title) => {
    if (title === 'Menu') {
      navigate('/menu');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h2">
                Admin Dashboard
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Manage your Cloud Kitchen
              </Typography>
            </Box>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Dashboard */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h3" sx={{ mb: 3 }}>
          Overview
        </Typography>

        <Grid container spacing={3}>
          {dashboardItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 2,
                  }}
                >
                  {item.icon}
                </Box>

                <Typography variant="h3" sx={{ mb: 1 }}>
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  {item.description}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => handleManage(item.title)}
                >
                  Manage
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}