import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Profile({ onLogout }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState("resident");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    flat: "",
    role: "",
    memberSince: "",
    emergencyContact: ""
  });
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: ""
  });

  // Get user role and data from localStorage
  useEffect(() => {
    const userDataFromStorage = localStorage.getItem("user");
    let userRole = "resident";
    let user = {};
    
    if (userDataFromStorage) {
      try {
        user = JSON.parse(userDataFromStorage);
        userRole = user.role || "resident";
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    setRole(userRole);
    
    // Set user data based on role
    if (userRole === "admin") {
      const adminData = {
        name: user.name || "Admin User",
        email: user.email || "admin@society.com",
        phone: user.phone || "9876543210",
        flat: "Admin Office",
        role: "Administrator",
        memberSince: user.memberSince || "Jan 2023",
        emergencyContact: user.emergencyContact || "9876543211"
      };
      setUserData(adminData);
      setFormData({
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        emergencyContact: adminData.emergencyContact
      });
    } else {
      const residentData = {
        name: user.name || "Rajesh Kumar",
        email: user.email || "rajesh@example.com",
        phone: user.phone || "9876543210",
        flat: user.flat || "A-101",
        role: "Resident",
        memberSince: user.memberSince || "Jan 2023",
        emergencyContact: user.emergencyContact || "9876543211"
      };
      setUserData(residentData);
      setFormData({
        name: residentData.name,
        email: residentData.email,
        phone: residentData.phone,
        emergencyContact: residentData.emergencyContact
      });
    }
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset form data to original user data
    setFormData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      emergencyContact: userData.emergencyContact
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveClick = () => {
    // Validate inputs
    if (!formData.name.trim()) {
      alert("Name cannot be empty");
      return;
    }
    if (!formData.email.trim()) {
      alert("Email cannot be empty");
      return;
    }
    if (!formData.phone.trim()) {
      alert("Phone number cannot be empty");
      return;
    }

    // Update user data
    setUserData(prev => ({
      ...prev,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      emergencyContact: formData.emergencyContact
    }));

    // Update localStorage
    const userFromStorage = localStorage.getItem("user");
    if (userFromStorage) {
      try {
        const user = JSON.parse(userFromStorage);
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          emergencyContact: formData.emergencyContact
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }

    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  return (
    <div className="page">
      {/* Page Header with Logout Button */}
      <section className="page-header dashboard-header">
        <div>
          <h1>My Profile</h1>
          <p>View and update your profile information.</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      {/* Profile Info Grid */}
      <section className="grid grid-2">
        {/* Personal Information Card */}
        <div className="card">
          <div className="card-header">
            <h3>Personal Information</h3>
            {!isEditing ? (
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleEditClick}
              >
                Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveClick}
                >
                  Save
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleCancelClick}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {!isEditing ? (
            // View Mode
            <>
              <div className="form-group">
                <label className="label">Full Name</label>
                <div className="profile-field">{userData.name}</div>
              </div>
              
              <div className="form-group">
                <label className="label">Email Address</label>
                <div className="profile-field">{userData.email}</div>
              </div>
              
              <div className="form-group">
                <label className="label">Phone Number</label>
                <div className="profile-field">{userData.phone}</div>
              </div>
              
              <div className="form-group">
                <label className="label">Emergency Contact</label>
                <div className="profile-field">{userData.emergencyContact}</div>
              </div>
            </>
          ) : (
            // Edit Mode
            <>
              <div className="form-group">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="input"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label className="label">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  className="input"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}
        </div>

        {/* Society Information Card */}
        <div className="card">
          <div className="card-header">
            <h3>Society Information</h3>
          </div>
          
          <div className="form-group">
            <label className="label">Flat Number</label>
            <div className="profile-field">{userData.flat}</div>
          </div>
          
          <div className="form-group">
            <label className="label">Role</label>
            <div className="profile-field">{userData.role}</div>
          </div>
          
          <div className="form-group">
            <label className="label">Member Since</label>
            <div className="profile-field">{userData.memberSince}</div>
          </div>
          
          <div className="form-group">
            <label className="label">Building/Block</label>
            <div className="profile-field">Block A</div>
          </div>
        </div>
      </section>

      {/* Account Actions */}
      <section className="card">
        <div className="card-header">
          <h3>Account Actions</h3>
        </div>
        
        <div className="grid grid-2" style={{ gap: "16px" }}>
          {/* Change Password button removed */}
          {/* Update Contact button removed */}
          
          <button 
            className="btn btn-outline"
            onClick={() => navigate("/maintenance")}
          >
            View Maintenance History
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={() => navigate("/complaints")}
          >
            My Complaints
          </button>
        </div>
      </section>
    </div>
  );
}

export default Profile;