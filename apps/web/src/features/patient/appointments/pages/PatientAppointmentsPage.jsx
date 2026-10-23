import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingState } from "../../../../components/common/LoadingState";
import { ErrorState } from "../../../../components/common/ErrorState";
import { useAppointmentMutations, useMyAppointments } from "../../../appointments/hooks/useAppointments";
import { useDoctorProfile } from "../../../doctor-profile/hooks/useDoctorProfile";
import { formatDate, formatTime } from "../../../../utils/helpers";
import { ConfirmationModal } from "../../../../components/common/ConfirmationModal";

function doctorShortName(name = "Dr. Sarah Mitchell") {
  const surname = String(name).replace(/^Dr\.?\s*/i, "").trim().split(" ").pop() || "Mitchell";
  return `Dr. ${surname}`;
}

function toDateTime(item) {
  return new Date(`${item.appointmentDate}T${item.startTime}:00`);
}

function durationLabel(startTime, endTime) {
  const ms = Date.parse(`1970-01-01T${endTime}:00`) - Date.parse(`1970-01-01T${startTime}:00`);
  const mins = Number.isNaN(ms) ? 45 : Math.max(15, Math.round(ms / 60000));
  return `${mins} min`;
}

function normalizeAppointments(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.appointments)) return payload.appointments;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function statusTone(status) {
  if (status === "confirmed") return "bg-[#ACF36E] text-[#285000]";
  if (status === "cancelled") return "bg-[#FFDAD6] text-[#93000A]";
  if (status === "completed") return "bg-[#C9EAD7] text-[#2F4D3F]";
  return "bg-[#E1E3E1] text-[#6F7A72]";
}

