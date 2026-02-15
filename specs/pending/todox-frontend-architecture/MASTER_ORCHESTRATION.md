# MASTER ORCHESTRATION: TodoX Frontend Architecture

> Decompose a 1,380-line monolithic prototype into a production-grade, feature-based frontend for an AI-native wealth management knowledge platform.

**Spec**: `specs/pending/todox-frontend-architecture/`
**Branch**: `todox-frontend-architecture`
**Target App**: `apps/todox/`

---

## 1. Architecture Vision

### Product Identity

TodoX is an AI-native wealth management knowledge platform for RIAs/MFOs serving UHNWI ($30M+). The hero feature is **GraphRAG meeting prep** that prepares advisors for client meetings in 30 seconds instead of 30 minutes, with every AI-generated fact linked to source evidence.

TodoX is NOT a task manager. TodoX is NOT Taskade. The Taskade UI reference captures (`specs/pending/taskade-ui-reference-capture/outputs/`) provide design inspiration for layout systems and navigation patterns, but every decision serves the wealth management domain.

### Directory Architecture

Feature-based directory structure under `apps/todox/src/features/`, where each domain module owns its components, hooks, types, and barrel export. Route files in `app/` are thin composition layers that import from feature modules.

### Component Boundaries

| Boundary | Strategy |
|----------|----------|
| **RSC vs Client** | Default to RSC. Add `"use client"` only for interactive components requiring hooks, event handlers, or browser APIs. Layout shells and data-fetching wrappers stay as RSC. |
| **Feature isolation** | Each feature module exports a public API via `index.ts`. No cross-feature imports except through shared components or hooks. |
| **Vertical slice scoping** | When frontend code can be scoped to a single vertical slice, it MUST live in `packages/{slice}/client` and `packages/{slice}/ui`, NOT in `apps/todox`. See `packages/iam/client` and `packages/iam/ui` for canonical examples. App-level code in `apps/todox` is for shell, routing, and cross-slice composition only. P1-P2 work (app shell, layout, navigation) is app-level infrastructure -- it correctly lives in `apps/todox/src/components/`. The slice scoping rule applies to P3+ features: workspace-specific UI goes in `packages/workspaces/ui/`, knowledge graph UI goes in `packages/knowledge/ui/`, etc. Cross-slice composition (e.g., dashboard assembling widgets from multiple slices) stays in `apps/todox`. |
| **Design system** | shadcn v3 (`base-nova` style) + `@base-ui/react` primitives. NO radix. NO MUI component imports. |
| **Icon system** | Phosphor React exclusively. NO lucide. NO inline SVGs. |

### State Management Strategy

| Concern | Technology | Scope |
|---------|-----------|-------|
| **Reactive UI state** | `@effect-atom/atom-react` (`Atom`) | Client-side UI state: panel visibility, sidebar collapse, theme mode |
| **Server state** | `@effect-atom/atom-react` (`runtime.atom`/`runtime.fn`) | Remote data: workspaces, documents, members, knowledge graph results, email threads. See `packages/iam/client/src/core/atoms.ts` for canonical pattern. |
| **URL state** | `@effect-atom/atom-react` (`Atom.searchParam`) | Tab selection, filter state, active workspace ID, settings section |
| **Storage state** | `@effect-atom/atom-react` (`Atom.kvs`) | Persisted preferences via localStorage/IDB (`BrowserKeyValueStore.layerLocalStorage`) |
| **Form state** | TanStack Form + Effect Schema | Form validation and submission |

### Routing Strategy

Next.js 16 App Router with route groups for layout boundaries:

```
app/
  (app)/              # Main app layout (AppShell with sidebar + navbar)
    workspace/[id]/   # Workspace views
    dashboard/        # Dashboard
    knowledge/        # Knowledge graph exploration
    comms/            # Email + calendar hub
  (auth)/             # Auth layout (centered card, no AppShell)
    sign-in/
    sign-up/
  (settings)/         # Settings layout (AppShell + settings sidebar)
    settings/
      account/
      password/
      connections/
      sessions/
      workspace/[id]/
      notifications/
      integrations/
  api/                # API routes (unchanged)
```

---

## 2. Target Directory Structure

