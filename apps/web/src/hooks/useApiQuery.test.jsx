import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useApiQuery } from "./useApiQuery";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

  return function Wrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useApiQuery", () => {
  it("unwraps result.data by default", async () => {
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ["api-query-default"],
          queryFn: async () => ({ data: { ok: true } })
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ ok: true });
  });

  it("returns full response when unwrapData is false", async () => {
    const fullResponse = { data: { ok: true }, status: 200 };

    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ["api-query-raw"],
          queryFn: async () => fullResponse,
          unwrapData: false
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(fullResponse);
  });
});
