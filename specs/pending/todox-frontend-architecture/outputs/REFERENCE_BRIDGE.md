# Taskade-to-TodoX Reference Bridge

> Bridges the Taskade UI reference captures (17 views, 19 output files) with TodoX's specific architectural and product needs.

## Critical Context

**TodoX is NOT Taskade.** TodoX is an AI-native wealth management knowledge platform for wealth advisors (RIAs/MFOs serving UHNWI with $30M+ AUM). The hero feature is GraphRAG meeting prep that generates client briefings in 30 seconds with evidence-backed claims. Taskade captures provide **layout and interaction pattern inspiration** -- never feature parity targets.

When this document says "adopt," it means adopt the structural pattern. When it says "adapt," it means the pattern transfers but must be rethought for wealth management context. When it says "skip," it means the pattern is irrelevant to TodoX.

---

## Section 1: Pattern Transfer Matrix

### 1.1 Layout Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **3-column settings layout** (56px icon sidebar + 165px settings nav + fluid content) | Adapt | TodoX uses the AppShell sidebar as its primary nav, so settings becomes **2-column within the content area**: settings nav (left) + settings content (right). The 56px icon sidebar is the AppShell sidebar, not a settings-specific construct. | `ARCHITECTURE_APP_SHELL.md`, `CAPTURE_Account.md` |
| **App shell: navbar (48px) + sidebar (56px) + content** | Adopt | Direct adoption. TodoX already has `components/navbar/`, `components/sidebar/`, `components/mini-sidebar/`. The L-shaped frame (navbar top, sidebar left, content remaining) is the correct structure. | `ARCHITECTURE_APP_SHELL.md` |
| **Fixed-position shell components** | Adopt | Navbar and sidebar use `position: fixed` with content area compensating via margin/padding. Ensures shell never scrolls while content scrolls independently. | `ARCHITECTURE_APP_SHELL.md` |
| **56px icon-only sidebar** | Adopt | Icon-only with Phosphor icons and hover tooltips. No text labels in sidebar. Maximize content area for dashboards and knowledge graph views where horizontal space is critical. | `CAPTURE_Sidebar_Navigation.md` |
| **Three-section sidebar organization** (top nav, workspace, utilities) | Adapt | TodoX sidebar sections: **Top** (search/command palette, recent, household/client quick-access), **Middle** (workspace selector, workspace-specific views), **Bottom** (settings, help, profile). No "What's New" or generic social features. | `CAPTURE_Sidebar_Navigation.md` |
| **Two-column form layout** (photo left, fields right) | Adopt | Direct adoption for account/profile settings. Photo upload area on left, form fields on right. | `CAPTURE_Account.md` |
| **Single-column sectioned form** (stacked sections with HR separators) | Adopt | Direct adoption for security settings (password, MFA, access tokens). Each section has heading + description + input + action button. | `CAPTURE_Password.md` |
| **Card-row layout** (provider icon + name + status + action) | Adopt | Direct adoption for connected accounts (Google SSO, Google Calendar OAuth, future: Gmail). Horizontal card per provider with connect/disconnect actions. | `CAPTURE_Connected_Accounts.md` |
| **Two-column inner layout** (primary content + sidebar cards) | Skip | Credits & Rewards uses this pattern, but TodoX has no gamified referral system. The pattern itself is generic and available if needed for future dashboard layouts. | `CAPTURE_Credits_Rewards.md` |

### 1.2 Navigation Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **URL-driven tab navigation** (sub-tabs within settings views) | Adopt | Direct adoption. All tab strips (General sub-tabs, Workspace sub-tabs, Archives sub-tabs) use URL segments for state. Enables deep linking and browser back/forward. Implement with Next.js App Router route segments, not local state. | `CAPTURE_Account.md`, `CAPTURE_Archives.md`, `CAPTURE_Workspace_Members_Apps.md` |
| **Expandable sidebar navigation groups** (Integrations, Manage) | Adopt | Settings sidebar groups that expand to reveal sub-items. TodoX groups: General (Account, Security, Connected Accounts, Sessions), Workspace (Overview, Members, Agents), Integrations (Gmail, Google Calendar). | `CAPTURE_Integrations.md`, `CAPTURE_Manage_Workspaces.md` |
| **Workspace context via URL** (`/spaces/{id}`) | Adopt | Active workspace determined by URL path, not global state selector. Enables deep-linking. TodoX pattern: `/workspace/{workspaceId}/...` | `ARCHITECTURE_APP_SHELL.md` |
| **Breadcrumb navigation** (logo / workspace name) | Adapt | TodoX breadcrumb: Logo / Workspace Name / Current View. Extended to support deeper nesting for household views (e.g., Logo / Acme Advisory / Thompson Household / Meeting Prep). | `CAPTURE_Workspace_Header.md` |
| **Command palette** (Ctrl+K search) | Adopt | Direct adoption. Global search accessible from sidebar icon and keyboard shortcut. TodoX-specific: search surfaces clients, households, meeting notes, knowledge graph entities -- not generic tasks. | `CAPTURE_Sidebar_Navigation.md` |
| **Workspace switcher dropdown** | Adopt | Dropdown in navbar for switching between advisory workspaces. Matches Taskade pattern: current workspace shown, chevron trigger, dropdown with workspace list + "New workspace" option. | `CAPTURE_Workspace_Header.md` |

