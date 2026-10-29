// Bills (one per order) and the payments recorded against them.
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import useList from '../../hooks/useList';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import { money, dateTime, label } from '../../utils/format';

const methods = ['cash', 'card', 'upi', 'wallet'];

export default function BillingPage() {
  const notify = useToast();
  const [tab, setTab] = useState('bills');
  const [paying, setPaying] = useState(null);
  const [method, setMethod] = useState('cash');
  const [txn, setTxn] = useState('');
  const bills = useList('/billing');
  const payments = useList('/payments');

  const run = async (action, message) => {
    try {
      await action();
      notify(message);
      bills.reload();
      payments.reload();
      return true;
    } catch (e) {
      notify(e.message, 'error');
      return false;
    }
  };

  const setStatus = (p, status, message) => run(() => api.patch(`/payments/${p.id}/status`, { status }), message);

  return (
    <>
      <PageHeader title="Billing" />
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="bills" label="Bills" />
        <Tab value="payments" label="Payments" />
      </Tabs>
      {tab === 'bills' ? (
        <DataTable rows={bills.rows} loading={bills.loading} total={bills.total} page={bills.page} limit={bills.limit} onPage={bills.setPage}
          columns={[
            { label: 'Bill', render: (r) => `#${r.id}` },
            { label: 'Order', render: (r) => `#${r.orderId}` },
            { label: 'Customer', render: (r) => r.customer?.name },
            { label: 'Amount', render: (r) => money(r.totalAmount) },
            { label: 'Status', render: (r) => <StatusChip status={r.paymentStatus} /> },
            { label: 'Created', render: (r) => dateTime(r.createdAt) },
            { label: 'Actions', align: 'right', render: (r) => r.paymentStatus === 'unpaid' && <Button size="small" variant="contained" onClick={() => { setMethod('cash'); setTxn(''); setPaying(r); }}>Record payment</Button> },
          ]} />
      ) : (
        <DataTable rows={payments.rows} loading={payments.loading} total={payments.total} page={payments.page} limit={payments.limit} onPage={payments.setPage}
          columns={[
            { label: 'Payment', render: (r) => `#${r.id}` },
            { label: 'Bill', render: (r) => `#${r.billId}` },
            { label: 'Customer', render: (r) => r.customer?.name },
            { label: 'Amount', render: (r) => money(r.amount) },
            { label: 'Method', render: (r) => label(r.method) },
            { label: 'Reference', render: (r) => r.transactionId || '-' },
            { label: 'Status', render: (r) => <StatusChip status={r.status} /> },
            { label: 'Paid at', render: (r) => dateTime(r.paidAt) },
            { label: 'Actions', align: 'right', render: (r) => (
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                {r.status === 'pending' && <Button size="small" variant="contained" onClick={() => setStatus(r, 'success', 'Payment confirmed')}>Confirm</Button>}
                {r.status === 'pending' && <Button size="small" color="error" onClick={() => setStatus(r, 'failed', 'Payment marked failed')}>Failed</Button>}
                {r.status === 'success' && <Button size="small" color="error" onClick={() => setStatus(r, 'refunded', 'Payment refunded')}>Refund</Button>}
              </Stack>
            ) },
          ]} />
      )}

      <Dialog open={!!paying} onClose={() => setPaying(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Record payment for bill #{paying?.id}</DialogTitle>
        <DialogContent>
          <Typography variant="h3" sx={{ my: 1 }}>{money(paying?.totalAmount)}</Typography>
          <TextField select fullWidth size="small" label="Method" value={method} onChange={(e) => setMethod(e.target.value)} sx={{ mt: 1 }} helperText={method === 'cash' ? 'Cash stays pending until you confirm it in Payments.' : 'Recorded as paid immediately.'}>
            {methods.map((m) => <MenuItem key={m} value={m}>{label(m)}</MenuItem>)}
          </TextField>
          {method !== 'cash' && <TextField fullWidth size="small" label="Transaction reference" value={txn} onChange={(e) => setTxn(e.target.value)} sx={{ mt: 2 }} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setPaying(null)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            if (await run(() => api.post('/payments', { billId: paying.id, method, transactionId: txn || undefined }), 'Payment recorded'))
              setPaying(null);
          }}>Record</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
