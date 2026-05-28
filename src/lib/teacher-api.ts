import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500/api";

export const teacherApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

teacherApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("teacher_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

teacherApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/teacher") && !window.location.pathname.includes("/login")) {
        localStorage.removeItem("teacher_token");
        window.location.href = "/teacher/login";
      }
    }
    return Promise.reject(error);
  }
);

export function setTeacherToken(token: string) {
  localStorage.setItem("teacher_token", token);
}

export function clearTeacherToken() {
  localStorage.removeItem("teacher_token");
}
