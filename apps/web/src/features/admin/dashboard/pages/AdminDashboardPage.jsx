import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ErrorState } from "../../../../components/common/ErrorState";
import { LoadingState } from "../../../../components/common/LoadingState";
import { ConfirmationModal } from "../../../../components/common/ConfirmationModal";
import { adminApi } from "../../api/admin.api.js";
import { appointmentsApi } from "../../../appointments/api/appointments.api.js";
import { useDoctorProfile } from "../../../doctor-profile/hooks/useDoctorProfile.js";
import { formatDate, formatTime } from "../../../../utils/helpers";

function getStatusVariant(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "confirmed" || normalized === "completed") {
    return {
      wrap: "bg-[#ACF36E]",
      text: "text-[#3A6F00]",
      dot: "bg-[#386B00]",
      label: "Confirmed"
    };
  }
  if (normalized === "cancelled") {
    return {
      wrap: "bg-[#FFDAD6]",
      text: "text-[#93000A]",
      dot: "bg-[#BA1A1A]",
      label: "Cancelled"
    };
  }
  return {
    wrap: "bg-[#C9EAD7]",
    text: "text-[#304D3F]",
    dot: "bg-[#304D3F]",
    label: "Pending"
  };
}

function getTypeLabel(item) {
  return item?.type || item?.appointmentType || "Check-up";
}

function getDoctorName(item, defaultDoctorName) {
  return item?.doctorName || item?.doctor?.doctorName || item?.doctor?.fullName || defaultDoctorName;
}

function getDoctorDept(item, defaultDoctorSpecialty) {
  return item?.doctorSpecialty || item?.doctor?.specialty || defaultDoctorSpecialty;
}

function getPatientName(item) {
  return item?.patientName || item?.patient?.fullName || "Unknown Patient";
}

function getPatientId(item, index) {
  const raw = item?.patientId || item?.patient?._id || item?.patient?.id;
  if (!raw) return `#PX-${String(index + 7100).padStart(4, "0")}`;
  const str = String(raw).trim();
  if (str.startsWith("#")) return str;
  if (str.startsWith("PX-")) return `#${str}`;
  if (str.length === 24) return `#PX-${str.slice(-6).toUpperCase()}`;
  return `#${str}`;
}

function getDateLabel(item) {
  const raw = item?.appointmentDate || item?.date || item?.scheduledFor || item?.createdAt;
  if (!raw) {
    return "-";
  }
  return formatDate(raw);
}

