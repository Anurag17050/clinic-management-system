import { useState, useEffect } from "react";
import axios from "axios";

export default function AddDoctor({ onSuccess }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    license_no: "", specialization: "", dept_id: ""
  });
  const [departments, setDepartments] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/departments/")
      .then(r => {
        setDepartments(r.data);
        if (r.data.length > 0) setForm(f => ({ ...f, dept_id: String(r.data[0].dept_id) }));
      })
      .catch(() => setMsg({ type: "error", text: "Could not load departments from server." }));
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.first_name || !form.last_name || !form.phone || !form.license_no || !form.specialization || !form.dept_id) {
      setMsg({ type: "error", text: "Please fill all required fields." });
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/doctors/add", form);
      setMsg({ type: "success", text: "Doctor added successfully!" });
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.error || e.message });
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    padding: "10px 14px", borderRadius: 8,
    border: "1px solid #ddd", fontSize: 14,
    width: "100%", boxSizing: "border-box"
  };
  const lbl = {
    fontSize: 12, fontWeight: 600, color: "#555",
    display: "block", marginBottom: 6, textTransform: "uppercase"
  };

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 32, boxShadow: "0 2px 12px #0001", maxWidth: 640 }}>
      <h2 style={{ margin: "0 0 6px", color: "#1a237e" }}>Add New Doctor</h2>
      <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>Doctor will be added as ACTIVE by default</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {[
          ["first_name", "First Name *", "text"],
          ["last_name", "Last Name *", "text"],
          ["email", "Email", "email"],
          ["phone", "Phone *", "text"],
          ["license_no", "License No *", "text"],
          ["specialization", "Specialization *", "text"],
        ].map(([name, label, type]) => (
          <div key={name}>
            <label style={lbl}>{label}</label>
            <input name={name} type={type} value={form[name]} onChange={handle} style={inp} />
          </div>
        ))}

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={lbl}>Department *</label>
          <select name="dept_id" value={form.dept_id} onChange={handle} style={inp}>
            {departments.length === 0 && <option value="">Loading departments...</option>}
            {departments.map(d => (
              <option key={d.dept_id} value={String(d.dept_id)}>{d.dept_name}</option>
            ))}
          </select>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#999" }}>
            Don't see the right department? Add it to the DEPARTMENT table in Oracle first.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 16, alignItems: "center" }}>
        <button onClick={submit} disabled={loading} style={{
          padding: "12px 32px", background: loading ? "#90a4ae" : "#1565c0",
          color: "white", border: "none", borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600
        }}>
          {loading ? "Adding..." : "Add Doctor"}
        </button>
        {msg && (
          <div style={{
            padding: "10px 16px", borderRadius: 8,
            background: msg.type === "success" ? "#e8f5e9" : "#ffebee",
            color: msg.type === "success" ? "#2e7d32" : "#c62828"
          }}>
            {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
