# Archives Settings

> Captured from: `https://www.taskade.com/settings/archives`
> Screenshots: 3 total (persistent S3 URLs)

## Overview

The Archives settings page is a top-level settings view within Taskade's settings area. It provides users with a management interface for archived spaces and members. The page displays an H1 heading "Archives" with a description paragraph explaining the feature: "Manage your archived spaces. Whether it's a workspace or an app, you can restore or delete them." followed by a "Learn More." link to the Taskade help article. Below the heading, a two-tab strip (Spaces, Members) allows switching between archived spaces and archived members views. The Spaces tab is active by default. In the captured state, both tabs display an empty state message indicating no archived items exist. When populated, the Spaces tab would show a list of archived workspaces and apps with restore/delete actions, and the Members tab would show archived/removed team members with restore actions. This page was captured entirely in its empty state, making it a useful reference for zero-state design patterns.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `archives-full.png` | Full page with Archives view (Spaces tab, empty state) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/archives/screenshots/archives-full.png) |
| `archives-content.png` | Main content area showing heading, tabs, and empty state | [View](https://static.vaultctx.com/notion/taskade-ui-reference/archives/screenshots/archives-content.png) |
| `archives-members-tab.png` | Members tab view (also empty state) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/archives/screenshots/archives-members-tab.png) |

## Layout

The Archives view uses the standard 3-column settings layout. The persistent icon sidebar (56px) anchors the left edge. A settings-specific sidebar (~165px) provides category navigation (General, Plans, Usage & Billing, etc.) with Archives highlighted as the active item. The main content area fills the remaining width and contains the page heading, description text with a help link, a two-tab strip (Spaces | Members), and the tab content area below. In the empty state, the content area shows a centered empty state message. When populated, the content area would display a list or table of archived items with action controls.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: Fills remaining space, vertically scrollable
- **Tab strip**: Two tabs (Spaces, Members) below heading/description
- **Tab content**: Empty state message or archived items list below tab strip

### Layout Diagram

```
+---------+---------------------------------------------------------------------+
| [Logo] / Settings                                    [Bell] [Avatar]          |  48px navbar
+---------+----------+----------------------------------------------------------+
|  Search | General  |  Archives                                                |
|  Recent | Plans    |  Manage your archived spaces. Whether it's a workspace   |
|  People | Usage &  |  or an app, you can restore or delete them. Learn More.  |
|         | Billing  |                                                          |
|  Status | Credits  |  [  Spaces  |  Members  ]                                |
|   Add   | Integr.> |  -----------------------------------------                |
|         |  Cal Feed|                                                          |
|  Notes  |  Google  |                                                          |
|  Cal    |  Zapier  |       You have no archived spaces.                       |
|  Faves  |  Automat.|                                                          |
|   Add   |  AI Agent|                                                          |
|         |  View All|                                                          |
|  Up     | Notifs   |                                                          |
|  Annc   |*Archives*|                                                          |
|  Help   | Manage > |                                                          |
|  Gear   |  Workspc |                                                          |
|         |  Activate|                                                          |
|         |          |                                                          |
|  56px   |  ~165px  |                    remaining width                       |
+---------+----------+----------------------------------------------------------+
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (Archives highlighted), expandable groups (Integrations, Manage) | `archives-full.png` |
| 2 | Page heading | heading (H1) | Main content top | "Archives" | Static | `archives-full.png`, `archives-content.png` |
| 3 | Page description | text | Below heading | "Manage your archived spaces. Whether it's a workspace or an app, you can restore or delete them. Learn More." | Static (with "Learn More." link to help article) | `archives-full.png`, `archives-content.png` |
| 4 | Learn More link | link | Within description | "Learn More." | Default, hover; navigates to `https://help.taskade.com/en/articles/8958484-manage-a-workspace#h_1c2b735615` | `archives-content.png` |
| 5 | Spaces tab | tab | Tab strip, first position | "Spaces" | Active (default), inactive | `archives-full.png`, `archives-content.png` |
| 6 | Members tab | tab | Tab strip, second position | "Members" | Active, inactive (default) | `archives-members-tab.png` |
| 7 | Empty state message (Spaces) | text | Tab content area | "You have no archived spaces." | Static (displayed when Spaces tab active and no archived spaces exist) | `archives-full.png`, `archives-content.png` |
| 8 | Empty state message (Members) | text | Tab content area | Empty state message for members | Static (displayed when Members tab active and no archived members exist) | `archives-members-tab.png` |
| 9 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `archives-full.png` |
| 10 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `archives-full.png` |
| 11 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `archives-full.png` |
| 12 | User avatar | icon-button | Navbar far right | User avatar/initials | Default, hover | `archives-full.png` |

