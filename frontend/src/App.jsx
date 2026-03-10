import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuthStore } from "./viewmodels/useAuthStore";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Announcements from "./pages/Announcements";
import Notifications from "./pages/Notifications";

import MaintenanceBills from "./pages/MaintenanceBills";
import Complaints from "./pages/Complaints";
import Bookings from "./pages/Bookings";

import Users from "./pages/Users";
import Flats from "./pages/Flats";
import Facilities from "./pages/Facilities";

import Applications from "./pages/Applications";
import Apply from "./pages/Apply";
import NotFound from "./pages/NotFound";

function App() {
  const { init, isLoggedIn, user, logout, accountInactive, checkActivation } = useAuthStore();

  // Rehydrate auth state from localStorage on first render
  useEffect(() => { init(); }, []);

  // After login/rehydrate, check if resident account is inactive (no flat yet)
  useEffect(() => {
    if (isLoggedIn) checkActivation();
  }, [isLoggedIn]);

  const role = (user?.role ?? "resident").toLowerCase();

  // Inactive resident: logged in but no flat assigned yet
  if (isLoggedIn && accountInactive) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg, #f5f5f5)" }}>
        <div className="card" style={{ maxWidth: 420, width: "100%", textAlign: "center", padding: "2.5rem" }}>
          <h2 style={{ marginBottom: "0.75rem" }}>Account Pending Activation</h2>
          <p style={{ color: "var(--color-muted, #888)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            Your application has been accepted. Once the admin assigns a flat to your account, you will be able to log in and access the portal.
          </p>
          <button className="btn btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/apply" element={<Apply />} />

        {isLoggedIn ? (
          <Route element={<Layout role={role} onLogout={logout} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="/maintenance" element={<MaintenanceBills />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/bookings" element={<Bookings />} />

            {role === "admin" && <Route path="/applications" element={<Applications />} />}
            {role === "admin" && <Route path="/users" element={<Users />} />}
            <Route path="/flats" element={<Flats />} />
            <Route path="/facilities" element={<Facilities />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;