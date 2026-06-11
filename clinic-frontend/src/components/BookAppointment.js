import { useState, useEffect } from "react";
import axios from "axios";

export default function BookAppointment({ onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient_id:"", doctor_id:"", slot_id:"", appt_date:"", reason:"" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/patients/").then(r => setPatients(r.data));
    axios.get("http://localhost:5000/api/doctors/").then(r =>
      setDoctors(r.data.filter(d => d.status === "ACTIVE"))
    );
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.patient_id || !form.doctor_id || !form.slot_id || !form.appt_date) {
      setMsg({ type: "error", text: "Please fill all required fields." }); return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/appointments/", form);
      setMsg({ type: "success", text: "Appointment booked successfully!" });
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.error || e.message });
    }
    setLoading(false);
  };

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd",
    fontSize: 14, width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "#555", display: "block",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 32,
      boxShadow: "0 2px 12px #0001", maxWidth: 560 }}>
      <h2 style={{ margin: "0 0 6px", color: "#1a237e" }}>Book Appointment</h2>
      <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>Schedule a new patient visit</p>

      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <label style={lbl}>Patient *</label>
          <select name="patient_id" value={form.patient_id} onChange={handle} style={inp}>
            <option value="">-- Select Patient --</option>
            {patients.map(p => <option key={p.patient_id} value={p.patient_id}>
              {p.first_name} {p.last_name} ({p.phone})
            </option>)}
          </select>
        </div>

        <div>
          <label style={lbl}>Doctor *</label>
          <select name="doctor_id" value={form.doctor_id} onChange={handle} style={inp}>
            <option value="">-- Select Doctor --</option>
            {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>
              Dr. {d.first_name} {d.last_name} — {d.dept_name} ({d.specialization})
            </option>)}
          </select>
          {doctors.length === 0 && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#e65100" }}>⚠️ No active doctors found.</p>}
        </div>

        <div>
          <label style={lbl}>Time Slot *</label>
          <select name="slot_id" value={form.slot_id} onChange={handle} style={inp}>
            <option value="">-- Select Slot --</option>
            <option value="1">Morning-1 (09:00 – 09:30)</option>
            <option value="2">Morning-2 (09:30 – 10:00)</option>
            <option value="3">Afternoon-1 (14:00 – 14:30)</option>
          </select>
        </div>

        <div>
          <label style={lbl}>Appointment Date *</label>
          <input type="date" name="appt_date" value={form.appt_date} onChange={handle} style={inp} />
        </div>

        <div>
          <label style={lbl}>Reason for Visit</label>
          <input type="text" name="reason" value={form.reason} onChange={handle}
            style={inp} placeholder="Brief description of symptoms..." />
        </div>
      </div>

      <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={submit} disabled={loading} style={{
          padding: "12px 32px", background: loading ? "#90caf9" : "#1565c0",
          color: "white", border: "none", borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600 }}>
          {loading ? "Booking..." : "Book Appointment"}
        </button>
        {msg && (
          <div style={{ padding: "10px 18px", borderRadius: 8, fontSize: 14,
            background: msg.type === "success" ? "#e8f5e9" : "#ffebee",
            color: msg.type === "success" ? "#2e7d32" : "#c62828" }}>
            {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
