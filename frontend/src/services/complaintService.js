/**
 * ComplaintService  –  Model layer
 *
 * POST  /resiflow/complaints           → complaint object
 * GET   /resiflow/complaints           → array of complaints (all society)
 * PATCH /resiflow/complaints/:id/status → updated complaint (admin only)
 */
import { API_ENDPOINTS } from "../config/api";

export class ComplaintService {
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

  /** GET /resiflow/complaints */
  static async getComplaints(token) {
    const res = await fetch(API_ENDPOINTS.complaints.list, {
      headers: ComplaintService.#authHeaders(token),
    });
    return ComplaintService.#handleResponse(res);
    // Returns: array of complaint objects
  }

  /** POST /resiflow/complaints */
  static async createComplaint(token, { category, description, priority }) {
    const res = await fetch(API_ENDPOINTS.complaints.create, {
      method: "POST",
      headers: ComplaintService.#authHeaders(token),
      body: JSON.stringify({ category, description, priority }),
    });
    return ComplaintService.#handleResponse(res);
    // Returns: created complaint object
  }

  /** PATCH /resiflow/complaints/:id/status — admin only */
  static async updateStatus(token, id, status) {
    const res = await fetch(API_ENDPOINTS.complaints.updateStatus(id), {
      method: "PATCH",
      headers: ComplaintService.#authHeaders(token),
      body: JSON.stringify({ status }),
    });
    return ComplaintService.#handleResponse(res);
    // Returns: updated complaint object
  }
}
