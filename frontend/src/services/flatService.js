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

  static #normalizeFlat(data) {
    if (!data) return data;
    const flat = data.flat ?? data;
    const societyName = data.societyName;
    if (flat && societyName && !flat.societyName) {
      return { ...flat, societyName };
    }
    return flat;
  }

  static #normalizeFlats(data) {
    if (!data) return [];
    const list = Array.isArray(data) ? data : Array.isArray(data.flats) ? data.flats : [];
    const societyName = data.societyName;
    if (!societyName) return list;
    return list.map((flat) => (flat?.societyName ? flat : { ...flat, societyName }));
  }

  // ─── Public Methods ──────────────────────────────────────────────────────────

  /** GET /resiflow/flats — admin: all flats with occupant; resident: own flat */
  static async getFlats(token) {
    const res = await fetch(API_ENDPOINTS.flats.list, {
      headers: FlatService.#authHeaders(token),
    });
    const data = await FlatService.#handleResponse(res);
    return FlatService.#normalizeFlats(data);
  }

  /** POST /resiflow/flats — admin only */
  static async createFlat(token, { flatNumber, block, areaSqFt, occupancyType }) {
    const res = await fetch(API_ENDPOINTS.flats.create, {
      method: "POST",
      headers: FlatService.#authHeaders(token),
      body: JSON.stringify({ flatNumber, block, areaSqFt, occupancyType }),
    });
    const data = await FlatService.#handleResponse(res);
    return FlatService.#normalizeFlat(data);
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

  /** PUT /resiflow/flats/:flatId — admin edits flat details */
  static async updateFlat(token, flatId, { block, flatNumber, areaSqFt, occupancyType }) {
    const res = await fetch(API_ENDPOINTS.flats.update(flatId), {
      method: "PUT",
      headers: FlatService.#authHeaders(token),
      body: JSON.stringify({ block, flatNumber, areaSqFt, occupancyType }),
    });
    const data = await FlatService.#handleResponse(res);
    return FlatService.#normalizeFlat(data);
  }

  /** DELETE /resiflow/flats/:flatId — admin deletes a vacant flat */
  static async deleteFlat(token, flatId) {
    const res = await fetch(API_ENDPOINTS.flats.delete(flatId), {
      method: "DELETE",
      headers: FlatService.#authHeaders(token),
    });
    return FlatService.#handleResponse(res);
  }
}
