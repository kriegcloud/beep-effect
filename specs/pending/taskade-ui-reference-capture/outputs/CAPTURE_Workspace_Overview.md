# Workspace Overview (Manage Workspace)

> Captured from: `https://www.taskade.com/settings/manage/Yufy1godJk9Yddwv`
> Screenshots: 3 total (persistent S3 URLs)

## Overview

The Workspace Overview page is a workspace-level administration view within Taskade's settings area, accessed via the "Manage" group in the settings sidebar. It presents a three-tab navigation pattern (Overview, Members, Apps) scoped to a specific workspace, with the Overview tab active by default. The page heading is an H1 displaying the workspace name ("Workspace"). The Overview tab contains three content sections: a Plan information card showing the current subscription tier and description, a Workspace Members section listing current members with an invite button, and a Workspace Actions dropdown button that reveals destructive operations (Archive workspace, Delete workspace). This page serves as the central hub for workspace administration, with the Members and Apps tabs linking to dedicated sub-views at `/settings/manage/{workspaceId}/members` and `/settings/manage/{workspaceId}/folders` respectively.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `full-page.png` | Full page with Workspace Overview tab active | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-overview/screenshots/full-page.png) |
| `overview-tab.png` | Overview tab content area (plan, members, actions) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-overview/screenshots/overview-tab.png) |
| `actions-dropdown.png` | Workspace Actions dropdown open showing archive/delete options | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-overview/screenshots/actions-dropdown.png) |

## Layout

