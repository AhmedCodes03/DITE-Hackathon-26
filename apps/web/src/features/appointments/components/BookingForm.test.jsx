import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { BookingForm } from "./BookingForm";
import { useAuthStore } from "../../../stores/authStore";
import { useAppointmentStore } from "../../../stores/appointmentStore";

vi.mock("../api/appointments.api.js", () => ({
  appointmentsApi: {
    book: vi.fn(async (payload) => ({
      data: {
        appointmentDate: payload.appointmentDate,
        startTime: payload.startTime,
        status: "pending"
      }
    }))
  }
}));

vi.mock("../api/availability.api.js", () => ({
  availabilityApi: {
    getSlots: vi.fn(async () => ({
      data: {
        slots: [{ startTime: "09:00", endTime: "09:30" }]
      }
    }))
  }
}));

function renderBooking(bookingProps = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/book-appointment"]}>
        <Routes>
          <Route
            path="/book-appointment"
            element={<BookingForm pageTitle="Book Appointment" intro="Book now" {...bookingProps} />}
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/patient/dashboard" element={<div>Patient Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("BookingForm gate on submit", () => {
  it("redirects after successful booking when redirectOnSuccessTo is provided", async () => {
    useAuthStore.setState({ token: "token", user: { id: "u_patient", role: "patient" }, isBootstrapped: true });

    renderBooking({ redirectOnSuccessTo: "/patient/dashboard" });

    await userEvent.type(screen.getByLabelText(/full name/i), "Ali Khan");
    await userEvent.type(screen.getByLabelText(/^email/i), "ali@example.com");
    await userEvent.type(screen.getByLabelText(/^phone/i), "03001234567");
    await userEvent.type(screen.getByLabelText(/appointment date/i), "2099-12-31");
    await userEvent.selectOptions(screen.getByLabelText(/reason for visit/i), "MRI");

    const slotRadio = await screen.findByRole("radio", { name: /9:00/i });
    await userEvent.click(slotRadio);
    await userEvent.click(screen.getByRole("button", { name: /book appointment/i }));

    await waitFor(() => {
      expect(screen.getByText("Patient Dashboard")).toBeInTheDocument();
    });
  }, 15000);

  it("shows slot validation error when submitting without selecting a slot", async () => {
    useAuthStore.setState({ token: "token", user: { id: "u_patient", role: "patient" }, isBootstrapped: true });

    const { container } = renderBooking();

    await userEvent.type(screen.getByLabelText(/full name/i), "Ali Khan");
    await userEvent.type(screen.getByLabelText(/^email/i), "ali@example.com");
    await userEvent.type(screen.getByLabelText(/^phone/i), "03001234567");
    await userEvent.type(screen.getByLabelText(/appointment date/i), "2099-12-31");
    await userEvent.selectOptions(screen.getByLabelText(/reason for visit/i), "MRI");

    const form = container.querySelector("form");
    fireEvent.submit(form);

    expect(await screen.findByText(/please select a time slot/i)).toBeInTheDocument();
  });

  it("redirects unauthenticated user to login and preserves draft", async () => {
    useAuthStore.setState({ token: "", user: null, isBootstrapped: true, isBootstrapping: false });
    useAppointmentStore.setState({ draft: null });
    window.localStorage.removeItem("dr_xyz_appointment_draft");

    renderBooking();

    await userEvent.type(screen.getByLabelText(/full name/i), "Ali Khan");
    await userEvent.type(screen.getByLabelText(/^email/i), "ali@example.com");
    await userEvent.type(screen.getByLabelText(/^phone/i), "03001234567");
    await userEvent.type(screen.getByLabelText(/appointment date/i), "2099-12-31");
    await userEvent.selectOptions(screen.getByLabelText(/reason for visit/i), "MRI");

    const slotRadio = await screen.findByRole("radio", { name: /9:00/i });
    await userEvent.click(slotRadio);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /book appointment/i })).toBeEnabled();
    });

    await userEvent.click(screen.getByRole("button", { name: /book appointment/i }));

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    }, { timeout: 3000 });

    const draft = useAppointmentStore.getState().draft;
    expect(draft).toBeTruthy();
    expect(draft.startTime).toBe("09:00");
  }, 15000);
});
