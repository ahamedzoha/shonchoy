# Shonchoy Monorepo

A modern full-stack monorepo built with Turborepo, featuring Next.js, Vite React, Express API, and shared UI components with Tailwind CSS.

## 🏗️ Project Structure

```
shonchoy/
├── apps/
│   ├── landing/          # Next.js landing page (port 3000)
│   ├── react-app/              # Vite React web app (port 3001)
│   ├── api/              # Express.js API server (port 3002)
│   └── nestjs-api/       # Future NestJS API (placeholder)
├── packages/
│   ├── ui/               # Shared React UI components with Tailwind
│   ├── eslint-config/    # Shared ESLint configurations
│   ├── typescript-config/# Shared TypeScript configurations
│   └── tailwind-config/  # Shared Tailwind CSS configurations
└── turbo.json           # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd shonchoy

# Install all dependencies
npm install

# Build all packages
npm run build
```

## 🛠️ Development

### Run All Applications

```bash
# Start all apps in development mode
npm run dev
```

This will start:

- **Landing Page**: http://localhost:3000 (Next.js)
- **React App**: http://localhost:3001 (Vite React)
- **API Server**: http://localhost:3002 (Express)

### Run Individual Applications

```bash
# Start only the react app (Vite React)
npm run dev:react-app

# Start only the landing page (Next.js)
npm run dev:landing

# Start only the API server (Express)
npm run dev:api
```

### Build & Production

```bash
# Build all applications
npm run build

# Start production servers
npm run start

# Start only API in production
npm run start:api
```

## 📦 Applications

### Landing Page (Next.js)

- **Path**: `apps/landing`
- **Port**: 3000
- **Framework**: Next.js 15 with App Router
- **Features**: Server-side rendering, static generation, TypeScript

### React App (Vite React)

- **Path**: `apps/react-app`
- **Port**: 3001
- **Framework**: Vite + React 19
- **Features**: Fast HMR, modern build tooling, TypeScript

### API Server (Express)

- **Path**: `apps/api`
- **Port**: 3002
- **Framework**: Express.js with TypeScript
- **Features**: REST API, CORS, security middleware, compression

### Shared UI Package

- **Path**: `packages/ui`
- **Features**:
  - React components with TypeScript
  - Tailwind CSS styling
  - Dual module builds (ESM/CJS)
  - Shared across all apps

## 🎨 Styling

This monorepo uses **Tailwind CSS 4** with a shared configuration:

- Shared Tailwind config in `packages/tailwind-config/`
- UI components styled with Tailwind classes
- Consistent design system across all apps
- Hot reloading for styles in development

## 🔧 Scripts

| Script                | Description                        |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Start all apps in development mode |
| `npm run build`       | Build all applications             |
| `npm run lint`        | Lint all packages                  |
| `npm run check-types` | Type check all packages            |
| `npm run format`      | Format code with Prettier          |

## 🏃‍♂️ Turborepo Features

- **Smart caching**: Build outputs are cached and shared
- **Parallel execution**: Tasks run in parallel when possible
- **Dependency-aware**: Builds dependencies before dependents
- **Terminal UI**: Interactive terminal interface for monitoring builds

## 🔮 Future Enhancements

### NestJS API (Planned)

- **Path**: `apps/nestjs-api` (placeholder ready)
- **Features**: Enterprise-grade API with decorators, guards, pipes
- **Setup**: See `apps/nestjs-api/README.md` for implementation guide

### Potential Additions

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Authentication system
- [ ] Testing setup (Jest/Vitest)
- [ ] Docker configuration
- [ ] CI/CD pipeline
- [ ] Storybook for UI components
- [ ] Documentation site

## 🛡️ Code Quality

- **TypeScript**: Strict typing across all packages
- **ESLint**: Shared linting rules and configurations
- **Prettier**: Consistent code formatting
- **Type checking**: Automated type validation

## 📝 Development Tips

1. **Hot Reloading**: All apps support hot module replacement
2. **Shared Components**: Import from `@repo/ui` in any app
3. **Shared Styles**: Import CSS from `@repo/ui/styles.css`
4. **Type Safety**: Full TypeScript support with shared configs
5. **Build Optimization**: Turborepo caches builds for faster iterations

## 🤝 Contributing

1. Make changes in the appropriate app or package
2. Run `npm run build` to ensure everything builds
3. Run `npm run lint` to check code quality
4. Run `npm run check-types` to validate TypeScript

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using [Turborepo](https://turbo.build/repo)
