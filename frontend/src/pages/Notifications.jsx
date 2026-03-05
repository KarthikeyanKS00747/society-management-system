import { useState, useEffect } from "react";

function Notifications() {
  const [role, setRole] = useState("resident");
  const [notifications, setNotifications] = useState([]);

  // Initialize based on user role
  useEffect(() => {
    const userData = localStorage.getItem("user");
    let userRole = "resident";
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userRole = (user.role || "resident").toLowerCase();
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    setRole(userRole);
    
    // Set notifications based on role
    if (userRole === "admin") {
      setNotifications([
        { id: 1, message: "New complaint filed in Block A", time: "10m ago", isRead: false },
        { id: 2, message: "Maintenance payment received from Flat 302", time: "25m ago", isRead: false },
        { id: 3, message: "Monthly maintenance report ready for February", time: "3h ago", isRead: true },
        { id: 4, message: "Staff attendance pending for this week", time: "5h ago", isRead: false },
        { id: 5, message: "Facility booking request for Clubhouse", time: "6h ago", isRead: true },
        { id: 6, message: "New resident moved into Flat 405", time: "1d ago", isRead: false }
      ]);
    } else {
      setNotifications([
        { id: 1, message: "Maintenance bill generated for March", time: "2h ago", isRead: false },
        { id: 2, message: "Complaint #1024 has been resolved", time: "1d ago", isRead: false },
        { id: 3, message: "Payment received for February bill", time: "2d ago", isRead: true },
        { id: 4, message: "Gym maintenance scheduled for tomorrow", time: "1d ago", isRead: false },
        { id: 5, message: "Community meeting on Saturday at 5 PM", time: "2d ago", isRead: true }
      ]);
    }
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, isRead: true } 
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, isRead: true })
    ));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Notifications</h1>
          <p className="card-description">
            {role === "admin" 
              ? "Stay updated with society activities, complaints, and payments."
              : "Your recent activity, bills, and community updates."
            }
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </p>
        </div>
      </section>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>No notifications to display.</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((note, index) => (
                <div key={note.id}>
                  <div 
                    className={`notification-item ${!note.isRead ? 'unread' : ''}`}
                    onClick={() => markAsRead(note.id)}
                  >
                    {!note.isRead && <span className="unread-dot"></span>}
                    <div className="notification-content">
                      <p className="notification-message">{note.message}</p>
                      <span className="notification-time label">{note.time}</span>
                    </div>
                  </div>
                  {index !== notifications.length - 1 && <div className="nav-divider2" />}
                </div>
              ))}
            </div>
            
            {unreadCount > 0 && (
              <div className="notification-footer">
                <button 
                  className="btn btn-outline btn-full"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Notifications;