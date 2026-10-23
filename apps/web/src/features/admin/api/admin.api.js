import apiClient from "../../../services/apiClient.js";

export const adminApi = {
  getDashboardStats: async () => {
    return apiClient.get("/admin/dashboard");
  },

  getDashboardTrends: async (range = 7) => {
    return apiClient.get("/admin/dashboard/trends", { params: { range } });
  },

  getAllPatients: async (params = {}) => {
    return apiClient.get("/admin/patients", { params });
  },

  getPatientById: async (id) => {
    return apiClient.get(`/admin/patients/${id}`);
  },

  blockPatient: async (id) => {
    return apiClient.patch(`/admin/patients/${id}/block`);
  },

  unblockPatient: async (id) => {
    return apiClient.patch(`/admin/patients/${id}/unblock`);
  },

  getAppointments: async (params = {}) => {
    const safeParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => {
        if (value === undefined || value === null) {
          return false;
        }
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        return true;
      })
    );

    return apiClient.get("/admin/appointments", { params: safeParams });
  },

  getAllDoctors: async (params = {}) => {
    return apiClient.get("/admin/doctors", { params });
  },

  getDoctorById: async (id) => {
    return apiClient.get(`/admin/doctors/${id}`);
  },

  approveDoctor: async (id) => {
    return apiClient.patch(`/admin/doctors/${id}/approve`);
  },

  rejectDoctor: async (id) => {
    return apiClient.patch(`/admin/doctors/${id}/reject`);
  },

  blockDoctor: async (id) => {
    return apiClient.patch(`/admin/doctors/${id}/block`);
  },

  unblockDoctor: async (id) => {
    return apiClient.patch(`/admin/doctors/${id}/unblock`);
  },

  getAllUsers: async (params = {}) => {
    return apiClient.get("/admin/users", { params });
  },

  blockUser: async (id) => {
    return apiClient.patch(`/admin/users/${id}/block`);
  },

  unblockUser: async (id) => {
    return apiClient.patch(`/admin/users/${id}/unblock`);
  }
};
