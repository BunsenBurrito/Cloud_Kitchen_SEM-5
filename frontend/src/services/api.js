// All backend calls go through here. The admin token is kept in localStorage.
const key = 'ckToken';
export const getToken = () => localStorage.getItem(key);
export const setToken = (token) => (token ? localStorage.setItem(key, token) : localStorage.removeItem(key));

const request = async (method, url, body) => {
  const res = await fetch(`/api${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && getToken())
    window.dispatchEvent(new Event('ck-logout'));
  if (!res.ok)
    throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  patch: (url, body = {}) => request('PATCH', url, body),
  del: (url) => request('DELETE', url),
};
