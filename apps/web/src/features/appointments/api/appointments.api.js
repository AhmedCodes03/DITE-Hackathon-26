import apiClient from "../../../services/apiClient.js";

export const appointmentsApi = {
  book: async (data) => {
    return apiClient.post("/appointments", data);
  },

  getMyAppointments: async (params = {}) => {
    return apiClient.get("/appointments/me", { params });
  },

  getDoctorAppointments: async (params = {}) => {
    return apiClient.get("/appointments/doctor", { params });
  },

  getById: async (id) => {
    return apiClient.get(`/appointments/${id}`);
  },

  cancel: async (id, reason) => {
    return apiClient.patch(`/appointments/${id}/cancel`, { reason });
  },

  reschedule: async (id, data) => {
    return apiClient.patch(`/appointments/${id}/reschedule`, data);
  },

  confirm: async (id) => {
    return apiClient.patch(`/appointments/${id}/confirm`);
  },

  complete: async (id) => {
    return apiClient.patch(`/appointments/${id}/complete`);
  },

  markNoShow: async (id) => {
    return apiClient.patch(`/appointments/${id}/no-show`);
  },

  markApprovalSeen: async (id) => {
    return apiClient.patch(`/appointments/${id}/mark-approval-seen`);
  },

  getAdminAppointments: async (params = {}) => {
    return apiClient.get("/admin/appointments", { params });
  }
};
