import { useState, useMemo } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "../data";
import { fmtINR, fmtDate } from "../utils";

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", padding: "1.5rem", width: "min(480px,90vw)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 20, lineHeight: 1, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TxnForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { date: new Date().toISOString().slice(0, 10), description: "", amount: "", type: "expense", category: "Food & Dining" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box" };
  const lbl = { fontSize: 12, color: "var(--text-secondary)", marginBottom: 5, display: "block", fontWeight: 500 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={lbl}>Description</label>
        <input style={inp} value={form.description} onChange={e => set("description", e.target.value)} placeholder="e.g. Grocery Store" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Amount (₹)</label>
          <input style={inp} type="number" min="0" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={lbl}>Date</label>
          <input style={inp} type="date" value={form.date} onChange={e => set("date", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={lbl}>Type</label>
          <select style={inp} value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Category</label>
          <select style={inp} value={form.category} onChange={e => set("category", e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={onCancel} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "none", color: "var(--text-secondary)", fontSize: 14 }}>Cancel</button>
        <button onClick={() => { if (!form.description || !form.amount) return; onSubmit({ ...form, amount: parseFloat(form.amount), id: form.id || Date.now() }); }}
          style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4f8ef7,#9c6fef)", color: "#fff", fontSize: 14, fontWeight: 600 }}>
          {initial ? "Save Changes" : "Add Transaction"}
        </button>
      </div>
    </div>
  );
}

export default function Transactions({ transactions, setTransactions, isAdmin }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showAdd, setShowAdd] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [deleteTxn, setDeleteTxn] = useState(null);

  const filtered = useMemo(() => {
    let r = [...transactions];
    if (search) r = r.filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== "all") r = r.filter(t => t.type === filterType);
    if (filterCat !== "all") r = r.filter(t => t.category === filterCat);
    r.sort((a, b) => {
      let av = sortKey === "amount" ? parseFloat(a[sortKey]) : a[sortKey];
      let bv = sortKey === "amount" ? parseFloat(b[sortKey]) : b[sortKey];
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return r;
  }, [transactions, search, filterType, filterCat, sortKey, sortDir]);

  const toggleSort = k => { if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir("desc"); } };

  const exportCSV = () => {
    const rows = [["Date", "Description", "Category", "Type", "Amount (₹)"],
      ...transactions.map(t => [t.date, t.description, t.category, t.type, t.amount])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "transactions.csv"; a.click();
  };

  const inpStyle = { padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 13 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Transactions</h2>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{filtered.length} records found</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && (
            <button onClick={() => setShowAdd(true)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4f8ef7,#9c6fef)", color: "#fff", fontSize: 13, fontWeight: 600 }}>+ Add</button>
          )}
          <button onClick={exportCSV} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 13 }}>Export CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or category..." style={{ ...inpStyle, flex: "1 1 200px" }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inpStyle}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={inpStyle}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.2fr 0.8fr 1fr auto", gap: 0, padding: "10px 16px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
          {[["date", "Date"], ["description", "Description"], ["category", "Category"], ["type", "Type"], ["amount", "Amount"]].map(([k, l]) => (
            <button key={k} onClick={() => toggleSort(k)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "left", letterSpacing: 0.5, padding: 0 }}>
              {l} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
          ))}
          {isAdmin && <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5 }}>ACTIONS</span>}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No transactions found</div>
            <div style={{ fontSize: 13 }}>Try adjusting your filters{isAdmin ? " or add a new transaction" : ""}</div>
          </div>
        ) : filtered.map((t, i) => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.2fr 0.8fr 1fr auto", gap: 0, padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(t.date)}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${CATEGORY_COLORS[t.category] || "#888"}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {t.type === "income" ? "↗" : "↙"}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</span>
            </div>
            <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: `${CATEGORY_COLORS[t.category] || "#888"}22`, color: CATEGORY_COLORS[t.category] || "#888", fontWeight: 500, width: "fit-content" }}>{t.category}</span>
            <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: t.type === "income" ? "rgba(29,233,182,0.15)" : "rgba(240,98,146,0.15)", color: t.type === "income" ? "var(--income)" : "var(--expense)", fontWeight: 600, width: "fit-content" }}>
              {t.type.toUpperCase()}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.type === "income" ? "var(--income)" : "var(--expense)" }}>
              {t.type === "income" ? "+" : "-"}{fmtINR(t.amount)}
            </span>
            {isAdmin && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditTxn(t)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "none", color: "var(--text-secondary)", cursor: "pointer" }}>Edit</button>
                <button onClick={() => setDeleteTxn(t)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(240,98,146,0.4)", background: "none", color: "var(--expense)", cursor: "pointer" }}>Del</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && <Modal title="Add Transaction" onClose={() => setShowAdd(false)}><TxnForm onSubmit={t => { setTransactions(p => [...p, t]); setShowAdd(false); }} onCancel={() => setShowAdd(false)} /></Modal>}
      {editTxn && <Modal title="Edit Transaction" onClose={() => setEditTxn(null)}><TxnForm initial={editTxn} onSubmit={t => { setTransactions(p => p.map(x => x.id === t.id ? t : x)); setEditTxn(null); }} onCancel={() => setEditTxn(null)} /></Modal>}
      {deleteTxn && (
        <Modal title="Delete Transaction" onClose={() => setDeleteTxn(null)}>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: "1.25rem" }}>Delete <strong style={{ color: "var(--text-primary)" }}>{deleteTxn.description}</strong>? This cannot be undone.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setDeleteTxn(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "none", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => { setTransactions(p => p.filter(x => x.id !== deleteTxn.id)); setDeleteTxn(null); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#A32D2D", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}