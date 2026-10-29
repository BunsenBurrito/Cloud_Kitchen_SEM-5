// Take orders and move them through the kitchen workflow.
import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import useList from '../../hooks/useList';
import useOptions from '../../hooks/useOptions';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { money, dateTime, label } from '../../utils/format';

const statuses = ['', 'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const next = { placed: ['confirmed', 'Confirm'], confirmed: ['preparing', 'Start cooking'], preparing: ['out_for_delivery', 'Dispatch'], out_for_delivery: ['delivered', 'Mark delivered'] };
const emptyOrder = { customerId: '', newCustomer: false, name: '', phone: '', flatNo: '', societyName: '', street: '', city: '', state: '', notes: '', items: [{ menuItemId: '', quantity: 1 }] };
const addressFields = [['flatNo', 'Flat / house no.'], ['societyName', 'Society'], ['street', 'Street / area'], ['city', 'City'], ['state', 'State']];

export default function OrdersPage() {
  const notify = useToast();
  const [status, setStatus] = useState('');
  const list = useList('/orders', { status });
  const customers = useOptions('/users?role=customer', (c) => `${c.name}${c.phone ? ` · ${c.phone}` : ''}`);
  const menu = useOptions('/menu?isAvailable=true', (m) => `${m.name} · ${money(m.price)}`);
  const partners = useOptions('/staff?role=delivery&isActive=true', (s) => `${s.firstName} ${s.lastName || ''}`);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const [dispatch, setDispatch] = useState(null);
  const [partnerId, setPartnerId] = useState('');
  const [cancelling, setCancelling] = useState(null);

  const run = async (action, message) => {
    try {
      await action();
      notify(message);
      list.reload();
      return true;
    } catch (e) {
      notify(e.message, 'error');
      return false;
    }
  };

  const advance = (order) => {
    const [to] = next[order.status];
    if (to === 'out_for_delivery') {
      setPartnerId('');
      setDispatch(order);
      return;
    }
    run(() => api.patch(`/orders/${order.id}/status`, { status: to }), `Order #${order.id} is now ${label(to).toLowerCase()}`);
  };

  const total = form ? form.items.reduce((sum, i) => sum + (menu.rows.find((m) => m.id === i.menuItemId)?.price || 0) * (Number(i.quantity) || 0), 0) : 0;
  const setItem = (i, patch) => setForm({ ...form, items: form.items.map((it, j) => (i === j ? { ...it, ...patch } : it)) });

  const place = async () => {
    const items = form.items.filter((i) => i.menuItemId);
    if (items.length === 0)
      return notify('Add at least one dish', 'error');
    if (!form.newCustomer && !form.customerId)
      return notify('Choose a customer', 'error');
    setSaving(true);
    const ok = await run(async () => {
      let customerId = form.customerId;
      if (form.newCustomer) {
        const { name, phone, flatNo, societyName, street, city, state } = form;
        const created = await api.post('/users', { name, phone, flatNo, societyName, street, city, state, role: 'customer', email: `walkin-${Date.now()}@cloudkitchen.local` });
        customerId = created.data.id;
        customers.reload();
      }
      await api.post('/orders', { customerId, items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: Number(i.quantity) })), notes: form.notes || undefined });
    }, 'Order placed');
    setSaving(false);
    if (ok)
      setForm(null);
  };

  return (
    <>
      <PageHeader title="Orders" actionLabel="New order" onAction={() => setForm(emptyOrder)} />
      <Tabs value={status} onChange={(e, v) => setStatus(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        {statuses.map((s) => <Tab key={s} value={s} label={s ? label(s) : 'All'} />)}
      </Tabs>
      <DataTable rows={list.rows} loading={list.loading} total={list.total} page={list.page} limit={list.limit} onPage={list.setPage}
        columns={[
          { label: 'Order', render: (r) => `#${r.id}` },
          { label: 'Customer', render: (r) => r.customer?.name },
          { label: 'Items', render: (r) => r.items.map((i) => `${i.quantity}× ${i.name}`).join(', ') },
          { label: 'Total', render: (r) => money(r.totalCost) },
          { label: 'Status', render: (r) => <StatusChip status={r.status} /> },
          { label: 'Placed', render: (r) => dateTime(r.orderTime) },
          { label: 'Actions', align: 'right', render: (r) => (
            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
              {next[r.status] && <Button size="small" variant="contained" onClick={() => advance(r)}>{next[r.status][1]}</Button>}
              {['placed', 'confirmed'].includes(r.status) && <Button size="small" color="error" onClick={() => setCancelling(r)}>Cancel</Button>}
              <Tooltip title="Details"><IconButton size="small" onClick={() => setDetail(r)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
            </Stack>
          ) },
        ]} />

      <Dialog open={!!form} onClose={() => setForm(null)} maxWidth="sm" fullWidth>
        {form && (
          <>
            <DialogTitle>New order</DialogTitle>
            <DialogContent>
              <FormControlLabel sx={{ mb: 1 }} label="New customer (walk-in / phone order)" control={<Switch checked={form.newCustomer} onChange={(e) => setForm({ ...form, newCustomer: e.target.checked })} />} />
              {form.newCustomer ? (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={6}><TextField fullWidth size="small" required label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
                  <Grid size={6}><TextField fullWidth size="small" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
                  {addressFields.map(([k, l]) => <Grid key={k} size={k === 'street' ? 12 : 6}><TextField fullWidth size="small" label={l} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></Grid>)}
                </Grid>
              ) : (
                <TextField select fullWidth size="small" label="Customer" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} sx={{ mb: 2 }}>
                  {customers.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
              )}
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Dishes</Typography>
              {form.items.map((it, i) => (
                <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField select size="small" label="Dish" value={it.menuItemId} onChange={(e) => setItem(i, { menuItemId: e.target.value })} sx={{ flexGrow: 1 }}>
                    {menu.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                  <TextField size="small" type="number" label="Qty" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} slotProps={{ htmlInput: { min: 1 } }} sx={{ width: 90 }} />
                  <IconButton disabled={form.items.length === 1} onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })}><RemoveCircleOutlineIcon /></IconButton>
                </Stack>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={() => setForm({ ...form, items: [...form.items, { menuItemId: '', quantity: 1 }] })}>Add dish</Button>
              <TextField fullWidth size="small" label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} sx={{ mt: 2 }} />
              <Typography variant="h3" sx={{ mt: 2 }}>Total: {money(total)}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button color="inherit" onClick={() => setForm(null)}>Cancel</Button>
              <Button variant="contained" disabled={saving} onClick={place}>{saving ? 'Placing...' : 'Place order'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!dispatch} onClose={() => setDispatch(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Dispatch order #{dispatch?.id}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth size="small" label="Delivery partner" value={partnerId} onChange={(e) => setPartnerId(e.target.value)} sx={{ mt: 1 }} helperText={partners.options.length ? '' : 'Add delivery staff on the Staff page to assign a partner.'}>
            {partners.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setDispatch(null)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (await run(() => api.patch(`/orders/${dispatch.id}/status`, { status: 'out_for_delivery', deliveryPartnerId: partnerId || undefined }), 'Order is out for delivery'))
              setDispatch(null);
          }}>Dispatch</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        {detail && (
          <>
            <DialogTitle>Order #{detail.id} <StatusChip status={detail.status} /></DialogTitle>
            <DialogContent>
              <Typography variant="body2">{detail.customer?.name} · {detail.customer?.phone || 'no phone'}</Typography>
              <Typography variant="body2" color="text.secondary">{[detail.flatNo, detail.societyName, detail.street, detail.city, detail.state].filter(Boolean).join(', ') || 'No address'}</Typography>
              {detail.notes && <Typography variant="body2" sx={{ mt: 1 }}>Notes: {detail.notes}</Typography>}
              {detail.deliveryPartner && <Typography variant="body2" sx={{ mt: 1 }}>Delivery partner: {detail.deliveryPartner.firstName} {detail.deliveryPartner.lastName}</Typography>}
              <Divider sx={{ my: 2 }} />
              {detail.items.map((i) => (
                <Box key={i.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{i.quantity}× {i.name}</Typography>
                  <Typography variant="body2">{money(i.subtotal)}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700}>{money(detail.totalCost)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary">History</Typography>
              {[...detail.statusHistory].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((h) => <Typography key={h.id} variant="body2">{label(h.status)} · {dateTime(h.createdAt)}</Typography>)}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setDetail(null)}>Close</Button></DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog open={!!cancelling} title="Cancel order?" text={`Order #${cancelling?.id} will be cancelled.`} confirmLabel="Cancel order"
        onConfirm={() => run(() => api.patch(`/orders/${cancelling.id}/cancel`), 'Order cancelled').then(() => setCancelling(null))} onClose={() => setCancelling(null)} />
    </>
  );
}
