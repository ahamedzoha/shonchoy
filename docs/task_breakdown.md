# Task Breakdown for Shonchoy Development

This task breakdown is structured logically and sequentially, following a standard software development lifecycle (SDLC) approach: **Planning & Setup**, **Backend Development**, **Frontend Development**, **Integration & Features**, **Testing & QA**, **Deployment & Launch**, and **Post-MVP Iterations**. Each phase includes detailed sub-tasks that can be directly converted into assignable tickets (e.g., in Jira, Trello, or GitHub Issues). Tickets should include:

- **Assignee**: e.g., Backend Dev, Frontend Dev, Designer, QA.
- **Priority**: High/Medium/Low.
- **Dependencies**: Preceding tasks.
- **Estimation**: Rough story points or time (e.g., 1-2 days).
- **Acceptance Criteria**: Measurable outcomes.

The breakdown prioritizes MVP features first, with references to the PRD and Tech Spec. Total estimated timeline: 8-12 weeks for MVP, assuming a small team (2-3 devs, 1 designer/QA).

## 1. Planning & Setup (Week 1)

Focus: Establish foundations, tools, and initial designs.

- **Task 1.1: Set Up Monorepo Structure** ✅ **COMPLETED**
  - Description: Initialize monorepo with pnpm and Turbo; create folders for react-app (main UI), web (Next.js landing), backend (Express), and shared configs; implement centralized environment configuration.
  - Dependencies: None.
  - Assignee: Lead Dev.
  - Priority: High.
  - Estimation: 1 day → **Actual: 2 days** (due to environment configuration complexity).
  - Acceptance Criteria: ✅ Monorepo builds successfully; ✅ basic scripts for build/test/deploy work; ✅ centralized environment configuration implemented.
  - **Additional Implementation Details:**
    - Centralized `.env` file at repository root
    - Turbo global environment variable declarations
    - Conditional OAuth configuration architecture
    - APISIX gateway environment variable integration
    - Comprehensive `.env.example` with security documentation

- **Task 1.2: Database Setup**
  - Description: Set up PostgreSQL locally (e.g., via Docker); define initial schema migrations using pg or TypeORM based on Section 3 of Tech Spec.
  - Dependencies: None.
  - Assignee: Backend Dev.
  - Priority: High.
  - Estimation: 1-2 days.
  - Acceptance Criteria: DB container runs; schema tables (Users, Incomes, etc.) created and testable via queries.

- **Task 1.3: UI/UX Wireframing**
  - Description: Create wireframes for key screens (Dashboard, Tracking Pages, Loan Calculator) using Figma or Sketch; incorporate mobile-first design from PRD Section 3.
  - Dependencies: None.
  - Assignee: Designer.
  - Priority: High.
  - Estimation: 2-3 days.
  - Acceptance Criteria: Wireframes approved; include user flows (e.g., Mermaid diagram from PRD).

- **Task 1.4: API Design & Documentation** ✅ **COMPLETED**
  - Description: Define REST endpoints (e.g., /auth, /api/incomes) with Swagger or Postman; include gateway pattern logic with APISIX integration.
  - Dependencies: Task 1.2.
  - Assignee: Backend Dev.
  - Priority: Medium.
  - Estimation: 1 day → **Actual: 2 days** (due to APISIX configuration complexity).
  - Acceptance Criteria: ✅ API docs generated; ✅ endpoints match Tech Spec Section 4; ✅ APISIX gateway integration implemented.
  - **Implementation Details:**
    - RESTful API endpoints for authentication (`/v1/auth/*`)
    - APISIX gateway configuration with JWT validation
    - Public and private route segregation
    - WSL2-compatible gateway setup scripts
    - Secure API routing with consumer authentication

- **Task 1.5: CI/CD Pipeline Setup**
  - Description: Configure GitHub Actions for build/test/deploy; include linting (ESLint/Prettier) and basic tests.
  - Dependencies: Task 1.1.
  - Assignee: DevOps/Lead Dev.
  - Priority: Medium.
  - Estimation: 1 day.
  - Acceptance Criteria: Pipeline runs on PRs; deploys to staging (e.g., Vercel/Render).

## 2. Backend Development (Weeks 2-4)

Focus: Build core services, starting with auth and data handling.

