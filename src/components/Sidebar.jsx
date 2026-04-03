import { CATEGORY_COLORS } from "../data";

const NAV = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "transactions", label: "Transactions", icon: "↕" },
  { id: "budget", label: "Budget", icon: "◎" },
  { id: "insights", label: "Insights", icon: "◈" },
];

export default function Sidebar({ tab, setTab, role, setRole, dark, setDark }) {
  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)", display: "flex",
      flexDirection: "column", padding: "1.5rem 0", flexShrink: 0,
      position: "sticky", top: 0, height: "100vh", overflowY: "auto"
    }}>
      {/* Logo */}
      <div style={{ padding: "0 1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4f8ef7,#9c6fef)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>F</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>FinTrack</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2 }}>DASHBOARD</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: "1rem 0.75rem", flex: 1 }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, padding: "0 0.5rem", marginBottom: 8 }}>NAVIGATION</div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8, border: "none",
            background: tab === n.id ? "linear-gradient(135deg,rgba(79,142,247,0.2),rgba(156,111,239,0.2))" : "transparent",
            color: tab === n.id ? "var(--accent-blue)" : "var(--text-secondary)",
            fontSize: 14, fontWeight: tab === n.id ? 600 : 400,
            marginBottom: 2, cursor: "pointer", textAlign: "left",
            borderLeft: tab === n.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
            transition: "all 0.2s"
          }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* Role + Dark */}
      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2, marginBottom: 6 }}>ROLE</div>
          <select value={role} onChange={e => setRole(e.target.value)} style={{
            width: "100%", padding: "7px 10px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--bg-card)",
            color: "var(--text-primary)", fontSize: 13
          }}>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <button onClick={() => setDark(d => !d)} style={{
          display: "flex", alignItems: "center", gap: 8, background: "none",
          border: "none", color: "var(--text-secondary)", fontSize: 13, padding: 0
        }}>
          <span>{dark ? "☀" : "☾"}</span>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
}