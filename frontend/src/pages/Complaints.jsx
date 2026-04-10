import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useComplaintStore } from "../viewmodels/useComplaintStore";
import { useNotificationStore } from "../viewmodels/useNotificationStore";

const STATUS_LABEL = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved" };
const STATUS_COLOR = { OPEN: "#e53e3e", IN_PROGRESS: "#d97706", RESOLVED: "green" };

const CATEGORIES = [
  "Plumbing", "Electrical", "Security", "Cleaning",
  "Parking", "Noise", "Pest Control", "Others",
];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

function Complaints() {
  const { user } = useAuthStore();
  const role = (user?.role ?? "resident").toLowerCase();
  const userId = user?.id ?? user?._id;

  const { complaints, loading, saving, error, fetchComplaints, createComplaint, updateStatus } =
    useComplaintStore();

  const [form, setForm] = useState({ category: "", customCategory: "", description: "", priority: "" });
  const [showCustom, setShowCustom] = useState(false);
  const notify = useNotificationStore((s) => s.notify);
  const emptyNotified = useRef(false);

  const visible =
    role === "admin"
      ? complaints
      : complaints.filter((c) => c.userId === userId || c.userId?._id === userId);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (!loading && !error && visible.length === 0 && !emptyNotified.current) {
      notify({ message: "No complaints found.", type: "info" });
      emptyNotified.current = true;
    }
    if (visible.length > 0) emptyNotified.current = false;
  }, [loading, error, visible.length, notify]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "category") setShowCustom(value === "Others");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const category = form.category === "Others" ? form.customCategory.trim() : form.category;
    if (!category || !form.description.trim()) return;
    const ok = await createComplaint({
      category,
      description: form.description.trim(),
      priority: form.priority || undefined,
    });
    if (ok) {
      setForm({ category: "", customCategory: "", description: "", priority: "" });
      setShowCustom(false);
    }
  };

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Complaints</h1>
          <p>
            {role === "admin"
              ? "Manage all society complaints and update their status."
              : "Raise a new complaint or track your existing ones."}
          </p>
        </div>
      </section>

      <div className={role === "admin" ? "" : "grid grid-2"}>
        {role === "resident" && (
          <section className="card">
            <div className="card-header">
              <h3>Raise New Complaint</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Category</label>
                <select
                  className="input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {showCustom && (
                <div className="form-group">
                  <label className="label">Specify Category</label>
                  <input
                    type="text"
                    className="input"
                    name="customCategory"
                    placeholder="Describe the category..."
                    value={form.customCategory}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="label">Priority</label>
                <select
                  className="input"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="">Select priority (optional)</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  name="description"
                  rows="5"
                  placeholder="Describe the problem in detail (min 10 characters)…"
                  value={form.description}
                  onChange={handleChange}
                  required
                  minLength={10}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                {saving ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </section>
        )}

        <section className="card">
          <div className="card-header">
            <h3>
              {role === "admin" ? "All Society Complaints" : "My Complaints"}{" "}
              ({visible.length})
            </h3>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", color: "var(--color-muted, #888)", padding: "2rem" }}>
              Loading complaints...
            </p>
          ) : visible.length === 0 ? null : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {visible.map((c) => (
                <div key={c._id} className="card compact" style={{ marginBottom: 0 }}>
                  <div className="card-header" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div className="table-primary" style={{ fontWeight: 600 }}>{c.category}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-muted, #888)", marginTop: "2px" }}>
                        {fmtDate(c.createdAt)}
                        {c.priority && ` • Priority: ${c.priority}`}
                        {role === "admin" && c.userId?.name && ` • ${c.userId.name}`}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: STATUS_COLOR[c.status] ?? "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>

                      {role === "admin" && (
                        <select
                          className="input"
                          style={{ width: "130px", padding: "4px 8px", fontSize: "0.8rem" }}
                          value={c.status}
                          onChange={(e) => updateStatus(c._id, e.target.value)}
                          disabled={saving}
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
                    {c.description}
                  </p>

                  {c.resolvedAt && (
                    <div style={{ fontSize: "0.78rem", color: "green", marginTop: "0.4rem" }}>
                      Resolved on {fmtDate(c.resolvedAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Complaints;
