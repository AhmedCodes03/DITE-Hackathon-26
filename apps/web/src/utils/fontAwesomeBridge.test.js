import { describe, expect, it, beforeEach } from "vitest";
import { initFontAwesomeBridge } from "./fontAwesomeBridge";

describe("initFontAwesomeBridge", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("replaces existing material icon content with font-awesome classes", () => {
    document.body.innerHTML = '<span class="material-symbols-outlined">calendar_today</span>';

    initFontAwesomeBridge();

    const icon = document.querySelector(".material-symbols-outlined");
    expect(icon).toBeTruthy();
    expect(icon.classList.contains("fa-solid")).toBe(true);
    expect(icon.classList.contains("fa-calendar-days")).toBe(true);
    expect(icon.classList.contains("fa-fw")).toBe(true);
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.textContent).toBe("");
  });

  it("applies classes to dynamically added material icons", async () => {
    initFontAwesomeBridge();

    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.textContent = "menu";
    document.body.appendChild(icon);

    await Promise.resolve();

    expect(icon.classList.contains("fa-solid")).toBe(true);
    expect(icon.classList.contains("fa-bars")).toBe(true);
    expect(icon.classList.contains("fa-bridge-menu")).toBe(true);
    expect(icon.dataset.faIcon).toBe("menu");
  });
});
