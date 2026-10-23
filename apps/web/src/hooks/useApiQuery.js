import { useQuery } from "@tanstack/react-query";

export function useApiQuery({ queryFn, unwrapData = true, ...options }) {
  return useQuery({
    ...options,
    queryFn: async (context) => {
      const result = await queryFn(context);
      if (!unwrapData) return result;
      return result?.data ?? result;
    }
  });
}