### 1.3 Data Display Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **Sortable data tables** (header row, sort affordances, action column) | Adopt | Core pattern for: client lists, session management, action item tables, member tables, knowledge entity lists. Sortable headers with URL query param sync (`?sort=name-desc`). Shared `SortableTableHeader` component in `@beep/ui`. | `CAPTURE_Sessions.md`, `CAPTURE_Workspace_Members_Apps.md` |
| **Data table with kebab actions** (per-row dropdown menu) | Adopt | Direct adoption for resource management views: workspace apps, client households, document lists. Per-row `...` button opening action dropdown (Open, Archive, Delete). | `CAPTURE_Workspace_Members_Apps.md` |
| **Role badge pattern** (emoji prefix + text label) | Adapt | TodoX uses role badges without emojis. Clean text badges for roles: Owner, Admin, Advisor, Associate. Role definitions and display properties in `@beep/iam-domain`. Phosphor icons instead of emoji prefixes. | `CAPTURE_Workspace_Members_Apps.md` |
| **Status indicator** (Active/Inactive text badge) | Adopt | Direct adoption for agent status, integration status, workspace status. Color-coded: active (green), inactive (muted), error (destructive). | `CAPTURE_Workspace_Members_Apps.md` |
| **Avatar component** (multiple sizes, image/initials fallback) | Adopt | Direct adoption. Used for: user profiles, team members, workspace icons, client avatars. Multiple sizes (sm, md, lg). Initials fallback when no image. | `CAPTURE_Account.md`, `CAPTURE_Workspace_Members_Apps.md` |
| **Preference matrix** (event types x channels grid) | Adapt | Taskade uses this for notification preferences (6 event types x 3 channels). TodoX notification events differ: Meeting Reminders, Client Updates, AI Briefing Ready, Document Shared, Team Mentions, System Alerts. Same grid structure, different rows. | `CAPTURE_Notifications.md` |
| **Per-workspace notification overrides** | Adopt | Direct adoption. Override default notification preferences for specific workspaces. Same "Use default" button pattern. | `CAPTURE_Notifications.md` |
| **Accordion/expandable sections** | Adopt | Direct adoption for: usage breakdown, collapsible instructions, FAQ sections. Chevron rotation animation on toggle. | `CAPTURE_Usage_Billing.md`, `CAPTURE_Integrations.md` |

### 1.4 Form Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **Profile form** (username, email, timezone, language, date format) | Adapt | TodoX profile: full name, email, timezone, date format, preferred language, professional title (CFA, CFP, etc.), firm affiliation. No username field (email is the identifier). | `CAPTURE_Account.md` |
| **Destructive action with email confirmation** (Delete Account) | Adopt | Direct adoption. Delete account requires email re-entry. Same pattern for workspace deletion. Separated by horizontal rule, destructive button styling. | `CAPTURE_Account.md` |
| **Destructive action dropdown guard** (Archive/Delete workspace) | Adopt | Direct adoption. Workspace Actions dropdown with Archive and Delete options. Destructive actions behind a dropdown gate, not exposed as top-level buttons. | `CAPTURE_Workspace_Overview.md` |
| **Password change form** (current + new + confirm) | Adopt | Direct adoption. Three stacked password inputs with show/hide toggle. | `CAPTURE_Password.md` |
| **MFA configuration** | Adopt | Direct adoption. Enable/disable 2FA with QR code and backup codes. | `CAPTURE_Password.md` |
| **API token management** (generate, list, revoke) | Adopt | Direct adoption. Table with label, masked token, permissions (Read/Write badges), delete action. Generate button above table. Confirmation dialog on revoke. | `CAPTURE_Integrations.md` |
| **Auto-saving preferences** (no submit button for dropdowns) | Adopt | Direct adoption for notification preferences. Each dropdown change auto-saves via optimistic update. No form-level submit button. | `CAPTURE_Notifications.md` |

