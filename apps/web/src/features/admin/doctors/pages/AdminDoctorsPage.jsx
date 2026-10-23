import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../../api/admin.api";
import { LoadingState } from "../../../../components/common/LoadingState";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await adminApi.getAllDoctors(params);
      if (res.data?.success) {
        setDoctors(res.data.data.doctors || []);
        setTotal(res.data.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      await adminApi.approveDoctor(id);
      setNotice({ type: "success", text: "Doctor approved successfully! They can now accept appointments." });
      await fetchDoctors();
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Failed to approve doctor" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      await adminApi.rejectDoctor(id);
      setNotice({ type: "success", text: "Doctor application rejected." });
      await fetchDoctors();
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Failed to reject doctor" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlockToggle = async (doc) => {
    try {
      setActionLoadingId(doc._id);
      const isBlocked = doc.userId?.isBlocked;
      if (isBlocked) {
        await adminApi.unblockDoctor(doc._id);
        setNotice({ type: "success", text: `Dr. ${doc.doctorName} unblocked.` });
      } else {
        await adminApi.blockDoctor(doc._id);
        setNotice({ type: "success", text: `Dr. ${doc.doctorName} blocked.` });
      }
      await fetchDoctors();
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Failed to toggle block status" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = doctors.filter((d) => d.status === "pending").length;

  return (
    <main className="page-container py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-[#005235]">
            Doctor Management
          </h1>
          <p className="mt-1 text-sm text-[#3F4943]">
            Review incoming doctor applications, approve credentials, and manage provider access.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-bold text-amber-800">
            <span className="material-symbols-outlined text-sm text-amber-600">notifications_active</span>
            <span>{pendingCount} application{pendingCount > 1 ? "s" : ""} awaiting approval</span>
          </div>
        )}
      </div>

      {notice && (
        <div
          className={`mb-6 flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="ml-2 font-bold text-xs">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-4 shadow-sm border border-[#E0E5E0]">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: "All Doctors", value: "" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                statusFilter === tab.value
                  ? "bg-[#005235] text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-gray-400">search</span>
          <input
            type="text"
            placeholder="Search by name, specialty, clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
          />
        </div>
      </div>

      {/* Doctor Cards / Table */}
      {loading ? (
        <LoadingState label="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="material-symbols-outlined mx-auto text-4xl text-gray-400">stethoscope</span>
          <h3 className="mt-2 text-sm font-bold text-gray-900">No doctors found</h3>
          <p className="mt-1 text-xs text-gray-500">
            {statusFilter || searchTerm
              ? "Try clearing filters or search terms."
              : "No doctor accounts have registered yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doctors.map((doc) => {
            const isPending = doc.status === "pending";
            const isApproved = doc.status === "approved";
            const isBlocked = Boolean(doc.userId?.isBlocked);

            return (
              <div
                key={doc._id}
                className="relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#005235]">
                        <span className="material-symbols-outlined text-2xl">medical_services</span>
                      </div>
                      <div>
                        <h2 className="font-headline text-base font-bold text-gray-900 leading-tight">
                          {doc.doctorName}
                        </h2>
                        <p className="text-xs font-semibold text-[#005235]">{doc.specialty}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-800"
                            : isPending
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                      {isBlocked && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase text-red-700">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-gray-400">apartment</span>
                      <span className="truncate">{doc.clinicName || "Clinic not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-gray-400">mail</span>
                      <span className="truncate">{doc.contactEmail || doc.userId?.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-gray-400">call</span>
                      <span>{doc.contactPhone || doc.userId?.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gray-500">Experience: <strong>{doc.experienceYears || 0} years</strong></span>
                      <span className="text-gray-500">Fee: <strong>PKR {doc.consultationFee || 0}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(doc)}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-2"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === doc._id}
                          onClick={() => handleApprove(doc._id)}
                          className="rounded-lg bg-[#005235] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#004028] disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === doc._id}
                          onClick={() => handleReject(doc._id)}
                          className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={actionLoadingId === doc._id}
                        onClick={() => handleBlockToggle(doc)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                          isBlocked
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {isBlocked ? "Unblock" : "Block"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-headline text-xl font-bold text-gray-900">{selectedDoctor.doctorName}</h3>
                <p className="text-xs font-semibold text-[#005235]">{selectedDoctor.specialty} — {selectedDoctor.clinicName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-gray-700">
              <div>
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">Title & Bio</h4>
                <p className="mt-1 leading-relaxed text-gray-600">{selectedDoctor.bio || selectedDoctor.aboutText || "No bio entered yet."}</p>
              </div>

              {selectedDoctor.qualifications?.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[10px]">Qualifications</h4>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selectedDoctor.qualifications.map((q, idx) => (
                      <span key={idx} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Email</p>
                  <p className="font-medium text-gray-800">{selectedDoctor.contactEmail || selectedDoctor.userId?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Phone</p>
                  <p className="font-medium text-gray-800">{selectedDoctor.contactPhone || selectedDoctor.userId?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Consultation Fee</p>
                  <p className="font-medium text-gray-800">PKR {selectedDoctor.consultationFee || "Not set"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Address</p>
                  <p className="font-medium text-gray-800 truncate">{selectedDoctor.clinicAddress || "—"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="rounded-xl bg-gray-100 px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
