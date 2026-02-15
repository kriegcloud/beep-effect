# Workspace Members & Apps

> Captured from: `https://www.taskade.com/settings/manage/Yufy1godJk9Yddwv`
> Screenshots: 4 total (persistent S3 URLs)

## Overview

The Workspace Members and Apps views are sub-tabs within the Workspace settings page, accessed under the "Manage" category in the settings sidebar. The page features a three-tab strip (Overview, Members, Apps) that governs which content is displayed. The Members tab shows a table of workspace members with sortable columns, avatar display, usernames, display names, and role badges with emoji prefixes. The Apps tab shows a data table of workspace apps with sortable name column, member count, project count, status indicator, and per-row action menus. Both tabs share the same workspace settings URL base (`/settings/manage/{workspaceId}`) with sub-routes for each tab. These views provide the primary workspace administration interface for managing team composition and app-level resources.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `members-tab.png` | Members tab view with member table | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-members-apps/screenshots/members-tab.png) |
| `apps-tab.png` | Apps tab view with apps data table | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-members-apps/screenshots/apps-tab.png) |
| `apps-tab-full.png` | Full page with Apps tab active | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-members-apps/screenshots/apps-tab-full.png) |
| `apps-table.png` | Apps data table clipped view | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-members-apps/screenshots/apps-table.png) |

## Layout

Both sub-tabs use the standard 3-column settings layout. The persistent icon sidebar (56px) anchors the left edge. The settings sidebar (~165px) provides category navigation with the "Manage" group expanded, showing sub-items including the active workspace. The main content area fills the remaining width and contains the three-tab strip (Overview, Members, Apps) at the top, followed by tab-specific content. The Members tab displays a header area with a member count ("1 member") and a "Share" button, followed by a two-column table (Name, Workspace Permissions). The Apps tab displays a four-column data table (Name, Members, Projects, Status) with sortable columns and per-row action menus.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list with Manage expanded
- **Main content**: Fills remaining space, vertically scrollable
- **Tab strip**: Three tabs (Overview, Members, Apps) at top of main content
- **Members content**: Member count + share button header, then member table
- **Apps content**: Four-column data table with action menus

### Layout Diagram

