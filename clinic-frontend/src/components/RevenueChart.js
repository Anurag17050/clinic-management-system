import { useEffect, useState } from "react";
import axios from "axios";

export default function RevenueChart() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/billing/daily-revenue").then(r => setData(r.data));
    axios.get("http://localhost:5000/api/billing/revenue").then(r => setSummary(r.data));
  }, []);

  const W = 800, H = 300, PAD = { top: 20, right: 20, bottom: 50, left: 70 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = data.length ? Math.max(...data.map(d => d.collected), 1) : 1;
  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

  const px = i => PAD.left + i * xStep;
  const py = v => PAD.top + chartH - (v / maxVal) * chartH;

  const points = data.map((d, i) => `${px(i)},${py(d.collected)}`).join(" ");
  const areaPoints = data.length
    ? `${px(0)},${PAD.top + chartH} ${points} ${px(data.length - 1)},${PAD.top + chartH}`
    : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxVal * f));

  const card = (label, value, color, icon) => (
    <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px #0001", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", color: "#1a237e" }}>Revenue Analytics</h2>

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
          {card("Total Billed", `Rs.${summary.total_billed?.toFixed(0)}`, "#1565c0", "📊")}
          {card("Total Collected", `Rs.${summary.total_collected?.toFixed(0)}`, "#2e7d32", "💰")}
          {card("Pending Dues", `Rs.${summary.total_pending?.toFixed(0)}`, "#e65100", "⏳")}
          {card("Bills Paid", summary.paid_count, "#2e7d32", "✅")}
          {card("Bills Pending", summary.pending_count, "#e65100", "🔔")}
        </div>
      )}

      <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px #0001", marginBottom: 28 }}>
        <h3 style={{ margin: "0 0 20px", color: "#1a237e" }}>Daily Collections — Last 30 Days</h3>

        {data.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📉</div>
            No payment data yet for the last 30 days
          </div>
        ) : (
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
            {/* Grid lines */}
            {yTicks.map(tick => (
              <g key={tick}>
                <line x1={PAD.left} y1={py(tick)} x2={PAD.left + chartW} y2={py(tick)}
                  stroke="#f0f0f0" strokeWidth="1" />
                <text x={PAD.left - 8} y={py(tick) + 4} textAnchor="end" fontSize="11" fill="#aaa">
                  Rs.{tick}
                </text>
              </g>
            ))}

            {/* Area fill */}
            <polygon points={areaPoints} fill="#1565c0" fillOpacity="0.08" />

            {/* Line */}
            <polyline points={points} fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinejoin="round" />

            {/* Dots + tooltips */}
            {data.map((d, i) => (
              <g key={i}>
                <circle cx={px(i)} cy={py(d.collected)} r="4" fill="#1565c0" />
                <title>{d.day}: Rs.{d.collected}</title>
              </g>
            ))}

            {/* X axis labels — show every 3rd to avoid crowding */}
            {data.map((d, i) => i % 3 === 0 && (
              <text key={i} x={px(i)} y={PAD.top + chartH + 20}
                textAnchor="middle" fontSize="10" fill="#888">
                {d.day?.slice(5)}
              </text>
            ))}

            {/* Axes */}
            <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH} stroke="#ddd" />
            <line x1={PAD.left} y1={PAD.top + chartH} x2={PAD.left + chartW} y2={PAD.top + chartH} stroke="#ddd" />
          </svg>
        )}
      </div>

      {/* All bills table */}
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px #0001", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h3 style={{ margin: 0, color: "#1a237e" }}>All Bills</h3>
        </div>
        <BillsTable />
      </div>
    </div>
  );
}

function BillsTable() {
  const [bills, setBills] = useState([]);
  useEffect(() => { axios.get("http://localhost:5000/api/billing/all").then(r => setBills(r.data)); }, []);
  const statusColor = { PAID: "#2e7d32", PENDING: "#e65100", PARTIAL: "#1565c0" };
  const statusBg = { PAID: "#e8f5e9", PENDING: "#fff3e0", PARTIAL: "#e3f2fd" };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#1a237e", color: "white" }}>
          {["Bill #","Patient","Date","Fee","Tax","Discount","Total","Paid","Remaining","Status"].map(h => (
            <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bills.map((b, i) => {
          const remaining = b.total_amount - b.amount_paid;
          return (
            <tr key={b.bill_id} style={{ background: i % 2 === 0 ? "#fafafa" : "white", borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1565c0", fontSize: 13 }}>#{b.bill_id}</td>
              <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.patient_name}</td>
              <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.bill_date}</td>
              <td style={{ padding: "10px 14px", fontSize: 13 }}>Rs.{b.consultation_fee}</td>
              <td style={{ padding: "10px 14px", fontSize: 13 }}>Rs.{b.tax_amount}</td>
              <td style={{ padding: "10px 14px", fontSize: 13 }}>Rs.{b.discount_amount}</td>
              <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 13 }}>Rs.{b.total_amount}</td>
              <td style={{ padding: "10px 14px", fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>Rs.{b.amount_paid}</td>
              <td style={{ padding: "10px 14px", fontSize: 13, color: remaining > 0 ? "#e65100" : "#2e7d32", fontWeight: 600 }}>Rs.{remaining}</td>
              <td style={{ padding: "10px 14px" }}>
                <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: statusBg[b.payment_status], color: statusColor[b.payment_status] }}>
                  {b.payment_status}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
      {bills.length === 0 && <tbody><tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#aaa" }}>No bills found</td></tr></tbody>}
    </table>
  );
}