### 1.5 Integration Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **Token-based integration** (Calendar Feed webcal URL) | Adapt | TodoX may expose calendar feed URLs for meeting/action item calendars. Read-only URL with copy button pattern is reusable. | `CAPTURE_Integrations.md` |
| **OAuth-based integration** (Google Calendar connect/disconnect) | Adopt | Primary integration pattern for TodoX. Gmail OAuth (email ingestion), Google Calendar OAuth (meeting sync). Connect button triggers OAuth redirect, disconnect button revokes. | `CAPTURE_Integrations.md` |
| **Embedded widget integration** (Zapier SDK) | Skip | TodoX does not embed third-party automation widgets in MVP. If needed later, the iframe/SDK embed pattern from Taskade applies. | `CAPTURE_Integrations.md` |

### 1.6 Empty State Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **Minimal management empty state** (plain text, no CTA) | Adopt | For admin views where emptiness is normal: "No archived workspaces," "No active sessions on other devices." No illustration, no call-to-action. | `CAPTURE_Archives.md` |
| **Rich promotional empty state** (illustrations, CTAs, gamification) | Adapt | TodoX uses rich empty states for onboarding moments only: first workspace creation, first client household, first knowledge graph connection. **No gamification** -- wealth advisors expect professional, understated UX. CTA-driven but not playful. | `CAPTURE_Credits_Rewards.md`, `CAPTURE_Workspace_Home.md` |

### 1.7 Visual Design Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **Dark theme via lightness variation** (no borders for depth) | Adopt | Already aligned. TodoX uses oklch color system with lightness-based depth. Dark mode uses `--background: oklch(0.19 ...)`, `--card: oklch(0.21 ...)`, `--accent: oklch(0.34 ...)`. Elevation via background-color shifts, not strokes. | `COMPLETION_SUMMARY.md`, `globals.css` |
| **Tooltip pattern** (appears right of sidebar icons) | Adopt | Direct adoption. Dark background, white text, keyboard shortcuts where applicable. Phosphor icon + tooltip label + optional shortcut hint. | `CAPTURE_Sidebar_Navigation.md` |
| **Icon hover state** (muted default, bright on hover) | Adopt | Icon default at ~60% opacity, hover at 100% with subtle background highlight. Consistent across all sidebar and toolbar icons. | `CAPTURE_Sidebar_Navigation.md` |
| **Ambient effects** (gradient orbs, glows) | Skip | Taskade's green ambient orb and warm gradient are brand-specific. TodoX has its own ambient effects defined in `globals.css` (`--orb-*` variables, `--glass-*` variables). Use TodoX's existing liquid glass aesthetic. | `ARCHITECTURE_APP_SHELL.md` |

### 1.8 Billing/Subscription Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **Pricing tier cards** (Starter/Pro/Business with feature lists) | Adapt | TodoX pricing tiers will differ (advisory-specific tiers). The card comparison layout with monthly/yearly toggle and feature checklists transfers. Use `@billingsdk` registry. | `CAPTURE_Plans.md` |
| **Current plan card** | Adopt | Show current plan tier, billing period, and manage subscription action. | `CAPTURE_Usage_Billing.md` |
| **Usage breakdown accordion** | Adapt | TodoX metrics differ: AI credits consumed, knowledge graph entities, documents ingested, meeting preps generated, active households. Same accordion expand/collapse pattern. | `CAPTURE_Usage_Billing.md` |
| **Workspace resource table** | Adapt | TodoX version: workspace list with agent count, member count, document count. Same sortable table structure. | `CAPTURE_Usage_Billing.md` |
| **Credits balance display** | Skip | TodoX does not have a gamified credits system. AI usage is metered as part of the subscription tier, not earned through social actions. | `CAPTURE_Credits_Rewards.md` |
| **Gamified referral system** (invite, share, reviews, follow) | Skip | Not appropriate for wealth management platform. Professional referral programs, if any, would use different UX patterns. | `CAPTURE_Credits_Rewards.md` |

### 1.9 Workspace Administration Patterns

