import { useEffect, useState } from "react";
import axios from "axios";

export default function Revenue() {
  const [data, setData] = useState(null);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/billing/revenue").then(r => setData(r.data));
    axios.get("http://localhost:5000/api/billing/all").then(r => setBills(r.data));
  }, []);

  const card = (label, value, color, icon) => (
    <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px #0001", borderLeft: `5px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{label}</div>
    </div>
  );

  const statusColor = { PAID: "#2e7d32", PENDING: "#e65100", PARTIAL: "#1565c0" };

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", color: "#1a237e" }}>Revenue & Billing Overview</h2>

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {card("Total Billed", `Rs.${data.total_billed?.toFixed(0) || 0}`, "#1565c0", "📊")}
          {card("Total Collected", `Rs.${data.total_collected?.toFixed(0) || 0}`, "#2e7d32", "💰")}
          {card("Pending Dues", `Rs.${data.total_pending?.toFixed(0) || 0}`, "#e65100", "⏳")}
          {card("Bills Paid", data.paid_count || 0, "#2e7d32", "✅")}
          {card("Bills Pending", data.pending_count || 0, "#e65100", "🔔")}
        </div>
      )}

      <h3 style={{ color: "#333", marginBottom: 16 }}>All Bills</h3>
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px #0001", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a237e", color: "white" }}>
              {["Bill #", "Patient", "Date", "Fee", "Tax", "Discount", "Total", "Paid", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bills.map((b, i) => (
              <tr key={b.bill_id} style={{ background: i % 2 === 0 ? "#fafafa" : "white", borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700, color: "#1565c0" }}>#{b.bill_id}</td>
                <td style={{ padding: "11px 16px", fontSize: 13 }}>{b.patient_name}</td>
                <td style={{ padding: "11px 16px", fontSize: 13 }}>{b.bill_date}</td>
                <td style={{ padding: "11px 16px", fontSize: 13 }}>Rs.{b.consultation_fee}</td>
                <td style={{ padding: "11px 16px", fontSize: 13 }}>Rs.{b.tax_amount}</td>
                <td style={{ padding: "11px 16px", fontSize: 13 }}>Rs.{b.discount_amount}</td>
                <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 700 }}>Rs.{b.total_amount}</td>
                <td style={{ padding: "11px 16px", fontSize: 13 }}>Rs.{b.amount_paid || 0}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                    background: b.payment_status === "PAID" ? "#e8f5e9" : b.payment_status === "PARTIAL" ? "#e3f2fd" : "#fff3e0",
                    color: statusColor[b.payment_status] || "#333"
                  }}>{b.payment_status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bills.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#aaa" }}>No bills found</div>}
      </div>
    </div>
  );
}