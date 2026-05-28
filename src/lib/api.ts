import axios from "axios";

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500/api";
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
const apiBaseUrl = normalizedApiUrl.endsWith("/api")
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (
        window.location.pathname.startsWith("/admin") &&
        !window.location.pathname.includes("/login")
      ) {
        localStorage.removeItem("token");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
