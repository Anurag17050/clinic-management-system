import { useState, useEffect } from "react";
import axios from "axios";

export default function BookAppointment({ onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient_id: "", doctor_id: "", slot_id: "", appt_date: "", reason: ""
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/patients/").then(r => setPatients(r.data));
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      await axios.post("http://localhost:5000/api/appointments/", form);
      setMsg("✅ Appointment booked!");
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || e.message));
    }
  };

  const inp = { padding: "8px 12px", borderRadius: 6,
                border: "1px solid #bdc3c7", fontSize: 14, width: "100%" };

  return (
    <div style={{ maxWidth: 500 }}>
      <h2 style={{ color: "#2c3e50" }}>Book Appointment</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, color: "#7f8c8d" }}>Patient</label>
          <select name="patient_id" value={form.patient_id} onChange={handle} style={inp}>
            <option value="">-- Select Patient --</option>
            {patients.map(p => <option key={p.patient_id} value={p.patient_id}>
              {p.first_name} {p.last_name}
            </option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#7f8c8d" }}>Doctor ID</label>
          <select name="doctor_id" value={form.doctor_id} onChange={handle} style={inp}>
            <option value="">-- Select Doctor --</option>
            <option value="1">Dr. Rajesh Sharma (Cardiology)</option>
            <option value="2">Dr. Priya Mehta (Neurology)</option>
            <option value="3">Dr. Arjun Rao (Orthopedics)</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#7f8c8d" }}>Time Slot</label>
          <select name="slot_id" value={form.slot_id} onChange={handle} style={inp}>
            <option value="">-- Select Slot --</option>
            <option value="1">Morning-1 (09:00-09:30)</option>
            <option value="2">Morning-2 (09:30-10:00)</option>
            <option value="3">Afternoon-1 (14:00-14:30)</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#7f8c8d" }}>Date</label>
          <input type="date" name="appt_date" value={form.appt_date}
            onChange={handle} style={inp} />
        </div>
        <div>
          <label style={{ fontSize: 13, color: "#7f8c8d" }}>Reason</label>
          <input type="text" name="reason" value={form.reason}
            onChange={handle} style={inp} placeholder="Reason for visit" />
        </div>
      </div>
      <button onClick={submit} style={{
        marginTop: 20, padding: "10px 28px", background: "#3498db",
        color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15
      }}>Book Appointment</button>
      {msg && <p style={{ color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</p>}
    </div>
  );
}
