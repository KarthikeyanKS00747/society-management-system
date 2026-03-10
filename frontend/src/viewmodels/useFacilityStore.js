import { create } from "zustand";
import { FacilityService } from "../services/facilityService";
import { useAuthStore } from "./useAuthStore";

export const useFacilityStore = create((set, get) => ({
  facilities: [],
  loading: false,
  saving: false,
  error: null,

  fetchFacilities: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await FacilityService.getFacilities(token);
      set({ facilities: Array.isArray(data) ? data : (data.facilities ?? []), loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createFacility: async ({ name, capacity, isActive = true }) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const created = await FacilityService.createFacility(token, { name, capacity, isActive });
      set((state) => ({ facilities: [...state.facilities, created], saving: false }));
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  updateFacility: async (id, fields) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const updated = await FacilityService.updateFacility(token, id, fields);
      set((state) => ({
        facilities: state.facilities.map((f) => (f._id === id ? { ...f, ...updated } : f)),
        saving: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  deleteFacility: async (id) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      await FacilityService.deleteFacility(token, id);
      set((state) => ({
        facilities: state.facilities.filter((f) => f._id !== id),
        saving: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
