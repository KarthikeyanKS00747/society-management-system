import { create } from "zustand";
import { FlatService } from "../services/flatService";
import { useAuthStore } from "./useAuthStore";
import { useNotificationStore } from "./useNotificationStore";

const notifyError = (err, fallback = "Something went wrong.") => {
  const message = err?.message || fallback;
  useNotificationStore.getState().notify({ message, type: "error" });
};

export const useFlatStore = create((set, get) => ({
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
      notifyError(err, "Failed to load flats.");
      set({ error: err.message, loading: false });
    }
  },

  fetchUnassignedResidents: async () => {
    const token = useAuthStore.getState().token;
    try {
      const data = await FlatService.getUnassignedResidents(token);
      set({ unassignedResidents: data.residents ?? data });
    } catch (err) {
      notifyError(err, "Failed to load unassigned residents.");
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
      notifyError(err, "Failed to create flat.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  assignFlat: async (flatId, userId) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      await FlatService.assignFlat(token, flatId, userId);
      // Re-fetch both to get accurate server state (isActive toggled, occupant set)
      await get().fetchFlats();
      await get().fetchUnassignedResidents();
      set({ saving: false });
      return true;
    } catch (err) {
      notifyError(err, "Failed to assign flat.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  unassignFlat: async (flatId) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      await FlatService.unassignFlat(token, flatId);
      // Re-fetch both so the unassigned resident reappears in the unassigned list
      await get().fetchFlats();
      await get().fetchUnassignedResidents();
      set({ saving: false });
      return true;
    } catch (err) {
      notifyError(err, "Failed to unassign flat.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  updateFlat: async (flatId, fields) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const updated = await FlatService.updateFlat(token, flatId, fields);
      set((state) => ({
        flats: state.flats.map((f) =>
          f._id === flatId ? { ...f, ...updated } : f
        ),
        saving: false,
      }));
      return true;
    } catch (err) {
      notifyError(err, "Failed to update flat.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  deleteFlat: async (flatId) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      await FlatService.deleteFlat(token, flatId);
      set((state) => ({
        flats: state.flats.filter((f) => f._id !== flatId),
        saving: false,
      }));
      return true;
    } catch (err) {
      notifyError(err, "Failed to delete flat.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
