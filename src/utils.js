export function fmtINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtShort(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

export function getMonthLabel(dateStr) {
  return new Date(dateStr + "-01").toLocaleString("en-IN", { month: "short", year: "2-digit" });
}


export function smoothPath(pts) {
  if (pts.length < 2) return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cx = (pts[i][0] + pts[i+1][0]) / 2;
    d += ` C${cx},${pts[i][1]} ${cx},${pts[i+1][1]} ${pts[i+1][0]},${pts[i+1][1]}`;
  }
  return d;
}