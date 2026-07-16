/**
 * Backend origin for API requests.
 * - Production (Vercel): always /api → vercel.json proxies to Render (keeps session cookies)
 * - Development: http://localhost:3001 or VITE_API_BASE_URL
 */
export const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001');

/** Build a full URL for a path like `/admin/login`. */
export function apiUrl(path) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
