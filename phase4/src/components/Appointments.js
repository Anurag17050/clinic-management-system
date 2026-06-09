import { useEffect, useState } from "react";
import axios from "axios";

export default function Appointments() {
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments/")
      .then(r => setAppts(r.data));
  }, []);

  const statusColor = {
    SCHEDULED: "#3498db", COMPLETED: "#27ae60",
    CANCELLED: "#e74c3c", NO_SHOW: "#e67e22"
  };

  const th = { background: "#2c3e50", color: "white", padding: "10px 14px", textAlign: "left" };
  const td = { padding: "10px 14px", borderBottom: "1px solid #ecf0f1" };

  return (
    <div>
      <h2 style={{ color: "#2c3e50" }}>Appointments</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px #0001" }}>
        <thead>
          <tr>{["ID","Patient","Doctor","Slot","Date","Status","Reason"].map(h =>
            <th key={h} style={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {appts.map((a, i) => (
            <tr key={a.appt_id} style={{ background: i % 2 === 0 ? "white" : "#f8f9fa" }}>
              <td style={td}>{a.appt_id}</td>
              <td style={td}>{a.patient_name}</td>
              <td style={td}>{a.doctor_name}</td>
              <td style={td}>{a.slot_label}</td>
              <td style={td}>{a.appt_date}</td>
              <td style={td}>
                <span style={{ background: statusColor[a.status] || "#95a5a6",
                  color: "white", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>
                  {a.status}
                </span>
              </td>
              <td style={td}>{a.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
