# 📊 Shonchoy – Strategic Review & Roadmap

## 1. Scope

**Strengths**

- Covers income, expenses, budgeting, assets/liabilities, loans, and portfolios → strong "all-in-one" positioning.
- MVP scope is clear (auth, core tracking, dashboard, basic calculators).
- Future roadmap (AI, gamification, integrations, mobile apps) gives growth potential.

**Risks**

- Heavy reliance on **manual entry** (drop-off risk).
- Advanced features (simulations, joint accounts) may overcomplicate early MVP.
- Focused on **emerging markets**, which may limit global appeal if UX isn’t polished.

✅ **Advice:** Keep MVP **laser-focused on delightful manual tracking** + simple budgeting. Defer advanced portfolio tools.

---

## 2. Marketability

**Opportunities**

- Huge gap in **emerging markets** (Bangladesh, India, SE Asia) where bank APIs don’t exist.
- Target users: variable income earners, students, households battling inflation.
- Name “Shonchoy” (savings in Bangla) resonates locally.

**Challenges**

- Competes with polished global apps (YNAB, Monarch, Copilot).
- Harder to convince users to do manual entry.

✅ **Advice:** Market as _“A disciplined savings-first tracker for markets where integrations fail.”_

---

## 3. Market Positioning

**Competitors**

- YNAB ($99/yr, envelope budgeting).
- GoodBudget (manual-first, basic).
- Mint (discontinued).
- Monarch, Tiller, Copilot (automation-first, US-centric).

**Differentiation**

- **Manual-first** → no integration dependency.
- **Inflation-aware projections** (rare in global tools).
- **Joint household tracking** (family focus).
- **Offline-capable PWA** → vital for emerging markets.

✅ **Positioning:** _YNAB-lite for emerging economies with inflation-adjusted goal planning._

---

## 4. Unique Selling Proposition (USP)

- **For users in markets without Plaid/Finicity,** Shonchoy is the **best manual-first tracker** with:
  1. Inflation-aware projections.
  2. Envelope budgeting + what-if simulations.
  3. Joint family tracking.
  4. Lightweight PWA with offline support.

---

## 5. Business Strategy

**Monetization**

- **Free tier:** expense/income tracking, surplus dashboard.
- **Premium ($20–40/yr global, 1000–1500 BDT local):** projections, simulations, portfolio tools.
- Future: financial literacy content, B2B NGO/education partnerships.

**Go-to-Market**

1. Launch in **Bangladesh/India** with student/young professional focus.
2. Leverage **financial literacy groups, FB communities, YouTube creators**.
3. Scale to **global users who prefer manual-first reliability**.

---

## 6. Technical Feasibility

**Strengths**

- Solid stack: React 19 + Vite, Express backend, PostgreSQL.
- Monorepo (pnpm/Turbo) → scalable dev workflow.
- PWA with caching → fits target market.
- Gateway API pattern → microservices-ready.

**Risks**

- Manual entry fatigue.
- Accuracy risk in projections/simulations.
- DB scaling (expense-heavy tables).

✅ **Advice:**

- Build delightful manual entry UX (recurring templates, keyboard-first).
- Unit test financial formulas.
- Start monolith, migrate later if scale demands.

---

## 6. Positioning Statement

_"Shonchoy is the simplest way to track savings and spending in markets where other apps fail. Designed for families and individuals facing inflation, variable incomes, and limited integrations — Shonchoy helps you take control of your money, your habits, and your future."_
