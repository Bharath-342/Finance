import { useAnimatedNumber } from "../hooks";
import { fmtINR } from "../utils";

function AnimatedCard({ label, value, sub, color, icon }) {
  const animated = useAnimatedNumber(value);
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: 14,
      border: "1px solid var(--border)", padding: "1.25rem",
      display: "flex", flexDirection: "column", gap: 8,
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: 0.5 }}>{label}</span>
        <span style={{ fontSize: 20, background: `${color}22`, padding: "4px 8px", borderRadius: 8 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
        {fmtINR(animated)}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

export default function SummaryCards({ transactions }) {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
      <AnimatedCard label="NET BALANCE" value={balance} color={balance >= 0 ? "var(--income)" : "var(--expense)"} icon="◈" sub={`${transactions.length} total transactions`} />
      <AnimatedCard label="TOTAL INCOME" value={income} color="var(--income)" icon="↑" sub="Salary + Freelance + More" />
      <AnimatedCard label="TOTAL EXPENSE" value={expense} color="var(--expense)" icon="↓" sub="Across all categories" />
      <div style={{
        background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)",
        padding: "1.25rem", display: "flex", flexDirection: "column", gap: 8
      }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, letterSpacing: 0.5 }}>SAVINGS RATE</span>
        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--accent-amber)" }}>{savingsRate}%</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Of total income saved</div>
        <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginTop: 4 }}>
          <div style={{ height: "100%", width: `${Math.min(savingsRate, 100)}%`, background: "var(--accent-amber)", borderRadius: 2, transition: "width 1s ease" }} />
        </div>
      </div>
    </div>
  );
}