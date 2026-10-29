// Loads a paginated list from the API. params (search, filters) reset the page to 1.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function useList(endpoint, params = {}, limit = 10) {
  const notify = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => setPage(0), [key, endpoint]);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null)), page: page + 1, limit });
    try {
      const res = await api.get(`${endpoint}?${qs}`);
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      notify(e.message, 'error');
    }
    setLoading(false);
  }, [endpoint, key, page, limit]);

  useEffect(() => { load(); }, [load]);
  return { rows, total, page, setPage, limit, loading, reload: load };
}
