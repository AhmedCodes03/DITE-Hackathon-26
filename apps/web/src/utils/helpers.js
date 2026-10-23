/**
 * Formats a date-like input into a locale-friendly short date.
 * @param {string | Date | number} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/**
 * Formats HH:mm-like values into a locale-friendly time string.
 * @param {string | number} timeValue
 * @returns {string}
 */
export function formatTime(timeValue) {
  if (!timeValue) return "-";
  if (typeof timeValue === "string" && timeValue.includes("T")) {
    const date = new Date(timeValue);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
  }
  const [hours, minutes] = String(timeValue).trim().split(":");
  if (hours == null || minutes == null) return String(timeValue);
  const numHours = Number(hours);
  const numMinutes = Number(minutes);
  if (Number.isNaN(numHours) || Number.isNaN(numMinutes)) return String(timeValue);
  const date = new Date();
  date.setHours(numHours, numMinutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

/**
 * Maps appointment status values to semantic tone classes.
 * @param {string} status
 * @returns {string}
 */
export function getStatusTone(status) {
  switch (status) {
    case "confirmed":
      return "bg-[#ADE0D0] text-[#083831]";
    case "pending":
      return "bg-[#FDF0EB] text-[#B64F2C]";
    case "cancelled":
      return "bg-[#FADCD1] text-[#8F3D22]";
    case "completed":
      return "bg-[#EEF1F0] text-[#5A6872]";
    case "no_show":
      return "bg-[#EEF1F0] text-[#5A6872]";
    default:
      return "bg-[#EEF1F0] text-[#5A6872]";
  }
}

/**
 * Returns today's date in ISO YYYY-MM-DD format.
 * @returns {string}
 */
export function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Derives lowercase weekday name from an ISO-like date string.
 * @param {string | Date} dateValue
 * @returns {string}
 */
export function dayOfWeekFromISO(dateValue) {
  const date = new Date(dateValue);
  return date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
}

/**
 * Converts an HH:mm time value to absolute minutes from midnight.
 * @param {string | number} timeValue
 * @returns {number}
 */
export function toMinutes(timeValue) {
  const [hours, minutes] = String(timeValue).split(":");
  return Number(hours) * 60 + Number(minutes);
}

/**
 * Converts minutes from midnight to an HH:mm string.
 * @param {number} minutes
 * @returns {string}
 */
export function toTimeString(minutes) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

/**
 * Parses JSON safely and returns fallback when parsing fails.
 * @template T
 * @param {string | null | undefined} value
 * @param {T} fallback
 * @returns {T | unknown}
 */
export function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Builds a login URL that preserves the attempted destination.
 * @param {string} pathname
 * @param {string} [search=""]
 * @returns {string}
 */
export function appendRedirectParam(pathname, search = "") {
  const redirect = encodeURIComponent(`${pathname}${search}`);
  return `/login?redirect=${redirect}`;
}
