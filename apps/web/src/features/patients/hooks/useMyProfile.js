import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { getMyProfile, updateMyProfile } from "../api/patients.api";

export const myProfileQueryKey = ["patients", "me"];

export function useMyProfile(options = {}) {
  return useApiQuery({
    queryKey: myProfileQueryKey,
    queryFn: getMyProfile,
    select: (payload) => payload?.data ?? payload,
    enabled: options.enabled ?? true
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (result) => {
      queryClient.setQueryData(myProfileQueryKey, result?.data ?? result);
    }
  });
}
