// Hero: headline, short pitch, two buttons, and a small decorative order card
// that shows the status colors used across the app.
import { Box, Container, Typography, Button, Paper, Stack, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2'; // MUI v6 grid that supports the `size` prop
import { Link as RouterLink } from 'react-router-dom';

// Sample data only (not real). Chip colors map to the status palette in theme.js.
const sampleOrders = [
  { id: '#1042', item: 'Butter Chicken Bowl', status: 'Placed', color: 'secondary' },
  { id: '#1043', item: 'Paneer Wrap', status: 'Preparing', color: 'warning' },
  { id: '#1044', item: 'Veg Biryani', status: 'Delivered', color: 'success' },
];

export default function Hero() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
      <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h1" sx={{ lineHeight: 1.25 }}>
            Run your cloud kitchen from one place.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 3, maxWidth: 440 }}>
            Orders, menu, stock, staff and billing, all in one simple dashboard.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
            <Button component={RouterLink} to="/signin" variant="contained" size="large">Get started</Button>
            <Button href="#features" variant="outlined" size="large">See features</Button>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="caption" color="text.secondary">Live orders</Typography>
            <Stack spacing={2.5} sx={{ mt: 2.5 }}>
              {sampleOrders.map((o) => (
                <Box key={o.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" fontWeight={600}>{o.id}</Typography>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>{o.item}</Typography>
                  <Chip size="small" label={o.status} color={o.color} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
