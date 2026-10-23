import axios from "axios";
import { env } from "./env.js";
import { STORAGE_KEYS } from "../utils/constants.js";

let unauthorizedCallback = () => {};
let refreshPromise = null;

export function setUnauthorizedCallback(callback) {
  unauthorizedCallback = callback;
}

function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || "";
}

function getRefreshToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN) || "";
}

function setTokens({ accessToken, refreshToken }) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    window.localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, refreshToken);
  }
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  // 30s timeout provides reliable headroom for cloud database operations
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function handleTokenRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  try {
    const response = await axios.post(
      `${env.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { timeout: 10000 }
    );

    if (response.data?.success) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens({ accessToken, refreshToken: newRefreshToken });
      return accessToken;
    }

    throw new Error("Refresh failed");
  } catch (error) {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    throw error;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/register")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Queue a single refresh request and replay blocked 401 calls after token rotation.
      if (!refreshPromise) {
        refreshPromise = handleTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch {
      unauthorizedCallback();
      return Promise.reject(error);
    }
  }
);

export default apiClient;
