# Taskade UI Reference Capture - Completion Summary

## Metadata

| Field | Value |
|-------|-------|
| **Spec** | `taskade-ui-reference-capture` |
| **Status** | Complete |
| **Total Views Captured** | 17 |
| **Total Phases** | 5 |
| **Total Screenshots** | ~50+ across all views |
| **Total Output Files** | 19 (17 CAPTURE_*.md + ARCHITECTURE_APP_SHELL.md + this summary) |
| **Date Completed** | 2026-02-14 |

---

## 1. Capture Overview

The Taskade UI Reference Capture spec systematically documented 17 views from Taskade's web application across 5 phases. These captures serve as the primary visual and structural reference library for building the TodoX frontend. Each view was analyzed for layout geometry, component inventory, interaction patterns, and mapping to the `@beep/*` package architecture.

---

## 2. Architectural Patterns Discovered

Cross-cutting patterns that emerged from synthesizing all 17 captured views:

### 2.1 Three-Column Settings Layout

The dominant layout pattern across all 14 settings views:

```
[Icon Sidebar 56px] | [Settings Sidebar ~165px] | [Main Content fluid]
```

- **Icon sidebar**: Fixed 56px width, top nav cluster (logo, home), middle workspace section, bottom quick-access views (notifications, profile). Collapsible with tooltips on hover.
- **Settings sidebar**: ~165px fixed width, grouped navigation links with expandable sections (Integrations, Manage). Persists across all settings views.
- **Main content**: Fluid width, scrollable, contains the active settings view.

This three-column shell is the single most reusable structural pattern and should be implemented first.

### 2.2 Sub-Tab Navigation

URL-driven tab strips appear within settings views that contain multiple sub-sections:

| View | Tab Count | Tab Names |
|------|-----------|-----------|
| General | 4 | Account, Password, Connected Accounts, Sessions |
| Archives | 2 | Spaces, Members |
| Workspace Settings | 3 | Overview, Members, Apps |

All tab strips share the same visual treatment: horizontal row, underline active indicator, same font size. The tab selection drives URL state, enabling deep linking.

### 2.3 Data Table Pattern

Sortable data tables with action columns recur across management views:

| View | Columns | Row Actions |
|------|---------|-------------|
| Sessions | Created, IP Address, Browser, Status | "Current Session" label / "Revoke Access" button |
| Manage Workspaces | Workspace Name | Manage button |
| Members | Avatar, Username, Display Name, Role | Role badge ("Owner") |
| Apps | Name, Members, Projects, Status | Per-row action menus (kebab) |

Common traits: header row with sort affordances, consistent row height, action column right-aligned, responsive horizontal scroll on narrow viewports.

### 2.4 Form Patterns

Four distinct form patterns were identified:

1. **Two-column form** (Account): Label-input pairs arranged in a two-column grid. Profile photo upload area as a distinct section.
2. **Single-column sections** (Password): Sequential card-like sections, each with its own heading and action buttons. Four sections: Change Password, MFA Configuration, Personal Access Tokens, OAuth2 Applications.
3. **Card rows** (Connected Accounts): Three provider rows, each a horizontal card with provider icon, name, connection status, and interaction button. Different interaction patterns per row (connected vs. connect).
4. **Preference matrix** (Notifications): Grid of Browser/Mobile/Email columns crossed with event type rows. Each cell contains a dropdown selector. Per-workspace override support.

### 2.5 Empty State Pattern

Two distinct empty state strategies:

- **Minimal management empty state** (Archives): Plain text message ("You have no archived spaces."). No illustration, no CTA. Appropriate for admin views where emptiness is normal.
- **Rich promotional empty state** (Credits & Rewards, Workspace Home): Gamified elements, illustrated cards, prominent CTAs. Used for engagement-driven views where the goal is to encourage action.

### 2.6 Expandable Groups

Collapsible/expandable sections appear in two contexts:

- **Settings sidebar**: Navigation groups (Integrations, Manage) expand to reveal sub-links.
- **Usage breakdown** (Usage & Billing): Accordion pattern for detailed resource consumption data.

