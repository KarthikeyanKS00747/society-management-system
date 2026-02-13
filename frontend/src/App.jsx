import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

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

import NotFound from "./pages/NotFound";

function App() {
  // Check if user is logged in (from localStorage or auth context)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("resident");
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      // Check if token exists in localStorage
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        setIsLoggedIn(true);
        const user = JSON.parse(userData);
        setRole(user.role || "resident");
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Handle login
  const handleLogin = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
    setRole(userData.role || "resident");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole("resident");
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "var(--bg-main)"
      }}>
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* CHANGED: Always go to login first, never to dashboard */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        {isLoggedIn ? (
          <Route element={<Layout role={role} onLogout={handleLogout} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="/maintenance" element={<MaintenanceBills />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/bookings" element={<Bookings />} />

            <Route path="/users" element={<Users />} />
            <Route path="/flats" element={<Flats />} />
            <Route path="/facilities" element={<Facilities />} />
          </Route>
        ) : (
          // Redirect protected routes to login
          <Route path="*" element={<Navigate to="/login" />} />
        )}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;