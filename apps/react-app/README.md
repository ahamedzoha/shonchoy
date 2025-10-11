# Shonchoy React App

A modern React application built with **enterprise-grade architecture** following feature-driven development principles. Built with TypeScript, Vite, RTK Query, and shadcn/ui components.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
  - [Component Organization](#component-organization)
  - [Design Principles](#design-principles)
  - [Component Flow](#component-flow)
- [Component Reference](#component-reference)
  - [Import Patterns](#import-patterns)
  - [Component Locations](#component-locations)
  - [Common Patterns](#common-patterns)
- [Dashboard Features](#dashboard-features)
  - [Layout Components](#layout-components)
  - [Key Features](#key-features)
  - [File Structure](#file-structure)
- [Customization Guide](#customization-guide)
  - [Navigation](#navigation)
  - [Metrics Cards](#metrics-cards)
  - [Data Tables](#data-tables)
  - [Charts](#charts)
- [Styling & Theming](#styling--theming)
- [API Integration](#api-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run dev server (on port 3001)
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint
```

### Access Dashboard

Navigate to: `http://localhost:3001/app/dashboard`

---

## Architecture

### Enterprise Architecture Overview

This application follows a **feature-driven architecture** with clear separation of concerns, optimized for scalability and maintainability.

```
src/
├── features/             # 🚀 Feature-driven modules
│   ├── auth/            # Authentication feature
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/       # Feature-specific hooks
│   │   ├── types/       # Feature types
│   │   └── index.ts     # Feature exports
│   └── dashboard/       # Dashboard feature
│
├── components/          # 🧱 Shared UI components
│   ├── layouts/         # Layout components
│   ├── partials/        # Route protection, etc.
│   └── error/           # Error boundaries
│
├── routes/              # 🧭 Routing configuration
│   ├── paths/           # Path constants
│   ├── auth.route.tsx   # Auth routes
│   ├── dashboard.route.tsx # Dashboard routes
│   └── Router.tsx       # Main router with auth
│
├── store/               # 🔄 State management
│   ├── api/             # RTK Query APIs
│   └── apis/            # Feature-specific endpoints
│
├── providers/           # ⚡ App providers
├── config/              # ⚙️ Configuration
├── utils/               # 🛠️ Shared utilities
├── locales/             # 🌍 Internationalization
└── common/              # 🔗 Shared hooks/utilities
```

### Architecture Layers

#### 1. **Feature Layer** (`src/features/`)

Self-contained business features with all related code.

**Structure**:

```
feature-name/
├── components/     # Feature-specific UI components
├── hooks/         # Feature-specific business logic
├── types/         # Feature data types
├── api/           # Feature API endpoints (optional)
└── index.ts       # Feature exports
```

**Examples**:

```tsx
// Auth feature
import { LoginForm, useAuth } from "@/features/auth";
// Dashboard feature
import { AppSidebar, useDashboard } from "@/features/dashboard";
```

#### 2. **Shared Components Layer** (`src/components/`)

Reusable UI components and layouts.

**Categories**:

- `layouts/` - Page layout components
- `partials/` - Route guards, modals, etc.
- `error/` - Error boundaries and loading states

#### 3. **Routing Layer** (`src/routes/`)

Centralized routing configuration with authentication.

**Features**:

- Path constants for type safety
- Route-level lazy loading
- Authentication guards
- Modular route definitions

#### 4. **State Management Layer** (`src/store/`)

RTK Query for API state + Redux for UI state.

**Structure**:

- `api/` - Base API configurations (public/protected)
- `apis/` - Feature-specific API endpoints
- `selectors/` - Memoized state selectors

#### 5. **Infrastructure Layer**

- `providers/` - React context providers
- `config/` - App configuration (i18n, Sentry)
- `utils/` - Shared utility functions
- `locales/` - Internationalization files
- `common/` - Shared hooks and utilities

### Architecture Flow

```
┌─────────────────────────────────────────────────┐
│         Feature Layer                           │
├─────────────────────────────────────────────────┤
│  Auth Feature                                   │
│    ├── LoginForm (feature component)            │
│    └── useAuth (feature hook)                   │
│                                                 │
│  Dashboard Feature                              │
│    ├── AppSidebar (feature component)           │
│    ├── SectionCards (feature component)         │
│    └── useDashboard (feature hook)              │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│         Shared Components Layer                 │
├─────────────────────────────────────────────────┤
│  • DashboardLayout (layout)                     │
│  • ProtectedRoute (partial)                     │
│  • ErrorBoundary (error handling)               │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│         UI Primitives Layer                     │
├─────────────────────────────────────────────────┤
│  • Button, Card, Badge, Input (@workspace/ui)  │
│  • Sidebar, Table, Chart (shadcn/ui)           │
│  • All atomic components                        │
└─────────────────────────────────────────────────┘
```

---

## Component Reference

### Import Patterns

#### ✅ Feature Components

```tsx
// Import from feature modules
import { LoginForm, useAuth } from "@/features/auth";
import { AppSidebar, useDashboard } from "@/features/dashboard";
```

#### ✅ Shared Components

```tsx
// Import from shared components
import { DashboardLayout, ProtectedRoute } from "@/components";
import { AppLoader, ErrorBoundary } from "@/components";
```

#### ✅ UI Primitives

```tsx
// Import from shared UI package
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Sidebar, SidebarContent } from "@workspace/ui/components/sidebar";
```

### Component Locations

#### Feature Components

📁 `src/features/`

| Feature       | Components                          | Hooks        | Types                      | API           |
| ------------- | ----------------------------------- | ------------ | -------------------------- | ------------- |
| **auth**      | LoginForm, RegisterForm             | useAuth      | User, LoginRequest         | Public API    |
| **dashboard** | AppSidebar, SectionCards, DataTable | useDashboard | MetricCard, ChartDataPoint | Protected API |

#### Shared Components

📁 `src/components/`

| Category      | Components                                   | Purpose                     |
| ------------- | -------------------------------------------- | --------------------------- |
| **layouts/**  | DashboardLayout, PublicLayout                | Page layout wrappers        |
| **partials/** | ProtectedRoute                               | Route guards and protection |
| **error/**    | ErrorBoundary, RouteErrorBoundary, AppLoader | Error handling and loading  |

#### UI Primitives

📁 `packages/ui/src/components/`

| Component | Import Path                        | Use Case                 |
| --------- | ---------------------------------- | ------------------------ |
| Button    | `@workspace/ui/components/button`  | Action buttons           |
| Card      | `@workspace/ui/components/card`    | Content containers       |
| Input     | `@workspace/ui/components/input`   | Form inputs              |
| Sidebar   | `@workspace/ui/components/sidebar` | Navigation sidebars      |
| Table     | `@workspace/ui/components/table`   | Data tables              |
| ...       | ...                                | All shadcn/ui components |

### Common Patterns

#### Pattern 1: Building a Page with Features

```tsx
// pages/DashboardPage.tsx
import { DashboardLayout } from "@/components";
import { AppSidebar, DataTable, SectionCards } from "@/features/dashboard";

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SectionCards />
        <DataTable />
      </div>
    </DashboardLayout>
  );
}
```

#### Pattern 2: Using Feature Hooks

```tsx
// features/dashboard/components/SectionCards.tsx
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card";

import { useDashboard } from "../hooks/useDashboard";

export function SectionCards() {
  const { metricCards, isLoading } = useDashboard();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
```

#### Pattern 3: Creating a Feature Component

```tsx
// features/auth/components/LoginForm.tsx
import { useState } from "react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import { useAuth } from "../hooks/useAuth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" disabled={isLoggingIn}>
        {isLoggingIn ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
```

---

## Enterprise Features

### 🏗️ Architecture Features

#### Feature-Driven Development

- **Self-contained features**: Each business feature (`auth`, `dashboard`) contains all related code
- **Clear boundaries**: Components, hooks, types, and API logic co-located
- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Feature-specific concerns are isolated

#### Advanced State Management

- **RTK Query integration**: Separate public/protected API layers
- **Automatic caching**: Smart cache invalidation and background updates
- **Loading states**: Built-in loading and error states
- **Optimistic updates**: Immediate UI feedback with rollback on errors

#### Enterprise Routing

- **Authentication guards**: Route-level protection with role-based access
- **Lazy loading**: Route-based code splitting for optimal performance
- **Type-safe paths**: Centralized path constants with TypeScript support
- **Nested layouts**: Flexible layout composition

### 🛡️ Production-Ready Features

#### Error Handling & Monitoring

- **Global error boundaries**: Graceful error recovery with user-friendly messages
- **Sentry integration**: Production error tracking and performance monitoring
- **Route error boundaries**: Specific error handling for navigation issues
- **Loading states**: Consistent loading indicators throughout the app

#### Internationalization (i18n)

- **Multi-language support**: Ready for localization
- **Centralized translations**: Organized by feature and page
- **Type-safe keys**: TypeScript support for translation keys

### 🚀 Performance Optimizations

#### Code Splitting Strategy

- **14 optimized chunks**: Intelligent bundling for minimal load times
- **Vendor separation**: React, routing, state management in separate chunks
- **Feature isolation**: Auth and dashboard features load independently
- **Lazy loading**: Components load only when needed

#### Bundle Analysis

```
📊 Build Output:
├── react-vendor:        767.96 kB (React ecosystem)
├── vendor:              301.78 kB (Other libraries)
├── dashboard-feature:    61.64 kB (Dashboard components)
├── auth-feature:         18.05 kB (Auth components)
├── sentry-vendor:        75.00 kB (Error monitoring)
├── i18n-vendor:          42.38 kB (Internationalization)
└── app chunks:           ~50 kB (Application code)
```

### 🛠️ Developer Experience

#### Path Aliases

```json
{
  "@/*": ["./src/*"],
  "@components/*": ["./src/components/*"],
  "@features/*": ["./src/features/*"],
  "@store/*": ["./src/store/*"],
  "@routes/*": ["./src/routes/*"]
}
```

#### Type Safety

- **Full TypeScript coverage**: Strict typing throughout the application
- **API type safety**: RTK Query provides automatic types from API responses
- **Path type safety**: Centralized routing with type-safe path constants
- **Component props**: Strict prop validation and IntelliSense support

### 📁 Project Structure

```
src/
├── features/             # 🚀 Business features
│   ├── auth/            # Authentication feature
│   └── dashboard/       # Dashboard feature
├── components/          # 🧱 Shared components
│   ├── layouts/         # Layout wrappers
│   ├── partials/        # Route guards
│   └── error/           # Error handling
├── routes/              # 🧭 Routing system
├── store/               # 🔄 RTK Query + Redux
├── config/              # ⚙️ App configuration
├── providers/           # ⚡ Context providers
├── utils/               # 🛠️ Utilities
├── locales/             # 🌍 i18n files
└── common/              # 🔗 Shared hooks
```

---

## Customization Guide

### Adding a New Feature

1. **Create feature structure:**

```bash
mkdir -p src/features/my-feature/{components,hooks,types}
```

2. **Add feature exports:**

```tsx
// src/features/my-feature/index.ts
export { MyComponent } from "./components/MyComponent";
export { useMyFeature } from "./hooks/useMyFeature";
export type { MyFeatureData } from "./types";
```

3. **Create route:**

```tsx
// src/routes/my-feature.route.tsx
import { lazy } from "react";

const MyFeaturePage = lazy(() => import("../pages/MyFeaturePage"));

export const myFeatureRoutes = [
  {
    path: "/my-feature",
    element: <MyFeaturePage />,
  },
];
```

### Navigation

**File:** `src/features/dashboard/components/AppSidebar.tsx`

```tsx
const navigationData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Analytics", // Add new menu item
      url: "/app/analytics",
      icon: IconChartBar,
    },
  ],
};
```

### Metrics Cards

**File:** `src/features/dashboard/components/SectionCards.tsx`

```tsx
// Use the useDashboard hook to get metric data
const { metricCards } = useDashboard();

// Or customize with your own data
const customMetrics = [
  {
    title: "Custom Metric",
    value: "$1,250.00",
    description: "Your custom KPI",
    trend: { value: 12.5, direction: "up" as const },
  },
];
```

### Data Tables

**File:** `src/features/dashboard/components/DataTable.tsx`

1. **Define your data schema:**

```tsx
import { z } from "zod";

export const myDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  createdAt: z.string(),
});
```

2. **Update table columns:**

```tsx
const columns: ColumnDef<z.infer<typeof myDataSchema>>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
];
```

### Charts

**File:** `src/features/dashboard/components/ChartAreaInteractive.tsx`

```tsx
import { ChartConfig, ChartContainer } from "@workspace/ui/components/chart";
import { Bar, BarChart, ResponsiveContainer } from "recharts";

export function CustomChart() {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const chartData = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    // ... your data
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <Bar dataKey="revenue" fill="var(--color-revenue)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

---

## Styling & Theming

### CSS Custom Properties

```css
--sidebar-width: calc(var(--spacing) * 72)
  --header-height: calc(var(--spacing) * 12);
```

### Sidebar Colors

```css
--sidebar-background
--sidebar-foreground
--sidebar-primary
--sidebar-accent
--sidebar-border
```

### Container Queries

```tsx
className = "@container/main"; // Define container
className = "@xl/main:grid-cols-2"; // Query the container
```

---

## API Integration

### RTK Query Integration

The app uses RTK Query for all API interactions with separate public and protected API layers.

#### Public API (No Auth Required)

```tsx
// src/store/apis/authPublic.api.ts
export const authPublicApi = publicApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    // Other public endpoints...
  }),
});
```

#### Protected API (Auth Required)

```tsx
// src/store/apis/authProtected.api.ts
export const authProtectedApi = protectedApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => "/users/profile",
    }),
    // Other protected endpoints...
  }),
});
```

### Using API Hooks

```tsx
// In components
import { useGetProfileQuery, useLoginMutation } from "@/store/apis";

export function ProfileComponent() {
  const { data: profile, isLoading, error } = useGetProfileQuery();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  // Component logic...
}
```

### Feature-Specific APIs

Create API endpoints within feature directories:

```tsx
// src/features/dashboard/api/dashboard.api.ts
export const dashboardApi = protectedApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      query: () => "/dashboard/data",
    }),
  }),
});
```

---

## Best Practices

### ✅ Enterprise Architecture Principles

#### Feature Organization

- **Self-contained features**: Keep all feature-related code together (components, hooks, types, API)
- **Clear boundaries**: Don't mix feature code between different business domains
- **Feature exports**: Use index.ts files for clean feature imports
- **Type safety**: Define types within feature directories

#### Component Layering

```
✅ DO: Feature → Shared → UI Primitives
❌ DON'T: Skip layers or mix concerns
```

#### State Management

- **RTK Query for APIs**: Use RTK Query for all server state
- **Redux for UI state**: Use Redux only for complex UI state
- **Separate API layers**: Public APIs vs Protected APIs
- **Feature-specific APIs**: Co-locate API logic with features

### ✅ Code Quality

#### TypeScript Best Practices

- **Strict typing**: Enable strict mode and no implicit any
- **Interface definitions**: Define interfaces for all data structures
- **Generic constraints**: Use proper generic constraints
- **Path mapping**: Leverage TypeScript path aliases

#### Performance

- **Lazy loading**: Use React.lazy for route components
- **Code splitting**: Leverage Vite's chunk splitting
- **Memoization**: Use React.memo for expensive components
- **Bundle analysis**: Monitor bundle sizes regularly

### ✅ Development Workflow

#### Feature Development

1. **Create feature structure**: `src/features/my-feature/{components,hooks,types}`
2. **Define types first**: Strong typing prevents runtime errors
3. **Implement hooks**: Business logic in custom hooks
4. **Build components**: Use feature hooks for data
5. **Add routing**: Lazy load feature routes
6. **Update navigation**: Add to dashboard sidebar if needed

#### API Integration

1. **Choose API layer**: Public or protected based on auth requirements
2. **Define endpoints**: RTK Query mutations and queries
3. **Handle loading states**: Use RTK Query's built-in loading states
4. **Error handling**: Leverage RTK Query error handling
5. **Cache management**: Configure appropriate cache tags

### ❌ Anti-Patterns

#### Architecture Violations

- **Mixed concerns**: Don't put business logic in shared components
- **Tight coupling**: Avoid direct imports between unrelated features
- **Global state abuse**: Don't use Redux for simple component state
- **API mixing**: Don't mix public and protected endpoints in same slice

#### Code Quality Issues

- **Any types**: Never use `any` - always define proper types
- **Large components**: Break down components larger than 100 lines
- **Missing error handling**: Always handle loading and error states
- **Unused imports**: Clean up imports regularly

### 🔍 Decision Guides

#### Where to put code?

```
Business logic with data?
├─ YES → Features layer (src/features/)
│   ├── API calls, data transformations
│   └── Business rules and workflows
│
└─ NO → What type of code?
    ├─ Reusable across features?
    │   └─ YES → Shared layer (src/components/)
    │       ├── Layouts, route guards
    │       └── Error boundaries
    │
    │   └─ NO → UI primitives (@workspace/ui)
    │       └── Buttons, cards, inputs
    │
    └─ Infrastructure?
        ├─ Routing → src/routes/
        ├─ State → src/store/
        ├─ Config → src/config/
        └─ Utils → src/utils/
```

#### Which API layer?

```
Requires authentication?
├─ YES → Protected API (src/store/apis/*Protected.api.ts)
│   ├── User profiles, business data
│   └── Authenticated operations
│
└─ NO → Public API (src/store/apis/*Public.api.ts)
    ├── Login, registration
    └── Public information
```

---

## Troubleshooting

### Sidebar not showing

- Ensure `SidebarProvider` wraps the layout
- Check CSS custom properties are defined
- Verify imports from `@workspace/ui`

### Container queries not working

- Ensure parent has `@container/main` class
- Check browser support
- Verify Tailwind CSS container queries plugin

### Chart not rendering

- Check data format matches expected structure
- Ensure recharts is installed
- Verify ChartConfig is properly typed

### Theme switching not working

- Check `ThemeProvider` wraps the app in `main.tsx`
- Verify `next-themes` is installed

---

## Cheat Sheet

| Task                     | Location/Command                                            | Notes                         |
| ------------------------ | ----------------------------------------------------------- | ----------------------------- |
| **Add new feature**      | `mkdir -p src/features/my-feature/{components,hooks,types}` | Create feature structure      |
| **Add menu item**        | `src/features/dashboard/components/AppSidebar.tsx`          | Update navigation data        |
| **Change metrics**       | `src/features/dashboard/components/SectionCards.tsx`        | Use useDashboard hook         |
| **Modify table**         | `src/features/dashboard/components/DataTable.tsx`           | Update schema & columns       |
| **Add API endpoint**     | `src/store/apis/`                                           | Choose public/protected layer |
| **Add route**            | `src/routes/`                                               | Use lazy loading              |
| **Add shared component** | `src/components/`                                           | Layouts, partials, or error   |
| **Add UI primitive**     | `packages/ui/src/components/`                               | Buttons, cards, inputs        |

---

## Architecture Comparison

### Before vs After Migration

| Aspect             | Before (Simple) | After (Enterprise)         |
| ------------------ | --------------- | -------------------------- |
| **Structure**      | Flat components | Feature-driven layers      |
| **State**          | Basic Redux     | RTK Query + Redux          |
| **Routing**        | Inline routes   | Modular + lazy loading     |
| **Error Handling** | Basic try/catch | Global boundaries + Sentry |
| **Code Splitting** | None            | 14 optimized chunks        |
| **Type Safety**    | Basic           | Full TypeScript coverage   |
| **API**            | Direct fetch    | RTK Query with caching     |

### Architecture Benefits

#### 🚀 **Scalability**

- **Feature isolation**: Add features without affecting others
- **Team collaboration**: Multiple teams can work on different features
- **Code splitting**: Features load independently
- **Type safety**: Prevents runtime errors

#### 🔧 **Maintainability**

- **Clear structure**: Easy to find and modify code
- **Separation of concerns**: Each layer has a single responsibility
- **Consistent patterns**: Standardized approach across features
- **Documentation**: Self-documenting architecture

#### ⚡ **Performance**

- **Lazy loading**: Components load on demand
- **Code splitting**: Optimized bundle sizes
- **Caching**: RTK Query automatic caching
- **Monitoring**: Performance tracking with Sentry

#### 🛡️ **Reliability**

- **Error boundaries**: Graceful error handling
- **Type safety**: Compile-time error prevention
- **Testing ready**: Architecture supports comprehensive testing
- **Production monitoring**: Error tracking and analytics

---

## Enterprise Architecture Summary

This application now follows **enterprise-grade architecture** with:

| Layer              | Purpose             | Technologies                 | Examples                   |
| ------------------ | ------------------- | ---------------------------- | -------------------------- |
| **Features**       | Business logic      | React, TypeScript, RTK Query | Auth, Dashboard            |
| **Shared**         | Reusable components | React, TypeScript            | Layouts, Route guards      |
| **UI**             | Design system       | shadcn/ui, Tailwind          | Buttons, Cards, Tables     |
| **Infrastructure** | App foundation      | Vite, Redux, Sentry          | Routing, State, Monitoring |

**🎯 Key Achievements:**

- ✅ **14 optimized chunks** with intelligent code splitting
- ✅ **Feature-driven development** for scalability
- ✅ **Enterprise error handling** with Sentry monitoring
- ✅ **Full TypeScript coverage** with strict typing
- ✅ **RTK Query integration** for efficient API management
- ✅ **Production-ready** with monitoring and error tracking

**🚀 Ready for Enterprise Development!**

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [shadcn/ui Blocks](https://ui.shadcn.com/blocks)
- [Tailwind CSS](https://tailwindcss.com)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [React Router](https://reactrouter.com)
- [Vite](https://vitejs.dev)
- [Sentry](https://sentry.io)

---

**Built with** ❤️ **using Enterprise Architecture, React, TypeScript, Vite, RTK Query, and shadcn/ui**
