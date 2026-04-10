import { create } from "zustand";
import { ComplaintService } from "../services/complaintService";
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

export const useComplaintStore = create((set, get) => ({
  complaints: [],
  loading: false,
  saving: false,
  error: null,

  fetchComplaints: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await ComplaintService.getComplaints(token);
      set({ complaints: Array.isArray(data) ? data : (data.complaints ?? []), loading: false });
    } catch (err) {
      notifyError(err, "Failed to load complaints.");
      set({ error: err.message, loading: false });
    }
  },

  createComplaint: async ({ category, description, priority }) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const created = await ComplaintService.createComplaint(token, { category, description, priority });
      set((state) => ({ complaints: [created, ...state.complaints], saving: false }));
      notifySuccess("Complaint submitted.");
      return true;
    } catch (err) {
      notifyError(err, "Failed to submit complaint.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  updateStatus: async (id, status) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const updated = await ComplaintService.updateStatus(token, id, status);
      set((state) => ({
        complaints: state.complaints.map((c) => (c._id === id ? { ...c, ...updated } : c)),
        saving: false,
      }));
      notifySuccess("Complaint status updated.");
      return true;
    } catch (err) {
      notifyError(err, "Failed to update complaint.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
