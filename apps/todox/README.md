# @beep/todox

Full-featured Next.js 16 application demonstrating Material UI theming, shadcn/ui integration, and Effect patterns with a functional email client and rich text editor.

## Purpose

TodoX is a comprehensive showcase application built with Next.js 16 App Router, featuring:
- **Material UI** design system with extensive theme customization and component overrides
- **shadcn/ui** component library (49+ components) for accessible UI primitives
- **Email Client** feature with inbox, compose, navigation, and mail provider
- **Rich Text Editor** powered by TipTap with toolbar, bubble menu, and code highlighting
- **Effect-based utilities** for functional data transformations throughout the codebase
- **Navigation System** with collapsible sidebar, top navbar, team switcher, and side panels
- **AI Chat Panel** for AI-powered interactions
- **Command Palette** for global search and keyboard shortcuts
- **Dark Mode Support** via Material UI's color scheme system
- **Comprehensive Provider Stack** (IAM, Theme, i18n, Localization, Settings)
- **TypeScript strict mode** with comprehensive type safety

This application demonstrates advanced UI patterns, component composition, Material UI theming, and Effect integration in the beep-effect monorepo.

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
│   ├── app/                      # Next.js App Router
│   │   ├── api/mail/             # Mail API endpoints (labels, details, list)
│   │   ├── demo/                 # Demo page
│   │   ├── layout.tsx            # Root layout with provider stack
│   │   ├── page.tsx              # Main page
│   │   └── globals.css           # Global styles and Tailwind imports
│   ├── features/                 # Feature modules
│   │   ├── mail/                 # Email client feature
│   │   │   ├── provider/         # Mail context provider
│   │   │   ├── view/             # Mail view components
│   │   │   ├── mail-compose.tsx  # Email composition
│   │   │   ├── mail-details.tsx  # Email detail view
│   │   │   ├── mail-list.tsx     # Email list
│   │   │   ├── mail-header.tsx   # Mail header bar
│   │   │   ├── mail-item.tsx     # Individual mail item
│   │   │   ├── mail-nav.tsx      # Mail navigation
│   │   │   ├── mail-nav-item.tsx # Nav item component
│   │   │   ├── mail-skeleton.tsx # Loading skeleton
│   │   │   └── layout.tsx        # Mail layout wrapper
│   │   └── editor/               # Rich text editor feature
│   │       ├── components/       # Editor UI components
│   │       │   ├── toolbar.tsx          # Main toolbar
│   │       │   ├── bubble-toolbar.tsx   # Floating bubble menu
│   │       │   ├── toolbar-item.tsx     # Toolbar button component
│   │       │   ├── toolbar-icons.tsx    # Icon definitions
│   │       │   ├── use-toolbar-state.ts # Toolbar state hook
│   │       │   ├── heading-block.tsx    # Heading extension
│   │       │   ├── link-block.tsx       # Link extension
│   │       │   ├── image-block.tsx      # Image extension
│   │       │   ├── code-highlight-block.tsx  # Code highlighting
│   │       │   └── code-highlight-block.css  # Code block styles
│   │       ├── extension/        # Custom TipTap extensions
│   │       │   ├── clear-format.ts      # Clear formatting extension
│   │       │   └── text-transform.ts    # Text transformation extension
│   │       ├── editor.tsx        # Main editor component
│   │       ├── types.ts          # Editor type definitions
│   │       ├── classes.ts        # CSS class utilities
│   │       ├── styles.tsx        # Editor styles
│   │       └── index.ts          # Barrel export
│   ├── components/
│   │   ├── ai-chat/              # AI chat panel
│   │   │   ├── ai-chat-panel.tsx
│   │   │   └── index.ts
│   │   ├── navbar/               # Top navigation bar
│   │   │   ├── top-navbar.tsx           # Complete navbar with selectors
│   │   │   ├── command-search.tsx       # Command palette (Cmd+K)
│   │   │   ├── navbar-user-dropdown.tsx # User menu
│   │   │   ├── notification-dropdown.tsx # Notifications
│   │   │   └── index.ts
│   │   ├── sidebar/              # Main sidebar navigation
│   │   │   ├── main-content-panel-sidebar.tsx  # Main sidebar component
│   │   │   ├── nav-main.tsx             # Primary navigation
│   │   │   ├── nav-projects.tsx         # Projects navigation
│   │   │   ├── nav-user.tsx             # User profile footer
│   │   │   ├── team-switcher.tsx        # Team selector dropdown
│   │   │   └── index.ts
│   │   ├── side-panel/           # Side panel component
│   │   ├── mini-sidebar/         # Compact sidebar variant
│   │   ├── ui/                   # shadcn/ui primitives (49+ components)
│   │   ├── component-example.tsx # Example components
│   │   ├── example.tsx           # Usage examples
│   │   ├── mode-toggle.tsx       # Dark mode toggle
│   │   └── theme-provider.tsx    # Theme context provider
│   ├── theme/                    # Material UI theme configuration
│   │   ├── components/           # Component-specific MUI overrides
│   │   │   ├── button.ts         # Button theme
│   │   │   ├── text-field.ts     # TextField theme
│   │   │   ├── select.ts         # Select theme
│   │   │   ├── chip.ts           # Chip theme
│   │   │   ├── date-picker.ts    # DatePicker theme
│   │   │   ├── controls.tsx      # Form controls theme
│   │   │   └── ...               # Additional component themes
│   │   ├── colors.ts             # Color scheme definitions
│   │   ├── shadows.ts            # Shadow definitions
│   │   ├── typography.ts         # Typography definitions
│   │   ├── theme.tsx             # Main theme export with overrides
│   │   ├── types.ts              # Theme type definitions
│   │   └── index.ts              # Barrel export
│   ├── actions/                  # Server actions
│   │   └── mail.ts               # Mail-related actions
│   ├── types/                    # Type definitions
│   │   └── extended-theme-types.ts
│   ├── lib/
│   │   └── utils.ts              # Utility functions (cn, etc.)
│   ├── app-config.ts             # Application configuration
│   └── global-providers.tsx      # Comprehensive provider stack
├── public/
│   ├── logo.avif                 # Application logo
│   └── icons/                    # Icon assets
│       └── empty/                # Empty state icons
├── components.json               # shadcn/ui configuration
├── tsconfig.json                 # TypeScript configuration
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

