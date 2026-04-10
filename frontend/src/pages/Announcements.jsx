import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useAnnouncementStore } from "../viewmodels/useAnnouncementStore";
import { useNotificationStore } from "../viewmodels/useNotificationStore";

function Announcements() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const {
    announcements,
    loading,
    saving,
    error,
    fetchAnnouncements,
    createAnnouncement,
  } = useAnnouncementStore();

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ title: "", message: "", expiryDate: "" });
  const notify = useNotificationStore((s) => s.notify);
  const emptyNotified = useRef(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (!loading && !error && announcements.length === 0 && !emptyNotified.current) {
      notify({ message: "No announcements yet.", type: "info" });
      emptyNotified.current = true;
    }
    if (announcements.length > 0) emptyNotified.current = false;
  }, [loading, error, announcements.length, notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await createAnnouncement({
      title: form.title.trim(),
      message: form.message.trim(),
      expiryDate: form.expiryDate || undefined,
    });
    if (ok) {
      setForm({ title: "", message: "", expiryDate: "" });
      setShowForm(false);
    }
  };

  const isExpired = (expiryDate) =>
    expiryDate && new Date(expiryDate) < new Date();

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Announcements</h1>
          <p>Stay updated with the latest society news.</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "+ New Announcement"}
          </button>
        )}
      </section>

      {/* Create Form — admin only */}
      {isAdmin && showForm && (
        <section className="card">
          <div className="card-header">
            <h3>New Announcement</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Title *</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Water Supply Interruption"
                required
                minLength={3}
                maxLength={200}
              />
            </div>
            <div className="form-group">
              <label className="label">Message *</label>
              <textarea
                className="input"
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Write the full announcement here…"
                required
                minLength={5}
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="form-group">
              <label className="label">Expiry Date (optional)</label>
              <input
                className="input"
                type="date"
                value={form.expiryDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
              />
            </div>
            <div className="action-buttons">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Posting…" : "Post Announcement"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Announcements List */}
      {loading ? (
        <p className="empty-state">Loading announcements…</p>
      ) : announcements.length === 0 ? null : (
        <div className="grid grid-2">
          {announcements.map((item) => {
            const expired = isExpired(item.expiryDate);
            return (
              <div key={item._id} className={`card compact${expired ? " card--muted" : ""}`}>
                <div className="card-header">
                  <h3 style={{ opacity: expired ? 0.6 : 1 }}>{item.title}</h3>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                    <span className="label">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {expired && (
                      <span className="label" style={{ color: "#e53e3e", fontSize: "0.75rem" }}>
                        Expired
                      </span>
                    )}
                    {item.expiryDate && !expired && (
                      <span className="label" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Expires {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Always show a preview line */}
                <p style={{ opacity: expired ? 0.6 : 1 }}>
                  {expandedId === item._id
                    ? item.message
                    : item.message.length > 100
                    ? item.message.slice(0, 100) + "…"
                    : item.message}
                </p>

                {item.message.length > 100 && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      setExpandedId(expandedId === item._id ? null : item._id)
                    }
                  >
                    {expandedId === item._id ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Announcements;