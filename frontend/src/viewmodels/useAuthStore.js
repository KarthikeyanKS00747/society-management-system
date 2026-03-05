/**
 * Auth ViewModel  –  Zustand store
 *
 * This is the single source of truth for authentication state.
 * Think of it as the equivalent of a Provider + ChangeNotifier in Flutter.
 *
 * State:
 *   token      – raw JWT string (null when logged out)
 *   user       – decoded payload { id, role, societyId } (null when logged out)
 *   loading    – true while an async auth operation is in flight
 *   error      – last error message, or null
 *
 * Actions:
 *   init()                  – rehydrate from localStorage on app start
 *   login(email, password)  – POST /login, persist token, decode user
 *   registerSociety(data)   – POST /register-society, navigate after success
 *   logout()                – clear state + storage
 *   clearError()            – dismiss the current error banner
 */
import { create } from "zustand";
import { AuthService } from "../services/authService";

// ─── JWT decoder (no extra library needed) ───────────────────────────────────
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    // atob requires the string to have correct padding
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

// ─── Persistence helpers ─────────────────────────────────────────────────────
const TOKEN_KEY = "authToken";

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,

  // ── Rehydrate on app boot ──────────────────────────────────────────────────
  init() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const user = decodeJwt(token);
      if (user) {
        set({ token, user, isLoggedIn: true });
        return;
      }
      // Token present but un-decodable → clear it
      clearStorage();
    }
  },

  // ── Login ──────────────────────────────────────────────────────────────────
  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { token } = await AuthService.login(email, password);
      const user = decodeJwt(token);
      saveToken(token);
      set({ token, user, isLoggedIn: true, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  // ── Register Society (admin onboarding) ───────────────────────────────────
  // Returns true on success so the View can navigate away.
  async registerSociety(formData) {
    set({ loading: true, error: null });
    try {
      await AuthService.registerSociety(formData);
      set({ loading: false });
      return true;
    } catch (err) {
      set({ loading: false, error: err.message });
      return false;
    }
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  // Blacklists the token on the server, then wipes local state.
  // Fire-and-forget the API call — even if it fails we still clear locally
  // so the user is never stuck in a broken logged-in state.
  async logout() {
    const token = get().token;
    if (token) {
      try {
        await AuthService.logout(token);
      } catch {
        // Network error or already blacklisted — safe to ignore.
      }
    }
    clearStorage();
    set({ token: null, user: null, isLoggedIn: false, error: null });
  },

  // ── Utility ────────────────────────────────────────────────────────────────
  clearError() {
    set({ error: null });
  },
}));
