import { useEffect, useState } from "react";
import axios from "axios";

const card = { background: "white", borderRadius: 12, padding: 24,
  boxShadow: "0 2px 12px #0001" };
const th = { background: "#1565c0", color: "white", padding: "12px 16px",
  textAlign: "left", fontSize: 13 };
const td = { padding: "12px 16px", fontSize: 14, color: "#333" };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/patients/").then(r => setPatients(r.data));
  }, []);

  const filtered = patients.filter(p =>
    (p.first_name + " " + p.last_name + " " + p.phone + " " + p.email)
      .toLowerCase().includes(search.toLowerCase())
  );

  const bloodColors = { "O+":"#e53935","A+":"#1e88e5","B+":"#43a047","AB+":"#8e24aa",
    "O-":"#fb8c00","A-":"#00acc1","B-":"#6d4c41","AB-":"#546e7a" };

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: "#1a237e", fontSize: 22 }}>Patient List</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>{filtered.length} patient(s) found</p>
        </div>
        <input placeholder="🔍  Search name, phone, email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "10px 16px", width: 280, borderRadius: 8,
            border: "1px solid #ddd", fontSize: 14, outline: "none" }} />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["ID","Name","Date of Birth","Gender","Blood Group","Phone","Email","Registered"].map(h =>
              <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.patient_id} style={{ background: i % 2 === 0 ? "white" : "#f8faff",
                borderBottom: "1px solid #f0f0f0" }}>
                <td style={td}>
                  <span style={{ background: "#e3f2fd", color: "#1565c0", padding: "2px 8px",
                    borderRadius: 6, fontWeight: 700, fontSize: 13 }}>{p.patient_id}</span>
                </td>
                <td style={{ ...td, fontWeight: 600 }}>{p.first_name} {p.last_name}</td>
                <td style={td}>{p.dob}</td>
                <td style={td}>{p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "Other"}</td>
                <td style={td}>
                  <span style={{ background: bloodColors[p.blood_group] || "#888",
                    color: "white", padding: "3px 10px", borderRadius: 12,
                    fontSize: 12, fontWeight: 700 }}>{p.blood_group}</span>
                </td>
                <td style={td}>{p.phone}</td>
                <td style={{ ...td, color: "#1565c0" }}>{p.email}</td>
                <td style={{ ...td, color: "#888" }}>{p.registration_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}