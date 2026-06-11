import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const COLORS = { PAID:"#43a047", PARTIAL:"#fb8c00", PENDING:"#e53935", WAIVED:"#90a4ae" };

export default function Billing() {
  const [report, setReport] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/billing/report").then(r => setReport(r.data));
    axios.get("http://localhost:5000/api/billing/summary").then(r => setSummary(r.data));
  }, []);

  const total = report.reduce((s, b) => s + b.total_amount, 0);
  const paid  = report.filter(b => b.payment_status === "PAID")
    .reduce((s, b) => s + b.total_amount, 0);

  const th = { background: "#4a148c", color: "white", padding: "12px 16px",
    textAlign: "left", fontSize: 13 };
  const td = { padding: "12px 16px", fontSize: 14, borderBottom: "1px solid #f0f0f0" };

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Bills", value: report.length, color: "#1565c0", bg: "#e3f2fd" },
          { label: "Total Revenue", value: "Rs." + total.toFixed(0), color: "#2e7d32", bg: "#e8f5e9" },
          { label: "Collected", value: "Rs." + paid.toFixed(0), color: "#43a047", bg: "#f1f8e9" },
          { label: "Outstanding", value: "Rs." + (total - paid).toFixed(0), color: "#e53935", bg: "#ffebee" },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, borderRadius: 12,
            padding: "20px 24px", borderLeft: "4px solid " + c.color }}>
            <p style={{ margin: 0, fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {c.label}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 700, color: c.color }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px #0001" }}>
          <h3 style={{ margin: "0 0 16px", color: "#4a148c", fontSize: 15 }}>
            Payment Status Distribution
          </h3>
          <PieChart width={280} height={200}>
            <Pie data={summary} dataKey="count" nameKey="payment_status"
              cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => name + ": " + value}>
              {summary.map(s => <Cell key={s.payment_status} fill={COLORS[s.payment_status] || "#888"} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px #0001" }}>
          <h3 style={{ margin: "0 0 16px", color: "#4a148c", fontSize: 15 }}>
            Revenue by Payment Status
          </h3>
          <BarChart width={320} height={200} data={summary}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="payment_status" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={v => "Rs." + v} />
            <Bar dataKey="total" radius={[6,6,0,0]}>
              {summary.map(s => <Cell key={s.payment_status} fill={COLORS[s.payment_status] || "#888"} />)}
            </Bar>
          </BarChart>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px #0001" }}>
        <h3 style={{ margin: "0 0 16px", color: "#4a148c" }}>All Bills</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Bill ID","Patient","Doctor","Date","Fee","Tax","Discount","Total","Status"].map(h =>
                <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {report.map((b, i) => (
                <tr key={b.bill_id} style={{ background: i % 2 === 0 ? "white" : "#faf8ff" }}>
                  <td style={td}><strong>{b.bill_id}</strong></td>
                  <td style={{ ...td, fontWeight: 600 }}>{b.patient_name}</td>
                  <td style={td}>{b.doctor_name}</td>
                  <td style={td}>{b.bill_date}</td>
                  <td style={td}>Rs.{b.consultation_fee}</td>
                  <td style={td}>Rs.{b.tax_amount}</td>
                  <td style={td}>Rs.{b.discount_amount}</td>
                  <td style={{ ...td, fontWeight: 700 }}>Rs.{b.total_amount}</td>
                  <td style={td}>
                    <span style={{ background: COLORS[b.payment_status] || "#888",
                      color: "white", padding: "4px 12px", borderRadius: 12,
                      fontSize: 12, fontWeight: 700 }}>{b.payment_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}