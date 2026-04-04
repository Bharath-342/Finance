# FinTrack — Finance Dashboard

> A clean, interactive personal finance dashboard built with React and Vite. Designed to help users track income, expenses, budgets and spending patterns with role-based access control, animated charts, and full data persistence.

---

## Live Demo

https://finance-three-ashy.vercel.app/
---

## Setup Instructions

Clone the repository and install dependencies:
```bash
git clone https://github.com/yourusername/finance-dashboard.git
cd finance-dashboard
npm install
npm run dev
```

Open **http://localhost:5173** in your browser. The app loads with pre-populated mock data so every chart and insight is visible immediately without adding any transactions manually.

To build for production:
```bash
npm run build
npm run preview
```

**Prerequisites:** Node.js 18 or above, npm 9 or above.

---

## Project Structure
```
finance-dashboard/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation, role switcher, dark mode toggle
│   │   ├── SummaryCards.jsx    # Animated summary metric cards
│   │   ├── Charts.jsx          # Bar chart and donut chart for Overview tab
│   │   ├── Transactions.jsx    # Transaction list with CRUD, search, filter, sort
│   │   ├── Budget.jsx          # Dynamic per-category monthly budget planner
│   │   └── Insights.jsx        # Insight cards, animated trend chart, breakdown
│   ├── data.js                 # Mock transactions, category colors, default budgets
│   ├── hooks.js                # useLocalStorage and useAnimatedNumber custom hooks
│   ├── utils.js                # Currency, date, and number formatting helpers
│   └── App.jsx                 # Root component, global state, tab routing
├── index.html
├── package.json
└── README.md
```

---

## Overview of Approach

The goal was to build a dashboard that feels like a real product, not an assignment submission. Every decision was made by asking two questions — would a real user find this useful, and would a real developer find this maintainable.

**Architecture:** The app uses tab-based routing managed entirely within React state. No React Router is used because the app has four views and adding a router would introduce complexity with zero benefit at this scale. All global state lives in App.jsx and flows down as props. This is intentional — the state is simple enough that Redux or Zustand would be over-engineering. The assignment explicitly permits simple state if well managed, and this qualifies.

**Data Persistence:** A custom useLocalStorage hook wraps React useState and syncs every state change to localStorage automatically. Transactions, budgets, selected role, and dark mode preference all survive page refreshes without any extra logic inside components.

**Role-Based UI Strategy:** Admin controls are completely removed from the DOM for the Viewer role rather than just disabled. A disabled button tells the user an action exists but is blocked. A missing button means the Viewer genuinely experiences a read-only interface — which is the correct behavior for a real role-based system.

**Chart Implementation:** All charts are built with raw SVG with no external chart library. This keeps the bundle lightweight and gives complete control over animations. The trend chart uses cubic bezier curves for smooth lines between data points and requestAnimationFrame with an ease-out curve for the draw animation. IntersectionObserver triggers the animation only when the chart scrolls into view.

**Budget Feature:** Added beyond the core requirements. Budgets are stored as a category-keyed map in localStorage. Admin edits reflect instantly across all components with no save step. This was included because a budget tracker is the most natural next feature any financial dashboard user would need — it demonstrates product thinking beyond the brief.

---

## Features Explanation

**Dashboard Overview** gives users an immediate snapshot of their financial health. Four summary cards show net balance, total income, total expenses, and savings rate. All card values animate upward on load using a custom useAnimatedNumber hook. A monthly bar chart compares income and expenses side by side across all recorded months. A donut chart breaks down spending by category with percentages. A top spending categories section shows proportional progress bars ranked by spend. A recent transactions panel shows the five latest entries with a link to the full list.

**Transactions** is the core data management tab. The full transaction list shows date, description, category, type badge, and amount with income in teal and expenses in pink for instant visual scanning. Users can search by name or category, filter by transaction type, filter by category, and sort by any column by clicking the header. Admin users see Edit and Delete buttons per row. Delete requires confirmation in a modal before the record is removed. All users can export the full transaction list to a CSV file with one click.

**Budget Planner** is an addition beyond the assignment requirements. Admin users can set a custom monthly spending limit for each expense category directly in the interface. The limit input is editable inline — there is no separate save button, changes apply immediately. Each category shows a progress bar of actual spend against the budget limit, the exact amount remaining, and the percentage used. Any category that exceeds its limit turns red and shows exactly how much over budget the user is. Viewer role sees all budgets as read-only numbers. All budget values persist in localStorage.

**Insights** surfaces meaningful observations from the transaction data. Six metric cards cover the top spending category with its share of total expenses, savings rate with a recommendation based on the 20 percent threshold, month-on-month expense change as a percentage, net savings for the most recent complete month, the most financially active month, and average monthly income across all recorded months. Below the cards is an animated area trend chart showing income and expenses as smooth curved lines with gradient fills. The chart draws itself when scrolled into view and shows a hover tooltip with plain language labels — Earned, Spent, and Saved — for each month. A dynamic observation sentence below the chart updates based on the actual data pattern, not hardcoded text. A full category breakdown ranks all expense categories by spend with proportional progress bars.

**Role-Based UI** is controlled by a dropdown in the sidebar. Admin has full access to add, edit, and delete transactions and to set budget limits. Viewer sees all data but every mutation control is completely absent from the interface. The selected role persists in localStorage so it survives page refresh. Switching roles is instant with no page reload.

**Dark Mode** is toggled from the sidebar and persists in localStorage. The entire color system uses CSS custom properties so the toggle switches the visual theme consistently across every component.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| Raw SVG | All charts — no chart library |
| CSS Custom Properties | Theming and dark mode |
| localStorage | Data persistence |
| IntersectionObserver | Scroll-triggered chart animation |
| Intl.NumberFormat | INR currency formatting |
| No UI library | All components built from scratch |

---

## Assumptions Made

- Single user application with no authentication — per assignment scope
- Currency is INR formatted with en-IN locale
- Current incomplete month is excluded from the trend chart since partial data would misrepresent the trend
- Mock data spans three months to ensure all charts and insights show meaningful output on first load
- Default budgets are pre-populated so the Budget tab demonstrates its functionality immediately
- Simple React state with localStorage is used instead of a state management library — justified by the scale of the application and explicitly permitted by the assignment
- Adjusted according to devices screens
---

## Optional Features Implemented

| Feature | Status |
|---|---|
| Dark mode | Implemented |
| Data persistence via localStorage | Implemented |
| CSV export | Implemented |
| Animations and transitions | Implemented |
| Advanced filtering and sorting | Implemented |
| Budget tracker per category | Implemented — beyond requirements |
| Scroll-triggered chart animation | Implemented — beyond requirements |
| Hover tooltips on charts | Implemented — beyond requirements |
