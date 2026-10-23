import { apiClient } from "../../../services/apiClient.js";

export const aiApi = {
  chat: async (messages) => {
    const response = await apiClient.post("/ai/chat", { messages });
    return response.data?.data ?? response.data;
  }
};
