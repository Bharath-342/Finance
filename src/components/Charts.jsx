import { useMemo } from "react";
import { CATEGORY_COLORS } from "../data";
import { fmtShort, getMonthLabel } from "../utils";

export function BarChart({ transactions }) {
  const data = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const key = t.date.slice(0, 7);
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      map[key][t.type] += t.amount;
    });
    return Object.entries(map).sort().map(([k, v]) => ({ label: getMonthLabel(k), ...v }));
  }, [transactions]);

  const max = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: "1.25rem" }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Monthly Cash Flow</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: "1rem" }}>Income vs Expense trend</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 160, paddingBottom: 28, position: "relative" }}>
        {[0.25, 0.5, 0.75, 1].map(p => (
          <div key={p} style={{ position: "absolute", left: 0, right: 0, bottom: 28 + p * 132, borderTop: "0.5px dashed var(--border)", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "var(--text-muted)", marginTop: -8, minWidth: 36 }}>{fmtShort(max * p)}</span>
          </div>
        ))}
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, zIndex: 1 }}>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 132 }}>
              <div title={`Income: ${fmtShort(d.income)}`} style={{ width: 16, background: "var(--income)", borderRadius: "3px 3px 0 0", height: `${Math.max(3, (d.income / max) * 132)}px`, transition: "height 0.6s ease", opacity: 0.85 }} />
              <div title={`Expense: ${fmtShort(d.expense)}`} style={{ width: 16, background: "var(--expense)", borderRadius: "3px 3px 0 0", height: `${Math.max(3, (d.expense / max) * 132)}px`, transition: "height 0.6s ease", opacity: 0.85 }} />
            </div>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        {[{ label: "Income", color: "var(--income)" }, { label: "Expense", color: "var(--expense)" }].map(l => (
          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-secondary)" }}>
            <span style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} />{l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ transactions }) {
  const data = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([label, value]) => ({ label, value }));
  }, [transactions]);

  const total = data.reduce((s, d) => s + d.value, 0);
  let cumAngle = -90;
  const r = 68, cx = 85, cy = 85;

  const slices = data.map((d) => {
    const pct = d.value / total;
    const start = cumAngle;
    const end = cumAngle + pct * 360;
    cumAngle = end;
    const s = (start * Math.PI) / 180;
    const e = (end * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    return { ...d, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${pct > 0.5 ? 1 : 0},1 ${x2},${y2} Z`, pct, color: CATEGORY_COLORS[d.label] || "#888" };
  });

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: "1.25rem" }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Spending Breakdown</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: "1rem" }}>By category</div>
      {data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: 13 }}>No expense data yet</div>
      ) : (
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <svg viewBox="0 0 170 170" style={{ width: 150, height: 150, flexShrink: 0 }}>
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill={s.color} stroke="var(--bg-card)" strokeWidth={2}>
                <title>{s.label}: {fmtShort(s.value)} ({(s.pct * 100).toFixed(1)}%)</title>
              </path>
            ))}
            <circle cx={cx} cy={cy} r={40} fill="var(--bg-card)" />
            <text x={cx} y={cy - 5} textAnchor="middle" fontSize={9} fill="#8b8fa8">Total</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fontSize={10} fontWeight={600} fill="#e8eaf6">{fmtShort(total)}</text>
          </svg>
          <div style={{ flex: 1, minWidth: 110 }}>
            {slices.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{(s.pct * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopCategories({ transactions }) {
  const data = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value }));
  }, [transactions]);

  const max = data[0]?.value || 1;

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: "1.25rem" }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: "1rem" }}>Top Spending Categories</div>
      {data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: 13 }}>No expense data yet</div>
      ) : data.map((d, i) => (
        <div key={d.label} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[d.label] || "#888" }} />
              {d.label}
            </span>
            <span style={{ fontWeight: 600, color: CATEGORY_COLORS[d.label] || "#888" }}>{fmtShort(d.value)}</span>
          </div>
          <div style={{ height: 6, background: "var(--border)", borderRadius: 3 }}>
            <div style={{ height: "100%", width: `${(d.value / max) * 100}%`, background: CATEGORY_COLORS[d.label] || "#888", borderRadius: 3, transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}