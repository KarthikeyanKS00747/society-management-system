import { NavLink } from "react-router-dom";

function Sidebar({ role = "resident" }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        {role === "admin" ? "Society Admin" : "Resident"}
      </div>

      <nav className="nav">
        <NavLink to="/dashboard" className="nav-item">
          Dashboard
        </NavLink>

        <div className="nav-divider" />

        {role === "resident" && (
          <>
            <NavLink to="/flats" className="nav-item">
              My Flat
            </NavLink>


            <NavLink to="/maintenance" className="nav-item">
              Maintenance Bills
            </NavLink>

            <div className="nav-divider" />

            <NavLink to="/complaints" className="nav-item">
              Complaints
            </NavLink>

            <NavLink to="/facilities" className="nav-item">
              Facilities 
            </NavLink>

            <NavLink to="/bookings" className="nav-item">
              Bookings
            </NavLink>
          </>
        )}

        {role === "admin" && (
          <>
            <NavLink to="/applications" className="nav-item">
              Applications
            </NavLink>

            <NavLink to="/flats" className="nav-item">
              Flat Management
            </NavLink>

            <NavLink to="/users" className="nav-item">
              Users
            </NavLink>

            <NavLink to="/maintenance" className="nav-item">
              Maintenance
            </NavLink>

            <div className="nav-divider" />

            <NavLink to="/complaints" className="nav-item">
              Complaints
            </NavLink>

            <NavLink to="/facilities" className="nav-item">
              Facilities
            </NavLink>

            <NavLink to="/bookings" className="nav-item">
              Bookings
            </NavLink> 
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
