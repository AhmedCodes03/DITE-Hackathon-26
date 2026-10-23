import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShellErrorBoundary } from "./ShellErrorBoundary";

function ThrowingComponent() {
  throw new Error("Boom");
}

describe("ShellErrorBoundary", () => {
  it("renders fallback UI when child crashes", () => {
    const originalError = console.error;
    console.error = () => {};

    render(
      <ShellErrorBoundary>
        <ThrowingComponent />
      </ShellErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    console.error = originalError;
  });
});
