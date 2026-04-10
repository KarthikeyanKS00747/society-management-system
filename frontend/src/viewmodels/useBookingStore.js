import { create } from "zustand";
import { BookingService } from "../services/bookingService";
import { useAuthStore } from "./useAuthStore";
import { useNotificationStore } from "./useNotificationStore";

const notifyError = (err, fallback = "Something went wrong.") => {
  const message = err?.message || fallback;
  useNotificationStore.getState().notify({ message, type: "error" });
};

export const useBookingStore = create((set) => ({
  bookings: [],
  loading: false,
  saving: false,
  error: null,

  fetchBookings: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await BookingService.getBookings(token);
      set({ bookings: Array.isArray(data) ? data : (data.bookings ?? []), loading: false });
    } catch (err) {
      notifyError(err, "Failed to load bookings.");
      set({ error: err.message, loading: false });
    }
  },

  createBooking: async ({ facilityId, date, startTime, endTime }) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const created = await BookingService.createBooking(token, { facilityId, date, startTime, endTime });
      set((state) => ({ bookings: [created, ...state.bookings], saving: false }));
      return true;
    } catch (err) {
      notifyError(err, "Failed to create booking.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  approveBooking: async (id) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const updated = await BookingService.approveBooking(token, id);
      set((state) => ({
        bookings: state.bookings.map((b) => (b._id === id ? { ...b, ...updated } : b)),
        saving: false,
      }));
      return true;
    } catch (err) {
      notifyError(err, "Failed to approve booking.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  rejectBooking: async (id) => {
    const token = useAuthStore.getState().token;
    set({ saving: true, error: null });
    try {
      const updated = await BookingService.rejectBooking(token, id);
      set((state) => ({
        bookings: state.bookings.map((b) => (b._id === id ? { ...b, ...updated } : b)),
        saving: false,
      }));
      return true;
    } catch (err) {
      notifyError(err, "Failed to reject booking.");
      set({ error: err.message, saving: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
