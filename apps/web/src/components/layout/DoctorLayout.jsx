import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { ConfirmationModal } from "../common/ConfirmationModal";
import ErrorBoundary from "../common/ErrorBoundary";

const navLinks = [
  { to: "/doctor/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/doctor/appointments", label: "My Appointments", icon: "calendar_month" },
  { to: "/doctor/profile", label: "Doctor Profile", icon: "badge" }
];

export function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    setConfirmLogoutOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setConfirmLogoutOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col overflow-y-auto bg-[#073623] py-8 font-headline shadow-2xl transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 px-6">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#7EC143]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "24px" }}>
                medical_services
              </span>
              <span>Health Care</span>
            </span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-emerald-100/70 hover:text-white lg:hidden"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block rounded bg-[#7EC143]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#7EC143]">
              Doctor Portal
            </span>
          </div>
        </div>

        {/* Doctor Info Card */}
        <div className="mx-4 mb-6 rounded-2xl bg-white/5 p-4 border border-white/10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7EC143] text-[#073623] font-bold">
              <span className="material-symbols-outlined text-xl">stethoscope</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{user?.fullName || "Doctor"}</p>
              <p className="truncate text-[11px] text-emerald-200/80">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-grow flex-col">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-3.5 transition-colors ${
                  isActive
                    ? "border-l-4 border-[#7EC143] bg-emerald-900/40 text-[#7EC143] font-bold"
                    : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              <span className="text-xs">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-xs font-bold text-emerald-200 hover:bg-red-500/20 hover:text-red-300 transition"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-6 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-gray-500">Logged in as</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#005235]">
              {user?.fullName || "Doctor"}
            </span>
          </div>
        </header>

        {/* Page View */}
        <main className="flex-1 p-6 lg:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <ConfirmationModal
        isOpen={confirmLogoutOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of the Doctor Portal?"
        confirmLabel="Sign Out"
        onConfirm={confirmLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </div>
  );
}
