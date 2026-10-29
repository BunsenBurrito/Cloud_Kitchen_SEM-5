// Loads up to 100 records of an endpoint for a dropdown. getLabel builds the text shown for each.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export default function useOptions(endpoint, getLabel = (r) => r.name) {
  const [rows, setRows] = useState([]);
  const load = useCallback(() => api.get(`${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=100`).then((d) => setRows(d.data)).catch(() => {}), [endpoint]);
  useEffect(() => { load(); }, [load]);
  return { rows, options: rows.map((r) => ({ value: r.id, label: getLabel(r) })), reload: load };
}
