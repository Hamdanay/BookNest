/** Base URL API (kosong = same-origin, dipakai di dev lewat proxy Vite). */
export function getApiBase() {
  const base = import.meta.env.VITE_API_URL || '';
  return base.replace(/\/$/, '');
}

export function apiUrl(path) {
  if (!path) return getApiBase();
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
}
