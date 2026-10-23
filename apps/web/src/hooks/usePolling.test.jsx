import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { usePolling } from "./usePolling";

function PollingHarness({ callback, enabled = true }) {
  usePolling(callback, 1000, enabled);
  return null;
}

describe("usePolling", () => {
  it("calls callback on interval when enabled", () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    render(<PollingHarness callback={callback} />);
    vi.advanceTimersByTime(3000);

    expect(callback).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it("does not call callback when disabled", () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    render(<PollingHarness callback={callback} enabled={false} />);
    vi.advanceTimersByTime(3000);

    expect(callback).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
