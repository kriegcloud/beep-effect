# Architecture: App Shell

> Synthesized from: Workspace Home, Sidebar Navigation, Workspace Header captures
> Phase 1 — Workspace Shell Pilot

## Shell Composition

The Taskade app shell is a three-component persistent frame that wraps all workspace content:

1. **Navbar** (top, 48px) — Workspace identity, switching, team management, notifications, user account
2. **Sidebar** (left, 56px) — Global navigation with icon tooltips, workspace selection, quick views, utilities
3. **Content area** (remaining space) — Page-specific content, scrollable independently

These three components are always visible regardless of which page is active. They compose as an L-shaped frame with the navbar on top and sidebar on the left.

## Layout Model

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVBAR (48px, fixed)                      │
│  [Logo] / [Workspace ▾]           [+People] [...] [🔔] [👤] │
├──────┬──────────────────────────────────────────────────────┤
│      │                                                      │
│  S   │                                                      │
│  I   │              CONTENT AREA                            │
│  D   │           (page-specific)                            │
│  E   │                                                      │
│  B   │         Scrolls independently                        │
│  A   │         Width: viewport - 56px                       │
│  R   │         Height: viewport - 48px                      │
│      │                                                      │
│ 56px │                                                      │
│ fixed│                                                      │
│      │                                                      │
└──────┴──────────────────────────────────────────────────────┘
```

### Measurements

| Component | Width | Height | Position | Behavior |
|-----------|-------|--------|----------|----------|
| Navbar | 100vw (1745px) | 48px | Fixed, top: 0, left: 0 | Always visible, z-index above content |
| Sidebar | 56px | calc(100vh - 48px) ≈ 821px | Fixed, top: 48px, left: 0 | Always visible, z-index above content |
| Content | calc(100vw - 56px) ≈ 1689px | calc(100vh - 48px) ≈ 821px | Relative, top: 48px, left: 56px | Scrollable, receives page content |

## Component Hierarchy

```
AppShell
├── Navbar (position: fixed, z: high)
│   ├── LeftSection
│   │   ├── Logo (link → /)
│   │   ├── BreadcrumbSeparator ("/")
│   │   └── WorkspaceSelector
│   │       ├── WorkspaceAvatar (green circle)
│   │       ├── WorkspaceName ("Workspace")
│   │       └── ChevronDropdown → WorkspaceSwitcher
│   │           ├── CurrentWorkspace (✓)
│   │           └── NewWorkspace (+)
│   └── RightSection
│       ├── AddPeopleButton
│       ├── MoreActionsMenu (...)
│       ├── NotificationBell → ActivityPanel
│       └── UserAvatar → AccountMenu
│
├── Sidebar (position: fixed, z: high)
│   ├── TopNavigation
│   │   ├── SearchIcon (→ /search, Ctrl+K)
│   │   ├── RecentIcon (→ /recent)
│   │   └── SharedIcon (→ /shared)
│   ├── WorkspaceSection
│   │   ├── WorkspaceIcon (→ /spaces/{id}, active state)
│   │   └── NewWorkspaceButton (+)
│   ├── QuickViews (collapsible)
│   │   ├── MyTasksIcon (→ /my-tasks)
│   │   ├── CalendarIcon (→ /calendar)
│   │   ├── StarredIcon (→ /lists/starred)
│   │   └── QuickAddButton (Ctrl+shortcut)
│   └── UtilitySection
│       ├── HideQuickViewsToggle
│       ├── WhatsNewButton
│       ├── HelpButton
│       └── SettingsButton
│
└── ContentArea (overflow: auto)
    └── {PageContent} (injected by router)
