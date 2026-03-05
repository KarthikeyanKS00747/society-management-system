import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApplicationService } from "../services/applicationService";

// ─── Step enum ────────────────────────────────────────────────────────────────
const STEP = { FORM: "form", SUCCESS: "success" };

function Apply() {
  const navigate = useNavigate();

  const [step, setStep]       = useState(STEP.FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(null); // { msg, applicationId, expiresAt }

  const [formData, setFormData] = useState({
    societyName:     "",
    name:            "",
    email:           "",
    phone:           "",
    password:        "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { confirmPassword, ...payload } = formData;
      const data = await ApplicationService.apply(payload);
      setResult(data);
      setStep(STEP.SUCCESS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // ── Success / status screen ────────────────────────────────────────────────
  if (step === STEP.SUCCESS) {
    return (
      <div className="auth-page">
        <div className="card auth-card" style={{ maxWidth: "480px" }}>
          {/* Status badge */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--warning-light, #fff8e1)",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "2rem" }}>⏳</span>
            </div>
            <h2 className="auth-title" style={{ marginBottom: "6px" }}>
              Application Submitted
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Your request is in the queue — the admin will review it.
            </p>
          </div>

          {/* Detail card */}
          <div
            style={{
              background: "var(--bg-card, #f9f9f9)",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Row label="Status">
              <span
                style={{
                  padding: "2px 12px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  background: "var(--warning-light, #fff8e1)",
                  color: "var(--warning, #f57f17)",
                  letterSpacing: "0.5px",
                }}
              >
                PENDING
              </span>
            </Row>
            <Row label="Application ID">
              <code style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
                {result?.applicationId}
              </code>
            </Row>
            {result?.expiresAt && (
              <Row label="Expires On">
                <span style={{ color: "var(--text-muted)" }}>
                  {formatDate(result.expiresAt)}
                </span>
              </Row>
            )}
          </div>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              textAlign: "center",
              marginBottom: "20px",
              lineHeight: 1.6,
            }}
          >
            Save your Application ID above. You will be able to log in once
            the admin accepts your request.
          </p>

          <button
            className="btn btn-primary btn-full"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Application form ───────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2 className="auth-title">Apply to Join Society</h2>
        <p className="auth-subtitle">
          Submit your details — the admin will review your request within 2 weeks.
        </p>

        {error && (
          <div
            style={{
              background: "var(--danger-light, #fdecea)",
              color: "var(--danger, #d32f2f)",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "12px",
              fontSize: "0.9rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{error}</span>
            <span
              onClick={() => setError(null)}
              style={{ cursor: "pointer", fontWeight: "bold", marginLeft: "12px" }}
            >
              ✕
            </span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Society Name</label>
            <input
              type="text"
              name="societyName"
              className="input"
              placeholder="Enter your society name"
              value={formData.societyName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              type="text"
              name="name"
              className="input"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Email Address</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="Choose a password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="input"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ color: "var(--primary)", cursor: "pointer" }}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Small helper for rows in the status card ───────────────────────────────
function Row({ label, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

export default Apply;
