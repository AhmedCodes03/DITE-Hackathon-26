import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { ConfirmationModal } from "../common/ConfirmationModal";
import ErrorBoundary from "../common/ErrorBoundary";
import { AiChatWidget } from "../../features/ai-assistant/components/AiChatWidget.jsx";

const navLinks = [
  { to: "/patient/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/patient/book-appointment", label: "Book Appointment", icon: "add_circle" },
  { to: "/patient/appointments", label: "Appointments", icon: "calendar_today" },
  { to: "/doctors", label: "Find Doctors", icon: "stethoscope" },
  { to: "/patient/profile", label: "Profile", icon: "person" }
];

export function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = useMemo(() => {
    const fullName = user?.fullName || "Patient";
    return fullName
      .split(" ")
      .map((token) => token[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.fullName]);

  const handleLogout = () => {
    setConfirmLogoutOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setConfirmLogoutOpen(false);
    navigate("/");
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#F3F5F4] text-[#191C1B]">
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col overflow-y-auto bg-[#EFF1F1] py-7 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:w-[260px] lg:translate-x-0`}
      >
        <div className="px-4 lg:px-8">
          <div className="flex items-start justify-between gap-2">
            <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-xl bg-[#016440] text-white">
              <span className="material-symbols-outlined p-0.5 text-[25px]">medical_services</span>
            </div>
            <h1 className="font-headline text-center text-[26px] font-bold leading-[0.92] text-[#016440] lg:text-left">HealthCare Portal</h1>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#4E5E6D] lg:hidden"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <nav className="mt-12 flex-1 px-2 lg:px-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to} className="group relative">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center justify-start rounded-xl px-4 py-3.5 text-left transition-all ${
                      isActive
                        ? "bg-[#A8EA64] font-bold text-[#2E5A00]"
                        : "text-[#4E5E6D] hover:bg-white/80 hover:text-[#1A6B4A]"
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                  <span className="font-headline text-[15px] leading-none">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[#D4DBD8] px-3 pb-24 pt-6 lg:px-6 lg:pb-6">
          <Link
            to="/patient/bookappointment"
            className="flex min-h-[44px] w-full items-center justify-center whitespace-nowrap rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-4 font-headline text-[14px] font-bold text-[#0D2000] transition-all hover:brightness-95"
          >
            Book Appointment
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex min-h-[44px] min-w-[44px] items-center justify-start gap-3 text-left font-headline text-sm text-[#4E5E6D] transition-colors hover:text-[#1A6B4A]"
            aria-label="Sign out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen ? <button type="button" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Close sidebar overlay" /> : null}

      <main className="flex-1 pb-20 lg:ml-[260px] lg:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#DFE4E1] bg-[#F3F5F4] px-4 py-4 shadow-sm sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#E8ECEA] text-[#0A5B3E] lg:hidden"
              aria-label="Open sidebar"
            >
              <i className="fa-solid fa-bars text-[18px]" aria-hidden="true" />
            </button>
            <h2 className="font-headline text-[22px] font-bold text-[#00613D]">Botanical Precision</h2>
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative hidden md:block">
              <input
                id="patient-layout-search"
                type="text"
                placeholder="Search records..."
                aria-label="Search patient records"
                className="h-[50px] w-80 rounded-full border-none bg-[#E8ECEA] py-2 pl-12 pr-6 text-[14px] text-[#6A7783] focus:ring-1 focus:ring-[#005235]"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#6A7783]">search</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/patient/appointments")}
              aria-label="Notifications"
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-[#0A5B3E] transition-colors hover:bg-[#E4E8E6]"
            >
              <span className="material-symbols-outlined text-[26px]">notifications</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/contact")}
              aria-label="Messages"
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-[#0A5B3E] transition-colors hover:bg-[#E4E8E6]"
            >
              <span className="material-symbols-outlined text-[25px]">mail</span>
            </button>

            <div className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#66D2AC] bg-[#EAF1EE] font-semibold text-[#1A6B4A]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"
                alt={user?.fullName || "Patient"}
                className="h-full w-full object-cover"
              />
              <span className="sr-only">{initials}</span>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1360px]">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <nav className={`fixed inset-x-0 bottom-0 z-50 h-16 items-center justify-around bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] lg:hidden ${sidebarOpen ? "hidden" : "flex"}`}>
        {[
          { to: "/patient/dashboard", icon: "dashboard", label: "Dashboard" },
          { to: "/patient/appointments", icon: "calendar_today", label: "Appointments" },
          { to: "/patient/profile", icon: "person", label: "Profile" }
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

      <AiChatWidget />
    </div>
  );
}
