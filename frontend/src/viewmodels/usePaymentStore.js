import { create } from "zustand";
import { PaymentService } from "../services/paymentService";
import { useAuthStore } from "./useAuthStore";
import { useNotificationStore } from "./useNotificationStore";

const notify = (message, type = "error") => {
  if (!message) return;
  useNotificationStore.getState().notify({ message, type });
};

// ── Helper ────────────────────────────────────────────────────────────────────
/** Dynamically injects the Razorpay checkout script. Idempotent. */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const usePaymentStore = create((set, get) => ({
  payments:    [],
  loading:     false,
  paying:      false,   // true while Razorpay checkout is open / being verified
  error:       null,
  razorpayKey: null,    // cached after first /key call

  // ── Fetch public Razorpay key (cached) ───────────────────────────────────
  fetchKey: async () => {
    if (get().razorpayKey) return get().razorpayKey;
    const token = useAuthStore.getState().token;
    try {
      const { key } = await PaymentService.getKey(token);
      set({ razorpayKey: key });
      return key;
    } catch (err) {
      notify(err?.message || "Failed to load Razorpay key.");
      set({ error: err.message });
      return null;
    }
  },

  // ── Payment history ───────────────────────────────────────────────────────
  fetchPayments: async () => {
    const token = useAuthStore.getState().token;
    set({ loading: true, error: null });
    try {
      const data = await PaymentService.getPayments(token);
      set({ payments: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      notify(err?.message || "Failed to load payment history.");
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Full Razorpay checkout flow for a maintenance bill.
   *
   * 1. Fetch/cache public key.
   * 2. POST /payments/create-order/:billId  → orderId + amount.
   * 3. Load Razorpay script.
   * 4. Open checkout modal.
   * 5. On success → POST /payments/verify → refresh payment list.
   *
   * @param {string}   billId    - MongoDB _id of the MaintenanceBill
   * @param {object}   options
   * @param {object}   options.prefill    - { name, email, contact } for checkout form
   * @param {string}   options.billLabel  - Description shown in checkout header
   * @param {Function} options.onSuccess  - Called with the verified payment record
   * @param {Function} options.onFailure  - Called with an error message string
   */
  payBill: async (billId, { prefill = {}, billLabel = "Maintenance Bill", onSuccess, onFailure } = {}) => {
    const token = useAuthStore.getState().token;
    set({ paying: true, error: null });

    try {
      // Step 1 – public key
      const key = await get().fetchKey();
      if (!key) throw new Error("Could not fetch Razorpay key. Check server configuration.");

      // Step 2 – create / reuse order
      const { orderId, amount, currency } = await PaymentService.createOrder(token, billId);

      // Step 3 – load checkout script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay checkout. Check your internet connection.");

      // Step 4 – open checkout
      await new Promise((resolve) => {
        const rzp = new window.Razorpay({
          key,
          amount,
          currency,
          name:        "Society Management",
          description: billLabel,
          order_id:    orderId,
          prefill,
          theme: { color: "#4f46e5" },

          handler: async (response) => {
            try {
              // Step 5 – verify with backend
              const result = await PaymentService.verifyPayment(token, {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });

              // Refresh local payment list
              const updated = await PaymentService.getPayments(token);
              set({ payments: Array.isArray(updated) ? updated : [], paying: false });

              notify("Payment successful.", "success");
              onSuccess?.(result.payment);
            } catch (verifyErr) {
              notify(verifyErr?.message || "Payment verification failed.");
              set({ error: verifyErr.message, paying: false });
              onFailure?.(verifyErr.message);
            } finally {
              resolve();
            }
          },

          modal: {
            ondismiss: () => {
              notify("Payment cancelled.", "warning");
              set({ paying: false });
              onFailure?.("Payment cancelled.");
              resolve();
            },
          },
        });

        rzp.on("payment.failed", (response) => {
          const msg = response.error?.description || "Payment failed.";
          notify(msg);
          set({ error: msg, paying: false });
          onFailure?.(msg);
          resolve();
        });

        rzp.open();
      });
    } catch (err) {
      notify(err?.message || "Payment failed.");
      set({ error: err.message, paying: false });
      onFailure?.(err.message);
    }
  },

  clearError: () => set({ error: null }),
}));
