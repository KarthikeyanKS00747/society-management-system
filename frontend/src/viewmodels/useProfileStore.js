/**
 * Profile ViewModel  –  Zustand store
 *
 * State:
 *   profile      – { id, name, email, phone, role, society, flat, isActive, createdAt }
 *   loading      – true while fetching
 *   saving       – true while a PUT is in flight
 *   error        – last error message or null
 *
 * Actions:
 *   fetchProfile()                  – GET /profile, populate store
 *   updateProfile(fields)           – PUT /profile with basic info
 *   changePassword(current, next)   – PUT /profile with password fields only
 *   clearError()
 */
import { create } from "zustand";
import { ProfileService } from "../services/profileService";
import { useAuthStore } from "./useAuthStore";

export const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  saving: false,
  error: null,

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async fetchProfile() {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const profile = await ProfileService.getProfile(token);
      set({ profile, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Update basic info (name, email, phone) ─────────────────────────────────
  // Returns true on success so the View can exit edit mode.
  async updateProfile(fields) {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const { profile } = await ProfileService.updateProfile(token, fields);
      set({ profile, saving: false });
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  // ── Change password ────────────────────────────────────────────────────────
  // Returns true on success so the View can clear the password form.
  async changePassword(currentPassword, newPassword) {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      await ProfileService.updateProfile(token, { currentPassword, newPassword });
      set({ saving: false });
      return true;
    } catch (err) {
      set({ error: err.message, saving: false });
      return false;
    }
  },

  clearError() {
    set({ error: null });
  },
}));
