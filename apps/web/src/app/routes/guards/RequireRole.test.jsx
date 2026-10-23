import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireRole } from "./RequireRole";
import { useAuthStore } from "../../../stores/authStore";

function renderGuard(role, initialEntry = "/patient/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<RequireRole role={role} />}>
          <Route path="/patient/dashboard" element={<div>Patient content</div>} />
        </Route>
        <Route path="/admin/dashboard" element={<div>Admin content</div>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RequireRole", () => {
  it("redirects unauthenticated users to login", async () => {
    useAuthStore.setState({ token: "", user: null, isBootstrapped: true });

    renderGuard("patient");
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("redirects wrong role users", async () => {
    useAuthStore.setState({
      token: "token",
      user: { id: "u_admin", role: "admin" },
      isBootstrapped: true
    });

    renderGuard("patient");
    expect(await screen.findByText("Admin content")).toBeInTheDocument();
  });
});