| Taskade Pattern | Transfer | TodoX Adaptation | Reference File |
|----------------|----------|------------------|----------------|
| **Manage workspaces table** (workspace name + manage action) | Adopt | Direct adoption. List all workspaces under subscription with Manage link to individual workspace settings. | `CAPTURE_Manage_Workspaces.md` |
| **Workspace overview** (plan card + members + actions) | Adopt | TodoX workspace overview: subscription tier card, member list with invite, workspace actions dropdown (Archive, Delete). | `CAPTURE_Workspace_Overview.md` |
| **Workspace member table** (avatar, username, display name, role) | Adopt | Direct adoption. Member management with sortable columns and role badges. Share/invite button in header. | `CAPTURE_Workspace_Members_Apps.md` |
| **Workspace apps table** (name, members, projects, status, kebab actions) | Adapt | TodoX equivalent: workspace agents table. Columns: Agent Name, Type (Research/Prep/Extract), Status (Active/Paused/Error), Last Run, Actions. Same structural pattern, domain-specific content. | `CAPTURE_Workspace_Members_Apps.md` |
| **Workspace activation flow** (select workspaces for premium) | Adopt | Direct adoption for multi-workspace subscription management. Checkbox selection list + "Activate" CTA. | `CAPTURE_Activate.md` |

---

## Section 2: TodoX-Specific UI Needs (No Taskade Equivalent)

These patterns are unique to TodoX's wealth management mission. No Taskade reference exists -- implementing agents must design these from first principles, informed by wealth management UX research and the tech stack constraints.

### 2.1 Evidence-Linked AI Responses

Every AI-generated claim must have a clickable source citation linking back to the original document, email, or note that supports it. This is fundamentally different from Taskade's generic AI prompt/response pattern.

**Key requirements:**
- Inline citation markers (e.g., superscript numbers or brackets) within AI response text
- Citation panel or popover showing source snippet, document name, and date
- Click-through to full source document with highlighted passage
- Confidence indicator per claim (high/medium/low based on evidence strength)
- "No evidence found" explicit marker for claims without backing data

**Package:** `@beep/knowledge-ui`, `@beep/knowledge-client`

### 2.2 Knowledge Graph Visualization

Force-directed graph rendering of household entities (people, accounts, trusts, assets, relationships). No Taskade equivalent -- this is a domain-specific data visualization.

**Key requirements:**
- Force-directed layout using D3 or Sigma.js (existing code in `features/knowledge-graph/viz/`)
- Node types: Person, Account, Trust, Entity, Document
- Edge types: owns, manages, beneficiary-of, related-to, mentioned-in
- Interactive: click to select, drag to reposition, zoom/pan
- Filter panel: show/hide node types, filter by relationship type
- Side panel: selected entity details with linked documents
- Minimap for orientation in large graphs

**Package:** `@beep/knowledge-ui`

### 2.3 Meeting Prep Dashboard

Structured client briefing with evidence trails. The hero feature -- "Prepare me for my Thompson meeting" in 30 seconds.

**Key requirements:**
- Client household summary card (family tree, total AUM, key accounts)
- Recent activity feed (emails, document changes, market events affecting holdings)
- Action items from prior meetings with completion status
- Talking points with evidence links (AI-generated, each point citing source)
- Risk alerts and compliance flags
- One-click export to PDF or email
- Timer/progress indicator during generation ("Researching... Synthesizing... Ready")

**Package:** `@beep/knowledge-ui`, `@beep/calendar-ui`

### 2.4 Email Extraction Overlay

Highlighted email snippets showing entities extracted by the knowledge graph pipeline. When viewing an ingested email, the system highlights names, dates, account references, and action items that were extracted.

**Key requirements:**
- Email content viewer with inline highlights (colored spans per entity type)
- Hover popover showing: entity type, linked knowledge graph node, extraction confidence
- Click to navigate to entity in knowledge graph
- Extraction summary sidebar: list of all extracted entities grouped by type
- "Missed extraction" feedback: user can select text and tag it as a missed entity

**Package:** `@beep/comms-ui`, `@beep/knowledge-ui`

### 2.5 Client Household View

Graph-structured family/account hierarchy view. Not a flat list -- a visual tree or graph showing relationships between household members, accounts, trusts, and entities.

**Key requirements:**
- Household header: family name, total AUM, advisor assignment
- Relationship tree: family members with roles (patriarch, spouse, children, trustees)
- Account list: each account linked to its owner(s) with type, custodian, value
- Document feed: recent documents tagged to this household
- Activity timeline: chronological events (meetings, emails, account changes)
- Quick actions: schedule meeting, create note, run meeting prep

