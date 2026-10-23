import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
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

function renderAdmin(path = "/admin/dashboard") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<div>Admin dashboard content</div>} />
          <Route path="/admin/appointments" element={<div>Admin appointments content</div>} />
          <Route path="/admin/patients" element={<div>Admin patients content</div>} />
          <Route path="/admin/schedule" element={<div>Admin schedule content</div>} />
          <Route path="/admin/doctor-profile" element={<div>Admin profile content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminLayout", () => {
  it("renders menu and allows logout", () => {
    useAuthStore.setState({
      user: { id: "u_admin", role: "admin", fullName: "Admin" },
      token: "token",
      isBootstrapped: true
    });

    renderAdmin();

    expect(screen.getByText("ADMIN CONSOLE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /open sidebar/i }));
    expect(screen.getAllByRole("link", { name: "Dashboard" }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: "Sign Out" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Sign Out" })[1]);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
