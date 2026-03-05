import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useApplicationStore } from "../viewmodels/useApplicationStore";

import sidebarIcon from "../assets/icons/sidebar.svg";
import announcementIcon from "../assets/icons/announcements.svg";
import notificationIcon from "../assets/icons/notification.svg";
import profileIcon from "../assets/icons/profile.svg";
import applicationsIcon from "../assets/icons/applications.svg";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const pendingCount = useApplicationStore((s) => s.applications.length);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      
      <div className="navbar-left">
        <button className="icon-btn" onClick={onMenuClick}>
          <img src={sidebarIcon} alt="Toggle sidebar" />
        </button>

        <h1
          className="navbar-title"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          SocietyHub
        </h1>
      </div>

      
      <div className="navbar-right">
        <button
          className="icon-btn"
          title="Announcements"
          onClick={() => navigate("/announcements")}
        >
          <img src={announcementIcon} alt="Announcements" />
        </button>

        <button
          className="icon-btn"
          title="Notifications"
          onClick={() => navigate("/notifications")}
        >
          <img src={notificationIcon} alt="Notifications" />
        </button>

        {isAdmin && (
          <button
            className="icon-btn"
            title="Pending Applications"
            onClick={() => navigate("/applications")}
            style={{ position: "relative" }}
          >
            <img src={applicationsIcon} alt="Applications" />
            {pendingCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  background: "var(--danger, #d32f2f)",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  minWidth: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        )}

        <button
          className="icon-btn"
          title="Profile"
          onClick={() => navigate("/profile")}
        >
          <img src={profileIcon} alt="Profile" />
        </button>

        <button
          className="btn btn-outline btn-sm"
          title="Logout"
          onClick={handleLogout}
          style={{ marginLeft: "8px" }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