**Package:** `@beep/knowledge-ui`, `@beep/iam-ui`

### 2.6 Collaborative Dashboard

FlexLayout + Liveblocks real-time widgets. TodoX dashboards are not static pages -- they are configurable multi-panel layouts where each panel is a widget (knowledge graph, email feed, action items, calendar, meeting prep).

**Key requirements:**
- FlexLayout tab system with draggable, resizable panels
- Liveblocks real-time cursors and presence indicators
- Widget registry: each widget type is independently loadable
- Layout persistence: save/restore dashboard configurations per user per workspace
- Default layouts: pre-configured dashboard templates for common workflows

**Package:** `@beep/ui` (FlexLayout wrapper), Liveblocks integration (already in `liveblocks-ai-editor/`)

### 2.7 Workspace Agent SDK Configuration

Per-workspace AI agent configuration. Each workspace can configure which agents are active, their parameters, and their data source permissions.

**Key requirements:**
- Agent list view (table pattern from Taskade, adapted per Section 1.9)
- Agent detail view: name, description, type, status toggle, configuration form
- Data source permissions: which email accounts, calendar feeds, document folders the agent can access
- Run history: table of past agent runs with status, duration, entities extracted
- Manual trigger: "Run now" button with progress feedback

**Package:** `@beep/workspaces-ui`, `@beep/workspaces-client`

---

## Section 3: Component Mapping

### 3.1 Shell Components

| Taskade Component | TodoX Package | TodoX Component | Notes |
|-------------------|---------------|-----------------|-------|
| Navbar (48px, fixed top) | `apps/todox` | `components/navbar/` | Already exists. Contains workspace switcher, breadcrumb, notification bell, user avatar. |
| Icon Sidebar (56px, fixed left) | `apps/todox` | `components/sidebar/`, `components/mini-sidebar/` | Already exists. Phosphor icons, tooltip on hover. |
| Content Area (scrollable) | `apps/todox` | App Router layout `app/layout.tsx` | Rendered by Next.js App Router. Shell wraps `{children}`. |
| Activity Panel (right overlay) | `@beep/comms-ui` | `NotificationPanel` | Sheet/drawer component, slides in from right. Does not resize content area. |
| Workspace Switcher Dropdown | `@beep/workspaces-ui` | `WorkspaceSwitcher` | DropdownMenu with workspace list and "New workspace" option. |
| User Account Menu | `@beep/iam-ui` | `UserMenu` | Avatar trigger, dropdown with profile, settings, sign out. |

### 3.2 Settings Components

| Taskade Component | TodoX Package | TodoX Component | Notes |
|-------------------|---------------|-----------------|-------|
| Settings Sidebar (~165px) | `@beep/customization-ui` | `SettingsSidebar` | Grouped nav with expandable sections. Lives within content area (not app shell). |
| Settings Shell (sidebar + content) | `@beep/customization-ui` | `SettingsLayout` | 2-column layout component. Used by `app/settings/layout.tsx`. |
| Tab Strip (underline active) | `@beep/ui` or `apps/todox` `components/ui` | `TabNavigation` | URL-driven. Uses Next.js `Link` components, not local state tabs. |
| Profile Form (2-column) | `@beep/iam-ui` | `AccountSettingsForm` | Two-column: photo left, fields right. |
| Security Forms (sectioned) | `@beep/iam-ui` | `SecuritySettings` | Stacked sections: password, MFA, tokens, OAuth apps. |
| Connected Accounts (card rows) | `@beep/iam-ui` | `ConnectedAccountsList` | Per-provider horizontal cards with connect/disconnect. |
| Session Table | `@beep/iam-ui` | `SessionManagementTable` | Data table: created, IP, browser, status, revoke action. |
| Notification Preferences Matrix | `@beep/comms-ui` | `NotificationPreferencesGrid` | Event type rows x channel columns. Auto-saving dropdowns. |
| Notification Overrides Table | `@beep/comms-ui` | `NotificationOverridesTable` | Per-workspace overrides with "Use default" buttons. |

### 3.3 Workspace Management Components

