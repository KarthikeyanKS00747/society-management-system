import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MaintenanceBills() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [selectedBill, setSelectedBill] = useState(null);
  const [role, setRole] = useState("resident");
  const [bills, setBills] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGenerateBillModal, setShowGenerateBillModal] = useState(false);
  const [generateForAll, setGenerateForAll] = useState(false);
  const navigate = useNavigate();

  // Generate a unique bill ID
  const generateBillId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BILL-${year}-${randomNum}`;
  };

  // Initialize auth and fetch bills
  useEffect(() => {
    const initializeData = () => {
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
      
      // Get stored bills or use sample data
      const storedBills = localStorage.getItem("maintenanceBills");
      let initialBills = [];
      
      if (storedBills) {
        try {
          initialBills = JSON.parse(storedBills);
        } catch (error) {
          console.error("Error parsing stored bills:", error);
        }
      } else {
        // Sample data exactly as shown in the image
        initialBills = [
          {
            id: "BILL-2025-001",
            month: "January 2025",
            amount: 4500,
            dueDate: "Jan 15, 2025",
            status: "paid",
            paidDate: "Jan 10, 2025",
            transactionId: "TXN123456789",
            flat: "B-203",
            resident: "John Doe",
            contact: "john@email.com"
          },
          {
            id: "BILL-2025-002",
            month: "February 2025",
            amount: 4500,
            dueDate: "Feb 15, 2025",
            status: "pending",
            paidDate: null,
            transactionId: null,
            flat: "A-101",
            resident: "Jane Smith",
            contact: "jane@email.com"
          },
          {
            id: "BILL-2025-003",
            month: "March 2025",
            amount: 5000,
            dueDate: "Mar 15, 2025",
            status: "overdue",
            paidDate: null,
            transactionId: null,
            flat: "C-305",
            resident: "Robert Johnson",
            contact: "robert@email.com"
          },
          {
            id: "BILL-2025-004",
            month: "January 2025",
            amount: 4500,
            dueDate: "Jan 15, 2025",
            status: "paid",
            paidDate: "Jan 12, 2025",
            transactionId: "TXN987654321",
            flat: "D-412",
            resident: "Sarah Williams",
            contact: "sarah@email.com"
          }
        ];
        localStorage.setItem("maintenanceBills", JSON.stringify(initialBills));
      }
      
      if (userRole === "admin") {
        setBills(initialBills);
      } else {
        // Filter bills for the resident (using B-203 as example)
        const residentBills = initialBills.filter(bill => bill.flat === "B-203");
        setBills(residentBills.length ? residentBills : [
          {
            id: "BILL-2025-001",
            month: "January 2025",
            amount: 4500,
            dueDate: "Jan 15, 2025",
            status: "paid",
            paidDate: "Jan 10, 2025",
            transactionId: "TXN123456789",
            flat: "B-203",
            resident: "John Doe",
            contact: "john@email.com"
          },
          {
            id: "BILL-2025-002",
            month: "February 2025",
            amount: 4500,
            dueDate: "Feb 15, 2025",
            status: "pending",
            paidDate: null,
            transactionId: null,
            flat: "B-203",
            resident: "John Doe",
            contact: "john@email.com"
          }
        ]);
      }
      
      setIsInitialized(true);
    };
    
    initializeData();
  }, []);

  const months = [
    "January 2026", "February 2026", "March 2026", "April 2026",
    "May 2026", "June 2026", "July 2026", "August 2026",
    "September 2026", "October 2026", "November 2026", "December 2026"
  ];

  const flats = [
    { flat: "A-101", resident: "Jane Smith", contact: "jane@email.com" },
    { flat: "B-203", resident: "John Doe", contact: "john@email.com" },
    { flat: "C-305", resident: "Robert Johnson", contact: "robert@email.com" },
    { flat: "D-412", resident: "Sarah Williams", contact: "sarah@email.com" }
  ];

  const filteredBills = bills.filter(bill => {
    const statusMatch = filterStatus === "all" || bill.status === filterStatus;
    const monthMatch = filterMonth === "all" || bill.month === filterMonth;
    return statusMatch && monthMatch;
  });

  // Calculate totals
  const calculateTotals = () => {
    const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = filteredBills
      .filter(bill => bill.status === "paid")
      .reduce((sum, bill) => sum + bill.amount, 0);
    const pendingAmount = filteredBills
      .filter(bill => bill.status !== "paid")
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      paidCount: filteredBills.filter(b => b.status === "paid").length,
      pendingCount: filteredBills.filter(b => b.status !== "paid").length
    };
  };

  const totals = calculateTotals();

  // Function to update bills and localStorage
  const updateBills = (updatedBills) => {
    setBills(updatedBills);
    localStorage.setItem("maintenanceBills", JSON.stringify(updatedBills));
  };

  const handlePayNow = (billId) => {
    if (role === "resident") {
      // Mark as paid for resident demo
      const updatedBills = bills.map(bill => 
        bill.id === billId 
          ? { 
              ...bill, 
              status: "paid", 
              paidDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', ','),
              transactionId: `TXN${Math.floor(Math.random() * 1000000000)}`
            }
          : bill
      );
      updateBills(updatedBills);
      alert(`Payment completed for bill ${billId}`);
    } else {
      alert(`Admin: View payment details for ${billId}`);
    }
  };

  const handleDownloadInvoice = (billId) => {
    alert(`Downloading invoice for ${billId}`);
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(selectedBill?.id === bill.id ? null : bill);
  };

  const handleGenerateBill = () => {
    setShowGenerateBillModal(true);
    setGenerateForAll(false);
  };

  const handleGenerateForAll = () => {
    setGenerateForAll(true);
  };

  const handleGenerateForSingle = () => {
    setGenerateForAll(false);
  };

  const handleConfirmGenerateBill = () => {
    // Get form values
    const monthSelect = document.querySelector('.modal-container select');
    const amountInput = document.querySelector('.modal-container input[type="number"]');
    const dueDateInput = document.querySelectorAll('.modal-container input[type="text"]')[0];
    const flatSelect = document.querySelector('.modal-container .flat-select');
    
    const month = monthSelect ? monthSelect.value : "April 2026";
    const amount = amountInput ? parseInt(amountInput.value) : 4500;
    const dueDate = dueDateInput ? dueDateInput.value : "Apr 15, 2026";
    
    let newBills = [];
    
    if (generateForAll) {
      // Generate for all flats
      newBills = flats.map(flat => ({
        id: generateBillId(),
        month: month,
        amount: amount,
        dueDate: dueDate,
        status: "pending",
        paidDate: null,
        transactionId: null,
        flat: flat.flat,
        resident: flat.resident,
        contact: flat.contact
      }));
      alert(`Generated ${newBills.length} new maintenance bills for all flats`);
    } else {
      // Generate for single flat
      const selectedFlat = flatSelect ? flatSelect.value : "B-203";
      const flatData = flats.find(f => f.flat === selectedFlat) || flats[1];
      
      newBills = [{
        id: generateBillId(),
        month: month,
        amount: amount,
        dueDate: dueDate,
        status: "pending",
        paidDate: null,
        transactionId: null,
        flat: flatData.flat,
        resident: flatData.resident,
        contact: flatData.contact
      }];
      alert(`Generated new maintenance bill for ${flatData.flat} - ${flatData.resident}`);
    }
    
    // Add new bills to existing bills
    const updatedBills = [...bills, ...newBills];
    updateBills(updatedBills);
    
    setShowGenerateBillModal(false);
  };

  const handleSendReminder = (billId, resident) => {
    alert(`Sending payment reminder to ${resident} for bill ${billId}`);
  };

  const handleMarkAsPaid = (billId) => {
    const updatedBills = bills.map(bill => 
      bill.id === billId 
        ? { 
            ...bill, 
            status: "paid", 
            paidDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', ','),
            transactionId: `TXN${Math.floor(Math.random() * 1000000000)}`
          }
        : bill
    );
    updateBills(updatedBills);
    
    // Close expanded details if open for this bill
    if (selectedBill?.id === billId) {
      setSelectedBill(null);
    }
    
    alert(`Bill ${billId} marked as paid successfully`);
  };

  const handleExportReport = () => {
    // Create CSV content
    let csvContent = "Bill ID,Month,Amount,Due Date,Status,Paid Date,Transaction ID,Flat,Resident,Contact\n";
    
    filteredBills.forEach(bill => {
      csvContent += `"${bill.id}","${bill.month}",${bill.amount},"${bill.dueDate}","${bill.status}","${bill.paidDate || 'N/A'}","${bill.transactionId || 'N/A'}","${bill.flat}","${bill.resident}","${bill.contact}"\n`;
    });

    // Add summary section
    csvContent += "\n\nSUMMARY\n";
    csvContent += `Total Bills,${filteredBills.length}\n`;
    csvContent += `Total Amount,${totals.totalAmount}\n`;
    csvContent += `Paid Amount,${totals.paidAmount}\n`;
    csvContent += `Pending Amount,${totals.pendingAmount}\n`;
    csvContent += `Paid Count,${totals.paidCount}\n`;
    csvContent += `Pending Count,${totals.pendingCount}\n`;
    csvContent += `Collection Rate,${totals.totalAmount > 0 ? Math.round((totals.paidAmount / totals.totalAmount) * 100) : 0}%\n`;
    csvContent += `Filters Applied,Status: ${filterStatus}, Month: ${filterMonth}\n`;
    csvContent += `Generated On,${new Date().toLocaleString()}\n`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maintenance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isInitialized) {
    return (
      <div className="page">
        <div className="card">
          <div className="empty-state">
            <p>Loading maintenance bills...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* GENERATE BILL MODAL */}
      {showGenerateBillModal && (
        <div className="modal-overlay">
          <div className="modal-container card">
            <h2 className="modal-title">Generate Monthly Bills</h2>
            <p className="modal-subtitle">Create new maintenance bills</p>
            
            <div className="generate-options">
              <button 
                className={`btn ${!generateForAll ? 'btn-primary' : 'btn-outline'} option-btn`}
                onClick={handleGenerateForSingle}
              >
                Generate for Single Flat
              </button>
              <button 
                className={`btn ${generateForAll ? 'btn-primary' : 'btn-outline'} option-btn`}
                onClick={handleGenerateForAll}
              >
                Generate for All Flats
              </button>
            </div>

            {!generateForAll && (
              <div className="form-group">
                <label className="label">Select Flat</label>
                <select className="input flat-select">
                  {flats.map(flat => (
                    <option key={flat.flat} value={flat.flat}>
                      {flat.flat} - {flat.resident}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="label">Month</label>
              <select className="input">
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Amount (₹)</label>
              <input type="number" className="input" defaultValue="4500" />
            </div>

            <div className="form-group">
              <label className="label">Due Date</label>
              <input type="text" className="input" defaultValue="Apr 15, 2026" placeholder="e.g., Apr 15, 2026" />
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-outline modal-btn"
                onClick={() => setShowGenerateBillModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary modal-btn"
                onClick={handleConfirmGenerateBill}
              >
                Generate {generateForAll ? 'Bills' : 'Bill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <section className="page-header dashboard-header">
        <div>
          <h1>Maintenance {role === "admin" ? "Management" : "Bills"}</h1>
          <p className="card-description">
            {role === "admin" 
              ? "Manage society maintenance bills and track payments."
              : "View and pay your maintenance bills."
            }
          </p>
        </div>

        <div className="header-actions">
          {role === "admin" ? (
            <>
              <button className="btn btn-primary" onClick={handleGenerateBill}>
                Generate Bills
              </button>
              <button className="btn btn-outline" onClick={handleExportReport}>
                Export Report
              </button>
            </>
          ) : (
            <button className="btn btn-outline" onClick={() => alert("Download All Invoices")}>
              Download All Invoices
            </button>
          )}
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <section className="grid grid-4">
        {role === "admin" ? (
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
              <h2>{totals.totalAmount > 0 ? Math.round((totals.paidAmount / totals.totalAmount) * 100) : 0}%</h2>
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
            <div className="card stat" onClick={() => setFilterStatus("pending")}>
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

      {/* FILTERS */}
      <div className="card filter-card">
        <h3>Filter Bills</h3>
        <div className="filter-grid">
          <div className="filter-options">
            <div className="form-group">
              <label className="label">Status</label>
              <select 
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Month</label>
              <select 
                className="input"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="all">All Months</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {role === "admin" && (
              <div className="form-group">
                <label className="label">Sort By</label>
                <select className="input" defaultValue="dueDate">
                  <option value="dueDate">Due Date</option>
                  <option value="amount">Amount</option>
                  <option value="flat">Flat Number</option>
                  <option value="status">Status</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BILLS TABLE */}
      <div className="card">
        <div className="card-header">
          <h3>
            {role === "admin" ? "Society Maintenance Bills" : "Your Maintenance Bills"}
          </h3>
          <div className="table-count">
            Showing {filteredBills.length} of {bills.length} bills
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div className="empty-state">
            <p>No bills found matching your filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  {role === "admin" && <th>Flat</th>}
                  {role === "admin" && <th>Resident</th>}
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <>
                    <tr key={bill.id}>
                      <td>
                        <div className="table-primary">{bill.id}</div>
                      </td>
                      {role === "admin" && (
                        <>
                          <td>
                            <div className="table-primary">{bill.flat}</div>
                          </td>
                          <td>
                            <div className="table-primary">{bill.resident}</div>
                            <div className="table-secondary">{bill.contact}</div>
                          </td>
                        </>
                      )}
                      <td>
                        <div className="table-primary">{bill.month}</div>
                      </td>
                      <td>
                        <div className="table-primary">₹{bill.amount.toLocaleString()}</div>
                      </td>
                      <td>
                        <div className="table-primary">{bill.dueDate}</div>
                        <div className="table-secondary">
                          {bill.status === "paid" ? `Paid on ${bill.paidDate}` : "Due"}
                        </div>
                      </td>
                      <td>
                        <span className={`status-${bill.status}`}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {role === "admin" ? (
                            <>
                              {bill.status !== "paid" ? (
                                <>
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleSendReminder(bill.id, bill.resident)}
                                  >
                                    Remind
                                  </button>
                                  <button 
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleMarkAsPaid(bill.id)}
                                  >
                                    Mark Paid
                                  </button>
                                  <button 
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleViewDetails(bill)}
                                  >
                                    {selectedBill?.id === bill.id ? "Hide" : "View"}
                                  </button>
                                </>
                              ) : (
                                <button 
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleViewDetails(bill)}
                                >
                                  {selectedBill?.id === bill.id ? "Hide" : "View"}
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {bill.status !== "paid" ? (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handlePayNow(bill.id)}
                                >
                                  Pay Now
                                </button>
                              ) : (
                                <button 
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleDownloadInvoice(bill.id)}
                                >
                                  Invoice
                                </button>
                              )}
                              <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => handleViewDetails(bill)}
                              >
                                {selectedBill?.id === bill.id ? "Hide" : "Details"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {selectedBill?.id === bill.id && (
                      <tr className="details-row">
                        <td colSpan={role === "admin" ? 8 : 6}>
                          <div className="bill-details">
                            <h4>Bill Details</h4>
                            
                            <div className={`details-grid ${role === "admin" ? "admin-grid" : "resident-grid"}`}>
                              <div>
                                <p className="table-secondary">Bill ID</p>
                                <p className="table-primary">{bill.id}</p>
                              </div>
                              <div>
                                <p className="table-secondary">Month</p>
                                <p className="table-primary">{bill.month}</p>
                              </div>
                              <div>
                                <p className="table-secondary">Amount</p>
                                <p className="table-primary">₹{bill.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="table-secondary">Due Date</p>
                                <p className="table-primary">{bill.dueDate}</p>
                              </div>
                              {role === "admin" && (
                                <div>
                                  <p className="table-secondary">Contact</p>
                                  <p className="table-primary">{bill.contact}</p>
                                </div>
                              )}
                              {bill.status === "paid" && (
                                <>
                                  <div>
                                    <p className="table-secondary">Transaction ID</p>
                                    <p className="table-primary">{bill.transactionId}</p>
                                  </div>
                                  <div>
                                    <p className="table-secondary">Payment Date</p>
                                    <p className="table-primary">{bill.paidDate}</p>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {role === "admin" && bill.status !== "paid" && (
                              <div className="admin-actions">
                                <h5>Admin Actions</h5>
                                <div className="action-buttons">
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleSendReminder(bill.id, bill.resident)}
                                  >
                                    Send Payment Reminder
                                  </button>
                                  <button 
                                    className="btn btn-outline btn-sm"
                                    onClick={() => alert(`Contact ${bill.resident} at ${bill.contact}`)}
                                  >
                                    Contact Resident
                                  </button>
                                  <button 
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleMarkAsPaid(bill.id)}
                                  >
                                    Mark as Paid Manually
                                  </button>
                                </div>
                              </div>
                            )}
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

        {/* FOOTER SECTION */}
        <div className="footer-section">
          <h4>
            {role === "admin" ? "Administration Tools" : "Payment Information"}
          </h4>
          <p className="table-secondary">
            {role === "admin" 
              ? "Use the tools above to manage society maintenance efficiently."
              : "Payments can be made via UPI, Net Banking, or Credit/Debit Card."
            }
          </p>
          <div className="action-buttons">
            {role === "admin" ? (
              <button className="btn btn-outline payment-info-btn" onClick={handleExportReport}>
                Export Financial Report
              </button>
            ) : (
              <>
                <button className="btn btn-outline payment-info-btn" onClick={() => alert("Download All Invoices")}>
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

      <style jsx>{`
        .generate-options {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .option-btn {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

export default MaintenanceBills;