```

## State Management

### Shell-Level State

| State | Scope | Persistence | Description |
|-------|-------|-------------|-------------|
| Current workspace | Global | URL + context | Which workspace is active (drives sidebar active icon and navbar label) |
| Sidebar collapsed | User preference | LocalStorage | Quick views section can be hidden via toggle |
| Activity panel open | Session | Memory | Right-side panel toggle for notifications |
| Notification count | Global | Server-synced | Unread notification badge on bell icon |
| User session | Global | Cookie/token | Authentication state driving avatar and permissions |

### Navigation Routing

| Route Pattern | Content Type | Shell Behavior |
|---------------|-------------|----------------|
| /spaces/{id} | Workspace home | Sidebar: workspace icon active (green) |
| /search | Search results | Sidebar: search icon active |
| /recent | Recent items | Sidebar: recent icon active |
| /shared | Shared items | Sidebar: shared icon active |
| /my-tasks | Task list | Sidebar: my tasks icon active |
| /calendar | Calendar view | Sidebar: calendar icon active |
| /lists/starred | Starred items | Sidebar: starred icon active |
| /settings/* | Settings pages | Sidebar: settings icon active (replaces content with settings layout) |

## Visual Design Patterns

### Color System
- **Background**: Very dark (#0d0d0d to #1a1a1a range)
- **Sidebar bg**: Slightly lighter than content bg
- **Navbar bg**: Same as sidebar
- **Active icon**: Green tint (#4caf50 range) with circular avatar highlight
- **Icon default**: Muted white/gray (~60% opacity)
- **Icon hover**: Bright white (100% opacity) with subtle background highlight
- **Accent**: Green for active workspace, UI accents

### Tooltip Pattern
- Appears to the right of sidebar icons on hover
- Dark background with white text
- Shows keyboard shortcuts where applicable (Ctrl+K for Search)
- Small, non-intrusive, disappears on mouse leave

### Ambient Effects
- Green-tinted ambient orb glow in workspace home center area
- Warm gradient (orange/peach) in bottom-left area
- These effects are page-content specific, not part of the shell

## TodoX Implementation Strategy

### Phase 1: Shell Frame
Build the three-component shell as a Next.js layout:
- `apps/todox/src/app/layout.tsx` — Root layout with shell
- `apps/todox/src/components/shell/Navbar.tsx` — Top navigation bar
- `apps/todox/src/components/shell/Sidebar.tsx` — Left icon bar
- `apps/todox/src/components/shell/ContentArea.tsx` — Scrollable content wrapper

### Phase 2: Navigation
Wire routing to sidebar icons:
- Use Next.js App Router for page routing
- Active state tracking via `usePathname()`
- Tooltip component from shadcn

### Phase 3: Interactive Features
Add workspace-specific features:
- Workspace switcher dropdown (DropdownMenu)
- Activity panel (Sheet component, right-side)
- User account menu
- Search command palette (Ctrl+K)

### Package Dependencies
| Shell Component | Primary Package | Supporting Packages |
|----------------|----------------|---------------------|
| Navbar | @beep/ui | @beep/iam-client, @beep/workspaces-client |
| Sidebar | @beep/ui | @beep/shared-client (routing), @beep/customization-client (preferences) |
| Content Area | @beep/ui | (page-specific packages) |
| Activity Panel | @beep/comms-ui | @beep/comms-client |
| Workspace Switcher | @beep/workspaces-ui | @beep/workspaces-client |
| User Menu | @beep/iam-ui | @beep/iam-client |

## Key Architectural Decisions

1. **Fixed positioning for shell components** — Navbar and sidebar are position:fixed, content area compensates with margin/padding. This ensures the shell never scrolls.

2. **56px sidebar width is icon-only** — No text labels in sidebar, only icons with hover tooltips. This maximizes content area while maintaining navigation.

3. **Workspace context is URL-driven** — The active workspace is determined by the URL path (/spaces/{id}), not a global state selector. This enables deep-linking and browser history.

4. **Activity panel overlays content** — Notification panel slides in from the right as an overlay, not a persistent sidebar. Content area does not resize.

5. **Three-section sidebar organization** — Top (global nav), Middle (workspace + quick views), Bottom (utilities). Clear visual grouping with spacing.
