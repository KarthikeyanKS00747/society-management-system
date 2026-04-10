import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useBookingStore } from "../viewmodels/useBookingStore";
import { useFacilityStore } from "../viewmodels/useFacilityStore";
import { useNotificationStore } from "../viewmodels/useNotificationStore";

const STATUS_COLOR = { PENDING: "#d97706", APPROVED: "green", REJECTED: "#e53e3e" };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

function Bookings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = (user?.role ?? "resident").toLowerCase();

  const {
    bookings, loading, saving, error,
    fetchBookings, createBooking, approveBooking, rejectBooking,
  } = useBookingStore();
  const { facilities, fetchFacilities } = useFacilityStore();

  const [form, setForm] = useState({ facilityId: "", date: "", startTime: "", endTime: "" });
  const notify = useNotificationStore((s) => s.notify);
  const emptyNotified = useRef(false);

  useEffect(() => {
    fetchBookings();
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (!loading && !error && bookings.length === 0 && !emptyNotified.current) {
      notify({ message: "No bookings found.", type: "info" });
      emptyNotified.current = true;
    }
    if (bookings.length > 0) emptyNotified.current = false;
  }, [loading, error, bookings.length, notify]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      notify({ message: "End time must be after start time.", type: "warning" });
      return;
    }
    const ok = await createBooking(form);
    if (ok) {
      setForm({ facilityId: "", date: "", startTime: "", endTime: "" });
      notify({ message: "Booking request submitted. Awaiting admin approval.", type: "success" });
    }
  };

  const pending  = bookings.filter((b) => b.status === "PENDING").length;
  const approved = bookings.filter((b) => b.status === "APPROVED").length;
  const rejected = bookings.filter((b) => b.status === "REJECTED").length;

  // Build a map from facility _id → facility object for display
  const facilityMap = Object.fromEntries(facilities.map((f) => [f._id, f]));
  const resolveFacility = (raw) => facilityMap[raw?._id ?? raw] ?? raw;

  return (
    <div className="page">
      <section className="page-header dashboard-header">
        <div>
          <h1>Facility Bookings</h1>
          <p>
            {role === "admin"
              ? "Review and manage all facility booking requests."
              : "Book a facility or track your reservation status."}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate("/facilities")}>
            View Facilities
          </button>
        </div>
      </section>

      {role === "admin" && (
        <section className="grid grid-4">
          <div className="card stat"><h3>Total</h3><h2>{bookings.length}</h2><p>All bookings</p></div>
          <div className="card stat"><h3>Pending</h3><h2>{pending}</h2><p>Awaiting approval</p></div>
          <div className="card stat"><h3>Approved</h3><h2>{approved}</h2><p>Confirmed</p></div>
          <div className="card stat"><h3>Rejected</h3><h2>{rejected}</h2><p>Declined</p></div>
        </section>
      )}

      <div className={role === "resident" ? "grid grid-2" : ""}>
        {role === "resident" && (
          <section className="card">
            <div className="card-header"><h3>New Booking Request</h3></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label">Facility</label>
                <select
                  className="input"
                  value={form.facilityId}
                  onChange={(e) => setForm((f) => ({ ...f, facilityId: e.target.value }))}
                  required
                >
                  <option value="" disabled>Select a facility</option>
                  {facilities.filter((f) => f.isActive).map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name}{f.capacity ? " (cap: " + f.capacity + ")" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Start Time</label>
                <input
                  type="time"
                  className="input"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">End Time</label>
                <input
                  type="time"
                  className="input"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                {saving ? "Submitting..." : "Submit Booking Request"}
              </button>
            </form>
          </section>
        )}

        <section className="card">
          <div className="card-header">
            <h3>{role === "admin" ? "All Bookings" : "My Bookings"} ({bookings.length})</h3>
          </div>
          {loading ? (
            <p style={{ textAlign: "center", color: "var(--color-muted, #888)", padding: "2rem" }}>Loading bookings...</p>
          ) : bookings.length === 0 ? null : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    {role === "admin" && <th>Resident</th>}
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    {role === "admin" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        {(() => {
                          const fac = resolveFacility(b.facilityId);
                          return (
                            <>
                              <div className="table-primary">{fac?.name ?? fac}</div>
                              {fac?.capacity && (
                                <div style={{ fontSize: "0.78rem", color: "var(--color-muted, #888)" }}>
                                  Cap: {fac.capacity}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </td>
                      {role === "admin" && (
                        <td>
                          <div className="table-primary">{b.userId?.name ?? "-"}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--color-muted, #888)" }}>{b.userId?.email}</div>
                        </td>
                      )}
                      <td>{fmtDate(b.date)}</td>
                      <td style={{ fontSize: "0.85rem" }}>{b.startTime} - {b.endTime}</td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: "0.82rem", color: STATUS_COLOR[b.status] ?? "#888" }}>
                          {b.status}
                        </span>
                      </td>
                      {role === "admin" && (
                        <td>
                          {b.status === "PENDING" && (
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button className="btn btn-primary btn-sm" onClick={() => approveBooking(b._id)} disabled={saving}>
                                Approve
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ background: "#e53e3e", color: "#fff", border: "none" }}
                                onClick={() => rejectBooking(b._id)}
                                disabled={saving}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Bookings;
