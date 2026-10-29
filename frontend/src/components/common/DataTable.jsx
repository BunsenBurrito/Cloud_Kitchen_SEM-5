// Plain table with loading/empty states and optional server-side pagination.
// columns: [{ label, key?, render?(row), align? }]
import { Paper, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TablePagination, LinearProgress, Typography, Box } from '@mui/material';

export default function DataTable({ columns, rows, loading, total, page, limit, onPage, rowSx, empty = 'Nothing here yet.' }) {
  return (
    <Paper>
      {loading && <LinearProgress />}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>{columns.map((c) => <TableCell key={c.label} align={c.align} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{c.label}</TableCell>)}</TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.id ?? i} hover sx={rowSx ? rowSx(row) : undefined}>
                {columns.map((c) => <TableCell key={c.label} align={c.align}>{c.render ? c.render(row) : row[c.key] ?? '-'}</TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && rows.length === 0 && <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">{empty}</Typography></Box>}
      {onPage && <TablePagination component="div" count={total} page={page} rowsPerPage={limit} rowsPerPageOptions={[limit]} onPageChange={(e, p) => onPage(p)} />}
    </Paper>
  );
}
