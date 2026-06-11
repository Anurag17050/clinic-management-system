import { useState } from "react";
import axios from "axios";

export default function Prescriptions() {
  const [apptId, setApptId] = useState("");
  const [rxList, setRxList] = useState([]);
  const [error, setError] = useState("");

  const lookup = async () => {
    setError(""); setRxList([]);
    try {
      const r = await axios.get("http://localhost:5000/api/prescriptions/" + apptId);
      setRxList(r.data);
    } catch {
      setError("No prescription found for Appointment ID: " + apptId);
    }
  };

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" };

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 28, boxShadow: "0 2px 12px #0001" }}>
      <h2 style={{ margin: "0 0 6px", color: "#1a237e" }}>View Prescriptions</h2>
      <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>Prescriptions are written by doctors from the Doctor Portal tab</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input type="number" placeholder="Enter Appointment ID"
          value={apptId} onChange={e => setApptId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && lookup()}
          style={{ ...inp, width: 240 }} />
        <button onClick={lookup} style={{ padding: "10px 24px", background: "#1565c0",
          color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          🔍 Lookup
        </button>
      </div>

      {error && <p style={{ color: "#c62828", background: "#ffebee", padding: "10px 16px", borderRadius: 8 }}>{error}</p>}

      {rxList.length > 0 && (
        <div>
          <p style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>
            Found <strong>{rxList.length}</strong> prescription(s) for Appointment #{apptId}
          </p>
          {rxList.map((rx, idx) => (
            <div key={rx.rx_id} style={{ border: "1px solid #e3f2fd", borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", gap: 24 }}>
                  <div><span style={{ color: "#888", fontSize: 12 }}>Rx ID</span>
                    <p style={{ margin: 0, fontWeight: 700, color: "#1565c0", fontSize: 16 }}>#{rx.rx_id}</p></div>
                  <div><span style={{ color: "#888", fontSize: 12 }}>Issued</span>
                    <p style={{ margin: 0, fontWeight: 600 }}>{rx.issued_date}</p></div>
                  <div><span style={{ color: "#888", fontSize: 12 }}>Valid For</span>
                    <p style={{ margin: 0, fontWeight: 600 }}>{rx.validity_days} days</p></div>
                </div>
                <span style={{ background: "#e3f2fd", color: "#1565c0", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, alignSelf: "center" }}>
                  Prescription {idx + 1} of {rxList.length}
                </span>
              </div>

              {rx.notes && <p style={{ background: "#fffde7", padding: "10px 14px", borderRadius: 8, fontSize: 13, color: "#555", marginBottom: 12 }}>📝 {rx.notes}</p>}

              <h4 style={{ color: "#1a237e", marginBottom: 10 }}>Medications</h4>
              {rx.items.length === 0 && <p style={{ color: "#aaa", fontSize: 13 }}>No medicines recorded.</p>}
              {rx.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center",
                  padding: "10px 14px", background: i % 2 === 0 ? "#f8faff" : "white",
                  borderRadius: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ background: "#e3f2fd", color: "#1565c0", padding: "4px 12px",
                    borderRadius: 6, fontWeight: 700, fontSize: 13, minWidth: 160 }}>
                    {item.med_name}
                  </span>
                  <span style={{ fontSize: 12, color: "#888" }}>{item.med_type}</span>
                  <span style={{ fontSize: 13 }}>💊 {item.dosage}</span>
                  <span style={{ fontSize: 13 }}>🕐 {item.frequency}</span>
                  <span style={{ fontSize: 13 }}>📅 {item.duration_days} days</span>
                  {item.instructions && <span style={{ fontSize: 12, color: "#666" }}>ℹ️ {item.instructions}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