## Interactive States

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Archives active | Default (current page) | Highlighted/bold in sidebar list | `archives-full.png` |
| Integrations expanded | Click "Integrations" | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | `archives-full.png` |
| Manage expanded | Click "Manage" | Reveals sub-items: Workspaces, Activate | `archives-full.png` |
| Other item hover | Hover over sidebar item | Background highlight | - |

### Tab Strip (Spaces / Members)

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Spaces active (default) | Page load | Spaces tab highlighted/underlined, tab content shows Spaces view | `archives-full.png`, `archives-content.png` |
| Members active | Click "Members" tab | Members tab highlighted/underlined, Spaces tab reverts to inactive, tab content switches to Members view | `archives-members-tab.png` |
| Tab hover | Hover over inactive tab | Background/text highlight | - |

### Empty State

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Spaces empty | Spaces tab active, no archived spaces | Centered text "You have no archived spaces." | `archives-full.png`, `archives-content.png` |
| Members empty | Members tab active, no archived members | Centered empty state message for members | `archives-members-tab.png` |

### Populated State (Inferred)

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Archived item list | Tab active with archived items | List/table of archived items with name, type, date archived | - |
| Restore hover | Hover "Restore" action on item | Button highlight | - |
| Restore click | Click "Restore" on item | Item restored, removed from list, success notification | - |
| Delete hover | Hover "Delete" action on item | Button highlight (destructive variant) | - |
| Delete click | Click "Delete" on item | Confirmation dialog appears | - |
| Delete confirmed | Click confirm in deletion dialog | Item permanently deleted, removed from list | - |
| Delete cancelled | Click cancel in deletion dialog | Dialog closes, no change | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Archives page heading & description | Archive management settings view | @beep/customization-ui | P1 | H1 heading with description and help link |
| Spaces tab (archived workspaces) | Archived workspace list | @beep/workspaces-domain, @beep/workspaces-server | P1 | List archived workspaces/apps with restore/delete |
| Members tab (archived members) | Archived member list | @beep/iam-domain, @beep/iam-server | P2 | List removed/archived team members with restore |
| Restore action | Workspace/member restoration | @beep/workspaces-client, @beep/iam-client | P1 | Restore archived item to active state |
| Delete action | Permanent deletion | @beep/workspaces-client, @beep/iam-client | P1 | Permanently remove archived item with confirmation dialog |
| Empty state (zero-state) | Empty state component | @beep/ui | P1 | Reusable empty state pattern for zero-data views |
| Sub-tabs (Spaces/Members) | Tab strip component | @beep/ui | P0 | Reusable tab navigation within settings pages |
| Settings sidebar | Settings navigation | @beep/customization-ui | P0 | Persistent navigation for all settings views |
| Learn More help link | Contextual help links | @beep/ui | P2 | Links to documentation/help articles |

## Implementation Notes

- **Components**: shadcn Tabs (Spaces/Members tab strip), Table or Card list (archived items when populated), Button (Restore secondary, Delete destructive), AlertDialog (confirm permanent deletion), EmptyState component (zero-state illustration/message for when no archived items exist), Link (Learn More help article link)
- **Icons**: Phosphor - Archive (archives page icon), Buildings or Cube (spaces/workspaces), Users (members), ArrowCounterClockwise (restore action), Trash (delete action), Info (learn more link)
- **State Management**: Active tab state (Spaces or Members), archived items list per tab (paginated if large), restore/delete confirmation dialog open state, loading states for restore/delete operations, optimistic removal of items from list on successful restore/delete
- **API Surface**: GET /api/archives/spaces (list archived workspaces, paginated), GET /api/archives/members (list archived members, paginated), POST /api/archives/restore/{id} (restore archived item to active state), DELETE /api/archives/{id} (permanently delete archived item)
- **Complexity**: Low -- simple tab layout with list views and action buttons. The page is primarily a read-only listing with two mutating actions (restore, delete). The main interaction complexity is the confirmation dialog for permanent deletion. The empty state pattern captured here serves as a valuable reference for zero-state design across the application. No form inputs or complex state transitions required.
