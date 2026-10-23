import apiClient from "../../../services/apiClient.js";

export const patientApi = {
  getMyProfile: async () => {
    return apiClient.get("/patients/me");
  },

  updateMyProfile: async (data) => {
    return apiClient.patch("/patients/me", data);
  },

  uploadProfilePhoto: async (file) => {
    const toDataUrl =
      file instanceof File
        ? await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        : String(file || "");

    return apiClient.post("/patients/me/photo", { image: toDataUrl });
  }
};
