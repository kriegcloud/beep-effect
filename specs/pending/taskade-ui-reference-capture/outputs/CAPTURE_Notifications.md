# Notifications Settings

> Captured from: `https://www.taskade.com/settings/notifications`
> Screenshots: 3 total (persistent S3 URLs)

## Overview

The Notifications settings page is a top-level settings view within Taskade's settings area. It provides users with granular control over how and when they receive notifications across different channels (Browser, Mobile, Email) and event types (Comments, Mentions, Updates, Assignments, Reminders, Workflow/Automation). The page is organized into two vertically stacked sections: a "Default Preferences" grid where users select notification levels per event type per channel via dropdown selectors, and a "Workspace Overrides" table that allows per-workspace or per-app customization of notification preferences, with the ability to reset individual channel settings to the default. The page heading is "Notifications" with a description "Manage how and when you're notified of activity in Taskade." Unlike tabbed settings pages (e.g., General/Account), this page has no sub-tabs -- it is a direct top-level item in the settings sidebar.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `notifications-full.png` | Full page with Notifications view | [View](https://static.vaultctx.com/notion/taskade-ui-reference/notifications/screenshots/notifications-full.png) |
| `notifications-defaults.png` | Default Preferences grid section | [View](https://static.vaultctx.com/notion/taskade-ui-reference/notifications/screenshots/notifications-defaults.png) |
| `notifications-overrides.png` | Workspace Overrides table section (scrolled) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/notifications/screenshots/notifications-overrides.png) |

## Layout

