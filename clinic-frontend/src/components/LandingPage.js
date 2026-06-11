export default function LandingPage({ onSelect }) {
  const cards = [
    {
      id: "admin",
      icon: "🛡️",
      title: "Admin",
      desc: "Full system access — manage doctors, staff, departments, billing and reports",
      color: "#b71c1c",
      bg: "linear-gradient(135deg,#b71c1c,#c62828)",
      features: ["All Patients & Doctors","Staff Management","Billing & Revenue","Departments","Full Reports"]
    },
    {
      id: "doctor",
      icon: "🩺",
      title: "Doctor",
      desc: "Access your appointments, write prescriptions and view your patients",
      color: "#1565c0",
      bg: "linear-gradient(135deg,#1565c0,#1976d2)",
      features: ["My Appointments","Write Prescriptions","My Prescription History","View Departments","My Patients"]
    },
    {
      id: "staff",
      icon: "👩‍💼",
      title: "Staff",
      desc: "Role-based access — Receptionist, Nurse, Lab Tech or Accountant dashboard",
      color: "#7b1fa2",
      bg: "linear-gradient(135deg,#7b1fa2,#8e24aa)",
      features: ["Receptionist: Register Patients","Nurse/Lab Tech: View Appointments","Accountant: Billing & Revenue","Role auto-detected on login"]
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e8eaf6,#e3f2fd)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏥</div>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: "#1a237e" }}>Clinic Management System</h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, color: "#666" }}>Oracle · Flask · React — Please select your portal to continue</p>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28, maxWidth: 1000, width: "100%" }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => onSelect(card.id)}
            style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px #0002", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px #0003"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px #0002"; }}>

            {/* Card header */}
            <div style={{ background: card.bg, padding: "28px 24px", textAlign: "center", color: "white" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{card.icon}</div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{card.title} Portal</h2>
              <p style={{ margin: "8px 0 0", fontSize: 13, opacity: 0.85 }}>{card.desc}</p>
            </div>

            {/* Features */}
            <div style={{ padding: "20px 24px" }}>
              {card.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 13, color: "#444" }}>
                  <span style={{ color: card.color, fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
              <button style={{ marginTop: 20, width: "100%", padding: "12px", background: card.bg, color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Login as {card.title} →
              </button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 32, fontSize: 12, color: "#aaa" }}>Clinic Management System · Built with Oracle DB, Flask & React</p>
    </div>
  );
}
