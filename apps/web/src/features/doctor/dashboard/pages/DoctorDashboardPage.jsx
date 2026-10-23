import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { appointmentsApi } from "../../../appointments/api/appointments.api";
import { doctorProfileApi } from "../../../doctor-profile/api/doctor-profile.api";
import { LoadingState } from "../../../../components/common/LoadingState";

export default function DoctorDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profRes, aptRes] = await Promise.allSettled([
        doctorProfileApi.getMyProfile(),
        appointmentsApi.getDoctorAppointments({ limit: 50 })
      ]);

      if (profRes.status === "fulfilled" && profRes.value.data?.success) {
        setProfile(profRes.value.data.data);
      }
      if (aptRes.status === "fulfilled" && aptRes.value.data?.success) {
        setAppointments(aptRes.value.data.data.appointments || []);
      }
    } catch (err) {
      console.error("Failed to load doctor dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusUpdate = async (id, action) => {
    try {
      setActionLoadingId(id);
      if (action === "confirm") {
        await appointmentsApi.confirm(id);
        setNotice({ type: "success", text: "Appointment confirmed!" });
      } else if (action === "complete") {
        await appointmentsApi.complete(id);
        setNotice({ type: "success", text: "Appointment marked as completed." });
      } else if (action === "no-show") {
        await appointmentsApi.markNoShow(id);
        setNotice({ type: "success", text: "Appointment marked as no-show." });
      } else if (action === "cancel") {
        await appointmentsApi.cancel(id, "Cancelled by doctor");
        setNotice({ type: "success", text: "Appointment cancelled." });
      }
      await loadData();
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || `Failed to update appointment` });
    } finally {
      setActionLoadingId(null);
    }
  };

  const isPending = profile?.status === "pending";
  const isApproved = profile?.status === "approved";

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayApts = appointments.filter((a) => a.appointmentDate === todayStr);
  const pendingApts = appointments.filter((a) => a.status === "pending");
  const confirmedApts = appointments.filter((a) => a.status === "confirmed");
  const completedApts = appointments.filter((a) => a.status === "completed");

  return (
    <div className="space-y-6">
      {/* Welcome & Approval Status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#073623]">
            Welcome, {profile?.doctorName || "Doctor"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            {profile?.specialty} • {profile?.clinicName || "Practice"}
          </p>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isApproved
                ? "bg-emerald-100 text-emerald-800"
                : isPending
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isApproved ? "verified" : isPending ? "hourglass_empty" : "cancel"}
            </span>
            {isApproved ? "Approved Provider" : isPending ? "Pending Review" : "Account Inactive"}
          </span>
        </div>
      </div>

      {isPending && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-3">
          <span className="material-symbols-outlined text-lg text-amber-600 shrink-0">info</span>
          <div>
            <p className="font-bold text-sm">Application Under Review</p>
            <p className="mt-0.5 text-amber-700">
              Your profile has been submitted and is waiting for administrator approval. Once approved, patients will be able to book consultations with you.
            </p>
          </div>
        </div>
      )}

      {notice && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's</span>
            <span className="material-symbols-outlined text-emerald-600">today</span>
          </div>
          <p className="mt-2 font-headline text-3xl font-bold text-gray-900">{todayApts.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Appointments scheduled for today</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <span className="material-symbols-outlined text-amber-500">pending_actions</span>
          </div>
          <p className="mt-2 font-headline text-3xl font-bold text-amber-700">{pendingApts.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Awaiting your confirmation</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
            <span className="material-symbols-outlined text-[#005235]">event_available</span>
          </div>
          <p className="mt-2 font-headline text-3xl font-bold text-[#005235]">{confirmedApts.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Ready for consultation</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <span className="material-symbols-outlined text-blue-600">task_alt</span>
          </div>
          <p className="mt-2 font-headline text-3xl font-bold text-blue-700">{completedApts.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Consultations finished</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-gray-900">Your Consultations</h2>
          <Link
            to="/doctor/appointments"
            className="text-xs font-bold text-[#005235] hover:underline"
          >
            View all appointments →
          </Link>
        </div>

        {loading ? (
          <LoadingState label="Loading appointments..." />
        ) : appointments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-xs text-gray-500">
            <span className="material-symbols-outlined text-3xl text-gray-300">event_busy</span>
            <p className="mt-2 font-medium">No appointments currently booked with you.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.slice(0, 10).map((apt) => {
                  const patientUser = apt.patientId?.userId;
                  const patientName = patientUser?.fullName || "Patient";
                  const patientPhone = patientUser?.phone || "—";

                  return (
                    <tr key={apt._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{patientName}</div>
                        <div className="text-[11px] text-gray-500">{patientPhone}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{apt.appointmentDate}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{apt.startTime} - {apt.endTime}</div>
                      </td>

                      <td className="px-4 py-3 max-w-xs truncate text-gray-600">
                        {apt.reason || "General Consultation"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            apt.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : apt.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : apt.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {apt.status === "pending" && (
                            <button
                              type="button"
                              disabled={actionLoadingId === apt._id}
                              onClick={() => handleStatusUpdate(apt._id, "confirm")}
                              className="rounded-lg bg-[#005235] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#004028] disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status === "confirmed" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoadingId === apt._id}
                                onClick={() => handleStatusUpdate(apt._id, "complete")}
                                className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                Complete
                              </button>
                              <button
                                type="button"
                                disabled={actionLoadingId === apt._id}
                                onClick={() => handleStatusUpdate(apt._id, "no-show")}
                                className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                              >
                                No-Show
                              </button>
                            </>
                          )}
                          {["pending", "confirmed"].includes(apt.status) && (
                            <button
                              type="button"
                              disabled={actionLoadingId === apt._id}
                              onClick={() => handleStatusUpdate(apt._id, "cancel")}
                              className="rounded-lg bg-red-50 border border-red-200 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
