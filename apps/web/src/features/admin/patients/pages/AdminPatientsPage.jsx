import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorState } from "../../../../components/common/ErrorState";
import { LoadingState } from "../../../../components/common/LoadingState";
import { ConfirmationModal } from "../../../../components/common/ConfirmationModal";
import { adminApi } from "../../api/admin.api.js";
import { formatDate } from "../../../../utils/helpers";

function getInitials(name) {
  if (!name) return "P";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "bg-[#005235] text-white",
    "bg-[#1A6B4A] text-white",
    "bg-[#2F4D3F] text-white",
    "bg-[#3A6F00] text-white",
    "bg-[#006A60] text-white"
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function AdminPatientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [blockCandidate, setBlockCandidate] = useState("");
  const [unblockCandidate, setUnblockCandidate] = useState("");

  const { data: patientsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: async () => {
      const response = await adminApi.getAllPatients();
      return response.data?.data ?? response.data;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: false
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-patient", selectedId],
    queryFn: async () => {
      const response = await adminApi.getPatientById(selectedId);
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(selectedId)
  });

  const blockMutation = useMutation({
    mutationFn: async (id) => {
      await adminApi.blockPatient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      if (selectedId) {
        queryClient.invalidateQueries({ queryKey: ["admin-patient", selectedId] });
      }
    }
  });

  const unblockMutation = useMutation({
    mutationFn: async (id) => {
      await adminApi.unblockPatient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
      if (selectedId) {
        queryClient.invalidateQueries({ queryKey: ["admin-patient", selectedId] });
      }
    }
  });

  const allPatients = patientsData?.patients || [];

  const filteredPatients = useMemo(() => {
    let result = allPatients;

    if (statusFilter === "active") {
      result = result.filter((p) => !p.isBlocked);
    } else if (statusFilter === "blocked") {
      result = result.filter((p) => p.isBlocked);
    }

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((item) => {
        const fullName = item.fullName?.toLowerCase() || "";
        const email = item.email?.toLowerCase() || "";
        const id = item.id?.toLowerCase() || "";
        const phone = item.phone?.toLowerCase() || "";
        return fullName.includes(term) || email.includes(term) || id.includes(term) || phone.includes(term);
      });
    }

    return result;
  }, [allPatients, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const currentPatients = filteredPatients.slice(pageStart, pageStart + pageSize);

  const selectedPatient = detailData || allPatients.find((p) => p.id === selectedId) || null;

  const totalPatients = allPatients.length;
  const activePatients = allPatients.filter((item) => !item.isBlocked).length;
  const blockedPatients = allPatients.filter((item) => item.isBlocked).length;
  const newRegistrations = allPatients.filter((item) => {
    if (!item.createdAt) return false;
    const created = new Date(item.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState label="Loading patient records..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Unable to load patients"
          description="Failed to fetch the latest patient directory. Please retry."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAF8]">
      <main className={`min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 transition-all duration-300 ${selectedId ? "xl:pr-[460px]" : ""}`}>
        <div className="mx-auto w-full max-w-[1280px]">
          
          {/* Page Header */}
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-headline text-2xl font-bold tracking-tight text-[#005235] sm:text-3xl">Patient Directory</h1>
                <span className="rounded-full bg-[#A5F3C9]/40 px-3 py-0.5 text-xs font-bold text-[#005235]">
                  {totalPatients} Total
                </span>
              </div>
              <p className="mt-1 text-sm text-[#4A5568]">
                Review all registered patient accounts, monitor status, and manage access permissions.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-[#6F7A72]">
                search
              </span>
              <input
                id="admin-patients-search"
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, or ID..."
                aria-label="Search patients by name, email, or ID"
                className="w-full rounded-xl border border-[#BFC9C0]/30 bg-white py-2.5 pl-10 pr-9 text-sm text-[#191C1B] shadow-sm transition-all placeholder:text-[#8E9B93] focus:border-[#005235] focus:outline-none focus:ring-1 focus:ring-[#005235]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6F7A72] hover:text-[#191C1B]"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </header>

          {/* Quick Stats Grid */}
          <section className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            <div className="rounded-xl border border-[#ECEEEC] bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">TOTAL PATIENTS</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#A5F3C9]/40 text-[#005235]">
                  <span className="material-symbols-outlined text-base">groups</span>
                </div>
              </div>
              <p className="font-headline text-2xl font-bold text-[#191C1B]">{totalPatients.toLocaleString()}</p>
              <p className="mt-1 text-xs text-[#6F7A72]">Registered in system</p>
            </div>

            <div className="rounded-xl border border-[#ECEEEC] bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">ACTIVE ACCOUNTS</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ACF36E]/40 text-[#3A6F00]">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                </div>
              </div>
              <p className="font-headline text-2xl font-bold text-[#191C1B]">{activePatients.toLocaleString()}</p>
              <p className="mt-1 text-xs text-emerald-600 font-medium">In good standing</p>
            </div>

            <div className="rounded-xl border border-[#ECEEEC] bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">NEW THIS MONTH</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9EAD7]/50 text-[#304D3F]">
                  <span className="material-symbols-outlined text-base">person_add</span>
                </div>
              </div>
              <p className="font-headline text-2xl font-bold text-[#191C1B]">{newRegistrations.toLocaleString()}</p>
              <p className="mt-1 text-xs text-[#6F7A72]">Joined this month</p>
            </div>

            <div className="rounded-xl border border-[#ECEEEC] bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">BLOCKED / RESTRICTED</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFDAD6]/60 text-[#BA1A1A]">
                  <span className="material-symbols-outlined text-base">block</span>
                </div>
              </div>
              <p className="font-headline text-2xl font-bold text-[#BA1A1A]">{blockedPatients.toLocaleString()}</p>
              <p className="mt-1 text-xs text-[#6F7A72]">Access suspended</p>
            </div>
          </section>

          {/* Table Container Card */}
          <div className="overflow-hidden rounded-xl border border-[#ECEEEC] bg-white shadow-sm">
            
            {/* Filter Tabs and Actions Bar */}
            <div className="flex flex-col gap-3 border-b border-[#ECEEEC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === "all"
                      ? "bg-[#005235] text-white shadow-sm"
                      : "text-[#6F7A72] hover:bg-[#F2F4F2] hover:text-[#191C1B]"
                  }`}
                >
                  All ({totalPatients})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("active");
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === "active"
                      ? "bg-[#005235] text-white shadow-sm"
                      : "text-[#6F7A72] hover:bg-[#F2F4F2] hover:text-[#191C1B]"
                  }`}
                >
                  Active ({activePatients})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("blocked");
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === "blocked"
                      ? "bg-[#BA1A1A] text-white shadow-sm"
                      : "text-[#6F7A72] hover:bg-[#F2F4F2] hover:text-[#191C1B]"
                  }`}
                >
                  Blocked ({blockedPatients})
                </button>
              </div>

              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-2 text-xs text-[#6F7A72]">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  aria-label="Patients per page"
                  className="rounded-lg border border-[#BFC9C0]/30 bg-[#F2F4F2] px-2.5 py-1 text-xs font-medium text-[#191C1B] focus:outline-none focus:ring-1 focus:ring-[#005235]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Mobile Card List View */}
            <div className="divide-y divide-[#ECEEEC] md:hidden">
              {currentPatients.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#6F7A72]">
                  No patients match the selected filter.
                </div>
              ) : (
                currentPatients.map((patient) => {
                  const initials = getInitials(patient.fullName);
                  const isBlocked = Boolean(patient.isBlocked);
                  return (
                    <article
                      key={`mobile-${patient.id}`}
                      className={`p-4 transition-colors ${
                        selectedId === patient.id ? "bg-[#A5F3C9]/15" : "hover:bg-[#F8FAF8]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-sm ${getAvatarColor(patient.fullName)}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#191C1B]">{patient.fullName}</p>
                            <p className="text-[11px] text-[#6F7A72]">ID: #{patient.id?.slice(-6) || "0000"}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isBlocked ? "bg-[#FFDAD6] text-[#93000A]" : "bg-[#ACF36E] text-[#3A6F00]"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isBlocked ? "bg-[#BA1A1A]" : "bg-[#386B00]"}`} />
                          {isBlocked ? "Blocked" : "Active"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-[#4A5568]">
                        <p className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-[#8E9B93]">mail</span>
                          {patient.email}
                        </p>
                        {patient.phone && (
                          <p className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-[#8E9B93]">call</span>
                            {patient.phone}
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 text-[11px] text-[#6F7A72]">
                          <span className="material-symbols-outlined text-[15px] text-[#8E9B93]">calendar_today</span>
                          Joined {formatDate(patient.createdAt || Date.now())}
                        </p>
                      </div>

                      <div className="mt-4 flex gap-2 pt-2 border-t border-[#ECEEEC]">
                        <button
                          type="button"
                          onClick={() => setSelectedId(patient.id)}
                          className="flex-1 min-h-[38px] flex items-center justify-center gap-1 rounded-lg border border-[#005235]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#005235] hover:bg-[#E6E9E7] transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isBlocked) {
                              setUnblockCandidate(patient.id);
                            } else {
                              setBlockCandidate(patient.id);
                            }
                          }}
                          className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isBlocked
                              ? "bg-[#ACF36E] text-[#285000] hover:brightness-95"
                              : "border border-[#BA1A1A]/30 bg-white text-[#BA1A1A] hover:bg-red-50"
                          }`}
                        >
                          {isBlocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead className="bg-[#F8FAF8] border-b border-[#ECEEEC]">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">
                    <th className="px-6 py-4">PATIENT</th>
                    <th className="px-6 py-4">CONTACT INFO</th>
                    <th className="px-6 py-4 text-center">APPOINTMENTS</th>
                    <th className="px-6 py-4">REGISTERED</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEEEC]">
                  {currentPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6F7A72]">
                        No patients match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    currentPatients.map((patient) => {
                      const initials = getInitials(patient.fullName);
                      const isBlocked = Boolean(patient.isBlocked);
                      const isSelected = selectedId === patient.id;

                      return (
                        <tr
                          key={patient.id}
                          className={`group transition-colors ${
                            isSelected ? "bg-[#A5F3C9]/15" : "hover:bg-[#F8FAF8]"
                          }`}
                        >
                          {/* Patient Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-sm ${getAvatarColor(patient.fullName)}`}>
                                {initials}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-[#191C1B] group-hover:text-[#005235] transition-colors">
                                  {patient.fullName}
                                </div>
                                <div className="text-[11px] font-mono text-[#6F7A72]">
                                  #{patient.id?.slice(-8) || "PT-0000"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#191C1B] font-medium">{patient.email}</div>
                            <div className="text-xs text-[#6F7A72]">{patient.phone || "No phone provided"}</div>
                          </td>

                          {/* Appointments Count */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center rounded-full bg-[#E6E9E7] px-2.5 py-0.5 text-xs font-bold text-[#005235]">
                              {patient.appointmentCount ?? 0}
                            </span>
                          </td>

                          {/* Registered Date */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#191C1B]">
                              {formatDate(patient.createdAt || Date.now())}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                              isBlocked ? "bg-[#FFDAD6] text-[#93000A]" : "bg-[#ACF36E] text-[#3A6F00]"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isBlocked ? "bg-[#BA1A1A]" : "bg-[#386B00]"}`} />
                              {isBlocked ? "Blocked" : "Active"}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button
                                type="button"
                                title="View Patient Details"
                                aria-label={`View details for ${patient.fullName}`}
                                onClick={() => setSelectedId(patient.id)}
                                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                                  isSelected
                                    ? "bg-[#005235] text-white border-[#005235]"
                                    : "border-[#BFC9C0]/40 bg-white text-[#005235] hover:bg-[#E6E9E7]"
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                View
                              </button>

                              <button
                                type="button"
                                title={isBlocked ? "Unblock Patient" : "Block Patient"}
                                aria-label={isBlocked ? `Unblock ${patient.fullName}` : `Block ${patient.fullName}`}
                                onClick={() => {
                                  if (isBlocked) {
                                    setUnblockCandidate(patient.id);
                                  } else {
                                    setBlockCandidate(patient.id);
                                  }
                                }}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                                  isBlocked
                                    ? "bg-[#ACF36E] text-[#285000] hover:brightness-95 active:scale-95"
                                    : "border border-[#BA1A1A]/30 bg-white text-[#BA1A1A] hover:bg-red-50 active:scale-95"
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {isBlocked ? "lock_open" : "block"}
                                </span>
                                {isBlocked ? "Unblock" : "Block"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex flex-col gap-3 border-t border-[#ECEEEC] bg-[#F8FAF8] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-[#6F7A72]">
                Showing <span className="font-bold text-[#191C1B]">{filteredPatients.length === 0 ? 0 : pageStart + 1}</span> to{" "}
                <span className="font-bold text-[#191C1B]">{Math.min(pageStart + pageSize, filteredPatients.length)}</span> of{" "}
                <span className="font-bold text-[#191C1B]">{filteredPatients.length}</span> patients
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#BFC9C0]/40 bg-white text-[#6F7A72] transition-colors hover:bg-[#F2F4F2] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((pageNum, idx, arr) => {
                      const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                      return (
                        <div key={pageNum} className="flex items-center">
                          {showEllipsis && <span className="px-1 text-xs text-[#6F7A72]">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-bold transition-all ${
                              currentPage === pageNum
                                ? "bg-[#005235] text-white shadow-sm"
                                : "border border-[#BFC9C0]/40 bg-white text-[#4A5568] hover:bg-[#F2F4F2]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        </div>
                      );
                    })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#BFC9C0]/40 bg-white text-[#6F7A72] transition-colors hover:bg-[#F2F4F2] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Patient Detail Slide-Over Drawer */}
      {selectedId ? (
        <aside className="fixed inset-0 z-50 overflow-y-auto border-l border-[#ECEEEC] bg-white shadow-2xl transition-all md:left-auto md:w-[440px]">
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-[#ECEEEC] pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005235]">badge</span>
                <span className="font-headline font-bold text-lg text-[#191C1B]">Patient Profile</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId("")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6F7A72] transition-colors hover:bg-[#F2F4F2] hover:text-[#191C1B]"
                aria-label="Close details drawer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12">
                <LoadingState label="Loading patient details..." />
              </div>
            ) : selectedPatient ? (
              <div className="space-y-6">
                
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-3 flex h-20 w-20 items-center justify-center rounded-2xl font-bold text-2xl shadow-md ${getAvatarColor(selectedPatient.fullName)}`}>
                    {getInitials(selectedPatient.fullName)}
                  </div>
                  <h3 className="font-headline text-xl font-bold text-[#191C1B]">
                    {selectedPatient.fullName}
                  </h3>
                  <p className="font-mono text-xs text-[#6F7A72] mt-0.5">
                    ID: #{selectedPatient.id || selectedId}
                  </p>
                  <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    selectedPatient.isBlocked ? "bg-[#FFDAD6] text-[#93000A]" : "bg-[#ACF36E] text-[#3A6F00]"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedPatient.isBlocked ? "bg-[#BA1A1A]" : "bg-[#386B00]"}`} />
                    {selectedPatient.isBlocked ? "Account Blocked" : "Active Patient"}
                  </span>
                </div>

                {/* Core Account Details */}
                <div className="rounded-xl border border-[#ECEEEC] bg-[#F8FAF8] p-4 space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">CONTACT DETAILS</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[#ECEEEC]/60">
                      <span className="text-[#6F7A72]">Email</span>
                      <span className="font-medium text-[#191C1B]">{selectedPatient.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#ECEEEC]/60">
                      <span className="text-[#6F7A72]">Phone</span>
                      <span className="font-medium text-[#191C1B]">{selectedPatient.phone || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#6F7A72]">Member Since</span>
                      <span className="font-medium text-[#191C1B]">
                        {formatDate(selectedPatient.createdAt || Date.now())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Extra Info */}
                {selectedPatient.profile && (
                  <div className="rounded-xl border border-[#ECEEEC] bg-white p-4 space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6F7A72]">HEALTH INFORMATION</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-lg bg-[#F8FAF8] p-2.5">
                        <span className="text-[10px] text-[#6F7A72] block uppercase">GENDER</span>
                        <span className="font-bold text-[#191C1B] capitalize">{selectedPatient.profile.gender || "-"}</span>
                      </div>
                      <div className="rounded-lg bg-[#F8FAF8] p-2.5">
                        <span className="text-[10px] text-[#6F7A72] block uppercase">BLOOD TYPE</span>
                        <span className="font-bold text-[#191C1B]">{selectedPatient.profile.bloodType || "-"}</span>
                      </div>
                      <div className="rounded-lg bg-[#F8FAF8] p-2.5">
                        <span className="text-[10px] text-[#6F7A72] block uppercase">BIRTH DATE</span>
                        <span className="font-bold text-[#191C1B]">{selectedPatient.profile.dateOfBirth || "-"}</span>
                      </div>
                      <div className="rounded-lg bg-[#F8FAF8] p-2.5">
                        <span className="text-[10px] text-[#6F7A72] block uppercase">EMERGENCY PHONE</span>
                        <span className="font-bold text-[#191C1B]">{selectedPatient.profile.emergencyContact || "-"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Access Control Actions */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = selectedPatient.id || selectedId;
                      if (selectedPatient.isBlocked) {
                        setUnblockCandidate(targetId);
                      } else {
                        setBlockCandidate(targetId);
                      }
                    }}
                    disabled={blockMutation.isPending || unblockMutation.isPending}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-sm transition-all active:scale-[0.99] ${
                      selectedPatient.isBlocked
                        ? "bg-[#7EC143] text-[#0D2000] hover:brightness-95"
                        : "bg-[#BA1A1A] text-white hover:bg-red-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {selectedPatient.isBlocked ? "lock_open" : "block"}
                    </span>
                    {selectedPatient.isBlocked ? "Restore Patient Access" : "Block Patient Account"}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-[#6F7A72]">
                    {selectedPatient.isBlocked
                      ? "Unblocking will immediately allow the patient to book appointments and log in."
                      : "Blocking prevents the patient from making bookings and accessing their portal."}
                  </p>
                </div>

              </div>
            ) : null}
          </div>
        </aside>
      ) : null}

      {/* Confirmation Modal for Block */}
      <ConfirmationModal
        open={Boolean(blockCandidate)}
        title="Block Patient Account"
        message="Are you sure you want to block this patient? They will be unable to log in or schedule new appointments."
        confirmLabel="Block Patient"
        cancelLabel="Cancel"
        loading={blockMutation.isPending}
        variant="danger"
        onCancel={() => setBlockCandidate("")}
        onConfirm={async () => {
          if (!blockCandidate) return;
          await blockMutation.mutateAsync(blockCandidate);
          setBlockCandidate("");
        }}
      />

      {/* Confirmation Modal for Unblock */}
      <ConfirmationModal
        open={Boolean(unblockCandidate)}
        title="Restore Patient Access"
        message="Are you sure you want to restore access for this patient? They will be able to log in and schedule appointments normally."
        confirmLabel="Restore Access"
        cancelLabel="Cancel"
        loading={unblockMutation.isPending}
        variant="success"
        onCancel={() => setUnblockCandidate("")}
        onConfirm={async () => {
          if (!unblockCandidate) return;
          await unblockMutation.mutateAsync(unblockCandidate);
          setUnblockCandidate("");
        }}
      />
    </div>
  );
}
