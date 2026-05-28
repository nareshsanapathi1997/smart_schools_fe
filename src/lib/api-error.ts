import type { AxiosError } from "axios";
import api from "@/lib/api";

type ApiErrorBody = {
  message?: string;
  errors?: Array<{ msg?: string; message?: string }>;
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const ax = error as AxiosError<ApiErrorBody>;
  if (ax?.message === "Network Error") {
    return "Cannot reach the server. Make sure the backend is running on port 4500.";
  }
  const errors = ax?.response?.data?.errors;
  if (errors?.length) {
    return errors.map((e) => e.msg || e.message).filter(Boolean).join(", ");
  }
  if (ax?.response?.data?.message) return ax.response.data.message;
  return fallback;
}

export async function downloadCsv(endpoint: string, filename: string) {
  const res = await api.get(endpoint, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
