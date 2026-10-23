import { create } from "zustand";
import { STORAGE_KEYS } from "../utils/constants.js";

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || "";
}

function getStoredRefreshToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN) || "";
}

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const userStr = window.localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set, get) => ({
  token: getStoredToken(),
  refreshToken: getStoredRefreshToken(),
  user: getStoredUser(),
  isBootstrapped: false,
  isLoading: false,

  login: ({ token, refreshToken, user }) => {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    window.localStorage.setItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN, refreshToken);
    window.localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    set({ token, refreshToken, user });
  },

  logout: () => {
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN);
    window.localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    set({ token: "", refreshToken: "", user: null, isBootstrapped: true });
  },

  setBootstrapped: (value) => set({ isBootstrapped: value }),

  setUser: (user) => {
    window.localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    set({ user });
  },

  isAuthenticated: () => {
    return !!get().token && !!get().user;
  },

  isAdmin: () => {
    return get().user?.role === "admin";
  },

  isPatient: () => {
    return get().user?.role === "patient";
  }
}));

export default useAuthStore;