### UI Libraries

| Package                    | Purpose                              |
|----------------------------|--------------------------------------|
| `shadcn`                   | Component library and CLI            |
| `@mui/material`            | MUI Material design system           |
| `@mui/x-data-grid`         | Advanced data grid component         |
| `@mui/x-date-pickers`      | Date and time picker components      |
| `@mui/x-tree-view`         | Tree view component                  |
| `@phosphor-icons/react`    | Icon library                         |
| `@iconify/react`           | Unified icon framework               |
| `next-themes`              | Theme management for Next.js         |
| `framer-motion`            | Animation library                    |
| `react-resizable-panels`   | Resizable panel layouts              |

### Rich Text Editor

| Package                                | Purpose                           |
|----------------------------------------|-----------------------------------|
| `@tiptap/react`                        | TipTap React integration          |
| `@tiptap/starter-kit`                  | Essential TipTap extensions       |
| `@tiptap/extensions`                   | Additional TipTap extensions      |
| `@tiptap/extension-bubble-menu`        | Floating bubble menu              |
| `@tiptap/extension-code-block-lowlight`| Syntax highlighted code blocks    |
| `@tiptap/extension-image`              | Image support                     |
| `@tiptap/extension-text-align`         | Text alignment                    |
| `lowlight`                             | Syntax highlighting engine        |

### AI & Chat

| Package          | Purpose                    |
|------------------|----------------------------|
| `@ai-sdk/react`  | AI SDK React hooks         |
| `ai`             | Vercel AI SDK core         |

### Mail Feature

