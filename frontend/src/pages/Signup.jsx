import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";

function Signup() {
  const navigate = useNavigate();
  const { registerSociety, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    societyName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
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
              onClick={clearError}
              style={{ cursor: "pointer", fontWeight: "bold", marginLeft: "12px" }}
            >
              ✕
            </span>
          </div>
        )}

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