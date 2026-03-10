/**
 * FacilityService  –  Model layer
 *
 * GET    /resiflow/facilities        → array of facility objects
 * POST   /resiflow/facilities        → created facility (admin)
 * PUT    /resiflow/facilities/:id    → updated facility (admin)
 * DELETE /resiflow/facilities/:id    → { msg } (admin)
 */
import { API_ENDPOINTS } from "../config/api";

export class FacilityService {
  static async #handleResponse(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.msg || data.error || `HTTP ${res.status}`);
    return data;
  }

  static #authHeaders(token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  /** GET /resiflow/facilities */
  static async getFacilities(token) {
    const res = await fetch(API_ENDPOINTS.facilities.list, {
      headers: FacilityService.#authHeaders(token),
    });
    return FacilityService.#handleResponse(res);
    // Returns: array of { _id, societyId, name, capacity, isActive }
  }

  /** POST /resiflow/facilities — admin only */
  static async createFacility(token, { name, capacity, isActive }) {
    const res = await fetch(API_ENDPOINTS.facilities.create, {
      method: "POST",
      headers: FacilityService.#authHeaders(token),
      body: JSON.stringify({ name, capacity, isActive }),
    });
    return FacilityService.#handleResponse(res);
  }

  /** PUT /resiflow/facilities/:id — admin only */
  static async updateFacility(token, id, { name, capacity, isActive }) {
    const res = await fetch(API_ENDPOINTS.facilities.update(id), {
      method: "PUT",
      headers: FacilityService.#authHeaders(token),
      body: JSON.stringify({ name, capacity, isActive }),
    });
    return FacilityService.#handleResponse(res);
  }

  /** DELETE /resiflow/facilities/:id — admin only */
  static async deleteFacility(token, id) {
    const res = await fetch(API_ENDPOINTS.facilities.delete(id), {
      method: "DELETE",
      headers: FacilityService.#authHeaders(token),
    });
    return FacilityService.#handleResponse(res);
  }
}
