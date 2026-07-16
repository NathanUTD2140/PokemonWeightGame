import axios from "axios";
import { apiUrl } from "./apiBaseUrl.js";
// Import mock setup

const api = axios.create({
  withCredentials: true,
});

// Resolve paths through apiUrl so production uses /api/... (Vercel proxy)
api.interceptors.request.use((config) => {
  const { url } = config;
  if (url && !/^https?:\/\//i.test(url)) {
    const path = url.startsWith("/") ? url : `/${url}`;
    return { ...config, url: apiUrl(path), baseURL: "" };
  }
  return config;
});

export default api;
