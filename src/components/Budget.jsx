import { useMemo } from "react";
import { CATEGORY_COLORS } from "../data";
import { fmtINR } from "../utils";

export default function Budget({ budgets, setBudgets, transactions, isAdmin }) {
  const expenseByCategory = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [transactions]);

  const categories = Object.keys(budgets);

  const inpStyle = { padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13, width: 110, textAlign: "right" };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Budget Planner</h2>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {isAdmin ? "Set monthly limits per category and track actual spending." : "Monthly budget limits set by admin."}
        </div>
      </div>

      {categories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◎</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>No budgets set yet</div>
          {isAdmin && <div style={{ fontSize: 13, marginTop: 6 }}>Add spending categories to get started</div>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {categories.map(cat => {
            const budget = budgets[cat];
            const spent = expenseByCategory[cat] || 0;
            const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            const over = spent > budget;
            const color = CATEGORY_COLORS[cat] || "#888";
            const remaining = budget - spent;

            return (
              <div key={cat} style={{ background: "var(--bg-card)", borderRadius: 14, border: `1px solid ${over ? "rgba(240,98,146,0.3)" : "var(--border)"}`, padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{cat}</span>
                    {over && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(240,98,146,0.2)", color: "var(--expense)", fontWeight: 600 }}>OVER BUDGET</span>}
                  </div>
                  {isAdmin ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Limit ₹</span>
                      <input type="number" min="0" value={budget} onChange={e => setBudgets(b => ({ ...b, [cat]: parseFloat(e.target.value) || 0 }))} style={inpStyle} />
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Limit: {fmtINR(budget)}</span>
                  )}
                </div>

                <div style={{ height: 8, background: "var(--border)", borderRadius: 4, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: over ? "var(--expense)" : color, borderRadius: 4, transition: "width 0.8s ease" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, flexWrap: "wrap", gap: 4 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Spent: <strong style={{ color: over ? "var(--expense)" : "var(--text-primary)" }}>{fmtINR(spent)}</strong></span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {over
                      ? <span style={{ color: "var(--expense)", fontWeight: 600 }}>Over by {fmtINR(Math.abs(remaining))}</span>
                      : <>Remaining: <strong style={{ color: "var(--income)" }}>{fmtINR(remaining)}</strong></>
                    }
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{Math.round(pct)}% used</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}