The Workspace Overview page uses the standard 3-column settings layout. The persistent icon sidebar (56px) anchors the left edge. A settings-specific sidebar (~165px) provides category navigation with "Manage" expanded and the workspace highlighted as the active item. The main content area (measured at x:65 y:89 width:757 height:758) fills the remaining width and contains the workspace name heading, a three-tab strip (Overview, Members, Apps), and the Overview tab content below. The tab content is organized as three vertically stacked sections: a Plan information card, a Workspace Members list with an invite button, and a Workspace Actions dropdown button.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: x:65 y:89 width:757 height:758, vertically scrollable
- **Tab strip**: Three tabs (Overview, Members, Apps) below workspace heading
- **Tab content**: Three vertically stacked sections below tab strip

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo] / Settings                              [Bell] [Avatar]     │  48px navbar
├──────┬──────────┬──────────────────────────────────────────────────┤
│Search│ General  │  Workspace                                       │
│Clock │ Plans    │                                                   │
│Users │ Usage &  │  [*Overview*]  [Members]  [Apps]                  │
│      │ Billing  │  ─────────────────────────────────────────        │
│ Dot  │ Credits  │                                                   │
│ Plus │ Integr.▸ │  Plan                                             │
│      │ Notifs   │  ┌──────────────────────────────────────────┐     │
│      │ Archives │  │  Pro Legacy (Mar 2025)                   │     │
│ Note │ Manage ▸ │  │  You are on a custom plan. Premium       │     │
│ Cal  │  *Workspc│  │  features are unlocked in this workspace.│     │
│ Star │  Activate│  └──────────────────────────────────────────┘     │
│ Plus │          │                                                   │
│      │ ──────── │  Workspace Members (1)  [?]                       │
│  Up  │ WORKSPACE│  ┌──────────────────────────────────────────┐     │
│ Horn │  Dot Work│  │  [Avatar] Benjamin Oppold                │     │
│ Help │          │  └──────────────────────────────────────────┘     │
│ Gear │          │  [+ Invite teammates to collaborate]               │
│      │          │                                                   │
│      │          │  [▾ Workspace Actions]                             │
│      │          │    ┌──────────────────────┐                       │
│      │          │    │ Archive workspace    │                       │
│ 56px │  ~165px  │    │ Delete workspace     │                       │
│      │          │    └──────────────────────┘                       │
└──────┴──────────┴──────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (Manage > workspace highlighted), expandable groups (Integrations, Manage) | `full-page.png` |
| 2 | Workspace heading | heading (H1) | Main content top | "Workspace" (workspace name) | Static | `full-page.png`, `overview-tab.png` |
| 3 | Overview tab | tab | Tab strip, first position | "Overview" | Active (default, underlined/highlighted), inactive | `full-page.png`, `overview-tab.png` |
| 4 | Members tab | tab-link | Tab strip, second position | "Members" | Active, inactive (default); navigates to /settings/manage/{id}/members | `full-page.png` |
| 5 | Apps tab | tab-link | Tab strip, third position | "Apps" | Active, inactive (default); navigates to /settings/manage/{id}/folders | `full-page.png` |
| 6 | Plan label | label | Overview tab content | "Plan" | Static | `overview-tab.png` |
| 7 | Plan tier heading | heading (H4) | Overview tab, Plan section | "Pro Legacy (Mar 2025)" | Static | `overview-tab.png` |
| 8 | Plan description | text | Overview tab, Plan section | "You are on a custom plan. Premium features are unlocked in this workspace." | Static | `overview-tab.png` |
| 9 | Workspace Members link | link | Overview tab, Members section | "Workspace Members (1)" | Default, hover; navigates to /settings/manage/{id}/members | `overview-tab.png`, `full-page.png` |
| 10 | Members info icon | icon-button (tooltip) | Beside "Workspace Members" link | "?" info icon | Default, hover (cursor pointer, shows tooltip) | `overview-tab.png` |
| 11 | Member avatar | avatar | Members list row | Benjamin Oppold avatar | Static | `overview-tab.png`, `full-page.png` |
| 12 | Member name | text | Members list row | "Benjamin Oppold" | Static | `overview-tab.png`, `full-page.png` |
| 13 | Invite button | button (secondary) | Below members list | "Invite teammates to collaborate" (with icon) | Default, hover | `overview-tab.png`, `full-page.png` |
| 14 | Workspace Actions dropdown | dropdown-button | Bottom of Overview tab | "Workspace Actions" | Closed (default), open (reveals action items) | `full-page.png`, `actions-dropdown.png` |
| 15 | Archive workspace action | button (dropdown-item) | Workspace Actions dropdown | "Archive workspace" | Default, hover; visible only when dropdown is open | `actions-dropdown.png` |
| 16 | Delete workspace action | button (dropdown-item, destructive) | Workspace Actions dropdown | "Delete workspace" | Default, hover; visible only when dropdown is open | `actions-dropdown.png` |
| 17 | Toggle settings panel button | icon-button | Main content area | Toggle settings panel | Default, hover | `full-page.png` |
| 18 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `full-page.png` |
| 19 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `full-page.png` |
| 20 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `full-page.png` |
| 21 | User avatar | icon-button | Navbar far right | User avatar/initials | Default, hover | `full-page.png` |

## Interactive States

### Tab Navigation (Overview / Members / Apps)

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Overview active (default) | Page load / click "Overview" | Overview tab highlighted/underlined, tab content shows plan, members, and actions sections | `full-page.png`, `overview-tab.png` |
| Members active | Click "Members" | Navigates to /settings/manage/{id}/members, Members tab underlined | - |
| Apps active | Click "Apps" | Navigates to /settings/manage/{id}/folders, Apps tab underlined | - |
| Tab hover | Hover over inactive tab | Background/text highlight | - |

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Manage expanded, workspace active | Default (current page) | Manage group expanded, workspace item highlighted/bold | `full-page.png` |
| Integrations expanded | Click "Integrations" | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | `full-page.png` |
| Manage expanded | Click "Manage" | Reveals sub-items: Workspaces, Activate | `full-page.png` |
| Other item hover | Hover over sidebar item | Background highlight | - |

### Workspace Actions Dropdown

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Closed (default) | Page load | Dropdown button displayed, action items hidden | `full-page.png` |
| Open | Click "Workspace Actions" button | Dropdown expands revealing "Archive workspace" and "Delete workspace" items | `actions-dropdown.png` |
| Archive hover | Hover "Archive workspace" item | Item background highlight | - |
| Archive click | Click "Archive workspace" | Likely triggers confirmation dialog before archiving | - |
| Delete hover | Hover "Delete workspace" item | Item background highlight (destructive variant) | - |
| Delete click | Click "Delete workspace" | Likely triggers confirmation dialog before permanent deletion | - |
| Close dropdown | Click outside dropdown or press Escape | Dropdown collapses, action items hidden | - |

