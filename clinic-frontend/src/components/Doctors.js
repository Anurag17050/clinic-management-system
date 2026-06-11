import { useEffect, useState } from "react";
import axios from "axios";

const deptColors = {
  "Cardiology": "#e53935",
  "Neurology": "#1e88e5",
  "Orthopedics": "#43a047"
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    axios.get("http://localhost:5000/api/doctors/")
      .then(r => setDoctors(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/doctors/${id}/toggle`);
      load();
    } catch (e) {
      alert("Toggle failed: " + (e.response?.data?.error || e.message));
    }
  };

  const deleteDoctor = async (d) => {
    if (!window.confirm(`Delete Dr. ${d.first_name} ${d.last_name}?\nThis will fail if appointments exist for this doctor.`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${d.doctor_id}`);
      alert(`✅ Dr. ${d.first_name} ${d.last_name} deleted.`);
      load();
    } catch (e) {
      alert("❌ " + (e.response?.data?.error || e.message));
    }
  };

  if (loading) return <div style={{ padding: 40, color: "#888" }}>Loading doctors...</div>;

  const active = doctors.filter(d => d.status === "ACTIVE").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "#1a237e" }}>Our Doctors</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            ✅ Active: {active}
          </span>
          <span style={{ background: "#ffebee", color: "#c62828", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
            🔴 Inactive: {doctors.length - active}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {doctors.map(d => (
          <div key={d.doctor_id} style={{
            background: "white", borderRadius: 12, padding: 24,
            boxShadow: "0 2px 12px #0001",
            borderTop: `4px solid ${deptColors[d.dept_name] || "#1565c0"}`,
            opacity: d.status === "INACTIVE" ? 0.6 : 1,
            transition: "opacity 0.3s"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: deptColors[d.dept_name] || "#1565c0",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 20, fontWeight: 700
              }}>
                {d.first_name[0]}{d.last_name[0]}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: "#1a237e" }}>
                  Dr. {d.first_name} {d.last_name}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#888" }}>{d.specialization}</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
              {[
                ["🏢", "Department", d.dept_name],
                ["📧", "Email", d.email],
                ["📱", "Phone", d.phone],
                ["🪪", "License", d.license_no],
                ["📅", "Joined", d.hire_date],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  <span>{icon}</span>
                  <span style={{ color: "#888", minWidth: 80 }}>{label}</span>
                  <span style={{ color: "#333", fontWeight: 500 }}>{val || "—"}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
              <span style={{
                background: d.status === "ACTIVE" ? "#e8f5e9" : "#ffebee",
                color: d.status === "ACTIVE" ? "#2e7d32" : "#c62828",
                padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700
              }}>
                {d.status === "ACTIVE" ? "✅ ACTIVE" : "🔴 INACTIVE"}
              </span>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => toggle(d.doctor_id)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: d.status === "ACTIVE" ? "#ffebee" : "#e8f5e9",
                  color: d.status === "ACTIVE" ? "#c62828" : "#2e7d32",
                  fontWeight: 600, fontSize: 13
                }}>
                  {d.status === "ACTIVE" ? "Mark Inactive" : "Mark Active"}
                </button>
                <button onClick={() => deleteDoctor(d)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: "#ffebee", color: "#c62828", fontWeight: 600, fontSize: 13
                }}>
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}