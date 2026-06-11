import { useState, useEffect } from "react";
import axios from "axios";

export default function DoctorPortal({ onLogout }) {
  const [doctor, setDoctor] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [validity, setValidity] = useState("30");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ med_id: "", dosage: "", frequency: "", duration_days: "", instructions: "" }]);
  const [rxMsg, setRxMsg] = useState(null);
  const [rxLoading, setRxLoading] = useState(false);
  const [view, setView] = useState("write");

  const loadData = (doc) => {
    axios.get(`http://localhost:5000/api/doctors/${doc.doctor_id}/my-appointments`).then(r => setAppointments(r.data));
    axios.get(`http://localhost:5000/api/doctors/${doc.doctor_id}/my-prescriptions`).then(r => setPrescriptions(r.data));
    axios.get(`http://localhost:5000/api/prescriptions/medications`).then(r => setMedications(r.data));
  };

  const login = async () => {
    if (!loginForm.username || !loginForm.password) { setLoginError("Enter username and password."); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const res = await axios.post("http://localhost:5000/api/doctors/login", loginForm);
      setDoctor(res.data);
      loadData(res.data);
    } catch (e) {
      setLoginError(e.response?.data?.error || "Login failed");
    } finally { setLoginLoading(false); }
  };

  const logout = () => { setDoctor(null); setLoginForm({ username: "", password: "" }); setAppointments([]); setPrescriptions([]); setSelectedAppt(null); if(onLogout) onLogout(); };

  const addItem = () => setItems([...items, { med_id: "", dosage: "", frequency: "", duration_days: "", instructions: "" }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => setItems(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const submitRx = async () => {
    if (!selectedAppt) { setRxMsg({ type: "error", text: "Select an appointment." }); return; }
    const validItems = items.filter(i => i.med_id && i.dosage && i.frequency);
    if (validItems.length === 0) { setRxMsg({ type: "error", text: "Add at least one medicine with dosage and frequency." }); return; }
    setRxLoading(true);
    try {
      await axios.post("http://localhost:5000/api/prescriptions/", {
        appt_id: selectedAppt.appt_id,
        validity_days: parseInt(validity) || 30,
        notes: notes || null,
        items: validItems.map(i => ({
          med_id: parseInt(i.med_id),
          dosage: i.dosage,
          frequency: i.frequency,
          duration_days: i.duration_days ? parseInt(i.duration_days) : null,
          instructions: i.instructions || null
        }))
      });
      setRxMsg({ type: "success", text: `✅ Prescription saved for ${selectedAppt.patient_name}!` });
      setSelectedAppt(null); setNotes(""); setValidity("30");
      setItems([{ med_id: "", dosage: "", frequency: "", duration_days: "", instructions: "" }]);
      loadData(doctor);
    } catch (e) {
      setRxMsg({ type: "error", text: e.response?.data?.error || e.message });
    } finally { setRxLoading(false); }
  };

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase" };

  if (!doctor) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 40, boxShadow: "0 4px 24px #0002", width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🩺</div>
          <h2 style={{ margin: 0, color: "#1a237e" }}>Doctor Login</h2>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 13 }}>Login to write prescriptions for your patients</p>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={lbl}>Username</label>
            <input value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} style={inp} placeholder="e.g. rajesh_sharma" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} style={inp} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
        </div>
        {loginError && <div style={{ marginTop: 12, padding: "10px 14px", background: "#ffebee", color: "#c62828", borderRadius: 8, fontSize: 13 }}>❌ {loginError}</div>}
        <button onClick={login} disabled={loginLoading} style={{ marginTop: 20, width: "100%", padding: 13, background: loginLoading ? "#90a4ae" : "#1565c0", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {loginLoading ? "Logging in..." : "Login →"}
        </button>
        <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 8, fontSize: 12, color: "#888" }}>
          💡 Default: <strong>firstname_lastname</strong> / <strong>doc123</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ background: "white", borderRadius: 12, padding: "16px 24px", marginBottom: 24, boxShadow: "0 2px 12px #0001", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1565c0", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 700 }}>
            {doctor.first_name[0]}{doctor.last_name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1a237e" }}>Dr. {doctor.first_name} {doctor.last_name}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{doctor.specialization} · {doctor.dept_name}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>✅ Logged In</span>
          <button onClick={logout} style={{ padding: "8px 18px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: 24, background: "white", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px #0001" }}>
        {[["write", "✍️ Write Prescription"], ["history", "📋 My Prescriptions"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} style={{ flex: 1, padding: 14, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: view === id ? "#1565c0" : "white", color: view === id ? "white" : "#666" }}>{label}</button>
        ))}
      </div>

      {/* Write Prescription */}
      {view === "write" && (
        <div style={{ background: "white", borderRadius: 12, padding: 28, boxShadow: "0 2px 12px #0001" }}>
          <h3 style={{ margin: "0 0 20px", color: "#1a237e" }}>Write Prescription</h3>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Select Completed Appointment *</label>
              <select onChange={e => { const a = appointments.find(x => String(x.appt_id) === e.target.value); setSelectedAppt(a || null); setRxMsg(null); }} value={selectedAppt?.appt_id || ""} style={inp}>
                <option value="">-- Select Patient Visit --</option>
                {appointments.map(a => <option key={a.appt_id} value={a.appt_id}>#{a.appt_id} — {a.patient_name} on {a.appt_date} ({a.reason || "General"})</option>)}
              </select>
              {appointments.length === 0 && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#e65100" }}>⚠️ No completed appointments found.</p>}
            </div>
            <div>
              <label style={lbl}>Validity (days)</label>
              <input type="number" value={validity} onChange={e => setValidity(e.target.value)} style={inp} />
            </div>
          </div>

          {selectedAppt && (
            <div style={{ background: "#e3f2fd", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, display: "flex", gap: 24 }}>
              <span>👤 <strong>{selectedAppt.patient_name}</strong></span>
              <span>📅 <strong>{selectedAppt.appt_date}</strong></span>
              <span>📋 <strong>{selectedAppt.reason || "General"}</strong></span>
            </div>
          )}

          {/* Medicines */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ ...lbl, margin: 0 }}>Medicines *</label>
              <button onClick={addItem} style={{ padding: "6px 14px", background: "#e8f5e9", color: "#2e7d32", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Add Medicine</button>
            </div>

            {items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 2fr auto", gap: 10, marginBottom: 10, alignItems: "end" }}>
                <div>
                  {i === 0 && <label style={lbl}>Medicine</label>}
                  <select value={item.med_id} onChange={e => updateItem(i, "med_id", e.target.value)} style={inp}>
                    <option value="">-- Select --</option>
                    {medications.map(m => <option key={m.med_id} value={m.med_id}>{m.med_name} ({m.med_type})</option>)}
                  </select>
                </div>
                <div>
                  {i === 0 && <label style={lbl}>Dosage</label>}
                  <input value={item.dosage} onChange={e => updateItem(i, "dosage", e.target.value)} style={inp} placeholder="e.g. 1 tab" />
                </div>
                <div>
                  {i === 0 && <label style={lbl}>Frequency</label>}
                  <select value={item.frequency} onChange={e => updateItem(i, "frequency", e.target.value)} style={inp}>
                    <option value="">-- Select --</option>
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>Every 8 hours</option>
                    <option>As needed</option>
                    <option>Before meals</option>
                    <option>After meals</option>
                  </select>
                </div>
                <div>
                  {i === 0 && <label style={lbl}>Days</label>}
                  <input type="number" value={item.duration_days} onChange={e => updateItem(i, "duration_days", e.target.value)} style={inp} placeholder="7" />
                </div>
                <div>
                  {i === 0 && <label style={lbl}>Instructions</label>}
                  <input value={item.instructions} onChange={e => updateItem(i, "instructions", e.target.value)} style={inp} placeholder="e.g. after food" />
                </div>
                <div style={{ paddingBottom: 2 }}>
                  {items.length > 1 && <button onClick={() => removeItem(i)} style={{ padding: "10px 12px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>✕</button>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>General Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} style={inp} placeholder="Any additional instructions..." />
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button onClick={submitRx} disabled={rxLoading} style={{ padding: "12px 32px", background: rxLoading ? "#90a4ae" : "#2e7d32", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
              {rxLoading ? "Saving..." : "💊 Save Prescription"}
            </button>
            {rxMsg && <div style={{ padding: "10px 16px", borderRadius: 8, background: rxMsg.type === "success" ? "#e8f5e9" : "#ffebee", color: rxMsg.type === "success" ? "#2e7d32" : "#c62828" }}>{rxMsg.text}</div>}
          </div>
        </div>
      )}

      {/* Prescription History */}
      {view === "history" && (
        <div>
          <h3 style={{ margin: "0 0 16px", color: "#1a237e" }}>My Prescriptions ({prescriptions.length})</h3>
          {prescriptions.length === 0 && <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", color: "#aaa" }}>No prescriptions written yet</div>}
          {prescriptions.map(rx => (
            <div key={rx.rx_id} style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: "0 2px 12px #0001" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#1565c0", fontSize: 15 }}>Rx #{rx.rx_id}</span>
                  <span style={{ marginLeft: 16, color: "#555" }}>👤 {rx.patient_name}</span>
                  <span style={{ marginLeft: 16, color: "#888", fontSize: 13 }}>📅 Visit: {rx.visit_date}</span>
                </div>
                <span style={{ fontSize: 12, color: "#888" }}>Valid {rx.validity_days} days · Issued: {rx.issued_date}</span>
              </div>
              {rx.notes && <div style={{ marginBottom: 10, fontSize: 13, color: "#555", fontStyle: "italic" }}>📝 {rx.notes}</div>}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    {["Medicine", "Type", "Dosage", "Frequency", "Days", "Instructions"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#555", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rx.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1a237e" }}>{item.med_name}</td>
                      <td style={{ padding: "8px 12px", color: "#888" }}>{item.med_type}</td>
                      <td style={{ padding: "8px 12px" }}>{item.dosage}</td>
                      <td style={{ padding: "8px 12px" }}>{item.frequency}</td>
                      <td style={{ padding: "8px 12px" }}>{item.duration_days || "—"}</td>
                      <td style={{ padding: "8px 12px", color: "#666" }}>{item.instructions || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
