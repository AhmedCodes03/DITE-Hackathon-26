import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "../../../components/common/LoadingState";
import { useAuthStore } from "../../../stores/authStore";

export function RequireRole({ role }) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  if (!isBootstrapped) {
    return (
      <main className="page-container py-10">
        <LoadingState label="Checking your access..." />
      </main>
    );
  }

  if (!token || !user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (user.role !== role) {
    let safeRedirect = "/patient/dashboard";
    if (user.role === "admin") safeRedirect = "/admin/dashboard";
    else if (user.role === "doctor") safeRedirect = "/doctor/dashboard";
    return <Navigate to={safeRedirect} replace />;
  }

  return <Outlet />;
}
