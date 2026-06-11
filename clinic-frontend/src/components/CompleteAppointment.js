import { useState, useEffect } from "react";
import axios from "axios";

export default function CompleteAppointment() {
  const [appts, setAppts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ symptoms: "", diagnosis: "", treatment: "", follow_up_date: "" });
  const [bill, setBill] = useState({ consultation_fee: "500", tax_amount: "90", discount_amount: "0", total_amount: "590" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments/")
      .then(r => setAppts(r.data.filter(a => a.status === "SCHEDULED")));
  }, []);

  const selectAppt = (e) => {
    const id = e.target.value;
    const appt = appts.find(a => String(a.appt_id) === id);
    setSelected(appt || null);
    setMsg(null);
  };

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBill = e => {
    const updated = { ...bill, [e.target.name]: e.target.value };
    const fee = parseFloat(updated.consultation_fee) || 0;
    const tax = parseFloat(updated.tax_amount) || 0;
    const disc = parseFloat(updated.discount_amount) || 0;
    updated.total_amount = (fee + tax - disc).toFixed(0);
    setBill(updated);
  };

  const submit = async () => {
    if (!selected || !form.diagnosis) {
      setMsg({ type: "error", text: "Select appointment and enter diagnosis." });
      return;
    }
    setLoading(true);
    try {
      // Step 1: Create medical record (this triggers appointment → COMPLETED via DB trigger)
      await axios.post("http://localhost:5000/api/medical-records/", {
        appt_id: selected.appt_id,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        treatment_plan: form.treatment,
        follow_up_date: form.follow_up_date || null
      });
      // Step 2: Create bill
      await axios.post("http://localhost:5000/api/billing/", {
        appt_id: selected.appt_id,
        consultation_fee: parseFloat(bill.consultation_fee),
        tax_amount: parseFloat(bill.tax_amount),
        discount_amount: parseFloat(bill.discount_amount),
        total_amount: parseFloat(bill.total_amount)
      });
      setMsg({ type: "success", text: `Appointment #${selected.appt_id} completed and bill of Rs.${bill.total_amount} created!` });
      setAppts(prev => prev.filter(a => a.appt_id !== selected.appt_id));
      setSelected(null);
      setForm({ symptoms: "", diagnosis: "", treatment: "", follow_up_date: "" });
      setBill({ consultation_fee: "500", tax_amount: "90", discount_amount: "0", total_amount: "590" });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.error || e.message });
    } finally {
      setLoading(false);
    }
  };

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6, textTransform: "uppercase" };

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 32, boxShadow: "0 2px 12px #0001", maxWidth: 720 }}>
      <h2 style={{ margin: "0 0 4px", color: "#1a237e" }}>Complete a Visit</h2>
      <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>
        Fill diagnosis → appointment becomes COMPLETED + bill is auto-created
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Select Scheduled Appointment *</label>
        <select onChange={selectAppt} value={selected?.appt_id || ""} style={inp}>
          <option value="">-- Select Appointment --</option>
          {appts.map(a => (
            <option key={a.appt_id} value={a.appt_id}>
              #{a.appt_id} — {a.patient_name} with {a.doctor_name} on {a.appt_date}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div style={{ background: "#e3f2fd", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <span>👤 <strong>{selected.patient_name}</strong></span>
          <span>🩺 <strong>{selected.doctor_name}</strong></span>
          <span>📅 <strong>{selected.appt_date}</strong></span>
          <span>⏰ <strong>{selected.appt_time}</strong></span>
          <span>📋 <strong>{selected.reason || "General"}</strong></span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={lbl}>Symptoms</label>
          <input name="symptoms" value={form.symptoms} onChange={handle} style={inp} placeholder="Patient reported symptoms..." />
        </div>
        <div>
          <label style={lbl}>Diagnosis *</label>
          <input name="diagnosis" value={form.diagnosis} onChange={handle} style={inp} placeholder="Doctor's diagnosis..." />
        </div>
        <div>
          <label style={lbl}>Treatment Plan</label>
          <input name="treatment" value={form.treatment} onChange={handle} style={inp} placeholder="Prescribed treatment..." />
        </div>
        <div>
          <label style={lbl}>Follow-up Date</label>
          <input type="date" name="follow_up_date" value={form.follow_up_date} onChange={handle} style={inp} />
        </div>
      </div>

      <div style={{ background: "#f3e5f5", borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <h4 style={{ margin: "0 0 14px", color: "#4a148c" }}>💰 Bill Details</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {[
            ["consultation_fee", "Consultation Fee", false],
            ["tax_amount", "Tax (18%)", false],
            ["discount_amount", "Discount", false],
            ["total_amount", "Total Amount", true],
          ].map(([name, label, readOnly]) => (
            <div key={name}>
              <label style={lbl}>{label}</label>
              <input
                type="number" name={name}
                value={bill[name]} onChange={handleBill}
                readOnly={readOnly}
                style={{ ...inp, background: readOnly ? "#e8f5e9" : "white", fontWeight: readOnly ? 700 : 400, color: readOnly ? "#1b5e20" : "#333" }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <button onClick={submit} disabled={loading} style={{
          padding: "12px 36px", background: loading ? "#90a4ae" : "#2e7d32",
          color: "white", border: "none", borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600
        }}>
          {loading ? "Processing..." : "✅ Complete & Generate Bill"}
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