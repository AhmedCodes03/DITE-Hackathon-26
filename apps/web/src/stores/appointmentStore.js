import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "../utils/constants";

export const useAppointmentStore = create(
  persist(
    (set) => ({
      draft: null,
      setDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: null })
    }),
    {
      name: STORAGE_KEYS.APPOINTMENT_DRAFT,
      partialize: (state) => ({ draft: state.draft })
    }
  )
);
