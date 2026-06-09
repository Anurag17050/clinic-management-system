import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Billing() {
  const [report, setReport] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/billing/report").then(r => setReport(r.data));
    axios.get("http://localhost:5000/api/billing/summary").then(r => setSummary(r.data));
  }, []);

  const COLORS = { PAID: "#27ae60", PARTIAL: "#f39c12", PENDING: "#e74c3c", WAIVED: "#95a5a6" };
  const th = { background: "#8e44ad", color: "white", padding: "10px 14px", textAlign: "left" };
  const td = { padding: "10px 14px", borderBottom: "1px solid #ecf0f1" };

  return (
    <div>
      <h2 style={{ color: "#2c3e50" }}>Billing Dashboard</h2>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: 40, marginBottom: 32, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ color: "#7f8c8d", marginBottom: 8 }}>Payment Status Distribution</h3>
          <PieChart width={280} height={220}>
            <Pie data={summary} dataKey="count" nameKey="payment_status"
              cx="50%" cy="50%" outerRadius={80} label>
              {summary.map(s => <Cell key={s.payment_status} fill={COLORS[s.payment_status] || "#3498db"} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <div>
          <h3 style={{ color: "#7f8c8d", marginBottom: 8 }}>Revenue by Status (₹)</h3>
          <BarChart width={320} height={220} data={summary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="payment_status" />
            <YAxis />
            <Tooltip formatter={v => `₹${v}`} />
            <Bar dataKey="total" fill="#3498db">
              {summary.map(s => <Cell key={s.payment_status} fill={COLORS[s.payment_status] || "#3498db"} />)}
            </Bar>
          </BarChart>
        </div>
      </div>

      {/* Billing Table */}
      <h3 style={{ color: "#2c3e50" }}>All Bills</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px #0001" }}>
        <thead>
          <tr>{["Bill ID","Patient","Doctor","Date","Fee","Tax","Discount","Total","Status"].map(h =>
            <th key={h} style={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {report.map((b, i) => (
            <tr key={b.bill_id} style={{ background: i % 2 === 0 ? "white" : "#f8f9fa" }}>
              <td style={td}>{b.bill_id}</td>
              <td style={td}>{b.patient_name}</td>
              <td style={td}>{b.doctor_name}</td>
              <td style={td}>{b.bill_date}</td>
              <td style={td}>₹{b.consultation_fee}</td>
              <td style={td}>₹{b.tax_amount}</td>
              <td style={td}>₹{b.discount_amount}</td>
              <td style={td}><strong>₹{b.total_amount}</strong></td>
              <td style={td}>
                <span style={{ background: COLORS[b.payment_status] || "#95a5a6",
                  color: "white", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>
                  {b.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
