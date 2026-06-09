import { useState } from "react";
import axios from "axios";

export default function RegisterPatient({ onSuccess }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", dob: "", gender: "M",
    blood_group: "", email: "", phone: "", address: "", emergency_contact: ""
  });
  const [msg, setMsg] = useState("");

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      await axios.post("http://localhost:5000/api/patients/", form);
      setMsg("✅ Patient registered successfully!");
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setMsg("❌ Error: " + (e.response?.data?.error || e.message));
    }
  };

  const inp = { padding: "8px 12px", borderRadius: 6, border: "1px solid #bdc3c7",
                fontSize: 14, width: "100%" };
  const fields = [
    ["first_name","First Name","text"], ["last_name","Last Name","text"],
    ["dob","Date of Birth","date"], ["email","Email","email"],
    ["phone","Phone","text"], ["blood_group","Blood Group","text"],
    ["address","Address","text"], ["emergency_contact","Emergency Contact","text"]
  ];

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ color: "#2c3e50" }}>Register New Patient</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {fields.map(([name, label, type]) => (
          <div key={name}>
            <label style={{ fontSize: 13, color: "#7f8c8d", display: "block", marginBottom: 4 }}>
              {label}
            </label>
            <input name={name} type={type} value={form[name]}
              onChange={handle} style={inp} />
          </div>
        ))}
        <div>
          <label style={{ fontSize: 13, color: "#7f8c8d", display: "block", marginBottom: 4 }}>
            Gender
          </label>
          <select name="gender" value={form.gender} onChange={handle} style={inp}>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
      </div>
      <button onClick={submit} style={{
        marginTop: 20, padding: "10px 28px", background: "#27ae60",
        color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15
      }}>Register Patient</button>
      {msg && <p style={{ marginTop: 12, color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</p>}
    </div>
  );
}
