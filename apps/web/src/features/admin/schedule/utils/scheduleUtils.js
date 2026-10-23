export const WEEK_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
export const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun"
};
export const DAY_SHORT = {
  monday: "M",
  tuesday: "T",
  wednesday: "W",
  thursday: "T",
  friday: "F",
  saturday: "S",
  sunday: "S"
};
export const DAY_SELECTOR_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
export const SLOT_OPTIONS = [15, 30, 45, 60];
export const RESET_DEFAULTS = {
  dayOfWeek: "weekdays",
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMinutes: 30,
  breakStartTime: "13:00",
  breakEndTime: "14:00",
  isActive: true
};

export function toMinutes(time) {
  const [h, m] = String(time || "00:00").split(":").map(Number);
  return h * 60 + m;
}

export function toTimeString(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function toDisplayTime(time) {
  if (!time) return "";
  const [hh, mm] = String(time).split(":").map(Number);
  const isPM = hh >= 12;
  const h12 = hh % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
}

export function getWeekDates(baseDate = new Date()) {
  const result = [];
  const date = new Date(baseDate);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result.push(d);
  }
  return result;
}

export function createSlotsForRule(rule) {
  const start = toMinutes(rule.startTime);
  const end = toMinutes(rule.endTime);
  const breakStart = rule.breakStartTime ? toMinutes(rule.breakStartTime) : null;
  const breakEnd = rule.breakEndTime ? toMinutes(rule.breakEndTime) : null;
  const step = Number(rule.slotDurationMinutes || 30);
  const slots = [];
  for (let t = start; t + step <= end; t += step) {
    const inBreak = breakStart !== null && breakEnd !== null && t >= breakStart && t < breakEnd;
    slots.push({
      startTime: toTimeString(t),
      label: inBreak ? "LUNCH" : `AV-${String(slots.filter((s) => !s.isBreak).length + 1).padStart(2, "0")}`,
      isBreak: inBreak
    });
  }
  return slots;
}
