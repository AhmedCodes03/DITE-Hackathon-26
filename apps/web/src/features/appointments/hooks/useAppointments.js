import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { appointmentsApi } from "../api/appointments.api.js";

export const patientAppointmentsKey = ["patient-appointments"];

export function useMyAppointments(params = {}) {
  return useApiQuery({
    queryKey: [...patientAppointmentsKey, params],
    queryFn: () => appointmentsApi.getMyAppointments(params),
    refetchOnWindowFocus: true
  });
}

export function useAdminAppointments(filters = {}) {
  return useApiQuery({
    queryKey: ["admin-appointments", filters],
    queryFn: () => appointmentsApi.getAdminAppointments(filters),
    refetchInterval: 60_000
  });
}

export function useAppointmentMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: patientAppointmentsKey });
    queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  return {
    book: useMutation({
      mutationFn: appointmentsApi.book,
      onSuccess: invalidate
    }),
    cancel: useMutation({
      mutationFn: ({ id, reason }) => appointmentsApi.cancel(id, reason),
      onSuccess: invalidate
    }),
    reschedule: useMutation({
      mutationFn: ({ id, data }) => appointmentsApi.reschedule(id, data),
      onSuccess: invalidate
    }),
    confirm: useMutation({
      mutationFn: appointmentsApi.confirm,
      onSuccess: invalidate
    }),
    complete: useMutation({
      mutationFn: appointmentsApi.complete,
      onSuccess: invalidate
    }),
    markNoShow: useMutation({
      mutationFn: appointmentsApi.markNoShow,
      onSuccess: invalidate
    }),
    markApprovalSeen: useMutation({
      mutationFn: appointmentsApi.markApprovalSeen,
      onSuccess: invalidate
    })
  };
}