### Invite Button

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Button displayed with icon and label | `overview-tab.png` |
| Hover | Mouse over button | Button background/border highlight | - |
| Click | Click button | Opens invite flow (modal or navigation to invite page) | - |

### Workspace Members Link

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | "Workspace Members (1)" displayed as link | `overview-tab.png` |
| Hover | Mouse over link | Link text highlight/underline | - |
| Click | Click link | Navigates to /settings/manage/{id}/members (equivalent to Members tab) | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Plan info display (tier, description) | Workspace subscription status | @beep/iam-client | P1 | Read-only display of current plan tier and description for this workspace |
| Workspace Members list | Workspace member roster | @beep/iam-client, @beep/iam-ui | P0 | Shows member avatars and names with count, links to full members view |
| Member invite button | Workspace invitation flow | @beep/iam-ui | P0 | Triggers invite modal/flow for adding new workspace members |
| Workspace Actions dropdown | Workspace management actions | @beep/iam-client | P1 | Dropdown with destructive workspace operations (archive, delete) |
| Archive workspace action | Workspace archival | @beep/iam-client, @beep/iam-server | P1 | Archives workspace with confirmation, moves to Archives settings page |
| Delete workspace action | Workspace deletion | @beep/iam-client, @beep/iam-server | P1 | Permanently deletes workspace with confirmation dialog, cascading data removal |
| Tab navigation (Overview/Members/Apps) | Workspace admin tab layout | @beep/ui | P0 | Reusable tab navigation scoped to a workspace entity |
| Workspace heading (H1) | Workspace admin page header | @beep/iam-ui | P0 | Displays workspace name as page heading |
| Members info tooltip | Member count explanation | @beep/iam-ui | P2 | Info icon with tooltip explaining workspace member count |
| Settings sidebar (Manage active) | Settings navigation | @beep/customization-ui | P0 | Persistent navigation with Manage group expanded and workspace selected |

## Implementation Notes

- **Components**: shadcn Tabs (Overview/Members/Apps tab strip), Card (plan information section), Avatar (member avatars), Button secondary variant (invite button), DropdownMenu (Workspace Actions with archive/delete items), AlertDialog (confirmation dialogs for archive and delete actions), Tooltip (info icon beside "Workspace Members"), NavigationMenu (settings sidebar), Link (Workspace Members count link)
- **Icons**: Phosphor - GearSix (settings breadcrumb), Bell (notification), User/UserCircle (avatar), Info or Question (members info tooltip), UserPlus or Plus (invite button icon), CaretDown (Workspace Actions dropdown indicator), Archive (archive workspace action), Trash (delete workspace action), Buildings (workspace heading contextual)
- **State Management**: Active tab state (Overview, Members, or Apps -- route-based via URL segments), Workspace Actions dropdown open/close state, current workspace data (name, plan tier, member list) fetched on page load, confirmation dialog state for archive/delete operations, settings sidebar active item and expand/collapse state for Manage group
- **API Surface**: GET /api/workspaces/{id} (load workspace details including name and plan info), GET /api/workspaces/{id}/members (load workspace member list with count), POST /api/workspaces/{id}/invite (initiate member invitation), POST /api/workspaces/{id}/archive (archive the workspace), DELETE /api/workspaces/{id} (permanently delete the workspace)
- **Complexity**: Low-Medium -- primarily a read-only dashboard view with three data sections. The main interaction complexity lies in the Workspace Actions dropdown, which requires confirmation dialogs for both archive and delete operations (particularly delete, which involves cascading data removal). The tab navigation is route-based (each tab maps to a distinct URL path), simplifying client state. The Plan section is purely informational. The Members section is a compact preview linking to the full Members tab. The invite button likely opens a shared invitation modal component.
