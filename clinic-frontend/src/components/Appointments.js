import { useEffect, useState } from "react";
import axios from "axios";

const statusStyle = {
  SCHEDULED: { bg: "#e3f2fd", color: "#1565c0" },
  COMPLETED:  { bg: "#e8f5e9", color: "#2e7d32" },
  CANCELLED:  { bg: "#ffebee", color: "#c62828" },
  NO_SHOW:    { bg: "#fff3e0", color: "#e65100" },
};

export default function Appointments() {
  const [appts, setAppts] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments/").then(r => setAppts(r.data));
  }, []);

  const filtered = filter === "ALL" ? appts : appts.filter(a => a.status === filter);
  const th = { background: "#1a237e", color: "white", padding: "12px 16px",
    textAlign: "left", fontSize: 13 };
  const td = { padding: "12px 16px", fontSize: 14, borderBottom: "1px solid #f0f0f0" };

  const counts = ["SCHEDULED","COMPLETED","CANCELLED","NO_SHOW"].map(s => ({
    s, n: appts.filter(a => a.status === s).length
  }));

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px #0001" }}>
      <h2 style={{ margin: "0 0 20px", color: "#1a237e" }}>Appointments</h2>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("ALL")} style={{
          padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
          background: filter === "ALL" ? "#1565c0" : "#f0f4f8",
          color: filter === "ALL" ? "white" : "#555", fontWeight: 600, fontSize: 13 }}>
          All ({appts.length})
        </button>
        {counts.map(({ s, n }) => {
          const st = statusStyle[s] || { bg: "#eee", color: "#333" };
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
              background: filter === s ? st.color : st.bg,
              color: filter === s ? "white" : st.color,
              fontWeight: 600, fontSize: 13 }}>{s} ({n})</button>
          );
        })}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["ID","Patient","Doctor","Slot","Date","Status","Reason"].map(h =>
              <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => {
              const st = statusStyle[a.status] || { bg: "#eee", color: "#555" };
              return (
                <tr key={a.appt_id} style={{ background: i % 2 === 0 ? "white" : "#f8faff" }}>
                  <td style={td}><strong>{a.appt_id}</strong></td>
                  <td style={{ ...td, fontWeight: 600 }}>{a.patient_name}</td>
                  <td style={td}>{a.doctor_name}</td>
                  <td style={td}>{a.slot_label}</td>
                  <td style={td}>{a.appt_date}</td>
                  <td style={td}>
                    <span style={{ background: st.bg, color: st.color, padding: "4px 12px",
                      borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{a.status}</span>
                  </td>
                  <td style={{ ...td, color: "#666" }}>{a.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}