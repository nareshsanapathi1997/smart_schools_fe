import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500/api";

export const portalApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

portalApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("portal_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

portalApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/portal") && !window.location.pathname.includes("/login")) {
        localStorage.removeItem("portal_token");
        window.location.href = "/portal/login";
      }
    }
    return Promise.reject(error);
  }
);
