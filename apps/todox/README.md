# @beep/todox

Next.js 16 application demonstrating shadcn/ui component library integration with Effect patterns.

## Purpose

TodoX is a showcase application built with Next.js 16 App Router, featuring:
- shadcn/ui component library with custom theming
- Effect-based utilities for functional data transformations
- Collapsible sidebar navigation with team switcher
- Dark mode support via next-themes
- TypeScript strict mode with comprehensive type safety

This app serves as a reference implementation for UI patterns and component composition in the beep-effect monorepo.

## Installation

```bash
# This package is internal to the monorepo
# Navigate to the app directory:
cd apps/todox

# Install dependencies (from monorepo root):
bun install
```

## Package Structure

```
apps/todox/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout with theme provider
│   │   └── page.tsx        # Main page with sidebar demo
│   ├── components/
│   │   ├── sidebar/        # Custom sidebar components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── nav-main.tsx
│   │   │   ├── nav-projects.tsx
│   │   │   ├── nav-user.tsx
│   │   │   └── team-switcher.tsx
│   │   ├── ui/             # shadcn/ui components (48 components)
│   │   ├── component-example.tsx
│   │   ├── example.tsx
│   │   ├── mode-toggle.tsx
│   │   └── theme-provider.tsx
│   └── lib/
│       └── utils.ts        # Utility functions (cn, etc.)
├── public/
│   └── logo.avif           # Application logo
├── components.json         # shadcn/ui configuration
└── package.json
```

## Key Dependencies

### Internal @beep Packages

| Package            | Purpose                           | Usage                                     |
|--------------------|-----------------------------------|-------------------------------------------|
| `@beep/shared-env` | Environment configuration         | Client environment access via `clientEnv` |
| `@beep/constants`  | Schema-backed enums and constants | Shared constants                          |
| `@beep/errors`     | Error handling utilities          | Error types and logging                   |
| `@beep/schema`     | Effect Schema utilities           | Schema validation                         |
| `@beep/utils`      | Pure runtime helpers              | Functional utilities                      |
| `@beep/invariant`  | Assertion contracts               | Runtime assertions                        |
| `@beep/identity`   | Package identity                  | Package metadata                          |
| `@beep/types`      | Compile-time types                | Type definitions                          |

### Slice Dependencies

| Package                  | Purpose                              |
|--------------------------|--------------------------------------|
| `@beep/documents-server` | Document management server layer     |
| `@beep/iam-client`       | Authentication client contracts      |
| `@beep/iam-domain`       | IAM domain models                    |
| `@beep/iam-server`       | Authentication server infrastructure |
| `@beep/runtime-client`   | Browser ManagedRuntime               |
| `@beep/runtime-server`   | Server ManagedRuntime                |
| `@beep/shared-domain`    | Cross-slice domain entities          |

### DevDependencies

| Package             | Purpose                  |
|---------------------|--------------------------|
| `@beep/build-utils` | Next.js config utilities |

## Path Aliases

The app uses `@beep/todox/*` as the primary path alias:

```typescript
// Maps to src/* for internal imports
import { AppSidebar } from "@beep/todox/components/sidebar"
import { Button } from "@beep/todox/components/ui/button"
import { cn } from "@beep/todox/lib/utils"
```

**CRITICAL**: Always use `@beep/todox/*` for internal imports, never relative paths.

## Effect Pattern Usage

This application demonstrates correct Effect patterns in React components:

### Namespace Imports

```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
```

### Functional Transformations with Pipe

```tsx
// From component-example.tsx
const items = F.pipe(
  roleItems,
  A.map((item) => (
    <SelectItem key={item.value} value={item.value}>
      {item.label}
    </SelectItem>
  ))
)
```

### NEVER Use Native Methods

```typescript
// FORBIDDEN
const namesInvalid = items.map(x => x.name)

// REQUIRED
const namesProper = F.pipe(items, A.map(x => x.name))
```

## Component Architecture

### shadcn/ui Components

