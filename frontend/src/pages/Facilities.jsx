import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useFacilityStore } from "../viewmodels/useFacilityStore";
import { useNotificationStore } from "../viewmodels/useNotificationStore";

function Facilities() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = (user?.role ?? "resident").toLowerCase();

  const {
    facilities, loading, saving, error,
    fetchFacilities, createFacility, updateFacility, deleteFacility,
  } = useFacilityStore();

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", capacity: "", isActive: true });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const notify = useNotificationStore((s) => s.notify);
  const emptyNotified = useRef(false);

  useEffect(() => { fetchFacilities(); }, []);

  useEffect(() => {
    if (!loading && !error && facilities.length === 0 && !emptyNotified.current) {
      notify({ message: "No facilities found.", type: "info" });
      emptyNotified.current = true;
    }
    if (facilities.length > 0) emptyNotified.current = false;
  }, [loading, error, facilities.length, notify]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const ok = await createFacility({
      name: addForm.name.trim(),
      capacity: addForm.capacity !== "" ? Number(addForm.capacity) : undefined,
      isActive: addForm.isActive,
    });
    if (ok) { setAddForm({ name: "", capacity: "", isActive: true }); setShowAdd(false); }
  };

  const startEdit = (f) => {
    setEditingId(f._id);
    setEditForm({ name: f.name, capacity: f.capacity ?? "", isActive: f.isActive });
  };

  const handleEditSave = async (id) => {
    const ok = await updateFacility(id, {
      name: editForm.name.trim(),
      capacity: editForm.capacity !== "" ? Number(editForm.capacity) : null,
      isActive: editForm.isActive,
    });
    if (ok) setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this facility? This cannot be undone.")) deleteFacility(id);
  };

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Facilities</h1>
          <p>
            {role === "admin"
              ? "Manage society amenities — add, edit, activate or remove facilities."
              : "Browse and book society amenities."}
          </p>
        </div>
        {role === "admin" && (
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? "Cancel" : "+ Add Facility"}
            </button>
          </div>
        )}
      </section>

      {/* Add form — admin only */}
      {role === "admin" && showAdd && (
        <section className="card">
          <div className="card-header"><h3>New Facility</h3></div>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: "1 1 160px", margin: 0 }}>
              <label className="label">Name</label>
              <input
                className="input"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Swimming Pool"
                required
              />
            </div>
            <div className="form-group" style={{ flex: "0 1 120px", margin: 0 }}>
              <label className="label">Capacity</label>
              <input
                type="number"
                className="input"
                value={addForm.capacity}
                onChange={(e) => setAddForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="Optional"
                min="0"
              />
            </div>
            <div className="form-group" style={{ flex: "0 1 120px", margin: 0 }}>
              <label className="label">Status</label>
              <select
                className="input"
                value={addForm.isActive ? "active" : "inactive"}
                onChange={(e) => setAddForm((f) => ({ ...f, isActive: e.target.value === "active" }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-end" }}>
              {saving ? "Saving..." : "Create"}
            </button>
          </form>
        </section>
      )}

      {/* Facility cards */}
      {loading ? (
        <p style={{ textAlign: "center", color: "var(--color-muted, #888)", marginTop: "2rem" }}>Loading facilities...</p>
      ) : facilities.length === 0 ? null : (
        <section className="grid grid-4" style={{ marginTop: "2rem" }}>
          {facilities.map((f) => (
            <div className="card stat" key={f._id}>
              {editingId === f._id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <input
                    className="input"
                    value={editForm.name}
                    onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    className="input"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm((s) => ({ ...s, capacity: e.target.value }))}
                    placeholder="Capacity (optional)"
                    min="0"
                  />
                  <select
                    className="input"
                    value={editForm.isActive ? "active" : "inactive"}
                    onChange={(e) => setEditForm((s) => ({ ...s, isActive: e.target.value === "active" }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleEditSave(f._id)} disabled={saving}>Save</button>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3>{f.name}</h3>
                    <h2 style={{ color: f.isActive ? "green" : "#e53e3e", fontSize: "1rem", margin: "0.25rem 0" }}>
                      {f.isActive ? "Active" : "Inactive"}
                    </h2>
                    {f.capacity && (
                      <p style={{ color: "var(--color-muted, #888)", fontSize: "0.85rem" }}>
                        Capacity: {f.capacity}
                      </p>
                    )}
                  </div>

                  {role === "admin" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.75rem" }}>
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(f)}>Edit</button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => updateFacility(f._id, { isActive: !f.isActive })}
                        disabled={saving}
                      >
                        {f.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: "#e53e3e", color: "#fff", border: "none" }}
                        onClick={() => handleDelete(f._id)}
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "0.75rem", width: "100%" }}
                      onClick={() => navigate("/bookings")}
                      disabled={!f.isActive}
                    >
                      {f.isActive ? "Book Now" : "Unavailable"}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="card compact" style={{ marginTop: "1rem" }}>
        <div className="card-header">
          <h3>Bookings</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/bookings")}>
            View All Bookings
          </button>
        </div>
        <p style={{ color: "var(--color-muted, #888)", fontSize: "0.9rem" }}>
          To book a facility, head to the Bookings page and select your preferred facility, date and time.
        </p>
      </section>
    </div>
  );
}

export default Facilities;
