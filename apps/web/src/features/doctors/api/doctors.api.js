import apiClient from "../../../services/apiClient.js";

export const doctorsApi = {
  listDoctors: async (params = {}) => {
    const response = await apiClient.get("/doctors", { params });
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await apiClient.get(`/doctors/${id}`);
    return response.data;
  },

  getDoctorAvailability: async (id) => {
    const response = await apiClient.get(`/doctors/${id}/availability`);
    return response.data;
  },

  getDoctorSlots: async (id, date) => {
    const response = await apiClient.get(`/doctors/${id}/slots`, {
      params: { date }
    });
    return response.data;
  }
};
