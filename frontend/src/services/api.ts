import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { publicApiUrl } from "@/lib/env";

export const api = axios.create({
  baseURL: publicApiUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    const token = m?.[1] ? decodeURIComponent(m[1]) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      if (typeof document !== "undefined") {
        document.cookie =
          "access_token=; path=/; max-age=0; samesite=lax";
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);
