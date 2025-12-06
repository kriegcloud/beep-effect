# @beep/ui

The shared UI component library for beep-effect which combines MUI Material, shadcn/ui, and Tailwind CSS.

## Purpose

Opinionated React component library providing the complete presentation layer for beep-effect applications. Composes MUI Material design primitives with shadcn/ui components, Tailwind utilities, and specialty integrations (Framer Motion animations, Plate.js rich text editing, TanStack Form). Built on top of `@beep/ui-core` theme foundations with full i18n, RTL support, and dynamic theme customization.

## Key Exports

The package exports are organized by category to mirror the atomic design hierarchy and functional concerns:

| Export Category         | Description                                                                     |
|-------------------------|---------------------------------------------------------------------------------|
| **Component Hierarchy** |                                                                                 |
| `atoms/*`               | Base building blocks: Image, Label, Iconify, FileThumbnail, SvgColor            |
| `molecules/*`           | Simple composite components built from atoms                                    |
| `organisms/*`           | Complex feature-rich components                                                 |
| `sections/*`            | Page-level section compositions                                                 |
| `components/*`          | shadcn/ui components and cross-tier aggregates                                  |
| **Functionality**       |                                                                                 |
| `providers/*`           | Context providers: AuthAdapterProvider, BreakpointsProvider, BulkSelectProvider |
| `hooks/*`               | React hooks: routing, state management, responsive utilities, stable callbacks  |
| `inputs/*`              | Form inputs: PhoneField, EmojiField, UploadBoxField, color pickers              |
| `form/*`                | TanStack Form integration with Effect Schema validation                         |
| `layouts/*`             | Layout compositions: auth-split, dashboard, main-layout with navigation         |
| **Theming & Styling**   |                                                                                 |
| `theme/*`               | ThemeProvider integrating settings state with MUI theme creation                |
| `settings/*`            | Settings context and drawer for theme customization                             |
| `animate/*`             | Framer Motion utilities: variants, scroll progress, motion lazy-loading         |
| `progress/*`            | Progress indicators and loading states                                          |
| **Utilities**           |                                                                                 |
| `i18n/*`                | Internationalization utilities and language detection                           |
| `lib/*`                 | Utility functions and helpers                                                   |
| `services/*`            | Client-side service integrations                                                |
| `routing/*`             | Navigation utilities and route helpers                                          |
| `icons/*`               | Custom icon components                                                          |
| `messages/*`            | Notification and messaging utilities                                            |
| **Assets & Data**       |                                                                                 |
| `assets/*`              | Static assets and data: countries, illustrations                                |
| `branding/*`            | Logo and brand identity components                                              |
| `data-display/*`        | Data presentation: markdown rendering, HTML conversion                          |
| `surfaces/*`            | Surface-level containers and cards                                              |
| `common/*`              | Common utilities and shared constants                                           |
| **Styling**             |                                                                                 |
| `globals.css`           | Global Tailwind + CSS variables, font families, baseline resets                 |
| `postcss.config`        | PostCSS configuration for Tailwind processing                                   |

## Architecture Fit

- **Presentation Layer**: Pure UI components with no direct business logic or backend dependencies
- **Theme Integration**: Consumes `@beep/ui-core` design tokens and settings pipeline
- **Multi-Framework**: Combines MUI Material, shadcn/ui (Radix), and Tailwind for comprehensive component coverage
- **Effect-First**: Hooks and utilities follow Effect patterns where applicable
- **Path Alias**: Import as `@beep/ui/*` with granular path exports

## Component Organization

### Directory Taxonomy

```
src/
├── atoms/              # Base components (Image, Label, Iconify, FileThumbnail)
├── molecules/          # Simple composites (built from atoms)
├── organisms/          # Complex feature components
├── sections/           # Page-level section compositions
├── components/         # shadcn/ui + cross-tier barrels
├── animate/            # Framer Motion variants and utilities
├── assets/             # Static data (countries) and illustrations
├── branding/           # Logo and brand identity
├── common/             # Shared utilities and constants
├── data-display/       # Markdown rendering, HTML conversion
├── form/               # TanStack Form integration
├── hooks/              # React hooks (routing, state, responsive)
├── i18n/               # Internationalization bridges
├── icons/              # Custom icon components
├── inputs/             # Form inputs (Phone, Emoji, Upload, Color)
├── layouts/            # Layout compositions (auth, dashboard, main)
├── lib/                # Utility functions
├── messages/           # Notifications and messaging
├── organisms/          # Complex components
├── progress/           # Progress indicators
├── providers/          # Context providers
├── routing/            # Navigation utilities
├── sections/           # Page sections
├── services/           # Client services
├── settings/           # Settings context and drawer
├── styles/             # Global CSS and Tailwind config
├── surfaces/           # Containers and cards
├── theme/              # ThemeProvider and theme utilities
└── utils/              # General utilities
```

