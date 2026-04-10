import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useNotificationStore } from "../viewmodels/useNotificationStore";

function Signup() {
  const navigate = useNavigate();
  const { registerSociety, loading } = useAuthStore();
  const notify = useNotificationStore((s) => s.notify);

  const [formData, setFormData] = useState({
    societyName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    razorpayKeyId: "",
    razorpayKeySecret: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Password strength (mirrors backend isStrongPassword) ───────────────────
  const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      notify({ message: "Passwords do not match.", type: "warning" });
      return;
    }
    if (!STRONG_PW.test(formData.password)) {
      notify({
        message: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a digit.",
        type: "warning",
      });
      return;
    }
    // Mirror backend: razorpayKeyId must start with 'rzp_'
    if (!formData.razorpayKeyId.startsWith("rzp_")) {
      notify({
        message: "Razorpay Key ID must start with 'rzp_'. Find it in Razorpay Dashboard -> Settings -> API Keys.",
        type: "warning",
      });
      return;
    }
    const { confirmPassword, ...payload } = formData;
    const ok = await registerSociety(payload);
    if (ok) navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2 className="auth-title">Register Society</h2>
        <p className="auth-subtitle">
          Create your society and admin account
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="societyName"
              className="input"
              placeholder="Society Name"
              value={formData.societyName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="name"
              className="input"
              placeholder="Admin Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              className="input"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone"
              className="input"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              className="input"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              className="input"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* ─── Razorpay Payment Setup ─────────────────────────────────── */}
          <div style={{
            margin: "8px 0 4px",
            borderTop: "1px solid var(--border-color, #e2e8f0)",
            paddingTop: "16px",
          }}>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "4px", color: "var(--text, #1a202c)" }}>
              💳 Razorpay Payment Setup
            </p>
            <p style={{
              fontSize: "0.78rem",
              color: "var(--text-muted, #718096)",
              marginBottom: "12px",
              lineHeight: 1.5,
            }}>
              Your society needs its own Razorpay account to collect maintenance payments.
              Find your keys at{" "}
              <a
                href="https://dashboard.razorpay.com/app/keys"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--primary, #3b82f6)" }}
              >
                Razorpay Dashboard → Settings → API Keys
              </a>.
            </p>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="razorpayKeyId"
              className="input"
              placeholder="Razorpay Key ID  (starts with rzp_)"
              value={formData.razorpayKeyId}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="razorpayKeySecret"
              className="input"
              placeholder="Razorpay Key Secret"
              value={formData.razorpayKeySecret}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create Society"}
          </button>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{" "}
              <span
                className="auth-link"
                onClick={() => navigate("/login")}
              >
                Login here
              </span>
            </p>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
              Are you a resident?{" "}
              <span
                className="auth-link"
                onClick={() => navigate("/apply")}
                style={{ color: "var(--primary)", cursor: "pointer" }}
              >
                Apply to join your society
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;