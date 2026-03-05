import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Bookings() {
  const navigate = useNavigate();
  const [role, setRole] = useState("resident");
  
  // Sample bookings data
  const [allBookings, setAllBookings] = useState([
    { id: 1, facility: "Club House", date: "2024-01-25", time: "18:00 - 21:00", bookedBy: "Rajesh Kumar", flat: "A-101", status: "Confirmed" },
    { id: 2, facility: "Swimming Pool", date: "2024-01-26", time: "15:00 - 17:00", bookedBy: "Priya Sharma", flat: "B-205", status: "Pending" },
    { id: 3, facility: "Tennis Court", date: "2024-01-24", time: "07:00 - 09:00", bookedBy: "Amit Patel", flat: "C-302", status: "Confirmed" },
    { id: 4, facility: "Gym", date: "2024-01-27", time: "19:00 - 20:00", bookedBy: "Sneha Reddy", flat: "D-104", status: "Cancelled" },
    { id: 5, facility: "Club House", date: "2024-01-15", time: "18:00 - 21:00", bookedBy: "Current User", flat: "B-203", status: "Confirmed" },
    { id: 6, facility: "Swimming Pool", date: "2024-01-10", time: "10:00 - 12:00", bookedBy: "Current User", flat: "B-203", status: "Confirmed" }
  ]);

  const [facilities] = useState([
    { name: "Club House", rate: "₹2,500/hour", capacity: "100 persons" },
    { name: "Swimming Pool", rate: "₹1,000/hour", capacity: "30 persons" },
    { name: "Tennis Court", rate: "₹800/hour", capacity: "4 persons" },
    { name: "Gym", rate: "₹500/hour", capacity: "15 persons" }
  ]);

  const [newBooking, setNewBooking] = useState({
    facility: "",
    date: "",
    time: "",
    purpose: ""
  });

  // Get user role and info from localStorage
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
  }, []);

  // Filter bookings based on role
  const getRecentBookings = () => {
    if (role === "admin") {
      // Admin sees all bookings (latest first)
      return [...allBookings].sort((a, b) => b.id - a.id);
    } else {
      // Resident sees only their bookings
      return allBookings.filter(booking => 
        booking.flat === "B-203" || booking.bookedBy === "Current User"
      ).sort((a, b) => b.id - a.id);
    }
  };

  const handleNewBooking = () => {
    // Get current user info
    const userData = localStorage.getItem("user");
    let userName = "Current User";
    let userFlat = "B-203";
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userName = user.name || "Current User";
        userFlat = user.flat || "B-203";
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Create new booking object
    const newBookingEntry = {
      id: allBookings.length + 1,
      facility: newBooking.facility,
      date: newBooking.date,
      time: newBooking.time,
      bookedBy: userName,
      flat: userFlat,
      status: "Pending"
    };

    // Add to all bookings
    setAllBookings([newBookingEntry, ...allBookings]);
    
    // Show success message
    alert("Booking request submitted successfully!");
    
    // Reset form
    setNewBooking({ facility: "", date: "", time: "", purpose: "" });
  };

  const handleMarkAsBooked = (bookingId) => {
    // Update booking status to Confirmed
    setAllBookings(allBookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: "Confirmed" } 
        : booking
    ));
    
    alert("Booking marked as confirmed!");
  };

  // Stats for admin only
  const renderAdminStats = () => {
    if (role !== "admin") return null;

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = allBookings.filter(b => b.date === today).length;
    const upcomingBookings = allBookings.filter(b => b.date > today).length;
    const pendingBookings = allBookings.filter(b => b.status === "Pending").length;
    
    // Find most booked facility
    const facilityCounts = {};
    allBookings.forEach(b => {
      facilityCounts[b.facility] = (facilityCounts[b.facility] || 0) + 1;
    });
    const mostBooked = Object.keys(facilityCounts).reduce((a, b) => 
      facilityCounts[a] > facilityCounts[b] ? a : b, "Club House");

    return (
      <section className="grid grid-4">
        <div className="card stat">
          <h3>Today's Bookings</h3>
          <h2>{todayBookings}</h2>
          <p>Scheduled for today</p>
        </div>
        <div className="card stat">
          <h3>Upcoming</h3>
          <h2>{upcomingBookings}</h2>
          <p>Next 7 days</p>
        </div>
        <div className="card stat">
          <h3>Pending</h3>
          <h2>{pendingBookings}</h2>
          <p>Awaiting approval</p>
        </div>
        <div className="card stat">
          <h3>Most Booked</h3>
          <h2>{mostBooked}</h2>
          <p>Popular facility</p>
        </div>
      </section>
    );
  };

  const recentBookings = getRecentBookings();

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Facility Bookings</h1>
          <p className="card-description">
            {role === "admin" 
              ? "Manage and approve facility bookings for all residents."
              : "Book and manage your facility reservations."
            }
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate("/facilities")}>
            View Facilities
          </button>
        </div>
      </section>

      {/* Stats Section - Only visible to admin */}
      {renderAdminStats()}

      <div className={`bookings-layout ${role === 'admin' ? 'admin-view' : 'resident-view'}`}>
        {/* Recent Bookings */}
        <div className="card bookings-table-card">
          <h3 className="card-title">
            {role === "admin" ? "Recent Bookings" : "My Recent Bookings"}
          </h3>
          
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  {role === "admin" && <th>Booked By</th>}
                  <th>Date & Time</th>
                  <th>Status</th>
                  {role === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="facility-name">{booking.facility}</div>
                      <div className="flat-number">{booking.flat}</div>
                    </td>
                    {role === "admin" && (
                      <td>
                        <div className="booked-by-name">{booking.bookedBy}</div>
                        <div className="flat-number">{booking.flat}</div>
                      </td>
                    )}
                    <td>
                      <div className="booking-date">{booking.date}</div>
                      <div className="booking-time">{booking.time}</div>
                    </td>
                    <td>
                      <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    {role === "admin" && (
                      <td>
                        {booking.status === "Pending" && (
                          <button 
                            className="btn btn-primary btn-sm mark-booked-btn"
                            onClick={() => handleMarkAsBooked(booking.id)}
                          >
                            Mark Booked
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Book New Facility */}
        <div className="card booking-form-card">
          <h3 className="card-title">Book New Facility</h3>
          
          <div className="form-group">
            <label className="label">Select Facility</label>
            <select 
              className="input"
              value={newBooking.facility}
              onChange={(e) => setNewBooking({...newBooking, facility: e.target.value})}
            >
              <option value="">Choose a facility</option>
              {facilities.map((facility, index) => (
                <option key={index} value={facility.name}>{facility.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Date</label>
            <input
              type="date"
              className="input date-input"
              value={newBooking.date}
              onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="label">Time Slot</label>
            <select 
              className="input"
              value={newBooking.time}
              onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
            >
              <option value="">Select time</option>
              <option value="07:00 - 09:00">Morning: 7 AM - 9 AM</option>
              <option value="10:00 - 12:00">Late Morning: 10 AM - 12 PM</option>
              <option value="15:00 - 17:00">Afternoon: 3 PM - 5 PM</option>
              <option value="18:00 - 21:00">Evening: 6 PM - 9 PM</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Purpose (Optional)</label>
            <input
              type="text"
              className="input"
              placeholder="Birthday party, Anniversary, etc."
              value={newBooking.purpose}
              onChange={(e) => setNewBooking({...newBooking, purpose: e.target.value})}
            />
          </div>

          <button 
            className="btn btn-primary btn-full submit-booking-btn"
            onClick={handleNewBooking}
            disabled={!newBooking.facility || !newBooking.date || !newBooking.time}
          >
            Submit Booking Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default Bookings;