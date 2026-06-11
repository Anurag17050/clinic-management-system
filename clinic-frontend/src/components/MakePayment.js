import { useState, useEffect } from "react";
import axios from "axios";

export default function MakePayment() {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form, setForm] = useState({ payment_mode: "CASH", amount_paid: "", txn_reference: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBills = () => {
    axios.get("http://localhost:5000/api/billing/pending").then(r => setBills(r.data));
  };

  useEffect(() => { loadBills(); }, []);

  const selectBill = (e) => {
    const id = e.target.value;
    const b = bills.find(b => String(b.bill_id) === id);
    setSelectedBill(b || null);
    setForm(f => ({ ...f, amount_paid: b ? String(b.remaining) : "" }));
    setMsg(null);
  };

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!selectedBill || !form.amount_paid) {
      setMsg({ type: "error", text: "Select a bill and enter amount." });
      return;
    }
    const paying = parseFloat(form.amount_paid);
    if (paying <= 0) {
      setMsg({ type: "error", text: "Amount must be greater than 0." });
      return;
    }
    if (paying > parseFloat(selectedBill.remaining)) {
      setMsg({ type: "error", text: `Cannot pay more than remaining Rs.${selectedBill.remaining}` });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/billing/pay", {
        bill_id: selectedBill.bill_id,
        payment_mode: form.payment_mode,
        amount_paid: paying,
        txn_reference: form.txn_reference || null
      });
      const d = res.data;
      setMsg({
        type: "success",
        text: `✅ Paid Rs.${paying} — Status: ${d.status}${d.remaining > 0 ? ` — Remaining: Rs.${d.remaining}` : " — FULLY PAID!"}`
      });
      loadBills();
      setSelectedBill(null);
      setForm({ payment_mode: "CASH", amount_paid: "", txn_reference: "" });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.error || e.message });
    } finally {
      setLoading(false);
    }
  };

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6, textTransform: "uppercase" };

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 32, boxShadow: "0 2px 12px #0001", maxWidth: 560 }}>
      <h2 style={{ margin: "0 0 6px", color: "#1a237e" }}>Make Payment</h2>
      <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>Supports partial payments — pay any amount, remainder tracked automatically</p>

      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <label style={lbl}>Select Pending Bill *</label>
          <select onChange={selectBill} value={selectedBill?.bill_id || ""} style={inp}>
            <option value="">-- Select Bill --</option>
            {bills.map(b => (
              <option key={b.bill_id} value={b.bill_id}>
                #{b.bill_id} — {b.patient_name} — Total: Rs.{b.total_amount} | Remaining: Rs.{b.remaining} [{b.payment_status}]
              </option>
            ))}
          </select>
        </div>

        {selectedBill && (
          <div style={{ background: "#fff3e0", borderRadius: 8, padding: "14px 16px", fontSize: 13, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><div style={{ color: "#888", marginBottom: 2 }}>Total Bill</div><strong>Rs.{selectedBill.total_amount}</strong></div>
            <div><div style={{ color: "#888", marginBottom: 2 }}>Already Paid</div><strong style={{ color: "#2e7d32" }}>Rs.{selectedBill.paid_so_far || 0}</strong></div>
            <div><div style={{ color: "#888", marginBottom: 2 }}>Remaining</div><strong style={{ color: "#e65100" }}>Rs.{selectedBill.remaining}</strong></div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={lbl}>Payment Mode *</label>
            <select name="payment_mode" value={form.payment_mode} onChange={handle} style={inp}>
              <option value="CASH">💵 Cash</option>
              <option value="UPI">📱 UPI</option>
              <option value="CARD">💳 Card</option>
              <option value="INSURANCE">🏥 Insurance</option>
              <option value="NETBANKING">🌐 Net Banking</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Amount Paying (Rs.) *</label>
            <input type="number" name="amount_paid" value={form.amount_paid} onChange={handle} style={inp}
              placeholder={selectedBill ? `Max: Rs.${selectedBill.remaining}` : "0"} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Transaction Reference (optional)</label>
            <input name="txn_reference" value={form.txn_reference} onChange={handle} style={inp}
              placeholder="UPI ID / Card last 4 / TXN ID" />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={submit} disabled={loading} style={{
          padding: "12px 32px", background: loading ? "#90a4ae" : "#1565c0",
          color: "white", border: "none", borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 600
        }}>
          {loading ? "Processing..." : "💳 Record Payment"}
        </button>
        {msg && (
          <div style={{ padding: "10px 16px", borderRadius: 8, background: msg.type === "success" ? "#e8f5e9" : "#ffebee", color: msg.type === "success" ? "#2e7d32" : "#c62828" }}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
