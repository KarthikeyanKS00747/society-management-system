import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For demo - check if it's admin login
    const isAdminLogin = email === "admin@society.com" && password === "admin123#";
    const isResidentLogin = email === "resident@example.com" && password === "resident123#";
    
    if (isAdminLogin || isResidentLogin) {
      const fakeToken = "fake-jwt-token-" + Date.now();
      const fakeUser = {
        id: 1,
        name: isAdminLogin ? "Admin User" : "Resident User",
        email: email,
        role: isAdminLogin ? "admin" : "resident"
      };
      
      // Call the onLogin function from App.jsx
      if (onLogin) {
        onLogin(fakeToken, fakeUser);
      }
      
      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      // Show error message for invalid credentials
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2 className="auth-title">Login</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary btn-full">
            Login
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "var(--text-muted)" }}>
            New user?{" "}
            <span 
              onClick={() => navigate("/signup")}
              style={{ 
                color: "var(--primary)", 
                textDecoration: "none",
                cursor: "pointer"
              }}
            >
              Sign up here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;