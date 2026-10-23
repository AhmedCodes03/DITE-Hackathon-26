import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../stores/authStore";

export function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  if (!isBootstrapped) {
    return <Outlet />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === "doctor") {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (user?.role === "patient") {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return <Outlet />;
}