- **Task 2.1: Implement Authentication** ✅ **COMPLETED**
  - Description: Set up JWT auth in Express with Passport.js; handle register/login/profile endpoints; integrate conditional OAuth (Google/Apple).
  - Dependencies: Task 1.2, 1.4.
  - Assignee: Backend Dev.
  - Priority: High.
  - Estimation: 2 days → **Actual: 3 days** (due to OAuth integration complexity).
  - Acceptance Criteria: ✅ Endpoints testable; ✅ tokens validate; ✅ OAuth conditionally enabled.
  - **Implementation Details:**
    - Passport.js integration with Local and JWT strategies
    - Conditional OAuth configuration (Google OAuth fully implemented)
    - Bcryptjs password hashing with configurable salt rounds
    - JWT access/refresh token architecture
    - Database session management
    - APISIX gateway integration with JWT validation
    - Centralized environment configuration

- **Task 2.1.1: Migrate be-income to consolidated be-finance service** ✅ **COMPLETED**
  - Description: Consolidate be-income into be-finance service with modular architecture for all financial domains (Income, Expenses, Assets, Liabilities, Budgets).
  - Dependencies: Task 2.1.
  - Assignee: Backend Dev.
  - Priority: High.
  - Estimation: 1 day → **Actual: 1 day**
  - Acceptance Criteria: ✅ Service renamed and restructured; ✅ Placeholder modules created; ✅ Database configuration updated; ✅ Documentation completed; ✅ All builds passing.
  - **Implementation Details:**
    - Renamed be-income to be-finance
    - Created modular structure with placeholder modules (expenses, assets, liabilities, budget)
    - Updated database from shonchoy_income to shonchoy_finance
    - Consolidated postgres-income and postgres-expense into single postgres-finance service
    - Created comprehensive README and migration guide
    - Updated all environment variables and turbo configuration

- **Task 2.2: CRUD for Core Entities**
  - Description: Implement CRUD for Expenses, Assets, Liabilities modules in be-finance service (Income already complete).
  - Dependencies: Task 2.1.1.
  - Assignee: Backend Dev.
  - Priority: High.
  - Estimation: 3 days.
  - Acceptance Criteria: APIs return correct data; validation for inputs (e.g., decimal amounts); all modules follow income module pattern.

- **Task 2.3: Budgeting & Surplus Logic**
  - Description: Build surplus calculation service; envelope assignment; integrate with cron for alerts.
  - Dependencies: Task 2.2.
  - Assignee: Backend Dev.
  - Priority: Medium.
  - Estimation: 2 days.
  - Acceptance Criteria: GET /budgets/surplus computes accurately; alerts trigger via mock emails.

- **Task 2.4: Portfolio & Projections**
  - Description: Implement allocation JSON handling; compound interest formulas from Tech Spec Section 6.
  - Dependencies: Task 2.2.
  - Assignee: Backend Dev.
  - Priority: Medium.
  - Estimation: 2 days.
  - Acceptance Criteria: POST /portfolios/simulate returns FV projections; handles inflation.

- **Task 2.5: Loan/Credit Module**
  - Description: Add debt service with EMI calc, amortization schedules, payoff simulations; use mathjs for formulas.
  - Dependencies: Task 2.2.
  - Assignee: Backend Dev.
  - Priority: High.
  - Estimation: 3 days.
  - Acceptance Criteria: POST /debt/calculate outputs EMI/total interest; simulations adjust for extra payments.

- **Task 2.6: Reporting & Exports**
  - Description: Generate JSON for dashboards; CSV/PDF exports using libraries like pdfmake.
  - Dependencies: Task 2.3-2.5.
  - Assignee: Backend Dev.
  - Priority: Medium.
  - Estimation: 2 days.
  - Acceptance Criteria: GET /reports/export produces files; data aggregates correctly.

- **Task 2.7: Joint Accounts & Permissions**
  - Description: Implement invite/merge logic; handle merged views with permissions.
  - Dependencies: Task 2.1.
  - Assignee: Backend Dev.
  - Priority: Medium (V1.1).
  - Estimation: 2 days.
  - Acceptance Criteria: Merged data queries work; view-only mode enforced.

## 3. Frontend Development (Weeks 3-5, parallel to Backend)

Focus: Build UI components, overlapping with backend for API mocks if needed.

- **Task 3.1: Landing Page (Next.js)**
  - Description: Build marketing pages (/home, /pricing, /features) with SEO; integrate signup CTA.
  - Dependencies: Task 1.3.
  - Assignee: Frontend Dev.
  - Priority: High.
  - Estimation: 2 days.
  - Acceptance Criteria: Pages responsive; deploys to Vercel.