The Notifications view uses the standard 3-column settings layout. The persistent icon sidebar (56px) anchors the left edge. A settings-specific sidebar (~165px) provides category navigation (General, Plans, Usage & Billing, etc.). The main content area fills the remaining width and contains the page heading, description, and two vertically stacked sections: the Default Preferences grid (a matrix of dropdown selectors organized by event type and channel) and the Workspace Overrides table (a data table with per-workspace channel override controls). There are no sub-tabs on this page.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: Fills remaining space, vertically scrollable
- **Default Preferences grid**: Matrix layout with event type rows and channel columns (Browser, Mobile, Email)
- **Workspace Overrides table**: Full-width data table below the preferences grid

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo] / Settings                              [Bell] [Avatar]    │  48px navbar
├──────┬──────────┬──────────────────────────────────────────────────┤
│  Search│ General  │  Notifications                                 │
│  Clock│ Plans    │  Manage how and when you're notified of         │
│  Users│ Usage &  │  activity in Taskade.                           │
│      │ Billing  │                                                  │
│  Dot │ Credits  │  Default Preferences                             │
│  Plus│ Integr.▸ │  ┌─────────────────┬─────────┬────────┬───────┐ │
│      │ *Notifs* │  │ Notification    │ Browser │ Mobile │ Email │ │
│      │ Archives │  ├─────────────────┼─────────┼────────┼───────┤ │
│  Note│ Manage ▸ │  │ Comments        │ [v Sel] │ [v Sel]│[v Sel]│ │
│  Cal │          │  │ Mentions        │ [v Sel] │ [v Sel]│[v Sel]│ │
│  Star│ ──────── │  │ Updates         │ [v Sel] │ [v Sel]│[v Sel]│ │
│  Plus│ WORKSPACE│  │ Assignments     │ [v Sel] │ [v Sel]│[v Sel]│ │
│      │  Dot Work│  │ Reminders       │ [v Sel] │ [v Sel]│[v Sel]│ │
│  Up  │          │  │ Workflow/Auto.  │ [v Sel] │ [v Sel]│[v Sel]│ │
│  Horn│          │  └─────────────────┴─────────┴────────┴───────┘ │
│  Help│          │                                                  │
│  Gear│          │  Workspace Overrides                             │
│      │          │  Override default notification preferences for   │
│      │          │  specific workspaces or apps.                    │
│      │          │  ┌──────────┬──────────┬─────────┬────────────┐ │
│      │          │  │ Name     │ Browser  │ Mobile  │ Email      │ │
│      │          │  ├──────────┼──────────┼─────────┼────────────┤ │
│      │          │  │ Workspace│[Use dflt]│[Use dfl]│[Use dflt]  │ │
│      │          │  │ App 1    │[Use dflt]│[Use dfl]│[Use dflt]  │ │
│      │          │  │ App 2    │[Use dflt]│[Use dfl]│[Use dflt]  │ │
│ 56px │  ~165px  │  └──────────┴──────────┴─────────┴────────────┘ │
└──────┴──────────┴──────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (Notifications highlighted), expandable groups (Integrations, Manage) | `notifications-full.png` |
| 2 | Page heading | heading (H1) | Main content top | "Notifications" | Static | `notifications-full.png`, `notifications-defaults.png` |
| 3 | Page description | text | Below heading | "Manage how and when you're notified of activity in Taskade." | Static | `notifications-full.png`, `notifications-defaults.png` |
| 4 | Default Preferences section heading | heading (H2) | Main content | "Default Preferences" | Static | `notifications-defaults.png` |
| 5 | Preferences grid | grid/table | Main content | Columns: Notification type, Browser, Mobile, Email | Static structure with interactive cells | `notifications-defaults.png`, `notifications-full.png` |
| 6 | Comments row | grid-row | Preferences grid | "Comments" label with Browser, Mobile, Email dropdowns | Default (shows current selection) | `notifications-defaults.png` |
| 7 | Mentions row | grid-row | Preferences grid | "Mentions" label with Browser, Mobile, Email dropdowns | Default (shows current selection) | `notifications-defaults.png` |
| 8 | Updates row | grid-row | Preferences grid | "Updates" label with Browser, Mobile, Email dropdowns | Default (shows current selection) | `notifications-defaults.png` |
| 9 | Assignments row | grid-row | Preferences grid | "Assignments" label with Browser, Mobile, Email dropdowns | Default (shows current selection) | `notifications-defaults.png` |
| 10 | Reminders row | grid-row | Preferences grid | "Reminders" label with Browser, Mobile, Email dropdowns | Default (shows current selection) | `notifications-defaults.png` |
| 11 | Workflow/Automation row | grid-row | Preferences grid | "Workflow/Automation" label with Browser, Mobile, Email dropdowns | Default (shows current selection) | `notifications-defaults.png` |
| 12 | Notification level dropdown | select/dropdown | Each grid cell | Current selection (e.g., "Mention") | Default (closed, shows value), open (shows options list), hover, selected | `notifications-defaults.png` |
| 13 | Workspace Overrides section heading | heading (H2) | Main content (below grid) | "Workspace Overrides" | Static | `notifications-overrides.png` |
| 14 | Workspace Overrides description | text | Below overrides heading | "Override default notification preferences for specific workspaces or apps." | Static | `notifications-overrides.png` |
| 15 | Overrides table | data-table | Main content | Columns: Name, Browser, Mobile, Email | Static structure with interactive cells | `notifications-overrides.png` |
| 16 | Workspace override row | table-row | Overrides table | Workspace/app name with "Use default" buttons per channel | Default, hover | `notifications-overrides.png` |
| 17 | Use default button | button (secondary) | Override row cell | "Use default" | Default, hover, click (resets channel to default preference) | `notifications-overrides.png` |
| 18 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `notifications-full.png` |
| 19 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `notifications-full.png` |
| 20 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `notifications-full.png` |
| 21 | User avatar | icon-button | Navbar far right | User avatar/initials | Default, hover | `notifications-full.png` |

## Interactive States

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Notifications active | Default (current page) | Highlighted/bold in sidebar list | `notifications-full.png` |
| Integrations expanded | Click "Integrations" | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | `notifications-full.png` |
| Manage expanded | Click "Manage" | Reveals sub-items: Workspaces, Activate | `notifications-full.png` |
| Other item hover | Hover over sidebar item | Background highlight | - |

### Default Preferences Grid

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Grid displayed with current notification level selections per cell | `notifications-defaults.png` |
| Dropdown closed | Default | Shows currently selected notification level (e.g., "Mention") | `notifications-defaults.png` |
| Dropdown hover | Hover over dropdown | Border/background highlight on the select control | - |
| Dropdown open | Click dropdown | Expands to show notification level options (e.g., All, Mention, None) | - |
| Option hover | Hover over dropdown option | Option background highlight | - |
| Option selected | Click dropdown option | Dropdown closes, new value displayed, preference saved | - |
| Row hover | Hover over grid row | Subtle row background highlight | - |

