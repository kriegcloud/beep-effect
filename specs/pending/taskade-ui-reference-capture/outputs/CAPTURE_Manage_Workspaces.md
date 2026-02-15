# Manage Workspaces

> Captured from: `https://www.taskade.com/settings/manage`
> Screenshots: 3 total (persistent S3 URLs)

## Overview

The Manage Workspaces settings page is a sub-view under the "Manage" expandable section in the settings sidebar. It displays a simple table listing all workspaces under the current subscription, with each row providing a link to the workspace's individual settings and a "Manage" action button. The page heading is "Workspaces" with a description paragraph: "Manage all your workspaces under one subscription. Discover our Premium Plans. Learn more." containing inline links to the upgrade page and a help article. The page fits entirely within the viewport (scrollHeight: 856, no scroll), indicating a compact, minimal layout. In the captured state, only a single workspace exists in the table, making this a useful reference for the baseline single-workspace view.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `full-page.png` | Full page with Manage Workspaces view | [View](https://static.vaultctx.com/notion/taskade-ui-reference/manage-workspaces/screenshots/full-page.png) |
| `settings-sidebar.png` | Settings sidebar navigation with Manage section expanded | [View](https://static.vaultctx.com/notion/taskade-ui-reference/manage-workspaces/screenshots/settings-sidebar.png) |
| `workspace-table.png` | Workspace table area with single workspace row | [View](https://static.vaultctx.com/notion/taskade-ui-reference/manage-workspaces/screenshots/workspace-table.png) |

## Layout

The Manage Workspaces view uses the standard 3-column settings layout. The persistent icon sidebar (56px) anchors the left edge with action buttons (Search, Recent, Shared, etc.). A settings-specific sidebar (~264px measured, includes icon sidebar overlap) provides category navigation with the "Manage" section expanded and "Workspaces" highlighted as the active sub-item. The main content area fills the remaining width (~693px) and contains the page heading, description text with inline links, and a two-column data table listing workspaces. The entire page fits within the viewport without scrolling.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: Fills remaining space (~693px), H1 at y:113, table at y:181
- **Workspace table**: Two columns (Workspace, Actions), full width within main content

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo] / Settings                              [Bell] [Avatar]    │  48px navbar
├──────┬──────────┬──────────────────────────────────────────────────┤
│Search│ General  │  Workspaces                                     │
│Recent│ Plans    │  Manage all your workspaces under one            │
│Shared│ Usage &  │  subscription. Discover our Premium Plans.       │
│      │ Billing  │  Learn more.                                     │
│ Dot  │ Credits  │                                                  │
│ Plus │ Integr.▸ │  ┌──────────────────────────┬──────────────────┐ │
│      │  Cal Feed│  │ Workspace                │ Actions          │ │
│ Note │  Google  │  ├──────────────────────────┼──────────────────┤ │
│ Cal  │  Zapier  │  │ [Avatar] Workspace       │ Manage           │ │
│ Star │  Automat.│  └──────────────────────────┴──────────────────┘ │
│ Plus │  AI Agent│                                                  │
│      │  View All│                                                  │
│  Up  │ Notifs   │                                                  │
│ Horn │ Archives │                                                  │
│ Help │*Manage*▸ │                                                  │
│ Gear │ *Workspc*│                                                  │
│      │  Activate│                                                  │
│      │ ──────── │                                                  │
│      │ WORKSPACE│                                                  │
│      │  Dot Work│                                                  │
│ 56px │  ~165px  │                remaining width (~693px)          │
└──────┴──────────┴──────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (Manage > Workspaces highlighted), expandable groups (Integrations, Manage) | `full-page.png`, `settings-sidebar.png` |
| 2 | Page heading | heading (H1) | Main content top (y:113) | "Workspaces" | Static | `full-page.png`, `workspace-table.png` |
| 3 | Page description | text | Below heading | "Manage all your workspaces under one subscription. Discover our Premium Plans. Learn more." | Static (with two inline links) | `full-page.png`, `workspace-table.png` |
| 4 | Premium Plans link | link | Inline in description | "Premium Plans" | Default, hover; navigates to /upgrade | `full-page.png` |
| 5 | Learn more link | link | Inline in description | "Learn more." | Default, hover; navigates to help article | `full-page.png` |
| 6 | Workspace table | data-table | Main content (y:181) | Two columns: "Workspace", "Actions" | Static structure with interactive cells | `full-page.png`, `workspace-table.png` |
| 7 | Table header row | table-header | Table top | "Workspace", "Actions" | Static | `workspace-table.png` |
| 8 | Workspace name cell | link + avatar | Table column 1 | Workspace avatar icon + "Workspace" text (links to /settings/manage/{workspaceId}) | Default, hover | `workspace-table.png` |
| 9 | Workspace avatar | avatar/icon | Table column 1, left of name | Small workspace avatar/icon | Static | `workspace-table.png` |
| 10 | Manage button | link/button | Table column 2 | "Manage" | Default, hover; navigates to /settings/manage/{workspaceId} | `workspace-table.png` |
| 11 | Toggle settings panel button | icon-button | Top-left of content area | Toggle settings sidebar visibility | Default, hover, active (panel open) | `full-page.png` |
| 12 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `full-page.png` |
| 13 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `full-page.png` |
| 14 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `full-page.png` |
| 15 | User avatar | icon-button | Navbar far right | User avatar "benjamintoppold" | Default, hover | `full-page.png` |

## Interactive States

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Manage expanded | Default (current page context) | "Manage" section expanded, reveals sub-items: Workspaces, Activate | `full-page.png`, `settings-sidebar.png` |
| Workspaces active | Default (current page) | "Workspaces" sub-item highlighted/bold in sidebar | `full-page.png`, `settings-sidebar.png` |
| Integrations expanded | Click "Integrations" | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | `settings-sidebar.png` |
| Other item hover | Hover over sidebar item | Background highlight | - |
| Sidebar collapse | Click toggle settings panel button | Settings sidebar collapses, main content expands | - |

### Workspace Table

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Table displayed with workspace rows, each showing avatar + name + Manage action | `workspace-table.png` |
| Workspace name hover | Hover workspace name link | Text color/underline change indicating clickable link | - |
| Workspace name click | Click workspace name | Navigates to /settings/manage/{workspaceId} for individual workspace settings | - |
| Manage button hover | Hover "Manage" button/link | Button background/border highlight | - |
| Manage button click | Click "Manage" | Navigates to /settings/manage/{workspaceId} for individual workspace settings | - |
| Row hover | Hover over table row | Subtle row background highlight | - |

### Populated State (Inferred)

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Multiple workspaces | User has multiple workspaces under subscription | Additional rows in table, each with avatar + name + Manage action | - |
| Empty state | User has no workspaces (unlikely) | Likely empty state message or prompt to create workspace | - |
| Scrollable table | Many workspaces | Table or page becomes vertically scrollable | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Workspaces page heading & description | Workspace management settings view | @beep/customization-ui | P1 | H1 heading with description, upgrade link, and help link |
| Workspace table listing | Workspace list table | @beep/ui, @beep/iam-ui | P0 | Table displaying all workspaces under subscription with avatar, name, and actions |
| Workspace name link | Workspace detail navigation | @beep/iam-client, @beep/iam-ui | P1 | Links to individual workspace settings page |
| Manage action button | Workspace manage navigation | @beep/iam-client, @beep/iam-ui | P1 | Navigates to individual workspace settings for configuration |
| Workspace avatar | Workspace identity display | @beep/ui | P1 | Small avatar/icon representing the workspace |
| Premium Plans upgrade link | Subscription upgrade CTA | @beep/iam-client | P2 | Inline link to upgrade/plans page |
| Learn more help link | Contextual help link | @beep/ui | P3 | External link to documentation/help article |
| Settings sidebar (Manage section) | Settings navigation with expandable groups | @beep/customization-ui | P0 | Persistent navigation with Manage > Workspaces active state |
| Workspace Settings section (sidebar) | Per-workspace settings links | @beep/customization-ui, @beep/iam-ui | P1 | Sidebar section listing individual workspace settings links |

## Implementation Notes

- **Components**: shadcn Table (workspace listing with header row and data rows), Avatar (workspace identity icon in table rows), Button or Link (for "Manage" action in table column, and workspace name link), Link (inline "Premium Plans" and "Learn more" links in description), collapsible sidebar panel (toggle settings panel button)
- **Icons**: Phosphor - Buildings or Cube (workspace icon/avatar), GearSix (manage action), ArrowSquareOut or ArrowUpRight (external help link), Crown or Star (premium plans link), List or SidebarSimple (toggle settings panel), CaretRight (expandable sidebar sections)
- **State Management**: Workspace list fetched on page load from subscription context, active sidebar item derived from current route (/settings/manage), settings panel toggle state (open/closed), no form inputs or complex state transitions on this page
- **API Surface**: GET /api/workspaces (list all workspaces under current subscription, includes workspace id, name, avatar), GET /api/workspaces/{id}/settings (individual workspace settings, navigated to via Manage button), workspace entity includes: `id`, `name`, `avatar` (optional), `settingsUrl`
- **Complexity**: Low -- minimal page with a single read-only table and navigation links. No forms, no mutations, no complex state. The primary purpose is navigation to individual workspace settings pages. The table structure is straightforward with two columns and action links. Main implementation consideration is ensuring the Manage sidebar section correctly reflects the active sub-item state and that workspace avatars are rendered consistently.
