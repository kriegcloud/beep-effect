# @beep/todox

Next.js 16 application demonstrating Material UI theming with shadcn/ui component library integration and Effect patterns.

## Overview

TodoX is a showcase application built with Next.js 16 App Router, featuring:
- Material UI (MUI) theming system with custom component overrides
- shadcn/ui component library (49 components)
- Effect-based utilities for functional data transformations
- Multi-panel layout (mini sidebar + main sidebar + content + side panel)
- Mail application with inbox, compose, and detail views
- Rich text editor powered by Tiptap with custom extensions
- Dark mode support via MUI's color scheme system
- Comprehensive provider architecture (IAM, Theme, i18n, Localization)
- TypeScript strict mode with comprehensive type safety

This app serves as a reference implementation for UI patterns, feature-based architecture, component composition, and Material UI theming in the beep-effect monorepo.

## Package Structure

```
apps/todox/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main page with mail feature demo
│   │   └── globals.css     # Global styles and Tailwind imports
│   ├── components/
│   │   ├── ai-chat/        # AI chat panel components
│   │   │   ├── ai-chat-panel.tsx
│   │   │   └── index.ts
│   │   ├── mini-sidebar/   # Mini sidebar for app selection
│   │   │   ├── mini-sidebar.tsx
│   │   │   └── index.ts
│   │   ├── navbar/         # Top navbar components
│   │   │   ├── command-search.tsx
│   │   │   ├── navbar-user-dropdown.tsx
│   │   │   ├── notification-dropdown.tsx
│   │   │   ├── top-navbar.tsx
│   │   │   └── index.ts
│   │   ├── side-panel/     # Side panel for contextual actions
│   │   │   ├── side-panel.tsx
│   │   │   └── index.ts
│   │   ├── sidebar/        # Main content sidebar components
│   │   │   ├── main-content-panel-sidebar.tsx
│   │   │   ├── nav-main.tsx
│   │   │   ├── nav-projects.tsx
│   │   │   ├── nav-user.tsx
│   │   │   ├── team-switcher.tsx
│   │   │   └── index.ts
│   │   ├── ui/             # shadcn/ui components (49 components)
│   │   ├── component-example.tsx
│   │   ├── example.tsx
│   │   ├── mode-toggle.tsx
│   │   └── theme-provider.tsx
│   ├── features/           # Feature-based modules
│   │   ├── editor/         # Rich text editor (Tiptap)
│   │   │   ├── components/ # Editor UI components
│   │   │   ├── extension/  # Custom Tiptap extensions
│   │   │   ├── editor.tsx  # Main editor component
│   │   │   └── index.ts
│   │   └── mail/           # Mail application feature
│   │       ├── layout.tsx      # Mail layout component
│   │       ├── mail-compose.tsx
│   │       ├── mail-details.tsx
│   │       ├── mail-header.tsx
│   │       ├── mail-item.tsx
│   │       ├── mail-list.tsx
│   │       ├── mail-nav-item.tsx
│   │       ├── mail-nav.tsx
│   │       ├── mail-skeleton.tsx
│   │       ├── provider/   # Mail state management
│   │       └── view/       # Mail view components
│   ├── lib/
│   │   └── utils.ts        # Utility functions (cn, etc.)
│   ├── theme/              # Material UI theme configuration
│   │   ├── components/     # MUI component overrides
│   │   ├── colors.ts       # Color scheme definitions
│   │   ├── shadows.ts      # Shadow definitions
│   │   ├── typography.ts   # Typography definitions
│   │   ├── theme.tsx       # Main theme export
│   │   ├── types.ts        # Theme type definitions
│   │   └── index.ts        # Barrel export
│   ├── types/              # TypeScript type definitions
│   │   └── extended-theme-types.ts
│   ├── app-config.ts       # App configuration
│   └── global-providers.tsx # Global provider setup
├── public/
│   ├── icons/              # Icon assets
│   └── logo.avif           # Application logo
├── components.json         # shadcn/ui configuration
└── package.json
```

## Key Dependencies

### Internal @beep Packages (Common)

