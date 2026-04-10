import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useProfileStore } from "../viewmodels/useProfileStore";
import { useNotificationStore } from "../viewmodels/useNotificationStore";

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const {
    profile,
    loading,
    saving,
    fetchProfile,
    updateProfile,
    changePassword,
  } = useProfileStore();
  const notify = useNotificationStore((s) => s.notify);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  // Change-password form (local — ephemeral, never shared)
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  // Fetch on mount
  useEffect(() => { fetchProfile(); }, []);

  // Seed edit form whenever profile loads
  useEffect(() => {
    if (profile) {
      setFormData({ name: profile.name ?? "", email: profile.email ?? "", phone: profile.phone ?? "" });
    }
  }, [profile]);

  const handleEditClick = () => {
    setFormData({ name: profile.name ?? "", email: profile.email ?? "", phone: profile.phone ?? "" });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      notify({ message: "Name cannot be empty.", type: "warning" });
      return;
    }
    if (!formData.email.trim()) {
      notify({ message: "Email cannot be empty.", type: "warning" });
      return;
    }
    const ok = await updateProfile(formData);
    if (ok) setIsEditing(false);
  };

  // mirrors backend isStrongPassword
  const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      notify({ message: "New passwords do not match.", type: "warning" });
      return;
    }
    if (!STRONG_PW.test(pwForm.next)) {
      notify({
        message: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a digit.",
        type: "warning",
      });
      return;
    }
    const ok = await changePassword(pwForm.current, pwForm.next);
    if (ok) {
      notify({ message: "Password changed successfully.", type: "success" });
      setPwForm({ current: "", next: "", confirm: "" });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>My Profile</h1>
          <p>View and update your profile information.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      {loading && !profile ? (
        <p style={{ color: "var(--text-muted)", padding: "40px 0", textAlign: "center" }}>Loading profile…</p>
      ) : (
        <>
          {/* ── Profile Info ──────────────────────────────────────────────── */}
          <section className="grid grid-2">
            {/* Personal Information */}
            <div className="card">
              <div className="card-header">
                <h3>Personal Information</h3>
                {!isEditing ? (
                  <button className="btn btn-outline btn-sm" onClick={handleEditClick}>Edit</button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={handleCancelClick} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <>
                  <Field label="Full Name">{profile?.name ?? "—"}</Field>
                  <Field label="Email Address">{profile?.email ?? "—"}</Field>
                  <Field label="Phone Number">{profile?.phone ?? "—"}</Field>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="label">Full Name</label>
                    <input type="text" name="name" className="input" value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">Email Address</label>
                    <input type="email" name="email" className="input" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="label">Phone Number</label>
                    <input type="tel" name="phone" className="input" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </>
              )}
            </div>

            {/* Society Information */}
            <div className="card">
              <div className="card-header">
                <h3>Society Information</h3>
              </div>
              <Field label="Society">{profile?.society ?? "—"}</Field>
              <Field label="Flat">{profile?.flat ?? "—"}</Field>
              <Field label="Role">{profile?.role ?? "—"}</Field>
              <Field label="Member Since">{formatDate(profile?.createdAt)}</Field>
              <Field label="Account Status">
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background: profile?.isActive ? "var(--success-light, #e8f5e9)" : "var(--danger-light, #fdecea)",
                    color: profile?.isActive ? "var(--success, #388e3c)" : "var(--danger, #d32f2f)",
                  }}
                >
                  {profile?.isActive ? "Active" : "Inactive"}
                </span>
              </Field>
            </div>
          </section>

          {/* ── Change Password ───────────────────────────────────────────── */}
          <section className="card" style={{ marginBottom: "2rem" }}>
            <div className="card-header">
              <h3>Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="grid grid-2" style={{ gap: "16px" }}>
                <div className="form-group">
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Current password"
                    value={pwForm.current}
                    onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                    required
                    disabled={saving}
                  />
                </div>
                <div />
                <div className="form-group">
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="New password"
                    value={pwForm.next}
                    onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Confirm New Password</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="Repeat new password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                    required
                    disabled={saving}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: "8px" }}>
                {saving ? "Saving…" : "Update Password"}
              </button>
            </form>
          </section>

          {/* ── Quick Links ───────────────────────────────────────────────── */}
          <section className="card">
            <div className="card-header">
              <h3>Account Actions</h3>
            </div>
            <div className="grid grid-2" style={{ gap: "16px" }}>
              <button className="btn btn-outline" onClick={() => navigate("/maintenance")}>
                View Maintenance History
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/complaints")}>
                My Complaints
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ── Small display helper ───────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      <div className="profile-field">{children}</div>
    </div>
  );
}

export default Profile;