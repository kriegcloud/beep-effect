# Workspace Header

> Captured from: `https://www.taskade.com/spaces/Yufy1godJk9Yddwv`
> Screenshots: 4 total (persistent S3 URLs)

## Overview

The workspace header is a 48px-tall fixed navigation bar spanning the full viewport width. It provides workspace identification (logo + breadcrumb), workspace switching (dropdown), team management ("Add people"), notifications (activity feed), and user account access. The header persists across all workspace pages, serving as the primary frame for workspace context.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `header-default.png` | Default header bar | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-header/screenshots/header-default.png) |
| `header-workspace-dropdown.png` | Workspace switcher dropdown open | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-header/screenshots/header-workspace-dropdown.png) |
| `header-activity-panel.png` | Activity panel open (right side panel) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-header/screenshots/header-activity-panel.png) |
| `header-activity-panel-full.png` | Full page with activity panel visible | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-header/screenshots/header-activity-panel-full.png) |

## Layout

The header occupies the topmost 48px of the viewport. Content is split between a left-aligned breadcrumb section and right-aligned action buttons. The central area is empty, creating clear visual separation between navigation and actions.

- **Height**: 48px
- **Width**: Full viewport (1745px at captured resolution)
- **Position**: Fixed, top: 0, left: 0
- **Background**: Dark, consistent with sidebar
- **Z-index**: Above main content, same level as sidebar

### Layout Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│ [🏠 Logo]  /  [🟢 Workspace ▾] [▾]     [👥 Add people] [···] [🔔] [👤] │
│  32x32     sep   breadcrumb   chevron         Right-aligned actions  │
│  link /         dropdown      dropdown                               │
│                                                                      │
│ ←── Left section ──→  ←── Center (empty) ──→  ←── Right section ───→ │
│     ~200px                   ~1300px                  ~200px         │
└──────────────────────────────────────────────────────────────────────┘
  48px height
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Taskade logo | icon-link | Left | Taskade mascot icon, 32x32 | Default, hover | `header-default.png` |
| 2 | Breadcrumb separator | text | Left | "/" character | Static | `header-default.png` |
| 3 | Workspace name | button-dropdown | Left | Green avatar + "Workspace" text + chevron | Default, hover, open | `header-default.png`, `header-workspace-dropdown.png` |
| 4 | Workspace switcher chevron | button | Left | Small "▾" chevron | Default, open | `header-default.png`, `header-workspace-dropdown.png` |
| 5 | "Add people" button | button | Right | Person+ icon + "Add people" text | Default, hover | `header-default.png` |
| 6 | More actions menu | icon-button | Right | "..." three dots | Default, hover, open | `header-default.png` |
| 7 | Notification bell | icon-button | Right | Bell icon | Default, hover, unread dot | `header-default.png`, `header-activity-panel.png` |
| 8 | User avatar | icon-button | Right | Circular user photo | Default, hover, menu open | `header-default.png` |

## Interactive States

### Workspace Switcher Dropdown

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Closed | Default | "Workspace ▾" with chevron | `header-default.png` |
| Open | Click chevron button | Dropdown appears below with: current workspace (checkmark), "+ New workspace" option | `header-workspace-dropdown.png` |
| Close | Click outside or Escape | Dropdown disappears | - |

### Activity Panel (Notification Bell)

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Closed | Default | Bell icon only | `header-default.png` |
| Open | Click bell icon | Right-side panel opens (~300px wide) with "Activity" header, filter and settings icons, chronological activity feed grouped by date (TODAY, YESTERDAY, specific dates) | `header-activity-panel.png`, `header-activity-panel-full.png` |

Activity feed items show:
- Project icon (colored circle with letter)
- "Sprint 1 - Jan 2026 in **Sprint Flow Studio** has been updated."
- Relative timestamp ("10 hours ago", "a day ago", "2 days ago")
- Grouped by date headers (TODAY, YESTERDAY, FEBRUARY 12, 2026, etc.)
- "View All" link at bottom

### Workspace Dropdown Contents

| Option | Icon | Action |
|--------|------|--------|
| Workspace | Green avatar + checkmark | Current workspace (selected) |
| + New workspace | Plus icon | Creates new workspace |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | (No dedicated GIF for header; sidebar GIF includes header context) | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Taskade logo/home | App logo/home | @beep/ui | P0 | Brand identity + home navigation |
| Breadcrumb separator | Route breadcrumb | @beep/shared-client | P1 | Navigation context display |
| Workspace name dropdown | Workspace context | @beep/workspaces-ui | P0 | Current workspace identity |
| Workspace switcher | Multi-workspace | @beep/workspaces-client | P0 | Workspace switching |
| "Add people" button | Team invite | @beep/iam-ui | P1 | Member invitation flow |
| More actions (...) | Workspace actions | @beep/workspaces-ui | P2 | Context menu for workspace operations |
| Notification bell | Activity feed | @beep/comms-ui | P1 | Real-time activity notifications |
| Activity panel | Notification center | @beep/comms-ui | P1 | Full activity history with filtering |
| User avatar | Account menu | @beep/iam-ui | P0 | User profile, settings, sign out |

## Implementation Notes

- **Components**: shadcn NavigationMenu, DropdownMenu, Button, Avatar, Sheet (for activity panel), Badge (notification dot), Breadcrumb
- **Icons**: Phosphor - House (logo), CaretDown, UserPlus, DotsThreeVertical, Bell, User
- **State Management**: Current workspace context, notification unread count, activity panel open/closed, user session
- **API Surface**: Workspace list for switcher, team members for "Add people", activity/notification feed with pagination, user profile endpoint
- **Complexity**: Medium - workspace dropdown and activity panel are the main interactive elements
