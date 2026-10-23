import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCountUp } from "./useCountUp";

describe("useCountUp", () => {
  let observedCallback;
  let disconnectMock;

  beforeEach(() => {
    vi.useFakeTimers();

    disconnectMock = vi.fn();

    global.IntersectionObserver = class {
      constructor(callback) {
      observedCallback = callback;
      }

      observe() {}

      disconnect() {
        disconnectMock();
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("animates to target with suffix when intersecting", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      setTimeout(() => cb(performance.now() + 2000), 0);
      return 1;
    });

    const { result } = renderHook(() => useCountUp("120+", 100));

    result.current.ref.current = document.createElement("div");

    act(() => {
      observedCallback([{ isIntersecting: true }]);
      vi.runAllTimers();
    });

    expect(rafSpy).toHaveBeenCalled();
    expect(result.current.value.endsWith("+")).toBe(true);
  });

  it("disconnects observer on unmount", () => {
    const { unmount } = renderHook(() => useCountUp("50", 100));

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });
});
