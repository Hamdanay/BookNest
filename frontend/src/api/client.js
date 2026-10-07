import { apiUrl } from '../lib/apiBase.js';

async function request(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Permintaan gagal');
  return data;
}

export const api = {
  getMeta: () => request('/api/meta'),
  getBooks: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v);
    });
    const qs = q.toString();
    return request(`/api/books${qs ? `?${qs}` : ''}`);
  },
  getBook: (id) => request(`/api/books/${id}`),
  getBookHistory: (id) => request(`/api/books/${id}/history`),
  createBook: (body) => request('/api/books', { method: 'POST', body: JSON.stringify(body) }),
  updateBook: (id, body) =>
    request(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBook: (id) => request(`/api/books/${id}`, { method: 'DELETE' }),

  getCategories: () => request('/api/categories'),
  createCategory: (name) =>
    request('/api/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  updateCategory: (id, name) =>
    request(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),

  getRacks: () => request('/api/racks'),
  createRack: (name) => request('/api/racks', { method: 'POST', body: JSON.stringify({ name }) }),
  updateRack: (id, name) =>
    request(`/api/racks/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  deleteRack: (id) => request(`/api/racks/${id}`, { method: 'DELETE' }),

  getDashboard: () => request('/api/dashboard/stats'),
  resetSeed: () => request('/api/seed/reset', { method: 'POST' }),

  uploadCover: async (file) => {
    const form = new FormData();
    form.append('cover', file);
    const res = await fetch(apiUrl('/api/upload/cover'), { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload gagal');
    return data.url;
  },
};
