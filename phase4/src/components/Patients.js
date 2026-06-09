import { useEffect, useState } from "react";
import axios from "axios";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/patients/")
      .then(r => setPatients(r.data));
  }, []);

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.phone} ${p.email}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const th = { background: "#3498db", color: "white", padding: "10px 14px", textAlign: "left" };
  const td = { padding: "10px 14px", borderBottom: "1px solid #ecf0f1" };

  return (
    <div>
      <h2 style={{ color: "#2c3e50" }}>Patient List</h2>
      <input placeholder="Search by name, phone or email..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ padding: "8px 14px", width: 320, borderRadius: 6,
                 border: "1px solid #bdc3c7", marginBottom: 16, fontSize: 14 }} />
      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px #0001" }}>
        <thead>
          <tr>
            {["ID","Name","DOB","Gender","Blood Group","Phone","Email","Registered"].map(h =>
              <th key={h} style={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={p.patient_id} style={{ background: i % 2 === 0 ? "white" : "#f8f9fa" }}>
              <td style={td}>{p.patient_id}</td>
              <td style={td}>{p.first_name} {p.last_name}</td>
              <td style={td}>{p.dob}</td>
              <td style={td}>{p.gender}</td>
              <td style={td}><span style={{ background: "#e8f4fd", padding: "2px 8px",
                borderRadius: 12, fontSize: 12 }}>{p.blood_group}</span></td>
              <td style={td}>{p.phone}</td>
              <td style={td}>{p.email}</td>
              <td style={td}>{p.registration_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: "#7f8c8d", marginTop: 8 }}>{filtered.length} patient(s) found</p>
    </div>
  );
}
