import { useState } from "react";
import axios from "axios";
import Patients from "./Patients";
import RegisterPatient from "./RegisterPatient";
import Appointments from "./Appointments";
import BookAppointment from "./BookAppointment";
import CompleteAppointment from "./CompleteAppointment";
import Prescriptions from "./Prescriptions";
import Billing from "./Billing";
import MakePayment from "./MakePayment";
import RevenueChart from "./RevenueChart";
import Invoice from "./Invoice";
import Doctors from "./Doctors";
import AddDoctor from "./AddDoctor";
import StaffList from "./StaffList";
import AddStaff from "./AddStaff";
import Departments from "./Departments";

const ADMIN_TABS = [
  { id:"patients",      label:"Patients",       icon:"👥" },
  { id:"register",      label:"Add Patient",    icon:"➕" },
  { id:"appointments",  label:"Appointments",   icon:"📅" },
  { id:"book",          label:"Book Visit",     icon:"🗓" },
  { id:"complete",      label:"Complete Visit", icon:"✅" },
  { id:"prescriptions", label:"Prescriptions",  icon:"💊" },
  { id:"billing",       label:"Billing",        icon:"🧾" },
  { id:"payment",       label:"Make Payment",   icon:"💳" },
  { id:"revenue",       label:"Revenue",        icon:"📊" },
  { id:"invoice",       label:"Invoice",        icon:"🧾" },
  { id:"doctors",       label:"Doctors",        icon:"🩺" },
  { id:"adddoctor",     label:"Add Doctor",     icon:"👨‍⚕️" },
  { id:"staff",         label:"Staff",          icon:"👥" },
  { id:"addstaff",      label:"Add Staff",      icon:"➕" },
  { id:"departments",   label:"Departments",    icon:"🏢" },
];

export default function AdminPortal({ onLogout }) {
  const [admin, setAdmin] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState("patients");

  const login = async () => {
    if (!loginForm.username || !loginForm.password) { setLoginError("Enter credentials."); return; }
    setLoginLoading(true); setLoginError("");
    try {
      const res = await axios.post("http://localhost:5000/api/staff/login", loginForm);
      if (res.data.role !== "Admin") {
        setLoginError("This portal is for Admins only. Use Staff Portal for other roles.");
        return;
      }
      setAdmin(res.data);
    } catch (e) {
      setLoginError(e.response?.data?.error || "Invalid credentials");
    } finally { setLoginLoading(false); }
  };

  const logout = () => { setAdmin(null); setLoginForm({ username: "", password: "" }); setTab("patients"); if(onLogout) onLogout(); };

  const inp = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, width: "100%", boxSizing: "border-box" };

  if (!admin) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
      <div style={{ background: "white", borderRadius: 16, padding: 40, boxShadow: "0 4px 24px #0002", width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🛡️</div>
          <h2 style={{ margin: 0, color: "#1a237e" }}>Admin Login</h2>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 13 }}>Full system access — manage everything</p>
          <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["Patients","Doctors","Staff","Billing","Departments","Reports"].map(f => (
              <span key={f} style={{ background: "#e8f5e9", color: "#2e7d32", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>✅ {f}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Admin Username</label>
            <input value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
              style={inp} placeholder="admin" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Password</label>
            <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              style={inp} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
        </div>

        {loginError && <div style={{ marginTop: 12, padding: "10px 14px", background: "#ffebee", color: "#c62828", borderRadius: 8, fontSize: 13 }}>❌ {loginError}</div>}

        <button onClick={login} disabled={loginLoading} style={{ marginTop: 18, width: "100%", padding: 13, background: loginLoading ? "#90a4ae" : "#b71c1c", color: "white", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {loginLoading ? "Logging in..." : "🛡️ Admin Login →"}
        </button>
        <div style={{ marginTop: 14, padding: 10, background: "#fff3e0", borderRadius: 8, fontSize: 11, color: "#e65100" }}>
          ⚠️ Admin credentials: <strong>admin / admin123</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ margin: "-28px -32px" }}>
      {/* Admin header bar */}
      <div style={{ background: "linear-gradient(135deg,#b71c1c,#c62828)", color: "white", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Admin Panel — {admin.first_name} {admin.last_name}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Full system access</div>
          </div>
        </div>
        <button onClick={logout} style={{ padding: "6px 16px", background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
          Logout
        </button>
      </div>

      {/* Admin tabs */}
      <div style={{ background: "white", borderBottom: "1px solid #e0e0e0", padding: "0 16px", display: "flex", overflowX: "auto", boxShadow: "0 2px 6px #0001" }}>
        {ADMIN_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "12px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", color: tab === t.id ? "#b71c1c" : "#666", borderBottom: tab === t.id ? "3px solid #b71c1c" : "3px solid transparent" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "28px 32px" }}>
        {tab === "patients"      && <Patients />}
        {tab === "register"      && <RegisterPatient onSuccess={() => setTab("patients")} />}
        {tab === "appointments"  && <Appointments />}
        {tab === "book"          && <BookAppointment onSuccess={() => setTab("appointments")} />}
        {tab === "complete"      && <CompleteAppointment />}
        {tab === "prescriptions" && <Prescriptions />}
        {tab === "billing"       && <Billing />}
        {tab === "payment"       && <MakePayment />}
        {tab === "revenue"       && <RevenueChart />}
        {tab === "invoice"       && <Invoice />}
        {tab === "doctors"       && <Doctors />}
        {tab === "adddoctor"     && <AddDoctor onSuccess={() => setTab("doctors")} />}
        {tab === "staff"         && <StaffList />}
        {tab === "addstaff"      && <AddStaff onSuccess={() => setTab("staff")} />}
        {tab === "departments"   && <Departments />}
      </div>
    </div>
  );
}