The app includes 48 shadcn/ui components in `src/components/ui/`:
- Accordion, Alert, AlertDialog, AspectRatio, Avatar
- Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart
- Checkbox, Collapsible, Combobox, Command, ContextMenu
- Dialog, Drawer, DropdownMenu, Field
- HoverCard, Input, InputGroup, InputOTP
- Label, Menubar, NavigationMenu
- Pagination, Popover, Progress
- RadioGroup, ResizablePanels, ScrollArea, Select, Separator, Sheet
- Sidebar, Skeleton, Slider, Sonner, Switch
- Tabs, Textarea, Toast, Toggle, ToggleGroup, Tooltip

### Custom Components

#### Sidebar System

```tsx
// From app-sidebar.tsx
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail }
  from "@beep/todox/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
```

#### Theme Provider

```tsx
// From layout.tsx
import { ThemeProvider } from "@beep/todox/components/theme-provider"
import { clientEnv } from "@beep/shared-env"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Development Workflow

### Commands

| Command             | Description                                                 |
|---------------------|-------------------------------------------------------------|
| `bun run dev`       | Start dev server with Turbopack and Claude Code integration |
| `bun run dev:https` | Start dev server with HTTPS                                 |
| `bun run build`     | Production build                                            |
| `bun run start`     | Start production server                                     |
| `bun run check`     | TypeScript type checking                                    |
| `bun run lint`      | Biome linting                                               |
| `bun run lint:fix`  | Biome auto-fix                                              |
| `bun run test`      | Run tests                                                   |

### Environment Access

```typescript
import { clientEnv } from "@beep/shared-env"

const isDev = clientEnv.env === "dev"
```

**NEVER** access `process.env` directly. Always use `@beep/shared-env`.

## Integration Points

- **Consumed by**: N/A (standalone application)
- **Depends on**:
  - `@beep/shared-env` for configuration
  - Various `@beep/*` packages for utilities and infrastructure
  - shadcn/ui for component library
- **Communicates with**: Server slices via RPC (when integrated)

## Testing Patterns

Place test files adjacent to source files or in `__tests__/` directories:

```typescript
import * as Effect from "effect/Effect"
import { describe, it, expect } from "bun:test"

describe("ComponentExample", () => {
  it("should render correctly", () => {
    // Test implementation
  })
})
```

## Best Practices

1. **Always use Effect utilities** instead of native JavaScript methods
2. **Use namespace imports** for all Effect modules (`import * as Effect from "effect/Effect"`)
3. **Use `@beep/todox/*` path alias** for all internal imports
4. **Follow shadcn/ui patterns** for component composition
5. **Use ThemeProvider** for dark mode support
6. **Leverage Effect's pipe** for data transformations
7. **Never use `any`, `@ts-ignore`, or unchecked casts**
8. **Always validate external data** with `@beep/schema`

## Common Patterns

### Adding New Components

```bash
# Use shadcn CLI to add components
bunx shadcn add <component-name>
```

### Creating Custom Components

```tsx
import * as React from "react"
import * as F from "effect/Function"
import * as A from "effect/Array"
import { cn } from "@beep/todox/lib/utils"
import { Button } from "@beep/todox/components/ui/button"

export function CustomComponent({ items }: { items: string[] }) {
  return (
    <div>
      {F.pipe(
        items,
        A.map(item => <Button key={item}>{item}</Button>)
      )}
    </div>
  )
}
```

### Environment-Dependent Features

```tsx
import { clientEnv } from "@beep/shared-env"

// Conditional feature flags
const enableDebugTools = clientEnv.env === "dev"

// Conditional script loading
{clientEnv.env === "dev" && (
  <Script src="//unpkg.com/react-grab/dist/index.global.js" strategy="beforeInteractive" />
)}
```

## See Also

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Effect Documentation](https://effect.website)
- [Root CLAUDE.md](../../CLAUDE.md) — Monorepo-wide patterns
- [Shared Environment](../../packages/shared/env/AGENTS.md) — Environment configuration
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md) — Effect-specific patterns
