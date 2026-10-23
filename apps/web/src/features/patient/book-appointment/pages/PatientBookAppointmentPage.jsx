import BookAppointmentPage from "../../../public/book-appointment/pages/BookAppointmentPage";

export default function PatientBookAppointmentPage() {
  return <BookAppointmentPage redirectOnCloseTo="/patient/dashboard" redirectOnSuccessTo="/patient/dashboard" />;
}