```
apps/todox/src/
├── app/                                # Next.js routes (thin composition only)
│   ├── (app)/                          # Main app layout group
│   │   ├── layout.tsx                  # AppShell wrapper (RSC)
│   │   ├── page.tsx                    # Redirect to workspace or dashboard
│   │   ├── workspace/
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Workspace home
│   │   │       └── [pageId]/
│   │   │           └── page.tsx        # Document/page view
│   │   ├── dashboard/
│   │   │   └── page.tsx                # FlexLayout dashboard
│   │   ├── knowledge/
│   │   │   └── page.tsx                # Knowledge graph explorer
│   │   └── comms/
│   │       ├── page.tsx                # Comms hub
│   │       ├── mail/
│   │       │   └── page.tsx            # Email thread view
│   │       └── calendar/
│   │           └── page.tsx            # Calendar view
│   ├── (auth)/                         # Auth layout group
│   │   ├── layout.tsx                  # Centered auth card layout
│   │   └── auth/
│   │       ├── sign-in/page.tsx
│   │       └── sign-up/page.tsx
│   ├── (settings)/                     # Settings layout group
│   │   ├── layout.tsx                  # AppShell + settings sidebar
│   │   └── settings/
│   │       ├── page.tsx                # Redirect to account
│   │       ├── account/page.tsx
│   │       ├── password/page.tsx
│   │       ├── connections/page.tsx
│   │       ├── sessions/page.tsx
│   │       ├── notifications/page.tsx
│   │       ├── integrations/page.tsx
│   │       └── workspace/
│   │           └── [id]/
│   │               ├── page.tsx        # Workspace overview
│   │               └── members/page.tsx
│   ├── api/                            # API routes (existing, unchanged)
│   ├── layout.tsx                      # Root layout (providers, fonts, metadata)
│   └── globals.css                     # Theme system (existing, production-ready)
│
├── features/                           # Cross-slice composition ONLY
│   ├── dashboard/                      # FlexLayout dashboard (assembles widgets from multiple slices)
│   │   ├── components/
│   │   │   ├── dashboard-shell.tsx     # FlexLayout container
│   │   │   ├── widget-slot.tsx         # Widget container
│   │   │   └── widgets/               # Cross-slice widget wrappers
│   │   │       ├── recent-activity.tsx
│   │   │       ├── upcoming-meetings.tsx
│   │   │       └── action-items.tsx
│   │   ├── hooks/
│   │   │   └── use-dashboard-layout.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── settings/                       # Cross-slice settings shell (forms delegate to slice packages)
│       ├── components/
│       │   ├── settings-shell.tsx      # Settings sidebar + content area
│       │   └── settings-nav.tsx        # Settings navigation sidebar
│       ├── hooks/
│       │   └── use-settings-nav.ts
│       ├── types/
│       │   └── index.ts
│       └── index.ts
│
├── components/                         # Shared UI components
│   ├── app-shell/                      # Layout system
│   │   ├── app-shell.tsx               # Main shell: navbar + sidebar + content + side panel
│   │   ├── navbar.tsx                  # Top navigation bar (48px)
│   │   ├── mini-sidebar.tsx            # Icon-only global sidebar (50px)
│   │   ├── workspace-sidebar.tsx       # Expanded workspace sidebar (200-280px, resizable)
│   │   ├── side-panel.tsx              # Right side panel (AI chat, details)
│   │   └── content-area.tsx            # Main content area wrapper
│   ├── navigation/                     # Navigation primitives
│   │   ├── nav-item.tsx                # Navigation link with icon
│   │   ├── nav-section.tsx             # Collapsible navigation section
│   │   ├── breadcrumb.tsx              # Breadcrumb navigation
│   │   └── workspace-switcher.tsx      # Workspace selector dropdown
│   ├── data-display/                   # Data presentation
│   │   ├── data-table.tsx              # Sortable data table
│   │   ├── empty-state.tsx             # Empty state with illustration
│   │   ├── loading-skeleton.tsx        # Loading skeleton
│   │   └── error-boundary.tsx          # Error fallback UI
│   ├── ui/                             # shadcn v3 primitives (existing, keep as-is)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── ...                         # All existing shadcn components
│   │   └── sonner.tsx
│   ├── icons/                          # Phosphor icon wrappers
│   │   └── index.ts                    # Re-export commonly used Phosphor icons with standard sizes
│   ├── editor/                         # Lexical editor (existing, keep as-is)
│   │   └── ...
│   └── ai-chat/                        # Existing AI chat (to be migrated to features/ai-chat/)
│       └── ...
│
├── hooks/                              # Shared hooks
│   ├── use-media-query.ts              # Responsive breakpoint hook
│   ├── use-keyboard-shortcut.ts        # Keyboard shortcut registration
│   ├── use-panel-resize.ts             # Panel resize state
│   └── use-scribe.ts                   # Existing scribe hook
│
├── lib/                                # Utilities & configuration
│   ├── utils.ts                        # Existing utilities
│   └── constants.ts                    # App-wide constants
│
├── providers/                          # Existing providers (keep as-is)
│   ├── AuthGuard.tsx
│   ├── GuestGuard.tsx
│   ├── GuardErrorBoundary.tsx
│   └── GuardErrorFallback.tsx
│
├── theme/                              # Theme tokens (to be consolidated)
│   └── index.ts                        # Re-export oklch CSS variable references
│
├── services/                           # Existing services (keep as-is)
│   └── ai/
│
├── types/                              # Existing shared types
│   ├── index.ts
│   ├── mail.ts
│   └── globals.d.ts
│
├── global-providers.tsx                # Existing global providers
├── app-config.ts                       # Existing app config
├── config.ts                           # Existing config
└── proxy.ts                            # Existing proxy
```

### Slice-Scoped Feature Packages

Slice-specific UI lives in vertical slice packages, NOT in `apps/todox/src/features/`. See `REFERENCE_BRIDGE.md` Section 3 for complete component mapping.

| Slice | Package | Key Components |
|-------|---------|----------------|
| Workspace | `packages/workspaces/ui/src/` | Workspace sidebar, page tree, workspace card, workspace header |
| Knowledge + AI | `packages/knowledge/ui/src/` | Graph explorer, entity detail, chat panel, evidence card, meeting prep, action extraction |
| Comms | `packages/comms/ui/src/` | Mail list/detail/compose, calendar view, event card |
| Calendar | `packages/calendar/ui/src/` | Calendar views, scheduling interface |
| IAM | `packages/iam/ui/src/` | Account forms, security settings, session table, connected accounts |
| Customization | `packages/customization/ui/src/` | Theme preferences, hotkey configuration |

