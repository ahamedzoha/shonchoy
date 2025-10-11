# @workspace/ui

A shared UI component library built with shadcn/ui, Tailwind CSS v4, Radix UI, and Lucide icons for the monorepo.

## Overview

This package contains reusable UI components, utilities, and styles that are shared across applications in the monorepo. It uses the latest shadcn/ui setup with Tailwind CSS v4 for optimal performance and developer experience.

## File Structure

```
packages/ui/
├── src/
│   ├── components/          # UI components (Button, Card, Input, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── utils.ts        # Utility functions (cn, etc.)
│   │   └── ...
│   └── styles/
│       └── globals.css     # Global Tailwind styles
├── components.json         # shadcn/ui configuration
├── package.json
└── tsconfig.json
```

## Adding Components

To add new shadcn/ui components to this package, run the `add` command from within the ui package directory (e.g., `packages/ui`):

```bash
cd packages/ui
npx shadcn@canary add [COMPONENT]
```

The CLI will automatically:

- Install the component in `packages/ui/src/components/`
- Install any required dependencies in `packages/ui/package.json`
- Update import paths in your app components

### Examples

```bash
# Add a single component
npx shadcn@canary add button

# Add multiple components at once
npx shadcn@canary add input label textarea

# Add a component block (includes multiple components)
npx shadcn@canary add login-01
```

## Importing Components

Import components from the `@workspace/ui` package:

```tsx
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
```

Import utilities and hooks:

```tsx
import { cn } from "@workspace/ui/lib/utils";

// import { useTheme } from "@workspace/ui/hooks/use-theme" // When available
```

## Configuration

### components.json

The `components.json` file configures how shadcn/ui installs components:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils",
    "hooks": "@workspace/ui/hooks",
    "lib": "@workspace/ui/lib",
    "ui": "@workspace/ui/components"
  }
}
```

### Package.json Exports

The package exports are configured to support tree-shaking and proper module resolution:

```json
{
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./postcss.config": "./postcss.config.mjs",
    "./lib/*": "./src/lib/*.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

## Requirements

1. **components.json**: Every workspace must have a `components.json` file that defines aliases and configuration.

2. **Consistent Configuration**: Ensure the same `style`, `iconLibrary`, and `baseColor` in both app and UI package `components.json` files.

3. **Tailwind CSS v4**: The monorepo uses Tailwind CSS v4. Leave the `tailwind.config` field empty in `components.json`.

4. **TypeScript**: All components are written in TypeScript with proper type definitions.

## Development

### Building

The UI package is built using Turborepo. Run the build command from the monorepo root:

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

### Adding Custom Components

When adding custom components to this package:

1. Place component files in `src/components/`
2. Export from `src/index.ts` if using barrel exports (not recommended for tree-shaking)
3. Use the `@workspace/ui/lib/utils` for utility functions
4. Follow the existing patterns for styling and TypeScript types

### Styling Guidelines

- Use Tailwind CSS classes with CSS variables for theming
- Leverage the `cn` utility for conditional classes
- Follow the New York style variant conventions
- Use Radix UI primitives for accessibility and functionality

## Dependencies

This package includes:

- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS v4**: Utility-first CSS framework
- **Lucide Icons**: Beautiful icon library
- **Class Variance Authority**: Type-safe component variants
- **clsx/tailwind-merge**: Optimized class merging

## Troubleshooting

### Import Path Issues

If you encounter import path issues, ensure:

- The `components.json` aliases are correctly configured
- You're running the `shadcn add` command from the app directory, not the UI package directory
- The package exports in `package.json` match the file structure

### Component Not Found

When a component can't be found:

- Verify the component was added using `npx shadcn@canary add`
- Check that the component file exists in `src/components/`
- Ensure the import path uses `@workspace/ui/components/[component-name]`

### Styling Issues

For styling problems:

- Verify Tailwind CSS v4 is properly configured
- Check that `globals.css` is imported in your app
- Ensure CSS variables are defined for the theme

## Contributing

When contributing to this UI package:

1. Follow the existing code patterns and TypeScript conventions
2. Test components across different apps in the monorepo
3. Update this README when adding new components or changing structure
4. Ensure proper accessibility with Radix UI primitives

## Related Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [Monorepo Setup Guide](https://ui.shadcn.com/docs/monorepo)
