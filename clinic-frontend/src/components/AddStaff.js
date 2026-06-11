import { useState, useEffect } from "react";
import axios from "axios";

export default function AddStaff({ onSuccess }) {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ first_name:"", last_name:"", email:"", phone:"", role:"", dept_id:"", salary:"" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/departments2/").then(r => {
      setDepartments(r.data);
      if (r.data.length > 0) setForm(f => ({...f, dept_id: String(r.data[0].dept_id)}));
    });
  }, []);

  const handle = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async () => {
    if (!form.first_name || !form.last_name || !form.role || !form.dept_id) {
      setMsg({ type:"error", text:"First name, last name, role and department are required." }); return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/staff/add", form);
      setMsg({ type:"success", text:`✅ ${res.data.message}` });
      setTimeout(onSuccess, 2000);
    } catch (e) {
      setMsg({ type:"error", text: e.response?.data?.error || e.message });
    } finally { setLoading(false); }
  };

  const inp = { padding:"10px 14px", borderRadius:8, border:"1px solid #ddd", fontSize:14, width:"100%", boxSizing:"border-box" };
  const lbl = { fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:6, textTransform:"uppercase" };
  const ROLES = ["Receptionist","Nurse","Lab Technician","Pharmacist","Accountant","Cleaner","Security"];

  return (
    <div style={{ background:"white", borderRadius:12, padding:32, boxShadow:"0 2px 12px #0001", maxWidth:640 }}>
      <h2 style={{ margin:"0 0 6px", color:"#1a237e" }}>Add New Staff</h2>
      <p style={{ margin:"0 0 24px", color:"#888", fontSize:13 }}>Default password: <strong>staff123</strong> (username auto-generated as firstname_lastname)</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        {[["first_name","First Name *","text"],["last_name","Last Name *","text"],
          ["email","Email","email"],["phone","Phone","text"],["salary","Salary","number"]].map(([name,label,type]) => (
          <div key={name}>
            <label style={lbl}>{label}</label>
            <input name={name} type={type} value={form[name]} onChange={handle} style={inp} />
          </div>
        ))}
        <div>
          <label style={lbl}>Role *</label>
          <select name="role" value={form.role} onChange={handle} style={inp}>
            <option value="">-- Select Role --</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={lbl}>Department *</label>
          <select name="dept_id" value={form.dept_id} onChange={handle} style={inp}>
            {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop:24, display:"flex", gap:16, alignItems:"center" }}>
        <button onClick={submit} disabled={loading} style={{ padding:"12px 32px", background:loading?"#90a4ae":"#7b1fa2", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontSize:15, fontWeight:600 }}>
          {loading ? "Adding..." : "Add Staff Member"}
        </button>
        {msg && <div style={{ padding:"10px 16px", borderRadius:8, background:msg.type==="success"?"#e8f5e9":"#ffebee", color:msg.type==="success"?"#2e7d32":"#c62828" }}>{msg.text}</div>}
      </div>
    </div>
  );
}
