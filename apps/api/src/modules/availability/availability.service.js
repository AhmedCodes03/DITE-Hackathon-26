import Availability from "../../models/availability.model.js";
import Appointment from "../../models/appointment.model.js";
import { ApiError } from "../../utils/ApiError.js";

const PKT_OFFSET_MINUTES = 5 * 60;

function getNowInOffset(offsetMinutes) {
  return new Date(Date.now() + offsetMinutes * 60 * 1000);
}

function formatDateFromShiftedUtc(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentDateInPkt() {
  return formatDateFromShiftedUtc(getNowInOffset(PKT_OFFSET_MINUTES));
}

function getCurrentMinutesInPkt() {
  const now = getNowInOffset(PKT_OFFSET_MINUTES);
  return now.getUTCHours() * 60 + now.getUTCMinutes();
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function getAllAvailability(doctorId = undefined) {
  const query = { isActive: true };
  if (doctorId !== undefined) {
    query.doctorId = doctorId;
  }
  return Availability.find(query).sort({ dayOfWeek: 1 });
}

export async function createAvailability(data) {
  const existing = await Availability.findOne({
    doctorId: data.doctorId || null,
    dayOfWeek: data.dayOfWeek
  });
  if (existing) {
    throw new ApiError(
      `Availability for ${data.dayOfWeek} already exists. Use PATCH to update.`,
      400
    );
  }

  return Availability.create(data);
}

export async function updateAvailability(id, updates) {
  const availability = await Availability.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  if (!availability) {
    throw new ApiError("Availability not found", 404);
  }

  return availability;
}

export async function deleteAvailability(id) {
  const availability = await Availability.findByIdAndDelete(id);

  if (!availability) {
    throw new ApiError("Availability not found", 404);
  }

  return availability;
}

export async function getAvailableSlots(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    throw new ApiError("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const todayInPkt = getCurrentDateInPkt();
  if (dateString < todayInPkt) {
    throw new ApiError("Cannot fetch slots for a past date", 400);
  }

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const requestedDate = new Date(`${dateString}T12:00:00.000Z`);
  const dayOfWeek = dayNames[requestedDate.getUTCDay()];

  const availability = await Availability.findOne({
    dayOfWeek,
    isActive: true
  });

  if (!availability) {
    return {
      date: dateString,
      dayOfWeek,
      timezone: "UTC+05:00",
      slots: []
    };
  }

  const slots = generateSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDurationMinutes,
    availability.breakStartTime,
    availability.breakEndTime
  );

  const bookedAppointments = await Appointment.find({
    appointmentDate: dateString,
    status: { $nin: ["cancelled"] }
  }).select("startTime");

  const bookedTimes = new Set(bookedAppointments.map((apt) => apt.startTime));

  let availableSlots = slots.filter((slot) => !bookedTimes.has(slot.startTime));

  if (dateString === todayInPkt) {
    const currentMinutesInPkt = getCurrentMinutesInPkt();
    availableSlots = availableSlots.filter((slot) => toMinutes(slot.startTime) > currentMinutesInPkt);
  }

  return {
    date: dateString,
    dayOfWeek,
    timezone: "UTC+05:00",
    slots: availableSlots
  };
}

function generateSlots(startTime, endTime, durationMinutes, breakStart, breakEnd) {
  const slots = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  let breakStartMinutes = null;
  let breakEndMinutes = null;

  if (breakStart && breakEnd) {
    const [bStartHour, bStartMin] = breakStart.split(":").map(Number);
    const [bEndHour, bEndMin] = breakEnd.split(":").map(Number);
    breakStartMinutes = bStartHour * 60 + bStartMin;
    breakEndMinutes = bEndHour * 60 + bEndMin;
  }

  while (currentMinutes + durationMinutes <= endMinutes) {
    const slotEndMinutes = currentMinutes + durationMinutes;

    if (breakStartMinutes !== null && breakEndMinutes !== null) {
      const slotOverlapsBreak =
        currentMinutes < breakEndMinutes && slotEndMinutes > breakStartMinutes;

      if (slotOverlapsBreak) {
        currentMinutes = breakEndMinutes;
        continue;
      }
    }

    const startHourStr = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
    const startMinStr = String(currentMinutes % 60).padStart(2, "0");
    const endHourStr = String(Math.floor(slotEndMinutes / 60)).padStart(2, "0");
    const endMinStr = String(slotEndMinutes % 60).padStart(2, "0");

    slots.push({
      startTime: `${startHourStr}:${startMinStr}`,
      endTime: `${endHourStr}:${endMinStr}`
    });

    currentMinutes += durationMinutes;
  }

  return slots;
}
