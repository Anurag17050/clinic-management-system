import { useState, useEffect } from "react";
import axios from "axios";

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    axios.get("http://localhost:5000/api/staff/").then(r => setStaff(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/staff/${id}/toggle`);
      load();
    } catch (e) { alert("Toggle failed: " + (e.response?.data?.error || e.message)); }
  };

  const deleteStaff = async (s) => {
    if (!window.confirm(`Delete ${s.first_name} ${s.last_name} (${s.role})?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/staff/${s.staff_id}`);
      alert(`✅ ${s.first_name} ${s.last_name} deleted.`);
      load();
    } catch (e) {
      alert("❌ " + (e.response?.data?.error || e.message));
    }
  };

  const active = staff.filter(s => s.status === "ACTIVE").length;
  const roleColor = { Receptionist:"#1565c0", Nurse:"#7b1fa2", "Lab Technician":"#e65100", Pharmacist:"#2e7d32", Admin:"#c62828", Accountant:"#00838f" };

  if (loading) return <div style={{ padding:40, color:"#888" }}>Loading staff...</div>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ margin:0, color:"#1a237e" }}>Staff Members</h2>
        <div style={{ display:"flex", gap:12 }}>
          <span style={{ background:"#e8f5e9", color:"#2e7d32", padding:"6px 16px", borderRadius:20, fontSize:13, fontWeight:700 }}>✅ Active: {active}</span>
          <span style={{ background:"#ffebee", color:"#c62828", padding:"6px 16px", borderRadius:20, fontSize:13, fontWeight:700 }}>🔴 Inactive: {staff.length - active}</span>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
        {staff.map(s => (
          <div key={s.staff_id} style={{ background:"white", borderRadius:12, padding:24, boxShadow:"0 2px 12px #0001", borderTop:`4px solid ${roleColor[s.role]||"#888"}`, opacity:s.status==="INACTIVE"?0.6:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:roleColor[s.role]||"#888", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:18, fontWeight:700 }}>
                {s.first_name[0]}{s.last_name[0]}
              </div>
              <div>
                <h3 style={{ margin:0, fontSize:15, color:"#1a237e" }}>{s.first_name} {s.last_name}</h3>
                <p style={{ margin:"2px 0 0", fontSize:13, color:"#888" }}>{s.role}</p>
              </div>
            </div>
            <div style={{ display:"grid", gap:6, marginBottom:14 }}>
              {[["🏢","Dept",s.dept_name],["📧","Email",s.email],["📱","Phone",s.phone||"—"],["💰","Salary",s.salary?`Rs.${s.salary}`:"—"]].map(([icon,label,val]) => (
                <div key={label} style={{ display:"flex", gap:8, fontSize:13 }}>
                  <span>{icon}</span><span style={{ color:"#888", minWidth:50 }}>{label}</span><span style={{ fontWeight:500 }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid #f0f0f0" }}>
              <span style={{ background:s.status==="ACTIVE"?"#e8f5e9":"#ffebee", color:s.status==="ACTIVE"?"#2e7d32":"#c62828", padding:"4px 12px", borderRadius:12, fontSize:12, fontWeight:700 }}>
                {s.status==="ACTIVE"?"✅ ACTIVE":"🔴 INACTIVE"}
              </span>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => toggle(s.staff_id)} style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", background:s.status==="ACTIVE"?"#ffebee":"#e8f5e9", color:s.status==="ACTIVE"?"#c62828":"#2e7d32", fontWeight:600, fontSize:12 }}>
                  {s.status==="ACTIVE"?"Mark Inactive":"Mark Active"}
                </button>
                <button onClick={() => deleteStaff(s)} style={{ padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", background:"#ffebee", color:"#c62828", fontWeight:600, fontSize:12 }}>
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {staff.length===0 && <div style={{ padding:40, color:"#aaa", gridColumn:"1/-1", textAlign:"center" }}>No staff members found. Add some!</div>}
      </div>
    </div>
  );
}
