import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Facilities() {
  const navigate = useNavigate();
  const [role, setRole] = useState("resident");
  const [facilities, setFacilities] = useState([
    {
      id: 1,
      name: "Clubhouse",
      status: "available",
      capacity: "100 people",
      nextSlot: null,
      maintenance: false,
      bookedByUser: false,
      message: "Capacity: 100 people"
    },
    {
      id: 2,
      name: "Swimming Pool",
      status: "occupied",
      capacity: null,
      nextSlot: "4:00 PM",
      maintenance: false,
      bookedByUser: false,
      message: "4:00 PM"
    },
    {
      id: 3,
      name: "Gym",
      status: "available",
      capacity: null,
      nextSlot: "24/7 Access",
      maintenance: false,
      bookedByUser: false,
      message: "24/7 Access"
    },
    {
      id: 4,
      name: "Tennis Court",
      status: "maintenance",
      capacity: null,
      nextSlot: "Available tomorrow",
      maintenance: true,
      bookedByUser: false,
      message: "Available tomorrow"
    }
  ]);

  // Get user role from localStorage
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

  const handleBookNow = (facilityId) => {
    setFacilities(facilities.map(facility => 
      facility.id === facilityId 
        ? { ...facility, status: "occupied", bookedByUser: true, message: "Booked by you" }
        : facility
    ));
    
    alert("Facility booked successfully!");
  };

  const handleMaintenanceToggle = (facilityId) => {
    setFacilities(facilities.map(facility => {
      if (facility.id === facilityId) {
        const newMaintenance = !facility.maintenance;
        
        // If turning maintenance OFF (Mark Available)
        if (!newMaintenance) {
          // Restore original message based on facility
          let originalMessage = "";
          if (facility.id === 1) originalMessage = "Capacity: 100 people";
          else if (facility.id === 2) originalMessage = "4:00 PM";
          else if (facility.id === 3) originalMessage = "24/7 Access";
          else if (facility.id === 4) originalMessage = "Available tomorrow";
          
          return { 
            ...facility, 
            maintenance: false,
            status: "available",
            message: originalMessage,
            bookedByUser: false
          };
        }
        
        // If turning maintenance ON (Set Maintenance)
        return { 
          ...facility, 
          maintenance: true,
          status: "maintenance",
          message: "Under maintenance",
          bookedByUser: false
        };
      }
      return facility;
    }));
  };

  const getStatusDisplay = (facility) => {
    if (facility.maintenance) return "Maintenance";
    if (facility.bookedByUser) return "Booked";
    if (facility.status === "occupied") return "Occupied";
    if (facility.status === "available") return "Available";
    return facility.status.charAt(0).toUpperCase() + facility.status.slice(1);
  };

  const getStatusClass = (facility) => {
    if (facility.maintenance) return "status-maintenance";
    if (facility.bookedByUser) return "status-booked";
    return facility.status;
  };

  const isBookButtonDisabled = (facility) => {
    return facility.maintenance || facility.status === "occupied";
  };

  const getBookButtonText = (facility) => {
    if (facility.bookedByUser) return "Booked";
    if (facility.maintenance) return "Unavailable";
    if (facility.status === "occupied") return "Booked";
    return "Book Now";
  };

  const getMaintenanceButtonText = (facility) => {
    return facility.maintenance ? "Mark Available" : "Set Maintenance";
  };

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Facilities</h1>
          <p className="card-description">
            {role === "admin" 
              ? "Book and manage society amenities like clubhouse, gym, pool, and more."
              : "Book society amenities like clubhouse, gym, pool, and more."
            }
          </p>
        </div>
      </section>

      {/* Available Facilities */}
      <section className="grid grid-4">
        {facilities.map((facility) => (
          <div className="card stat" key={facility.id}>
            <div>
              <h3>{facility.name}</h3>
              <h2 className={getStatusClass(facility)}>
                {getStatusDisplay(facility)}
              </h2>
              <p>{facility.message}</p>
            </div>
            
            <div className="action-buttons" style={{ gap: '8px', marginTop: '12px' }}>
              {/* Book button - visible to both admin and resident */}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleBookNow(facility.id)}
                disabled={isBookButtonDisabled(facility)}
                style={{ flex: 1 }}
              >
                {getBookButtonText(facility)}
              </button>

              {/* Maintenance button - only visible to admin */}
              {role === "admin" && (
                <button
                  className={`btn ${facility.maintenance ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={() => handleMaintenanceToggle(facility.id)}
                  style={{ flex: 1 }}
                >
                  {getMaintenanceButtonText(facility)}
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Booking Schedule */}
      <section className="grid grid-2">
        <div className="card compact">
          <div className="card-header">
            <h3>Today's Bookings</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate("/bookings")}
            >
              View All Bookings
            </button>
          </div>

          <ul className="list">
            <li>Clubhouse - Birthday Party (2:00 PM - 6:00 PM)</li>
            <li>Swimming Pool - Regular Slot (10:00 AM - 12:00 PM)</li>
            <li>Gym - Personal Training (7:00 PM - 8:00 PM)</li>
          </ul>
        </div>

        <div className="card compact">
          <div className="card-header">
            <h3>My Upcoming Bookings</h3>
          </div>

          <ul className="list">
            <li>Gym - Friday, 7:00 AM</li>
            <li>Clubhouse - Sunday, 3:00 PM</li>
            <li>Tennis Court - Monday, 6:00 PM</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Facilities;