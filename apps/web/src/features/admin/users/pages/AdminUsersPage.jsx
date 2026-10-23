import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../../api/admin.api";
import { LoadingState } from "../../../../components/common/LoadingState";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminApi.getAllUsers(params);
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
        setTotal(res.data.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlockToggle = async (user) => {
    try {
      setActionLoadingId(user._id);
      if (user.isBlocked) {
        await adminApi.unblockUser(user._id);
        setNotice({ type: "success", text: `User ${user.fullName} unblocked.` });
      } else {
        await adminApi.blockUser(user._id);
        setNotice({ type: "success", text: `User ${user.fullName} blocked.` });
      }
      await fetchUsers();
    } catch (err) {
      setNotice({ type: "error", text: err.response?.data?.message || "Failed to update user status" });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <main className="page-container py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-[#005235]">
            User Directory
          </h1>
          <p className="mt-1 text-sm text-[#3F4943]">
            Manage all registered patient and doctor accounts, monitor statuses, and govern access.
          </p>
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Total Users: <strong className="text-gray-900">{total}</strong>
        </div>
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
            { label: "All Users", value: "" },
            { label: "Patients", value: "patient" },
            { label: "Doctors", value: "doctor" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRoleFilter(tab.value)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                roleFilter === tab.value
                  ? "bg-[#005235] text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-gray-400">search</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#005235]"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingState label="Loading users..." />
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <span className="material-symbols-outlined mx-auto text-4xl text-gray-400">group_off</span>
          <h3 className="mt-2 text-sm font-bold text-gray-900">No users found</h3>
          <p className="mt-1 text-xs text-gray-500">Try clearing filters or search terms.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {users.map((u) => {
                  const isBlocked = Boolean(u.isBlocked);
                  return (
                    <tr key={u._id} className="transition hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            u.role === "doctor" ? "bg-emerald-100 text-[#005235]" : "bg-blue-100 text-blue-700"
                          }`}>
                            {u.fullName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{u.fullName}</div>
                            <div className="text-[11px] text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          u.role === "doctor"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {u.role === "doctor" ? "stethoscope" : "person"}
                          </span>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {u.phone || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          isBlocked
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={actionLoadingId === u._id}
                          onClick={() => handleBlockToggle(u)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                            isBlocked
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {isBlocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
