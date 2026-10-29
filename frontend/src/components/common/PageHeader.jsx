// Page title, optional search box and optional primary action.
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

export default function PageHeader({ title, subtitle, search, onSearch, actionLabel, onAction }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h2">{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {onSearch && (
        <TextField size="small" placeholder="Search" value={search} onChange={(e) => onSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} />
      )}
      {onAction && <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>{actionLabel}</Button>}
    </Box>
  );
}
