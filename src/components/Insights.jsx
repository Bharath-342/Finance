import { useMemo } from "react";
import { CATEGORY_COLORS } from "../data";
import { fmtINR, fmtShort, getMonthLabel } from "../utils";

function InsightCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18, background: `${color}22`, padding: "6px 8px", borderRadius: 8 }}>{icon}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1 }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

export default function Insights({ transactions }) {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const categorySpend = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const k = t.date.slice(0, 7);
      if (!map[k]) map[k] = { income: 0, expense: 0 };
      map[k][t.type] += t.amount;
    });
    return Object.entries(map).sort().map(([k, v]) => ({ label: getMonthLabel(k), key: k, ...v }));
  }, [transactions]);

  const topCat = categorySpend[0];
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const avgIncome = monthlyData.length > 0 ? Math.round(income / monthlyData.length) : 0;
  const mostActive = monthlyData.sort((a, b) => (b.income + b.expense) - (a.income + a.expense))[0];

  const comparison = monthlyData.length >= 2 ? {
    prev: monthlyData[monthlyData.length - 2],
    last: monthlyData[monthlyData.length - 1],
  } : null;

  const compDiff = comparison ? comparison.last.expense - comparison.prev.expense : 0;
  const compPct = comparison && comparison.prev.expense > 0 ? Math.round((compDiff / comparison.prev.expense) * 100) : 0;

  const lastMonthIncome = monthlyData[monthlyData.length - 1]?.income || 0;
  const lastMonthExpense = monthlyData[monthlyData.length - 1]?.expense || 0;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Financial Insights</h2>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Patterns and observations from your data</div>
      </div>

      {transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>No data to analyze yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Add transactions to see insights</div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
            <InsightCard label="TOP SPENDING CATEGORY" value={topCat?.[0] || "—"} sub={topCat ? `${fmtINR(topCat[1])} spent — ${expense > 0 ? Math.round((topCat[1] / expense) * 100) : 0}% of total expenses` : ""} color={topCat ? CATEGORY_COLORS[topCat[0]] || "#888" : "#888"} icon="↓" />
            <InsightCard label="SAVINGS RATE" value={`${savingsRate}%`} sub={savingsRate >= 20 ? "Great! You're saving above the recommended 20% threshold." : "Try to save at least 20% of your income."} color={savingsRate >= 20 ? "var(--income)" : "var(--accent-amber)"} icon="◎" />
            <InsightCard label="MONTH-ON-MONTH EXPENSES" value={comparison ? `${compDiff > 0 ? "+" : ""}${compPct}%` : "—"} sub={comparison ? `Spending ${compDiff > 0 ? "rose" : "fell"} vs ${comparison.prev.label}. ${compDiff > 0 ? "Review discretionary categories." : "Good job controlling expenses!"}` : "Need at least 2 months of data"} color={compDiff > 0 ? "var(--expense)" : "var(--income)"} icon="↕" />
            <InsightCard label="NET SAVINGS THIS MONTH" value={fmtINR(lastMonthIncome - lastMonthExpense)} sub={`Income ${fmtShort(lastMonthIncome)} minus expenses ${fmtShort(lastMonthExpense)}`} color="var(--accent-blue)" icon="◈" />
            <InsightCard label="MOST ACTIVE MONTH" value={mostActive?.label || "—"} sub="The month with the highest combined income and expense activity." color="var(--accent-purple)" icon="◉" />
            <InsightCard label="AVG MONTHLY INCOME" value={fmtINR(avgIncome)} sub={`Average income across all ${monthlyData.length} recorded months`} color="var(--income)" icon="↑" />
          </div>

          {/* Full Category Breakdown */}
          <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: "1.25rem" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: "1rem" }}>Full Category Breakdown</div>
            {categorySpend.map(([cat, val], i) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, minWidth: 14 }}>{i + 1}</span>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[cat] || "#888" }} />
                    {cat}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: CATEGORY_COLORS[cat] || "#888" }}>{fmtINR(val)}</span>
                </div>
                <div style={{ height: 6, background: "var(--border)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${expense > 0 ? (val / categorySpend[0][1]) * 100 : 0}%`, background: CATEGORY_COLORS[cat] || "#888", borderRadius: 3, transition: "width 0.8s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}