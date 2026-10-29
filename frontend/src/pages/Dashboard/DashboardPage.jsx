// Overview numbers, recent orders and low-stock ingredients.
import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Stack, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link as RouterLink } from 'react-router-dom';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PaymentsIcon from '@mui/icons-material/Payments';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import PageHeader from '../../components/common/PageHeader';
import { money, dateTime } from '../../utils/format';

export default function DashboardPage() {
  const notify = useToast();
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/dashboard/summary'), api.get('/orders?limit=6')])
      .then(([s, o]) => { setSummary(s.data); setOrders(o.data); })
      .catch((e) => notify(e.message, 'error'));
  }, []);

  const cards = summary && [
    { title: 'Total orders', value: summary.orders, icon: <ReceiptLongIcon />, to: '/orders' },
    { title: 'Active orders', value: summary.activeOrders, icon: <PendingActionsIcon />, to: '/orders' },
    { title: 'Revenue collected', value: money(summary.revenue), icon: <PaymentsIcon />, to: '/billing' },
    { title: 'Menu dishes', value: summary.menuItems, icon: <MenuBookIcon />, to: '/menu' },
    { title: 'Active staff', value: summary.staff, icon: <GroupsIcon />, to: '/staff' },
    { title: 'Suppliers', value: summary.suppliers, icon: <LocalShippingIcon />, to: '/suppliers' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {(cards || []).map((c) => (
          <Grid key={c.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper component={RouterLink} to={c.to} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', color: 'inherit', '&:hover': { borderColor: 'primary.main' } }}>
              <Box sx={{ color: 'primary.main', display: 'flex' }}>{c.icon}</Box>
              <Box>
                <Typography variant="caption" color="text.secondary">{c.title}</Typography>
                <Typography variant="h2">{c.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h3" sx={{ mb: 1.5 }}>Recent orders</Typography>
          <DataTable rows={orders} loading={!summary} empty="No orders yet. Take the first one from the Orders page."
            columns={[
              { label: 'Order', render: (r) => `#${r.id}` },
              { label: 'Customer', render: (r) => r.customer?.name },
              { label: 'Total', render: (r) => money(r.totalCost) },
              { label: 'Status', render: (r) => <StatusChip status={r.status} /> },
              { label: 'Placed', render: (r) => dateTime(r.orderTime) },
            ]} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h3" sx={{ mb: 1.5 }}>Low stock</Typography>
          <Paper sx={{ p: 2 }}>
            {summary && summary.lowStockItems.length === 0 && <Typography variant="body2" color="text.secondary">All ingredients are above their reorder level.</Typography>}
            <Stack spacing={1.5}>
              {summary?.lowStockItems.map((i) => (
                <Box key={i.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningAmberIcon color="warning" fontSize="small" />
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>{i.name}</Typography>
                  <Chip size="small" color="warning" label={`${i.availableQuantity} / ${i.reorderLevel} ${i.unit}`} />
                </Box>
              ))}
            </Stack>
            {summary?.lowStockItems.length > 0 && <Button component={RouterLink} to="/purchases" size="small" sx={{ mt: 2 }}>Order stock</Button>}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
