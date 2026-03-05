import { create } from "zustand";
import { FlatService } from "../services/flatService";
import { useAuthStore } from "./useAuthStore";

export const useFlatStore = create((set) => ({
  // ─── State ─────────────────────────────────────────────────────────────────
  flats: [],
  unassignedResidents: [],
  loading: false,
  saving: false,        // used during create / assign / unassign
  error: null,

  // ─── Actions ───────────────────────────────────────────────────────────────

  fetchFlats: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await FlatService.getFlats(token);
      // Backend may return { flats: [...] } or [...] directly
      set({ flats: data.flats ?? data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchUnassignedResidents: async () => {
    const token = useAuthStore.getState().token;
    try {
      const data = await FlatService.getUnassignedResidents(token);
      set({ unassignedResidents: data.residents ?? data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  createFlat: async (flatData) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const created = await FlatService.createFlat(token, flatData);
      const newFlat = created.flat ?? created;
      set((state) => ({
        flats: [...state.flats, newFlat],
        saving: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  assignFlat: async (flatId, userId) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const result = await FlatService.assignFlat(token, flatId, userId);
      const updatedFlat = result.flat ?? result;
      set((state) => ({
        flats: state.flats.map((f) =>
          f._id === flatId ? { ...f, ...updatedFlat } : f
        ),
        unassignedResidents: state.unassignedResidents.filter(
          (r) => r._id !== userId
        ),
        saving: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  unassignFlat: async (flatId) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const result = await FlatService.unassignFlat(token, flatId);
      const updatedFlat = result.flat ?? result;
      set((state) => ({
        flats: state.flats.map((f) =>
          f._id === flatId ? { ...f, ...updatedFlat, occupant: null } : f
        ),
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
