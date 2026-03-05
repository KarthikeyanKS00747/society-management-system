/**
 * ProfileService  –  Model layer
 *
 * GET  /resiflow/profile  → { id, name, email, phone, role, society, flat, isActive, createdAt }
 * PUT  /resiflow/profile  → { message, profile: { ... } }
 *                payload  : { name?, phone?, email?, currentPassword?, newPassword? }
 */
import { API_ENDPOINTS } from "../config/api";

export class ProfileService {
  static async #handleResponse(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.msg || "Something went wrong");
    return data;
  }

  static #authHeaders(token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // ── GET /resiflow/profile ──────────────────────────────────────────────────
  static async getProfile(token) {
    const res = await fetch(API_ENDPOINTS.profile.get, {
      headers: ProfileService.#authHeaders(token),
    });
    return ProfileService.#handleResponse(res);
    // Returns: { id, name, email, phone, role, society, flat, isActive, createdAt, updatedAt }
  }

  // ── PUT /resiflow/profile ──────────────────────────────────────────────────
  // All fields optional. Send currentPassword + newPassword together to change password.
  static async updateProfile(token, { name, phone, email, currentPassword, newPassword }) {
    const res = await fetch(API_ENDPOINTS.profile.update, {
      method: "PUT",
      headers: ProfileService.#authHeaders(token),
      body: JSON.stringify({ name, phone, email, currentPassword, newPassword }),
    });
    return ProfileService.#handleResponse(res);
    // Returns: { message, profile: { id, name, email, phone, role, society, flat, isActive } }
  }
}