| Taskade Component | TodoX Package | TodoX Component | Notes |
|-------------------|---------------|-----------------|-------|
| Workspace List Table | `@beep/workspaces-ui` | `WorkspaceListTable` | Workspace name + manage action per row. |
| Workspace Overview Card | `@beep/workspaces-ui` | `WorkspaceOverview` | Plan card + members + actions dropdown. |
| Member Management Table | `@beep/iam-ui` | `MemberTable` | Avatar, name, role badge, sortable. |
| Apps/Agents Table | `@beep/workspaces-ui` | `AgentManagementTable` | Name, type, status, last run, kebab actions. |
| Workspace Actions Dropdown | `@beep/workspaces-ui` | `WorkspaceActionsMenu` | Archive and Delete behind dropdown guard. |
| Invite/Share Dialog | `@beep/iam-ui` | `InviteMemberDialog` | Email input, role selection, send invitation. |
| Workspace Activation List | `@beep/workspaces-ui` | `WorkspaceActivationList` | Checkbox list + "Activate" CTA. |

### 3.4 Integration Components

| Taskade Component | TodoX Package | TodoX Component | Notes |
|-------------------|---------------|-----------------|-------|
| OAuth Connect Button | `@beep/iam-ui` | `OAuthConnectButton` | Triggers OAuth redirect. Shows connected/disconnected state. |
| Token Management Table | `@beep/iam-ui` | `ApiTokenTable` | CRUD table: label, masked token, permissions, revoke. |
| Copy-to-Clipboard Field | `@beep/ui` or `apps/todox` `components/ui` | `CopyField` | Read-only input + copy button with "Copied!" feedback. |
| Collapsible Instructions | `@beep/ui` or `apps/todox` `components/ui` | `CollapsibleSection` | Chevron toggle, smooth expand/collapse animation. |

### 3.5 Shared Primitives

| Taskade Component | TodoX Package | TodoX Component | Notes |
|-------------------|---------------|-----------------|-------|
| Button (primary, secondary, destructive) | `apps/todox` `components/ui` | `Button` | shadcn v3 `base-nova` style. Already configured. |
| Badge (role, status, plan tier) | `apps/todox` `components/ui` | `Badge` | Variants: default, secondary, destructive, outline. |
| Avatar (image/initials, multiple sizes) | `apps/todox` `components/ui` | `Avatar` | shadcn Avatar with fallback to initials. |
| Dropdown Menu (action menus) | `apps/todox` `components/ui` | `DropdownMenu` | shadcn DropdownMenu. Kebab trigger variant. |
| Tooltip (icon labels, shortcuts) | `apps/todox` `components/ui` | `Tooltip` | shadcn Tooltip. Right-of-icon positioning for sidebar. |
| Data Table (sortable, action columns) | `apps/todox` `components/ui` | `DataTable` | Reusable table with sortable headers, action column, responsive scroll. |
| Empty State | `apps/todox` `components/ui` | `EmptyState` | Parameterized: minimal (text only) or rich (illustration + CTA). |
| Search/Command Palette | `apps/todox` `components/ui` | `CommandPalette` | Ctrl+K trigger. shadcn Command component. |

---

## Section 4: Design System Alignment

### 4.1 Color System (oklch)

TodoX's color system is already defined in `apps/todox/src/app/globals.css` using oklch. It aligns with Taskade's lightness-based depth approach.

