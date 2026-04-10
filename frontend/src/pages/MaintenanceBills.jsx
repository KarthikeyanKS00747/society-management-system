import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../viewmodels/useAuthStore";
import { useMaintenanceBillStore } from "../viewmodels/useMaintenanceBillStore";
import { usePaymentStore } from "../viewmodels/usePaymentStore";

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function monthLabel(m, y) { return `${MONTH_NAMES[(m ?? 1) - 1]} ${y}`; }
function flatLabel(flatId) {
  if (!flatId) return "—";
  return `${flatId.block ?? ""}${flatId.flatNumber ? `-${flatId.flatNumber}` : ""}`;
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function billStatus(bill) {
  if (bill.status === "PAID") return "paid";
  if (bill.dueDate && new Date(bill.dueDate) < new Date()) return "overdue";
  return "pending";
}

// ── Component ─────────────────────────────────────────────────────────────────
function MaintenanceBills() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { bills, loading, saving, fetchBills, generateBills } = useMaintenanceBillStore();
  const { payBill, paying } = usePaymentStore();

  const isAdmin = user?.role === "ADMIN";

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear,   setFilterYear]   = useState("all");
  const [filterMonth,  setFilterMonth]  = useState("all");

  // Expanded row
  const [selectedBillId, setSelectedBillId] = useState(null);

  // Generate modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth,     setGenMonth]     = useState(new Date().getMonth() + 1);
  const [genYear,      setGenYear]      = useState(new Date().getFullYear());
  const [genResult,    setGenResult]    = useState(null);

  useEffect(() => { fetchBills(); }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const enriched = bills.map((b) => ({ ...b, _status: billStatus(b) }));
  const yearOptions = [...new Set(bills.map((b) => b.year))].sort((a, z) => z - a);

  const filtered = enriched.filter((b) => {
    const s = filterStatus === "all" || b._status === filterStatus;
    const y = filterYear   === "all" || String(b.year)  === filterYear;
    const m = filterMonth  === "all" || String(b.month) === filterMonth;
    return s && y && m;
  });

  const totals = {
    totalAmount:   filtered.reduce((s, b) => s + (b.amount ?? 0), 0),
    paidAmount:    filtered.filter((b) => b._status === "paid").reduce((s, b) => s + b.amount, 0),
    pendingAmount: filtered.filter((b) => b._status !== "paid").reduce((s, b) => s + b.amount, 0),
    paidCount:     filtered.filter((b) => b._status === "paid").length,
    pendingCount:  filtered.filter((b) => b._status !== "paid").length,
  };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handlePayNow = (bill) => {
    payBill(bill._id, {
      prefill:   { name: user?.name, email: user?.email, contact: user?.phone },
      billLabel: `Maintenance – ${monthLabel(bill.month, bill.year)}`,
      onSuccess: () => fetchBills(),
    });
  };

  const handleConfirmGenerate = async () => {
    setGenResult(null);
    const result = await generateBills({ month: genMonth, year: genYear });
    if (result) setGenResult(result);
  };

  const handleExportReport = () => {
    let csv = "Bill ID,Flat,Month,Year,Amount,Due Date,Status\n";
    filtered.forEach((b) => {
      csv += `"${b._id}","${flatLabel(b.flatId)}",${b.month},${b.year},${b.amount},"${formatDate(b.dueDate)}","${b._status}"\n`;
    });
    csv += `\n\nSUMMARY\nTotal Bills,${filtered.length}\nTotal Amount,${totals.totalAmount}\nPaid,${totals.paidAmount}\nPending,${totals.pendingAmount}\nGenerated,${new Date().toLocaleString()}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `maintenance-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="page">

      {/* ── Generate Bills Modal ──────────────────────────────────────────────── */}
      {showGenModal && (
        <div className="modal-overlay">
          <div className="modal-container card">
            <h2 className="modal-title">Generate Monthly Bills</h2>
            <p className="modal-subtitle">
              Bills are calculated automatically using each flat&apos;s area × the society rate.
            </p>

            <div className="grid grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
              <div className="form-group">
                <label className="label">Month</label>
                <select className="input" value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))}>
                  {MONTH_NAMES.map((n, i) => (
                    <option key={i + 1} value={i + 1}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Year</label>
                <input
                  type="number"
                  className="input"
                  value={genYear}
                  min={2020}
                  max={2100}
                  onChange={(e) => setGenYear(Number(e.target.value))}
                />
              </div>
            </div>

            {genResult && (
              <div style={{
                marginBottom: "12px", fontSize: "0.9rem",
                color: "var(--success, #388e3c)", background: "var(--success-light, #e8f5e9)",
                padding: "10px 14px", borderRadius: "6px"
              }}>
                {genResult.msg}
                {genResult.skipped?.length > 0 && (
                  <div style={{ marginTop: "6px", color: "var(--text-muted)" }}>
                    Skipped {genResult.skipped.length} flat(s) (already billed or no area set).
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-outline modal-btn"
                onClick={() => { setShowGenModal(false); setGenResult(null); }}
              >
                {genResult ? "Close" : "Cancel"}
              </button>
              {!genResult && (
                <button
                  className="btn btn-primary modal-btn"
                  onClick={handleConfirmGenerate}
                  disabled={saving}
                >
                  {saving ? "Generating…" : "Generate Bills"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <section className="page-header dashboard-header">
        <div>
          <h1>Maintenance {isAdmin ? "Management" : "Bills"}</h1>
          <p className="card-description">
            {isAdmin
              ? "Manage society maintenance bills and track payments."
              : "View and pay your maintenance bills."}
          </p>
        </div>
        <div className="header-actions">
          {isAdmin ? (
            <>
              <button className="btn btn-primary" onClick={() => { setGenResult(null); setShowGenModal(true); }}>
                Generate Bills
              </button>
              <button className="btn btn-outline" onClick={handleExportReport}>
                Export Report
              </button>
            </>
          ) : (
            <button className="btn btn-outline" onClick={handleExportReport}>
              Download All Invoices
            </button>
          )}
        </div>
      </section>

      {/* ── Summary Cards ─────────────────────────────────────────────────────── */}
      <section className="grid grid-4">
        {isAdmin ? (
          <>
            <div className="card stat">
              <h3>Total Revenue</h3>
              <h2>₹{totals.totalAmount.toLocaleString()}</h2>
              <p>This period</p>
            </div>
            <div className="card stat">
              <h3>Collected</h3>
              <h2>₹{totals.paidAmount.toLocaleString()}</h2>
              <p>{totals.paidCount} payments</p>
            </div>
            <div className="card stat">
              <h3>Pending</h3>
              <h2>₹{totals.pendingAmount.toLocaleString()}</h2>
              <p>{totals.pendingCount} pending</p>
            </div>
            <div className="card stat">
              <h3>Collection Rate</h3>
              <h2>
                {totals.totalAmount > 0
                  ? Math.round((totals.paidAmount / totals.totalAmount) * 100)
                  : 0}%
              </h2>
              <p>Payment efficiency</p>
            </div>
          </>
        ) : (
          <>
            <div className="card stat">
              <h3>Total Bills</h3>
              <h2>{bills.length}</h2>
              <p>All time</p>
            </div>
            <div className="card stat" style={{ cursor: "pointer" }}
              onClick={() => setFilterStatus("pending")}>
              <h3>Amount Due</h3>
              <h2>₹{totals.pendingAmount.toLocaleString()}</h2>
              <p>Payment pending</p>
            </div>
            <div className="card stat">
              <h3>Paid Amount</h3>
              <h2>₹{totals.paidAmount.toLocaleString()}</h2>
              <p>Total cleared</p>
            </div>
            <div className="card stat">
              <h3>On Time Payments</h3>
              <h2>{totals.paidCount}/{bills.length}</h2>
              <p>Payment history</p>
            </div>
          </>
        )}
      </section>

      {/* ── Filters ───────────────────────────────────────────────────────────── */}
      <div className="card filter-card">
        <h3>Filter Bills</h3>
        <div className="filter-grid">
          <div className="filter-options">
            <div className="form-group">
              <label className="label">Status</label>
              <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Year</label>
              <select className="input" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                <option value="all">All Years</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Month</label>
              <select className="input" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                <option value="all">All Months</option>
                {MONTH_NAMES.map((n, i) => (
                  <option key={i + 1} value={i + 1}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bills Table ───────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <h3>{isAdmin ? "Society Maintenance Bills" : "Your Maintenance Bills"}</h3>
          <div className="table-count">Showing {filtered.length} of {bills.length} bills</div>
        </div>

        {loading && !bills.length ? (
          <p style={{ color: "var(--text-muted)", padding: "40px 0", textAlign: "center" }}>
            Loading bills…
          </p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No bills found matching your filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  {isAdmin && <th>Flat</th>}
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill) => (
                  <>
                    <tr key={bill._id}>
                      <td>
                        <div className="table-primary" style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                          {String(bill._id).slice(-8)}
                        </div>
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="table-primary">{flatLabel(bill.flatId)}</div>
                          {bill.flatId?.areaSqFt && (
                            <div className="table-secondary">{bill.flatId.areaSqFt} sq ft</div>
                          )}
                        </td>
                      )}
                      <td>
                        <div className="table-primary">{monthLabel(bill.month, bill.year)}</div>
                      </td>
                      <td>
                        <div className="table-primary">₹{(bill.amount ?? 0).toLocaleString()}</div>
                      </td>
                      <td>
                        <div className="table-primary">{formatDate(bill.dueDate)}</div>
                      </td>
                      <td>
                        <span className={`status-${bill._status}`}>
                          {bill._status.charAt(0).toUpperCase() + bill._status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {!isAdmin && bill._status !== "paid" && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handlePayNow(bill)}
                              disabled={paying}
                            >
                              {paying ? "Processing…" : "Pay Now"}
                            </button>
                          )}
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedBillId(selectedBillId === bill._id ? null : bill._id)}
                          >
                            {selectedBillId === bill._id ? "Hide" : "Details"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {selectedBillId === bill._id && (
                      <tr className="details-row" key={`${bill._id}-details`}>
                        <td colSpan={isAdmin ? 7 : 6}>
                          <div className="bill-details">
                            <h4>Bill Details</h4>
                            <div className="details-grid resident-grid">
                              <div>
                                <p className="table-secondary">Bill ID</p>
                                <p className="table-primary" style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                  {bill._id}
                                </p>
                              </div>
                              <div>
                                <p className="table-secondary">Period</p>
                                <p className="table-primary">{monthLabel(bill.month, bill.year)}</p>
                              </div>
                              <div>
                                <p className="table-secondary">Amount</p>
                                <p className="table-primary">₹{(bill.amount ?? 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="table-secondary">Due Date</p>
                                <p className="table-primary">{formatDate(bill.dueDate)}</p>
                              </div>
                              {isAdmin && (
                                <div>
                                  <p className="table-secondary">Flat</p>
                                  <p className="table-primary">{flatLabel(bill.flatId)}</p>
                                </div>
                              )}
                              {isAdmin && bill.flatId?.areaSqFt && (
                                <div>
                                  <p className="table-secondary">Area</p>
                                  <p className="table-primary">{bill.flatId.areaSqFt} sq ft</p>
                                </div>
                              )}
                              <div>
                                <p className="table-secondary">Status</p>
                                <span className={`status-${bill._status}`}>
                                  {bill._status.charAt(0).toUpperCase() + bill._status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="footer-section">
          <h4>{isAdmin ? "Administration Tools" : "Payment Information"}</h4>
          <p className="table-secondary">
            {isAdmin
              ? "Use the tools above to manage society maintenance efficiently."
              : "Payments are processed securely via Razorpay (UPI, Net Banking, Cards)."}
          </p>
          <div className="action-buttons">
            {isAdmin ? (
              <button className="btn btn-outline payment-info-btn" onClick={handleExportReport}>
                Export Financial Report
              </button>
            ) : (
              <>
                <button className="btn btn-outline payment-info-btn" onClick={handleExportReport}>
                  Download All Invoices
                </button>
                <button className="btn btn-outline payment-info-btn" onClick={() => navigate("/complaints")}>
                  Report Payment Issue
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default MaintenanceBills;