### Workspace Overrides Table

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load (scrolled) | Table rows displayed with workspace/app names and "Use default" buttons | `notifications-overrides.png` |
| Row hover | Hover over table row | Row background highlight | - |
| Use default button default | Page load | Secondary button displayed in each channel cell | `notifications-overrides.png` |
| Use default button hover | Hover "Use default" | Button background/border highlight | - |
| Use default button click | Click "Use default" | Resets that channel's preference for this workspace to the global default | - |
| Custom override active | Override set for channel | Button replaced with custom dropdown or override indicator | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Default notification preferences grid | Notification preferences matrix | @beep/comms-domain, @beep/comms-client, @beep/comms-ui | P0 | Per-event-type per-channel notification level selection |
| Comments notification setting | Comment notification preference | @beep/comms-domain | P0 | Configurable level (All, Mention, None) per channel |
| Mentions notification setting | Mention notification preference | @beep/comms-domain | P0 | Configurable level per channel |
| Updates notification setting | Update notification preference | @beep/comms-domain | P1 | Configurable level per channel |
| Assignments notification setting | Assignment notification preference | @beep/comms-domain | P0 | Configurable level per channel |
| Reminders notification setting | Reminder notification preference | @beep/comms-domain, @beep/calendar-domain | P1 | Configurable level per channel |
| Workflow/Automation notification setting | Automation notification preference | @beep/comms-domain | P2 | Configurable level per channel |
| Browser channel | Browser push notifications | @beep/comms-server, @beep/comms-client | P1 | Web Push API integration |
| Mobile channel | Mobile push notifications | @beep/comms-server | P2 | Mobile push notification delivery |
| Email channel | Email notification delivery | @beep/comms-server | P0 | Email notification sending via transactional email |
| Notification level dropdown | Preference level selector | @beep/comms-ui | P0 | Select component with level options (All, Mention, None) |
| Workspace Overrides table | Per-workspace notification overrides | @beep/comms-domain, @beep/customization-client | P1 | Override default preferences for specific workspaces/apps |
| Use default button | Override reset control | @beep/comms-ui, @beep/comms-client | P1 | Resets workspace-specific override to global default |
| Settings sidebar | Settings navigation | @beep/customization-ui | P0 | Persistent navigation for all settings views |

## Implementation Notes

- **Components**: shadcn Select or DropdownMenu (notification level dropdowns in preferences grid), Table (both the Default Preferences grid and Workspace Overrides table), Button secondary variant ("Use default" override reset), custom grid-row component (notification type row with three channel dropdowns)
- **Icons**: Phosphor - Bell (notifications page icon, sidebar), BrowsersThree or Monitor (browser channel column header), DeviceMobile (mobile channel column header), Envelope or EnvelopeSimple (email channel column header), ChatDots or ChatText (comments event type), At (mentions event type), ArrowsClockwise or ArrowCounterClockwise (updates event type), UserPlus or ClipboardText (assignments event type), Alarm or Timer (reminders event type), GearSix or Lightning (workflow/automation event type), Buildings or Cube (workspace names in overrides table)
- **State Management**: Per-event-type per-channel notification level preferences (6 event types x 3 channels = 18 dropdown states), per-workspace per-channel override toggles (N workspaces x 3 channels), preferences fetched on page load and persisted on each dropdown change (optimistic update pattern), no form submission button -- changes auto-save on selection
- **API Surface**: GET /api/notifications/preferences (retrieve current default preference levels for all event types and channels), PUT /api/notifications/preferences (update a specific event type + channel preference level), GET /api/notifications/overrides (retrieve per-workspace override settings), PUT /api/notifications/overrides/{workspaceId} (set or reset a workspace-specific override for a channel), DELETE /api/notifications/overrides/{workspaceId}/{channel} (reset a specific channel override to default)
- **Complexity**: Medium - the Default Preferences grid requires managing a matrix of dropdown states (6 event types x 3 channels), each independently selectable and auto-saving. The Workspace Overrides layer adds a second dimension where per-workspace settings can override the defaults, requiring merge logic on the server (workspace override takes precedence over default, with fallback when "Use default" is selected). The grid layout with consistent column alignment across both sections needs careful CSS. No complex form validation is needed since selections are constrained by dropdown options.