### Conventions

- **Effect Utilities**: Use namespace imports (`import * as A from "effect/Array"`), avoid native array/string/object methods
- **Client Directives**: Mark client-only components with `"use client"` directive for React 19 server component compliance
- **Barrel Exports**: Each directory maintains an `index.ts` barrel export for clean imports
- **Colocation**: Colocate tests, stories, and utilities near component implementations

## Theme & Settings Integration

### ThemeProvider

The `ThemeProvider` component (`src/theme/theme-provider.tsx`) orchestrates theme creation and application:

```tsx
import { ThemeProvider } from "@beep/ui/theme/theme-provider";

function App({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
```

**Features**:
- Consumes settings state from `useSettingsContext()` for dynamic theme customization
- Integrates locale-specific MUI component overrides via `useTranslate()`
- Wraps with MUI `ThemeProvider` and RTL support via `@beep/ui-core`
- Applies `CssBaseline` for consistent baseline styles
- Supports theme overrides via `themeOverrides` prop

### Settings System

Settings context (`src/settings/context`) provides theme customization state:

```tsx
import { useSettingsContext } from "@beep/ui/settings";

function CustomComponent() {
  const settings = useSettingsContext();

  // Access current settings
  const { mode, primaryColor, direction } = settings.state;

  // Update settings
  settings.onUpdate("mode", "dark");
}
```

**Settings State**:
- `mode`: Theme mode (`light` | `dark`)
- `primaryColor`: Primary color preset
- `direction`: Text direction (`ltr` | `rtl`)
- `contrast`: Contrast level
- `layout`: Navigation layout configuration
- Typography and spacing preferences

**Settings Drawer**: Visual UI (`src/settings/drawer`) for user-facing theme customization

## Styling Layers

### Tailwind CSS

Global styles in `src/styles/globals.css`:
- Tailwind base, components, utilities layers
- CSS variable definitions from `@beep/ui-core`
- Font family declarations (Public Sans, Inter, DM Sans, Nunito Sans, Barlow)
- Baseline resets and SimpleBar styling

**Important**: CSS variables are defined in `@beep/ui-core` - avoid redefining locally

### MUI Integration

MUI components styled via theme tokens from `@beep/ui-core`:
- Use `sx` prop for token-aware styling
- Use `styled` helpers for reusable component variants
- Theme tokens automatically sync with Tailwind CSS variables

### shadcn/ui

shadcn components configured via `components.json`:
- Target: `src/styles/globals.css`
- Path aliases mapped to package exports
- Add components via: `bun run ui-add`

**Keep `components.json` in sync with new alias directories**

## Providers & Context

### AuthAdapterProvider

Typed context for authentication, session management, and workspace data:

```tsx
import { AuthAdapterProvider, useAuthAdapterProvider } from "@beep/ui/providers/AuthAdapterProvider";

function App() {
  return (
    <AuthAdapterProvider
      session={session}
      userOrgs={orgs}
      userAccounts={accounts}
      notifications={notifications}
      contacts={contacts}
      workspaces={workspaces}
      signOut={handleSignOut}
      switchAccount={handleSwitchAccount}
      switchOrganization={handleSwitchOrg}
    >
      <YourApp />
    </AuthAdapterProvider>
  );
}

function Component() {
  const { session, signOut } = useAuthAdapterProvider();
  // ...
}
```

### Other Providers

- **BreakpointsProvider**: Responsive breakpoint detection and utilities
- **BulkSelectProvider**: Multi-item selection state for data grids

## Hooks

The package exports numerous React hooks for common UI patterns:

