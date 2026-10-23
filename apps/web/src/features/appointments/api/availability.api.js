import apiClient from "../../../services/apiClient.js";

export const availabilityApi = {
  getAll: async () => {
    return apiClient.get("/availability");
  },

  getSlots: async (date) => {
    return apiClient.get("/availability/slots", { params: { date } });
  },

  create: async (data) => {
    return apiClient.post("/availability", data);
  },

  update: async (id, data) => {
    return apiClient.patch(`/availability/${id}`, data);
  },

  delete: async (id) => {
    return apiClient.delete(`/availability/${id}`);
  }
};
