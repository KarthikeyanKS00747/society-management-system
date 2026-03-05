/**
 * ApplicationService  –  Model layer
 *
 * Covers the resident application lifecycle:
 *   - public:  ApplicationService.apply(data)
 *   - admin:   ApplicationService.list(token)
 *              ApplicationService.accept(id, token)
 *              ApplicationService.reject(id, token)
 *
 * Auth-required methods receive the JWT as a second argument so the
 * class stays stateless and independent of the Zustand store.
 */
import { API_ENDPOINTS } from "../config/api";

export class ApplicationService {
  // ── Private helper ────────────────────────────────────────────────────────
  static async #handleResponse(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.error || "Something went wrong");
    return data;
  }

  static #authHeaders(token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // ── Resident: submit application (public) ─────────────────────────────────
  // POST /resiflow/auth/resident-apply
  // Payload  : { societyName, name, email, phone, password }
  // Response : { msg, applicationId, expiresAt }
  static async apply({ societyName, name, email, phone, password }) {
    const res = await fetch(API_ENDPOINTS.auth.residentApply, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ societyName, name, email, phone, password }),
    });
    return ApplicationService.#handleResponse(res);
  }

  // ── Admin: list pending applications ──────────────────────────────────────
  // GET /resiflow/auth/applications
  // Response : Application[]
  static async list(token) {
    const res = await fetch(API_ENDPOINTS.applications.list, {
      headers: ApplicationService.#authHeaders(token),
    });
    return ApplicationService.#handleResponse(res);
  }

  // ── Admin: accept an application ──────────────────────────────────────────
  // POST /resiflow/auth/applications/:id/accept
  // Response : { msg, userId }
  static async accept(id, token) {
    const res = await fetch(API_ENDPOINTS.applications.accept(id), {
      method: "POST",
      headers: ApplicationService.#authHeaders(token),
    });
    return ApplicationService.#handleResponse(res);
  }

  // ── Admin: reject an application ──────────────────────────────────────────
  // POST /resiflow/auth/applications/:id/reject
  // Response : { msg }
  static async reject(id, token) {
    const res = await fetch(API_ENDPOINTS.applications.reject(id), {
      method: "POST",
      headers: ApplicationService.#authHeaders(token),
    });
    return ApplicationService.#handleResponse(res);
  }
}
