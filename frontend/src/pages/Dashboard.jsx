import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useApplicationStore } from "../viewmodels/useApplicationStore";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { applications, fetchApplications } = useApplicationStore();

  // Fetch pending count for admin once on mount
  useEffect(() => {
    if (isAdmin) fetchApplications();
  }, [isAdmin]);

  const pendingCount = applications.length;
  // Show up to 3 most recent in the dashboard widget
  const recentApplications = applications.slice(0, 3);

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Hello {user?.name ?? ""}</h1>
          <p>Overview of society activity, maintenance, complaints, and bookings.</p>
        </div>

        <div className="header-actions">
          {!isAdmin && (
            <button className="btn btn-primary" onClick={() => navigate("/maintenance")}>
              Pay Maintenance
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navigate("/complaints")}>
            {isAdmin ? "View Complaints" : "Raise Complaint"}
          </button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-4">
        {isAdmin ? (
          // ── Admin stats ───────────────────────────────────────────────────
          <>
            <div
              className="card stat"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/applications")}
            >
              <h3>Pending Applications</h3>
              <h2>{pendingCount}</h2>
              <p>Awaiting your review</p>
            </div>

            <div
              className="card stat"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/users")}
            >
              <h3>Total Residents</h3>
              <h2>—</h2>
              <p>Active members in society</p>
            </div>

            <div
              className="card stat"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/maintenance")}
            >
              <h3>Maintenance Due</h3>
              <h2>₹42,000</h2>
              <p>Pending for this month</p>
            </div>

            <div
              className="card stat"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/complaints")}
            >
              <h3>Open Complaints</h3>
              <h2>7</h2>
              <p>Awaiting resolution</p>
            </div>
          </>
        ) : (
          // ── Resident stats ────────────────────────────────────────────────
          <>
            <div className="card stat">
              <h3>Total Residents</h3>
              <h2>128</h2>
              <p>Active members in society</p>
            </div>

            <div
              className="card stat"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/maintenance")}
            >
              <h3>Maintenance Due</h3>
              <h2>₹42,000</h2>
              <p>Pending for this month</p>
            </div>

            <div
              className="card stat"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/complaints")}
            >
              <h3>Open Complaints</h3>
              <h2>7</h2>
              <p>Awaiting resolution</p>
            </div>

            <div
              className="card stat"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/bookings")}
            >
              <h3>Facility Bookings</h3>
              <h2>3</h2>
              <p>Scheduled today</p>
            </div>
          </>
        )}
      </section>

      {/* Recent Activity */}
      <section className="grid grid-2">
        <div className="card compact">
          <div className="card-header">
            <h3>Recent Announcements</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate("/announcements")}
            >
              View All
            </button>
          </div>
          <ul className="list">
            <li>Water supply maintenance on Friday</li>
            <li>Annual general meeting this Sunday</li>
            <li>Parking rules updated</li>
          </ul>
        </div>

        {isAdmin ? (
          // ── Admin: pending applications mini-list ─────────────────────────
          <div className="card compact">
            <div className="card-header">
              <h3>Pending Applications</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate("/applications")}
              >
                View All
              </button>
            </div>

            {pendingCount === 0 ? (
              <p style={{ color: "var(--text-muted)", padding: "12px 0" }}>
                No pending applications.
              </p>
            ) : (
              <ul className="list">
                {recentApplications.map((app) => (
                  <li
                    key={app._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/applications")}
                  >
                    <strong>{app.name}</strong>
                    <span style={{ color: "var(--text-muted)", marginLeft: "6px", fontSize: "0.85rem" }}>
                      {app.email}
                    </span>
                  </li>
                ))}
                {pendingCount > 3 && (
                  <li
                    style={{ color: "var(--primary)", cursor: "pointer" }}
                    onClick={() => navigate("/applications")}
                  >
                    +{pendingCount - 3} more
                  </li>
                )}
              </ul>
            )}
          </div>
        ) : (
          // ── Resident: recent complaints ───────────────────────────────────
          <div className="card compact">
            <div className="card-header">
              <h3>Recent Complaints</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate("/complaints")}
              >
                View All
              </button>
            </div>
            <ul className="list">
              <li>Lift not working – Block A</li>
              <li>Water leakage – Flat B-203</li>
              <li>Street light issue near gate</li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
