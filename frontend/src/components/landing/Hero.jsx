// Hero: headline, short pitch, two buttons, and a card with the kitchen's latest orders (real data once the admin is signed in).
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2'; // MUI v6 grid that supports the `size` prop
import { Link as RouterLink } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusChip from '../common/StatusChip';

export default function Hero() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user)
      api.get('/orders?limit=3').then((d) => setOrders(d.data)).catch(() => {});
  }, [user]);

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
            <Button component={RouterLink} to={user ? '/dashboard' : '/signin'} variant="contained" size="large">{user ? 'Open dashboard' : 'Admin sign in'}</Button>
            <Button href="#features" variant="outlined" size="large">See features</Button>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="caption" color="text.secondary">Latest orders</Typography>
            {!user && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Sign in as admin to see your live orders here.</Typography>}
            {user && orders.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No orders yet.</Typography>}
            <Stack spacing={2.5} sx={{ mt: 2.5 }}>
              {orders.map((o) => (
                <Box key={o.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" fontWeight={600}>#{o.id}</Typography>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</Typography>
                  <StatusChip status={o.status} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