| Package            | Purpose                           | Usage                                     |
|--------------------|-----------------------------------|-------------------------------------------|
| `@beep/shared-env` | Environment configuration         | Client environment access via `clientEnv` |
| `@beep/constants`  | Schema-backed enums and constants | Shared constants and enums                |
| `@beep/errors`     | Error handling utilities          | Error types and logging                   |
| `@beep/schema`     | Effect Schema utilities           | Schema validation                         |
| `@beep/utils`      | Pure runtime helpers              | Functional utilities                      |
| `@beep/invariant`  | Assertion contracts               | Runtime assertions                        |
| `@beep/identity`   | Package identity                  | Package metadata                          |
| `@beep/types`      | Compile-time types (devDep)       | Type definitions                          |

### Internal @beep Packages (UI)

| Package             | Purpose                                    |
|---------------------|-------------------------------------------|
| `@beep/ui`          | Main UI library with MUI components        |
| `@beep/ui-core`     | Core UI configuration and settings         |
| `@beep/shared-ui`   | Shared UI utilities                        |
| `@beep/iam-ui`      | IAM-specific UI components                 |

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

### Material UI Theme System

The app uses Material UI's theming system with custom overrides:

```tsx
// From global-providers.tsx
import { themeOverrides } from "@beep/todox/theme"
import { ThemeProvider } from "@beep/ui/theme/theme-provider"
import { themeConfig } from "@beep/ui-core/theme"

<ThemeProvider
  themeOverrides={themeOverrides}
  modeStorageKey={themeConfig.modeStorageKey}
  defaultMode={themeConfig.defaultMode}
>
  {children}
</ThemeProvider>
```

**Theme Structure** (`src/theme/`):
- `colors.ts` — Color scheme definitions for light/dark modes
- `shadows.ts` — Custom shadow definitions
- `typography.ts` — Typography definitions and theme overrides
- `theme.tsx` — Main theme object with component overrides
- `components/` — MUI component-specific theme overrides (button, text-field, select, etc.)

### shadcn/ui Components

The app includes 49 shadcn/ui components in `src/components/ui/`:
- accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button
- calendar, card, carousel, chart, checkbox, collapsible, combobox, command
- context-menu, dialog, drawer, dropdown-menu, field, hover-card, input, input-otp
- input-group, label, menubar, navigation-menu, orb, pagination, popover, progress
- radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton
- slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

### Custom Components

#### AI Chat Panel

```tsx
// From ai-chat-panel.tsx
import { AIChatPanel, AIChatPanelProvider, AIChatPanelTrigger }
  from "@beep/todox/components/ai-chat"

export default function Page() {
  return (
    <AIChatPanelProvider>
      <div className="flex h-svh w-full bg-background">
        <AIChatPanelTrigger />
        <AIChatPanel />
      </div>
    </AIChatPanelProvider>
  )
}
```

**Features**:
- Collapsible AI chat panel with localStorage persistence
- Context-based state management
- Tooltip-enhanced UI controls
- Textarea input with placeholder
- Model selector and attachment support

#### Top Navbar Components

The navbar system includes both individual components and a comprehensive `TopNavbar` component:

```tsx
// Individual components
import { CommandSearch, NavbarUserDropdown, NotificationDropdown, TopNavbar }
  from "@beep/todox/components/navbar"

// TopNavbar includes: Team + Workspace + App selectors with logo
<TopNavbar user={user} />

// Or compose individually:
<header className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
  <div className="flex items-center gap-2">
    <AIChatPanelTrigger />
    <SidebarTrigger />
  </div>
  <div className="flex flex-1 justify-center">
    <CommandSearch />
  </div>
  <div className="flex items-center gap-2">
    <NotificationDropdown />
    <NavbarUserDropdown user={user} />
  </div>
</header>
```

**Components**:
- `TopNavbar`: Full navigation bar with team/workspace/app selectors, search, notifications, and user dropdown
- `CommandSearch`: Keyboard-driven command palette
- `NotificationDropdown`: Bell icon with notification badge
- `NavbarUserDropdown`: User avatar with account menu

#### Sidebar System

```tsx
// From main-content-panel-sidebar.tsx
import { MainContentPanelSidebar, NavMain, NavProjects, NavUser, TeamSwitcher, TeamSwitcherCompact }
  from "@beep/todox/components/sidebar"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail }
  from "@beep/todox/components/ui/sidebar"

export function MainContentPanelSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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

**Exports**:
- `MainContentPanelSidebar` — Main content sidebar component
- `NavMain` — Primary navigation menu
- `NavProjects` — Projects list
- `NavUser` — User profile in footer
- `TeamSwitcher` — Full team selector dropdown
- `TeamSwitcherCompact` — Compact team selector for navbar

#### Mini Sidebar

```tsx
// Application selector sidebar (left-most panel)
import { MiniSidebar, MiniSidebarProvider } from "@beep/todox/components/mini-sidebar"

