import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders pending label", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders no show label", () => {
    render(<StatusBadge status="no_show" />);
    expect(screen.getByText("No Show")).toBeInTheDocument();
  });
});
