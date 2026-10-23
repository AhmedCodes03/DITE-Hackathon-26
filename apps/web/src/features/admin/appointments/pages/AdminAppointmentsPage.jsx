import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ConfirmationModal } from "../../../../components/common/ConfirmationModal";
import { EmptyState } from "../../../../components/common/EmptyState";
import { ErrorState } from "../../../../components/common/ErrorState";
import { LoadingState } from "../../../../components/common/LoadingState";
import { formatTime } from "../../../../utils/helpers";
import { adminApi } from "../../api/admin.api.js";
import { appointmentsApi } from "../../../appointments/api/appointments.api.js";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No Show" }
];

const STATUS_PILL_CLASSES = {
  pending: "bg-[#FFF1C6] text-[#866600]",
  confirmed: "bg-[#C9EAD7] text-[#2F4D3F]",
  completed: "bg-[#ACF36E] text-[#3A6F00]",
  cancelled: "bg-[#FFDAD6] text-[#93000A]",
  no_show: "bg-[#E1E3E1] text-[#3F4943]"
};

const getDateParts = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return { month: "---", day: "--", year: "----" };
  }

  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
    year: String(date.getFullYear())
  };
};

const formatCardTime = (startTime, endTime) => {
  if (!startTime && !endTime) {
    return "-";
  }
  const startLabel = startTime ? formatTime(startTime) : "-";
  const endLabel = endTime ? formatTime(endTime) : "-";
  return `${startLabel} - ${endLabel}`;
};