<MiniSidebarProvider>
  <MiniSidebar />
  {/* Main content */}
</MiniSidebarProvider>
```

**Features**:
- App switching with icons (Mail, Tasks, Files, Teams, Notes)
- Persists selected app in localStorage
- Context-based state management
- Vertical icon-based navigation

#### Side Panel

```tsx
// Contextual action panel (right-side panel)
import { SidePanel, SidePanelProvider, useSidePanel } from "@beep/todox/components/side-panel"

<SidePanelProvider>
  <SidePanel />
  {/* Trigger from anywhere */}
  <Button onClick={() => useSidePanel().setOpen(true)}>Open Panel</Button>
</SidePanelProvider>
```

**Features**:
- Resizable panel with `react-resizable-panels`
- Context-based state management
- Collapsible with animated transitions
- Customizable content via children

#### Mail Feature

The mail feature demonstrates a complete email-like application with inbox, compose, and detail views:

```tsx
// From features/mail
import { MailCompose } from "@beep/todox/features/mail/mail-compose"
import { MailDetails } from "@beep/todox/features/mail/mail-details"
import { MailList } from "@beep/todox/features/mail/mail-list"
import { MailProvider, useMail } from "@beep/todox/features/mail/provider"
import { MailView } from "@beep/todox/features/mail/view"

<MailProvider>
  <div className="flex h-full">
    <MailList />
    <MailDetails />
  </div>
</MailProvider>
```

**Components**:
- `MailProvider` — Context provider for mail state management
- `MailList` — Inbox/folder mail list with virtualization
- `MailDetails` — Mail detail view with attachments
- `MailCompose` — Compose new email with Tiptap editor
- `MailNav` — Navigation sidebar with labels/folders
- `MailHeader` — Header with actions and search

**Features**:
- Label-based filtering (Inbox, Sent, Drafts, etc.)
- Mail selection and batch operations
- Rich text editing with Tiptap
- Attachment support
- Search and filter capabilities

#### Rich Text Editor

The editor feature provides a Tiptap-based rich text editor with custom extensions:

```tsx
// From features/editor
import { Editor } from "@beep/todox/features/editor"

<Editor
  initialContent="<p>Start writing...</p>"
  onChange={(html) => console.log(html)}
  placeholder="Write something..."
/>
```

**Components**:
- `Editor` — Main Tiptap editor wrapper
- `BubbleToolbar` — Floating toolbar on text selection
- `Toolbar` — Fixed toolbar with formatting options
- `CodeHighlightBlock` — Syntax-highlighted code blocks
- `HeadingBlock` — Custom heading component
- `ImageBlock` — Image insertion with drag-and-drop
- `LinkBlock` — Link editing with preview

**Extensions**:
- `ClearFormat` — Clear all formatting from selection
- `TextTransform` — Text case transformation (uppercase, lowercase, capitalize)

**Features**:
- Bubble menu for inline formatting
- Code syntax highlighting with Lowlight
- Image upload and drag-and-drop
- Link editing with URL validation
- Markdown shortcuts
- Keyboard shortcuts (Cmd+B, Cmd+I, etc.)

#### Global Provider Architecture

```tsx
// From global-providers.tsx
import { GlobalProviders } from "@beep/todox/global-providers"
import { themeOverrides } from "@beep/todox/theme"

// Comprehensive provider stack:
<BeepProvider>
  <InitColorSchemeScript />
  <I18nProvider lang={appConfig.i18nLang}>
    <SettingsProvider>
      <LocalizationProvider>
        <AppRouterCacheProvider>
          <ThemeProvider themeOverrides={themeOverrides}>
            <BreakpointsProvider>
              <ConfirmProvider>
                <IamProvider>
                  <MotionLazy>
                    {children}
                  </MotionLazy>
                </IamProvider>
              </ConfirmProvider>
            </BreakpointsProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </LocalizationProvider>
    </SettingsProvider>
  </I18nProvider>
