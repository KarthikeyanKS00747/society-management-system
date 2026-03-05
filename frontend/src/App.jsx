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
  const { init, isLoggedIn, user, logout } = useAuthStore();

  // Rehydrate auth state from localStorage on first render
  useEffect(() => { init(); }, []);

  const role = (user?.role ?? "resident").toLowerCase();

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

            <Route path="/applications" element={<Applications />} />

            <Route path="/users" element={<Users />} />
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