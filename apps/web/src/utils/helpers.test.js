import { describe, expect, it } from "vitest";
import {
  appendRedirectParam,
  dayOfWeekFromISO,
  formatDate,
  formatTime,
  getStatusTone,
  safeJsonParse,
  toMinutes,
  toTimeString,
  todayISODate
} from "./helpers";

describe("helpers", () => {
  it("formatDate returns fallback for empty and invalid values", () => {
    expect(formatDate("")).toBe("-");
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });

  it("formatDate formats a valid ISO date", () => {
    const value = formatDate("2026-04-13");
    expect(value).toEqual(expect.any(String));
    expect(value).not.toBe("2026-04-13");
  });

  it("formatTime returns fallback for empty and malformed values", () => {
    expect(formatTime("")).toBe("-");
    expect(formatTime("abc")).toBe("abc");
  });

  it("formatTime formats HH:mm values", () => {
    const value = formatTime("09:00");
    expect(value).toEqual(expect.any(String));
    expect(value.length).toBeGreaterThan(0);
  });

  it("getStatusTone returns expected theme token", () => {
    expect(getStatusTone("pending")).toContain("#FDF0EB");
    expect(getStatusTone("unknown")).toContain("#EEF1F0");
  });

  it("todayISODate returns YYYY-MM-DD", () => {
    expect(todayISODate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("dayOfWeekFromISO returns lowercase weekday", () => {
    expect(dayOfWeekFromISO("2026-04-13")).toBe("monday");
  });

  it("toMinutes and toTimeString convert both ways", () => {
    expect(toMinutes("09:30")).toBe(570);
    expect(toTimeString(570)).toBe("09:30");
  });

  it("safeJsonParse returns fallback on invalid input", () => {
    expect(safeJsonParse('{"ok":true}', null)).toEqual({ ok: true });
    expect(safeJsonParse("", { x: 1 })).toEqual({ x: 1 });
    expect(safeJsonParse("bad-json", { y: 2 })).toEqual({ y: 2 });
  });

  it("appendRedirectParam encodes path and query", () => {
    expect(appendRedirectParam("/patient/book-appointment", "?tab=new")).toBe(
      "/login?redirect=%2Fpatient%2Fbook-appointment%3Ftab%3Dnew"
    );
  });
});
