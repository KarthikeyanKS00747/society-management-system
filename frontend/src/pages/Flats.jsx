import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useFlatStore } from "../viewmodels/useFlatStore";
import { useProfileStore } from "../viewmodels/useProfileStore";
import { useNotificationStore } from "../viewmodels/useNotificationStore";

// ─── Helper ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className={`card stat${accent ? " stat--accent" : ""}`}>
      <h3>{label}</h3>
      <h2>{value}</h2>
    </div>
  );
}

// ─── Admin View ───────────────────────────────────────────────────────────────
function AdminFlats() {
  const {
    flats,
    unassignedResidents,
    loading,
    saving,
    error,
    fetchFlats,
    fetchUnassignedResidents,
    createFlat,
    assignFlat,
    unassignFlat,
    updateFlat,
    deleteFlat,
  } = useFlatStore();

  const notify = useNotificationStore((s) => s.notify);
  const emptyNotified = useRef(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    flatNumber: "",
    block: "",
    areaSqFt: "",
    occupancyType: "OWNER",
  });

  // Which flat row is showing the assign panel
  const [assigningFlatId, setAssigningFlatId] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  // Inline edit state
  const [editingFlatId, setEditingFlatId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchFlats();
    fetchUnassignedResidents();
  }, []);

  useEffect(() => {
    if (!loading && !error && flats.length === 0 && !emptyNotified.current) {
      notify({ message: "No flats found.", type: "info" });
      emptyNotified.current = true;
    }
    if (flats.length > 0) emptyNotified.current = false;
  }, [loading, error, flats.length, notify]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const ok = await createFlat({
      flatNumber: form.flatNumber.trim(),
      block: form.block.trim(),
      areaSqFt: Number(form.areaSqFt),
      occupancyType: form.occupancyType,
    });
    if (ok) {
      setForm({ flatNumber: "", block: "", areaSqFt: "", occupancyType: "OWNER" });
      setShowCreate(false);
    }
  };

  const handleAssign = async (flatId) => {
    if (!selectedUser) return;
    const ok = await assignFlat(flatId, selectedUser);
    if (ok) {
      setAssigningFlatId(null);
      setSelectedUser("");
      // Refresh unassigned list after assignment
      fetchUnassignedResidents();
    }
  };

  const handleUnassign = async (flatId) => {
    const ok = await unassignFlat(flatId);
    if (ok) fetchUnassignedResidents();
  };

  const handleEditOpen = (flat) => {
    setEditingFlatId(flat._id);
    setAssigningFlatId(null);
    setEditForm({
      flatNumber: flat.flatNumber ?? "",
      block: flat.block ?? "",
      areaSqFt: flat.areaSqFt ?? "",
      occupancyType: flat.occupancyType ?? "OWNER",
    });
  };

  const handleEditSave = async (flatId) => {
    const ok = await updateFlat(flatId, {
      flatNumber: editForm.flatNumber.trim(),
      block: editForm.block.trim(),
      areaSqFt: editForm.areaSqFt !== "" ? Number(editForm.areaSqFt) : undefined,
      occupancyType: editForm.occupancyType,
    });
    if (ok) setEditingFlatId(null);
  };

  const handleDelete = async (flatId) => {
    if (!window.confirm("Delete this flat? This cannot be undone.")) return;
    await deleteFlat(flatId);
  };

  const totalFlats = flats.length;
  const occupied = flats.filter((f) => f.occupant).length;
  const vacant = totalFlats - occupied;

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Flat Management</h1>
          <p>Create flats and assign residents</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Cancel" : "+ Create Flat"}
        </button>
      </section>

      {/* Stats */}
      <section className="grid grid-4">
        <StatCard label="Total Flats" value={totalFlats} />
        <StatCard label="Occupied" value={occupied} accent />
        <StatCard label="Vacant" value={vacant} />
        <StatCard label="Unassigned Residents" value={unassignedResidents.length} />
      </section>

      {/* Create Flat Form */}
      {showCreate && (
        <section className="card">
          <div className="card-header">
            <h3>New Flat</h3>
          </div>
          <form onSubmit={handleCreate}>
            <div className="grid grid-2" style={{ gap: "20px" }}>
              <div className="form-group">
                <label className="label">Flat Number *</label>
                <input
                  className="input"
                  value={form.flatNumber}
                  onChange={(e) => setForm((f) => ({ ...f, flatNumber: e.target.value }))}
                  placeholder="e.g. 101"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Block *</label>
                <input
                  className="input"
                  value={form.block}
                  onChange={(e) => setForm((f) => ({ ...f, block: e.target.value }))}
                  placeholder="e.g. A"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Area (sq ft)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={form.areaSqFt}
                  onChange={(e) => setForm((f) => ({ ...f, areaSqFt: e.target.value }))}
                  placeholder="e.g. 1200"
                />
              </div>
              <div className="form-group">
                <label className="label">Occupancy Type</label>
                <select
                  className="input"
                  value={form.occupancyType}
                  onChange={(e) => setForm((f) => ({ ...f, occupancyType: e.target.value }))}
                >
                  <option value="OWNER">Owner</option>
                  <option value="RENTER">Renter</option>
                </select>
              </div>
            </div>
            <div className="action-buttons" style={{ marginTop: "8px" }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Creating…" : "Create Flat"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Flats Table */}
      {loading ? (
        <p className="empty-state">Loading flats…</p>
      ) : flats.length === 0 ? null : (
        <section className="card compact" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Block</th>
                <th>Flat No.</th>
                <th>Area</th>
                <th>Type</th>
                <th>Occupant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flats.map((flat) => (
                <>
                  <tr key={flat._id}>
                    <td>{flat.block || "—"}</td>
                    <td><strong>{flat.flatNumber}</strong></td>
                    <td>{flat.areaSqFt ? `${flat.areaSqFt} sq ft` : "—"}</td>
                    <td>{flat.occupancyType ?? "—"}</td>
                    <td>
                      {flat.occupant ? (
                        <span>
                          <strong>{flat.occupant.name}</strong>{" "}
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85em" }}>
                            {flat.occupant.email}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>Vacant</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {flat.occupant ? (
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={saving}
                            onClick={() => handleUnassign(flat._id)}
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setAssigningFlatId(
                                assigningFlatId === flat._id ? null : flat._id
                              );
                              setEditingFlatId(null);
                              setSelectedUser("");
                            }}
                          >
                            {assigningFlatId === flat._id ? "Cancel" : "Assign"}
                          </button>
                        )}
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() =>
                            editingFlatId === flat._id
                              ? setEditingFlatId(null)
                              : handleEditOpen(flat)
                          }
                        >
                          {editingFlatId === flat._id ? "Cancel" : "Edit"}
                        </button>
                        {!flat.occupant && (
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={saving}
                            onClick={() => handleDelete(flat._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline Edit Row */}
                  {editingFlatId === flat._id && (
                    <tr key={`${flat._id}-edit`}>
                      <td colSpan={6} style={{ padding: "16px 12px", background: "rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", alignItems: "end" }}>
                          <div>
                            <label className="label">Block</label>
                            <input
                              className="input"
                              placeholder="e.g. A"
                              value={editForm.block}
                              onChange={(e) => setEditForm((f) => ({ ...f, block: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="label">Flat No.</label>
                            <input
                              className="input"
                              placeholder="e.g. 101"
                              value={editForm.flatNumber}
                              onChange={(e) => setEditForm((f) => ({ ...f, flatNumber: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="label">Area (sq ft)</label>
                            <input
                              className="input"
                              type="number"
                              min="1"
                              placeholder="e.g. 1200"
                              value={editForm.areaSqFt}
                              onChange={(e) => setEditForm((f) => ({ ...f, areaSqFt: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="label">Type</label>
                            <select
                              className="input"
                              value={editForm.occupancyType}
                              onChange={(e) => setEditForm((f) => ({ ...f, occupancyType: e.target.value }))}
                            >
                              <option value="OWNER">Owner</option>
                              <option value="RENTER">Renter</option>
                            </select>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", paddingBottom: "0" }}>
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={saving}
                              onClick={() => handleEditSave(flat._id)}
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setEditingFlatId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Inline Assign Panel */}
                  {assigningFlatId === flat._id && (
                    <tr key={`${flat._id}-assign`}>
                      <td colSpan={6} style={{ padding: "16px 12px", background: "rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "12px", alignItems: "end", maxWidth: 560 }}>
                          <div>
                            <label className="label">Assign Resident</label>
                            <select
                              className="input"
                              value={selectedUser}
                              onChange={(e) => setSelectedUser(e.target.value)}
                            >
                              <option value="">Select resident…</option>
                              {unassignedResidents.map((r) => (
                                <option key={r._id} value={r._id}>
                                  {r.name} ({r.email})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div style={{ display: "flex", gap: "8px", paddingTop: "22px" }}>
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={!selectedUser || saving}
                              onClick={() => handleAssign(flat._id)}
                            >
                              {saving ? "Assigning…" : "Confirm"}
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => setAssigningFlatId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

// ─── Resident View ────────────────────────────────────────────────────────────
function ResidentFlat() {
  const { flats, loading, fetchFlats } = useFlatStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchFlats();
    if (!profile) fetchProfile();
  }, []);

  // Backend returns resident's own flat as the first (and only) item
  const flat = flats[0] ?? null;

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>My Flat</h1>
          <p>Your assigned flat details</p>
        </div>
      </section>

      {loading && !flat ? (
        <p style={{ textAlign: "center", color: "var(--color-muted, #888)", marginTop: "2rem" }}>Loading…</p>
      ) : !flat ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--color-muted, #888)" }}>
          No flat assigned yet. Contact your society admin to get a flat assigned to you.
        </div>
      ) : (
        <>
          <section className="grid grid-4">
            <StatCard label="Flat Number" value={flat.flatNumber ?? "—"} accent />
            <StatCard label="Block" value={flat.block ?? "—"} />
            <StatCard label="Area" value={flat.areaSqFt ? `${flat.areaSqFt} sq ft` : "—"} />
            <StatCard label="Occupancy Type" value={flat.occupancyType ?? "—"} />
          </section>

          {profile?.society && (
            <section className="card">
              <div className="card-header">
                <h3>Society Info</h3>
              </div>
              <div className="list">
                <div className="list-item">
                  <span>Society Name</span>
                  <span>{profile.society.name ?? "—"}</span>
                </div>
                <div className="list-item">
                  <span>Member Since</span>
                  <span>
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="list-item">
                  <span>Account Status</span>
                  <span style={{ color: profile.isActive ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                    {profile.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

// ─── Route Component ──────────────────────────────────────────────────────────
export default function Flats() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  return isAdmin ? <AdminFlats /> : <ResidentFlat />;
}