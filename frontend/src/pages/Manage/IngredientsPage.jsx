import { Chip } from '@mui/material';
import CrudPage from '../../components/common/CrudPage';

const units = ['kg', 'g', 'l', 'ml', 'pcs'].map((u) => ({ value: u, label: u }));
const isLow = (r) => r.availableQuantity <= r.reorderLevel;

export default function IngredientsPage() {
  return (
    <CrudPage title="Ingredients" endpoint="/ingredients" addLabel="Add ingredient"
      defaults={{ name: '', category: '', isVeg: true, availableQuantity: 0, unit: 'kg', reorderLevel: 0 }}
      rowSx={(r) => (isLow(r) ? { bgcolor: 'rgba(246,196,83,0.15)' } : undefined)}
      columns={[
        { label: 'Name', key: 'name' },
        { label: 'Category', key: 'category' },
        { label: 'Type', render: (r) => <Chip size="small" variant="outlined" color={r.isVeg ? 'success' : 'error'} label={r.isVeg ? 'Veg' : 'Non-Veg'} /> },
        { label: 'In stock', render: (r) => `${r.availableQuantity} ${r.unit}` },
        { label: 'Reorder at', render: (r) => `${r.reorderLevel} ${r.unit}` },
        { label: 'Status', render: (r) => <Chip size="small" color={isLow(r) ? 'warning' : 'success'} label={isLow(r) ? 'Low stock' : 'OK'} /> },
      ]}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'category', label: 'Category', half: true },
        { key: 'unit', label: 'Unit', type: 'select', options: units, half: true },
        { key: 'availableQuantity', label: 'Quantity in stock', type: 'number', half: true },
        { key: 'reorderLevel', label: 'Reorder level', type: 'number', half: true },
        { key: 'isVeg', label: 'Vegetarian', type: 'switch' },
      ]} />
  );
}
