import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Complaints() {
  const navigate = useNavigate();
  
  // Add this - get role from localStorage
  const [userRole, setUserRole] = useState("resident");
  
  const [complaints, setComplaints] = useState([
    { 
      id: 1, 
      title: "Main Gate Light", 
      description: "The street light near the main gate is flickering since last night.",
      category: "electrical",
      status: "In Progress", 
      date: "2024-03-01" 
    },
    { 
      id: 2, 
      title: "Kitchen Sink Leak", 
      description: "The plumbing team fixed the leakage in Flat C-405.",
      category: "plumbing",
      status: "Resolved", 
      date: "2024-02-28" 
    }
  ]);

  const [formData, setFormData] = useState({
    category: "",
    description: ""
  });

  const [showOtherInput, setShowOtherInput] = useState(false);

  // Add useEffect to get role from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole((user.role || "resident").toLowerCase());
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === "category" && value === "others") {
      setShowOtherInput(true);
    } else if (name === "category" && value !== "others") {
      setShowOtherInput(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalCategory = formData.category;
    if (formData.category === "others" && formData.customCategory) {
      finalCategory = formData.customCategory;
    }

    const newComplaint = {
      id: complaints.length + 1,
      title: "New Complaint",
      description: formData.description,
      category: finalCategory,
      status: "In Progress",
      date: new Date().toISOString().split('T')[0]
    };

    setComplaints([newComplaint, ...complaints]);
    
    setFormData({
      category: "",
      description: "",
      customCategory: ""
    });
    setShowOtherInput(false);
    
    alert("Complaint submitted successfully!");
  };

  // Add this function for admin to update status
  const handleStatusUpdate = (id, newStatus) => {
    setComplaints(complaints.map(complaint =>
      complaint.id === id
        ? { ...complaint, status: newStatus }
        : complaint
    ));
    alert(`Complaint status updated to ${newStatus}`);
  };

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Complaints</h1>
          <p>Register a new issue or track the status of existing ones.</p>
        </div>
      </section>

      <div className="grid grid-2">
        {/* New Complaint Form */}
        <section className="card">
          <div className="card-header">
            <h3>Raise New Complaint</h3>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Category</label>
              <select 
                className="input"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="security">Security</option>
                <option value="cleaning">Cleaning</option>
                <option value="parking">Parking</option>
                <option value="noise">Noise Complaint</option>
                <option value="pest">Pest Control</option>
                <option value="others">Others</option>
              </select>
            </div>

            {showOtherInput && (
              <div className="form-group">
                <label className="label">Specify Category</label>
                <input
                  type="text"
                  className="input"
                  name="customCategory"
                  placeholder="Please specify the category"
                  value={formData.customCategory || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="label">Issue Description</label>
              <textarea 
                className="input" 
                name="description"
                rows="6" 
                placeholder="Briefly describe the problem..."
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              Submit Complaint
            </button>
          </form>
        </section>

        {/* Status Tracker */}
        <section className="card">
          <div className="card-header">
            <h3>Complaint History</h3>
          </div>

          <div className="nav">
            {complaints.map((complaint) => (
              <div key={complaint.id}>
                <div className="card compact">
                  <div className="card-header">
                    <h3>{complaint.title}</h3>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="label">{complaint.status}</span>
                      {/* ONLY ADMIN sees this button - based on localStorage role */}
                      {userRole === "admin" && (
                        <select 
                          className="input"
                          style={{ width: "120px", padding: "4px 8px" }}
                          value={complaint.status}
                          onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <p>{complaint.description}</p>
                  <span className="label" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {complaint.category} • {complaint.date}
                  </span>
                </div>
                <div className="nav-divider" />
              </div>
            ))}
          </div>

          {complaints.length === 0 && (
            <div className="empty-state">
              No complaints yet
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Complaints;