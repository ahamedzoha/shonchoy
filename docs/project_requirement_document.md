# Product Requirements Document (PRD) for Shonchoy

## 1. Product Overview

### 1.1 Product Name

Shonchoy (Personal Finance Tracker)

### 1.2 Product Description

Shonchoy is a web-based personal finance tracking application designed for users seeking to manage their finances effectively. It allows users to monitor income streams, expenses, assets, liabilities, budgeting, and investment portfolios in a secure and intuitive way. The app supports manual entry for tracking financial data, with features like envelope budgeting, habit insights, and goal projections. It promotes financial discipline by visualizing spending patterns, calculating surpluses, and providing tools for diversified portfolio management, including projections that account for inflation and growth.

The app is adaptable for individual or joint use (e.g., couples or families) and focuses on scalability for various life stages, such as career changes, major purchases, or long-term planning.

### 1.3 Target Audience

- Primary: Individuals and households interested in personal finance management, including professionals, families, and retirees.
- Secondary: Users in emerging markets (e.g., Bangladesh or similar economies) dealing with inflation, variable incomes, or limited banking integrations; also suitable for global users with manual tracking needs.
- User Persona: A general user, such as a mid-career professional with steady income, everyday expenses, assets like savings or investments, and goals for short-term purchases (e.g., home improvements) and long-term security (e.g., retirement).

### 1.4 Business Goals

- Help users achieve better savings rates by identifying spending leaks and providing actionable insights.
- Offer tools for portfolio diversification and growth projections to support informed decision-making.
- Foster positive financial habits through tracking and alerts.
- Monetization: Free basic version; premium for advanced features like detailed projections or AI-driven recommendations (e.g., annual subscription).
- Metrics for Success: High user retention (e.g., 80% after 3 months); frequent engagement (e.g., 4+ logins/week); measurable improvements in user-reported financial habits.

### 1.5 Key Assumptions and Constraints

- No automatic bank integrations (manual entry primary).
- Currency: Multi-currency support, with defaults like BDT, USD, EUR.
- Data Privacy: Compliant with relevant regulations (e.g., GDPR or local data laws).
- Offline Support: Basic caching for recent data via PWA.
- Scope: MVP emphasizes core tracking; expansions for advanced tools.

## 2. Features and Requirements

### 2.1 Core Features

- **User Authentication and Profiles:**
  - Secure signup/login (email/password, OAuth options).
  - Support for multiple profiles: Invite family members for joint accounts with merged views.
  - Profile setup: Basic details like income sources, goals, and preferences (e.g., inflation rate assumptions).

- **Income Tracking:**
  - Add/edit income streams (e.g., salary, freelance, investments).
  - Projections: Calculate potential growth based on user-input rates (e.g., annual hikes).
  - Support for variable incomes (e.g., side gigs).

- **Expense Tracking:**
  - Manual entry with customizable categories (e.g., subscriptions, utilities, discretionary spends).
  - Envelope Budgeting: Assign and track budgets per category with visual overspend alerts.
  - Habit Insights: Identify and simulate savings from reducing specific spends (e.g., recurring habits).
  - Recurring expenses: Auto-reminders for bills or payments.

- **Budgeting and Surplus Calculation:**
  - Flexible systems like zero-based or envelope budgeting.
  - Dashboard for monthly/annual surpluses and projections, factoring in life events (e.g., income changes).
- **Assets and Liabilities:**
  - Track various assets (e.g., cash, investments, property) and liabilities (e.g., loans).
  - Net Worth Calculator: Automatic aggregation and trends.
  - Modules for insurance or other protections.

- **Portfolio Management:**
  - Allocation tools: Suggest or track diversified mixes (e.g., low-risk savings, medium-term bonds, growth investments).
  - Features like auto-reinvest alerts, maturity laddering, and rebalance reminders.
  - Projections: Compound interest simulators for goals like retirement, adjusting for inflation.

- **Reporting and Visualizations:**
  - Dashboards: Charts for expenses, assets, and growth trends.
  - Goal Tracker: Monitor progress toward user-defined targets (e.g., vacations, major purchases).
  - Export: Reports in PDF/CSV formats.

