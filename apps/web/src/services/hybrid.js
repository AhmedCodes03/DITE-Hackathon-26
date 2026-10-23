import { API_MODES } from "../utils/constants";
import { env } from "./env";

function normalizeEnvelope(raw) {
  const payload = raw?.data && raw?.status ? raw.data : raw;

  return {
    success: Boolean(payload?.success),
    message: payload?.message || "",
    data: payload?.data,
    errors: payload?.errors || []
  };
}

function looksPlaceholder(result) {
  const message = String(result?.message || "").toLowerCase();
  return message.includes("placeholder") || (result?.success && result?.data == null);
}

export async function resolveHybrid({
  apiCall,
  mockCall,
  placeholderCheck = looksPlaceholder,
  mode = env.apiMode
}) {
  if (mode === API_MODES.MOCK) {
    return normalizeEnvelope(await mockCall());
  }

  if (mode === API_MODES.API) {
    return normalizeEnvelope(await apiCall());
  }

  try {
    const apiResult = normalizeEnvelope(await apiCall());
    if (!placeholderCheck(apiResult)) {
      return apiResult;
    }
  } catch {
    // In hybrid mode fallback to mock on network/runtime API errors.
  }

  return normalizeEnvelope(await mockCall());
}

export function ensureSuccess(result, fallbackMessage = "Request failed") {
  if (!result.success) {
    const error = new Error(result.message || fallbackMessage);
    error.details = result.errors || [];
    throw error;
  }

  return result;
}
