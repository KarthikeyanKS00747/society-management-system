import { create } from "zustand";

const DEFAULT_DURATION_MS = 4000;
const MAX_NOTIFICATIONS = 5;

export const useNotificationStore = create((set, get) => ({
  items: [],

  notify: ({ message, type = "info", duration = DEFAULT_DURATION_MS } = {}) => {
    if (!message) return null;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item = { id, message, type };

    set((state) => ({
      items: [item, ...state.items].slice(0, MAX_NOTIFICATIONS),
    }));

    if (duration && duration > 0) {
      setTimeout(() => {
        get().dismiss(id);
      }, duration);
    }

    return id;
  },

  dismiss: (id) => {
    set((state) => ({ items: state.items.filter((n) => n.id !== id) }));
  },

  clear: () => set({ items: [] }),
}));
