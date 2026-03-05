import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";

function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);

  // Seed display data from the JWT payload (id, role, societyId).
  // Fields not in the JWT (phone, flat, etc.) will be populated
  // once a GET /profile endpoint is wired up.
  const [userData, setUserData] = useState({
    name:             user?.name  ?? "",
    email:            user?.email ?? "",
    phone:            user?.phone ?? "",
    flat:             user?.flat  ?? "",
    role:             user?.role  ?? "",
    memberSince:      "",
    emergencyContact: "",
  });

  const [formData, setFormData] = useState({
    name:             userData.name,
    email:            userData.email,
    phone:            userData.phone,
    emergencyContact: userData.emergencyContact,
  });

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
    if (!formData.name.trim()) { alert("Name cannot be empty"); return; }
    if (!formData.email.trim()) { alert("Email cannot be empty"); return; }
    if (!formData.phone.trim()) { alert("Phone number cannot be empty"); return; }

    // Update local display state only.
    // TODO: wire up PUT /profile endpoint via ProfileService + store.
    setUserData((prev) => ({ ...prev, ...formData }));
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>My Profile</h1>
          <p>View and update your profile information.</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
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