### 2.7 Integration Architecture

Three coexisting integration patterns under a single Integrations section:

1. **Token-based** (Calendar Feed): Read-only URL with copy button. No authentication flow.
2. **OAuth-based** (Google Calendar): Connect/disconnect flow with OAuth consent redirect.
3. **Embedded widget** (Zapier): Third-party iframe or embedded component within the settings view.

---

## 3. Component Reuse Analysis

Components identified across multiple views, ordered by reuse frequency:

| Component | Views Used | Notes |
|-----------|-----------|-------|
| Settings sidebar | 14 | All settings views. Grouped navigation with expandable sections. |
| Tab strip | 3 views (9 tabs total) | General (4), Archives (2), Workspace Settings (3). Consistent underline active style. |
| Data table with sortable headers | 4 | Sessions, Members, Apps, Manage Workspaces. Shared header/row/action structure. |
| Avatar component | 3+ | Account (profile photo), Members (user avatars), Workspace rows (workspace icons). Multiple sizes. |
| Button variants | All views | Primary/CTA (filled, accent color), secondary (outlined), destructive (red). Consistent sizing. |
| Badge/role indicators | 3+ | Members ("Owner" badge), Plans ("Popular" badge), Usage (plan tier labels). |
| Action dropdown/kebab menu | 2+ | Apps rows (per-row actions), Workspace Actions (Archive/Delete). Shared menu component. |
| Empty state component | 2+ | Archives (minimal), Credits (rich). Parameterized by illustration, text, CTA presence. |
| Form field layouts | 3+ | Two-column (Account), single-column (Password), preference matrix (Notifications). Shared input/label primitives. |
| Preference matrix | 1 | Notifications only. Unique component but reusable pattern for any multi-axis toggle grid. |
| Card grid | 2 | Workspace Home (5 card types), Credits & Rewards (4 reward categories). |
| Search bar | 2 | Workspace Home (hero search), Workspace Header (icon trigger). |
| Breadcrumb | 1+ | Workspace Header. Trail navigation for nested views. |
| Credits display | 2 | Workspace Header (compact), Credits & Rewards (full). |
| Pricing card | 1 | Plans view. Embedded iframe, but card structure is reusable. |

---

## 4. Feature Mapping Summary

All captured features mapped to TodoX `@beep/*` packages:

### `@beep/ui` - Shared Components

Core design system components extracted from cross-view analysis:

- Tab strip (horizontal, underline active indicator)
- Data table (sortable headers, row actions, responsive)
- Avatar (multiple sizes, image/initials fallback)
- Button (primary, secondary, destructive, icon-only variants)
- Badge (role, status, plan tier)
- Dropdown menu (action menus, kebab trigger)
- Empty state (parameterized: illustration, text, CTA)
- Card (content card, pricing card, reward card)
- Form primitives (input, select, toggle, file upload)
- Breadcrumb navigation
- Search bar (expandable, inline)
- Accordion (expandable/collapsible sections)
- Tooltip (icon sidebar hover state)

### `@beep/iam-ui` / `@beep/iam-client` - Identity & Access

- Account settings form (name, email, language, date format, profile photo)
- Password change form
- MFA configuration UI
- Personal access token management
- OAuth2 application management
- Connected accounts (provider rows with connect/disconnect)
- Session management table (with revoke action)
- Member management table (avatar, username, role badge)
- Role badge component ("Owner", "Admin", "Member")

### `@beep/customization-ui` / `@beep/customization-client` - Preferences

- Theme selector (light/dark/system)
- Settings shell layout (3-column: icon sidebar, settings sidebar, content)
- Settings sidebar navigation (grouped, expandable)
- Notification preference matrix (Browser/Mobile/Email x event types)
- Per-workspace notification overrides
- Language selector
- Date format selector

### `@beep/workspaces-ui` / `@beep/workspaces-client` - Workspace Management

