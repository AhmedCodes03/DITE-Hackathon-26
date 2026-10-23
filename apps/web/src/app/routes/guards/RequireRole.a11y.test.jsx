import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { axe } from "jest-axe";
import { RequireRole } from "./RequireRole";
import { useAuthStore } from "../../../stores/authStore";

describe("RequireRole accessibility", () => {
  it("has no detectable accessibility violations in loading state", async () => {
    useAuthStore.setState({ token: "", user: null, isBootstrapped: false });

    const { container } = render(
      <MemoryRouter initialEntries={["/patient/dashboard"]}>
        <Routes>
          <Route element={<RequireRole role="patient" />}>
            <Route path="/patient/dashboard" element={<div>Protected content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
