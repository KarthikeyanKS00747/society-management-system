import { API_ENDPOINTS } from "../config/api";

export class FlatService {
  // ─── Private Helpers ────────────────────────────────────────────────────────

  static async #handleResponse(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.msg || data.error || `HTTP ${res.status}`);
    }
    return data;
  }

  static #authHeaders(token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // ─── Public Methods ──────────────────────────────────────────────────────────

  /** GET /resiflow/flats — admin: all flats with occupant; resident: own flat */
  static async getFlats(token) {
    const res = await fetch(API_ENDPOINTS.flats.list, {
      headers: FlatService.#authHeaders(token),
    });
    return FlatService.#handleResponse(res);
  }

  /** POST /resiflow/flats — admin only */
  static async createFlat(token, { flatNumber, block, area, occupancyType }) {
    const res = await fetch(API_ENDPOINTS.flats.create, {
      method: "POST",
      headers: FlatService.#authHeaders(token),
      body: JSON.stringify({ flatNumber, block, area, occupancyType }),
    });
    return FlatService.#handleResponse(res);
  }

  /** GET /resiflow/flats/unassigned-residents — admin only */
  static async getUnassignedResidents(token) {
    const res = await fetch(API_ENDPOINTS.flats.unassignedResidents, {
      headers: FlatService.#authHeaders(token),
    });
    return FlatService.#handleResponse(res);
  }

  /** PATCH /resiflow/flats/:flatId/assign — admin assigns a resident to a flat */
  static async assignFlat(token, flatId, userId) {
    const res = await fetch(API_ENDPOINTS.flats.assign(flatId), {
      method: "PATCH",
      headers: FlatService.#authHeaders(token),
      body: JSON.stringify({ userId }),
    });
    return FlatService.#handleResponse(res);
  }

  /** PATCH /resiflow/flats/:flatId/unassign — admin removes a resident from a flat */
  static async unassignFlat(token, flatId) {
    const res = await fetch(API_ENDPOINTS.flats.unassign(flatId), {
      method: "PATCH",
      headers: FlatService.#authHeaders(token),
    });
    return FlatService.#handleResponse(res);
  }
}