Route files in `apps/todox/src/app/` import from these packages and compose them within the AppShell.

---

## 3. Phase Details

### Phase 1: Prototype Decomposition

**Goal**: Break apart the monolithic `app-layout/page.tsx` (1,380 lines) into proper modules WITHOUT changing visual output or functionality.

**Prerequisite**: Read these documents before starting:
- `documentation/todox/PRD.md`
- `documentation/todox/MVP_COFUNDER_BRIEF.md`
- `specs/pending/taskade-ui-reference-capture/outputs/ARCHITECTURE_APP_SHELL.md`

#### Work Items

| # | Work Item | Description | Output Files |
|---|-----------|-------------|-------------|
| 1.1 | **Audit the prototype** | Map every distinct section in page.tsx: identify the Navbar (lines 19-160), MiniSidebar (lines 172-567), WorkspaceSidebar (lines 596-1290), ContentHeader (lines 1292-1323), ContentArea (lines 1324-1365), and portal roots. Catalog all inline SVG icons and map each to its Phosphor React equivalent. | `outputs/prototype-audit.md` |
| 1.2 | **Extract AppShell skeleton** | Create `components/app-shell/app-shell.tsx` with the L-shaped frame: Navbar (top, 48px) + MiniSidebar (left, 50px) + content area. Use `children` prop for content injection. | `components/app-shell/app-shell.tsx`, `components/app-shell/content-area.tsx` |
| 1.3 | **Extract Navbar component** | Extract lines 19-160 into `components/app-shell/navbar.tsx`. Replace inline SVGs with Phosphor icons: `GearSix`, `Bell`, `User`. Extract breadcrumb into `components/navigation/breadcrumb.tsx`. **Reconciliation**: Existing extracted components in `navbar/`, `sidebar/`, `mini-sidebar/`, `side-panel/` are the TARGET state -- they are more current than page.tsx (e.g., `top-navbar.tsx` already uses Phosphor icons). Merge newer page.tsx content into them, then wire page.tsx to import from these directories. Do NOT create duplicate directories like `components/app-shell/navbar.tsx` when `components/navbar/top-navbar.tsx` already exists. | `components/app-shell/navbar.tsx`, `components/navigation/breadcrumb.tsx` |
| 1.4 | **Extract MiniSidebar component** | Extract lines 172-567 into `components/app-shell/mini-sidebar.tsx`. Replace inline SVGs with Phosphor icons: `MagnifyingGlass`, `Clock`, `Users`, `CheckSquare`, `CalendarBlank`, `Star`, `Plus`, `Megaphone`, `Question`, `GearSix`. Extract workspace avatar into reusable component. | `components/app-shell/mini-sidebar.tsx`, `components/navigation/nav-item.tsx` |
| 1.5 | **Extract WorkspaceSidebar + settings nav** | Extract lines 596-1290 into `components/app-shell/workspace-sidebar.tsx` and `features/settings/components/settings-nav.tsx` (component extraction into the cross-slice settings shell -- NOT creating a feature module). Remove all mock data hardcoding; centralize in `data/mock.ts` with typed interfaces. Replace inline SVGs with Phosphor icons. Remove commented-out Taskade integration links. | `components/app-shell/workspace-sidebar.tsx`, `features/settings/components/settings-nav.tsx` |

#### Success Criteria

