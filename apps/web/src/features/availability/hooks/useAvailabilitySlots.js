import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAvailability,
  getAvailabilityRules,
  getSlotsByDate,
  patchAvailability,
  removeAvailability
} from "../api/availability.api";

export const availabilityQueryKey = ["availability"];

export function useAvailability() {
  return useQuery({
    queryKey: availabilityQueryKey,
    queryFn: async () => (await getAvailabilityRules()).data
  });
}

export function useAvailabilitySlots(date) {
  return useQuery({
    queryKey: ["availability-slots", date],
    queryFn: async () => (await getSlotsByDate(date)).data,
    enabled: Boolean(date)
  });
}

export function useAvailabilityMutations() {
  const queryClient = useQueryClient();

  const refresh = () => queryClient.invalidateQueries({ queryKey: availabilityQueryKey });

  return {
    createRule: useMutation({ mutationFn: createAvailability, onSuccess: refresh }),
    updateRule: useMutation({ mutationFn: ({ id, payload }) => patchAvailability(id, payload), onSuccess: refresh }),
    deleteRule: useMutation({ mutationFn: removeAvailability, onSuccess: refresh })
  };
}
