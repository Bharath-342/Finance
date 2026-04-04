import { useMemo, useState, useEffect, useRef } from "react";
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

function TrendChart({ monthlyData }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const animRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    setProgress(0);
    const duration = 1400;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setProgress(ease);
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [visible]);

  const W = 640, H = 260, PAD_L = 64, PAD_R = 24, PAD_T = 20, PAD_B = 48;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const baseline = PAD_T + chartH;

  const maxVal = Math.max(...monthlyData.flatMap(d => [d.income, d.expense]), 1);

  const xs = monthlyData.map((_, i) =>
    PAD_L + (i / Math.max(monthlyData.length - 1, 1)) * chartW
  );
  const iy = (d) => PAD_T + chartH - (d.income / maxVal) * chartH;
  const ey = (d) => PAD_T + chartH - (d.expense / maxVal) * chartH;

  const animatedData = monthlyData.map(d => ({
    ...d,
    income: d.income * progress,
    expense: d.expense * progress,
  }));

  const ipts = animatedData.map((d, i) => [xs[i], iy(d)]);
  const epts = animatedData.map((d, i) => [xs[i], ey(d)]);
  const realIpts = monthlyData.map((d, i) => [xs[i], iy(d)]);
  const realEpts = monthlyData.map((d, i) => [xs[i], ey(d)]);

  const smoothPath = (pts) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i][0] + pts[i + 1][0]) / 2;
      d += ` C${cx},${pts[i][1]} ${cx},${pts[i + 1][1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
    }
    return d;
  };

  const areaPath = (pts) => {
    const line = smoothPath(pts);
    if (!line) return "";
    return `${line} L${pts[pts.length - 1][0]},${baseline} L${pts[0][0]},${baseline} Z`;
  };

  const incomeAlwaysHigher = monthlyData.every(d => d.income >= d.expense);
  const trend = monthlyData.length >= 2
    ? monthlyData[monthlyData.length - 1].income - monthlyData[monthlyData.length - 1].expense >
      monthlyData[0].income - monthlyData[0].expense
      ? "improving" : "declining"
    : "stable";

  const observation = incomeAlwaysHigher
    ? `Income is always higher than expenses — you are in great financial shape!`
    : trend === "improving"
    ? "The gap between income and expenses is growing — you are saving more each month!"
    : "Expenses are rising close to income — try cutting back on non-essential spending.";

  const obsColor = incomeAlwaysHigher ? "#1de9b6" : trend === "improving" ? "#4f8ef7" : "#f06292";
  const obsIcon = incomeAlwaysHigher ? "✓" : trend === "improving" ? "↑" : "⚠";

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const totalIncome = monthlyData.reduce((s, d) => s + d.income, 0);
  const totalExpense = monthlyData.reduce((s, d) => s + d.expense, 0);
  const saved = totalIncome - totalExpense;

  return (
    <div
      ref={containerRef}
      style={{
        background: "#0e1628",
        borderRadius: 16,
        border: "1px solid #1e2d45",
        padding: "1.5rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: "1.25rem" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf6", marginBottom: 3 }}>Monthly Cash Flow</div>
          <div style={{ fontSize: 12, color: "#4a6a7a" }}>How much you earned vs spent each month</div>
        </div>
        {/* Summary pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ background: "rgba(29,233,182,0.1)", border: "1px solid rgba(29,233,182,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>
            <span style={{ color: "#4a6a7a" }}>Earned </span>
            <span style={{ color: "#1de9b6", fontWeight: 700 }}>{fmtINR(totalIncome)}</span>
          </div>
          <div style={{ background: "rgba(240,98,146,0.1)", border: "1px solid rgba(240,98,146,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>
            <span style={{ color: "#4a6a7a" }}>Spent </span>
            <span style={{ color: "#f06292", fontWeight: 700 }}>{fmtINR(totalExpense)}</span>
          </div>
          <div style={{ background: saved >= 0 ? "rgba(79,142,247,0.1)" : "rgba(240,98,146,0.1)", border: `1px solid ${saved >= 0 ? "rgba(79,142,247,0.25)" : "rgba(240,98,146,0.25)"}`, borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>
            <span style={{ color: "#4a6a7a" }}>Saved </span>
            <span style={{ color: saved >= 0 ? "#4f8ef7" : "#f06292", fontWeight: 700 }}>{fmtINR(Math.abs(saved))}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ overflowX: "auto", position: "relative" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", minWidth: 300, height: "auto", display: "block" }}
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id="ig3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1de9b6" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#0d7a5f" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#081a12" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="eg3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f06292" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#f06292" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Dark chart bg */}
          <rect x={PAD_L} y={PAD_T} width={chartW} height={chartH} fill="#080f1a" rx={6} />

          {/* Grid lines + y labels */}
          {yTicks.map(p => {
            const y = PAD_T + chartH - p * chartH;
            return (
              <g key={p}>
                <line
                  x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                  stroke="#1a2a3a" strokeWidth={0.8}
                  strokeDasharray={p === 0 ? "0" : "4,4"}
                />
                <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#3a5a6a" fontWeight={500}>
                  {p === 0 ? "₹0" : fmtShort(maxVal * p)}
                </text>
              </g>
            );
          })}

          {/* Vertical month separators */}
          {monthlyData.map((_, i) => i > 0 && (
            <line key={i} x1={xs[i]} y1={PAD_T} x2={xs[i]} y2={baseline} stroke="#1a2a3a" strokeWidth={0.5} strokeDasharray="2,4" />
          ))}

          {/* Area fills */}
          <path d={areaPath(ipts)} fill="url(#ig3)" />
          <path d={areaPath(epts)} fill="url(#eg3)" />

          {/* Lines */}
          <path d={smoothPath(ipts)} fill="none" stroke="#1de9b6" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          <path d={smoothPath(epts)} fill="none" stroke="#f06292" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* "YOU SAVED" label between lines for last month */}
          {progress > 0.95 && monthlyData.length >= 2 && (() => {
            const last = monthlyData.length - 1;
            const midY = (realIpts[last][1] + realEpts[last][1]) / 2;
            const gap = realIpts[last][1] - realEpts[last][1];
            if (Math.abs(gap) < 18) return null;
            return (
              <g>
                <line x1={xs[last] - 18} y1={realIpts[last][1]} x2={xs[last] - 18} y2={realEpts[last][1]} stroke="#ffffff20" strokeWidth={1} />
                <text x={xs[last] - 22} y={midY + 4} textAnchor="end" fontSize={9} fill="#ffffffaa" fontWeight={600}>GAP</text>
              </g>
            );
          })()}

          {/* Hover zones */}
          {monthlyData.map((d, i) => (
            <rect
              key={i}
              x={i === 0 ? PAD_L : (xs[i - 1] + xs[i]) / 2}
              y={PAD_T}
              width={i === 0
                ? (xs[1] ? (xs[0] + xs[1]) / 2 - PAD_L : chartW)
                : i === monthlyData.length - 1
                  ? W - PAD_R - (xs[i - 1] + xs[i]) / 2
                  : (xs[i + 1] - xs[i - 1]) / 2}
              height={chartH}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setTooltip({ i, x: xs[i], d })}
            />
          ))}

          {/* Tooltip crosshair + dots */}
          {tooltip && progress > 0.5 && (
            <g>
              <line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={baseline} stroke="#ffffff18" strokeWidth={1.5} strokeDasharray="3,3" />
              <circle cx={tooltip.x} cy={realIpts[tooltip.i][1]} r={6} fill="#1de9b6" stroke="#0e1628" strokeWidth={2.5} />
              <circle cx={tooltip.x} cy={realEpts[tooltip.i][1]} r={6} fill="#f06292" stroke="#0e1628" strokeWidth={2.5} />
            </g>
          )}

          {/* X axis month labels with background pill */}
          {monthlyData.map((d, i) => (
            <g key={i}>
              <rect x={xs[i] - 20} y={H - PAD_B + 10} width={40} height={16} rx={8} fill={tooltip?.i === i ? "#1a2d4a" : "transparent"} />
              <text x={xs[i]} y={H - PAD_B + 22} textAnchor="middle" fontSize={10} fill={tooltip?.i === i ? "#e8eaf6" : "#4a6a7a"} fontWeight={tooltip?.i === i ? 700 : 400}>
                {d.label}
              </text>
            </g>
          ))}

          {/* Line end labels */}
          {progress > 0.95 && monthlyData.length > 0 && (() => {
            const last = monthlyData.length - 1;
            return (
              <g>
                <text x={xs[last] + 6} y={realIpts[last][1] + 4} fontSize={9} fill="#1de9b6" fontWeight={700}>Income</text>
                <text x={xs[last] + 6} y={realEpts[last][1] + 4} fontSize={9} fill="#f06292" fontWeight={700}>Expense</text>
              </g>
            );
          })()}
        </svg>

        {/* Floating tooltip card */}
        {tooltip && (() => {
          const svgEl = containerRef.current?.querySelector("svg");
          if (!svgEl) return null;
          const svgRect = svgEl.getBoundingClientRect();
          const scaleX = svgRect.width / W;
          const leftPx = tooltip.x * scaleX;
          const alignRight = leftPx > svgRect.width * 0.6;
          const saved = tooltip.d.income - tooltip.d.expense;
          return (
            <div style={{
              position: "absolute",
              top: 12,
              left: alignRight ? "auto" : leftPx + 14,
              right: alignRight ? svgRect.width - leftPx + 14 : "auto",
              background: "#111d30",
              border: "1px solid #2a3d5a",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              pointerEvents: "none",
              zIndex: 10,
              minWidth: 160,
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}>
              {/* Month label */}
              <div style={{ fontWeight: 700, fontSize: 13, color: "#e8eaf6", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #1e2d45" }}>
                {tooltip.d.label}
              </div>
              {/* Income row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#1de9b6", flexShrink: 0 }} />
                  <span style={{ color: "#6a8a9a" }}>Earned</span>
                </div>
                <span style={{ fontWeight: 700, color: "#1de9b6" }}>{fmtINR(tooltip.d.income)}</span>
              </div>
              {/* Expense row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "#f06292", flexShrink: 0 }} />
                  <span style={{ color: "#6a8a9a" }}>Spent</span>
                </div>
                <span style={{ fontWeight: 700, color: "#f06292" }}>{fmtINR(tooltip.d.expense)}</span>
              </div>
              {/* Saved row */}
              <div style={{ borderTop: "1px solid #1e2d45", paddingTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#6a8a9a" }}>{saved >= 0 ? "Saved" : "Overspent"}</span>
                <span style={{ fontWeight: 700, color: saved >= 0 ? "#4f8ef7" : "#f06292" }}>{fmtINR(Math.abs(saved))}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
        {[
          { label: "Money Earned", color: "#1de9b6" },
          { label: "Money Spent", color: "#f06292" }
        ].map(l => (
          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6a8a9a" }}>
            <span style={{ width: 24, height: 3, background: l.color, borderRadius: 2 }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Observation banner */}
      <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: `${obsColor}0f`, border: `1px solid ${obsColor}30`, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{obsIcon}</span>
        <div style={{ fontSize: 13, color: "#a0b4c0", lineHeight: 1.6 }}>{observation}</div>
      </div>
    </div>
  );
}

export default function Insights({ transactions }) {
  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const categorySpend = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const k = t.date.slice(0, 7);
      if (!map[k]) map[k] = { income: 0, expense: 0 };
      map[k][t.type] += t.amount;
    });
    const currentMonth = new Date().toISOString().slice(0, 7);
    return Object.entries(map)
      .filter(([k]) => k < currentMonth)
      .sort()
      .map(([k, v]) => ({ label: getMonthLabel(k), key: k, ...v }));
  }, [transactions]);

  const topCat = categorySpend[0];
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  const avgIncome = monthlyData.length > 0 ? Math.round(income / monthlyData.length) : 0;
  const mostActive = [...monthlyData].sort((a, b) => (b.income + b.expense) - (a.income + a.expense))[0];

  const comparison = monthlyData.length >= 2 ? {
    prev: monthlyData[monthlyData.length - 2],
    last: monthlyData[monthlyData.length - 1],
  } : null;

  const compDiff = comparison ? comparison.last.expense - comparison.prev.expense : 0;
  const compPct = comparison && comparison.prev.expense > 0
    ? Math.round((compDiff / comparison.prev.expense) * 100) : 0;

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

          {monthlyData.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <TrendChart monthlyData={monthlyData} />
            </div>
          )}

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
                  <div style={{
                    height: "100%",
                    width: `${categorySpend[0][1] > 0 ? (val / categorySpend[0][1]) * 100 : 0}%`,
                    background: CATEGORY_COLORS[cat] || "#888",
                    borderRadius: 3,
                    transition: "width 0.8s ease"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}