- Workspace home (AI prompt hero, card grid, mode selector)
- Workspace header (breadcrumb, search, credits, upgrade, notifications, avatar)
- Manage workspaces table
- Workspace activation (premium selection, "Activate Selected Workspaces" CTA)
- Workspace overview (plan status, member count, workspace actions)
- Workspace apps table (name, members, projects, status, actions)
- Workspace archives (spaces/members sub-tabs, empty states)
- Integration management (token, OAuth, embedded widget patterns)

### `@beep/billing-ui` / `@beep/billing-client` - Billing & Plans

- Pricing cards (Starter, Pro, Business tiers)
- Monthly/yearly toggle
- Current plan card
- Upsell card
- Usage breakdown accordion
- Workspace resource table
- Automation health monitor

### `@beep/rewards-ui` / `@beep/rewards-client` - Credits & Rewards

- Credits balance display
- Reward category cards (Invite, Share, Reviews, Follow)
- Quick share sidebar
- Gamified referral UI

### `@beep/ui-core` - Design Tokens

- Color system (dark theme primary)
- Theme tokens (background, surface, border, text hierarchies)
- Spacing scale
- Typography scale
- Shadow/elevation system (lightness variation, not borders)

---

## 5. Implementation Recommendations

### P0 - Foundation (Blocks Everything Else)

| Component | Rationale | Estimated Complexity |
|-----------|-----------|---------------------|
| Settings shell (3-column layout) | Used by all 14 settings views. Must be built first. | Medium |
| Tab navigation component | Used in 3 settings views (9 tabs). URL-driven state. | Low |
| Data table component | Used in 4 views. Sortable headers, action columns. | Medium |
| Auth forms (Account, Password) | Core IAM functionality. Multiple form patterns. | Medium |
| Icon sidebar (56px) | Global navigation. Collapsible with tooltips. | Low-Medium |

### P1 - Core Settings Features

| Component | Rationale | Estimated Complexity |
|-----------|-----------|---------------------|
| Notification preference matrix | Unique component with high UX value. Complex grid layout. | High |
| Integration management patterns | Three distinct patterns (token, OAuth, embedded). | Medium-High |
| Workspace management table | Admin functionality. Builds on P0 data table. | Low |
| Session management | Security feature. Builds on P0 data table. | Low |
| Connected accounts | Three provider rows with different interaction patterns. | Medium |
| Member management | Builds on P0 data table + avatar + role badge. | Low-Medium |

### P2 - Enhancement Features

| Component | Rationale | Estimated Complexity |
|-----------|-----------|---------------------|
| Credits & rewards system | Gamified engagement. Rich promotional UI. | Medium-High |
| Archives management | Simple sub-tabs with empty states. Low complexity. | Low |
| Activate premium flow | Workspace selection list + CTA. | Low-Medium |
| Billing & plans (pricing cards) | Potentially embedded iframe or custom cards. | Medium |
| Usage breakdown accordion | Expandable detail view. | Low-Medium |

---

## 6. Screenshot Infrastructure

### Storage Configuration

| Property | Value |
|----------|-------|
| **S3 Bucket** | `static.vaultctx.com` |
| **Path Pattern** | `notion/taskade-ui-reference/{view}/screenshots/{filename}.png` |
| **Format** | PNG |
| **Naming Convention** | Descriptive kebab-case (e.g., `sidebar-collapsed.png`, `account-form-fields.png`) |

### Upload Status by Phase

| Phase | Views | Screenshot Upload Status |
|-------|-------|------------------------|
| Phase 1: Workspace Shell | 3 | Uploaded to S3 |
| Phase 2: Settings General | 4 | Uploaded to S3 |
| Phase 3: Settings Billing | 3 | Uploaded to S3 |
| Phase 4: Settings Features | 3 | Uploaded to S3 |
| Phase 5: Settings Admin | 4 | Local only (`/tmp/taskade-screenshots/`) |

### Phase 5 Local Storage Note

Phase 5 screenshots (13 files across 4 view directories) are stored locally at `/tmp/taskade-screenshots/` due to an S3 IAM PutObject permission denial encountered during capture. The screenshots were successfully taken but could not be uploaded. They should be manually uploaded or the IAM policy should be updated to restore PutObject access before the `/tmp/` directory is cleaned.

---

## 7. View Index