const getStatusLabel = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  if (normalized === "no_show") {
    return "No Show";
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getPatientLabel = (item) => {
  return item.patientName || item.patient?.fullName || item.patient?.name || "Unknown Patient";
};

const getAppointmentContextLabel = (item) => {
  return item.reason || item.appointmentType || item.type || item.notes || "No appointment notes";
};

const isToday = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function AdminAppointmentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: "", date: "" });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [visibleCount, setVisibleCount] = useState(2);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-appointments", filters],
    queryFn: async () => {
      const response = await adminApi.getAppointments(filters);
      return response.data?.data ?? response.data;
    },
    refetchInterval: 45000,
    refetchOnWindowFocus: false
  });

  const items = data?.appointments || data?.items || [];
  const normalizedItems = useMemo(() => items.map((item) => ({ ...item, _id: item._id || item.id })), [items]);
  const pendingCount = normalizedItems.filter((item) => {
    return String(item.status || "").toLowerCase() === "pending" && isToday(item.appointmentDate);
  }).length;
  const hasMoreItems = normalizedItems.length > visibleCount;
  const visibleAppointments = normalizedItems.slice(0, visibleCount);

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await appointmentsApi.cancel(id, "Cancelled by admin");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
    }
  });

  const confirmMutation = useMutation({
    mutationFn: async (id) => {
      await appointmentsApi.confirm(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (id) => {
      await appointmentsApi.complete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
    }
  });

  const noShowMutation = useMutation({
    mutationFn: async (id) => {
      await appointmentsApi.markNoShow(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      await appointmentsApi.reschedule(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
    }
  });

  const handleBookAppointment = () => {
    navigate("/book-appointment");
  };

  const handleLoadMore = () => {
    setVisibleCount((previous) => previous + 2);
  };

  const handleReschedule = async (item) => {
    const appointmentDate = window.prompt("New date (YYYY-MM-DD)", item.appointmentDate);
    const startTime = window.prompt("New time (HH:mm)", item.startTime);
    if (!appointmentDate || !startTime) {
      return;
    }

    await rescheduleMutation.mutateAsync({
      id: item._id,
      payload: {
        appointmentDate,
        startTime,
        reason: "Rescheduled by admin"
      }
    });
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState label="Loading appointments..." />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load appointments"
        description="Please retry to fetch appointment data."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-[#191C1B] sm:text-5xl">Manage Appointments</h1>
          <p className="text-base font-medium text-[#6F7A72] sm:text-lg">Filter and manage appointment statuses with surgical precision.</p>
        </div>

        <button
          type="button"
          onClick={handleBookAppointment}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#7EC143] px-8 py-4 font-headline text-lg font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-[0.99]"
          aria-label="Book appointment"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl bg-[#F2F4F2] p-5 sm:p-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-appointment-status" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">Appointment Status</label>
              <select
                id="admin-appointment-status"
                value={filters.status}
                onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value }))}
                className="w-full rounded-xl border-none bg-white px-4 py-3 text-sm font-medium text-[#191C1B] focus:ring-1 focus:ring-[#005235]"
                aria-label="Filter appointments by status"
              >
                {statusOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-appointment-date" className="ml-1 text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">Scheduled Date</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7A72]">calendar_month</span>
                <input
                  id="admin-appointment-date"
                  type="date"
                  value={filters.date}
                  onChange={(event) => setFilters((previous) => ({ ...previous, date: event.target.value }))}
                  className="w-full rounded-xl border-none bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#191C1B] focus:ring-1 focus:ring-[#005235]"
                  aria-label="Filter appointments by date"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[#005235] p-6 text-white shadow-lg lg:col-span-4">
          <div className="absolute -bottom-5 -right-4 opacity-10">
            <span className="material-symbols-outlined text-[120px]">stethoscope</span>
          </div>
          <p className="text-sm font-medium text-white/85">Total Requests Today</p>
          <p className="font-headline text-4xl font-bold leading-tight">{pendingCount} Pending</p>
        </div>
      </div>

      {!items.length ? (
        <EmptyState
          title="No appointments found"
          description="Try changing filters to see appointment data."
          icon={CalendarIcon}
        />
      ) : (
        <div className="space-y-6">
          {visibleAppointments.map((item) => {
            const normalizedStatus = String(item.status || "pending").toLowerCase();
            const isPending = normalizedStatus === "pending";
            const isCompleted = normalizedStatus === "completed";
            const isCancelled = normalizedStatus === "cancelled";
            const isConfirmed = normalizedStatus === "confirmed";
            const dateInfo = getDateParts(item.appointmentDate);

            return (
              <article
                key={`appointment-${item._id}`}
                className={`group relative overflow-hidden rounded-2xl border border-[#E1E3E1]/90 bg-white p-5 shadow-sm transition-all duration-300 sm:p-8 ${isPending ? "hover:shadow-xl hover:shadow-[#191C1B]/5" : "opacity-80"}`}
              >
                {isPending ? <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#F3BF0B]" /> : null}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                    <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#F2F4F2] text-center">
                      <span className="text-[11px] font-bold uppercase tracking-tighter text-[#6F7A72]">{dateInfo.month}</span>
                      <span className="font-headline text-2xl font-bold leading-none text-[#005235]">{dateInfo.day}</span>
                      <span className="text-[10px] font-medium text-[#6F7A72]">{dateInfo.year}</span>
                    </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-headline text-xl font-bold tracking-tight text-[#191C1B]">{getPatientLabel(item)}</h3>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_PILL_CLASSES[normalizedStatus] || STATUS_PILL_CLASSES.pending}`}>
                            {getStatusLabel(normalizedStatus)}
                          </span>
                        </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#6F7A72]">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          {formatCardTime(item.startTime, item.endTime)}
                        </span>
                        <span className="hidden h-1 w-1 rounded-full bg-[#BFC9C0] sm:block" />
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">clinical_notes</span>
                          {getAppointmentContextLabel(item)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            await confirmMutation.mutateAsync(item._id || item.id);
                          }}
                          className="min-h-[44px] whitespace-nowrap rounded-xl bg-[#7EC143] px-6 py-3 text-sm font-bold text-[#0D2000] transition-all hover:brightness-95 active:scale-[0.99]"
                          aria-label={`Confirm appointment for ${getPatientLabel(item)}`}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await handleReschedule(item);
                          }}
                          className="min-h-[44px] whitespace-nowrap rounded-xl border border-[#BFC9C0]/50 bg-white px-6 py-3 text-sm font-bold text-[#191C1B] transition-colors hover:bg-[#F2F4F2]"
                          aria-label={`Reschedule appointment for ${getPatientLabel(item)}`}
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(item)}
                          className="min-h-[44px] whitespace-nowrap rounded-xl border border-[#BA1A1A]/20 bg-white px-4 py-3 text-sm font-bold text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]/40"
                          aria-label={`Cancel appointment for ${getPatientLabel(item)}`}
                        >
                          Cancel
                        </button>
                      </>
                    ) : null}

                    {isConfirmed ? (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            await completeMutation.mutateAsync(item._id || item.id);
                          }}
                          className="min-h-[44px] rounded-xl bg-[#ACF36E] px-6 py-3 text-sm font-bold text-[#285000] transition-all hover:brightness-95"
                           aria-label={`Mark appointment complete for ${getPatientLabel(item)}`}
                        >
                          Mark Complete
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await noShowMutation.mutateAsync(item._id || item.id);
                          }}
                          className="min-h-[44px] rounded-xl border border-[#BFC9C0]/50 bg-white px-6 py-3 text-sm font-bold text-[#3F4943] transition-colors hover:bg-[#F2F4F2]"
                           aria-label={`Mark no show for ${getPatientLabel(item)}`}
                        >
                          No Show
                        </button>
                      </>
                    ) : null}

                    {isCompleted ? (
                      <button
                        type="button"
                        className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold text-[#005235] transition-colors hover:bg-[#F2F4F2]"
                        aria-label={`View report for ${getPatientLabel(item)}`}
                      >
                        View Report
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                      </button>
                    ) : null}

                    {isCancelled ? (
                      <span className="inline-flex min-h-[44px] items-center rounded-xl bg-[#FFDAD6]/40 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#93000A]">
                        Cancelled
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}

          {hasMoreItems ? (
            <div className="flex justify-center border-t border-[#BFC9C0]/15 pt-8">
              <button
                type="button"
                onClick={handleLoadMore}
                className="group flex flex-col items-center gap-1.5 opacity-40 transition-opacity hover:opacity-100"
                aria-label="Load more appointment history"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6F7A72]">Load More History</span>
                <span className="material-symbols-outlined text-[#6F7A72]">expand_more</span>
              </button>
            </div>
          ) : null}
        </div>
      )}

      <ConfirmationModal
        open={Boolean(selectedAppointment)}
        title="Cancel appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        loading={cancelMutation.isPending}
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        variant="danger"
        onCancel={() => setSelectedAppointment(null)}
        onConfirm={async () => {
          if (!selectedAppointment) return;
          await cancelMutation.mutateAsync(selectedAppointment._id || selectedAppointment.id);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
}
