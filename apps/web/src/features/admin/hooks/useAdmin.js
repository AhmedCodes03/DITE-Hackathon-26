import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { adminApi } from "../api/admin.api.js";

export function useAdminDashboard() {
  return useApiQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminApi.getDashboardStats,
    refetchInterval: 60_000
  });
}

export function useAdminPatients(filters = {}) {
  return useApiQuery({
    queryKey: ["admin-patients", filters],
    queryFn: () => adminApi.getAllPatients(filters)
  });
}

export function useAdminPatient(id) {
  return useApiQuery({
    queryKey: ["admin-patient", id],
    queryFn: () => adminApi.getPatientById(id),
    enabled: Boolean(id)
  });
}

export function useAdminPatientMutations() {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-patients"] });
    queryClient.invalidateQueries({ queryKey: ["admin-patient"] });
  };

  return {
    block: useMutation({
      mutationFn: adminApi.blockPatient,
      onSuccess: refresh
    }),
    unblock: useMutation({
      mutationFn: adminApi.unblockPatient,
      onSuccess: refresh
    })
  };
}
