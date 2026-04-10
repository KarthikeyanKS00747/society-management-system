import { useEffect, useRef } from "react";
import { useApplicationStore } from "../viewmodels/useApplicationStore";
import { useNotificationStore } from "../viewmodels/useNotificationStore";

function Applications() {
  const {
    applications,
    loading,
    error,
    actionLoading,
    fetchApplications,
    accept,
    reject,
  } = useApplicationStore();

  const notify = useNotificationStore((s) => s.notify);
  const emptyNotified = useRef(false);

  useEffect(() => { fetchApplications(); }, []);

  useEffect(() => {
    if (!loading && !error && applications.length === 0 && !emptyNotified.current) {
      notify({ message: "No pending applications.", type: "info" });
      emptyNotified.current = true;
    }
    if (applications.length > 0) emptyNotified.current = false;
  }, [loading, error, applications.length, notify]);

  // ── Accept ────────────────────────────────────────────────────────────────
  const handleAccept = (id) => {
    if (!window.confirm("Accept this application and create a resident account?")) return;
    accept(id);
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = (id) => {
    if (!window.confirm("Reject this application? This cannot be undone.")) return;
    reject(id);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const daysLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      {/* Header */}
      <section className="page-header dashboard-header">
        <div>
          <h1>Resident Applications</h1>
          <p>Review and approve pending membership requests for your society.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchApplications} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-4">
        <div className="card stat">
          <h3>Pending</h3>
          <h2>{applications.length}</h2>
          <p>Awaiting your review</p>
        </div>
        <div className="card stat">
          <h3>Expiring Soon</h3>
          <h2>{applications.filter((a) => daysLeft(a.expiresAt) <= 3).length}</h2>
          <p>Within 3 days</p>
        </div>
      </section>

      {/* Table / empty state */}
      <section className="card compact">
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <h3>Pending Applications</h3>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Loading…</p>
        ) : applications.length === 0 ? null : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  {["Name", "Email", "Phone", "Applied On", "Expires In", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          color: "var(--text-muted)",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const days = daysLeft(app.expiresAt);
                  const isActing = actionLoading === app._id;
                  return (
                    <tr
                      key={app._id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td style={{ padding: "12px 12px", fontWeight: 500 }}>{app.name}</td>
                      <td style={{ padding: "12px 12px", color: "var(--text-muted)" }}>{app.email}</td>
                      <td style={{ padding: "12px 12px", color: "var(--text-muted)" }}>{app.phone || "—"}</td>
                      <td style={{ padding: "12px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {formatDate(app.createdAt)}
                      </td>
                      <td style={{ padding: "12px 12px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            background: days <= 3 ? "var(--danger-light, #fdecea)" : "var(--success-light, #e8f5e9)",
                            color: days <= 3 ? "var(--danger, #d32f2f)" : "var(--success, #388e3c)",
                          }}
                        >
                          {days}d left
                        </span>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAccept(app._id)}
                            disabled={isActing}
                          >
                            {isActing ? "…" : "Accept"}
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleReject(app._id)}
                            disabled={isActing}
                            style={{ color: "var(--danger, #d32f2f)", borderColor: "var(--danger, #d32f2f)" }}
                          >
                            {isActing ? "…" : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Applications;
