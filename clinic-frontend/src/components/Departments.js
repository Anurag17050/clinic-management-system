import { useState, useEffect } from "react";
import axios from "axios";

export default function Departments() {
  const [depts, setDepts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [view, setView] = useState("list");
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({ dept_name:"", location:"", head_doctor_id:"" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    axios.get("http://localhost:5000/api/departments2/").then(r => setDepts(r.data));
    axios.get("http://localhost:5000/api/doctors/").then(r => setDoctors(r.data.filter(d => d.status==="ACTIVE")));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditDept(null); setForm({ dept_name:"", location:"", head_doctor_id:"" }); setMsg(null); setView("form"); };
  const openEdit = (d) => { setEditDept(d); setForm({ dept_name:d.dept_name, location:d.location||"", head_doctor_id:d.head_doctor_id||"" }); setMsg(null); setView("form"); };

  const submit = async () => {
    if (!form.dept_name) { setMsg({ type:"error", text:"Department name required." }); return; }
    setLoading(true);
    try {
      if (editDept) {
        await axios.put(`http://localhost:5000/api/departments2/${editDept.dept_id}`, form);
        setMsg({ type:"success", text:"✅ Department updated!" });
      } else {
        await axios.post("http://localhost:5000/api/departments2/add", form);
        setMsg({ type:"success", text:"✅ Department added!" });
      }
      load();
      setTimeout(() => setView("list"), 1200);
    } catch (e) {
      setMsg({ type:"error", text: e.response?.data?.error || e.message });
    } finally { setLoading(false); }
  };

  const deleteDept = async (d) => {
    if (!window.confirm(`Delete "${d.dept_name}"?\nThis will fail if doctors or staff are still assigned.`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/departments2/${d.dept_id}`);
      alert(`✅ "${d.dept_name}" deleted successfully.`);
      load();
    } catch (e) {
      alert("❌ " + (e.response?.data?.error || e.message));
    }
  };

  const inp = { padding:"10px 14px", borderRadius:8, border:"1px solid #ddd", fontSize:14, width:"100%", boxSizing:"border-box" };
  const lbl = { fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:6, textTransform:"uppercase" };
  const deptColors = ["#e53935","#1e88e5","#43a047","#8e24aa","#f4511e","#00897b","#6d4c41","#1e88e5"];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ margin:0, color:"#1a237e" }}>Departments</h2>
        <button onClick={view==="list" ? openAdd : () => setView("list")} style={{ padding:"10px 22px", background:view==="list"?"#1565c0":"#888", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600 }}>
          {view==="list" ? "+ Add Department" : "← Back to List"}
        </button>
      </div>

      {/* List */}
      {view==="list" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
          {depts.map((d, i) => (
            <div key={d.dept_id} style={{ background:"white", borderRadius:12, padding:24, boxShadow:"0 2px 12px #0001", borderTop:`4px solid ${deptColors[i % deptColors.length]}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                <div>
                  <h3 style={{ margin:0, color:"#1a237e", fontSize:17 }}>{d.dept_name}</h3>
                  <p style={{ margin:"4px 0 0", fontSize:13, color:"#888" }}>📍 {d.location || "Location not set"}</p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => openEdit(d)} style={{ padding:"6px 14px", background:"#e3f2fd", color:"#1565c0", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600, fontSize:12 }}>Edit</button>
                <button onClick={() => deleteDept(d)} style={{ padding:"6px 14px", background:"#ffebee", color:"#c62828", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600, fontSize:12 }}>Delete</button>
              </div>
              </div>
              <div style={{ display:"grid", gap:8 }}>
                <div style={{ display:"flex", gap:8, fontSize:13 }}>
                  <span>👨‍⚕️</span>
                  <span style={{ color:"#888", minWidth:80 }}>Head</span>
                  <span style={{ fontWeight:600, color: d.head_name ? "#1a237e" : "#aaa" }}>
                    {d.head_name ? `Dr. ${d.head_name}` : "Not assigned"}
                  </span>
                </div>
                {d.head_name && (
                  <div style={{ display:"flex", gap:8, fontSize:13 }}>
                    <span>🩺</span>
                    <span style={{ color:"#888", minWidth:80 }}>Specialty</span>
                    <span style={{ fontWeight:500 }}>{d.specialization}</span>
                  </div>
                )}
                <div style={{ display:"flex", gap:8, fontSize:13 }}>
                  <span>👥</span>
                  <span style={{ color:"#888", minWidth:80 }}>Staff</span>
                  <span style={{ fontWeight:600 }}>{d.staff_count} member(s)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {view==="form" && (
        <div style={{ background:"white", borderRadius:12, padding:32, boxShadow:"0 2px 12px #0001", maxWidth:560 }}>
          <h3 style={{ margin:"0 0 6px", color:"#1a237e" }}>{editDept ? "Edit Department" : "Add New Department"}</h3>
          <p style={{ margin:"0 0 24px", color:"#888", fontSize:13 }}>{editDept ? `Editing: ${editDept.dept_name}` : "New department will be added immediately"}</p>

          <div style={{ display:"grid", gap:18 }}>
            <div>
              <label style={lbl}>Department Name *</label>
              <input value={form.dept_name} onChange={e => setForm({...form, dept_name:e.target.value})} style={inp} placeholder="e.g. Radiology" />
            </div>
            <div>
              <label style={lbl}>Location</label>
              <input value={form.location} onChange={e => setForm({...form, location:e.target.value})} style={inp} placeholder="e.g. Block A, Floor 2" />
            </div>
            <div>
              <label style={lbl}>Head of Department (Doctor)</label>
              <select value={form.head_doctor_id} onChange={e => setForm({...form, head_doctor_id:e.target.value})} style={inp}>
                <option value="">-- Not Assigned --</option>
                {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name} — {d.specialization}</option>)}
              </select>
              <p style={{ margin:"6px 0 0", fontSize:11, color:"#999" }}>Only active doctors shown</p>
            </div>
          </div>

          <div style={{ marginTop:24, display:"flex", gap:16, alignItems:"center" }}>
            <button onClick={submit} disabled={loading} style={{ padding:"12px 32px", background:loading?"#90a4ae":"#1565c0", color:"white", border:"none", borderRadius:8, cursor:"pointer", fontSize:15, fontWeight:600 }}>
              {loading ? "Saving..." : editDept ? "Update Department" : "Add Department"}
            </button>
            {msg && <div style={{ padding:"10px 16px", borderRadius:8, background:msg.type==="success"?"#e8f5e9":"#ffebee", color:msg.type==="success"?"#2e7d32":"#c62828" }}>{msg.text}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
