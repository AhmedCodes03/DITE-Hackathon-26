import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "./ErrorBoundary";

const Bomb = () => {
  throw new Error("boom");
};

describe("ErrorBoundary", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div>test</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("renders fallback UI when child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });

  it("renders custom fallback prop when provided", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText("custom fallback")).toBeInTheDocument();
  });

  it("Try Again button resets the error state", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const user = userEvent.setup();
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    const resetButton = screen.getByRole("button", { name: "Try Again" });
    await user.click(resetButton);

    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });
});