| Package          | Purpose                           |
|------------------|-----------------------------------|
| `date-fns`       | Date formatting and manipulation  |

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

The app includes 49 shadcn/ui components in `src/components/ui/`:
- Accordion, Alert, AlertDialog, AspectRatio, Avatar
- Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart
- Checkbox, Collapsible, Combobox, Command, ContextMenu
- Dialog, Drawer, DropdownMenu, Field
- HoverCard, Input, InputGroup, InputOTP
- Label, Menubar, NavigationMenu
- Orb, Pagination, Popover, Progress
- RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet
- Sidebar, Skeleton, Slider, Sonner, Switch
- Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip

### MUI Material Theme System

Comprehensive MUI Material theming in `src/theme/`:

```typescript
// From theme/theme.tsx
import { createTheme } from "@mui/material/styles"

export const themeOverrides = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
    cssVarPrefix: "plus",
  },
  colorSchemes: colors,
  shape: { borderRadius: 8 },
  components: {
    // 18+ component theme customizations:
    // Button, TextField, Select, Menu, Autocomplete, Chip,
    // Avatar, Table, Card, Dialog, DatePicker, DataGrid,
    // Alert, TreeView, Layout, Link, Controls, List
  },
  typography,
  shadows,
})
```

Component-specific theme overrides available for:
- Data Grid (advanced table features)
- Date Pickers (calendar and time selection)
- Tree View (hierarchical data)
- Form controls (TextField, Select, Autocomplete)
- Layout components (Card, Dialog, Menu)

### Custom Components & Features

#### Mail Feature

Complete email client implementation with provider-based state management:

```tsx
// From features/mail/view/mail-view.tsx
import { MailView } from "@beep/todox/features/mail/view"
import { MailProvider } from "@beep/todox/features/mail/provider"

export default function MailPage() {
  return (
    <MailProvider>
      <MailView />
    </MailProvider>
  )
}
```

**Mail Components**:
- `MailProvider` — Context provider for mail state management
- `MailView` — Complete mail interface with resizable panels
- `MailList` — Email list with pagination and filtering
- `MailDetails` — Email detail view with rich text display
- `MailCompose` — Email composition with TipTap editor
- `MailNav` — Label-based navigation (Inbox, Sent, Drafts, etc.)
- `MailHeader` — Action bar with archive, delete, mark read/unread
- `MailItem` — Individual email list item with preview
- `MailSkeleton` — Loading state skeleton UI

**Features**:
- Resizable panels using `react-resizable-panels`
- Server actions for mail operations in `src/actions/mail.ts`
- API routes in `src/app/api/mail/` (labels, details, list)

#### Rich Text Editor

TipTap-based editor with custom extensions and toolbar:

```tsx
// From features/editor/editor.tsx
import { Editor } from "@beep/todox/features/editor"

export function ComposeEmail() {
  return (
    <Editor
      placeholder="Write your message..."
      className="min-h-[200px]"
    />
  )
}
```

**Editor Components**:
- `Editor` — Main TipTap editor instance with extensions
- `Toolbar` — Fixed toolbar with formatting controls
- `BubbleToolbar` — Floating toolbar on text selection
- `ToolbarItem` — Reusable toolbar button component
- `HeadingBlock` — Heading levels (H1-H6)
- `LinkBlock` — Link insertion and editing
- `ImageBlock` — Image upload and display
- `CodeHighlightBlock` — Syntax-highlighted code blocks with lowlight

**Custom Extensions**:
- `ClearFormat` — Remove all formatting
- `TextTransform` — Text case transformations (uppercase, lowercase, capitalize)

**Features**:
- Rich text formatting (bold, italic, underline, strikethrough)
- Headings, lists (ordered/unordered), blockquotes
- Code blocks with syntax highlighting (lowlight)
- Link and image insertion
- Text alignment (left, center, right, justify)
- Custom toolbar state management via `useToolbarState`
- Bubble menu for contextual formatting

#### Navbar Components

