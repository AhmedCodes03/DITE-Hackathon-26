import { useState, useEffect, useCallback } from "react";
import { appointmentsApi } from "../../../appointments/api/appointments.api";
import { LoadingState } from "../../../../components/common/LoadingState";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const res = await appointmentsApi.getDoctorAppointments(params);
      if (res.data?.success) {
        setAppointments(res.data.data.appointments || []);
        setTotal(res.data.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load doctor appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
      await fetchAppointments();
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || `Failed to update appointment` });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-[#073623]">
            My Patient Appointments
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            View patient bookings, confirm slots, mark consultations complete, or reschedule.
          </p>
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Total Bookings: <strong className="text-gray-900">{total}</strong>
        </div>
      </div>

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

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: "All", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                statusFilter === tab.value
                  ? "bg-[#073623] text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#073623]"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter("")}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingState label="Loading appointments..." />
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-300">event_busy</span>
            <p className="mt-2 font-medium">No appointments match the chosen filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/75 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Date & Slot</th>
                  <th className="px-5 py-3.5">Reason for Visit</th>
                  <th className="px-5 py-3.5">Notes</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => {
                  const patientUser = apt.patientId?.userId;
                  const patientName = patientUser?.fullName || "Patient";
                  const patientEmail = patientUser?.email || "";
                  const patientPhone = patientUser?.phone || "";

                  return (
                    <tr key={apt._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{patientName}</div>
                        <div className="text-[11px] text-gray-500">{patientPhone} {patientEmail && `• ${patientEmail}`}</div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{apt.appointmentDate}</div>
                        <div className="text-[11px] font-mono text-emerald-800 font-semibold">{apt.startTime} - {apt.endTime}</div>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs text-gray-700">
                        {apt.reason || "—"}
                      </td>

                      <td className="px-5 py-3.5 max-w-xs text-gray-500 truncate">
                        {apt.notes || "None"}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
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

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
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
