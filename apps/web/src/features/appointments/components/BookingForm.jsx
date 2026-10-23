import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { SlotPicker } from "../../../components/appointments/SlotPicker";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { LoadingState } from "../../../components/common/LoadingState";
import { SelectField } from "../../../components/forms/SelectField";
import { TextAreaField } from "../../../components/forms/TextAreaField";
import { TextInput } from "../../../components/forms/TextInput";
import { availabilityApi } from "../api/availability.api.js";
import { appointmentsApi } from "../api/appointments.api.js";
import { patientApi } from "../../patients/api/patients.api.js";
import { useAppointmentStore } from "../../../stores/appointmentStore.js";
import { useAuthStore } from "../../../stores/authStore.js";
import { GENDER_OPTIONS } from "../../../utils/constants.js";
import { extractError } from "../../../utils/extractError";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { addBreadcrumb } from "../../../lib/sentry";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  age: z.preprocess(
    (value) => (value === "" || value == null ? undefined : Number(value)),
    z.number().min(0).max(130).optional()
  ),
  gender: z.string().optional(),
  appointmentDate: z.string().min(1, "Choose an appointment date"),
  reason: z.string().min(1, "Please select a reason for visit"),
  notes: z.string().optional()
});

const genderOptions = [{ value: "", label: "Select gender" }, ...GENDER_OPTIONS];
const reasonOptions = [
  { value: "", label: "Select reason for visit" },
  { value: "Ultrasound", label: "Ultrasound" },
  { value: "MRI", label: "MRI" },
  { value: "CT Scan", label: "CT Scan" }
];

