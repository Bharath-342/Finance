import { useState, useEffect } from "react";

const NAV = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "transactions", label: "Transactions", icon: "↕" },
  { id: "budget", label: "Budget", icon: "◎" },
  { id: "insights", label: "Insights", icon: "◈" },
];

export default function Sidebar({ tab, setTab, role, setRole, dark, setDark }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // Close sidebar when tab changes on mobile
  const handleNav = (id) => {
    setTab(id);
    if (isMobile) setMobileOpen(false);
  };

  const sidebarContent = (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "1.25rem 0",
    }}>
      {/* Logo */}
      <div style={{
        padding: "0 1.25rem 1.25rem",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg,#4f8ef7,#9c6fef)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>F</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>FinTrack</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 2 }}>DASHBOARD</div>
          </div>
        </div>
        {/* Close button — mobile only */}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} style={{
            background: "none", border: "none", color: "var(--text-secondary)",
            fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 4px",
          }}>×</button>
        )}
      </div>

      {/* Nav links */}
      <div style={{ padding: "1rem 0.75rem", flex: 1 }}>
        <div style={{
          fontSize: 10, color: "var(--text-muted)",
          letterSpacing: 2, padding: "0 0.5rem", marginBottom: 8,
        }}>NAVIGATION</div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => handleNav(n.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "11px 14px", borderRadius: 8, border: "none",
            background: tab === n.id
              ? "linear-gradient(135deg,rgba(79,142,247,0.2),rgba(156,111,239,0.2))"
              : "transparent",
            color: tab === n.id ? "var(--accent-blue)" : "var(--text-secondary)",
            fontSize: 14, fontWeight: tab === n.id ? 600 : 400,
            marginBottom: 4, cursor: "pointer", textAlign: "left",
            borderLeft: tab === n.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* Role + Dark mode */}
      <div style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid var(--border)",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div>
          <div style={{
            fontSize: 10, color: "var(--text-muted)",
            letterSpacing: 2, marginBottom: 6,
          }}>ROLE</div>
          <select value={role} onChange={e => setRole(e.target.value)} style={{
            width: "100%", padding: "8px 10px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--bg-card)",
            color: "var(--text-primary)", fontSize: 13, cursor: "pointer",
          }}>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <button onClick={() => setDark(d => !d)} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none",
          color: "var(--text-secondary)", fontSize: 13,
          padding: 0, cursor: "pointer",
        }}>
          <span>{dark ? "☀" : "☾"}</span>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );

  // MOBILE layout
  if (isMobile) {
    return (
      <>
        {/* Top navbar */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
          height: 56, background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 1rem",
        }}>
          {/* Hamburger */}
          <button onClick={() => setMobileOpen(true)} style={{
            background: "none", border: "none",
            color: "var(--text-primary)", fontSize: 22,
            cursor: "pointer", padding: "4px 6px", lineHeight: 1,
          }}>☰</button>

          {/* Logo center */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg,#4f8ef7,#9c6fef)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#fff",
            }}>F</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>FinTrack</span>
          </div>

          {/* Dark mode toggle */}
          <button onClick={() => setDark(d => !d)} style={{
            background: "none", border: "none",
            color: "var(--text-secondary)", fontSize: 18,
            cursor: "pointer", padding: "4px 6px",
          }}>{dark ? "☀" : "☾"}</button>
        </div>

        {/* Bottom tab bar */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          height: 60, background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-around",
        }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => handleNav(n.id)} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              padding: "6px 0",
              color: tab === n.id ? "var(--accent-blue)" : "var(--text-muted)",
              borderTop: tab === n.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: tab === n.id ? 600 : 400 }}>{n.label}</span>
            </button>
          ))}
        </div>

        {/* Overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 300,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(2px)",
            }}
          />
        )}

        {/* Slide-in drawer */}
        <div style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 400,
          width: 260, background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          overflowY: "auto",
        }}>
          {sidebarContent}
        </div>
      </>
    );
  }

  // DESKTOP layout
  return (
    <div style={{
      width: 220, minHeight: "100vh",
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, position: "sticky",
      top: 0, height: "100vh", overflowY: "auto",
    }}>
      {sidebarContent}
    </div>
  );
}