- **Task 3.2: Main App Setup (React/Vite)**
  - Description: Set up routing, state (Context/React Query), theme (Tailwind/shadcn); PWA manifest.
  - Dependencies: Task 1.3.
  - Assignee: Frontend Dev.
  - Priority: High.
  - Estimation: 1-2 days.
  - Acceptance Criteria: App skeleton loads; protected routes work.

- **Task 3.3: Authentication UI**
  - Description: Forms for login/signup; OAuth buttons; profile setup wizard.
  - Dependencies: Task 3.2, Backend Task 2.1.
  - Assignee: Frontend Dev.
  - Priority: High.
  - Estimation: 2 days.
  - Acceptance Criteria: Integrates with auth APIs; redirects to dashboard.

- **Task 3.4: Tracking Pages (Income/Expenses)**
  - Description: Forms for manual entry; lists with edits; CSV import.
  - Dependencies: Task 3.2, Backend Task 2.2.
  - Assignee: Frontend Dev.
  - Priority: High.
  - Estimation: 3 days.
  - Acceptance Criteria: Data syncs via React Query; real-time updates.

- **Task 3.5: Dashboard & Visualizations**
  - Description: Charts (Chart.js) for surplus/trends; net worth calc.
  - Dependencies: Task 3.4, Backend Task 2.3.
  - Assignee: Frontend Dev.
  - Priority: Medium.
  - Estimation: 2 days.
  - Acceptance Criteria: Responsive charts; data fetches from APIs.

- **Task 3.6: Portfolio & Simulations UI**
  - Description: Allocation pies; projection sliders; what-if inputs.
  - Dependencies: Task 3.5, Backend Task 2.4.
  - Assignee: Frontend Dev.
  - Priority: Medium.
  - Estimation: 2 days.
  - Acceptance Criteria: Simulations update dynamically; results visualized.

- **Task 3.7: Loan/Credit Calculator UI**
  - Description: Forms for inputs (principal, rate, term); display schedules/charts; integrate simulations.
  - Dependencies: Task 3.5, Backend Task 2.5.
  - Assignee: Frontend Dev.
  - Priority: High.
  - Estimation: 3 days.
  - Acceptance Criteria: Interactive EMI calc; payoff curves; links to liabilities.

- **Task 3.8: Additional Tools (Alerts/Gamification)**
  - Description: Notification UI; badges for streaks.
  - Dependencies: Task 3.5, Backend Task 2.6.
  - Assignee: Frontend Dev.
  - Priority: Medium (V1.1).
  - Estimation: 2 days.
  - Acceptance Criteria: Alerts display; gamification unlocks features.

## 4. Integration & Features (Weeks 5-6)

Focus: Connect FE/BE; add polish.

- **Task 4.1: API Gateway Integration**
  - Description: Route all FE calls through gateway; add logging/rate limiting.
  - Dependencies: Backend Phase 2, Frontend Phase 3.
  - Assignee: Backend Dev.
  - Priority: High.
  - Estimation: 1 day.
  - Acceptance Criteria: All endpoints proxied; no direct service calls.

- **Task 4.2: Joint Features Integration**
  - Description: UI for invites; merged dashboards.
  - Dependencies: Task 2.7, 3.8.
  - Assignee: Full-Stack Dev.
  - Priority: Medium.
  - Estimation: 2 days.
  - Acceptance Criteria: Shared views load; permissions respected.

- **Task 4.3: Offline Support & PWA**
  - Description: Cache data with service workers; basic offline tracking.
  - Dependencies: Task 3.2.
  - Assignee: Frontend Dev.
  - Priority: Low.
  - Estimation: 1 day.
  - Acceptance Criteria: App installable; works offline for views.

## 5. Testing & QA (Weeks 6-7)

Focus: Ensure quality.

- **Task 5.1: Unit & Integration Tests**
  - Description: Cover calcs (e.g., EMI), APIs with Jest/Supertest.
  - Dependencies: Phases 2-4.
  - Assignee: Dev Team.
  - Priority: High.
  - Estimation: 3 days.
  - Acceptance Criteria: 80% coverage; all pass.

- **Task 5.2: E2E Tests**
  - Description: User flows (e.g., signup to simulation) with Cypress.
  - Dependencies: Task 5.1.
  - Assignee: QA.
  - Priority: High.
  - Estimation: 2 days.
  - Acceptance Criteria: Flows automated; bugs fixed.

