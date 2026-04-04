import { useState, useEffect } from "react";
import { useLocalStorage } from "./hooks";
import { INITIAL_TRANSACTIONS, DEFAULT_BUDGETS } from "./data";
import Sidebar from "./components/Sidebar";
import SummaryCards from "./components/SummaryCards";
import { BarChart, DonutChart, TopCategories } from "./components/Charts";
import Transactions from "./components/Transactions";
import Budget from "./components/Budget";
import Insights from "./components/Insights";
import "./index.css";

function RecentTransactions({ transactions, setTab }) {
  const fmtINR = n => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0
  }).format(n);
  const fmtDate = d => new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: 14,
      border: "1px solid var(--border)", padding: "1.25rem",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "1rem",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Recent Transactions</div>
        <button onClick={() => setTab("transactions")} style={{
          fontSize: 12, color: "var(--accent-blue)",
          background: "none", border: "none", cursor: "pointer",
        }}>View all →</button>
      </div>

      {recent.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "2rem",
          color: "var(--text-muted)", fontSize: 13,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>◎</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No transactions yet</div>
          <div>Add your first transaction to get started</div>
        </div>
      ) : (
        recent.map((t, i) => (
          <div key={t.id} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "10px 0",
            borderBottom: i < recent.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{t.description}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {fmtDate(t.date)} · {t.category}
              </div>
            </div>
            <span style={{
              fontWeight: 700, fontSize: 14, marginLeft: 12, flexShrink: 0,
              color: t.type === "income" ? "var(--income)" : "var(--expense)",
            }}>
              {t.type === "income" ? "+" : "-"}{fmtINR(t.amount)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function PageHeader({ tab }) {
  const headers = {
    overview: { title: "Dashboard Overview", sub: "Your financial summary at a glance" },
    transactions: { title: "All Transactions", sub: "Browse, filter and manage your records" },
    budget: { title: "Budget Planner", sub: "Set and track monthly category budgets" },
    insights: { title: "Financial Insights", sub: "Patterns and observations from your data" },
  };
  const h = headers[tab];
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{h.title}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{h.sub}</div>
    </div>
  );
}

export default function App() {
  const [transactions, setTransactions] = useLocalStorage("fin_txns", INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useLocalStorage("fin_budgets", DEFAULT_BUDGETS);
  const [role, setRole] = useLocalStorage("fin_role", "admin");
  const [dark, setDark] = useLocalStorage("fin_dark", true);
  const [tab, setTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const isAdmin = role === "admin";

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
    }}>
      {/* Sidebar — always rendered, handles its own mobile/desktop layout internally */}
      <Sidebar
        tab={tab}
        setTab={setTab}
        role={role}
        setRole={setRole}
        dark={dark}
        setDark={setDark}
      />

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: isMobile ? "72px 0.85rem 80px" : "2rem",
        overflowY: "auto",
        minWidth: 0,
        maxWidth: "100%",
      }}>
        <PageHeader tab={tab} />

        {/* Overview */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SummaryCards transactions={transactions} />

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(300px,1fr))",
              gap: 16,
            }}>
              <BarChart transactions={transactions} />
              <DonutChart transactions={transactions} />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(300px,1fr))",
              gap: 16,
            }}>
              <TopCategories transactions={transactions} />
              <RecentTransactions transactions={transactions} setTab={setTab} />
            </div>
          </div>
        )}

        {/* Transactions */}
        {tab === "transactions" && (
          <Transactions
            transactions={transactions}
            setTransactions={setTransactions}
            isAdmin={isAdmin}
          />
        )}

        {/* Budget */}
        {tab === "budget" && (
          <Budget
            budgets={budgets}
            setBudgets={setBudgets}
            transactions={transactions}
            isAdmin={isAdmin}
          />
        )}

        {/* Insights */}
        {tab === "insights" && (
          <Insights transactions={transactions} />
        )}
      </main>
    </div>
  );
}