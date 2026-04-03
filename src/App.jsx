import { useState } from "react";
import { useLocalStorage } from "./hooks";
import { INITIAL_TRANSACTIONS, DEFAULT_BUDGETS } from "./data";
import Sidebar from "./components/sidebar";
import SummaryCards from "./components/SummaryCards";
import { BarChart, DonutChart, TopCategories } from "./components/Charts";
import Transactions from "./components/Transactions";
import Budget from "./components/Budget";
import Insights from "./components/Insights";
import "./index.css";

function RecentTransactions({ transactions, setTab }) {
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const { fmtINR, fmtDate } = { fmtINR: n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n), fmtDate: d => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) };

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "1px solid var(--border)", padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Recent Transactions</div>
        <button onClick={() => setTab("transactions")} style={{ fontSize: 12, color: "var(--accent-blue)", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
      </div>
      {recent.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: 13 }}>No transactions yet</div>
      ) : recent.map(t => (
        <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{fmtDate(t.date)} · {t.category}</div>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: t.type === "income" ? "var(--income)" : "var(--expense)" }}>
            {t.type === "income" ? "+" : "-"}{fmtINR(t.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [transactions, setTransactions] = useLocalStorage("fin_txns", INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useLocalStorage("fin_budgets", DEFAULT_BUDGETS);
  const [role, setRole] = useLocalStorage("fin_role", "admin");
  const [dark, setDark] = useLocalStorage("fin_dark", true);
  const [tab, setTab] = useState("overview");

  const isAdmin = role === "admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: dark ? "var(--bg-primary)" : "#f0f2f8", transition: "background 0.3s" }}>
      <Sidebar tab={tab} setTab={setTab} role={role} setRole={setRole} dark={dark} setDark={setDark} />

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto", minWidth: 0 }}>
        {/* Page header */}
        <div style={{ marginBottom: "1.5rem" }}>
          {tab === "overview" && <><div style={{ fontSize: 22, fontWeight: 700 }}>Dashboard Overview</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Your financial summary at a glance</div></>}
          {tab === "transactions" && <><div style={{ fontSize: 22, fontWeight: 700 }}>All Transactions</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Browse, filter and manage your records</div></>}
          {tab === "budget" && <><div style={{ fontSize: 22, fontWeight: 700 }}>Budget Planner</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Set and track monthly category budgets</div></>}
          {tab === "insights" && <><div style={{ fontSize: 22, fontWeight: 700 }}>Financial Insights</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Patterns and observations from your data</div></>}
        </div>

        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SummaryCards transactions={transactions} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              <BarChart transactions={transactions} />
              <DonutChart transactions={transactions} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              <TopCategories transactions={transactions} />
              <RecentTransactions transactions={transactions} setTab={setTab} />
            </div>
          </div>
        )}

        {tab === "transactions" && (
          <Transactions transactions={transactions} setTransactions={setTransactions} isAdmin={isAdmin} />
        )}

        {tab === "budget" && (
          <Budget budgets={budgets} setBudgets={setBudgets} transactions={transactions} isAdmin={isAdmin} />
        )}

        {tab === "insights" && (
          <Insights transactions={transactions} />
        )}
      </main>
    </div>
  );
}