- [ ] `app-layout/page.tsx` reduced to <100 lines of route composition importing extracted components
- [ ] Zero inline SVG elements (all replaced with Phosphor React icons)
- [ ] Zero `styled` MUI imports in page.tsx (remove unused `styled` import and `StyledAvatar` definition). `global-providers.tsx` MUI providers are deferred to Phase 2.
- [ ] All extracted components render identically to the prototype when composed (verify via `bun run check --filter @beep/todox` + manual `bun run dev` inspection on `/app-layout` route)
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint --filter @beep/todox` passes
- [ ] No hardcoded mock data in component files (centralized in `data/mock.ts`)
- [ ] No file exceeds 300 lines
- [ ] `globals.css`, `global-providers.tsx`, `components/editor/`, and `components/ui/` unchanged (production-ready, DO NOT modify)

#### Detailed Component Map (from prototype audit)

```
page.tsx (1,380 lines)
├── Lines 1-8: Imports + MUI styled component (REMOVE MUI)
├── Lines 10-160: Navbar
│   ├── Lines 19-42: Logo + breadcrumb separator
│   ├── Lines 43-82: Settings breadcrumb link (inline gear SVG)
│   ├── Lines 86-157: Right section (notification bell, user avatar)
│   └── Lines 158-160: Navbar close
├── Lines 161-568: Main content area wrapper + MiniSidebar
│   ├── Lines 164-171: Overlay panel (opacity: 0, collapsed)
│   ├── Lines 172-567: MiniSidebar (50px)
│   │   ├── Lines 189-258: Top nav icons (search, recent, shared)
│   │   ├── Lines 262-337: Workspace avatars + add button
│   │   ├── Lines 339-489: Quick views (my-tasks, calendar, starred, quick-add, toggle)
│   │   └── Lines 490-564: Utility section (what's new, help, settings)
│   └── Line 567: MiniSidebar close
├── Lines 569-591: Content panel wrapper + portal roots
├── Lines 592-1291: WorkspaceSidebar (settings nav variant)
│   ├── Lines 600-611: Orb backdrop + sidebar container
│   ├── Lines 612-761: Mobile settings nav (collapsible)
│   ├── Lines 762-1093: Desktop settings nav links (General, Plans, Usage, Credits, Integrations)
│   ├── Lines 1094-1146: Additional nav (Notifications, Archives)
│   ├── Lines 1147-1255: Manage section (commented-out sub-items)
│   └── Lines 1256-1290: Workspace Settings section
├── Lines 1292-1365: Content area
│   ├── Lines 1296-1323: Content header (toggle button)
│   └── Lines 1324-1365: Settings content (General heading + "beep" placeholder)
└── Lines 1366-1381: Closing divs + export
```

---

### Phase 2: App Shell & Design System

**Goal**: Production-grade layout system with proper design tokens, resizable panels, and consolidated component library.

**Prerequisite**: Phase 1 complete. All components extracted and rendering correctly.

#### Work Items

| # | Work Item | Description | Output Files |
|---|-----------|-------------|-------------|
| 2.1 | **Build resizable AppShell** | Integrate `react-resizable-panels` for the WorkspaceSidebar panel. MiniSidebar stays fixed at 50px. WorkspaceSidebar resizable between 180-400px. Side panel (AI chat) resizable between 300-600px. Persist panel sizes to localStorage via Effect Atom. | `components/app-shell/app-shell.tsx` (rewrite), `hooks/use-panel-resize.ts` |
| 2.2 | **Establish shadcn v3 component audit** | Audit existing `components/ui/` against shadcn v3 `base-nova` style. Verify all components use `@base-ui/react` primitives (not radix). Add missing components: `command` (for search), `sheet` (for mobile sidebar), `popover` (for dropdowns). | `components/ui/` updates |
| 2.3 | **Create Phosphor icon system** | Create `components/icons/index.ts` that re-exports commonly used Phosphor icons with standardized size presets (`sm=16, md=20, lg=24`). Add a mapping file from the prototype audit showing old inline SVG to Phosphor equivalent. | `components/icons/index.ts` |
| 2.4 | **Consolidate CSS variables** | Audit `globals.css` (66KB). Remove any MUI-specific CSS variable references. Verify oklch color system is complete. Add any missing design tokens for new components. Ensure dark mode toggle works via `data-theme` attribute or class strategy. | `app/globals.css` updates |
| 2.5 | **Build responsive breakpoint system** | Create `hooks/use-media-query.ts` for responsive behavior. Define breakpoints: mobile (<768px sidebar collapses to sheet), tablet (768-1024px sidebar auto-collapses), desktop (>1024px full layout). Implement mobile sidebar as `Sheet` overlay. | `hooks/use-media-query.ts`, mobile sidebar behavior |
| 2.6 | **Set up route groups** | Create `(app)/layout.tsx`, `(auth)/layout.tsx`, `(settings)/layout.tsx` with appropriate shell wrappers. Move existing auth pages under `(auth)/`. Create settings layout with AppShell + settings nav sidebar. Route groups (`(app)/`, `(auth)/`, `(settings)/`) are Phase 2 scope. Phase 1 does NOT move any route files. | `app/(app)/layout.tsx`, `app/(auth)/layout.tsx`, `app/(settings)/layout.tsx` |

#### Success Criteria

- [ ] AppShell renders correctly with resizable panels
- [ ] All components use shadcn v3 `base-nova` style (verified via `components.json` registry)
- [ ] Zero radix imports (only `@base-ui/react`)
- [ ] Zero MUI imports anywhere in `apps/todox/`
- [ ] Phosphor icons render at correct sizes in all extracted components
- [ ] Responsive behavior works: mobile sheet sidebar, tablet auto-collapse, desktop full layout
- [ ] Route groups correctly isolate layout boundaries
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint --filter @beep/todox` passes

---

### Phase 3: Core Feature Modules

**Goal**: Establish the feature module pattern and build core workspace navigation and dashboard framework.

**Prerequisite**: Phase 2 complete. AppShell, design system, and route groups functional.

#### Work Items

| # | Work Item | Description | Output Files |
|---|-----------|-------------|-------------|
| 3.1 | **Create feature module template** | Establish the canonical feature module structure: `components/`, `hooks/`, `types/`, `index.ts`. Create a reference implementation that other features follow. Document the pattern in a code comment in the first feature module. | Template applied to first slice package (see slice-scoped packages table above) |
| 3.2 | **Build workspace navigation sidebar** | Create workspace navigation components in `packages/workspaces/ui/src/` with workspace tree, page hierarchy, and drag-and-drop reordering. Use `runtime.atom()` for workspace data fetching (see `packages/iam/client` for canonical atom patterns). Wire to `(app)/layout.tsx` via the resizable AppShell panel. | `packages/workspaces/ui/src/` components |
| 3.3 | **Build dashboard framework** | Create `features/dashboard/components/dashboard-shell.tsx` using FlexLayout for widget arrangement. Define widget slot interface. Create placeholder widgets: `recent-activity`, `upcoming-meetings`, `action-items`. Wire to `(app)/dashboard/page.tsx`. | `features/dashboard/` module |
| 3.4 | **Integrate Lexical editor** | Create `(app)/workspace/[id]/[pageId]/page.tsx` that renders the existing Lexical + Liveblocks editor (`components/editor/`). Ensure the editor loads within the AppShell content area with proper height management. | Route file + editor integration |
| 3.5 | **Build knowledge graph panel** | Migrate existing `features/knowledge-graph/viz/` into `packages/knowledge/ui/src/viz/`. Create `packages/knowledge/ui/src/components/graph-explorer.tsx` wrapping the existing force-directed graph renderer. Wire to `(app)/knowledge/page.tsx`. | `packages/knowledge/ui/src/` components |
| 3.6 | **Workspace management views** | Create workspace creation dialog and workspace settings entry point. Wire workspace selector in the MiniSidebar to navigate between workspaces. | `packages/workspaces/ui/src/components/workspace-card.tsx`, create dialog |

#### Success Criteria

- [ ] Feature module pattern established and documented
- [ ] Workspace sidebar displays workspace tree (can use mock data initially)
- [ ] Dashboard page renders FlexLayout with placeholder widgets
- [ ] Lexical editor loads within workspace page route
- [ ] Knowledge graph renders existing visualization
- [ ] Workspace switching works via MiniSidebar
- [ ] Slice-scoped features in `packages/{slice}/ui/`; cross-slice composition in `apps/todox/src/features/`
- [ ] No file exceeds 300 lines
- [ ] `bun run check --filter @beep/todox` passes

---

### Phase 4: Settings & Profile

**Goal**: Build all settings views using URL-driven navigation within the `(settings)/` route group.

**Prerequisite**: Phase 3 complete. Core features functional.

**Design reference**: `specs/pending/taskade-ui-reference-capture/outputs/CAPTURE_Account.md` through `CAPTURE_Workspace_Members_Apps.md` for layout inspiration. Adapt to TodoX identity.

#### Work Items

| # | Work Item | Description | Output Files |
|---|-----------|-------------|-------------|
| 4.1 | **Build settings shell** | Create `features/settings/components/settings-shell.tsx`. Settings uses the AppShell's own WorkspaceSidebar slot for settings navigation (replaces workspace tree with settings nav when in `(settings)/` route group). Content area shows the active settings page. | `features/settings/components/settings-shell.tsx`, `features/settings/components/settings-nav.tsx` |
| 4.2 | **Account settings** | Create `features/settings/components/account-form.tsx` with profile photo upload, display name, email, timezone, language. Use TanStack Form + Effect Schema for validation. Wire to `(settings)/settings/account/page.tsx`. | `features/settings/components/account-form.tsx` |
| 4.3 | **Security settings** | Create password change form (`password-form.tsx`) and connected accounts list (`connections-list.tsx`). Sessions table with device info, IP, last active, and revoke button. Wire to respective route pages. | `password-form.tsx`, `connections-list.tsx`, `sessions-table.tsx` |
| 4.4 | **Notification preferences** | Create `notifications-form.tsx` with toggles for email digest, meeting reminders, action item alerts, knowledge graph updates. Group by notification category. | `features/settings/components/notifications-form.tsx` |
| 4.5 | **Integration management** | Create `integrations-grid.tsx` showing available integrations: Gmail OAuth, Google Calendar, Outlook (coming soon). Each card shows connection status, connect/disconnect action. Wire to `(settings)/settings/integrations/page.tsx`. | `features/settings/components/integrations-grid.tsx` |

#### Success Criteria

- [ ] Settings navigation is URL-driven (each settings page has its own route)
- [ ] All settings views render within the AppShell using the settings sidebar variant
- [ ] Forms validate with Effect Schema
- [ ] Tab navigation between Account, Password, Connected Accounts, Sessions works
- [ ] Mobile settings navigation collapses to accordion
- [ ] `bun run check --filter @beep/todox` passes

---

### Phase 5: Communications & AI

**Goal**: Build email/calendar integration UI and evidence-backed AI chat panel that demonstrates the hero feature: GraphRAG meeting prep.

**Prerequisite**: Phase 4 complete. Settings and integrations views functional.

#### Work Items

| # | Work Item | Description | Output Files |
|---|-----------|-------------|-------------|
| 5.1 | **Email thread view** | Migrate existing `features/mail/` into `packages/comms/ui/src/components/mail/`. Refactor to use shadcn v3 components. Create thread view with inline AI annotations showing extracted entities and relationships. Wire to `(app)/comms/mail/page.tsx`. | `packages/comms/ui/src/components/mail/` |
| 5.2 | **Calendar integration view** | Create `features/comms/components/calendar/calendar-view.tsx` showing Google Calendar events. Highlight meetings with available prep data. "Prepare" button triggers meeting prep. Wire to `(app)/comms/calendar/page.tsx`. | `packages/comms/ui/src/components/calendar/` (or `packages/calendar/ui/src/`) |
| 5.3 | **AI chat panel with evidence linking** | Create evidence-linked chat components in `packages/knowledge/ui/src/`. This is NOT generic chat. Every AI response includes `evidence-card.tsx` components linking claims to source text. Evidence cards show: source document, relevant quote, confidence score, link to full context. Panel opens in the AppShell's right side panel. | `packages/knowledge/ui/src/` components |
| 5.4 | **Meeting prep view** | Create `features/ai-chat/components/meeting-prep.tsx`. The hero feature view: input a client name, get a comprehensive prep brief with sections for recent communications, portfolio changes, pending action items, relationship context. Every fact links to evidence. Wire to a dedicated route or as a side panel view. | `packages/knowledge/ui/src/components/meeting-prep.tsx` |
| 5.5 | **Action item extraction** | Create `features/ai-chat/components/action-extraction.tsx`. Display action items extracted from emails and meetings with: assignee, due date, source context, priority. Sortable table using `components/data-display/data-table.tsx`. | `packages/knowledge/ui/src/components/action-extraction.tsx` |
| 5.6 | **Client context aggregation** | Create a view that aggregates all knowledge about a specific client: communication history, meeting notes, portfolio data, relationships, action items. This is the "single pane of glass" for client context. | Client context view component |

#### Success Criteria

- [ ] Email thread view renders with entity highlighting
- [ ] Calendar view shows events with prep availability indicators
- [ ] AI chat panel shows evidence-linked responses (can use mock data for backend)
- [ ] Meeting prep view generates comprehensive brief with source citations
- [ ] Action items display in sortable table with source context
- [ ] Evidence cards link to source documents
- [ ] `bun run check --filter @beep/todox` passes

---

### Phase 6: Integration & Polish

**Goal**: Wire cross-feature flows, ensure responsive design, add loading/error/empty states, and pass accessibility audit.

**Prerequisite**: Phase 5 complete. All feature modules built.

#### Work Items

| # | Work Item | Description | Output Files |
|---|-----------|-------------|-------------|
| 6.1 | **Cross-feature routing & state** | Wire all features together: workspace selection updates dashboard, knowledge graph, and comms. Meeting prep can be triggered from calendar or AI chat. Email entity clicks navigate to knowledge graph. Ensure URL state is consistent across features. | Route integration, shared state atoms |
| 6.2 | **Responsive design audit** | Test all views at mobile (375px), tablet (768px), and desktop (1440px) breakpoints. Fix layout issues. Ensure mobile sidebar sheet works. Test touch interactions. | CSS fixes, responsive adjustments |
| 6.3 | **Loading, error, and empty states** | Add `Suspense` boundaries with skeleton loading for every async data load. Add error boundaries with retry actions. Design empty states for: no workspaces, no emails connected, no knowledge graph data, no meetings. | `components/data-display/` additions |
| 6.4 | **Accessibility audit** | Keyboard navigation for all interactive elements. ARIA labels on all icon buttons. Focus management for modals and panels. Color contrast verification against oklch palette. Screen reader testing for data tables. | ARIA fixes, focus management |

#### Success Criteria

- [ ] End-to-end MVP demo script passes (from `documentation/todox/MVP_COFUNDER_BRIEF.md`)
- [ ] All routes reachable via keyboard navigation
- [ ] All data states handled (loading, error, empty, populated)
- [ ] Responsive layout works at all breakpoints without visual breakage
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint --filter @beep/todox` passes
- [ ] Zero MUI component imports in `apps/todox/`
- [ ] No file exceeds 300 lines
- [ ] Slice-scoped features in `packages/{slice}/ui/`; cross-slice composition in `apps/todox/src/features/`

---

## 4. Agent Delegation Strategy

### Phase-Agent Matrix

| Phase | Primary Agents | Supporting Agents | Rationale |
|-------|---------------|-------------------|-----------|
| **P1: Decomposition** | `codebase-researcher` | `react-expert` | Researcher audits the prototype structure; react-expert extracts components |
| **P2: App Shell** | `react-expert` | `code-reviewer`, `web-researcher` | React-expert builds layout system; reviewer validates architecture; web-researcher for shadcn v3 docs |
| **P3: Features** | `react-expert`, `effect-expert` | `code-reviewer` | React-expert for components; effect-expert for Effect Atom state; reviewer for architecture validation |
| **P4: Settings** | `react-expert` | `code-reviewer` | React-expert for form components; reviewer for patterns |
| **P5: Comms & AI** | `react-expert`, `effect-expert` | `wealth-management-domain-expert`, `code-reviewer` | React-expert for UI; effect-expert for data flow; domain expert for wealth management terminology |
| **P6: Polish** | `react-expert` | `architecture-pattern-enforcer`, `code-reviewer` | React-expert for fixes; enforcer for final architecture validation |

### Agent Usage Guidelines

| Agent | Use For | Do Not Use For |
|-------|---------|---------------|
| `codebase-researcher` | Auditing existing code, finding patterns, mapping dependencies | Writing code or producing reports |
| `react-expert` | Building React components with VM architecture, Effect Atom state | Backend code, non-React UI |
| `effect-expert` | Effect Atom state management, typed error handling, Layer composition | React component markup |
| `code-reviewer` | Validating code against repository guidelines, Effect patterns | Architecture boundary validation |
| `architecture-pattern-enforcer` | Validating package boundaries, slice isolation, import patterns | Code-level pattern checks |
| `wealth-management-domain-expert` | Domain terminology, UHNWI context, wealth management concepts | Code implementation |
| `web-researcher` | shadcn v3 docs, base-ui API reference, Phosphor icon lookup | Effect-specific questions |

### Delegation Protocol

1. **Before each phase**: Run `codebase-researcher` to understand current state
2. **During implementation**: Use `react-expert` for component work, `effect-expert` for state management
3. **After each phase**: Run `code-reviewer` for guideline compliance, then `architecture-pattern-enforcer` for boundary validation
4. **Cross-cutting**: Use `wealth-management-domain-expert` whenever building domain-specific UI (meeting prep, client context, evidence linking)

### Orchestrator Allowed Actions

| Action | Allowed | Must Delegate |
|--------|---------|---------------|
| Read 1-3 files for context | Yes | - |
| Make 1-5 coordination calls | Yes | - |
| Synthesize agent outputs | Yes | - |
| Create handoff documents | Yes | - |
| Update REFLECTION_LOG.md | Yes | - |
| Read >3 files | - | `codebase-researcher` |
| Write source code | - | `react-expert` |
| Write tests | - | `test-writer` |
| Run gate checks | Via Bash | - |

---

### Context Compression Strategy

Phase handoffs follow the tiered memory model from `specs/_guide/HANDOFF_STANDARDS.md`:

| Memory Type | Budget | Content |
|-------------|--------|---------|
| **Working** | ≤2,000 tokens | Current phase tasks, success criteria, blocking issues |
| **Episodic** | ≤1,000 tokens | Previous phase outcomes (2-3 sentences), key decisions |
| **Semantic** | ≤500 tokens | Tech stack constraints (bullets, no code examples) |
| **Procedural** | Links only | References to `.claude/rules/`, `MASTER_ORCHESTRATION.md`, `README.md` |
| **Total** | **≤4,000** | Well under 32K degradation threshold |

**Compression rules for handoff authors:**

1. No inline code examples in handoffs -- link to `.claude/rules/effect-patterns.md` or `README.md`
2. Work items as tables, not paragraphs
3. Gotchas as one-line bullets, not paragraphs
4. Reference files limited to 6-8 most critical entries
5. Previous phase summaries compressed to 2-3 sentences via extractive summarization

**Content placement** (lost-in-middle mitigation):

| Position | Priority | Content |
|----------|----------|---------|
| First 25% | Critical | Mission, success criteria, constraints |
| Middle 50% | Supporting | Work items, episodic history |
| Last 25% | Actionable | Verification, gotchas, procedural links |

---

## 5. Risk Registry

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **MUI removal breaks existing components** | Medium | High | Phase 1 audit identifies all MUI dependencies. Replace incrementally, not all at once. The prototype uses `styled` from MUI (line 2) for the `StyledAvatar` - replace with Tailwind classes. Check for MUI imports in `theme/` directory (19 MUI theme files that become dead code). |
| R2 | **Workspace domain model in flux** | High | Medium | The `documents` to `workspaces` package migration is in-flight. Use workspace terminology in the UI but keep data contracts abstract. Use `runtime.atom()` with placeholder endpoints that can be swapped when backend stabilizes. |
| R3 | **shadcn v3 + base-ui is newer, agents default to radix** | High | Medium | Explicit instruction in every agent prompt: "Use `@base-ui/react`, NOT `@radix-ui/react`". Verify `components.json` shows `base-nova` style. Run `grep -r "radix" apps/todox/src/` as a gate check after each phase. |
| R4 | **FlexLayout + Liveblocks integration complexity** | Medium | Medium | Dashboard (Phase 3) uses FlexLayout for widget arrangement. Liveblocks is already integrated for the Lexical editor. Keep FlexLayout isolated to the dashboard feature module. Do not attempt real-time collaborative dashboard layout until after MVP. |
| R5 | **Evidence linking requires knowledge graph backend** | High | High | Phase 5 depends on GraphRAG backend endpoints. Create mock data fixtures that simulate evidence-linked responses. Design the evidence card component to work with a defined contract interface, so real backend can be swapped in later. |
| R6 | **66KB globals.css contains production-ready tokens** | Low | High | The CSS file is large but production-ready. Do NOT rewrite it. Only add tokens or remove MUI-specific references. Any accidental deletion of CSS variables will break the entire theme. |
| R7 | **Existing feature modules (mail, knowledge-graph) have different structure** | Medium | Low | Phase 3 and 5 migrate these into the new feature module pattern. Preserve existing logic, restructure the directory layout. Test that existing functionality still works after migration. |
| R8 | **Inline SVGs in prototype are custom Taskade icons** | Low | Medium | Phase 1 audit maps each SVG to its Phosphor equivalent. Some Taskade-specific icons may not have exact Phosphor matches. Use closest Phosphor alternative and document any gaps. |
| R9 | **`app-layout/page.tsx` is a settings view, not a workspace view** | Low | Medium | The prototype specifically renders the settings sidebar (Account, Password, etc.). The actual workspace/dashboard layout is not prototyped yet. Phase 2-3 must design the workspace layout from scratch, using the Taskade ARCHITECTURE_APP_SHELL.md as inspiration. |

---

## 6. Verification Commands

### Per-Phase Verification

Run these after completing each phase:

```bash
# Type checking (cascades through dependencies)
bun run check --filter @beep/todox

# Linting
bun run lint --filter @beep/todox

# Auto-fix lint issues
bun run lint:fix --filter @beep/todox

# Run tests (if any exist)
bun run test --filter @beep/todox
```

### Architecture Gate Checks

```bash
# Verify no MUI component imports remain
grep -r "from ['\"]@mui" apps/todox/src/ --include="*.tsx" --include="*.ts"
# Expected: zero results (except possibly theme/ files being deleted)

# Verify no radix imports
grep -r "from ['\"]@radix-ui" apps/todox/src/ --include="*.tsx" --include="*.ts"
# Expected: zero results

# Verify no inline SVG elements (after Phase 1)
grep -rn "<svg" apps/todox/src/ --include="*.tsx" | grep -v "node_modules" | grep -v "components/editor/"
# Expected: zero results outside the editor (which is pre-existing)

# Verify no lucide imports
grep -r "from ['\"]lucide-react" apps/todox/src/ --include="*.tsx" --include="*.ts"
# Expected: zero results

# Verify feature module structure
ls apps/todox/src/features/*/index.ts
# Expected: barrel exports for each feature module

# Verify no file exceeds 300 lines
find apps/todox/src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
# Expected: no file > 300 lines (except globals.css and editor files)
```

### Pre-existing Lint Errors

Pre-existing lint issues in `page.tsx`: line 113 (biome suppression placeholder) and line 2 (unsorted imports). P1 agent should fix these as part of the extraction work. 6 warnings in unrelated files (demo, editor, chart) are out of scope.

### Pre-Commit Checklist

Before committing any phase:

1. `bun run lint:fix --filter @beep/todox` -- fix auto-fixable issues
2. `bun run check --filter @beep/todox` -- verify types
3. Run architecture gate checks above
4. Visually verify the app renders correctly (if dev server is running)

---

## 7. Key Reference Files

| File | Purpose | Read When |
|------|---------|-----------|
| `apps/todox/src/app/app-layout/page.tsx` | Monolithic prototype (1,380 lines) | Phase 1 |
| `apps/todox/src/app/globals.css` | Theme system (66KB, production-ready) | Phase 2 |
| `apps/todox/components.json` | shadcn v3 configuration | Phase 2 |
| `apps/todox/src/theme/` | MUI theme files (to be removed) | Phase 2 |
| `apps/todox/src/components/ui/` | Existing shadcn v3 components | Phase 2 |
| `apps/todox/src/features/mail/` | Existing mail feature module | Phase 5 |
| `apps/todox/src/features/knowledge-graph/` | Existing knowledge graph viz | Phase 3 |
| `apps/todox/src/components/editor/` | Lexical editor (keep as-is) | Phase 3 |
| `apps/todox/src/components/ai-chat/` | Existing AI chat panel | Phase 5 |
| `apps/todox/src/global-providers.tsx` | Provider stack | All phases |
| `specs/pending/taskade-ui-reference-capture/outputs/ARCHITECTURE_APP_SHELL.md` | Layout inspiration | Phase 1-2 |
| `specs/pending/taskade-ui-reference-capture/outputs/CAPTURE_Account.md` | Settings layout inspiration | Phase 4 |
| `specs/pending/taskade-ui-reference-capture/outputs/COMPLETION_SUMMARY.md` | Pattern synthesis | Phase 1 |
| `documentation/todox/PRD.md` | Full product requirements | All phases |
| `documentation/todox/MVP_COFUNDER_BRIEF.md` | MVP scope + demo script | Phase 6 |
| `documentation/brainstorming/workspaces-migration-kickoff.md` | Workspace domain model | Phase 3 |

---

## 8. Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Do This Instead |
|-------------|-------------|-----------------|
| Building "Taskade for wealth management" | TodoX has its own identity, domain, and hero features | Use Taskade captures as layout inspiration only, not functional requirements |
| Keeping MUI alongside shadcn v3 | Two design systems create inconsistency and bundle bloat | Remove MUI completely; use shadcn v3 + base-ui exclusively |
| Monolithic page files (>300 lines) | Unmaintainable, impossible to review, hard to test | Feature modules with <300 line files |
| Local state where URL state should be used | Breaks back/forward navigation, not shareable | Use `Atom.searchParam("key")` for tab selection, filters, active IDs |
| Generic AI chat UI | Misses the core value proposition of evidence linking | Every AI response must include evidence cards with source citations |
| Implementing settings before core features | Settings are important but not the hero flow | Build workspace + dashboard + knowledge first (Phase 3), then settings (Phase 4) |
| Inline SVGs | 60% of prototype line count is SVG paths | Use Phosphor React icons exclusively |
| Direct cross-package imports | Creates coupling between vertical slices | Import through `@beep/shared-*` or `@beep/common-*` packages |
| Rewriting globals.css | 66KB of production-ready oklch tokens | Only add/remove specific variables, never rewrite |
| Using `import { styled } from "@mui/material/styles"` | MUI dependency that must be eliminated | Use Tailwind CSS classes |