```
+---------+---------------------------------------------------------------------+
| [Logo] / Settings                                    [Bell] [Avatar]          |  48px navbar
+---------+----------+----------------------------------------------------------+
|  Search | General  |  [ Overview | *Members* | Apps ]                         |
|  Recent | Plans    |                                                          |
|  People | Usage &  |  1 member                              [Share]           |
|         | Billing  |                                                          |
|  Status | Credits  |  Name v              Workspace Permissions               |
|   Add   | Integr.> |  -------------------------------------------------------  |
|         | Notifs   |  [Avatar] benjamintoppold                                 |
|  Notes  | Archives |           Benjamin Oppold          Owner                 |
|  Cal    | Manage > |                                                          |
|  Faves  | *Workspc*|                                                          |
|   Add   | Activate |                                                          |
|         |          |                                                          |
|  Up     |          |                                                          |
|  Annc   |          |                                                          |
|  Help   |          |                                                          |
|  Gear   |          |                                                          |
|  56px   |  ~165px  |                   remaining width                        |
+---------+----------+----------------------------------------------------------+

+---------+---------------------------------------------------------------------+
| [Logo] / Settings                                    [Bell] [Avatar]          |  48px navbar
+---------+----------+----------------------------------------------------------+
|  Search | General  |  [ Overview | Members | *Apps* ]                         |
|  Recent | Plans    |                                                          |
|  People | Usage &  |  Name v         Members    Projects    Status     Act    |
|         | Billing  |  -------------------------------------------------------  |
|  Status | Credits  |  App Builder    1 member   None        Active     [...]  |
|   Add   | Integr.> |  Studio                                                  |
|         | Notifs   |  Genesis Wealth 1 member   4 projects  Active     [...]  |
|  Notes  | Archives |  Planner                                                 |
|  Cal    | Manage > |  Sprint Flow    1 member   4 projects  Active     [...]  |
|  Faves  | *Workspc*|  Studio                                                  |
|   Add   | Activate |  Storefront     1 member   4 projects  Active     [...]  |
|         |          |  Studio                                                  |
|  Up     |          |                                                          |
|  Annc   |          |                                                          |
|  Help   |          |                                                          |
|  Gear   |          |                                                          |
|  56px   |  ~165px  |                   remaining width                        |
+---------+----------+----------------------------------------------------------+
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage (expanded) | Item default, item active, expandable groups (Manage expanded showing workspace sub-items) | `members-tab.png`, `apps-tab-full.png` |
| 2 | Manage sidebar group | nav-group (expanded) | Settings sidebar | Workspace name, Activate | Expanded state, sub-item default, sub-item active | `members-tab.png`, `apps-tab-full.png` |
| 3 | Tab: Overview | tab | Tab strip, first position | "Overview" | Active, inactive | `members-tab.png` |
| 4 | Tab: Members | tab | Tab strip, second position | "Members" | Active, inactive (default) | `members-tab.png` |
| 5 | Tab: Apps | tab | Tab strip, third position | "Apps" | Active, inactive (default) | `apps-tab.png`, `apps-tab-full.png` |
| 6 | Member count | text | Members tab, header area | "1 member" | Static (updates dynamically with count) | `members-tab.png` |
| 7 | Share button | button | Members tab, header area right | "Share" with icon | Default, hover | `members-tab.png` |
| 8 | Members table header: Name | table-header (sortable) | Members table, column 1 | "Name" with sort arrow | Sorted ascending, sorted descending, default | `members-tab.png` |
| 9 | Members table header: Workspace Permissions | table-header | Members table, column 2 | "Workspace Permissions" | Static | `members-tab.png` |
| 10 | Member avatar | avatar | Member row, left | User avatar image | Static | `members-tab.png` |
| 11 | Member username | text | Member row, column 1 | "benjamintoppold" | Static | `members-tab.png` |
| 12 | Member display name | text (secondary) | Member row, below username | "Benjamin Oppold" | Static | `members-tab.png` |
| 13 | Role badge | badge | Member row, column 2 | "Owner" with emoji prefix | Static (Owner, Admin, Member variants expected) | `members-tab.png` |
| 14 | Apps table header: Name | table-header (sortable) | Apps table, column 1 | "Name" with sort arrow | Sorted ascending, sorted descending, default | `apps-tab.png`, `apps-table.png` |
| 15 | Apps table header: Members | table-header | Apps table, column 2 | "Members" with icon | Static | `apps-tab.png`, `apps-table.png` |
| 16 | Apps table header: Projects | table-header | Apps table, column 3 | "Projects" with icon | Static | `apps-tab.png`, `apps-table.png` |
| 17 | Apps table header: Status | table-header | Apps table, column 4 | "Status" with icon | Static | `apps-tab.png`, `apps-table.png` |
| 18 | App row: App Builder Studio | table-row | Apps table | Emoji icon, "App Builder Studio", 1 member, None, Active | Default, hover | `apps-tab.png`, `apps-table.png` |
| 19 | App row: Genesis Wealth Planner | table-row | Apps table | Emoji icon, "Genesis Wealth Planner", 1 member, 4 projects, Active | Default, hover | `apps-tab.png`, `apps-table.png` |
| 20 | App row: Sprint Flow Studio | table-row | Apps table | Emoji icon, "Sprint Flow Studio", 1 member, 4 projects, Active | Default, hover | `apps-tab.png`, `apps-table.png` |
| 21 | App row: Storefront Studio | table-row | Apps table | Emoji icon, "Storefront Studio", 1 member, 4 projects, Active | Default, hover | `apps-tab.png`, `apps-table.png` |
| 22 | App row action button | icon-button (kebab) | Apps table, row right | "..." / kebab menu | Default, hover, menu open | `apps-tab.png`, `apps-table.png` |
| 23 | App emoji icon | icon | App row, left of name | Emoji prefix per app (e.g., paint palette, star, lightbulb, wrench) | Static | `apps-tab.png`, `apps-table.png` |
| 24 | Status indicator | text/badge | Apps table, Status column | "Active" | Active (green), possibly Archived/Inactive variants | `apps-tab.png`, `apps-table.png` |

## Interactive States

### Tab Strip (Overview / Members / Apps)

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Members active | Click "Members" tab | Members tab highlighted/underlined, route changes to /settings/manage/{id}/members, member table displayed | `members-tab.png` |
| Apps active | Click "Apps" tab | Apps tab highlighted/underlined, route changes to /settings/manage/{id}/folders, apps table displayed | `apps-tab.png`, `apps-tab-full.png` |
| Overview active | Click "Overview" tab | Overview tab highlighted/underlined, route changes to /settings/manage/{id} | - |
| Tab hover | Hover over inactive tab | Background/text highlight | - |

### Members Table Sorting

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Name sorted ascending (default) | Page load | Sort arrow pointing down next to "Name" header | `members-tab.png` |
| Name sorted descending | Click "Name" header | Sort arrow flips direction, rows reorder, URL updates to ?sort=handle-desc | - |
| Name sorted ascending | Click "Name" header again | Sort arrow flips back, rows reorder to ascending | `members-tab.png` |

### Apps Table Sorting

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Name sorted ascending (default) | Page load | Sort arrow pointing down next to "Name" header | `apps-tab.png`, `apps-table.png` |
| Name sorted descending | Click "Name" header | Sort arrow flips direction, rows reorder alphabetically descending, URL updates to ?sort=name-desc | - |
| Name sorted ascending | Click "Name" header again | Sort arrow flips back, rows reorder to ascending | `apps-tab.png`, `apps-table.png` |

### App Row Actions

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Row default | Page load | Row displayed with app data, kebab button visible | `apps-tab.png`, `apps-table.png` |
| Row hover | Hover over row | Row background highlight | - |
| Action menu open | Click kebab/more button | Dropdown menu appears with actions (e.g., Open, Archive, Delete) | - |
| Action menu closed | Click outside menu or select action | Dropdown menu dismissed | - |

### Share Button (Members Tab)

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Share default | Page load | "Share" button with icon displayed | `members-tab.png` |
| Share hover | Hover over button | Button highlight | - |
| Share click | Click "Share" button | Opens invite/share dialog or modal | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Workspace settings tab strip (Overview/Members/Apps) | Workspace settings navigation | @beep/ui | P0 | Reusable tab component for workspace-level settings sub-views |
| Members table with avatars | Workspace member list | @beep/iam-ui, @beep/iam-client | P0 | Core member management view with avatar, username, display name |
| Role badge with emoji prefix | Permission/role display | @beep/iam-domain | P1 | Branded role badges (Owner, Admin, Member) with visual emoji prefixes |
| Sortable Name column (Members) | Sortable table header | @beep/ui | P1 | Click-to-sort column headers with direction indicator, URL query param sync |
| Share/invite button | Workspace member invitation | @beep/iam-ui, @beep/iam-client | P1 | Trigger invite flow from members management view |
| Member count display | Member count summary | @beep/iam-client | P2 | Dynamic count text reflecting total workspace members |
| Apps data table | Workspace apps management | @beep/workspaces-ui, @beep/workspaces-client | P0 | Multi-column data table listing workspace apps with metadata |
| Sortable Name column (Apps) | Sortable table header | @beep/ui | P1 | Shared sortable column pattern between Members and Apps tables |
| App member count | App membership display | @beep/workspaces-domain | P2 | Per-app member count in table cell |
| App project count | App project count display | @beep/workspaces-domain | P2 | Per-app project count (or "None" when zero) |
| App status indicator | App status badge | @beep/workspaces-domain | P1 | Active/Inactive/Archived status per app |
| App row action menu (kebab) | Resource action dropdown | @beep/ui | P1 | Per-row dropdown menu for app-level actions (open, archive, delete) |
| App emoji icon | App icon display | @beep/workspaces-domain | P2 | Emoji-based app identifiers in table rows |

## Implementation Notes

- **Components**: shadcn `Tabs` (Overview/Members/Apps tab strip), `Table` (both members and apps data tables with header rows and data rows), `Avatar` (member profile images in members table), `Badge` (role badges with emoji prefix for Owner/Admin/Member, status badges for Active/Inactive), `Button` (Share button with icon, action triggers), `DropdownMenu` (kebab/more actions per app row with menu items like Open, Archive, Delete)
- **Icons**: Phosphor - ShareNetwork or UserPlus (share/invite button), SortAscending/SortDescending (sortable column direction indicators), DotsThreeVertical (kebab action menu trigger), Users (members column header icon), FolderSimple or ProjectorScreen (projects column header icon), CircleWavyCheck or Pulse (status column header icon)
- **State Management**: Active tab state synced to URL route (members, folders sub-paths), sort column and direction synced to URL query params (?sort=handle-desc, ?sort=name-desc), member list and app list fetched per-tab on activation, kebab dropdown open/closed state per row, member count derived from fetched member list length
- **API Surface**: GET /api/workspaces/{id}/members (list members with role, avatar, username, display name), GET /api/workspaces/{id}/apps (list apps with member count, project count, status), POST /api/workspaces/{id}/members/invite (trigger share/invite flow), PATCH /api/workspaces/{id}/apps/{appId} (update app status/archive), DELETE /api/workspaces/{id}/apps/{appId} (delete app), query params: ?sort=name-asc|name-desc|handle-asc|handle-desc
- **Sortable Table Pattern**: The click-to-sort column header is a reusable pattern that toggles between ascending and descending sort direction. The sort state is reflected in the URL query parameter, enabling shareable/bookmarkable sorted views. The sort arrow visual indicator (up/down chevron or arrow) accompanies the column header text. This pattern should be extracted into a shared `SortableTableHeader` component in `@beep/ui` for reuse across Members, Apps, and any future data table views.
- **Role Badge Pattern**: The role badge combines an emoji prefix with a text label (e.g., "Owner"). This maps to a `Badge` variant in `@beep/ui` that accepts an optional `icon` or `prefix` slot. Role definitions and their display properties (emoji, color, label) should live in `@beep/iam-domain` as a tagged union or enum-like schema.
- **Resource Management Table Pattern**: The Apps table represents a reusable resource management pattern: a multi-column data table with sortable columns, metadata cells (counts, status), and per-row action menus. This same pattern applies to any resource listing (documents, calendars, integrations). The table structure, sort behavior, and action menu pattern should be composable primitives in `@beep/ui`.
- **Complexity**: Low-Medium -- two straightforward data tables with minimal interactivity. The Members table is read-only with a single sort action and an external share trigger. The Apps table adds per-row action menus and a richer column set (member count, project count, status). The primary implementation challenge is the sortable table header pattern with URL query parameter synchronization. No forms, no inline editing, no drag-and-drop.
