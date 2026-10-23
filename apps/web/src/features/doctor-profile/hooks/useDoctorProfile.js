import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { doctorProfileApi } from "../api/doctor-profile.api.js";

export const doctorProfileQueryKey = ["doctor-profile"];

export function useDoctorProfile() {
  return useApiQuery({
    queryKey: doctorProfileQueryKey,
    queryFn: doctorProfileApi.getDoctorProfile,
    staleTime: 5 * 60_000,
    select: (payload) => payload?.data ?? payload
  });
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await doctorProfileApi.updateDoctorProfile(payload);
      return response?.data ?? response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(doctorProfileQueryKey, data);
      queryClient.invalidateQueries({ queryKey: doctorProfileQueryKey });
    }
  });
}
