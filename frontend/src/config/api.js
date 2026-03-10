// ─── Domain / Base URL ────────────────────────────────────────────────────────
// Change this one constant to point to any environment (dev, staging, prod).
export const BASE_URL = "http://localhost:3000";

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
  auth: {
    login:            `${BASE_URL}/resiflow/auth/login`,
    logout:           `${BASE_URL}/resiflow/auth/logout`,
    registerSociety:  `${BASE_URL}/resiflow/auth/register-society`,
    residentApply:    `${BASE_URL}/resiflow/auth/resident-apply`,
  },
  applications: {
    list:             `${BASE_URL}/resiflow/auth/applications`,
    accept: (id) =>   `${BASE_URL}/resiflow/auth/applications/${id}/accept`,
    reject: (id) =>   `${BASE_URL}/resiflow/auth/applications/${id}/reject`,
  },
  profile: {
    get:              `${BASE_URL}/resiflow/profile`,
    update:           `${BASE_URL}/resiflow/profile`,
  },
  flats: {
    list:                   `${BASE_URL}/resiflow/flats`,
    create:                 `${BASE_URL}/resiflow/flats`,
    unassignedResidents:    `${BASE_URL}/resiflow/flats/unassigned-residents`,
    assign:   (flatId) =>   `${BASE_URL}/resiflow/flats/${flatId}/assign`,
    unassign: (flatId) =>   `${BASE_URL}/resiflow/flats/${flatId}/unassign`,
    update:   (flatId) =>   `${BASE_URL}/resiflow/flats/${flatId}`,
    delete:   (flatId) =>   `${BASE_URL}/resiflow/flats/${flatId}`,
  },
  announcements: {
    list:   `${BASE_URL}/resiflow/announcements`,
    create: `${BASE_URL}/resiflow/announcements`,
  },
  complaints: {
    list:               `${BASE_URL}/resiflow/complaints`,
    create:             `${BASE_URL}/resiflow/complaints`,
    updateStatus: (id) => `${BASE_URL}/resiflow/complaints/${id}/status`,
  },
  facilities: {
    list:             `${BASE_URL}/resiflow/facilities`,
    create:           `${BASE_URL}/resiflow/facilities`,
    update: (id) =>   `${BASE_URL}/resiflow/facilities/${id}`,
    delete: (id) =>   `${BASE_URL}/resiflow/facilities/${id}`,
  },
};
