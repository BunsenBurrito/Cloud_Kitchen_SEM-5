// Stock bought from suppliers. Stock only increases when a purchase is received.
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import useList from '../../hooks/useList';
import useOptions from '../../hooks/useOptions';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { money, date, label } from '../../utils/format';

const emptyLine = { kind: 'ingredient', itemId: '', quantity: 1, unitPrice: 0 };
const emptyPurchase = { supplierId: '', purchaseDate: new Date().toISOString().slice(0, 10), paymentStatus: 'pending', items: [emptyLine] };
const paymentOptions = ['pending', 'partial', 'paid'].map((p) => ({ value: p, label: label(p) }));

export default function PurchasesPage() {
  const notify = useToast();
  const [status, setStatus] = useState('');
  const list = useList('/purchases', { status });
  const suppliers = useOptions('/suppliers');
  const ingredients = useOptions('/ingredients', (i) => `${i.name} (${i.unit})`);
  const inventory = useOptions('/inventory', (i) => `${i.name} (${i.unit})`);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

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

  const setLine = (i, patch) => setForm({ ...form, items: form.items.map((l, j) => (i === j ? { ...l, ...patch } : l)) });
  const total = form ? form.items.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0) : 0;

  const save = async () => {
    const items = form.items.filter((l) => l.itemId).map((l) => ({ [l.kind === 'ingredient' ? 'ingredientId' : 'inventoryItemId']: l.itemId, quantity: Number(l.quantity), unitPrice: Number(l.unitPrice) }));
    if (!form.supplierId || items.length === 0)
      return notify('Choose a supplier and at least one item', 'error');
    setSaving(true);
    if (await run(() => api.post('/purchases', { supplierId: form.supplierId, purchaseDate: form.purchaseDate, paymentStatus: form.paymentStatus, items }), 'Purchase created'))
      setForm(null);
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Purchases" actionLabel="New purchase" onAction={() => setForm(emptyPurchase)} />
      <Tabs value={status} onChange={(e, v) => setStatus(v)} sx={{ mb: 2 }}>
        {['', 'ordered', 'received', 'cancelled'].map((s) => <Tab key={s} value={s} label={s ? label(s) : 'All'} />)}
      </Tabs>
      <DataTable rows={list.rows} loading={list.loading} total={list.total} page={list.page} limit={list.limit} onPage={list.setPage}
        columns={[
          { label: 'Purchase', render: (r) => `#${r.id}` },
          { label: 'Supplier', render: (r) => r.supplier?.name },
          { label: 'Items', render: (r) => r.items.map((i) => `${i.quantity} ${(i.ingredient || i.inventoryItem)?.unit} ${(i.ingredient || i.inventoryItem)?.name}`).join(', ') },
          { label: 'Total', render: (r) => money(r.totalAmount) },
          { label: 'Date', render: (r) => date(r.purchaseDate) },
          { label: 'Status', render: (r) => <StatusChip status={r.status} /> },
          { label: 'Payment', render: (r) => <StatusChip status={r.paymentStatus} /> },
          { label: 'Actions', align: 'right', render: (r) => (
            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
              {r.status === 'ordered' && <Button size="small" variant="contained" onClick={() => run(() => api.patch(`/purchases/${r.id}/receive`), 'Received, stock updated')}>Receive</Button>}
              {r.status === 'ordered' && <Button size="small" color="error" onClick={() => run(() => api.patch(`/purchases/${r.id}/cancel`), 'Purchase cancelled')}>Cancel</Button>}
              {r.paymentStatus !== 'paid' && r.status !== 'cancelled' && <Button size="small" onClick={() => run(() => api.put(`/purchases/${r.id}`, { paymentStatus: 'paid' }), 'Marked as paid')}>Mark paid</Button>}
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleting(r)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </Stack>
          ) },
        ]} />

      <Dialog open={!!form} onClose={() => setForm(null)} maxWidth="md" fullWidth>
        {form && (
          <>
            <DialogTitle>New purchase</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5, mb: 2 }}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField select fullWidth size="small" label="Supplier" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                    {suppliers.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6, sm: 3.5 }}><TextField fullWidth size="small" type="date" label="Date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
                <Grid size={{ xs: 6, sm: 3.5 }}>
                  <TextField select fullWidth size="small" label="Payment" value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
                    {paymentOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
              {form.items.map((l, i) => (
                <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField select size="small" label="Type" value={l.kind} onChange={(e) => setLine(i, { kind: e.target.value, itemId: '' })} sx={{ width: 130 }}>
                    <MenuItem value="ingredient">Ingredient</MenuItem>
                    <MenuItem value="inventory">Inventory</MenuItem>
                  </TextField>
                  <TextField select size="small" label="Item" value={l.itemId} onChange={(e) => setLine(i, { itemId: e.target.value })} sx={{ flexGrow: 1 }}>
                    {(l.kind === 'ingredient' ? ingredients : inventory).options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                  <TextField size="small" type="number" label="Quantity" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} slotProps={{ htmlInput: { min: 0, step: 'any' } }} sx={{ width: 110 }} />
                  <TextField size="small" type="number" label="Unit price" value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value })} slotProps={{ htmlInput: { min: 0, step: 'any' } }} sx={{ width: 120 }} />
                  <IconButton disabled={form.items.length === 1} onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })}><RemoveCircleOutlineIcon /></IconButton>
                </Stack>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={() => setForm({ ...form, items: [...form.items, emptyLine] })}>Add item</Button>
              <Typography variant="h3" sx={{ mt: 2 }}>Total: {money(total)}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button color="inherit" onClick={() => setForm(null)}>Cancel</Button>
              <Button variant="contained" disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Create purchase'}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <ConfirmDialog open={!!deleting} text={`Delete purchase #${deleting?.id}? Stock already received is not reversed.`} confirmLabel="Delete" onConfirm={() => run(() => api.del(`/purchases/${deleting.id}`), 'Purchase deleted').then(() => setDeleting(null))} onClose={() => setDeleting(null)} />
    </>
  );
}
