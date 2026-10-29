// Dishes with their recipe (how much of each ingredient one serving uses).
import { useState } from 'react';
import { Box, Chip, IconButton, Stack, Switch, TextField, MenuItem, Typography, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import useList from '../../hooks/useList';
import useOptions from '../../hooks/useOptions';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import FormDialog from '../../components/common/FormDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { money } from '../../utils/format';

const emptyDish = { name: '', category: '', foodType: 'Veg', price: 0, description: '', imageUrl: '', isAvailable: true, recipe: [] };
const fields = [
  { key: 'name', label: 'Dish name', required: true },
  { key: 'category', label: 'Category', required: true, half: true },
  { key: 'foodType', label: 'Type', type: 'select', half: true, options: [{ value: 'Veg', label: 'Veg' }, { value: 'Non-Veg', label: 'Non-Veg' }] },
  { key: 'price', label: 'Price (₹)', type: 'number', required: true, half: true },
  { key: 'imageUrl', label: 'Image URL', half: true },
  { key: 'description', label: 'Description', type: 'multiline' },
  { key: 'isAvailable', label: 'Available for ordering', type: 'switch' },
];

export default function MenuPage() {
  const notify = useToast();
  const [q, setQ] = useState('');
  const list = useList('/menu', { q });
  const ingredients = useOptions('/ingredients', (i) => `${i.name} (${i.unit})`);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const open = (row) => {
    setEditId(row ? row.id : null);
    setForm(row ? { ...row, description: row.description || '', imageUrl: row.imageUrl || '', recipe: row.recipe.map((r) => ({ ingredientId: r.ingredientId, quantityRequired: r.quantityRequired })) } : emptyDish);
  };
  const setRecipe = (i, patch) => setForm({ ...form, recipe: form.recipe.map((r, j) => (i === j ? { ...r, ...patch } : r)) });

  const run = async (action, message) => {
    try {
      await action();
      notify(message);
      list.reload();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const save = async () => {
    setSaving(true);
    const { name, category, foodType, price, description, imageUrl, isAvailable } = form;
    const body = { name, category, foodType, price, description: description || null, imageUrl: imageUrl || null, isAvailable, recipe: form.recipe.filter((r) => r.ingredientId) };
    await run(() => (editId ? api.put(`/menu/${editId}`, body) : api.post('/menu', body)), editId ? 'Dish updated' : 'Dish added');
    setForm(null);
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Menu" search={q} onSearch={setQ} actionLabel="Add dish" onAction={() => open(null)} />
      <DataTable rows={list.rows} loading={list.loading} total={list.total} page={list.page} limit={list.limit} onPage={list.setPage}
        columns={[
          { label: 'Dish', key: 'name' },
          { label: 'Category', key: 'category' },
          { label: 'Type', render: (r) => <Chip size="small" variant="outlined" color={r.foodType === 'Veg' ? 'success' : 'error'} label={r.foodType} /> },
          { label: 'Price', render: (r) => money(r.price) },
          { label: 'Recipe', render: (r) => (r.recipe.length ? r.recipe.map((x) => `${x.ingredient.name} ${x.quantityRequired}${x.ingredient.unit}`).join(', ') : 'No recipe') },
          { label: 'Available', render: (r) => <Switch size="small" checked={r.isAvailable} onChange={(e) => run(() => api.put(`/menu/${r.id}`, { isAvailable: e.target.checked }), 'Availability updated')} /> },
          { label: 'Actions', align: 'right', render: (r) => (
            <Stack direction="row" justifyContent="flex-end">
              <Tooltip title="Edit"><IconButton size="small" onClick={() => open(r)}><EditIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleting(r)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </Stack>
          ) },
        ]} />
      <FormDialog open={!!form} title={editId ? 'Edit dish' : 'Add dish'} fields={fields} values={form || {}} onChange={setForm} onSubmit={save} onClose={() => setForm(null)} saving={saving}>
        {form && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Recipe (per 1 serving)</Typography>
            {form.recipe.map((r, i) => (
              <Stack key={i} direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField select size="small" label="Ingredient" value={r.ingredientId} onChange={(e) => setRecipe(i, { ingredientId: e.target.value })} sx={{ flexGrow: 1 }}>
                  {ingredients.options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
                <TextField size="small" type="number" label="Quantity" value={r.quantityRequired} onChange={(e) => setRecipe(i, { quantityRequired: e.target.value })} slotProps={{ htmlInput: { min: 0, step: 'any' } }} sx={{ width: 120 }} />
                <IconButton onClick={() => setForm({ ...form, recipe: form.recipe.filter((_, j) => j !== i) })}><RemoveCircleOutlineIcon /></IconButton>
              </Stack>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={() => setForm({ ...form, recipe: [...form.recipe, { ingredientId: '', quantityRequired: 1 }] })}>Add ingredient</Button>
          </Box>
        )}
      </FormDialog>
      <ConfirmDialog open={!!deleting} text={`Delete "${deleting?.name}"? Past orders keep their details.`} confirmLabel="Delete" onConfirm={() => run(() => api.del(`/menu/${deleting.id}`), 'Dish deleted').then(() => setDeleting(null))} onClose={() => setDeleting(null)} />
    </>
  );
}
