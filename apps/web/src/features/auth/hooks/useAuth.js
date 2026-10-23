import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api.js";
import { useAuthStore } from "../../../stores/authStore.js";
import { STORAGE_KEYS } from "../../../utils/constants.js";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        login({ token: accessToken, refreshToken, user });

        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/patient/dashboard");
        }

        return response.data;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (err) {
      const rawMessage = err.response?.data?.message || err.message || "";
      const message =
        err.code === "ECONNABORTED" || rawMessage.toLowerCase().includes("timeout")
          ? "Connection timed out. The server took longer than expected. Please try again."
          : rawMessage || "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate]);

  return { handleLogin, isLoading, error, clearError: () => setError(null) };
}

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleRegister = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register(userData);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        login({ token: accessToken, refreshToken, user });

        navigate("/patient/dashboard");

        return response.data;
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (err) {
      const rawMessage = err.response?.data?.message || err.message || "";
      const message =
        err.code === "ECONNABORTED" || rawMessage.toLowerCase().includes("timeout")
          ? "Connection timed out. The server took longer than expected. Please try again."
          : rawMessage || "Registration failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate]);

  return { handleRegister, isLoading, error, clearError: () => setError(null) };
}

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // ignore logout network failures and clear local auth state
    } finally {
      logout();
      navigate("/");
      setIsLoading(false);
    }
  }, [logout, navigate]);

  return { handleLogout, isLoading };
}

export function useAuthBootstrap() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { login, logout, setBootstrapped, token } = useAuthStore();

  const bootstrap = useCallback(async () => {
    if (!token) {
      setBootstrapped(true);
      setIsLoading(false);
      return false;
    }

    try {
      const response = await authApi.me();

      if (response.success && response.data) {
        login({
          token,
          refreshToken: window.localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH_TOKEN) || "",
          user: response.data
        });
        setBootstrapped(true);
        return true;
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (err) {
      setError(err.message);
      logout();
      setBootstrapped(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token, login, logout, setBootstrapped]);

  return { bootstrap, isLoading, error };
}
