import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingState } from "../../components/common/LoadingState";
import { ShellErrorBoundary } from "../../components/common/ShellErrorBoundary";
import { PublicLayout } from "../../components/layout/PublicLayout";
import { PublicOnlyRoute } from "./guards/PublicOnlyRoute";
import { RequireRole } from "./guards/RequireRole";

const HomePage = lazy(() => import("../../features/public/home/pages/HomePage"));
const AboutPage = lazy(() => import("../../features/public/about/pages/AboutPage"));
const ServicesPage = lazy(() => import("../../features/public/services/pages/ServicesPage"));
const BookAppointmentPage = lazy(() => import("../../features/public/book-appointment/pages/BookAppointmentPage"));
const DoctorsPage = lazy(() => import("../../features/public/doctors/pages/DoctorsPage"));
const ContactPage = lazy(() => import("../../features/public/contact/pages/ContactPage"));
const LoginPage = lazy(() => import("../../features/auth/login/pages/LoginPage"));
const RegisterPage = lazy(() => import("../../features/auth/register/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../../features/auth/forgot-password/pages/ForgotPasswordPage"));

const PatientLayout = lazy(() => import("../../components/layout/PatientLayout").then((m) => ({ default: m.PatientLayout })));
const AdminLayout = lazy(() => import("../../components/layout/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const DoctorLayout = lazy(() => import("../../components/layout/DoctorLayout").then((m) => ({ default: m.DoctorLayout })));

const PatientDashboardPage = lazy(() => import("../../features/patient/dashboard/pages/PatientDashboardPage"));
const PatientProfilePage = lazy(() => import("../../features/patient/profile/pages/PatientProfilePage"));
const PatientAppointmentsPage = lazy(() => import("../../features/patient/appointments/pages/PatientAppointmentsPage"));
const PatientBookAppointmentPage = lazy(() =>
  import("../../features/patient/book-appointment/pages/PatientBookAppointmentPage")
);

const AdminDashboardPage = lazy(() => import("../../features/admin/dashboard/pages/AdminDashboardPage"));
const AdminAppointmentsPage = lazy(() => import("../../features/admin/appointments/pages/AdminAppointmentsPage"));
const AdminPatientsPage = lazy(() => import("../../features/admin/patients/pages/AdminPatientsPage"));
const AdminDoctorsPage = lazy(() => import("../../features/admin/doctors/pages/AdminDoctorsPage"));
const AdminUsersPage = lazy(() => import("../../features/admin/users/pages/AdminUsersPage"));
const AdminSchedulePage = lazy(() => import("../../features/admin/schedule/pages/AdminSchedulePage"));
const AdminDoctorProfilePage = lazy(() =>
  import("../../features/admin/doctor-profile/pages/AdminDoctorProfilePage")
);

const DoctorDashboardPage = lazy(() => import("../../features/doctor/dashboard/pages/DoctorDashboardPage"));
const DoctorAppointmentsPage = lazy(() => import("../../features/doctor/appointments/pages/DoctorAppointmentsPage"));
const DoctorProfilePage = lazy(() => import("../../features/doctor/profile/pages/DoctorProfilePage"));

function SuspendedPage({ children }) {
  return <Suspense fallback={<LoadingState label="Loading page..." className="m-6" />}>{children}</Suspense>;
}

function PublicShell() {
  return (
    <ShellErrorBoundary>
      <PublicLayout />
    </ShellErrorBoundary>
  );
}

function PatientShell() {
  return (
    <ShellErrorBoundary>
      <Suspense fallback={<LoadingState label="Loading layout..." className="m-6" />}>
        <PatientLayout />
      </Suspense>
    </ShellErrorBoundary>
  );
}

function DoctorShell() {
  return (
    <ShellErrorBoundary>
      <Suspense fallback={<LoadingState label="Loading layout..." className="m-6" />}>
        <DoctorLayout />
      </Suspense>
    </ShellErrorBoundary>
  );
}

function AdminShell() {
  return (
    <ShellErrorBoundary>
      <Suspense fallback={<LoadingState label="Loading layout..." className="m-6" />}>
        <AdminLayout />
      </Suspense>
    </ShellErrorBoundary>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<SuspendedPage><HomePage /></SuspendedPage>} />
        <Route path="/about" element={<SuspendedPage><AboutPage /></SuspendedPage>} />
        <Route path="/services" element={<SuspendedPage><ServicesPage /></SuspendedPage>} />
        <Route path="/doctors" element={<SuspendedPage><DoctorsPage /></SuspendedPage>} />
        <Route path="/book-appointment" element={<SuspendedPage><BookAppointmentPage /></SuspendedPage>} />
        <Route path="/contact" element={<SuspendedPage><ContactPage /></SuspendedPage>} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<SuspendedPage><LoginPage /></SuspendedPage>} />
          <Route path="/register" element={<SuspendedPage><RegisterPage /></SuspendedPage>} />
          <Route path="/forgot-password" element={<SuspendedPage><ForgotPasswordPage /></SuspendedPage>} />
        </Route>
      </Route>

      {/* Patient Routes */}
      <Route element={<RequireRole role="patient" />}>
        <Route element={<PatientShell />}>
          <Route path="/patient/dashboard" element={<SuspendedPage><PatientDashboardPage /></SuspendedPage>} />
          <Route path="/patient/profile" element={<SuspendedPage><PatientProfilePage /></SuspendedPage>} />
          <Route path="/patient/settings" element={<Navigate to="/patient/profile" replace />} />
          <Route
            path="/patient/appointments"
            element={<SuspendedPage><PatientAppointmentsPage /></SuspendedPage>}
          />
          <Route
            path="/patient/book-appointment"
            element={<SuspendedPage><PatientBookAppointmentPage /></SuspendedPage>}
          />
          <Route
            path="/patient/bookappointment"
            element={<SuspendedPage><PatientBookAppointmentPage /></SuspendedPage>}
          />
        </Route>
      </Route>

      {/* Doctor Routes */}
      <Route element={<RequireRole role="doctor" />}>
        <Route element={<DoctorShell />}>
          <Route path="/doctor/dashboard" element={<SuspendedPage><DoctorDashboardPage /></SuspendedPage>} />
          <Route path="/doctor/appointments" element={<SuspendedPage><DoctorAppointmentsPage /></SuspendedPage>} />
          <Route path="/doctor/profile" element={<SuspendedPage><DoctorProfilePage /></SuspendedPage>} />
          <Route path="/doctor/settings" element={<Navigate to="/doctor/profile" replace />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<RequireRole role="admin" />}>
        <Route element={<AdminShell />}>
          <Route path="/admin/dashboard" element={<SuspendedPage><AdminDashboardPage /></SuspendedPage>} />
          <Route path="/admin/appointments" element={<SuspendedPage><AdminAppointmentsPage /></SuspendedPage>} />
          <Route path="/admin/patients" element={<SuspendedPage><AdminPatientsPage /></SuspendedPage>} />
          <Route path="/admin/doctors" element={<SuspendedPage><AdminDoctorsPage /></SuspendedPage>} />
          <Route path="/admin/users" element={<SuspendedPage><AdminUsersPage /></SuspendedPage>} />
          <Route path="/admin/schedule" element={<SuspendedPage><AdminSchedulePage /></SuspendedPage>} />
          <Route
            path="/admin/doctor-profile"
            element={<SuspendedPage><AdminDoctorProfilePage /></SuspendedPage>}
          />
          <Route
            path="/admin/settings"
            element={<SuspendedPage><AdminDoctorProfilePage /></SuspendedPage>}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
