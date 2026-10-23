import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PublicLayout } from "./PublicLayout";
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

afterEach(() => {
  cleanup();
});

function renderPublic(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<div>Home content</div>} />
          <Route path="/login" element={<div>Login content</div>} />
          <Route path="/register" element={<div>Register content</div>} />
          <Route path="/book-appointment" element={<div>Book content</div>} />
          <Route path="/about" element={<div>About content</div>} />
          <Route path="/services" element={<div>Services content</div>} />
          <Route path="/contact" element={<div>Contact content</div>} />
          <Route path="/patient/dashboard" element={<div>Patient dashboard</div>} />
          <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("PublicLayout", () => {
  it("shows login/register for guests", () => {
    useAuthStore.setState({ user: null, token: "", isBootstrapped: true });
    renderPublic();

    expect(screen.getAllByRole("link", { name: "Sign In" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Book Appointment" }).length).toBeGreaterThan(0);
  });

  it("shows dashboard/logout for authenticated users", () => {
    useAuthStore.setState({
      user: { id: "u1", role: "patient", fullName: "Ali" },
      token: "token",
      isBootstrapped: true
    });

    renderPublic();

    expect(screen.getAllByRole("button", { name: "Dashboard" }).length).toBeGreaterThan(0);
    const logoutButtons = screen.getAllByRole("button", { name: "Logout" });
    fireEvent.click(logoutButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(useAuthStore.getState().user).toBeNull();
  });
});