- **Task 5.3: Security & Accessibility Audit**
  - Description: Scan for vulnerabilities; check WCAG compliance.
  - Dependencies: Task 5.1.
  - Assignee: QA/Dev.
  - Priority: Medium.
  - Estimation: 1 day.
  - Acceptance Criteria: No high-sev issues; reports generated.

## 6. Deployment & Launch (Week 8)

Focus: Go-live.

- **Task 6.1: Staging Deployment**
  - Description: Deploy to staging; seed test data.
  - Dependencies: Phase 5.
  - Assignee: DevOps.
  - Priority: High.
  - Estimation: 1 day.
  - Acceptance Criteria: App accessible; monitoring set (Sentry).

- **Task 6.2: User Testing & Feedback**
  - Description: Beta test with 5-10 users; iterate on bugs.
  - Dependencies: Task 6.1.
  - Assignee: QA/Product.
  - Priority: Medium.
  - Estimation: 2 days.
  - Acceptance Criteria: Feedback incorporated; NPS >8.

- **Task 6.3: Production Deployment**
  - Description: Deploy to prod; set up backups/uptime monitoring.
  - Dependencies: Task 6.2.
  - Assignee: DevOps.
  - Priority: High.
  - Estimation: 1 day.
  - Acceptance Criteria: Live app; domain configured.

## 7. Post-MVP Iterations (Weeks 9+)

Focus: Enhancements from PRD/Tech Spec Section 9.

- **Task 7.1: Microservices Migration**
  - Description: Refactor to NestJS services (e.g., debt service).
  - Dependencies: MVP Launch.
  - Assignee: Backend Dev.
  - Priority: Medium.
  - Estimation: 5-7 days.
  - Acceptance Criteria: Services independent; gateway routes correctly.

- **Task 7.2: AI Recommendations**
  - Description: Integrate OpenAI for insights (e.g., debt advice).
  - Dependencies: Task 7.1.
  - Assignee: Full-Stack Dev.
  - Priority: Low.
  - Estimation: 3 days.
  - Acceptance Criteria: Natural language queries work.

- **Task 7.3: Mobile App Prep**
  - Description: Share code for React Native version.
  - Dependencies: MVP.
  - Assignee: Frontend Dev.
  - Priority: Low.
  - Estimation: 4 days.
  - Acceptance Criteria: Basic mobile prototype.

### Current Status Update (October 2025)

**✅ Completed Phases:**

- **Planning & Setup:** Monorepo, Docker environment, database schema ✅
- **Backend Development:** Complete JWT auth service with PostgreSQL ✅
- **Microservices Architecture:** NestJS income service with shared utilities ✅
- **Shared Packages:** @workspace/nestjs-common and @workspace/shared-domain ✅
- **Integration:** APISIX gateway configuration and multi-service routing ✅
- **Frontend Foundation:** React SPA with Redux, React Router, and authentication ✅
- **Testing:** API endpoint testing and health checks ✅

**🚧 In Progress:**

- **Frontend Development:** Complete income CRUD UI and dashboard analytics
- **Core Features:** Full income management interface and data visualization

**📋 Remaining Tasks:**

- Complete React SPA dashboard with financial summaries
- Implement expense service (NestJS microservice)
- Add budget surplus calculations and projections
- Data visualization with Chart.js integration
- Form validation and error handling improvements

### Updated Project Timeline

```mermaid
gantt
    title Shonchoy Development Status - October 2025
    dateFormat  YYYY-MM-DD
    section ✅ Completed
    Monorepo Setup           :done, 2025-09-25, 1d
    Docker Environment       :done, 2025-09-26, 2d
    Auth Service             :done, 2025-09-28, 5d
    APISIX Integration       :done, 2025-10-01, 2d
    NestJS Income Service    :done, 2025-10-03, 4d
    Shared Packages          :done, 2025-10-07, 3d
    React Auth & Routing     :done, 2025-10-10, 3d
    section 🚧 In Progress
    Income CRUD UI          :active, 2025-10-13, 5d
    Dashboard Analytics     :2025-10-18, 4d
    section 📋 Planned
    Expense Service         :2025-10-22, 5d
    Budget Calculations     :2025-10-27, 4d
    Data Visualization      :2025-10-31, 5d
    Loan Calculators        :2025-11-05, 4d
    Testing & QA            :2025-11-09, 7d
    Production Deployment   :2025-11-16, 5d
```
