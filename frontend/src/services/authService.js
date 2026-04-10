/**
 * AuthService  –  Model layer
 *
 * All methods are static — call as AuthService.login(...), AuthService.registerSociety(...).
 * Responsible only for HTTP calls.  No state lives here.
 * Every method throws on error so the ViewModel can catch & store the message.
 */
import { API_ENDPOINTS } from "../config/api";

export class AuthService {
  // ─── Private helper ──────────────────────────────────────────────────────
  static async #handleResponse(res) {
    const data = await res.json();
    if (!res.ok) {
      // Backend may return { msg } or { error }
      throw new Error(data.msg || data.error || "Something went wrong");
    }
    return data;
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  // POST /auth/login
  // Payload  : { email, password }
  // Response : { token }
  static async login(email, password) {
    const res = await fetch(API_ENDPOINTS.auth.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return AuthService.#handleResponse(res); // { token }
  }
  // ── Logout ─────────────────────────────────────────────────────────────────
  // POST /resiflow/auth/logout  (requires Bearer token)
  // Blacklists the token server-side so it can never be reused.
  // Response : { msg }
  static async logout(token) {
    const res = await fetch(API_ENDPOINTS.auth.logout, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return AuthService.#handleResponse(res);
  }
  // ─── Register Society ─────────────────────────────────────────────────────
  // POST /auth/register-society
  // Payload  : { societyName, name, email, phone, password, razorpayKeyId, razorpayKeySecret }
  // Response : { society, admin }
  static async registerSociety({ societyName, name, email, phone, password, razorpayKeyId, razorpayKeySecret }) {
    const res = await fetch(API_ENDPOINTS.auth.registerSociety, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ societyName, name, email, phone, password, razorpayKeyId, razorpayKeySecret }),
    });
    return AuthService.#handleResponse(res); // { society, admin }
  }
}
