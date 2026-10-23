import apiClient from "../../../services/apiClient.js";

export const doctorProfileApi = {
  getDoctorProfile: async () => {
    return apiClient.get("/doctor-profile");
  },

  updateDoctorProfile: async (data) => {
    return apiClient.patch("/doctor-profile", data);
  },

  getMyProfile: async () => {
    return apiClient.get("/doctor-profile/me");
  },

  updateMyProfile: async (data) => {
    return apiClient.patch("/doctor-profile/me", data);
  }
};