```tsx
// From navbar/top-navbar.tsx and individual components
import { TopNavbar, CommandSearch, NavbarUserDropdown, NotificationDropdown }
  from "@beep/todox/components/navbar"

// Option 1: Use complete TopNavbar with team/workspace/app selectors
<TopNavbar user={user} />

// Option 2: Compose individual components
<header>
  <CommandSearch />
  <NotificationDropdown />
  <NavbarUserDropdown user={user} />
</header>
```

**Components**:
- `TopNavbar` — Complete navbar with team/workspace/app selectors and logo
- `CommandSearch` — Global command palette (Cmd+K)
- `NavbarUserDropdown` — User menu with theme switcher and account options
- `NotificationDropdown` — Notification center with bell icon and badge

**Effect Pattern Example**:
```tsx
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as Str from "effect/String"

// Generate user initials using Effect utilities
const initials = F.pipe(
  user.name,
  Str.split(" "),
  A.map((n) => n[0] ?? ""),
  A.join(""),
  Str.toUpperCase,
  Str.slice(0, 2)
)
```

#### Sidebar System

```tsx
// From sidebar/main-content-panel-sidebar.tsx
import { MainContentPanelSidebar, NavMain, NavProjects, NavUser, TeamSwitcher }
  from "@beep/todox/components/sidebar"
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

**Exports**:
- `MainContentPanelSidebar` — Main sidebar component for content panels
- `NavMain` — Primary navigation menu with collapsible items
- `NavProjects` — Projects list navigation
- `NavUser` — User profile in sidebar footer
- `TeamSwitcher` — Full team selector dropdown
- `TeamSwitcherCompact` — Compact variant for navbar

#### AI Chat Panel

```tsx
// From ai-chat/ai-chat-panel.tsx
import { AIChatPanel, AIChatPanelProvider, AIChatPanelTrigger }
  from "@beep/todox/components/ai-chat"

export default function Page() {
  return (
    <AIChatPanelProvider>
      <AIChatPanelTrigger />
      <AIChatPanel />
      {/* Main content */}
    </AIChatPanelProvider>
  )
}
```

**Features**:
- Collapsible side panel with localStorage persistence
- Context-based state management
- AI SDK integration via `@ai-sdk/react`
- Model selector and file attachments

#### Global Provider Stack

```tsx
// From global-providers.tsx
import { ThemeProvider } from "@beep/ui/theme/theme-provider"
import { themeOverrides } from "@beep/todox/theme"
import { IamProvider } from "@beep/iam-ui"
import { BeepProvider } from "@beep/runtime-client"

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <BeepProvider>
      <I18nProvider lang={appConfig.i18nLang}>
        <SettingsProvider>
          <LocalizationProvider>
            <ThemeProvider
              themeOverrides={themeOverrides}
              modeStorageKey={themeConfig.modeStorageKey}
              defaultMode={themeConfig.defaultMode}
            >
              <IamProvider>
                {children}
              </IamProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </I18nProvider>
    </BeepProvider>
  )
}
```

**Provider Stack** (from outer to inner):
1. `BeepProvider` — Effect runtime for browser context
2. `I18nProvider` — Internationalization support
3. `SettingsProvider` — Application settings management
4. `LocalizationProvider` — Date/time/number formatting
5. `ThemeProvider` — Material UI theme with custom overrides
6. `IamProvider` — Authentication and identity management

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
  - MUI Material for design system
  - @ai-sdk/react for AI chat functionality
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

### External Documentation
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TipTap Editor Documentation](https://tiptap.dev)
- [Effect Documentation](https://effect.website)

### Internal Documentation
- [Root CLAUDE.md](../../CLAUDE.md) — Monorepo-wide patterns and commands
- [Root AGENTS.md](../../AGENTS.md) — Architecture and development guidelines
- [Effect Patterns](../../documentation/EFFECT_PATTERNS.md) — Effect-specific patterns
- [Package Structure](../../documentation/PACKAGE_STRUCTURE.md) — Monorepo architecture
- [Shared Environment](../../packages/shared/env/AGENTS.md) — Environment configuration
