import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useDoctorProfile } from "../../features/doctor-profile/hooks/useDoctorProfile";
import { ConfirmationModal } from "../common/ConfirmationModal";
import ErrorBoundary from "../common/ErrorBoundary";

const navLinks = [
  { to: "/admin/dashboard", label: "Admin Console", icon: "admin_panel_settings" },
  { to: "/admin/appointments", label: "Appointments", icon: "calendar_month" },
  { to: "/admin/doctors", label: "Manage Doctors", icon: "stethoscope" },
  { to: "/admin/users", label: "All Users", icon: "group" },
  { to: "/admin/schedule", label: "Schedule Control", icon: "event_note" },
  { to: "/admin/patients", label: "Patient Logs", icon: "history_edu" }
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useDoctorProfile();

  const handleLogout = () => {
    setConfirmLogoutOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setConfirmLogoutOpen(false);
    navigate("/");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      setSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col overflow-y-auto bg-[#0D2B1F] py-8 font-headline shadow-2xl shadow-emerald-950 transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        tabIndex={-1}
        aria-label="Admin sidebar"
      >
        <div className="mb-10 px-3 lg:px-6">
          <div className="flex items-start justify-between gap-2">
            <span className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#7EC143]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "22px" }}>medical_services</span>
              <span>Health Care</span>
            </span>
            <button
              type="button"
              onClick={closeSidebar}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-emerald-100/70 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-emerald-100/40 font-body">ADMIN CONSOLE</p>
          <p className="sr-only">Admin Panel</p>
          <div className="sr-only">{profile?.doctorName || "Doctor"}</div>
        </div>

        <nav className="flex flex-grow flex-col">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeSidebar}
              aria-label={link.to === "/admin/dashboard" ? "Dashboard" : undefined}
              className={({ isActive }) =>
                `group relative flex items-center justify-start gap-6 px-6 py-4 transition-colors ${
                  isActive
                    ? "border-l-4 border-[#7EC143] bg-emerald-900/30 text-[#7EC143]"
                    : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "sidebar-active" : ""}`}>
                    {link.icon}
                  </span>
                  <span className="text-sm font-semibold">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="mt-auto pt-8">
            <NavLink
              to="/admin/settings"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex min-h-[44px] w-full items-center justify-start gap-6 px-6 py-4 transition-colors ${
                  isActive
                    ? "border-l-4 border-[#7EC143] bg-emerald-900/30 text-[#7EC143]"
                    : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "sidebar-active" : ""}`}>
                    settings
                  </span>
                  <span className="text-sm font-semibold">Settings</span>
                </>
              )}
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign Out"
              className="flex min-h-[44px] w-full items-center justify-start gap-6 px-6 py-4 text-emerald-100/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {sidebarOpen ? <button type="button" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={closeSidebar} aria-label="Close sidebar overlay" /> : null}

      <main className="min-h-screen pb-20 lg:ml-[260px] lg:pb-0">
        <div className="sticky top-0 z-30 border-b border-[#BFC9C0] bg-[#F8FAF8] px-4 py-3 shadow-sm lg:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ECEEEC] text-[#191C1B]"
              aria-label="Open sidebar"
            >
              <i className="fa-solid fa-bars text-[18px]" aria-hidden="true" />
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold text-[#191C1B]">{user?.fullName || "Admin"}</p>
              <p className="text-[11px] text-[#3F4943]">Administrator</p>
            </div>
          </div>
        </div>

        <div className="min-h-screen">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      <nav className={`fixed inset-x-0 bottom-0 z-50 h-16 items-center justify-around bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] lg:hidden ${sidebarOpen ? "hidden" : "flex"}`}>
        {[
          { to: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
          { to: "/admin/patients", icon: "groups", label: "Patients" },
          { to: "/admin/appointments", icon: "calendar_today", label: "Appointments" },
          { to: "/admin/doctor-profile", icon: "person", label: "Profile" }
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-xl px-2 transition-all ${
                isActive ? "bg-[#ACF36E] text-[#2E5A00]" : "text-[#4E5E6D]"
              }`
            }
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <footer className="bg-[#0D2B1F] px-8 py-12 font-body border-t border-emerald-900 lg:ml-[260px]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <p className="flex items-center gap-2 text-lg font-bold text-emerald-50">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}>medical_services</span>
              Health Care
            </p>
            <p className="mt-1 text-[10px] text-emerald-100/50">© 2024 Health Care Medical Systems. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <a href="#" className="text-xs text-emerald-100/50 underline underline-offset-4 transition-all hover:text-[#7EC143]">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-emerald-100/50 underline underline-offset-4 transition-all hover:text-[#7EC143]">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-emerald-100/50 underline underline-offset-4 transition-all hover:text-[#7EC143]">
              Healthcare Compliance
            </a>
            <Link to="/contact" className="text-xs text-emerald-100/50 underline underline-offset-4 transition-all hover:text-[#7EC143]">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>

      <ConfirmationModal
        open={confirmLogoutOpen}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        variant="danger"
        onCancel={() => setConfirmLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
