# Sidebar Navigation

> Captured from: `https://www.taskade.com/spaces/Yufy1godJk9Yddwv`
> Screenshots: 4 total (persistent S3 URLs)

## Overview

The sidebar is a persistent 56px-wide vertical icon bar on the left edge of the viewport. It provides global navigation across the application, organized into three logical sections: top navigation (Search, Recent, Shared), workspace selection (active workspace + new workspace), and quick views (My Tasks, Calendar, Starred, Quick Add) plus utility actions (What's new, Help, Settings). The sidebar remains fixed across all pages and maintains visual state for the active workspace.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `sidebar-full.png` | Full sidebar vertical strip | [View](https://static.vaultctx.com/notion/taskade-ui-reference/sidebar-navigation/screenshots/sidebar-full.png) |
| `sidebar-hover-search.png` | Search icon with tooltip | [View](https://static.vaultctx.com/notion/taskade-ui-reference/sidebar-navigation/screenshots/sidebar-hover-search.png) |
| `sidebar-hover-recent.png` | Recent icon with tooltip | [View](https://static.vaultctx.com/notion/taskade-ui-reference/sidebar-navigation/screenshots/sidebar-hover-recent.png) |
| `sidebar-hover-workspace.png` | Workspace icon with tooltip | [View](https://static.vaultctx.com/notion/taskade-ui-reference/sidebar-navigation/screenshots/sidebar-hover-workspace.png) |

## Layout

The sidebar is fixed-position, spanning from below the 48px navbar to the bottom of the viewport. Icons are 32x32px with consistent vertical spacing. The sidebar uses a darker background than the main content area with subtle hover states. Active workspace is indicated by a green-tinted circular avatar.

- **Width**: 56px
- **Height**: Full viewport minus 48px navbar (~821px)
- **Position**: Fixed, left: 0, top: 48px
- **Background**: Dark (#1a1a1a approximately)
- **Icon size**: 32x32px each
- **Icon color**: Muted white/gray, brightens on hover

### Layout Diagram

```
┌──────┐
│ 🔍   │  Search (Ctrl+K)         ─┐
│ 🕐   │  Recent                    │ Top Navigation
│ 👥   │  Shared                   ─┘
│      │
│ 🟢   │  Workspace (active)      ─┐ Workspace Section
│  ＋  │  New workspace            ─┘
│      │
│      │  (expandable space)
│      │
│ 📝   │  My Tasks                ─┐
│ 📅   │  Calendar                 │
│ ⭐   │  Starred                  │ Quick Views
│ ⊕   │  Quick Add (Ctrl+?)      ─┘
│      │
│  ▲   │  Hide quick views        ─┐
│ 📢   │  What's new               │ Utility
│  ❓  │  Help                     │
│  ⚙   │  Settings                ─┘
└──────┘
  56px
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Search | icon-link | Top section | Magnifying glass, "Search Ctrl+K" tooltip | Default, hover (tooltip), active | `sidebar-full.png`, `sidebar-hover-search.png` |
| 2 | Recent | icon-link | Top section | Clock, "Recent" tooltip | Default, hover (tooltip), active | `sidebar-full.png`, `sidebar-hover-recent.png` |
| 3 | Shared | icon-link | Top section | People group, "Shared" tooltip | Default, hover (tooltip), active | `sidebar-full.png` |
| 4 | Workspace | icon-link | Workspace section | Green circular avatar, "Workspace" tooltip | Default (green/active), hover (tooltip) | `sidebar-full.png`, `sidebar-hover-workspace.png` |
| 5 | New workspace | icon-button | Workspace section | "+" icon, "New workspace" tooltip | Default, hover (tooltip) | `sidebar-full.png` |
| 6 | My Tasks | icon-link | Quick views | Checklist/notepad, "My Tasks" tooltip | Default, hover (tooltip), active | `sidebar-full.png` |
| 7 | Calendar | icon-link | Quick views | Calendar, "Calendar" tooltip | Default, hover (tooltip), active | `sidebar-full.png` |
| 8 | Starred | icon-link | Quick views | Star outline, "Starred" tooltip | Default, hover (tooltip), active | `sidebar-full.png` |
| 9 | Quick Add | icon-button | Quick views | Circular +, "Quick Add Ctrl+?" tooltip | Default, hover (tooltip) | `sidebar-full.png` |
| 10 | Hide quick views | icon-button | Utility section | Chevron up, "Hide quick views" aria-label | Default, toggled | `sidebar-full.png` |
| 11 | What's new | icon-button | Utility section | Megaphone/bell, "What's new" tooltip | Default, hover (tooltip), notification dot | `sidebar-full.png` |
| 12 | Help | icon-button | Utility section | Question mark circle, "Help" tooltip | Default, hover (tooltip) | `sidebar-full.png` |
| 13 | Settings | icon-button | Utility section | Gear/cog, "Settings" tooltip | Default, hover (tooltip) | `sidebar-full.png` |

## Interactive States

### Tooltip Display

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Search tooltip | Hover over search icon | "Search CTRL K" appears right of icon | `sidebar-hover-search.png` |
| Recent tooltip | Hover over clock icon | "Recent" appears right of icon | `sidebar-hover-recent.png` |
| Shared tooltip | Hover over people icon | "Shared" appears right of icon | `sidebar-full.png` |
| Workspace tooltip | Hover over green avatar | "Workspace" appears right of icon | `sidebar-hover-workspace.png` |
| New workspace tooltip | Hover over + button | "New workspace" appears right of icon | `sidebar-full.png` |
| My Tasks tooltip | Hover over checklist icon | "My Tasks" appears right of icon | `sidebar-full.png` |
| Calendar tooltip | Hover over calendar icon | "Calendar" appears right of icon | `sidebar-full.png` |
| Starred tooltip | Hover over star icon | "Starred" appears right of icon | `sidebar-full.png` |
| Quick Add tooltip | Hover over circular + | "Quick Add CTRL" appears right of icon | `sidebar-full.png` |
| Settings tooltip | Hover over gear icon | "Settings" appears right of icon | `sidebar-full.png` |

### Active States

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Workspace active | Current page is workspace | Green-tinted circular avatar with highlight | `sidebar-hover-workspace.png` |
| Icon hover | Mouse over any icon | Subtle brightness increase, background highlight | `sidebar-hover-search.png`, `sidebar-hover-recent.png`, `sidebar-hover-workspace.png` |

### Navigation Routes

| Icon | Route | Behavior |
|------|-------|----------|
| Search | /search | Opens search overlay (Ctrl+K shortcut) |
| Recent | /recent | Navigates to recently viewed items |
| Shared | /shared | Navigates to shared-with-me view |
| Workspace | /spaces/{id} | Navigates to workspace home |
| My Tasks | /my-tasks | Navigates to personal task view |
| Calendar | /calendar | Navigates to calendar view |
| Starred | /lists/starred | Navigates to starred/favorited items |
| Settings | /settings | Opens settings page |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| 1 | Full sidebar hover sequence (all icons top to bottom) | ~15s | taskade_sidebar_hover_tooltips.gif |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Search (Ctrl+K) | Global search | @beep/shared-client | P0 | Command palette / spotlight search |
| Recent | Recent items | @beep/shared-client | P1 | Activity-based navigation |
| Shared | Shared items | @beep/iam-client | P1 | Collaboration view |
| Workspace selector | Workspace nav | @beep/workspaces-ui | P0 | Multi-workspace support |
| New workspace | Create workspace | @beep/workspaces-client | P0 | Workspace creation flow |
| My Tasks | Task view | @beep/workspaces-ui | P0 | Personal task aggregation |
| Calendar | Calendar view | @beep/calendar-ui | P1 | Calendar integration |
| Starred | Favorites | @beep/shared-client | P2 | Bookmarking system |
| Quick Add | Quick create | @beep/workspaces-client | P1 | Fast task/note creation |
| Settings | Settings | @beep/customization-ui | P0 | App configuration |
| What's new | Changelog | @beep/ui | P3 | Product updates feed |
| Help | Help center | External | P3 | External help documentation |

## Implementation Notes

- **Components**: shadcn Tooltip, NavigationMenu (vertical), Button (icon variant), Avatar, Separator
- **Icons**: Phosphor - MagnifyingGlass, ClockCounterClockwise, UsersThree, House (or custom workspace avatar), Plus, ListChecks, CalendarBlank, Star, PlusCircle, CaretUp, Megaphone, Question, GearSix
- **State Management**: Active route tracking, workspace context (current workspace ID), tooltip visibility, quick views collapsed state (toggleable via "Hide quick views")
- **API Surface**: Search endpoint, recent items query, shared items query, workspace CRUD, task aggregation, calendar events, starred items, user preferences
- **Complexity**: Medium - primarily navigation links with tooltips, main complexity in active state tracking and workspace context
