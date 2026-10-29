import { Button } from '@mui/material';
import CrudPage from '../../components/common/CrudPage';
import StatusChip from '../../components/common/StatusChip';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { money, date } from '../../utils/format';

export default function SalariesPage() {
  const notify = useToast();
  const markPaid = (row, reload) => api.put(`/salaries/${row.id}`, { paymentStatus: 'paid', paymentDate: new Date().toISOString().slice(0, 10) }).then(() => { notify('Marked as paid'); reload(); }).catch((e) => notify(e.message, 'error'));
  return (
    <CrudPage title="Salaries" endpoint="/salaries" addLabel="Add salary record" canSearch={false}
      defaults={{ staffId: '', month: new Date().toISOString().slice(0, 7), amount: 0, paymentStatus: 'pending', paymentDate: '' }}
      toForm={(r) => ({ ...r, paymentDate: r.paymentDate || '' })}
      toPayload={(f) => ({ ...f, staffId: f.staffId || undefined })}
      extraActions={(row, reload) => row.paymentStatus === 'pending' && <Button size="small" onClick={() => markPaid(row, reload)}>Mark paid</Button>}
      columns={[
        { label: 'Staff', render: (r) => `${r.staff.firstName} ${r.staff.lastName || ''}` },
        { label: 'Month', key: 'month' },
        { label: 'Amount', render: (r) => money(r.amount) },
        { label: 'Status', render: (r) => <StatusChip status={r.paymentStatus} /> },
        { label: 'Paid on', render: (r) => date(r.paymentDate) },
      ]}
      fields={[
        { key: 'staffId', label: 'Staff member', type: 'select', required: true, source: '/staff', optionLabel: (s) => `${s.firstName} ${s.lastName || ''}` },
        { key: 'month', label: 'Month (YYYY-MM)', required: true, half: true },
        { key: 'amount', label: 'Amount', type: 'number', half: true },
        { key: 'paymentStatus', label: 'Status', type: 'select', half: true, options: [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }] },
        { key: 'paymentDate', label: 'Payment date', type: 'date', half: true },
      ]} />
  );
}
