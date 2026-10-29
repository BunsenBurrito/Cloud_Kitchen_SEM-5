// One place that maps every status in the app to a theme color.
import { Chip } from '@mui/material';
import { label } from '../../utils/format';

const colors = {
  placed: 'secondary', confirmed: 'primary', preparing: 'warning', out_for_delivery: 'secondary', delivered: 'success', cancelled: 'error',
  unpaid: 'warning', paid: 'success', refunded: 'error', pending: 'warning', success: 'success', failed: 'error',
  ordered: 'warning', received: 'success', partial: 'secondary',
};

export default function StatusChip({ status }) {
  return <Chip size="small" label={label(status)} color={colors[status] || 'default'} variant={status === 'out_for_delivery' ? 'outlined' : 'filled'} />;
}
