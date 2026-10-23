import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../features/auth/api/auth.api.js";
import { setUnauthorizedCallback } from "../../services/apiClient.js";
import { useAuthStore } from "../../stores/authStore.js";
import { appendRedirectParam } from "../../utils/helpers.js";

export function AuthBootstrap() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);

  useEffect(() => {
    setUnauthorizedCallback(() => {
      logout();
      const target = appendRedirectParam(location.pathname, location.search);
      navigate(target, { replace: true });
    });
  }, [logout, location.pathname, location.search, navigate]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!token) {
        if (active) {
          setBootstrapped(true);
        }
        return;
      }

      try {
        const result = await authApi.me();
        if (active) {
          setUser(result.data);
        }
      } catch (err) {
        if (active && err?.response?.status === 401) {
          logout();
        }
      } finally {
        if (active) {
          setBootstrapped(true);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [logout, setBootstrapped, setUser, token]);

  return null;
}
