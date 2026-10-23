import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { RequireRole } from "./RequireRole";
import { useAuthStore } from "../../../stores/authStore";

function LoginEcho() {
  const location = useLocation();
  return <div>Login page {location.search}</div>;
}

describe("RequireRole redirect params", () => {
  it("preserves path and search query in login redirect for unauthenticated access", async () => {
    useAuthStore.setState({ token: "", user: null, isBootstrapped: true });

    render(
      <MemoryRouter initialEntries={["/patient/dashboard?tab=history"]}>
        <Routes>
          <Route element={<RequireRole role="patient" />}>
            <Route path="/patient/dashboard" element={<div>Protected content</div>} />
          </Route>
          <Route path="/login" element={<LoginEcho />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Login page \?redirect=%2Fpatient%2Fdashboard%3Ftab%3Dhistory/i)
    ).toBeInTheDocument();
  });
});
