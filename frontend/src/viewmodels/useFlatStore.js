import { create } from "zustand";
import { FlatService } from "../services/flatService";
import { useAuthStore } from "./useAuthStore";
import { useNotificationStore } from "./useNotificationStore";

const notifyError = (err, fallback = "Something went wrong.") => {
  const message = err?.message || fallback;
  useNotificationStore.getState().notify({ message, type: "error" });
};

const notifySuccess = (message) => {
  if (!message) return;
  useNotificationStore.getState().notify({ message, type: "success" });
};

const coerceFlat = (data) => {
  if (!data) return data;
  const flat = data.flat ?? data;
  const societyName = data.societyName;
  if (flat && societyName && !flat.societyName) {
    return { ...flat, societyName };
  }
  return flat;
};

const coerceFlatList = (data) => {
  if (!data) return [];
  const list = Array.isArray(data) ? data : Array.isArray(data.flats) ? data.flats : [];
  const societyName = data.societyName;
  if (!societyName) return list;
  return list.map((flat) => (flat?.societyName ? flat : { ...flat, societyName }));
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
      set({ flats: coerceFlatList(data), loading: false });
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
      const newFlat = coerceFlat(created);
      set((state) => ({
        flats: [...state.flats, newFlat],
        saving: false,
      }));
      notifySuccess("Flat created.");
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
      notifySuccess("Flat assigned.");
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
      notifySuccess("Flat unassigned.");
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
      const nextFlat = coerceFlat(updated);
      set((state) => ({
        flats: state.flats.map((f) =>
          f._id === flatId ? { ...f, ...nextFlat } : f
        ),
        saving: false,
      }));
      notifySuccess("Flat updated.");
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
      notifySuccess("Flat deleted.");
      return true;
    } catch (err) {
      notifyError(err, "Failed to delete flat.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
