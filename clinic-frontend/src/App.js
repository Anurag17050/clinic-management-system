import { useState } from "react";
import LandingPage from "./components/LandingPage";
import AdminPortal from "./components/AdminPortal";
import DoctorPortal from "./components/DoctorPortal";
import StaffPortal from "./components/StaffPortal";

export default function App() {
  const [portal, setPortal] = useState(null); // null | 'admin' | 'doctor' | 'staff'

  const handleLogout = () => setPortal(null);

  if (!portal) return <LandingPage onSelect={setPortal} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Top bar with back button */}
      <div style={{ background: "linear-gradient(135deg,#1a237e,#1565c0)", color: "white", padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 4px 12px #0003" }}>
        <button onClick={handleLogout} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          ← Back
        </button>
        <div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>🏥 Clinic Management System</span>
          <span style={{ marginLeft: 16, fontSize: 12, opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>
            {portal === "admin" ? "🛡️ Admin Portal" : portal === "doctor" ? "🩺 Doctor Portal" : "👩‍💼 Staff Portal"}
          </span>
        </div>
      </div>

      {/* Portal content */}
      <div style={{ padding: "28px 32px", maxWidth: 1300, margin: "0 auto" }}>
        {portal === "admin"  && <AdminPortal  onLogout={handleLogout} />}
        {portal === "doctor" && <DoctorPortal onLogout={handleLogout} />}
        {portal === "staff"  && <StaffPortal  onLogout={handleLogout} />}
      </div>
    </div>
  );
}
