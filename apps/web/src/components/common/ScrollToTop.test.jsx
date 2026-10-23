import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./ScrollToTop";

describe("ScrollToTop", () => {
  it("scrolls window to top when route mounts", () => {
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<div>Page A</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });

    scrollSpy.mockRestore();
  });
});