| Phase | View # | View Name | URL Path | Output File | Screenshot Count |
|-------|--------|-----------|----------|-------------|-----------------|
| **Phase 1: Workspace Shell** | | | | | |
| 1 | 1 | Sidebar Navigation | `/app` (sidebar focus) | `CAPTURE_01_sidebar_navigation.md` | ~3 |
| 1 | 2 | Workspace Home | `/app` (main content) | `CAPTURE_02_workspace_home.md` | ~3 |
| 1 | 3 | Workspace Header | `/app` (header focus) | `CAPTURE_03_workspace_header.md` | ~3 |
| **Phase 2: Settings General** | | | | | |
| 2 | 4 | Account | `/app/settings/account` | `CAPTURE_04_settings_account.md` | ~3 |
| 2 | 5 | Password | `/app/settings/password` | `CAPTURE_05_settings_password.md` | ~3 |
| 2 | 6 | Connected Accounts | `/app/settings/connected` | `CAPTURE_06_settings_connected_accounts.md` | ~3 |
| 2 | 7 | Sessions | `/app/settings/sessions` | `CAPTURE_07_settings_sessions.md` | ~3 |
| **Phase 3: Settings Billing** | | | | | |
| 3 | 8 | Plans | `/app/settings/plans` | `CAPTURE_08_settings_plans.md` | ~3 |
| 3 | 9 | Usage & Billing | `/app/settings/billing` | `CAPTURE_09_settings_usage_billing.md` | ~3 |
| 3 | 10 | Credits & Rewards | `/app/settings/credits` | `CAPTURE_10_settings_credits_rewards.md` | ~3 |
| **Phase 4: Settings Features** | | | | | |
| 4 | 11 | Notifications | `/app/settings/notifications` | `CAPTURE_11_settings_notifications.md` | ~3 |
| 4 | 12 | Integrations | `/app/settings/integrations` | `CAPTURE_12_settings_integrations.md` | ~3 |
| 4 | 13 | Archives | `/app/settings/archives` | `CAPTURE_13_settings_archives.md` | ~3 |
| **Phase 5: Settings Admin** | | | | | |
| 5 | 14 | Manage Workspaces | `/app/settings/workspaces` | `CAPTURE_14_settings_manage_workspaces.md` | ~3 |
| 5 | 15 | Activate | `/app/settings/activate` | `CAPTURE_15_settings_activate.md` | ~3 |
| 5 | 16 | Workspace Overview | `/app/settings/workspaces/{id}` | `CAPTURE_16_settings_workspace_overview.md` | ~4 |
| 5 | 17 | Workspace Members/Apps | `/app/settings/workspaces/{id}/members` | `CAPTURE_17_settings_workspace_members_apps.md` | ~6 |

---

## 8. Key Takeaways

1. **The settings shell is the highest-leverage component.** A single 3-column layout implementation unlocks all 14 settings views. Build this first.

2. **Data tables are the second most reusable pattern.** Four views share the same table structure. A well-abstracted table component with sortable headers, action columns, and responsive behavior pays dividends across Sessions, Members, Apps, and Manage Workspaces.

3. **Form diversity requires a flexible form system.** Account (two-column), Password (sectioned single-column), Connected Accounts (card rows), and Notifications (preference matrix) each need different layouts but share primitive input components.

4. **Taskade's dark theme relies on lightness variation, not borders.** Depth and elevation are communicated through background-color shifts rather than stroke/border styling. This should be reflected in `@beep/ui-core` theme tokens.

5. **Integration patterns are heterogeneous by design.** Token-based, OAuth-based, and embedded widget integrations coexist under one section. The TodoX integration architecture should accommodate all three patterns from the start rather than retrofitting later.

6. **Empty states serve different purposes.** Management views use minimal empty states (just text), while engagement views use rich promotional empty states (illustrations, CTAs, gamification). The empty state component should be parameterized to handle both.

7. **Sub-tab navigation is URL-driven.** All tab strips (General, Archives, Workspace Settings) use URL segments for state. This enables deep linking and browser back/forward navigation. Implement tabs as route-driven, not local state.
