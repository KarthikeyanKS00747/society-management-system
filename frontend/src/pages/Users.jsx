import { useEffect, useState, useMemo } from "react";
import { useFlatStore } from "../viewmodels/useFlatStore";

function Users() {
  const { flats, unassignedResidents, loading, fetchFlats, fetchUnassignedResidents } = useFlatStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchFlats();
    fetchUnassignedResidents();
  }, []);

  // Build unified user list:
  // - Assigned residents come from flats (occupant field) — have name + email; phone unavailable from this endpoint
  // - Unassigned residents come from /unassigned-residents — have name, email, phone
  const allUsers = useMemo(() => {
    const assigned = flats
      .filter((f) => f.occupant)
      .map((f) => ({
        _id: f.occupant.id ?? f.occupant._id,
        name: f.occupant.name,
        email: f.occupant.email,
        phone: f.occupant.phone ?? "—",
        flat: f.block ? `${f.block}-${f.flatNumber}` : f.flatNumber,
        status: "Active",
      }));

    const unassigned = unassignedResidents.map((r) => ({
      _id: r._id,
      name: r.name,
      email: r.email,
      phone: r.phone ?? "—",
      flat: "—",
      status: "Inactive",
    }));

    return [...assigned, ...unassigned];
  }, [flats, unassignedResidents]);

  const filteredUsers = allUsers.filter((u) => {
    const matchesStatus =
      statusFilter === "all" || u.status.toLowerCase() === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.flat.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Resident Directory</h1>
          <p>All society residents — active (flat assigned) and inactive (pending assignment).</p>
        </div>
      </section>

      {/* Filters */}
      <section className="card filter-card">
        <div className="filter-grid">
          <div>
            <label className="label">Search</label>
            <input
              type="text"
              className="input"
              placeholder="Search by name, flat, or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Filter by Status</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="card">
        <div className="card-header">
          <h3>All Residents ({filteredUsers.length})</h3>
          <div className="table-count">
            Showing {filteredUsers.length} of {allUsers.length} residents
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "var(--color-muted, #888)", padding: "2rem" }}>
            Loading residents…
          </p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Flat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="table-primary">{user.name}</div>
                    </td>
                    <td>
                      <div className="table-primary">{user.email}</div>
                    </td>
                    <td>
                      <div className="table-primary">{user.phone}</div>
                    </td>
                    <td>
                      <div className="table-primary">{user.flat}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: user.status === "Active" ? "green" : "#e53e3e",
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="empty-state">No residents found matching your filters.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Users;

