import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { ConfirmationModal } from "./ConfirmationModal";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { SectionHeading } from "./SectionHeading";
import { Seo } from "./Seo";
import { StatCard } from "./StatCard";

vi.mock("focus-trap-react", () => ({
  default: ({ children }) => <div>{children}</div>
}));

describe("Common components", () => {
  it("renders empty and error states with actions", () => {
    const onAction = vi.fn();
    const onRetry = vi.fn();

    render(
      <>
        <EmptyState title="Nothing" description="No data" actionLabel="Create" onAction={onAction} />
        <ErrorState title="Error" description="Failed" onRetry={onRetry} />
      </>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(onAction).toHaveBeenCalled();
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders heading, loading and stat card", () => {
    render(
      <>
        <SectionHeading eyebrow="Intro" title="Title" subtitle="Subtitle" />
        <LoadingState label="Loading now" />
        <StatCard label="Count" value={4} hint="Hint" />
      </>
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Loading now")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders confirmation modal and seo tags", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <HelmetProvider>
        <Seo title="Page Title" description="Page Description" path="/sample" />
        <ConfirmationModal
          open
          title="Confirm"
          message="Are you sure"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.title).toContain("Page Title");
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
  });
});
