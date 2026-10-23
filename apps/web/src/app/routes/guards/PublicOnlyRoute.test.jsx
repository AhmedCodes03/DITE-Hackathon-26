import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { useAuthStore } from "../../../stores/authStore";

function renderPublicOnly(initialEntry = "/login") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div>Public auth page</div>} />
        </Route>
        <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
        <Route path="/patient/dashboard" element={<div>Patient dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PublicOnlyRoute", () => {
  it("shows public page when auth bootstrap has not completed", async () => {
    useAuthStore.setState({ isBootstrapped: false, user: null, token: "" });

    renderPublicOnly();
    expect(await screen.findByText("Public auth page")).toBeInTheDocument();
  });

  it("redirects admin users away from public auth pages", async () => {
    useAuthStore.setState({ isBootstrapped: true, user: { id: "u_admin", role: "admin" }, token: "token" });

    renderPublicOnly();
    expect(await screen.findByText("Admin dashboard")).toBeInTheDocument();
  });

  it("redirects patient users away from public auth pages", async () => {
    useAuthStore.setState({ isBootstrapped: true, user: { id: "u_patient", role: "patient" }, token: "token" });

    renderPublicOnly();
    expect(await screen.findByText("Patient dashboard")).toBeInTheDocument();
  });
});
