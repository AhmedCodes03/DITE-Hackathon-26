import { dayOfWeekFromISO, toMinutes, toTimeString } from "../utils/helpers";

export async function simulateLatency(ms = 180) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function generateSlots({ date, availabilityRules, appointments }) {
  const day = dayOfWeekFromISO(date);
  const rules = availabilityRules.filter((rule) => rule.dayOfWeek === day && rule.isActive);

  const slots = [];

  rules.forEach((rule) => {
    const start = toMinutes(rule.startTime);
    const end = toMinutes(rule.endTime);
    const breakStart = rule.breakStartTime ? toMinutes(rule.breakStartTime) : null;
    const breakEnd = rule.breakEndTime ? toMinutes(rule.breakEndTime) : null;

    for (let point = start; point + rule.slotDurationMinutes <= end; point += rule.slotDurationMinutes) {
      const slotStart = point;
      const slotEnd = point + rule.slotDurationMinutes;

      const overlapsBreak =
        breakStart != null && breakEnd != null && slotStart < breakEnd && slotEnd > breakStart;

      if (overlapsBreak) {
        continue;
      }

      const startTime = toTimeString(slotStart);
      const endTime = toTimeString(slotEnd);

      const alreadyBooked = appointments.some(
        (item) =>
          item.appointmentDate === date &&
          item.startTime === startTime &&
          item.status !== "cancelled"
      );

      if (!alreadyBooked) {
        slots.push({ startTime, endTime });
      }
    }
  });

  return slots;
}
