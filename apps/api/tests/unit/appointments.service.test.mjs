import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const AppointmentMock = {
  create: jest.fn(),
  findById: jest.fn()
};

const AvailabilityModelMock = {
  find: jest.fn()
};

const availabilityServiceMock = {
  getAvailableSlots: jest.fn()
};

const PatientProfileMock = {
  findOne: jest.fn()
};

const DoctorProfileMock = {
  findOne: jest.fn()
};

jest.unstable_mockModule("../../src/models/appointment.model.js", () => ({
  default: AppointmentMock
}));

jest.unstable_mockModule("../../src/models/availability.model.js", () => ({
  default: AvailabilityModelMock
}));

jest.unstable_mockModule("../../src/modules/availability/availability.service.js", () => availabilityServiceMock);

jest.unstable_mockModule("../../src/models/patientProfile.model.js", () => ({
  default: PatientProfileMock
}));

jest.unstable_mockModule("../../src/models/doctorProfile.model.js", () => ({
  default: DoctorProfileMock
}));

const {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment
} = await import("../../src/modules/appointments/appointments.service.js");

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

describe("appointments service unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    DoctorProfileMock.findOne.mockResolvedValue({ bookingEnabled: true });
  });

  it("bookAppointment creates appointment when slot is available", async () => {
    const date = tomorrow();
    availabilityServiceMock.getAvailableSlots.mockResolvedValue({
      slots: [{ startTime: "09:00", endTime: "09:30" }]
    });
    PatientProfileMock.findOne.mockResolvedValue({ _id: "507f1f77bcf86cd799439201" });
    AppointmentMock.create.mockResolvedValue({
      _id: { toString: () => "507f1f77bcf86cd799439202" },
      appointmentDate: date,
      startTime: "09:00",
      endTime: "09:30",
      status: "pending"
    });

    const result = await bookAppointment("507f1f77bcf86cd799439111", {
      appointmentDate: date,
      startTime: "09:00",
      reason: "MRI"
    });

    expect(AppointmentMock.create).toHaveBeenCalled();
    expect(result.id).toBe("507f1f77bcf86cd799439202");
  });

  it("bookAppointment throws when slot is already booked/unavailable", async () => {
    const date = tomorrow();
    availabilityServiceMock.getAvailableSlots.mockResolvedValue({
      slots: [{ startTime: "10:00", endTime: "10:30" }]
    });

    await expect(
      bookAppointment("507f1f77bcf86cd799439112", {
        appointmentDate: date,
        startTime: "09:00",
        reason: "MRI"
      })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("cancelAppointment cancels when requester owns appointment", async () => {
    const appointment = {
      patientId: { toString: () => "507f1f77bcf86cd799439113" },
      appointmentDate: tomorrow(),
      status: "pending",
      save: jest.fn().mockResolvedValue(undefined)
    };
    AppointmentMock.findById.mockResolvedValue(appointment);

    const result = await cancelAppointment(
      "507f1f77bcf86cd799439300",
      "507f1f77bcf86cd799439113",
      "patient"
    );

    expect(result.status).toBe("cancelled");
  });

  it("cancelAppointment throws when requester is not owner", async () => {
    AppointmentMock.findById.mockResolvedValue({
      patientId: { toString: () => "507f1f77bcf86cd799439113" },
      appointmentDate: tomorrow(),
      status: "pending"
    });

    await expect(
      cancelAppointment(
        "507f1f77bcf86cd799439301",
        "507f1f77bcf86cd799439999",
        "patient"
      )
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rescheduleAppointment updates appointment to new slot", async () => {
    const date = tomorrow();
    const appointment = {
      _id: "507f1f77bcf86cd799439401",
      patientId: { toString: () => "507f1f77bcf86cd799439114" },
      status: "pending",
      reason: "Consultation",
      save: jest.fn().mockResolvedValue(undefined)
    };

    AppointmentMock.findById.mockResolvedValue(appointment);
    availabilityServiceMock.getAvailableSlots.mockResolvedValue({
      slots: [{ startTime: "11:00", endTime: "11:30" }]
    });
    AppointmentMock.create.mockResolvedValue({ _id: "507f1f77bcf86cd799439402" });

    const result = await rescheduleAppointment(
      "507f1f77bcf86cd799439401",
      "507f1f77bcf86cd799439114",
      "patient",
      { appointmentDate: date, startTime: "11:00" }
    );

    expect(AppointmentMock.create).toHaveBeenCalled();
    expect(appointment.status).toBe("cancelled");
    expect(result).toBeTruthy();
  });

  it("rescheduleAppointment throws when new slot is unavailable", async () => {
    const appointment = {
      patientId: { toString: () => "507f1f77bcf86cd799439114" },
      status: "pending",
      reason: "Consultation"
    };
    AppointmentMock.findById.mockResolvedValue(appointment);
    availabilityServiceMock.getAvailableSlots.mockResolvedValue({
      slots: [{ startTime: "12:00", endTime: "12:30" }]
    });

    await expect(
      rescheduleAppointment(
        "507f1f77bcf86cd799439403",
        "507f1f77bcf86cd799439114",
        "patient",
        { appointmentDate: tomorrow(), startTime: "11:00" }
      )
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});