- **Additional Tools:**
  - Risk Alerts: Notifications for gaps (e.g., low emergency funds).
  - Gamification: Rewards for consistent use or milestone achievements.

### 2.2 Non-Functional Requirements

- Performance: Quick loads (<2s); scalable for growing users.
- Security: Encrypted data, secure auth.
- Accessibility: Responsive design, multi-language support.
- Scalability: Cloud-compatible.

### 2.3 User Stories

- As a user, I want to track expenses manually to monitor daily habits.
- As a family, I want joint access to combine financial views.
- As an investor, I want goal projections to plan for the future.
- As a budgeter, I want alerts to stay within category limits.

### 2.4 Prioritization (MVP vs. Future)

- MVP: Auth, Core Tracking (Income/Expenses/Budget), Dashboard, Basic Portfolio.
- V1.1: Joint Features, Advanced Projections, Insights.
- Future: Integrations (if available), AI suggestions.

## 3. Design and UX Guidelines

- UI: Modern, intuitive (e.g., shadcn/ui with Tailwind CSS v4); theme options.
- Flow: Easy onboarding; customizable forms.
- Mobile-First: Fully responsive.

## 4. Risks and Dependencies

- Risks: User drop-off from manual entry – Address with simple UI.
- Dependencies: Tech stack as specified.
- Timeline: MVP in 8-12 weeks.

## 5. Success Criteria

- User Feedback: High satisfaction scores.
- Adoption: Steady user growth via organic means.

---

# Updated Technical Specification for Shonchoy Web App

## 1. Architecture Overview

- **High-Level Design:** Monorepo with client-server architecture using REST APIs. Main application in React 19 (Vite), landing page in Next.js, Backend in Express.js with gateway pattern, DB in PostgreSQL. Future: Microservices with NestJS.
- **Deployment:** Monorepo setup with pnpm and Turbo; cloud hosting.
- **Data Flow:** UI → Gateway API → Services → DB; optional real-time for joint updates.
- **Scalability:** Built for expansion to microservices.
- **Security:** Standard protections.

## 2. Technology Stack

- **Frontend:** React 19 (TypeScript) with Vite for main app (react-app), Next.js for landing page (web), shadcn/ui with Tailwind CSS v4, Chart.js, React Query.
- **Backend:** Express.js (TypeScript) with gateway pattern, JWT.
- **Database:** PostgreSQL.
- **Other:** Testing (Jest/Cypress), CI/CD (GitHub Actions), pnpm, Turbo.

## 3. Database Schema

- **Users:** id, email, profile (JSON for general details).
- **Incomes:** id, user_id, amount, type, frequency, notes.
- **Expenses:** id, user_id, category, amount, date, recurring.
- **Assets:** id, user_id, type, value, notes.
- **Liabilities:** id, user_id, type, amount, end_date.
- **Portfolios:** id, user_id, allocation (JSON), projections (JSON).
- **Budgets:** id, user_id, period, surplus.
- **JointAccounts:** id, user_ids, merged.
- Relationships and indexes as needed.

## 4. API Endpoints

- **Auth:** Register/login/profile.
- **Incomes/Expenses/Assets/Liabilities:** CRUD.
- **Budgets:** Surplus calc, envelope assign.
- **Portfolios:** Project simulations, alerts.
- **Reports:** Dashboard data, exports.
- **Joint:** Invite/merge.

## 5. Frontend Structure

- Components: Layout, Dashboard, Forms, Pages.
- State: Context/Reducer + Query.
- Routing: Protected.
- Visuals: Responsive charts.

## 6. Calculations and Logic

- **Surplus:** Sum incomes - expenses.
- **Projections:** Standard financial formulas (e.g., future value).
- **Alerts:** Scheduled notifications.

## 7. Testing and Quality

- Comprehensive coverage.

## 8. Deployment and Maintenance

- Env management, monitoring.

This updated version generalizes the app by removing specific financial details and broadening the audience, making it suitable for a wider user base while retaining core functionality. If it's still too specific in areas, we can iterate further!
