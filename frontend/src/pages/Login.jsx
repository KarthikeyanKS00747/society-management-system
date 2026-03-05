import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";

function Login() {
  const navigate = useNavigate();
  const { login, loading, error, isLoggedIn, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect once authenticated
  useEffect(() => {
    if (isLoggedIn) navigate("/dashboard", { replace: true });
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2 className="auth-title">Login</h2>

        {error && (
          <div
            className="auth-error"
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
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "var(--text-muted)" }}>
            New society?{" "}
            <span
              onClick={() => navigate("/signup")}
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Register here
            </span>
          </p>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            Resident applying to join?{" "}
            <span
              onClick={() => navigate("/apply")}
              style={{ color: "var(--primary)", cursor: "pointer" }}
            >
              Submit application
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;