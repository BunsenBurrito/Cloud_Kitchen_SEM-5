// Dialog with a form built from a field list.
// field: { key, label, type: text|number|date|email|select|multi|switch|multiline, required, options, half }
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid2';

export default function FormDialog({ open, title, fields, values, onChange, onSubmit, onClose, saving, children, maxWidth = 'sm' }) {
  const set = (key, value) => onChange({ ...values, [key]: value });
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {fields.map((f) => (
              <Grid key={f.key} size={{ xs: 12, sm: f.half ? 6 : 12 }}>
                {f.type === 'switch' ? (
                  <FormControlLabel label={f.label} control={<Switch checked={!!values[f.key]} onChange={(e) => set(f.key, e.target.checked)} />} />
                ) : (
                  <TextField fullWidth size="small" label={f.label} required={f.required} value={values[f.key] ?? (f.type === 'multi' ? [] : '')}
                    type={['number', 'date', 'email'].includes(f.type) ? f.type : 'text'}
                    select={f.type === 'select' || f.type === 'multi'} multiline={f.type === 'multiline'} minRows={f.type === 'multiline' ? 2 : undefined}
                    slotProps={{ inputLabel: f.type === 'date' ? { shrink: true } : undefined, select: f.type === 'multi' ? { multiple: true } : undefined, htmlInput: f.type === 'number' ? { min: 0, step: 'any' } : undefined }}
                    onChange={(e) => set(f.key, e.target.value)}>
                    {(f.options || []).map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                  </TextField>
                )}
              </Grid>
            ))}
          </Grid>
          {children}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