| Hook                   | Purpose                             |
|------------------------|-------------------------------------|
| `useRouter`            | Next.js router utilities            |
| `usePathname`          | Current pathname access             |
| `useSearchParams`      | URL search params management        |
| `useParams`            | Route params access                 |
| `useBoolean`           | Boolean state with toggle/set/reset |
| `useSetState`          | Object state with partial updates   |
| `useTabs`              | Tab state management                |
| `usePopover`           | Popover positioning and state       |
| `useCountDown`         | Countdown timer logic               |
| `useDebouncedCallback` | Debounced callback execution        |
| `useMobile`            | Mobile breakpoint detection         |
| `useIsClient`          | Client-side rendering detection     |
| `useClientRect`        | Element bounding rect measurement   |
| `useScrollOffsetTop`   | Scroll offset tracking              |
| `useBackToTop`         | Back-to-top button logic            |
| `useImageDimensions`   | Image dimension calculation         |
| `useCallbackRef`       | Stable callback references          |
| **Stable Hooks**       |                                     |
| `useStableCallback`    | Referentially stable callbacks      |
| `useStableMemo`        | Referentially stable memoization    |
| `useStableEffect`      | Effects with stable dependencies    |
| `useEqMemoize`         | Memoization with custom equality    |

## Form Integration

TanStack Form integration with Effect Schema validation:

```tsx
import { makeFormOptions } from "@beep/ui/form/makeFormOptions";
import * as S from "effect/Schema";

const LoginSchema = S.Struct({
  email: S.String,
  password: S.String
});

const formOptions = makeFormOptions({
  schema: LoginSchema,
  onSubmit: async (values) => {
    // Handle submission
  }
});
```

**Features**:
- Effect Schema validation integration
- Type-safe form state
- Field-level error handling
- Submit handlers with async support

## Inputs & Fields

Specialized form inputs with built-in validation and styling:

| Input            | Description                                             |
|------------------|---------------------------------------------------------|
| `PhoneField`     | International phone number input with country selection |
| `EmojiField`     | Emoji picker with search and categories                 |
| `UploadBoxField` | Drag-and-drop file upload with preview                  |
| `Field`          | Generic form field wrapper with validation              |
| Color inputs     | Color picker components with various formats            |

## Animation

Framer Motion integration with predefined variants:

```tsx
import { varFade, varSlide, varZoom, varBounce } from "@beep/ui/animate/variants";
import { MotionLazy } from "@beep/ui/animate/motion-lazy";

function AnimatedComponent() {
  return (
    <MotionLazy.div
      initial="initial"
      animate="animate"
      variants={varFade().inUp}
    >
      Content
    </MotionLazy.div>
  );
}
```

**Variant Categories**:
- `varFade`: Fade animations (in, out, with direction)
- `varSlide`: Slide transitions
- `varZoom`: Scale/zoom effects
- `varBounce`: Bounce animations
- `varFlip`: Flip transitions
- `varRotate`: Rotation effects
- `varPath`: SVG path animations
- `varBackground`: Background transitions

**Utilities**:
- `MotionLazy`: Lazy-loaded motion components
- `useScrollProgress`: Scroll-based progress tracking
- `features`: Framer Motion feature flags for optimization

## Layouts

Pre-built layout compositions:

### Dashboard Layout

Full-featured dashboard with navigation, header, and settings:

```tsx
import { DashboardLayout } from "@beep/ui/layouts/dashboard";

function DashboardPage() {
  return (
    <DashboardLayout>
      <YourContent />
    </DashboardLayout>
  );
}
```

### Auth Split Layout

Split-screen authentication layout:

```tsx
import { AuthSplitLayout } from "@beep/ui/layouts/auth-split";

function LoginPage() {
  return (
    <AuthSplitLayout>
      <LoginForm />
    </AuthSplitLayout>
  );
}
```

### Main Layout

Public-facing main layout with header and footer:

```tsx
import { MainLayout } from "@beep/ui/layouts/main";

function PublicPage() {
  return (
    <MainLayout>
      <YourContent />
    </MainLayout>
  );
}
```

## Internationalization

i18n integration bridging to `@beep/ui-core`:

```tsx
import { useTranslate } from "@beep/ui/i18n";

function Component() {
  const { t, currentLang, onChangeLang } = useTranslate();

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <button onClick={() => onChangeLang("es")}>
        Switch to Spanish
      </button>
    </div>
  );
}
```

**Locale Configuration**: Language metadata centralized in `@beep/ui-core/i18n/constants.ts`

## Data Display

### Markdown Rendering

Rich markdown rendering with syntax highlighting:

