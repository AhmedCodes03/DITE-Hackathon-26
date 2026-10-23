export function getTodayISOInPk() {
  const now = new Date(Date.now() + 5 * 60 * 60 * 1000);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toISODateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(dateIso) {
  const [year, month, day] = String(dateIso).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateIso, days) {
  const next = parseIsoDate(dateIso);
  next.setDate(next.getDate() + days);
  return toISODateString(next);
}

export function weekdayFromIso(dateIso) {
  return parseIsoDate(dateIso).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

export function findNextSelectableDate(fromDateIso, minDateIso, activeWeekdays) {
  const start = fromDateIso < minDateIso ? minDateIso : fromDateIso;
  for (let offset = 0; offset < 90; offset += 1) {
    const candidate = addDays(start, offset);
    if (activeWeekdays.has(weekdayFromIso(candidate))) {
      return candidate;
    }
  }
  return start;
}

export function findPrevSelectableDate(fromDateIso, minDateIso, activeWeekdays) {
  for (let offset = 0; offset < 90; offset += 1) {
    const candidate = addDays(fromDateIso, -offset);
    if (candidate < minDateIso) break;
    if (activeWeekdays.has(weekdayFromIso(candidate))) {
      return candidate;
    }
  }
  return fromDateIso;
}

export function buildWeekCells(selectedDateIso, minDateIso, activeWeekdays) {
  const selectedDate = parseIsoDate(selectedDateIso);
  const mondayOffset = (selectedDate.getDay() + 6) % 7;
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() - mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateIso = toISODateString(date);
    const isOffDay = !activeWeekdays.has(weekdayFromIso(dateIso));
    const isPast = dateIso < minDateIso;

    return {
      key: dateIso,
      day: date.getDate(),
      dateIso,
      disabled: isPast || isOffDay,
      muted: isPast || isOffDay,
      isSelected: dateIso === selectedDateIso
    };
  });
}

export function splitSlots(slots = []) {
  const morning = [];
  const afternoon = [];

  slots.forEach((slot) => {
    const hour = Number(String(slot.startTime || "00:00").split(":")[0]);
    if (hour < 12) {
      morning.push(slot);
    } else {
      afternoon.push(slot);
    }
  });

  return { morning, afternoon };
}
