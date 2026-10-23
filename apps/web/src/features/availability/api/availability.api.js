import apiClient from "../../../services/apiClient";
import { ensureSuccess, resolveHybrid } from "../../../services/hybrid";
import {
  createAvailabilityMock,
  deleteAvailabilityMock,
  getAvailabilityMock,
  getAvailabilitySlotsMock,
  updateAvailabilityMock
} from "../../../mocks";

export async function getAvailabilityRules() {
  const result = await resolveHybrid({
    apiCall: () => apiClient.get("/availability"),
    mockCall: () => getAvailabilityMock(),
    placeholderCheck: (normalized) => {
      const message = String(normalized?.message || "").toLowerCase();
      return message.includes("placeholder") || !Array.isArray(normalized?.data);
    }
  });

  return ensureSuccess(result, "Unable to load availability rules");
}

export async function getSlotsByDate(date) {
  const result = await resolveHybrid({
    apiCall: () => apiClient.get("/availability/slots", { params: { date } }),
    mockCall: () => getAvailabilitySlotsMock(date),
    placeholderCheck: (normalized) => {
      const message = String(normalized?.message || "").toLowerCase();
      return message.includes("placeholder") || !normalized?.data?.slots;
    }
  });

  return ensureSuccess(result, "Unable to load slots");
}

export async function createAvailability(payload) {
  const result = await resolveHybrid({
    apiCall: () => apiClient.post("/availability", payload),
    mockCall: () => createAvailabilityMock(payload)
  });

  return ensureSuccess(result, "Unable to create availability");
}

export async function patchAvailability(id, payload) {
  const result = await resolveHybrid({
    apiCall: () => apiClient.patch(`/availability/${id}`, payload),
    mockCall: () => updateAvailabilityMock(id, payload)
  });

  return ensureSuccess(result, "Unable to update availability");
}

export async function removeAvailability(id) {
  const result = await resolveHybrid({
    apiCall: () => apiClient.delete(`/availability/${id}`),
    mockCall: () => deleteAvailabilityMock(id)
  });

  return ensureSuccess(result, "Unable to delete availability");
}
