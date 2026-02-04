---
path: packages/ui/ui
summary: React component library composing MUI, shadcn, and Tailwind with atomic design hierarchy
tags: [ui, react, mui, shadcn, tailwind, components, layouts, providers, forms]
---

# @beep/ui

Opinionated React component library composing `@beep/ui-core` theme primitives with MUI, shadcn components, Tailwind utilities, and specialty stacks (Framer Motion, Lexical editor, TanStack Form). Follows atomic design principles.

## Architecture

```
|------------------|     |-------------------|     |-----------------|
|  @beep/ui-core   | --> |   ThemeProvider   | --> |   MUI + Shadcn  |
|------------------|     |-------------------|     |-----------------|
        |                         |                        |
        v                         v                        v
|------------------|     |-------------------|     |-----------------|
|  SettingsContext |     |   AuthAdapter     |     |   Tailwind CSS  |
|------------------|     |-------------------|     |-----------------|
        |
        v
|------------------|     |-------------------|
|  atoms/molecules | --> | organisms/sections|
|------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/theme/theme-provider.tsx` | MUI ThemeProvider with settings + RTL integration |
| `src/settings/context/` | Settings state management, persistence |
| `src/settings/drawer/` | UI controls for theme customization |
| `src/providers/` | AuthAdapterProvider, breakpoints, bulk-select |
| `src/atoms/` | Iconify, Label, Image, FileThumbnail, SvgColor |
| `src/molecules/` | EmptyContent, Scrollbar, Snackbar, FiltersResult |
| `src/organisms/` | Table, CustomPopover, ConfirmDialog, Tabs |
| `src/sections/` | Error pages, feature sections |
| `src/layouts/` | Dashboard, Main, Auth, Simple layouts |
| `src/inputs/` | ColorPicker, Emoji, PhoneInput, OTP, Upload |
| `src/form/` | TanStack Form integration, form groups |
| `src/routing/` | NavSection, NavBasic, Breadcrumbs |
| `src/hooks/` | Storage hooks, breakpoints, stable hooks |
| `src/i18n/` | Bridge to @beep/ui-core locale configuration |
| `src/animate/` | Framer Motion variants, scroll progress |
| `src/styles/globals.css` | Tailwind + CSS variables + SimpleBar styles |

## Usage Patterns

### Theme and Settings Setup

```typescript
import * as React from "react";
import { ThemeProvider } from "@beep/ui/theme";
import { SettingsProvider } from "@beep/ui/settings/context";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </SettingsProvider>
);
```

### Using Atomic Components

```typescript
import * as React from "react";
import { Label } from "@beep/ui/atoms/label";
import { Scrollbar } from "@beep/ui/molecules/scrollbar";
import { CustomPopover } from "@beep/ui/organisms/custom-popover";

export const MyComponent: React.FC = () => (
  <Scrollbar>
    <Label color="primary">Status</Label>
    <CustomPopover>
      {/* content */}
    </CustomPopover>
  </Scrollbar>
);
```

### Layout Composition

```typescript
import * as React from "react";
import { DashboardLayout } from "@beep/ui/layouts/dashboard";
import { NavSection } from "@beep/ui/routing/nav-section";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DashboardLayout nav={<NavSection items={navItems} />}>
    {children}
  </DashboardLayout>
);
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Atomic design hierarchy | Consistent component granularity (atoms -> molecules -> organisms -> sections) |
| MUI + shadcn + Tailwind | MUI for complex components, shadcn for primitives, Tailwind for layout |
| Settings-driven theming | Runtime customization without rebuilds |
| `"use client"` boundaries | Explicit client/server separation for React 19 / Next.js 16 |
| Effect utilities only | No native array/string methods per repo-wide rules |

## Dependencies

**Internal**: `@beep/ui-core`, `@beep/schema`, `@beep/utils`, `@beep/constants`, `@beep/shared-domain`, `@beep/invariant`, `@beep/runtime-client`

**External**: `@mui/material`, `@mui/x-*`, `@emotion/*`, `tailwindcss`, `clsx`, `tailwind-merge`, `@tanstack/react-form`, `framer-motion`, `i18next`, `react-i18next`, `lexical`, `effect`, `sonner`, `vaul`, `cmdk`

## Related

- **AGENTS.md** - Detailed contributor guidance with gotchas and change checklist
- **@beep/ui-core** - Upstream theme primitives and settings schema
- **components.json** - Shadcn configuration for component generation
