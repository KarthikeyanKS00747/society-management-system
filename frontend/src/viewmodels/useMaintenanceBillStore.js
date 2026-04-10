import { create } from "zustand";
import { MaintenanceBillService } from "../services/maintenanceBillService";
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

export const useMaintenanceBillStore = create((set) => ({
  bills:   [],
  loading: false,
  saving:  false,
  error:   null,

  /**
   * Fetch bills — automatically uses the correct endpoint based on role.
   * ADMIN  → GET /resiflow/billing/all
   * others → GET /resiflow/billing/my
   */
  fetchBills: async () => {
    const { token, user } = useAuthStore.getState();
    set({ loading: true, error: null });
    try {
      const data = user?.role === "ADMIN"
        ? await MaintenanceBillService.getAllBills(token)
        : await MaintenanceBillService.getMyBills(token);
      set({ bills: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      notifyError(err, "Failed to load maintenance bills.");
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Generate maintenance bills for all occupied flats (admin only).
   * @param {{ month: number, year: number }} params
   * @returns {{ msg: string, bills: [], skipped: [] } | false}
   */
  generateBills: async ({ month, year }) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const result = await MaintenanceBillService.generateBills(token, { month, year });
      // Refresh list after generation
      const { token: t, user } = useAuthStore.getState();
      const updated = user?.role === "ADMIN"
        ? await MaintenanceBillService.getAllBills(t)
        : await MaintenanceBillService.getMyBills(t);
      set({ bills: Array.isArray(updated) ? updated : [], saving: false });
      notifySuccess(result?.msg || "Bills generated.");
      return result;
    } catch (err) {
      notifyError(err, "Failed to generate bills.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
