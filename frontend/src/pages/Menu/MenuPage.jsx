import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  {
    name: 'Paneer Tikka',
    category: 'Starter',
    type: 'Veg',
    price: 220,
  },
  {
    name: 'Veg Biryani',
    category: 'Main Course',
    type: 'Veg',
    price: 250,
  },
  {
    name: 'Margherita Pizza',
    category: 'Main Course',
    type: 'Veg',
    price: 280,
  },
  {
    name: 'Masala Dosa',
    category: 'Breakfast',
    type: 'Veg',
    price: 150,
  },
  {
    name: 'Chicken Biryani',
    category: 'Main Course',
    type: 'Non-Veg',
    price: 320,
  },
  {
    name: 'Chicken Tikka',
    category: 'Starter',
    type: 'Non-Veg',
    price: 280,
  },
  {
    name: 'Butter Chicken',
    category: 'Main Course',
    type: 'Non-Veg',
    price: 350,
  },
  {
    name: 'Chicken Burger',
    category: 'Fast Food',
    type: 'Non-Veg',
    price: 240,
  },
];

export default function MenuPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 5,
      }}
    >
      <Container maxWidth="lg">

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h2">
              Menu
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Manage dishes available in your Cloud Kitchen
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => navigate('/admin')}
          >
            Back to Dashboard
          </Button>
        </Box>

        {/* Menu Items */}
        <Grid container spacing={3}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.name}>
              <Card
                sx={{
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                  boxShadow: 'none',
                }}
              >
                <CardContent sx={{ p: 3 }}>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h3">
                      {item.name}
                    </Typography>

                    <Chip
                      label={item.type}
                      size="small"
                      color={
                        item.type === 'Veg'
                          ? 'success'
                          : 'error'
                      }
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {item.category}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                    }}
                  >
                    ₹{item.price}
                  </Typography>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
}