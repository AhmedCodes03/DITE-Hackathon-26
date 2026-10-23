import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppointmentCard } from "./AppointmentCard";

const item = {
  id: "ap_1",
  appointmentDate: "2026-04-10",
  startTime: "10:00",
  endTime: "10:30",
  status: "pending",
  reason: "Consultation",
  patient: { fullName: "Ali Khan" }
};

describe("AppointmentCard", () => {
  it("calls patient actions", () => {
    const onCancel = vi.fn();
    const onReschedule = vi.fn();

    render(
      <MemoryRouter>
        <AppointmentCard item={item} onCancel={onCancel} onReschedule={onReschedule} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Reschedule" }));

    expect(onCancel).toHaveBeenCalledWith(item);
    expect(onReschedule).toHaveBeenCalledWith(item);
  });

  it("shows admin actions based on status", () => {
    const onConfirm = vi.fn();

    render(
      <MemoryRouter>
        <AppointmentCard item={item} isAdmin onConfirm={onConfirm} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledWith("ap_1");
  });
});
