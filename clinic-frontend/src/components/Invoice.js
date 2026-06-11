import { useState } from "react";
import axios from "axios";

export default function Invoice() {
  const [billId, setBillId] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setError(""); setInvoice(null); setLoading(true);
    try {
      const r = await axios.get(`http://localhost:5000/api/billing/invoice/${billId}`);
      setInvoice(r.data);
    } catch {
      setError("No bill found for ID: " + billId);
    } finally { setLoading(false); }
  };

  const print = () => window.print();

  const statusColor = { PAID: "#2e7d32", PENDING: "#e65100", PARTIAL: "#1565c0" };
  const statusBg = { PAID: "#e8f5e9", PENDING: "#fff3e0", PARTIAL: "#e3f2fd" };

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Search bar — hidden on print */}
      <div className="no-print" style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 12px #0001" }}>
        <h2 style={{ margin: "0 0 16px", color: "#1a237e" }}>Generate Invoice</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <input type="number" placeholder="Enter Bill ID"
            value={billId} onChange={e => setBillId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && lookup()}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, width: 200 }} />
          <button onClick={lookup} disabled={loading} style={{ padding: "10px 24px", background: "#1565c0", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            {loading ? "Loading..." : "🔍 Get Invoice"}
          </button>
          {invoice && (
            <button onClick={print} style={{ padding: "10px 24px", background: "#2e7d32", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              🖨️ Print / Save PDF
            </button>
          )}
        </div>
        {error && <p style={{ margin: "12px 0 0", color: "#c62828", background: "#ffebee", padding: "10px 14px", borderRadius: 8 }}>{error}</p>}
      </div>

      {/* Invoice */}
      {invoice && (
        <div id="invoice-print" style={{ background: "white", borderRadius: 12, padding: 40, boxShadow: "0 2px 12px #0001", maxWidth: 860, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, paddingBottom: 24, borderBottom: "3px solid #1a237e" }}>
            <div>
              <h1 style={{ margin: 0, color: "#1a237e", fontSize: 28 }}>🏥 Clinic Management System</h1>
              <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>Oracle · Flask · React</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1565c0" }}>INVOICE #{invoice.bill_id}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Date: {invoice.bill_date}</div>
              <div style={{ marginTop: 8, padding: "4px 14px", borderRadius: 20, display: "inline-block", fontSize: 12, fontWeight: 700, background: statusBg[invoice.payment_status], color: statusColor[invoice.payment_status] }}>
                {invoice.payment_status}
              </div>
            </div>
          </div>

          {/* Patient + Doctor */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
            <div style={{ background: "#f8faff", borderRadius: 10, padding: 18 }}>
              <h4 style={{ margin: "0 0 12px", color: "#1a237e", fontSize: 13, textTransform: "uppercase" }}>Patient Details</h4>
              {[
                ["Name", invoice.patient_name],
                ["Phone", invoice.patient_phone],
                ["Email", invoice.patient_email || "—"],
                ["Gender", invoice.gender || "—"],
                ["Blood Group", invoice.blood_group || "—"],
                ["Date of Birth", invoice.dob || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: "#888", minWidth: 90 }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#f8faff", borderRadius: 10, padding: 18 }}>
              <h4 style={{ margin: "0 0 12px", color: "#1a237e", fontSize: 13, textTransform: "uppercase" }}>Doctor Details</h4>
              {[
                ["Name", "Dr. " + invoice.doctor_name],
                ["Specialization", invoice.specialization],
                ["Department", invoice.dept_name],
                ["License No", invoice.license_no],
                ["Visit Date", invoice.appt_date],
                ["Reason", invoice.reason || "General"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: "#888", minWidth: 90 }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis */}
          {invoice.medical && (
            <div style={{ marginBottom: 24, background: "#fffde7", borderRadius: 10, padding: 18, borderLeft: "4px solid #f9a825" }}>
              <h4 style={{ margin: "0 0 12px", color: "#f57f17", fontSize: 13, textTransform: "uppercase" }}>Clinical Notes</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                {[
                  ["Symptoms", invoice.medical.symptoms],
                  ["Diagnosis", invoice.medical.diagnosis],
                  ["Treatment", invoice.medical.treatment_notes],
                  ["Follow-up", invoice.medical.follow_up_date],
                ].map(([k, v]) => v && (
                  <div key={k}>
                    <span style={{ color: "#888", display: "block", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {invoice.prescriptions?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 12px", color: "#1a237e", fontSize: 13, textTransform: "uppercase" }}>Prescriptions</h4>
              {invoice.prescriptions.map((rx, i) => (
                <div key={rx.rx_id} style={{ background: "#f3e5f5", borderRadius: 8, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 20, marginBottom: 8, fontSize: 12, color: "#6a1b9a" }}>
                    <span><strong>Rx #{rx.rx_id}</strong></span>
                    <span>Issued: {rx.issued_date}</span>
                    <span>Valid: {rx.validity_days} days</span>
                    {rx.notes && <span>📝 {rx.notes}</span>}
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#ce93d8" }}>
                        {["Medicine", "Type", "Dosage", "Frequency", "Days", "Instructions"].map(h => (
                          <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "#4a148c" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rx.items.map((item, j) => (
                        <tr key={j} style={{ background: j % 2 === 0 ? "white" : "#fce4ec" }}>
                          <td style={{ padding: "6px 10px", fontWeight: 600 }}>{item.med_name}</td>
                          <td style={{ padding: "6px 10px", color: "#888" }}>{item.med_type}</td>
                          <td style={{ padding: "6px 10px" }}>{item.dosage}</td>
                          <td style={{ padding: "6px 10px" }}>{item.frequency}</td>
                          <td style={{ padding: "6px 10px" }}>{item.duration_days || "—"}</td>
                          <td style={{ padding: "6px 10px", color: "#666" }}>{item.instructions || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Bill Summary */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: "0 0 12px", color: "#1a237e", fontSize: 13, textTransform: "uppercase" }}>Bill Summary</h4>
            <div style={{ maxWidth: 320, marginLeft: "auto" }}>
              {[
                ["Consultation Fee", `Rs. ${invoice.consultation_fee}`],
                ["Tax", `Rs. ${invoice.tax_amount}`],
                ["Discount", `- Rs. ${invoice.discount_amount}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 14 }}>
                  <span style={{ color: "#666" }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 18, fontWeight: 800, color: "#1a237e" }}>
                <span>Total Amount</span>
                <span>Rs. {invoice.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {invoice.payments?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 12px", color: "#1a237e", fontSize: 13, textTransform: "uppercase" }}>Payment History</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#e8f5e9" }}>
                    {["Date", "Mode", "Amount", "Reference"].map(h => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: "left", color: "#2e7d32" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 14px" }}>{p.txn_date}</td>
                      <td style={{ padding: "8px 14px" }}>{p.payment_mode}</td>
                      <td style={{ padding: "8px 14px", fontWeight: 600, color: "#2e7d32" }}>Rs. {p.amount_paid}</td>
                      <td style={{ padding: "8px 14px", color: "#888" }}>{p.txn_reference || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: "right", marginTop: 8, fontSize: 14 }}>
                Total Paid: <strong style={{ color: "#2e7d32" }}>Rs. {invoice.payments.reduce((s, p) => s + p.amount_paid, 0)}</strong>
                {invoice.payment_status !== "PAID" && (
                  <span style={{ marginLeft: 16, color: "#e65100" }}>
                    Remaining: <strong>Rs. {invoice.total_amount - invoice.payments.reduce((s, p) => s + p.amount_paid, 0)}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: "2px solid #e0e0e0", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#aaa" }}>
            <span>Generated by Clinic Management System</span>
            <span>This is a computer-generated invoice</span>
          </div>
        </div>
      )}
    </div>
  );
}