```tsx
import { Markdown } from "@beep/ui/data-display/markdown";

function Article({ content }) {
  return <Markdown>{content}</Markdown>;
}
```

**Features**:
- GitHub Flavored Markdown (GFM)
- Syntax highlighting via rehype-highlight
- Raw HTML support via rehype-raw
- Math rendering via remark-math
- Custom component overrides

### HTML to Markdown Conversion

Convert HTML to markdown using Turndown:

```tsx
import { htmlToMarkdown } from "@beep/ui/data-display/markdown/html-to-markdown";

const markdown = htmlToMarkdown("<h1>Hello</h1><p>World</p>");
// # Hello\n\nWorld
```

## Dependencies

### Workspace Packages

| Package               | Purpose                                            |
|-----------------------|----------------------------------------------------|
| `@beep/ui-core`       | Theme primitives, design tokens, settings pipeline |
| `@beep/invariant`     | Assertion contracts and error handling             |
| `@beep/schema`        | Effect Schema validation                           |
| `@beep/utils`         | Pure runtime utilities                             |
| `@beep/constants`     | Shared constants and enums                         |
| `@beep/shared-domain` | Shared domain models                               |
| `@beep/identity`      | Package identity helpers                           |
| `@beep/types`         | Compile-time type utilities                        |

### UI Libraries

| Library               | Purpose                        |
|-----------------------|--------------------------------|
| `@mui/material`       | MUI Material design components |
| `@mui/x-data-grid`    | Data grid component            |
| `@mui/x-date-pickers` | Date/time pickers              |
| `@mui/x-tree-view`    | Tree view component            |
| `@mui/lab`            | MUI experimental components    |
| `@radix-ui/*`         | Radix UI primitives for shadcn |
| `lucide-react`        | Icon library                   |
| `@iconify/react`      | Iconify icon framework         |

### Styling

| Library                    | Purpose                     |
|----------------------------|-----------------------------|
| `tailwindcss`              | Utility-first CSS framework |
| `@tailwindcss/postcss`     | PostCSS integration         |
| `tailwind-merge`           | Tailwind class merging      |
| `tailwindcss-animate`      | Animation utilities         |
| `clsx`                     | Conditional class names     |
| `class-variance-authority` | Component variant utilities |

### Rich Text & Forms

| Library                | Purpose                                       |
|------------------------|-----------------------------------------------|
| `platejs`              | Plate.js rich text editor                     |
| `@platejs/*`           | Plate.js plugins (autoformat, markdown, etc.) |
| `@tanstack/react-form` | Form state management                         |
| `react-markdown`       | Markdown rendering                            |
| `turndown`             | HTML to markdown conversion                   |
| `zod`                  | Schema validation (interop)                   |

### Motion & Animation

| Library         | Purpose           |
|-----------------|-------------------|
| `framer-motion` | Animation library |

### Utilities

| Library                    | Purpose                                |
|----------------------------|----------------------------------------|
| `i18next`                  | Internationalization framework         |
| `react-i18next`            | React bindings for i18next             |
| `react-dropzone`           | File upload drag-and-drop              |
| `react-phone-number-input` | Phone number input                     |
| `sonner`                   | Toast notifications                    |
| `nprogress`                | Progress bar                           |
| `effect`                   | Effect runtime for hooks and utilities |

## Development

### Build Commands

```bash
# Incremental TypeScript build (watch mode)
bun run dev

# Full production build (ESM + CJS + annotated)
bun run build

# Build ESM only
bun run build-esm

# Build CJS only
bun run build-cjs

# Annotate pure calls
bun run build-annotate

# Copy CSS to build outputs
bun run copy-css

# Regenerate exports (after adding shadcn components)
bun run codegen
```

### Quality Checks

```bash
# Type check
bun run check

# Lint
bun run lint

# Lint and auto-fix
bun run lint:fix

# Run tests
bun run test

# Test with coverage
bun run coverage

# Detect circular dependencies
bun run lint:circular
```

### Adding shadcn Components

```bash
# Add shadcn component (with auto-formatting)
bun run ui-add

# Example: add button component
# > bun run ui-add
# > Which component would you like to add? button
```

**Important**: After adding new components, ensure `components.json` and barrel exports are updated

## Usage

### Basic Setup

