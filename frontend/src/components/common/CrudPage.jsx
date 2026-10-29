// Generic list + add/edit/delete page used by the simple tables
// (ingredients, inventory, suppliers, customers, staff, salaries).
import { useEffect, useState } from 'react';
import { IconButton, Stack, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import useList from '../../hooks/useList';
import useOptions from '../../hooks/useOptions';
import PageHeader from './PageHeader';
import DataTable from './DataTable';
import FormDialog from './FormDialog';
import ConfirmDialog from './ConfirmDialog';

// Loads dropdown choices for fields that have a `source` endpoint
function SourceField({ field, onLoaded }) {
  const { rows, options } = useOptions(field.source, field.optionLabel);
  useEffect(() => onLoaded(field.key, options), [rows]);
  return null;
}

export default function CrudPage({ title, subtitle, endpoint, query = {}, columns, fields, defaults, toForm = (r) => r, toPayload = (f) => f, extraActions, rowSx, addLabel = 'Add', canSearch = true }) {
  const notify = useToast();
  const [q, setQ] = useState('');
  const list = useList(endpoint, { ...query, q: canSearch ? q : '' });
  const [sources, setSources] = useState({});
  const [form, setForm] = useState(null); // null = closed
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const withOptions = fields.map((f) => (f.source ? { ...f, options: sources[f.key] || [] } : f));
  const open = (row) => {
    setEditId(row ? row.id : null);
    setForm(row ? toForm(row) : defaults);
  };

  const save = async () => {
    setSaving(true);
    const body = Object.fromEntries(Object.entries(toPayload(form)).map(([k, v]) => [k, v === '' ? null : v]));
    try {
      await (editId ? api.put(`${endpoint}/${editId}`, body) : api.post(endpoint, body));
      notify(editId ? 'Changes saved' : 'Added');
      setForm(null);
      list.reload();
    } catch (e) {
      notify(e.message, 'error');
    }
    setSaving(false);
  };

  const remove = async () => {
    try {
      await api.del(`${endpoint}/${deleting.id}`);
      notify('Deleted');
      list.reload();
    } catch (e) {
      notify(e.message, 'error');
    }
    setDeleting(null);
  };

  const actionColumn = {
    label: 'Actions', align: 'right',
    render: (row) => (
      <Stack direction="row" justifyContent="flex-end" alignItems="center">
        {extraActions && extraActions(row, list.reload)}
        <Tooltip title="Edit"><IconButton size="small" onClick={() => open(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleting(row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Stack>
    ),
  };

  return (
    <>
      {fields.filter((f) => f.source).map((f) => <SourceField key={f.key} field={f} onLoaded={(k, o) => setSources((s) => ({ ...s, [k]: o }))} />)}
      <PageHeader title={title} subtitle={subtitle} search={q} onSearch={canSearch ? setQ : undefined} actionLabel={addLabel} onAction={() => open(null)} />
      <DataTable columns={[...columns, actionColumn]} rows={list.rows} loading={list.loading} total={list.total} page={list.page} limit={list.limit} onPage={list.setPage} rowSx={rowSx} />
      <FormDialog open={!!form} title={editId ? `Edit ${title}` : addLabel} fields={withOptions} values={form || {}} onChange={setForm} onSubmit={save} onClose={() => setForm(null)} saving={saving} />
      <ConfirmDialog open={!!deleting} text="This cannot be undone." confirmLabel="Delete" onConfirm={remove} onClose={() => setDeleting(null)} />
    </>
  );
}
