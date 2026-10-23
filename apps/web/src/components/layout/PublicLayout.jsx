import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useDoctorProfile } from "../../features/doctor-profile/hooks/useDoctorProfile";
import { ConfirmationModal } from "../common/ConfirmationModal";
import ErrorBoundary from "../common/ErrorBoundary";
import { AiChatWidget } from "../../features/ai-assistant/components/AiChatWidget.jsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/doctors", label: "Find Doctors" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact Us" }
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { data: doctorProfile } = useDoctorProfile();
  const isHomeRoute = location.pathname === "/";
  const doctorName = doctorProfile?.doctorName || "Doctor";
  const doctorSpecialty = doctorProfile?.specialty || "Specialist";

  const headerClassName = isHomeRoute
    ? "fixed left-0 right-0 top-0 z-50 w-full bg-emerald-950/80 backdrop-blur-xl shadow-[0_12px_32px_rgba(13,31,26,0.08)]"
    : "fixed left-0 right-0 top-0 z-50 w-full glass-nav border-b border-[#D6EEE7]/70 shadow-sm";

  const handleLogout = () => {
    setConfirmLogoutOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setConfirmLogoutOpen(false);
    navigate("/");
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (mobileMenuRef.current?.contains(target)) return;
      if (menuButtonRef.current?.contains(target)) return;
      setMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <header className={headerClassName}>
        <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className={`flex items-center gap-2 font-headline text-xl font-bold tracking-tight ${isHomeRoute ? "text-white" : "text-[#1A6B4A]"}`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            Health Care
          </NavLink>

          <div className="hidden items-center space-x-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                    `font-headline border-b-2 pb-1 text-sm font-bold tracking-tight transition-colors duration-300 ${
                    isActive
                      ? isHomeRoute
                        ? "border-lime-400 text-lime-400"
                        : "border-[#1A6B4A] text-[#1A6B4A]"
                      : isHomeRoute
                        ? "border-transparent text-white/80 hover:text-lime-400"
                        : "border-transparent text-slate-600 hover:text-emerald-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <button
                  onClick={() => navigate(user.role === "admin" ? "/admin/dashboard" : "/patient/dashboard")}
                  className={`font-body px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isHomeRoute ? "text-white/90 hover:text-lime-400" : "text-[#1A6B4A] hover:text-emerald-700"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className={`font-headline min-h-[44px] rounded-[10px] px-6 py-2.5 text-sm font-bold transition-all ${
                    isHomeRoute
                      ? "scale-95 bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] text-[#0D2000] hover:brightness-95"
                      : "bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] text-[#0D2000] hover:brightness-95"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={`font-body px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isHomeRoute ? "text-white/90 hover:text-lime-400" : "text-[#1A6B4A] hover:text-emerald-700"
                  }`}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/book-appointment"
                  className={`font-headline min-h-[44px] rounded-[10px] px-6 py-2.5 text-sm font-bold transition-all ${
                    isHomeRoute
                      ? "scale-95 bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] text-[#0D2000] hover:brightness-95"
                      : "bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] text-[#0D2000] hover:brightness-95"
                  }`}
                >
                  Book Appointment
                </NavLink>
              </>
            )}
          </div>

          <div className="hidden md:flex lg:hidden items-center gap-2">
            <button
              ref={menuButtonRef}
              onClick={() => setMobileMenuOpen((value) => !value)}
              className={`flex h-11 w-11 items-center justify-center rounded-lg transition-transform active:scale-95 ${
                isHomeRoute ? "bg-white/10" : "bg-[#F2F4F2]"
              }`}
              aria-label="Toggle menu"
            >
              <i className={`fa-solid fa-bars text-[18px] ${isHomeRoute ? "text-white" : "text-[#005235]"}`} aria-hidden="true" />
            </button>
            <NavLink
              to="/book-appointment"
              className="font-headline min-h-[44px] rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-2.5 text-sm font-bold text-[#0D2000] transition-all hover:brightness-95"
            >
              Book Appointment
            </NavLink>
          </div>

          <button
            onClick={() => setMobileMenuOpen((value) => !value)}
            className={`flex h-11 w-11 items-center justify-center rounded-lg transition-transform active:scale-95 md:hidden ${
              isHomeRoute ? "bg-white/10" : "bg-[#F2F4F2]"
            }`}
            aria-label="Toggle menu"
          >
            <i className={`fa-solid fa-bars text-[18px] ${isHomeRoute ? "text-white" : "text-[#005235]"}`} aria-hidden="true" />
          </button>
        </nav>

        <div
          ref={mobileMenuRef}
          className={`overflow-hidden border-t border-[#BFC9C0]/30 bg-white shadow-lg transition-all duration-300 lg:hidden ${
            mobileMenuOpen ? "max-h-[520px] translate-y-0 opacity-100" : "max-h-0 -translate-y-2 opacity-0"
          }`}
        >
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `border-b border-[#BFC9C0]/20 px-6 py-4 font-body text-sm ${
                    isActive ? "bg-[#ECEEEC] text-[#005235]" : "text-slate-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate(user.role === "admin" ? "/admin/dashboard" : "/patient/dashboard");
                  }}
                  className="min-h-[44px] border-b border-[#BFC9C0]/20 px-6 py-4 text-left font-body text-sm text-slate-700"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="min-h-[44px] border-b border-[#BFC9C0]/20 px-6 py-4 text-left font-body text-sm text-slate-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="min-h-[44px] border-b border-[#BFC9C0]/20 px-6 py-4 font-body text-sm text-slate-700"
              >
                Sign In
              </NavLink>
            )}

            <div className="p-4">
              <NavLink
                to="/book-appointment"
                className="font-headline flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-3 text-sm font-bold text-[#0D2000] transition-all hover:brightness-95"
              >
                Book Appointment
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      <main className={`overflow-x-clip ${isHomeRoute ? "" : "pt-[76px]"}`}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="w-full bg-emerald-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center text-center md:items-center md:text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
          <div className="order-1">
            <span className="mb-2 flex items-center justify-center gap-2 font-headline text-lg font-bold text-white lg:justify-start">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              Health Care
            </span>
          </div>

          <div className="order-2 mt-8 flex flex-col items-center gap-4 md:mt-0 lg:items-start">
            <a href="#" className="font-body text-sm text-emerald-100/60 opacity-80 transition-all hover:text-lime-400 hover:opacity-100">
              Privacy Policy
            </a>
            <a href="#" className="font-body text-sm text-emerald-100/60 opacity-80 transition-all hover:text-lime-400 hover:opacity-100">
              Terms of Service
            </a>
            <a href="#" className="font-body text-sm text-emerald-100/60 opacity-80 transition-all hover:text-lime-400 hover:opacity-100">
              HIPAA Compliance
            </a>
          </div>

          <div className="order-3 mt-8 flex items-center gap-4 md:mt-0">
            <a href="#" aria-label="Facebook" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-emerald-100/70 transition-all hover:bg-white/10 hover:text-lime-400">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </a>
            <a href="#" aria-label="Instagram" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-emerald-100/70 transition-all hover:bg-white/10 hover:text-lime-400">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </a>
            <a href="#" aria-label="LinkedIn" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-emerald-100/70 transition-all hover:bg-white/10 hover:text-lime-400">
              <span className="material-symbols-outlined text-[20px]">business</span>
            </a>
          </div>

          <p className="order-4 mt-8 max-w-sm font-body text-sm text-emerald-100/60 md:mt-0">
            © 2024 Health Care Medical. All rights reserved. {doctorName}, {doctorSpecialty}.
          </p>
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

      <AiChatWidget />
    </div>
  );
}