function getTimeLabel(item) {
  const start = item?.startTime || item?.time || item?.slot || item?.appointmentTime;
  const end = item?.endTime;

  if (start && end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
  }
  if (start) {
    return formatTime(start);
  }
  if (item?.scheduledFor || item?.createdAt) {
    return formatTime(item?.scheduledFor || item?.createdAt);
  }
  return "-";
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [dashboardNotice, setDashboardNotice] = useState("");
  const [cancelModalAppointment, setCancelModalAppointment] = useState(null);
  const [appointmentSearch, setAppointmentSearch] = useState("");

  const { data: doctorProfile } = useDoctorProfile();
  const defaultDoctorName = doctorProfile?.doctorName || "Doctor";
  const defaultDoctorSpecialty = doctorProfile?.specialty || "Specialist";

  const [trendRange, setTrendRange] = useState(7);

  const confirmMutation = useMutation({
    mutationFn: async (id) => {
      await appointmentsApi.confirm(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-trends"] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await appointmentsApi.cancel(id, "Cancelled by admin");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-trends"] });
    }
  });

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await adminApi.getDashboardStats();
      return response.data?.data ?? response.data;
    },
    refetchInterval: 60_000
  });

  const {
    data: trendsData,
    isLoading: trendsLoading
  } = useQuery({
    queryKey: ["admin-dashboard-trends", trendRange],
    queryFn: async () => {
      const response = await adminApi.getDashboardTrends(trendRange);
      return response.data?.data ?? response.data;
    },
    refetchInterval: 60_000
  });

  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ["admin-dashboard-appointments"],
    queryFn: async () => {
      const response = await appointmentsApi.getAdminAppointments({ limit: 5 });
      return response.data?.data ?? response.data;
    },
    refetchInterval: 60_000
  });

  if (statsLoading) {
    return (
      <div className="py-8">
        <LoadingState label="Loading dashboard..." />
      </div>
    );
  }

  if (statsError) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        description="Please retry to load the latest dashboard statistics."
        onRetry={refetchStats}
      />
    );
  }

  const data = stats || {};
  const appointments = (appointmentsData?.appointments || []).map((item) => ({
    ...item,
    _id: item._id || item.id,
    id: item.id || item._id
  }));

  const trends = Array.isArray(trendsData) ? trendsData : [];
  const maxVal = Math.max(...trends.map((t) => t.count || 0), 0);
  const maxTrend = Math.max(Math.ceil(maxVal * 1.3), 5);
  const chartW = 700;
  const chartH = 170;
  const padX = 40;
  const padY = 32;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padY * 2;

  const trendPoints = trends.map((item, idx) => {
    const x = trends.length > 1 ? padX + (idx / (trends.length - 1)) * plotW : chartW / 2;
    const y = padY + plotH - ((item.count || 0) / maxTrend) * plotH;
    return { x, y, ...item };
  });

  const lineD = trendPoints.length > 0
    ? trendPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, "")
    : "";

  const areaD = trendPoints.length > 0
    ? `${lineD} L ${trendPoints[trendPoints.length - 1].x.toFixed(1)},${chartH} L ${trendPoints[0].x.toFixed(1)},${chartH} Z`
    : "";

  const confirmedCount = (data.confirmedAppointments || 0) + (data.completedAppointments || 0);
  const pendingCount = data.pendingAppointments || 0;
  const cancelledCount = (data.cancelledAppointments || 0) + (data.noShowAppointments || 0);
  const statusTotal = confirmedCount + pendingCount + cancelledCount;

  const confirmedPct = statusTotal > 0 ? Math.round((confirmedCount / statusTotal) * 100) : 0;
  const pendingPct = statusTotal > 0 ? Math.round((pendingCount / statusTotal) * 100) : 0;
  const cancelledPct = statusTotal > 0 ? Math.max(0, 100 - confirmedPct - pendingPct) : 0;

  const circ = 2 * Math.PI * 70; // ~439.82
  const confirmedLen = statusTotal > 0 ? (confirmedCount / statusTotal) * circ : 0;
  const pendingLen = statusTotal > 0 ? (pendingCount / statusTotal) * circ : 0;
  const cancelledLen = statusTotal > 0 ? (cancelledCount / statusTotal) * circ : 0;

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-8 flex flex-col gap-4 md:mb-10 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-[#005235] sm:text-3xl">System Overview</h1>
          <p className="mt-1 text-sm text-[#3F4943] sm:text-base">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
      </header>

      {dashboardNotice ? (
        <div className="mb-6 rounded-lg border border-[#BFC9C0]/30 bg-white px-4 py-3 text-sm text-[#3F4943]">{dashboardNotice}</div>
      ) : null}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <div className="rounded-xl border-l-4 border-[#005235] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-[#A5F3C9] p-2">
              <span className="material-symbols-outlined text-[#005235]">person</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">+12% ↑</span>
          </div>
          <div className="font-headline text-2xl font-bold text-[#191C1B]">{data.totalPatients || 0}</div>
          <div className="mt-1 whitespace-nowrap text-[11px] uppercase tracking-wider text-[#3F4943]">TOTAL PATIENTS</div>
        </div>

        <div className="rounded-xl border-l-4 border-[#7EC143] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-[#ACF36E] p-2">
              <span className="material-symbols-outlined text-[#3A6F00]">calendar_month</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">+5 today</span>
          </div>
          <div className="font-headline text-2xl font-bold text-[#191C1B]">{data.totalAppointments || 0}</div>
          <div className="mt-1 whitespace-nowrap text-[11px] uppercase tracking-wider text-[#3F4943]">APPOINTMENTS TODAY</div>
        </div>

        <div className="rounded-xl border-l-4 border-[#BA1A1A] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-[#FFDAD6] p-2">
              <span className="material-symbols-outlined text-[#BA1A1A]">pending_actions</span>
            </div>
            <span className="text-xs font-bold text-[#BA1A1A]">High Priority</span>
          </div>
          <div className="font-headline text-2xl font-bold text-[#191C1B]">{data.pendingAppointments || 0}</div>
          <div className="mt-1 whitespace-nowrap text-[11px] uppercase tracking-wider text-[#3F4943]">PENDING REQUESTS</div>
        </div>

        <div className="rounded-xl border-l-4 border-[#304D3F] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-[#C9EAD7] p-2">
              <span className="material-symbols-outlined text-[#304D3F]">payments</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">+18% ↑</span>
          </div>
          <div className="font-headline text-2xl font-bold text-[#191C1B]">$12,500</div>
          <div className="mt-1 whitespace-nowrap text-[11px] uppercase tracking-wider text-[#3F4943]">TOTAL REVENUE</div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr] xl:gap-8">
        <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-headline text-lg font-bold text-[#191C1B]">Appointment Trends</h3>
              <p className="text-xs text-[#3F4943]">Daily booking volume</p>
            </div>
            <select
              value={trendRange}
              onChange={(e) => setTrendRange(Number(e.target.value))}
              aria-label="Filter appointment trends by timeframe"
              className="rounded-lg border border-[#BFC9C0]/30 bg-[#F2F4F2] px-3 py-1.5 text-xs font-medium text-[#191C1B] focus:outline-none focus:ring-1 focus:ring-[#005235]"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>

          <div className="relative h-[220px] sm:h-[240px]">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-2">
              <div className="h-0 w-full border-b border-[#BFC9C0]/15" />
              <div className="h-0 w-full border-b border-[#BFC9C0]/15" />
              <div className="h-0 w-full border-b border-[#BFC9C0]/15" />
              <div className="h-0 w-full border-b border-[#BFC9C0]/15" />
            </div>

            {trendsLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoadingState label="Loading trends..." />
              </div>
            ) : trendPoints.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-[#3F4943]">
                No appointment trends available yet.
              </div>
            ) : (
              <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${chartW} ${chartH}`}>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#1A6B4A", stopOpacity: 0.35 }} />
                    <stop offset="100%" style={{ stopColor: "#1A6B4A", stopOpacity: 0.0 }} />
                  </linearGradient>
                </defs>
                {areaD && <path d={areaD} fill="url(#grad1)" />}
                {lineD && (
                  <path
                    d={lineD}
                    fill="none"
                    stroke="#1A6B4A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {trendPoints.map((pt, i) => (
                  <g key={pt.date || i} className="group cursor-pointer">
                    {pt.count > 0 && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="7"
                        fill="#7EC143"
                        opacity="0.3"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.count > 0 ? "5" : "4"}
                      fill={pt.count > 0 ? "#7EC143" : "#FFFFFF"}
                      stroke="#1A6B4A"
                      strokeWidth="2.5"
                      className="transition-transform group-hover:scale-125"
                    />
                    <title>{`${pt.label} (${pt.date}): ${pt.count} appointments`}</title>
                    {pt.count > 0 && (
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        fill="#005235"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {pt.count}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            )}

            <div className="mt-auto flex w-full justify-between px-1 pt-4 text-[10px] font-medium uppercase tracking-widest text-[#3F4943] sm:px-2">
              {trends.length <= 7
                ? trends.map((t, i) => <span key={t.date || i}>{t.label}</span>)
                : trends
                    .filter((_, i) => i === 0 || i === Math.floor(trends.length / 2) || i === trends.length - 1 || i % 6 === 0)
                    .map((t, i) => <span key={t.date || i}>{t.label}</span>)}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-xl bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6">
            <h3 className="font-headline text-lg font-bold text-[#191C1B]">Status Distribution</h3>
            <p className="text-xs text-[#3F4943]">All scheduled appointments</p>
          </div>
          <div className="relative flex flex-grow items-center justify-center py-2">
            <svg className="h-48 w-48 -rotate-90">
              {statusTotal === 0 ? (
                <circle cx="96" cy="96" r="70" fill="none" stroke="#F2F4F2" strokeWidth="24" />
              ) : (
                <>
                  <circle cx="96" cy="96" r="70" fill="none" stroke="#F2F4F2" strokeWidth="24" />
                  {confirmedLen > 0 && (
                    <circle
                      cx="96"
                      cy="96"
                      r="70"
                      fill="none"
                      stroke="#1A6B4A"
                      strokeWidth="24"
                      strokeDasharray={`${confirmedLen} ${circ}`}
                      strokeDashoffset={0}
                    />
                  )}
                  {pendingLen > 0 && (
                    <circle
                      cx="96"
                      cy="96"
                      r="70"
                      fill="none"
                      stroke="#7EC143"
                      strokeWidth="24"
                      strokeDasharray={`${pendingLen} ${circ}`}
                      strokeDashoffset={-confirmedLen}
                    />
                  )}
                  {cancelledLen > 0 && (
                    <circle
                      cx="96"
                      cy="96"
                      r="70"
                      fill="none"
                      stroke="#BA1A1A"
                      strokeWidth="24"
                      strokeDasharray={`${cancelledLen} ${circ}`}
                      strokeDashoffset={-(confirmedLen + pendingLen)}
                    />
                  )}
                </>
              )}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-headline text-2xl font-bold text-[#191C1B]">{statusTotal}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-[#3F4943]">TOTAL</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#1A6B4A]" />
                <span className="text-[#191C1B]">Confirmed / Completed</span>
              </div>
              <span className="font-semibold text-[#3F4943]">
                {confirmedPct}% <span className="font-normal text-[#6B7570]">({confirmedCount})</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#7EC143]" />
                <span className="text-[#191C1B]">Pending</span>
              </div>
              <span className="font-semibold text-[#3F4943]">
                {pendingPct}% <span className="font-normal text-[#6B7570]">({pendingCount})</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#BA1A1A]" />
                <span className="text-[#191C1B]">Cancelled / No-show</span>
              </div>
              <span className="font-semibold text-[#3F4943]">
                {cancelledPct}% <span className="font-normal text-[#6B7570]">({cancelledCount})</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#ECEEEC] px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h3 className="font-headline text-center text-lg font-bold text-[#005235] lg:text-left">Recent Appointments</h3>
            <p className="text-xs text-[#3F4943]">Review and manage recent booking requests</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:w-auto">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#3F4943]">search</span>
              <input
                id="admin-dashboard-patient-search"
                type="text"
                value={appointmentSearch}
                onChange={(e) => setAppointmentSearch(e.target.value)}
                placeholder="Search recent patients..."
                aria-label="Search recent appointments by patient"
                className="w-full rounded-lg border-none bg-[#F2F4F2] py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#005235] sm:w-64"
              />
            </div>
            <Link to="/admin/appointments" className="text-sm font-bold text-[#005235] hover:underline">
              View All
            </Link>
          </div>
        </div>

        {appointmentsLoading ? (
          <div className="px-8 py-8">
            <LoadingState label="Loading appointments..." />
          </div>
        ) : appointmentsError ? (
          <div className="px-8 py-8">
            <ErrorState
              title="Unable to load recent appointments"
              description="Please retry to fetch appointment activity."
              onRetry={refetchAppointments}
            />
          </div>
        ) : appointments.length === 0 ? (
          <div className="px-8 py-10 text-center">
            <p className="text-sm font-semibold text-[#191C1B]">No appointments found</p>
            <p className="mt-1 text-xs text-[#3F4943]">Appointments will appear here once patients book.</p>
          </div>
        ) : (
          <>
          <div className="space-y-3 px-4 py-4 sm:px-6 md:hidden">
            {appointments
              .filter((apt) => {
                if (!appointmentSearch.trim()) return true;
                const term = appointmentSearch.toLowerCase();
                return (
                  getPatientName(apt).toLowerCase().includes(term) ||
                  getPatientId(apt, 0).toLowerCase().includes(term)
                );
              })
              .map((appointment, index) => {
                const status = getStatusVariant(appointment?.status);
                const isPending = String(appointment?.status || "").toLowerCase() === "pending";
                return (
                  <article key={`mobile-${appointment._id || appointment.id || index}`} className="rounded-xl border border-[#ECEEEC] p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[#191C1B]">{getPatientName(appointment)}</p>
                        <p className="text-[11px] text-[#3F4943] whitespace-nowrap">ID: {getPatientId(appointment, index)}</p>
                      </div>
                      <div className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 whitespace-nowrap ${status.wrap} ${status.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">{status.label}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-[#3F4943]">
                      <p className="whitespace-nowrap">{getDoctorName(appointment, defaultDoctorName)} • {getDoctorDept(appointment, defaultDoctorSpecialty)}</p>
                      <p className="whitespace-nowrap font-medium text-[#191C1B]">{getDateLabel(appointment)}</p>
                      <p className="whitespace-nowrap">{getTimeLabel(appointment)}</p>
                      <p className="whitespace-nowrap">Type: <span className="rounded-full bg-[#E6E9E7] px-2 py-0.5 text-[11px] font-bold text-[#3F4943]">{getTypeLabel(appointment)}</span></p>
                    </div>
                    <div className="mt-3.5 flex flex-wrap gap-2 pt-2 border-t border-[#ECEEEC]">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => confirmMutation.mutate(appointment._id || appointment.id)}
                          disabled={confirmMutation.isPending}
                          className="flex-1 min-h-[38px] flex items-center justify-center gap-1 rounded-lg bg-[#7EC143] px-3 py-1.5 text-xs font-bold text-[#0D2000] hover:brightness-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          Confirm
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setCancelModalAppointment(appointment)}
                        disabled={cancelMutation.isPending}
                        className="flex-1 min-h-[38px] flex items-center justify-center gap-1 rounded-lg border border-[#BA1A1A]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#BA1A1A] hover:bg-red-50 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Cancel
                      </button>
                      <Link
                        to="/admin/appointments"
                        className="min-h-[38px] flex items-center justify-center rounded-lg border border-[#BFC9C0]/40 px-3 py-1.5 text-xs font-medium text-[#005235] hover:bg-[#E6E9E7] transition-all"
                      >
                        Details
                      </Link>
                    </div>
                  </article>
                );
              })}
          </div>

          <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="bg-[#F2F4F2]/50">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-[#3F4943]">
                <th className="px-8 py-4 whitespace-nowrap">PATIENT</th>
                <th className="px-6 py-4 whitespace-nowrap">PRIMARY DOCTOR</th>
                <th className="px-6 py-4 whitespace-nowrap">DATE & TIME</th>
                <th className="px-6 py-4 whitespace-nowrap">TYPE</th>
                <th className="px-6 py-4 whitespace-nowrap">STATUS</th>
                <th className="px-8 py-4 text-right whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEEEC]">
              {appointments
                .filter((apt) => {
                  if (!appointmentSearch.trim()) return true;
                  const term = appointmentSearch.toLowerCase();
                  return (
                    getPatientName(apt).toLowerCase().includes(term) ||
                    getPatientId(apt, 0).toLowerCase().includes(term)
                  );
                })
                .map((appointment, index) => {
                  const status = getStatusVariant(appointment?.status);
                  const isPending = String(appointment?.status || "").toLowerCase() === "pending";
                  return (
                    <tr key={appointment._id || appointment.id || index} className="group transition-colors hover:bg-[#ACF36E]/10">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-[#E6E9E7] flex items-center justify-center font-bold text-[#005235] text-sm">
                            {getPatientName(appointment).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-[#191C1B] whitespace-nowrap">{getPatientName(appointment)}</div>
                            <div className="text-[11px] text-[#3F4943] whitespace-nowrap" title={getPatientId(appointment, index)}>ID: {getPatientId(appointment, index)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#191C1B] whitespace-nowrap">{getDoctorName(appointment, defaultDoctorName)}</div>
                        <div className="text-[11px] italic text-[#3F4943] whitespace-nowrap">{getDoctorDept(appointment, defaultDoctorSpecialty)}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#191C1B] whitespace-nowrap">{getDateLabel(appointment)}</div>
                        <div className="text-[11px] font-medium text-[#3F4943] whitespace-nowrap">{getTimeLabel(appointment)}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-block whitespace-nowrap rounded-full bg-[#E6E9E7] px-3 py-1 text-[11px] font-bold text-[#3F4943]">{getTypeLabel(appointment)}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 whitespace-nowrap ${status.wrap} ${status.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          <span className="text-[11px] font-bold uppercase tracking-tight whitespace-nowrap">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          {isPending && (
                            <button
                              type="button"
                              title="Confirm appointment"
                              aria-label="Confirm appointment"
                              disabled={confirmMutation.isPending}
                              onClick={() => confirmMutation.mutate(appointment._id || appointment.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#7EC143] px-3 py-1.5 text-xs font-bold text-[#0D2000] shadow-sm transition-all hover:brightness-95 active:scale-95 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                              Confirm
                            </button>
                          )}
                          <button
                            type="button"
                            title="Cancel appointment"
                            aria-label="Cancel appointment"
                            disabled={cancelMutation.isPending}
                            onClick={() => setCancelModalAppointment(appointment)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#BA1A1A]/30 bg-white px-2.5 py-1.5 text-xs font-bold text-[#BA1A1A] transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Cancel
                          </button>
                          <Link
                            to="/admin/appointments"
                            title="View appointment details"
                            aria-label="View appointment details"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#BFC9C0]/40 bg-white px-2.5 py-1.5 text-xs font-medium text-[#005235] transition-colors hover:bg-[#E6E9E7]"
                          >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          </div>
          </>
        )}

        <div className="flex justify-center p-6 sm:p-8 border-t border-[#ECEEEC]">
          <Link
            to="/admin/appointments"
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border-2 border-[#005235] bg-transparent px-6 py-2.5 font-bold text-sm text-[#005235] transition-all hover:bg-[#005235] hover:text-white"
          >
            <span>View All Appointments</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>

      <ConfirmationModal
        open={Boolean(cancelModalAppointment)}
        title="Cancel appointment"
        message={`Are you sure you want to cancel the appointment for ${getPatientName(cancelModalAppointment)}?`}
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        loading={cancelMutation.isPending}
        variant="danger"
        onCancel={() => setCancelModalAppointment(null)}
        onConfirm={async () => {
          if (!cancelModalAppointment) return;
          await cancelMutation.mutateAsync(cancelModalAppointment._id || cancelModalAppointment.id);
          setCancelModalAppointment(null);
        }}
      />
      </div>
    </div>
  );
}
