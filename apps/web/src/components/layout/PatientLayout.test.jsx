import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PatientLayout } from "./PatientLayout";
import { useAuthStore } from "../../stores/authStore";

vi.mock("../../features/doctor-profile/hooks/useDoctorProfile", () => ({
  useDoctorProfile: () => ({ data: null })
}));

vi.mock("../common/ConfirmationModal", () => ({
  ConfirmationModal: ({ open, onConfirm, onCancel, confirmLabel = "Confirm", cancelLabel = "Cancel" }) =>
    open ? (
      <div>
        <button type="button" onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" onClick={onCancel}>{cancelLabel}</button>
      </div>
    ) : null
}));

function renderPatient(path = "/patient/dashboard") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PatientLayout />}>
          <Route path="/patient/dashboard" element={<div>Dashboard content</div>} />
          <Route path="/patient/profile" element={<div>Profile content</div>} />
          <Route path="/patient/settings" element={<div>Settings content</div>} />
          <Route path="/patient/appointments" element={<div>Appointments content</div>} />
          <Route path="/patient/book-appointment" element={<div>Book content</div>} />
          <Route path="/patient/bookappointment" element={<div>Book content</div>} />
        </Route>
        <Route path="/login" element={<div>Login content</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PatientLayout", () => {
  it("renders navigation and logout", () => {
    useAuthStore.setState({
      user: { id: "u_patient", role: "patient", fullName: "Ali" },
      token: "token",
      isBootstrapped: true
    });

    renderPatient();

    expect(screen.getByText("HealthCare Portal")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Profile/i }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(useAuthStore.getState().user).toBeNull();
  });
});
