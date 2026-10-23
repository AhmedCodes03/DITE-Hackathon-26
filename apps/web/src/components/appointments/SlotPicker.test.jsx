import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SlotPicker } from "./SlotPicker";

describe("SlotPicker", () => {
  it("renders no slots message", () => {
    render(<SlotPicker slots={[]} value="" onChange={vi.fn()} />);
    expect(screen.getByText(/No slots available/i)).toBeInTheDocument();
  });

  it("supports radio semantics and selection", () => {
    const onChange = vi.fn();
    render(
      <SlotPicker
        slots={[{ startTime: "09:00", endTime: "09:30" }]}
        value=""
        onChange={onChange}
      />
    );

    const option = screen.getByRole("radio", { name: /9:00/i });
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