function getTodayISOInPk() {
  const now = new Date(Date.now() + 5 * 60 * 60 * 1000);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapProfileDefaults(profile, user) {
  return {
    fullName: profile?.fullName || user?.fullName || "",
    email: profile?.email || user?.email || "",
    phone: profile?.phone || user?.phone || "",
    age: profile?.age || "",
    gender: profile?.gender || "",
    appointmentDate: "",
    reason: "",
    notes: ""
  };
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function BookingForm({
  isProtectedFlow = false,
  pageTitle,
  intro,
  autoSubmitDraft = false,
  showMeta = true,
  redirectOnSuccessTo = ""
}) {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const setDraft = useAppointmentStore((state) => state.setDraft);
  const draft = useAppointmentStore((state) => state.draft);
  const clearDraft = useAppointmentStore((state) => state.clearDraft);

  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile
  } = useApiQuery({
    queryKey: ["patient-profile-booking"],
    queryFn: patientApi.getMyProfile,
    select: (payload) => payload?.data ?? payload,
    enabled: Boolean(user)
  });

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const prefillDraftRef = useRef(false);
  const autoSubmitRef = useRef(false);

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: mapProfileDefaults(profileData, user)
  });

  const appointmentDate = form.watch("appointmentDate");

  const { data: slotsData, isLoading: slotsLoading, isError: slotsError, refetch: refetchSlots } = useApiQuery({
    queryKey: ["availability-slots", appointmentDate],
    queryFn: () => availabilityApi.getSlots(appointmentDate),
    enabled: !!appointmentDate
  });

  const bookMutation = useMutation({
    mutationFn: async (data) => {
      const response = await appointmentsApi.book(data);
      return response?.data ?? response;
    }
  });

  useEffect(() => {
    form.reset((currentValues) => ({
      ...currentValues,
      ...mapProfileDefaults(profileData, user)
    }));
  }, [profileData, user]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [appointmentDate]);

  useEffect(() => {
    if (!autoSubmitDraft || !isProtectedFlow || !draft || prefillDraftRef.current) {
      return;
    }

    prefillDraftRef.current = true;
    form.reset({
      ...mapProfileDefaults(profileData, user),
      ...draft
    });
    setSelectedSlot({ startTime: draft.startTime, endTime: draft.endTime || "" });
  }, [autoSubmitDraft, draft, form, isProtectedFlow, profileData, user]);

  const canSubmit = useMemo(() => Boolean(selectedSlot?.startTime), [selectedSlot]);
  const isBooking = bookMutation.isPending || form.formState.isSubmitting;

  const onSubmit = async (values) => {
    if (!selectedSlot?.startTime) {
      form.setError("appointmentDate", {
        type: "manual",
        message: "Please select a time slot"
      });
      return;
    }

    const payload = {
      appointmentDate: values.appointmentDate,
      startTime: selectedSlot.startTime,
      reason: values.reason,
      notes: values.notes || ""
    };

    if (!user && !isProtectedFlow) {
      addBreadcrumb({
        category: "auth",
        level: "warning",
        message: "auth_failure",
        data: { action: "booking_submit", reason: "unauthenticated" }
      }).catch(() => {});
      setDraft({
        ...values,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        intent: "book_appointment"
      });
      navigate("/login?redirect=/patient/book-appointment");
      return;
    }

    try {
      const result = await bookMutation.mutateAsync(payload);
      addBreadcrumb({
        category: "appointments",
        level: "info",
        message: "appointment_booked",
        data: { appointmentDate: result.appointmentDate, startTime: result.startTime }
      }).catch(() => {});
      clearDraft();

      if (redirectOnSuccessTo) {
        navigate(redirectOnSuccessTo);
        return;
      }

      setSuccessData(result);
    } catch (error) {
      const parsedError = extractError(error, "Unable to book appointment");

      if (parsedError.errors.length) {
        parsedError.errors.forEach((item) => {
          form.setError(item.field || "root", {
            type: "server",
            message: item.message
          });
        });
      } else {
        form.setError("root", {
          type: "server",
          message: parsedError.message
        });
      }
    }
  };

  useEffect(() => {
    if (!autoSubmitDraft || !isProtectedFlow || !draft || !user || !selectedSlot?.startTime) {
      return;
    }

    if (autoSubmitRef.current) {
      return;
    }

    autoSubmitRef.current = true;
    onSubmit();
  }, [autoSubmitDraft, draft, isProtectedFlow, user, selectedSlot?.startTime]);

  if (isProtectedFlow && profileLoading) {
    return <LoadingState label="Loading your profile..." />;
  }

  if (isProtectedFlow && profileError) {
    return (
      <ErrorState
        title="Unable to load profile"
        description="Please retry before booking your appointment."
        onRetry={refetchProfile}
      />
    );
  }

  if (successData) {
    return (
      <div className="rounded-xl border border-[#ADE0D0] bg-[#F5F0EB] p-5 text-center transition-all duration-200 hover:shadow-md sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D6EEE7] text-[#2BA68A]">
          <CheckCircleIcon />
        </div>
        <h2 className="mt-6 font-['Instrument_Serif'] italic text-2xl text-[#2A2E35]">Appointment Booked!</h2>
        <p className="mt-2 text-[#5A6872]">Your appointment has been submitted for review.</p>
        
        <div className="mt-6 inline-block rounded-xl bg-white p-4 text-left">
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-[#5A6872]">Date:</span>
              <span className="font-medium text-[#2A2E35]">{successData.appointmentDate}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[#5A6872]">Time:</span>
              <span className="font-medium text-[#2A2E35]">{successData.startTime}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[#5A6872]">Status:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF0EB] px-2 py-0.5 text-xs font-medium text-[#B64F2C]">
                Pending Confirmation
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/patient/appointments"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-2.5 text-sm font-bold text-[#0D2000] transition-all hover:brightness-95"
          >
            View My Appointments
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border-2 border-[#005235] bg-transparent px-6 py-2.5 text-sm font-bold text-[#005235] transition-all hover:bg-[#005235] hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-xl border border-[#D6EEE7] bg-[#F5F0EB] p-5 transition-all duration-200 hover:shadow-md sm:p-8">
        <h1 className="font-['Instrument_Serif'] italic text-xl text-[#2A2E35] sm:text-2xl">{pageTitle}</h1>
        <p className="mt-2 text-[#5A6872]">{intro}</p>

        {showMeta ? (
          <div className="mt-4 rounded-xl bg-[#D6EEE7] p-4 text-sm text-[#1A7A62]">
            {user
              ? "Your profile information is pre-filled. Select a date and slot to continue."
              : "You can browse slots now. Sign in is required only when submitting booking."}
          </div>
        ) : null}

        <form className="mt-6 space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label="Full Name"
              required
              placeholder="Your full name"
              registration={form.register("fullName")}
              error={form.formState.errors.fullName}
              readOnly={Boolean(isProtectedFlow && user)}
            />
            <TextInput
              label="Email"
              type="email"
              required
              placeholder="your.email@example.com"
              registration={form.register("email")}
              error={form.formState.errors.email}
              readOnly={Boolean(isProtectedFlow && user)}
            />
            <TextInput
              label="Phone"
              required
              placeholder="+92 300 1234567"
              registration={form.register("phone")}
              error={form.formState.errors.phone}
            />
            <TextInput
              label="Age"
              type="number"
              placeholder="Your age"
              registration={form.register("age")}
              error={form.formState.errors.age}
            />
            <SelectField
              label="Gender"
              options={genderOptions}
              registration={form.register("gender")}
              error={form.formState.errors.gender}
            />
            <TextInput
              label="Appointment Date"
              type="date"
              required
              min={getTodayISOInPk()}
              registration={form.register("appointmentDate")}
              error={form.formState.errors.appointmentDate}
            />
          </div>

          <SelectField
            label="Reason for Visit"
            required
            options={reasonOptions}
            registration={form.register("reason")}
            error={form.formState.errors.reason}
          />
          
          <TextAreaField
            label="Additional Notes (optional)"
            rows={3}
            placeholder="Any additional information you'd like to share..."
            registration={form.register("notes")}
            error={form.formState.errors.notes}
          />

          {form.formState.errors.root?.message && (
            <div className="rounded-lg border border-[#FADCD1] bg-[#FDF0EB] px-4 py-3 text-sm text-[#8F3D22]">
              {form.formState.errors.root.message}
            </div>
          )}

          <div className="rounded-lg bg-[#FDF0EB] p-4 text-sm text-[#B64F2C] border border-[#E8825A]/20">
            <p className="font-medium">Please note:</p>
            <p className="mt-1">Appointment requests are subject to confirmation. Please cancel in advance if plans change.</p>
          </div>

          <button
            type="submit"
            disabled={!form.formState.isValid || isBooking || !canSubmit}
            className="min-h-[44px] w-full rounded-[10px] bg-[rgb(126_193_67_/_var(--tw-bg-opacity,_1))] px-6 py-3 text-sm font-bold text-[#0D2000] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBooking ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>

      <aside className="rounded-xl border border-[#D6EEE7] bg-[#F5F0EB] p-5 transition-all duration-200 hover:shadow-md sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6EEE7] text-[#2BA68A]">
            <CalendarIcon />
          </div>
          <div>
            <h2 className="text-base font-medium text-[#2A2E35] sm:text-lg">Available Slots</h2>
            <p className="text-sm text-[#5A6872]">Select a date to view available times (UTC+05:00)</p>
          </div>
        </div>

        <div className="mt-6" aria-live="polite">
          {!appointmentDate ? (
            <EmptyState
              title="No date selected"
              description="Please choose an appointment date from the form to view available slots."
              icon={CalendarIcon}
            />
          ) : null}

          {appointmentDate && slotsLoading ? (
            <LoadingState label="Loading available slots..." />
          ) : null}

          {appointmentDate && slotsError ? (
            <ErrorState
              title="Failed to load slots"
              description="Please try another date or retry."
              onRetry={refetchSlots}
            />
          ) : null}

          {appointmentDate && slotsData?.slots ? (
            <SlotPicker
              slots={slotsData.slots}
              value={selectedSlot?.startTime}
              onChange={(slot) => {
                setSelectedSlot(slot);
                form.clearErrors("appointmentDate");
              }}
            />
          ) : null}
        </div>

        {selectedSlot && (
          <div className="mt-4 rounded-lg border border-[#2BA68A] bg-[#D6EEE7] px-4 py-3">
            <p className="text-sm font-medium text-[#1A7A62]">
              Selected: <span className="font-medium">{selectedSlot.startTime}</span>
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-[#5A6872]">Today (UTC+05:00): {getTodayISOInPk()}</p>
      </aside>
    </div>
  );
}
