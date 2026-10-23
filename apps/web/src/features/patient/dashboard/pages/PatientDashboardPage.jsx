import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LoadingState } from "../../../../components/common/LoadingState";
import { ErrorState } from "../../../../components/common/ErrorState";
import { appointmentsApi } from "../../../appointments/api/appointments.api";
import { patientApi } from "../../../patients/api/patients.api";
import { doctorProfileApi } from "../../../doctor-profile/api/doctor-profile.api";
import { useAppointmentMutations } from "../../../appointments/hooks/useAppointments";
import { useAuthStore } from "../../../../stores/authStore";
import { formatDate, formatTime } from "../../../../utils/helpers";
import { ConfirmationModal } from "../../../../components/common/ConfirmationModal";

function appointmentDateTime(item) {
  return new Date(`${item.appointmentDate}T${item.startTime}:00`);
}

function normalizeAppointments(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.appointments)) return payload.appointments;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function isUpcoming(item) {
  return appointmentDateTime(item) >= new Date() && item.status !== "cancelled" && item.status !== "completed";
}

function healthScore(appointments = []) {
  if (!appointments.length) return 90;
  const completed = appointments.filter((item) => item.status === "completed").length;
  const confirmed = appointments.filter((item) => item.status === "confirmed").length;
  const pending = appointments.filter((item) => item.status === "pending").length;
  const raw = 80 + completed * 3 + confirmed * 2 - pending;
  return Math.max(70, Math.min(99, raw));
}

