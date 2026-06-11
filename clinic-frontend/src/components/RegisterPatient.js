import { useState } from "react";
import axios from "axios";

export default function RegisterPatient({ onSuccess }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", dob: "", gender: "M",
    blood_group: "", email: "", phone: "", address: "", emergency_contact: ""
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.first_name || !form.last_name || !form.phone || !form.dob) {
      setMsg({ type: "error", text: "Please fill all required fields." }); return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/patients/", form);
      setMsg({ type: "success", text: "Patient registered successfully!" });
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.error || e.message });
    }
    setLoading(false);
  };

  const inp = { padding: "10px 14px", borderRadius: 8,
    border: "1px solid #ddd", fontSize: 14, width: "100%",
    boxSizing: "border-box", outline: "none" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "#555",
    display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 32,
      boxShadow: "0 2px 12px #0001", maxWidth: 680 }}>
      <h2 style={{ margin: "0 0 6px", color: "#1a237e" }}>Register New Patient</h2>
      <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>
        Fields marked with * are required
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {[["first_name","First Name *","text"],["last_name","Last Name *","text"],
          ["dob","Date of Birth *","date"],["phone","Phone *","text"],
          ["email","Email","email"],["blood_group","Blood Group","text"],
          ["address","Address","text"],["emergency_contact","Emergency Contact","text"]
        ].map(([name, label, type]) => (
          <div key={name}>
            <label style={lbl}>{label}</label>
            <input name={name} type={type} value={form[name]}
              onChange={handle} style={inp} />
          </div>
        ))}
        <div>
          <label style={lbl}>Gender</label>
          <select name="gender" value={form.gender} onChange={handle} style={inp}>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={submit} disabled={loading} style={{
          padding: "12px 32px", background: loading ? "#90caf9" : "#1565c0",
          color: "white", border: "none", borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600 }}>
          {loading ? "Registering..." : "Register Patient"}
        </button>
        {msg && (
          <div style={{ padding: "10px 18px", borderRadius: 8, fontSize: 14,
            background: msg.type === "success" ? "#e8f5e9" : "#ffebee",
            color: msg.type === "success" ? "#2e7d32" : "#c62828",
            border: "1px solid " + (msg.type === "success" ? "#a5d6a7" : "#ef9a9a") }}>
            {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
          </div>
        )}
      </div>
    </div>
  );
}