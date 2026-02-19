# @beep/todox

Next.js 16 application demonstrating Material UI theming with shadcn/ui components and Effect patterns.

## Overview

TodoX is a showcase application featuring:
- MUI theming with custom component overrides
- shadcn/ui components (49 components)
- Multi-panel layout (mini sidebar + main sidebar + content + side panel)
- Mail application with inbox, compose, detail views
- Rich text editor (Tiptap with custom extensions)
- Comprehensive provider architecture (IAM, Theme, i18n)

## Package Structure

```
apps/todox/src/
├── app/                # Next.js App Router pages
├── components/
│   ├── ai-chat/        # AI chat panel
│   ├── mini-sidebar/   # App selection sidebar
│   ├── navbar/         # Top navbar (search, notifications, user)
│   ├── side-panel/     # Contextual action panel
│   ├── sidebar/        # Main content sidebar
│   └── ui/             # shadcn/ui components (49)
├── features/
│   ├── editor/         # Tiptap rich text editor
│   └── mail/           # Mail application
├── lib/                # Utilities (cn, etc.)
├── theme/              # MUI theme configuration
├── types/              # TypeScript definitions
└── global-providers.tsx
```

## Dependencies

### Internal @beep Packages

| Package | Purpose |
|---------|---------|
| `@beep/shared-env` | Environment configuration |
| `@beep/schema` | Effect Schema utilities |
| `@beep/ui` | Main UI library with MUI |
| `@beep/ui-core` | Core UI configuration |
| `@beep/iam-ui` | IAM UI components |
| `@beep/runtime-client` | Browser ManagedRuntime |

## Path Aliases

```typescript
// Maps to src/* for internal imports
import { AppSidebar } from "@beep/todox/components/sidebar"
import { Button } from "@beep/todox/components/ui/button"
```

**CRITICAL**: Always use `@beep/todox/*` for internal imports, never relative paths.

## Effect Patterns

### Namespace Imports

```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
```

### Functional Transformations

```tsx
// FORBIDDEN
const names = items.map(x => x.name)

// REQUIRED
const names = F.pipe(items, A.map(x => x.name))
```

## Component Architecture

### Theme System

MUI theming with custom overrides in `src/theme/`:

| File | Purpose |
|------|---------|
| `colors.ts` | Color scheme definitions |
| `shadows.ts` | Shadow definitions |
| `typography.ts` | Typography overrides |
| `theme.tsx` | Main theme with component overrides |
| `components/` | MUI component-specific overrides |

### shadcn/ui Components

49 components in `src/components/ui/`:
- Layout: accordion, card, carousel, collapsible, dialog, drawer, popover, sheet, sidebar
- Form: button, checkbox, input, radio-group, select, slider, switch, textarea, toggle
- Display: alert, avatar, badge, calendar, chart, progress, skeleton, table, tabs
- Navigation: breadcrumb, command, context-menu, dropdown-menu, menubar, navigation-menu, pagination

### Custom Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AIChatPanel` | `components/ai-chat/` | Collapsible AI chat with localStorage |
| `TopNavbar` | `components/navbar/` | Team/workspace selectors, search, notifications |
| `MiniSidebar` | `components/mini-sidebar/` | App switching (Mail, Tasks, Files, etc.) |
| `MainContentPanelSidebar` | `components/sidebar/` | Nav menu, projects, user profile |
| `SidePanel` | `components/side-panel/` | Resizable contextual panel |

### Features

| Feature | Location | Components |
|---------|----------|------------|
| Mail | `features/mail/` | MailList, MailDetails, MailCompose, MailNav |
| Editor | `features/editor/` | Tiptap editor with BubbleToolbar, CodeHighlight, ImageBlock |

### Global Provider Architecture

```tsx
<BeepProvider>                    {/* Effect runtime */}
  <I18nProvider>                  {/* Internationalization */}
    <SettingsProvider>            {/* App settings */}
      <LocalizationProvider>      {/* Date/number formatting */}
        <ThemeProvider>           {/* MUI theme */}
          <IamProvider>           {/* Authentication */}
            {children}
          </IamProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </SettingsProvider>
  </I18nProvider>
</BeepProvider>
```

## Development

### Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun run check` | TypeScript type checking |
| `bun run lint:fix` | Biome auto-fix |

### Environment Access

```typescript
import { clientEnv } from "@beep/shared-env"
const isDev = clientEnv.env === "dev"
```

**NEVER** access `process.env` directly.

## MUI + shadcn/ui Integration

### Why Both Libraries?

- **Material UI**: Theming system, complex components (DataGrid, DatePickers)
- **shadcn/ui**: Lightweight Radix-based primitives

### Integration Pattern

```tsx
import { themeOverrides } from "@beep/todox/theme"  // MUI theme
import { Button } from "@beep/todox/components/ui/button"  // shadcn

<ThemeProvider themeOverrides={themeOverrides}>
  <MuiButton variant="contained">MUI</MuiButton>
  <Button variant="outline">shadcn</Button>
</ThemeProvider>
```

## Common Patterns

### Adding shadcn Components

```bash
bunx shadcn add <component-name>
```

### Creating Components

```tsx
import * as F from "effect/Function"
import * as A from "effect/Array"
import { cn } from "@beep/todox/lib/utils"

export function CustomComponent({ items }: { items: string[] }) {
  return (
    <div>
      {F.pipe(items, A.map(item => <Button key={item}>{item}</Button>))}
    </div>
  )
}
```

### Feature-Based Organization

```
features/[feature-name]/
├── components/       # Feature-specific components
├── provider/         # State management (React Context)
├── view/             # Top-level views
├── [feature].tsx     # Main component
└── index.ts          # Public exports
```

## Best Practices

1. **Always use Effect utilities** instead of native methods
2. **Use namespace imports** for Effect modules
3. **Use `@beep/todox/*` path alias** for internal imports
4. **Follow shadcn/ui patterns** for Radix-based composition
5. **Never use `any`, `@ts-ignore`, or unchecked casts**
6. **Always validate external data** with `@beep/schema`

## See Also

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Effect Documentation](https://effect.website)
- [Root AGENTS.md](../../AGENTS.md) — Monorepo patterns
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md)
