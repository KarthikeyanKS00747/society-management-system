import { create } from "zustand";
import { AnnouncementService } from "../services/announcementService";
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

export const useAnnouncementStore = create((set) => ({
  announcements: [],
  loading: false,
  saving: false,
  error: null,

  fetchAnnouncements: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await AnnouncementService.getAnnouncements(token);
      // backend returns array directly or { announcements: [...] }
      set({ announcements: Array.isArray(data) ? data : (data.announcements ?? []), loading: false });
    } catch (err) {
      notifyError(err, "Failed to load announcements.");
      set({ error: err.message, loading: false });
    }
  },

  createAnnouncement: async (fields) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const created = await AnnouncementService.createAnnouncement(token, fields);
      const item = created._id ? created : created.announcement ?? created;
      set((state) => ({
        announcements: [item, ...state.announcements],
        saving: false,
      }));
      notifySuccess("Announcement posted.");
      return true;
    } catch (err) {
      notifyError(err, "Failed to create announcement.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
