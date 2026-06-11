import { useState, useEffect } from "react";
import axios from "axios";

// ── Role config ─────────────────────────────────────────
const ROLE_CONFIG = {
  Receptionist: {
    label: "Receptionist",
    color: "#1565c0",
    icon: "🗂️",
    desc: "Register new patients into the system"
  },
  Nurse: {
    label: "Nurse",
    color: "#7b1fa2",
    icon: "🩺",
    desc: "View scheduled appointments"
  },
  "Lab Technician": {
    label: "Lab Technician",
    color: "#e65100",
    icon: "🔬",
    desc: "View scheduled appointments"
  },
  Accountant: {
    label: "Accountant",
    color: "#2e7d32",
    icon: "💰",
    desc: "View billing records and revenue"
  }
};

export default function StaffPortal({ onLogout }) {
  const [staff, setStaff] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const login = async () => {
    if (!loginForm.username || !loginForm.password) { setLoginError("Enter credentials."); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const res = await axios.post("http://localhost:5000/api/staff/login", loginForm);
      if (res.data.role === "Admin") {
        setLoginError("Admins must use the Admin Login tab.");
        return;
      }
      setStaff(res.data);
    } catch (e) {
      setLoginError(e.response?.data?.error || "Invalid credentials");
    } finally { setLoginLoading(false); }
  };

  const logout = () => { setStaff(null); setLoginForm({ username: "", password: "" }); if(onLogout) onLogout(); };

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, width: "100%", boxSizing: "border-box" };

  if (!staff) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 40, boxShadow: "0 4px 24px #0002", width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>👩‍💼</div>
          <h2 style={{ margin: 0, color: "#1a237e" }}>Staff Login</h2>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 13 }}>Role-based access — your dashboard loads automatically</p>
        </div>

        {/* Role legend */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
            <div key={role} style={{ background: "#f8faff", borderRadius: 8, padding: "8px 12px", borderLeft: `3px solid ${cfg.color}` }}>
              <div style={{ fontSize: 16 }}>{cfg.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
              <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{cfg.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Username</label>
            <input value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
              style={inp} placeholder="firstname_lastname" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Password</label>
            <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              style={inp} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
        </div>

        {loginError && <div style={{ marginTop: 12, padding: "10px 14px", background: "#ffebee", color: "#c62828", borderRadius: 8, fontSize: 13 }}>❌ {loginError}</div>}

        <button onClick={login} disabled={loginLoading} style={{ marginTop: 18, width: "100%", padding: 13, background: loginLoading ? "#90a4ae" : "#1565c0", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {loginLoading ? "Logging in..." : "Login →"}
        </button>
        <div style={{ marginTop: 14, padding: 10, background: "#f5f5f5", borderRadius: 8, fontSize: 11, color: "#888" }}>
          💡 Default password: <strong>staff123</strong>
        </div>
      </div>
    </div>
  );

  const cfg = ROLE_CONFIG[staff.role] || { color: "#888", icon: "👤", label: staff.role };

  return (
    <div>
      {/* Header */}
      <div style={{ background: "white", borderRadius: 12, padding: "16px 24px", marginBottom: 24, boxShadow: "0 2px 12px #0001", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 700 }}>
            {staff.first_name[0]}{staff.last_name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1a237e" }}>{staff.first_name} {staff.last_name}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{cfg.icon} {staff.role} · {staff.dept_name}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>✅ Logged In</span>
          <button onClick={logout} style={{ padding: "8px 18px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Logout</button>
        </div>
      </div>

      {/* Role-based dashboard */}
      {staff.role === "Receptionist" && <ReceptionistView staff={staff} />}
      {(staff.role === "Nurse" || staff.role === "Lab Technician") && <NurseLabView staff={staff} />}
      {staff.role === "Accountant" && <AccountantView />}
      {!["Receptionist","Nurse","Lab Technician","Accountant"].includes(staff.role) && (
        <div style={{ background: "white", borderRadius: 12, padding: 32, boxShadow: "0 2px 12px #0001", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🚧</div>
          <h3 style={{ color: "#888" }}>No dashboard configured for role: {staff.role}</h3>
        </div>
      )}
    </div>
  );
}

// ── RECEPTIONIST VIEW ─────────────────────────────────
function ReceptionistView({ staff }) {
  const [form, setForm] = useState({ first_name:"", last_name:"", dob:"", gender:"M", blood_group:"", email:"", phone:"", address:"", emergency_contact:"" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.first_name || !form.last_name || !form.phone || !form.dob) {
      setMsg({ type: "error", text: "First name, last name, phone and DOB are required." }); return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/patients/", form);
      setMsg({ type: "success", text: `✅ Patient ${form.first_name} ${form.last_name} registered successfully!` });
      setForm({ first_name:"", last_name:"", dob:"", gender:"M", blood_group:"", email:"", phone:"", address:"", emergency_contact:"" });
    } catch (e) {
      setMsg({ type: "error", text: e.response?.data?.error || e.message });
    } finally { setLoading(false); }
  };

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, width: "100%", boxSizing: "border-box" };
  const lbl = { fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6, textTransform: "uppercase" };

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 28, boxShadow: "0 2px 12px #0001" }}>
      <h3 style={{ margin: "0 0 6px", color: "#1565c0" }}>🗂️ Register New Patient</h3>
      <p style={{ margin: "0 0 24px", color: "#888", fontSize: 13 }}>Logged in as Receptionist — {staff.first_name} {staff.last_name}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[["first_name","First Name *","text"],["last_name","Last Name *","text"],
          ["email","Email","email"],["phone","Phone *","text"],
          ["dob","Date of Birth *","date"],["emergency_contact","Emergency Contact","text"]].map(([name,label,type]) => (
          <div key={name}>
            <label style={lbl}>{label}</label>
            <input name={name} type={type} value={form[name]} onChange={handle} style={inp} />
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
        <div>
          <label style={lbl}>Blood Group</label>
          <select name="blood_group" value={form.blood_group} onChange={handle} style={inp}>
            <option value="">-- Select --</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <label style={lbl}>Address</label>
          <input name="address" value={form.address} onChange={handle} style={inp} placeholder="Full address..." />
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 16, alignItems: "center" }}>
        <button onClick={submit} disabled={loading} style={{ padding: "12px 32px", background: loading ? "#90a4ae" : "#1565c0", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
          {loading ? "Registering..." : "➕ Register Patient"}
        </button>
        {msg && <div style={{ padding: "10px 16px", borderRadius: 8, background: msg.type === "success" ? "#e8f5e9" : "#ffebee", color: msg.type === "success" ? "#2e7d32" : "#c62828" }}>{msg.text}</div>}
      </div>
      <PatientList />
    </div>
  );
}

// ── RECEPTIONIST PATIENT LIST ────────────────────────
function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/patients/")
      .then(r => setPatients(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    (p.first_name + " " + p.last_name + p.phone + (p.email||""))
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background:"white", borderRadius:12, padding:24, boxShadow:"0 2px 12px #0001", marginTop:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h3 style={{ margin:0, color:"#1565c0" }}>Registered Patients ({patients.length})</h3>
        <input
          placeholder="Search name, phone, email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:"8px 14px", borderRadius:8, border:"1px solid #ddd", fontSize:13, width:240 }}
        />
      </div>
      {loading ? <div style={{ textAlign:"center", color:"#aaa", padding:20 }}>Loading...</div> : (
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#1565c0", color:"white" }}>
              {["ID","Name","DOB","Gender","Blood Group","Phone","Email","Registered"].map(h => (
                <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.patient_id} style={{ background: i%2===0?"#fafafa":"white", borderBottom:"1px solid #f0f0f0" }}>
                <td style={{ padding:"9px 12px", fontSize:13, fontWeight:700, color:"#1565c0" }}>#{p.patient_id}</td>
                <td style={{ padding:"9px 12px", fontSize:13, fontWeight:600 }}>{p.first_name} {p.last_name}</td>
                <td style={{ padding:"9px 12px", fontSize:13 }}>{p.dob}</td>
                <td style={{ padding:"9px 12px", fontSize:13 }}>{p.gender === "M" ? "Male" : p.gender === "F" ? "Female" : "Other"}</td>
                <td style={{ padding:"9px 12px", fontSize:13 }}>{p.blood_group || "—"}</td>
                <td style={{ padding:"9px 12px", fontSize:13 }}>{p.phone}</td>
                <td style={{ padding:"9px 12px", fontSize:13 }}>{p.email || "—"}</td>
                <td style={{ padding:"9px 12px", fontSize:13 }}>{p.registration_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:"center", color:"#aaa", padding:20 }}>No patients found</div>
      )}
    </div>
  );
}

// ── NURSE / LAB TECH VIEW ────────────────────────────
function NurseLabView({ staff }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/appointments/")
      .then(r => setAppointments(r.data))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { SCHEDULED: "#1565c0", COMPLETED: "#2e7d32", CANCELLED: "#c62828" };
  const statusBg = { SCHEDULED: "#e3f2fd", COMPLETED: "#e8f5e9", CANCELLED: "#ffebee" };
  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter(a => a.appt_date === today);
  const scheduled = appointments.filter(a => a.status === "SCHEDULED");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          ["📅 Today's Appointments", todayAppts.length, "#1565c0"],
          ["🔔 Scheduled", scheduled.length, "#e65100"],
          ["✅ Completed", appointments.filter(a => a.status === "COMPLETED").length, "#2e7d32"]
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px #0001", borderLeft: `4px solid ${color}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px #0001", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, color: "#1a237e" }}>All Appointments</h3>
          <span style={{ fontSize: 13, color: "#888" }}>{staff.icon} {staff.role} view</span>
        </div>
        {loading ? <div style={{ padding: 32, textAlign: "center", color: "#aaa" }}>Loading...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1a237e", color: "white" }}>
                {["#","Patient","Doctor","Department","Date","Time","Reason","Status"].map(h => (
                  <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={a.appt_id} style={{ background: i % 2 === 0 ? "#fafafa" : "white", borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1565c0", fontSize: 13 }}>#{a.appt_id}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{a.patient_name}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>Dr. {a.doctor_name}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>{a.dept_name || "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>{a.appt_date}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>{a.appt_time || "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>{a.reason || "General"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: statusBg[a.status] || "#f5f5f5", color: statusColor[a.status] || "#333" }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && appointments.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#aaa" }}>No appointments found</div>}
      </div>
    </div>
  );
}

// ── ACCOUNTANT VIEW ──────────────────────────────────
function AccountantView() {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/billing/all").then(r => setBills(r.data));
    axios.get("http://localhost:5000/api/billing/revenue").then(r => setSummary(r.data));
  }, []);

  const statusColor = { PAID: "#2e7d32", PENDING: "#e65100", PARTIAL: "#1565c0" };
  const statusBg = { PAID: "#e8f5e9", PENDING: "#fff3e0", PARTIAL: "#e3f2fd" };

  return (
    <div>
      <h3 style={{ margin: "0 0 20px", color: "#1a237e" }}>💰 Billing & Revenue</h3>

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
          {[
            ["Total Billed", `Rs.${summary.total_billed?.toFixed(0)}`, "#1565c0", "📊"],
            ["Total Collected", `Rs.${summary.total_collected?.toFixed(0)}`, "#2e7d32", "💰"],
            ["Pending Dues", `Rs.${summary.total_pending?.toFixed(0)}`, "#e65100", "⏳"],
            ["Bills Paid", summary.paid_count, "#2e7d32", "✅"],
            ["Bills Pending", summary.pending_count, "#e65100", "🔔"],
          ].map(([label, val, color, icon]) => (
            <div key={label} style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px #0001", borderLeft: `4px solid ${color}` }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 12px #0001", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <h3 style={{ margin: 0, color: "#1a237e" }}>All Bills</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a237e", color: "white" }}>
              {["Bill #","Patient","Date","Fee","Tax","Discount","Total","Paid","Remaining","Status"].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bills.map((b, i) => {
              const remaining = b.total_amount - b.amount_paid;
              return (
                <tr key={b.bill_id} style={{ background: i % 2 === 0 ? "#fafafa" : "white", borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1565c0", fontSize: 13 }}>#{b.bill_id}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.patient_name}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.bill_date}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>Rs.{b.consultation_fee}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>Rs.{b.tax_amount}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13 }}>Rs.{b.discount_amount}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 13 }}>Rs.{b.total_amount}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>Rs.{b.amount_paid}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: remaining > 0 ? "#e65100" : "#2e7d32", fontWeight: 600 }}>Rs.{remaining}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: statusBg[b.payment_status], color: statusColor[b.payment_status] }}>
                      {b.payment_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {bills.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#aaa" }}>No bills found</div>}
      </div>
    </div>
  );
}