</BeepProvider>
```

**Provider Stack**:
- `BeepProvider` — Effect runtime provider from `@beep/runtime-client`
- `I18nProvider` — Internationalization from `@beep/ui`
- `SettingsProvider` — App settings management from `@beep/ui`
- `LocalizationProvider` — Date/number formatting from `@beep/ui`
- `ThemeProvider` — MUI theme provider from `@beep/ui`
- `IamProvider` — Authentication provider from `@beep/iam-ui`
- `ConfirmProvider` — Confirmation dialogs from `@beep/ui`

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
  - `@beep/ui`, `@beep/ui-core`, `@beep/shared-ui` for Material UI components and theming
  - `@beep/iam-ui` for authentication components
  - Various `@beep/*` packages for utilities and infrastructure
  - shadcn/ui for complementary component library
- **Communicates with**: Server slices via RPC (when integrated)

## Material UI + shadcn/ui Integration

TodoX demonstrates a hybrid approach combining Material UI's theming system with shadcn/ui components:

### Why Both Libraries?

- **Material UI**: Provides comprehensive theming system, color schemes, typography, and complex components (DataGrid, DatePickers, etc.)
- **shadcn/ui**: Provides lightweight, accessible, Radix-based primitives for common UI patterns

### Integration Pattern

```tsx
// MUI theming applied globally via ThemeProvider
import { themeOverrides } from "@beep/todox/theme"  // MUI theme
import { ThemeProvider } from "@beep/ui/theme/theme-provider"

// shadcn/ui components use Tailwind CSS classes
import { Button } from "@beep/todox/components/ui/button"  // shadcn
import { Sidebar } from "@beep/todox/components/ui/sidebar"  // shadcn

// Both can coexist in the same component
<ThemeProvider themeOverrides={themeOverrides}>
  <MuiButton variant="contained">MUI Button</MuiButton>
  <Button variant="outline">shadcn Button</Button>
</ThemeProvider>
```

### Theme Configuration

Material UI theme is configured in `src/theme/theme.tsx`:

```typescript
export const themeOverrides = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
    cssVarPrefix: "plus",
  },
  colorSchemes: colors,
  shape: { borderRadius: 8 },
  components: {
    ...buttonTheme,
    ...textFieldTheme,
    // ... other component overrides
  },
  typography,
  shadows,
})
```

**Key Features**:
- CSS variables for color scheme switching
- Custom color palettes for light/dark modes
- Component-specific overrides for consistent styling
- Typography scale and shadow definitions

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
4. **Follow shadcn/ui patterns** for Radix-based component composition
5. **Use MUI ThemeProvider** for consistent theming across the app
6. **Leverage Effect's pipe** for data transformations with `F.pipe()`
7. **Never use `any`, `@ts-ignore`, or unchecked casts**
8. **Always validate external data** with `@beep/schema`
9. **Understand the provider hierarchy** in `global-providers.tsx` when adding new providers

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

### Feature-Based Organization

```tsx
// features/[feature-name]/
// ├── components/       # Feature-specific components
// ├── provider/         # State management (React Context)
// ├── view/             # Top-level view components
// ├── [feature].tsx     # Main feature component
// └── index.ts          # Public API exports

// Example: Mail feature provider pattern
import { MailProvider, useMail } from "@beep/todox/features/mail/provider"

// Provider wraps the feature
<MailProvider>
  <MailApp />
</MailProvider>

// Components access state via hook
function MailList() {
  const { mails, selectedMailId, handleClickMail } = useMail()
  // ... component logic
}
```

### Environment-Dependent Features

```tsx
import { clientEnv } from "@beep/shared-env"

// Conditional feature flags
const enableDebugTools = clientEnv.env === "dev"

// Conditional script loading
{clientEnv.env === "dev" && (
  <Script src="//debug-tool.js" strategy="lazyOnload" />
)}
```

## See Also

### External Documentation
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Effect Documentation](https://effect.website)

### Internal Documentation
- [Root AGENTS.md](/home/elpresidank/YeeBois/projects/beep-effect/AGENTS.md) — Monorepo-wide patterns
- [Shared Environment](/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/env/AGENTS.md) — Environment configuration
- [Effect Patterns](/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md) — Effect-specific patterns
- [Package Structure](/home/elpresidank/YeeBois/projects/beep-effect/documentation/PACKAGE_STRUCTURE.md) — Monorepo architecture