export default function PatientAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [cancelCandidate, setCancelCandidate] = useState(null);

  const appointmentsQuery = useMyAppointments({ limit: 100 });
  const mutations = useAppointmentMutations();
  const { data: doctorProfile } = useDoctorProfile();

  const allItems = normalizeAppointments(appointmentsQuery.data);
  const doctorName = doctorProfile?.doctorName || "Dr. Sarah Mitchell";
  const shortDoctorName = doctorShortName(doctorName);

  const upcoming = useMemo(
    () => allItems.filter((item) => toDateTime(item) >= new Date() && item.status !== "cancelled").sort((a, b) => toDateTime(a) - toDateTime(b)),
    [allItems]
  );

  const past = useMemo(() => allItems.filter((item) => toDateTime(item) < new Date() || item.status === "completed"), [allItems]);
  const cancelled = useMemo(() => allItems.filter((item) => item.status === "cancelled"), [allItems]);

  const visibleItems = activeTab === "upcoming" ? upcoming : activeTab === "past" ? past : cancelled;
  const primaryItem = activeTab === "upcoming" ? upcoming[0] : visibleItems[0];

  const statsConsultations = allItems.filter((item) => toDateTime(item).getFullYear() === new Date().getFullYear()).length;
  const statsPendingLabs = allItems.filter((item) => item.status === "pending").length;

  const handleCancel = async (item) => {
    try {
      setBusyId(item.id);
      setMessage("");
      await mutations.cancel.mutateAsync({ id: item.id, reason: "Cancelled by patient" });
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
      await mutations.reschedule.mutateAsync({
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

  if (appointmentsQuery.isLoading) return <LoadingState label="Loading appointments..." className="py-8" />;

  if (appointmentsQuery.isError) {
    return <ErrorState title="Unable to load appointments" description="Please retry to continue." onRetry={appointmentsQuery.refetch} />;
  }

  const secondaryItem = visibleItems[1];

  return (
    <div className="space-y-8 pb-8">
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#386B00]">Patient Portal</span>
          <h1 className="font-headline text-4xl font-bold leading-[0.98] tracking-[-0.02em] text-[#151A1D] sm:text-5xl lg:text-[52px]">My Appointments</h1>
          <p className="max-w-[560px] text-[14px] leading-[1.5] text-[#556575]">Manage your upcoming sessions and view your medical consultation history with {shortDoctorName}.</p>
        </div>

        <Link
          to="/patient/bookappointment"
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#005235] px-8 py-3 font-headline text-[16px] font-bold text-white transition hover:bg-[#1A6B4A] lg:w-auto lg:min-w-[248px]"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Book New Session
        </Link>
      </section>

      <div className="flex flex-wrap items-end gap-6 border-b border-transparent pt-1">
        {[
          { key: "upcoming", label: "Upcoming" },
          { key: "past", label: "Past" },
          { key: "cancelled", label: "Cancelled" }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pb-[13px] text-[14px] leading-none transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#0F5A38] font-bold text-[#0F5A38]"
                : "font-medium text-[#667685] hover:text-[#0F5A38]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message ? (
        <div className="rounded-2xl border border-[#BFC9C0]/40 bg-[#F2F4F2] px-4 py-3 text-[13px] font-medium text-[#005235]">{message}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="space-y-6">
          <div className="space-y-3 xl:hidden">
            {visibleItems.map((item) => (
              <article key={`mobile-${item.id}`} className="rounded-[12px] border border-[#DCE1DD] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-headline text-xl font-bold text-[#171D1A]">{item.reason || "Consultation"}</h3>
                    <p className="mt-1 text-sm text-[#6F7A72]">{item.doctorId?.doctorName || doctorName}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em] ${statusTone(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-[#556575]">
                  <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">calendar_today</span>{formatDate(item.appointmentDate)}</p>
                  <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span>{formatTime(item.startTime)} • {durationLabel(item.startTime, item.endTime)}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleReschedule(item)}
                    disabled={busyId === item.id || item.status === "cancelled"}
                    className="min-h-[44px] flex-1 rounded-lg border border-[#005235]/25 px-3 py-1.5 text-xs font-bold text-[#005235] transition hover:bg-[#005235]/5 disabled:opacity-50"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => requestCancel(item)}
                    disabled={busyId === item.id || item.status === "cancelled" || item.status === "completed"}
                    className="min-h-[44px] flex-1 rounded-lg px-3 py-1.5 text-xs font-bold text-[#BA1A1A] transition hover:bg-[#FFEEEC] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </article>
            ))}

            {!visibleItems.length ? <div className="rounded-[12px] border border-dashed border-[#D6DDD9] bg-white p-4 text-sm text-[#6F7A72]">No {activeTab} appointments yet.</div> : null}
          </div>

          {primaryItem ? (
            <div className="relative hidden overflow-hidden rounded-[24px] bg-white p-8 shadow-[0_8px_18px_rgba(13,31,26,0.05)] xl:block">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#ACF36E]/20" />

              <div className="mb-8 flex flex-col items-start justify-between gap-4 xl:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-[84px] w-[74px] flex-col items-center justify-center rounded-2xl border border-[#D9DEDA] bg-[#F1F4F1] pt-[2px]">
                    <span className="text-[12px] font-bold uppercase text-[#005235]">
                      {new Date(`${primaryItem.appointmentDate}T00:00:00`).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="font-headline text-[32px] font-bold leading-none text-[#191C1B]">
                      {new Date(`${primaryItem.appointmentDate}T00:00:00`).getDate()}
                    </span>
                  </div>

                  <div>
                    <div className={`mb-2 inline-block rounded-full px-4 py-1 text-[11px] font-bold uppercase ${statusTone(primaryItem.status)}`}>
                      {primaryItem.status}
                    </div>
                    <h3 className="font-headline text-3xl font-bold leading-tight text-[#171D1A] xl:text-[42px]">{primaryItem.reason || "Wellness Check"}</h3>
                    <p className="flex items-center gap-1.5 text-[16px] text-[#6F7A72]">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      {formatTime(primaryItem.startTime)} - {formatTime(primaryItem.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"
                    alt="Doctor Avatar"
                    className="h-[56px] w-[56px] rounded-full border-2 border-[#F8FAF8] object-cover"
                  />
                  <div>
                    <p className="text-xs font-medium text-[#6F7A72]">Consulting Physician</p>
                    <p className="text-2xl font-bold text-[#191C1B] xl:text-[34px]">{primaryItem.doctorId?.doctorName || doctorName}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 border-t border-[#DCE1DD] pt-[18px]">
                <button
                  type="button"
                  onClick={() => handleReschedule(primaryItem)}
                  disabled={busyId === primaryItem.id || primaryItem.status === "cancelled"}
                  className="min-h-[54px] flex-1 rounded-xl border border-[#005235]/25 px-6 py-3 font-headline text-[13px] font-bold text-[#005235] transition hover:bg-[#005235]/5 disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2.5 align-middle">
                    <span className="material-symbols-outlined text-[18px]">event_repeat</span>
                    Reschedule
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => requestCancel(primaryItem)}
                  disabled={busyId === primaryItem.id || primaryItem.status === "cancelled" || primaryItem.status === "completed"}
                  className="min-h-[54px] flex-1 rounded-xl border border-[#E5B9B7] bg-white px-6 py-3 font-headline text-[13px] font-bold text-[#BA1A1A] transition hover:bg-[#FFEEEC] disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2.5 align-middle">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Cancel
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] bg-white p-8 text-[18px] text-[#6F7A72]">No {activeTab} appointments yet.</div>
          )}

          {secondaryItem ? (
            <div className="group hidden rounded-[24px] border border-[#DEE3DF] bg-white p-6 shadow-[0_2px_8px_rgba(13,31,26,0.02)] transition-all hover:bg-[#F8FAF8] xl:block">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6EEEA] text-[#005235]">
                    <span className="material-symbols-outlined text-[30px]">lab_research</span>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold leading-tight text-[#191C1B]">{secondaryItem.reason || "Blood Analysis Results"}</h4>
                    <p className="text-[13px] text-[#6F7A72]">{formatDate(secondaryItem.appointmentDate)} • Follow-up required</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[24px] text-[#6F7A72] transition-transform group-hover:translate-x-1">chevron_right</span>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#D6DDD9] bg-white/50 p-6 text-[14px] text-[#6F7A72]">
              No additional items in this tab.
            </div>
          )}
        </div>

        <div className="space-y-7 xl:pt-0">
          <div className="relative overflow-hidden rounded-[24px] bg-[#005C3A] p-7 text-white">
            <div className="absolute -bottom-8 -right-6 opacity-20">
              <span className="material-symbols-outlined text-[124px]">eco</span>
            </div>
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B7E4CA]">Practice Stats</h4>
            <div className="space-y-6">
              <div>
                <p className="font-headline text-[48px] font-bold leading-none tracking-tight">{statsConsultations}</p>
                <p className="text-[13px] text-[#CBE9D9]">Consultations this year</p>
              </div>
              <div>
                <p className="font-headline text-[48px] font-bold leading-none tracking-tight">{statsPendingLabs}</p>
                <p className="text-[13px] text-[#CBE9D9]">Pending lab reports</p>
              </div>
            </div>
          </div>

            <div className="space-y-4 rounded-[24px] bg-[#EFF1F1] p-7 text-center">
            <div className="mx-auto mb-2 flex h-32 w-32 items-center justify-center rounded-full bg-white/60">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ3k0GRO4cG-rwMGfvNzpXAFBcxKia6gveKLw5h_tX5VTjdoGEdESSNTvStZBrjY6aNu1NNX89S1EOXqG4zptk_RJu58rGUn_9DAmwBYMIPbeMDzej8TZShFCoPeQx3_X2wf-gX9X_BHYJCIMNIZHRxc2ZX2rcB_jMez_iNqHLtKUAip5vFMsKhXbvspjyU8pBxrFabMB71H1UAYxZ7lGijekg3qGXSx8Om66kEbbRQsi409l3FTqPpVskR7M7Ohvcg-pc7STHlQU"
                alt="Doctor portrait"
                className="h-24 w-24 object-contain opacity-40 grayscale"
              />
            </div>
              <h4 className="text-3xl font-bold text-[#191C1B] xl:text-[40px]">No past appointments</h4>
            <p className="px-4 text-[14px] leading-relaxed text-[#5A6872]">You haven't completed any sessions in the current medical cycle yet.</p>
            <button
              type="button"
              onClick={() => setActiveTab("past")}
              className="inline-flex min-h-[48px] items-center gap-1 text-[13px] font-bold text-[#005235] hover:underline"
            >
              View 2023 Archive
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-7 pt-8 md:grid-cols-2">
        <div className="flex items-start gap-5 rounded-[24px] bg-[#ECEFEC] p-8">
          <span className="material-symbols-outlined text-[34px] text-[#005235]">lightbulb</span>
          <div className="space-y-2">
            <h4 className="text-[16px] font-bold leading-none text-[#191C1B]">Appointment Tip</h4>
            <p className="text-[13px] leading-[1.55] text-[#5A6872]">Arriving 10 minutes early allows for vitals check without rushing your time with {shortDoctorName}.</p>
          </div>
        </div>

        <div className="flex items-start gap-5 rounded-[24px] border border-[#D9E4CE] bg-[#EDF5E5] p-8">
          <span className="material-symbols-outlined text-[34px] text-[#3A6F00]">health_and_safety</span>
          <div className="space-y-2">
            <h4 className="text-[16px] font-bold leading-none text-[#191C1B]">Health Safety</h4>
            <p className="text-[13px] leading-[1.55] text-[#5A6872]">Our clinic maintains a precision air filtration system for your safety during every visit.</p>
          </div>
        </div>
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
