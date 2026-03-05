/**
 * Application ViewModel  –  Zustand store
 *
 * Mirrors the pattern of useAuthStore:
 *   state  : applications[], loading, error, actionLoading
 *   actions: fetchApplications(), accept(id), reject(id)
 *
 * The store reads the JWT from useAuthStore so the View never
 * has to think about tokens.
 */
import { create } from "zustand";
import { ApplicationService } from "../services/applicationService";
import { useAuthStore } from "./useAuthStore";

export const useApplicationStore = create((set, get) => ({
  applications: [],
  loading: false,
  error: null,
  actionLoading: null, // _id of the row currently being accepted/rejected

  // ── Fetch pending applications ─────────────────────────────────────────────
  async fetchApplications() {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await ApplicationService.list(token);
      set({ applications: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Accept ─────────────────────────────────────────────────────────────────
  async accept(id) {
    const token = useAuthStore.getState().token;
    set({ actionLoading: id });
    try {
      await ApplicationService.accept(id, token);
      set((state) => ({
        applications: state.applications.filter((a) => a._id !== id),
        actionLoading: null,
      }));
    } catch (err) {
      set({ error: err.message, actionLoading: null });
    }
  },

  // ── Reject ─────────────────────────────────────────────────────────────────
  async reject(id) {
    const token = useAuthStore.getState().token;
    set({ actionLoading: id });
    try {
      await ApplicationService.reject(id, token);
      set((state) => ({
        applications: state.applications.filter((a) => a._id !== id),
        actionLoading: null,
      }));
    } catch (err) {
      set({ error: err.message, actionLoading: null });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
