import { Chip } from '@mui/material';
import CrudPage from '../../components/common/CrudPage';

const isLow = (r) => r.availableQuantity <= r.reorderLevel;

export default function InventoryPage() {
  return (
    <CrudPage title="Inventory" endpoint="/inventory" addLabel="Add item"
      defaults={{ name: '', availableQuantity: 0, unit: 'pcs', reorderLevel: 0 }}
      rowSx={(r) => (isLow(r) ? { bgcolor: 'rgba(246,196,83,0.15)' } : undefined)}
      columns={[
        { label: 'Item', key: 'name' },
        { label: 'In stock', render: (r) => `${r.availableQuantity} ${r.unit}` },
        { label: 'Reorder at', render: (r) => `${r.reorderLevel} ${r.unit}` },
        { label: 'Status', render: (r) => <Chip size="small" color={isLow(r) ? 'warning' : 'success'} label={isLow(r) ? 'Low stock' : 'OK'} /> },
      ]}
      fields={[
        { key: 'name', label: 'Item name', required: true },
        { key: 'availableQuantity', label: 'Quantity in stock', type: 'number', half: true },
        { key: 'unit', label: 'Unit', half: true },
        { key: 'reorderLevel', label: 'Reorder level', type: 'number', half: true },
      ]} />
  );
}
