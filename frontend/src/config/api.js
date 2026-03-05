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
};
