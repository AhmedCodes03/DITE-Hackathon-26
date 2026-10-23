import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppButton } from "./AppButton";

describe("AppButton", () => {
  it("renders children and icon in non-loading state", () => {
    render(
      <AppButton icon={<span data-testid="icon">*</span>}>
        Save
      </AppButton>
    );

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("shows loading state and disables button", () => {
    render(<AppButton loading>Submit</AppButton>);

    const button = screen.getByRole("button", { name: "Processing..." });
    expect(button).toBeDisabled();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });
});
