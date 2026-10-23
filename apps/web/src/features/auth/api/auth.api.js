import apiClient from "../../../services/apiClient.js";

export const authApi = {
  register: async (data) => {
    const response = await apiClient.post("/auth/register", data, { timeout: 45000 });
    return response.data;
  },

  registerDoctor: async (data) => {
    const response = await apiClient.post("/auth/register-doctor", data, { timeout: 45000 });
    return response.data;
  },

  login: async (data) => {
    const response = await apiClient.post("/auth/login", data, { timeout: 45000 });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await apiClient.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  }
};