```tsx
import { ThemeProvider } from "@beep/ui/theme/theme-provider";
import { SettingsProvider } from "@beep/ui/settings/context/settings-provider";
import "@beep/ui/globals.css";

function App({ children }) {
  return (
    <SettingsProvider defaultSettings={{ mode: "light" }}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SettingsProvider>
  );
}
```

### Using Components

```tsx
import { Iconify } from "@beep/ui/atoms/iconify";
import { Button } from "@beep/ui/components/button";
import { useBoolean } from "@beep/ui/hooks/use-boolean";

function Example() {
  const drawer = useBoolean();

  return (
    <Button onClick={drawer.onTrue}>
      <Iconify icon="mdi:menu" />
      Open Menu
    </Button>
  );
}
```

### Using Animations

```tsx
import { MotionLazy } from "@beep/ui/animate/motion-lazy";
import { varFade } from "@beep/ui/animate/variants";

function AnimatedCard() {
  return (
    <MotionLazy.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={varFade().inUp}
    >
      <h2>Animated Content</h2>
    </MotionLazy.div>
  );
}
```

### Using Layouts

```tsx
import { DashboardLayout } from "@beep/ui/layouts/dashboard";
import { AuthAdapterProvider } from "@beep/ui/providers/AuthAdapterProvider";

function Dashboard() {
  return (
    <AuthAdapterProvider {...authProps}>
      <DashboardLayout>
        <YourDashboardContent />
      </DashboardLayout>
    </AuthAdapterProvider>
  );
}
```

## What Belongs Here

- **React components**: Presentational UI components for all application layers
- **Theme integration**: Components that consume `@beep/ui-core` design tokens
- **Layout compositions**: Reusable page layouts and navigation structures
- **Form inputs**: Specialized input components with validation
- **Animation utilities**: Framer Motion variants and helpers
- **UI hooks**: React hooks for UI state and interactions
- **Styling utilities**: Tailwind/MUI composition helpers

## What Must NOT Go Here

- **Business logic**: Domain rules belong in slice `domain` or `application` layers
- **Backend integration**: API calls, database access, server-side logic
- **Domain-specific components**: Feature-specific components belong in slice `ui` packages
- **Route definitions**: Routing configuration belongs in applications
- **Environment configuration**: Config loading and validation

Keep this package focused on reusable, generic UI components that can be shared across all applications and features.

## Build Outputs

The build process generates multiple output formats:

- **ESM**: `build/esm/` - ES modules for modern bundlers
- **CJS**: `build/cjs/` - CommonJS for Node.js compatibility
- **Types**: `build/dts/` - TypeScript declarations
- **Source**: `build/src/` - Annotated source for tree-shaking

All outputs include the global CSS file for styling.

## Change Checklist

When making changes to this package:

- [ ] Updated barrel exports (`src/**/index.ts`) for new components
- [ ] Added new paths to `package.json#exports` if creating new directories
- [ ] Coordinated theme token or settings changes with `@beep/ui-core`
- [ ] Regenerated build artifacts via `bun run build`
- [ ] Ran `bun run codegen` after adding shadcn components
- [ ] Executed `bun run lint:fix` for code formatting
- [ ] Ran `bun run check` for type validation
- [ ] Added tests for new components or utilities
- [ ] Updated `components.json` if adding new alias directories
- [ ] Verified locale additions sync with `ThemeProvider`

## Relationship to Other Packages

- `@beep/ui-core` - Upstream theme primitives and design tokens
- `apps/web` - Primary consumer of components and layouts
- `packages/*/ui` - Feature-specific UI components that compose these base components
- `@beep/schema` - Validation schemas used in forms
- `@beep/utils` - Pure utilities for data transformation

## Testing

- Use Vitest for component and hook tests
- Colocate tests in `src/**/__tests__/` directories
- Test component behavior, not implementation details
- Use React Testing Library patterns
- Test accessibility and keyboard navigation where applicable

## Performance Considerations

- Use `MotionLazy` for code-split Framer Motion components
- Leverage React.memo for expensive re-renders
- Use stable hooks (`useStableCallback`, `useStableMemo`) to prevent unnecessary updates
- Keep bundle size in check - avoid importing entire MUI modules
- Use tree-shakeable imports via granular path exports

## Versioning and Changes

- Widely consumed package - prefer **additive** changes
- For breaking changes, update all consuming applications in the same PR
- Document migrations in CHANGELOG
- Coordinate breaking changes with `@beep/ui-core` updates