| Token | Light Mode | Dark Mode | Taskade Equivalent |
|-------|-----------|-----------|-------------------|
| `--background` | `oklch(1 0 0)` | `oklch(0.19 0.006 285.885)` | Main content bg (~#0d0d0d to #1a1a1a range) |
| `--card` | `oklch(1 0 0)` | `oklch(0.21 0.006 285.885)` | Elevated surface (slightly lighter than bg) |
| `--accent` | `oklch(0.93 0.002 286.375)` | `oklch(0.34 0.008 286.033)` | Hover/focus state bg |
| `--primary` | `oklch(0.60 0.13 163)` | `oklch(0.70 0.15 162)` | Green accent (Taskade uses #4caf50 range) |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` | `oklch(0.705 0.015 286.067)` | De-emphasized text (~60% opacity icons) |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.19 0.006 285.885)` | Sidebar bg (Taskade: slightly lighter than content) |
| `--border` | `oklch(0.92 0.004 286.32)` | `oklch(1 0 0 / 10%)` | Minimal borders (Taskade uses no-borders approach) |

**Key alignment:** Both systems use lightness variation for depth rather than borders. TodoX's dark mode `--border: oklch(1 0 0 / 10%)` is effectively invisible, matching Taskade's borderless elevation strategy.

### 4.2 Elevation via Lightness

Taskade communicates depth through background-color shifts, not drop shadows or borders. TodoX's oklch system is pre-configured to support this:

```
Background (darkest) → Card (lighter) → Accent (lightest)
Dark: 0.19 → 0.21 → 0.34
Light: 1.0 → 1.0 → 0.93
```

**Implementation rule:** When creating nested surfaces (e.g., a card inside a panel inside a page), step up the lightness by ~0.02-0.05 per nesting level in dark mode. Never add borders for visual separation -- use lightness alone.

### 4.3 Spacing Tokens

TodoX uses Tailwind v4 spacing. Taskade measurements suggest these proportional relationships:

| Element | Taskade Measured | TodoX Tailwind Equivalent |
|---------|-----------------|--------------------------|
| Sidebar width | 56px | `w-14` (56px) |
| Navbar height | 48px | `h-12` (48px) |
| Settings sidebar width | ~165px | `w-[165px]` or `w-44` (176px, close enough) |
| Icon size (sidebar) | 32x32px | `size-8` (32px) |
| Section gap | ~24-32px | `gap-6` to `gap-8` |
| Form field gap | ~16px | `gap-4` |
| Card padding | ~16-24px | `p-4` to `p-6` |

### 4.4 Typography Tokens

TodoX uses `--font-sans` (Geist Sans) and `--font-mono` (Geist Mono). Taskade reference captures suggest this type hierarchy:

| Level | Usage | TodoX Class |
|-------|-------|-------------|
| H1 | Page heading ("General", "Notifications") | `text-2xl font-semibold` |
| H2 | Section heading ("Default Preferences", "API Token") | `text-xl font-semibold` |
| H3 | Subsection heading | `text-lg font-medium` |
| Body | Form labels, descriptions, table content | `text-sm` (default) |
| Caption | Secondary text, timestamps, help text | `text-xs text-muted-foreground` |

### 4.5 Animation and Transition Tokens

TodoX already has an extensive animation system in `globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--animation-fast` | `0.15s` | Hover states, tooltips |
| `--animation-normal` | `0.3s` | Panel transitions, tab switches |
| `--animation-slow` | `0.5s` | Page transitions, drawer open/close |
| `--easing-smooth` | `cubic-bezier(.4, 0, .2, 1)` | Default transition easing |
| `--easing-bounce` | `cubic-bezier(.68, -.55, .265, 1.55)` | Playful micro-interactions (use sparingly) |
| `--liquid-ease` | `cubic-bezier(.5, 1, .89, 1)` | Glass/liquid effects |

**Guidance:** Use `--animation-fast` with `--easing-smooth` for interactive feedback (hover, focus, active). Use `--animation-normal` for layout transitions (tab content swap, panel reveal). Reserve `--animation-slow` for significant state changes (drawer open, modal entry).

### 4.6 Glass and Liquid Effects

TodoX has a unique glass morphism design language not present in Taskade:

| Token | Light Mode | Dark Mode | Purpose |
|-------|-----------|-----------|---------|
| `--glass-bg-lightness` | `96%` | `6%` | Glass panel background |
| `--glass-border-lightness` | `75%` | `20%` | Glass panel border |
| `--glass-opacity` | `0.85` | `0.85` | Glass panel opacity |
| `--orb-opacity-primary` | `0.15` | `0.46` | Ambient orb intensity |

These effects are TodoX-specific and should be used for hero surfaces (dashboard panels, meeting prep cards, knowledge graph overlay) but NOT for standard settings/admin views. Settings views should use the flat, lightness-based elevation from Taskade's approach.

---

## Section 5: Implementation Guidance for Agents

### 5.1 Component Library Protocol

1. **Always check shadcn v3 docs via MCP server** before building any component. The `base-nova` style is configured in `components.json`. Do not manually create components that shadcn already provides.
2. **Use base-ui primitives**, NOT radix. The `@base-ui/react` package is the foundation. shadcn v3 wraps base-ui, not radix.
3. **Use Phosphor icons** (configured as `iconLibrary: "phosphor"` in `components.json`). Never use lucide, heroicons, or inline SVGs.
4. **Check registries** before building from scratch. Available registries: `@basecn`, `@elevenlabs-ui`, `@prompt-kit`, `@shadcn-editor`, `@billingsdk`, `@tour`. These provide pre-built, styled components.

### 5.2 Design Decision Hierarchy

When making UI decisions, follow this priority order:

1. **TodoX product requirements** (PRD, MVP brief) -- always first
2. **TodoX existing design system** (`globals.css`, existing components) -- maintain consistency
3. **Taskade reference captures** -- for layout proportions, spacing, interaction patterns
4. **shadcn v3 defaults** -- when no specific guidance exists
5. **General UX best practices** -- last resort

### 5.3 What to Take from Taskade

- **Layout geometry:** Column widths, heights, spacing proportions
- **Navigation architecture:** URL-driven tabs, expandable sidebar groups, breadcrumbs
- **Data table structure:** Sortable headers, action columns, responsive behavior
- **Form organization:** Two-column profile forms, sectioned security forms, auto-saving preferences
- **Empty state strategy:** Minimal for admin, richer for onboarding
- **Dark theme approach:** Lightness-based depth, not borders

### 5.4 What NOT to Take from Taskade

- **Feature logic:** TodoX is not a task manager. Do not replicate Taskade features.
- **AI interaction pattern:** Taskade has a generic AI prompt ("Imagine It. Run It."). TodoX has evidence-linked, domain-specific AI responses. Never build a generic chat.
- **Gamification:** Credits, rewards, referral badges, social sharing. Wealth advisors expect professional UX.
- **Color palette:** TodoX has its own oklch green (hue ~162-165), not Taskade's green (#4caf50).
- **Hero section design:** Taskade's "One prompt -> a live AI app" hero is irrelevant. TodoX's workspace home is a client-focused dashboard.
- **Category tabs below prompt:** (Forms, Commerce, CRM, AI, Tools) -- Taskade-specific.
- **Integration app logo grids:** (Gmail, Slack, Teams) -- Taskade-specific marketplace UI.

### 5.5 File Organization Rules

- **App shell** components (navbar, sidebar, layout) go in `apps/todox/src/components/{navbar,sidebar,app-shell}/`
- **Shared UI** components go in `apps/todox/src/components/ui/` (shadcn-managed)
- **Slice-scoped features** go in their vertical slice packages:
  - Workspace UI: `packages/workspaces/ui/src/`
  - Knowledge graph UI: `packages/knowledge/ui/src/`
  - Calendar UI: `packages/calendar/ui/src/`
  - Comms UI: `packages/comms/ui/src/`
  - IAM UI: `packages/iam/ui/src/`
- **Cross-slice composition** (dashboard assembling widgets from multiple slices) stays in `apps/todox`
- No file exceeds 300 lines
- All routes use Next.js App Router: `apps/todox/src/app/{route}/page.tsx`

### 5.6 State Management Rules

- **`Atom.searchParam`** for: active tab, sort column/direction, active workspace, settings section (URL-driven)
- **`Atom`** for: reactive client state, theme preferences, sidebar collapsed state
- **`runtime.atom`/`runtime.fn`** for: server state (member lists, session data, notification preferences)
- **`Atom.kvs`** for: persisted preferences via localStorage/IDB
- **Never** local `useState` for state that should be in the URL or shared across components

### 5.7 Reference File Quick Index

| Need | Read This First |
|------|----------------|
| Settings shell layout | `ARCHITECTURE_APP_SHELL.md`, `CAPTURE_Account.md` |
| Data table patterns | `CAPTURE_Sessions.md`, `CAPTURE_Workspace_Members_Apps.md` |
| Form patterns | `CAPTURE_Account.md`, `CAPTURE_Password.md`, `CAPTURE_Notifications.md` |
| Integration patterns | `CAPTURE_Integrations.md`, `CAPTURE_Connected_Accounts.md` |
| Navigation patterns | `CAPTURE_Sidebar_Navigation.md`, `CAPTURE_Workspace_Header.md` |
| Empty states | `CAPTURE_Archives.md`, `CAPTURE_Credits_Rewards.md` |
| Workspace admin | `CAPTURE_Workspace_Overview.md`, `CAPTURE_Manage_Workspaces.md` |
| Billing/plans | `CAPTURE_Plans.md`, `CAPTURE_Usage_Billing.md` |
| Pattern synthesis | `COMPLETION_SUMMARY.md` |
| TodoX product requirements | `documentation/todox/PRD.md` |
| MVP scope | `documentation/todox/MVP_COFUNDER_BRIEF.md` |
| TodoX design system | `apps/todox/src/app/globals.css` |
| shadcn v3 config | `apps/todox/components.json` |