function profileInitials(name = "Patient") {
  return name
    .split(" ")
    .map((token) => token[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusClass(status) {
  if (status === "confirmed") return "bg-[#ACF36E] text-[#285000]";
  if (status === "pending") return "bg-[#E1E3E1] text-[#6F7A72]";
  if (status === "completed") return "bg-[#C9EAD7] text-[#2F4D3F]";
  return "bg-[#E1E3E1] text-[#6F7A72]";
}

function doctorShortName(name = "Dr. Sarah Mitchell") {
  const surname = String(name).replace(/^Dr\.?\s*/i, "").trim().split(" ").pop() || "Mitchell";
  return `Dr. ${surname}`;
}

function AppointmentRow({ item, onCancel, onReschedule, doctorName, doctorSpecialty }) {
  const durationMins = Math.max(15, Math.round((Date.parse(`1970-01-01T${item.endTime}:00`) - Date.parse(`1970-01-01T${item.startTime}:00`)) / 60000));
  const resolvedDoctorName = item.doctorId?.doctorName || doctorName;
  const resolvedSpecialty = item.doctorId?.specialty || doctorSpecialty;

  return (
    <div className="flex flex-col gap-5 rounded-[16px] bg-[#FFFFFF] p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-5">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-[#E1E3E1]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"
            alt={resolvedDoctorName}
            className="h-full w-full object-cover grayscale"
          />
          {item.status === "confirmed" ? (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#ACF36E] text-[12px] text-[#285000]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "12px" }}>
                check_circle
              </span>
            </span>
          ) : null}
        </div>

        <div>
          <h4 className="font-headline text-[34px] font-bold leading-tight text-[#005235]">{resolvedDoctorName}</h4>
          <p className="text-sm text-[#3F4943]">{resolvedSpecialty} • {item.reason || "Follow-up"}</p>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-[#6F7A72]">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {formatDate(item.appointmentDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              {formatTime(item.startTime)} ({durationMins} min)
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.05em] ${statusClass(item.status)}`}>
          {item.status}
        </span>

        {item.status !== "cancelled" && item.status !== "completed" ? (
          <>
            <button
              type="button"
              onClick={() => onReschedule(item)}
              className="rounded-[10px] border border-[#005235]/25 px-4 py-2 text-sm font-bold text-[#005235] transition-colors hover:bg-[#005235]/5"
            >
              Reschedule
            </button>
            <button
              type="button"
              onClick={() => onCancel(item)}
              className="rounded-[10px] px-4 py-2 text-sm font-bold text-[#BA1A1A] transition-colors hover:bg-[#BA1A1A]/5"
            >
              Cancel
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function PatientDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [cancelCandidate, setCancelCandidate] = useState(null);

  const { cancel, reschedule } = useAppointmentMutations();

  const {
    data: appointments,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["patient-appointments", "dashboard"],
    queryFn: async () => {
      const response = await appointmentsApi.getMyAppointments({ limit: 100 });
      return normalizeAppointments(response.data);
    },
    refetchOnWindowFocus: true
  });

  const { data: patientProfile } = useQuery({
    queryKey: ["patient-profile", "dashboard-card"],
    queryFn: async () => {
      const response = await patientApi.getMyProfile();
      return response.data?.data ?? response.data;
    }
  });

  const { data: doctorProfile } = useQuery({
    queryKey: ["doctor-profile", "dashboard-card"],
    queryFn: async () => {
      const response = await doctorProfileApi.getDoctorProfile();
      return response.data?.data ?? response.data;
    }
  });

  const allAppointments = normalizeAppointments(appointments);
  const doctorName = doctorProfile?.doctorName || "Dr. Sarah Mitchell";
  const doctorSpecialty = doctorProfile?.specialty || "Specialist";
  const doctorEmail = doctorProfile?.contactEmail || "contact@healthcare.com";
  const doctorPhone = doctorProfile?.contactPhone || "+1-555-0100";
  const shortDoctorName = doctorShortName(doctorName);

  const upcomingAppointments = useMemo(
    () => allAppointments.filter((item) => isUpcoming(item)).sort((a, b) => appointmentDateTime(a) - appointmentDateTime(b)),
    [allAppointments]
  );

  const nextAppointment = upcomingAppointments[0] || null;
  const health = healthScore(allAppointments);
  const activePrescriptions = Math.max(1, Math.min(6, Math.round((health - 80) / 5) + 2));
  const pendingLabs = allAppointments.some((item) => item.status === "pending");

  const handleCancel = async (item) => {
    try {
      setBusyId(item.id);
      setMessage("");
      await cancel.mutateAsync({ id: item.id, reason: "Cancelled by patient" });
      setMessage("Appointment cancelled.");
    } catch (error) {
      setMessage(error.message || "Unable to cancel appointment.");
    } finally {
      setBusyId("");
    }
  };

  const requestCancel = (item) => {
    setCancelCandidate(item);
  };

  const handleReschedule = async (item) => {
    const appointmentDate = window.prompt("New date (YYYY-MM-DD)", item.appointmentDate);
    if (!appointmentDate) return;
    const startTime = window.prompt("New time (HH:mm)", item.startTime);
    if (!startTime) return;

    try {
      setBusyId(item.id);
      setMessage("");
      await reschedule.mutateAsync({
        id: item.id,
        data: {
          appointmentDate,
          startTime,
          reason: "Patient requested reschedule"
        }
      });
      setMessage("Appointment rescheduled.");
    } catch (error) {
      setMessage(error.message || "Unable to reschedule appointment.");
    } finally {
      setBusyId("");
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading your dashboard..." className="py-8" />;
  }

  if (isError) {
    return <ErrorState title="Unable to load dashboard" description="Please retry to continue." onRetry={refetch} />;
  }

  return (
    <div className="space-y-8 pb-2">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#005235] to-[#1A6B4A] p-7 text-white sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-2xl md:mx-auto md:text-center lg:mx-0 lg:text-left">
          <h1 className="font-headline text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
            Welcome back,
            <br />
            {user?.fullName || "Patient"}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[#C9EAD7] md:mx-auto md:[text-align-last:center] lg:mx-0 lg:[text-align-last:auto]">
            {nextAppointment
              ? `Your next follow-up is on ${formatDate(nextAppointment.appointmentDate)} at ${formatTime(nextAppointment.startTime)}.`
              : "You are all set. Book your next session whenever you are ready."}
          </p>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[33%] bg-[radial-gradient(circle_at_40%_50%,rgba(138,214,174,0.35),transparent_58%)] lg:block" />
      </section>

      {message ? (
        <div className="rounded-xl border border-[#BFC9C0]/40 bg-[#F2F4F2] px-4 py-3 text-sm font-medium text-[#005235]">{message}</div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-6">
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#005235]/5 text-[#005235]">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6F7A72]">Next Appointment</p>
          <h3 className="mt-1 font-headline text-xl font-bold leading-tight text-[#005235] sm:text-2xl lg:text-[34px]">
            {nextAppointment ? formatDate(nextAppointment.appointmentDate) : "Not set"}
          </h3>
          <p className="mt-1 text-xs text-[#3F4943]">
            {nextAppointment ? `${formatTime(nextAppointment.startTime)} with ${doctorName}` : "Book a new consultation"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#ACF36E]/25 text-[#386B00]">
            <span className="material-symbols-outlined">vital_signs</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6F7A72]">Health Score</p>
          <h3 className="mt-1 font-headline text-xl font-bold leading-tight text-[#005235] sm:text-2xl lg:text-[34px]">{health >= 92 ? "Optimal" : "Good"}</h3>
          <p className="mt-1 text-xs text-[#3F4943]">{health}/100 based on recent appointments</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9EAD7] text-[#304D3F]">
            <span className="material-symbols-outlined">medication</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6F7A72]">Prescriptions</p>
          <h3 className="mt-1 font-headline text-xl font-bold leading-tight text-[#005235] sm:text-2xl lg:text-[34px]">{activePrescriptions} Active</h3>
          <p className="mt-1 text-xs text-[#3F4943]">Updated after your last visit</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFDAD6] text-[#BA1A1A]">
            <span className="material-symbols-outlined">lab_research</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6F7A72]">Lab Results</p>
          <h3 className="mt-1 font-headline text-xl font-bold leading-tight text-[#005235] sm:text-2xl lg:text-[34px]">{pendingLabs ? "Pending" : "Ready"}</h3>
          <p className="mt-1 text-xs text-[#3F4943]">{pendingLabs ? "Awaiting physician review" : "Nothing pending"}</p>
        </div>
      </section>

      <section className="rounded-[24px] bg-[#F2F4F2] p-6 sm:p-8">
        <div className="mb-7 flex flex-col gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left md:text-center lg:text-left">
          <div className="md:mx-auto lg:mx-0">
            <h2 className="font-headline text-3xl font-bold text-[#005235]">Upcoming Appointments</h2>
            <p className="text-sm text-[#6F7A72]">Dedicated care with {doctorName}</p>
          </div>
          <Link to="/patient/appointments" className="text-sm font-bold text-[#005235] hover:underline md:mx-auto lg:mx-0">
            View History
          </Link>
        </div>

        <div className="space-y-4 md:hidden">
          {upcomingAppointments.slice(0, 2).map((item) => (
            <div key={item.id} className={busyId === item.id ? "opacity-60" : ""}>
              <AppointmentRow
                item={item}
                onCancel={requestCancel}
                onReschedule={handleReschedule}
                doctorName={doctorName}
                doctorSpecialty={doctorSpecialty}
              />
            </div>
          ))}

          {!upcomingAppointments.length ? (
            <div className="rounded-[16px] bg-white p-6 text-sm text-[#6F7A72]">No upcoming appointments. Book a new session below.</div>
          ) : null}
        </div>

        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-[#D8DAD9] text-xs font-bold uppercase tracking-[0.08em] text-[#6F7A72]">
                  <th className="py-3">Doctor</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Time</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.slice(0, 4).map((item) => (
                  <tr key={item.id} className="border-b border-[#ECEEEC] text-sm text-[#3F4943]">
                    <td className="py-4 font-semibold text-[#005235]">{doctorName}</td>
                    <td className="py-4">{formatDate(item.appointmentDate)}</td>
                    <td className="py-4">{formatTime(item.startTime)}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em] ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleReschedule(item)}
                          className="rounded-[10px] border border-[#005235]/25 px-3 py-2 text-xs font-bold text-[#005235] transition-colors hover:bg-[#005235]/5"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => requestCancel(item)}
                          className="rounded-[10px] px-3 py-2 text-xs font-bold text-[#BA1A1A] transition-colors hover:bg-[#BA1A1A]/5"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!upcomingAppointments.length ? (
            <div className="mt-4 rounded-[16px] bg-white p-6 text-sm text-[#6F7A72]">No upcoming appointments. Book a new session below.</div>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-[#BFC9C0]/40 p-8 text-center sm:hidden">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ECEEEC] text-[#1A6B4A]/50">
            <span className="material-symbols-outlined text-3xl">stethoscope</span>
          </div>
          <h3 className="font-headline text-2xl font-bold text-[#005235]">Need clinical guidance?</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#6F7A72]">Quickly view available doctors and choose your next consultation slot.</p>
          <Link
            to="/patient/bookappointment"
            className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] bg-[#005235] px-8 py-3 font-headline text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Find a Doctor
          </Link>
        </div>

        <div className="mt-6 hidden rounded-2xl border-2 border-dashed border-[#BFC9C0]/40 p-8 text-center sm:p-12 md:block">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ECEEEC] text-[#1A6B4A]/50">
            <span className="material-symbols-outlined text-3xl">add_box</span>
          </div>
          <h3 className="font-headline text-[34px] font-bold text-[#005235]">Need another session?</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#6F7A72]">Book a direct follow-up or specific consultation with {shortDoctorName}.</p>
          <Link
            to="/patient/bookappointment"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[#005235] px-8 py-3 font-headline text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Request Appointment
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <article className="rounded-[24px] bg-[#F2F4F2] p-8 xl:col-span-1">
          <h3 className="font-headline text-2xl font-bold text-[#005235]">Your Physician</h3>
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#D6EEE7] text-2xl font-bold text-[#1A6B4A] shadow-sm">
              {profileInitials(doctorProfile?.doctorName || "Dr")}
            </div>
            <h4 className="font-headline text-[34px] font-bold leading-tight text-[#005235]">{doctorName}</h4>
            <p className="text-sm font-medium text-[#005235]">{doctorProfile?.specialty || "Specialist"}</p>
            <p className="mt-4 text-xs leading-relaxed text-[#6F7A72]">
              Specializing in integrative family medicine and precision diagnostics at {doctorProfile?.clinicName || "Green Valley Clinic"}.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = `mailto:${doctorEmail}`;
                }}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white text-[#1A6B4A] shadow-sm transition-colors hover:bg-[#ECEEEC]"
                aria-label={`Email ${doctorName}`}
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `tel:${doctorPhone}`;
                }}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white text-[#1A6B4A] shadow-sm transition-colors hover:bg-[#ECEEEC]"
                aria-label={`Call ${doctorName}`}
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
              </button>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] bg-[#F2F4F2] p-8 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-2xl font-bold text-[#005235]">Clinic Location</h3>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#005235]">Open Today: 8AM - 6PM</span>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-[#005235]">location_on</span>
                <div>
                  <p className="text-sm font-bold text-[#005235]">{doctorProfile?.clinicName || "Green Valley Precision Center"}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#6F7A72]">
                    {patientProfile?.address || doctorProfile?.clinicAddress || "842 Botanical Way, Suite 400"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="material-symbols-outlined text-[#005235]">local_parking</span>
                <div>
                  <p className="text-sm font-bold text-[#005235]">Validated Parking</p>
                  <p className="mt-1 text-sm text-[#6F7A72]">Available in the underground P2 deck.</p>
                </div>
              </div>
            </div>

            <div className="relative h-56 overflow-hidden rounded-xl bg-[#E1E3E1] md:h-full">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5WnFpAmgn4CxEz0NGBFkPtKKWs_8YbCJXnp2EHnZ89cRBKRewlJr4Ia8d-6gkdFpt4Et0dIughb36kHU4_CT-IMIeCcBlfCT52L8_nmbDd-W1-PaPiO0qU2offtfqCnJuhYzNRQdrD5Hyn9952_zxlZzJBmBnwfyrmp4REE3WT7ZcbnfWNA7Mncv2e4_xhhIcWTvKrpH-uCPF6cla7dQWfKBX3YT3F3DQUtnErHvtA0CJi8aY7MfvgTYm9E5Y-D6gVCEQvwJ6EnQ"
                alt="Map location"
                className="h-full w-full object-cover grayscale"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="h-4 w-4 rounded-full border-2 border-white bg-[#1A6B4A]" />
              </div>
            </div>
          </div>
        </article>
      </section>

      <ConfirmationModal
        open={Boolean(cancelCandidate)}
        title="Cancel appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        loading={Boolean(cancelCandidate && busyId === cancelCandidate.id)}
        variant="danger"
        onCancel={() => setCancelCandidate(null)}
        onConfirm={async () => {
          if (!cancelCandidate) return;
          await handleCancel(cancelCandidate);
          setCancelCandidate(null);
        }}
      />
    </div>
  );
}
