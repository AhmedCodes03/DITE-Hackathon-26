import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../hooks/useApiQuery";
import { availabilityApi } from "../api/availability.api.js";

export function useAvailability() {
  return useApiQuery({
    queryKey: ["availability"],
    queryFn: availabilityApi.getAll
  });
}

export function useAvailableSlots(date) {
  return useApiQuery({
    queryKey: ["availability-slots", date],
    queryFn: () => availabilityApi.getSlots(date),
    enabled: !!date
  });
}

export function useAvailabilityMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["availability"] });
    queryClient.invalidateQueries({ queryKey: ["availability-slots"] });
  };

  return {
    create: useMutation({
      mutationFn: async (data) => {
        const response = await availabilityApi.create(data);
        return response.data;
      },
      onSuccess: invalidate
    }),
    update: useMutation({
      mutationFn: async ({ id, data }) => {
        const response = await availabilityApi.update(id, data);
        return response.data;
      },
      onSuccess: invalidate
    }),
    delete: useMutation({
      mutationFn: async (id) => {
        const response = await availabilityApi.delete(id);
        return response.data;
      },
      onSuccess: invalidate
    })
  };
}
