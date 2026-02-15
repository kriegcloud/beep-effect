# Activate Settings

> Captured from: `https://www.taskade.com/settings/activate`
> Screenshots: 3 total (persistent S3 URLs)

## Overview

The Activate settings page is a workspace premium activation view nested under the "Manage" group in Taskade's settings sidebar. It allows users with a paid subscription to select which of their workspaces should receive premium features. The page displays an H1 heading "Activate" with a description paragraph: "Select workspaces to unlock premium features. Need help? Visit our Help Center." where "Help Center" links to a help article about premium plans. Below the heading, a "Select Workspace" section presents a subtitle "Select up to 10 workspaces" followed by a selectable list of available workspaces. Each workspace row shows a workspace avatar, workspace name (linking to its billing settings), and a checkmark/selection indicator. A prominent "Activate Selected Workspaces" CTA button sits below the workspace list to confirm the activation. This page is accessed via Settings > Manage > Activate in the sidebar navigation.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `full-page.png` | Full page view with sidebar, navbar, and Activate content | [View](https://static.vaultctx.com/notion/taskade-ui-reference/activate/screenshots/full-page.png) |
| `content-area.png` | Main content area showing heading, workspace list, and CTA | [View](https://static.vaultctx.com/notion/taskade-ui-reference/activate/screenshots/content-area.png) |
| `workspace-selection.png` | Workspace selection list detail | [View](https://static.vaultctx.com/notion/taskade-ui-reference/activate/screenshots/workspace-selection.png) |

## Layout

The Activate view uses the standard 3-column settings layout. The persistent icon sidebar (56px) anchors the left edge. A settings-specific sidebar (~165px) provides category navigation (General, Plans, Usage & Billing, etc.) with Activate highlighted as the active item under the expanded "Manage" group. The main content area fills the remaining width and contains the page heading, description paragraph with a help link, a "Select Workspace" subsection with a subtitle and workspace list, and the "Activate Selected Workspaces" button below the list. The content area is measured at 757px wide by 758px tall, positioned at x:65 y:89. The workspace selection list is measured at 384px wide by 96px tall, positioned at x:97 y:209.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: Fills remaining space (757px x 758px measured), vertically scrollable
- **Heading area**: H1 "Activate" with description text and inline help link
- **Select Workspace section**: H2 heading, subtitle, workspace list (384px x 96px measured), and CTA button

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo] / Settings                              [Bell] [Avatar]    │  48px navbar
├──────┬──────────┬──────────────────────────────────────────────────┤
│  Search│ General  │  Activate                                      │
│  Clock│ Plans    │  Select workspaces to unlock premium features.  │
│  Users│ Usage &  │  Need help? Visit our Help Center.              │
│      │ Billing  │                                                  │
│  Dot │ Credits  │  Select Workspace                                │
│  Plus│ Integr.▸ │  Select up to 10 workspaces                      │
│      │ Notifs   │                                                  │
│      │ Archives │  ┌──────────────────────────────────────────┐    │
│  Note│ Manage ▾ │  │  [Avatar] Workspace                  ✓  │    │
│  Cal │  Workspc │  └──────────────────────────────────────────┘    │
│  Star│ *Activate│                                                  │
│  Plus│          │  [ Activate Selected Workspaces ]                 │
│      │ ──────── │                                                  │
│  Up  │ WORKSPACE│                                                  │
│  Horn│  🟢 Work │                                                  │
│  Help│          │                                                  │
│  Gear│          │                                                  │
│      │          │                                                  │
│ 56px │  ~165px  │                remaining width                   │
└──────┴──────────┴──────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (Activate highlighted under Manage), expandable groups (Integrations, Manage expanded) | `full-page.png`, `content-area.png` |
| 2 | Page heading | heading (H1) | Main content top | "Activate" | Static | `full-page.png`, `content-area.png` |
| 3 | Page description | text | Below heading | "Select workspaces to unlock premium features. Need help? Visit our Help Center." | Static (with "Help Center" link to help article about premium plans) | `full-page.png`, `content-area.png` |
| 4 | Help Center link | link | Within description | "Help Center" | Default, hover; navigates to Taskade help article about premium plans | `content-area.png` |
| 5 | Select Workspace heading | heading (H2) | Main content, below description | "Select Workspace" | Static | `full-page.png`, `content-area.png` |
| 6 | Select Workspace subtitle | text | Below H2 | "Select up to 10 workspaces" | Static | `content-area.png` |
| 7 | Workspace list | selectable-list | Below subtitle | List of available workspaces with avatar, name, and selection indicator | Default (shows available workspaces), empty (no workspaces available) | `full-page.png`, `content-area.png`, `workspace-selection.png` |
| 8 | Workspace row | list-item (selectable) | Workspace list | Workspace avatar + "Workspace" name (links to /settings/billing) + checkmark indicator | Unselected (no checkmark), selected (green checkmark visible), hover (row highlight) | `full-page.png`, `content-area.png`, `workspace-selection.png` |
| 9 | Workspace avatar | avatar | Workspace row, left | Workspace icon/image | Static | `workspace-selection.png` |
| 10 | Workspace name link | link | Workspace row, center | "Workspace" | Default, hover; navigates to /settings/billing | `workspace-selection.png` |
| 11 | Selection checkmark | icon/indicator | Workspace row, right | Green checkmark | Visible (selected), hidden (unselected) | `full-page.png`, `content-area.png`, `workspace-selection.png` |
| 12 | Activate Selected Workspaces button | button (CTA) | Below workspace list | "Activate Selected Workspaces" | Default, hover, disabled (no workspaces selected), loading (activation in progress) | `full-page.png`, `content-area.png` |
| 13 | Toggle settings panel button | icon-button | Main content area | Panel toggle control | Default, hover, active (panel open) | `full-page.png` |
| 14 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `full-page.png` |
| 15 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `full-page.png` |
| 16 | Credits button | button | Navbar right area | "0 credits" with icon | Default, hover | `full-page.png` |
| 17 | Upgrade button | button | Navbar right area | "Upgrade" with icon | Default, hover | `full-page.png` |
| 18 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `full-page.png` |
| 19 | User avatar | icon-button | Navbar far right | User avatar/initials | Default, hover | `full-page.png` |

## Interactive States

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Activate active | Default (current page) | Activate item highlighted/bold under expanded Manage group | `full-page.png`, `content-area.png` |
| Manage expanded | Default (current page) | Manage group expanded, revealing sub-items: Workspaces, Activate | `full-page.png`, `content-area.png` |
| Integrations collapsed | Default (unless previously expanded) | Integrations group shows chevron, sub-items hidden | `full-page.png` |
| Other item hover | Hover over sidebar item | Background highlight | - |

### Workspace Selection

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Workspace unselected | Page load (default for unactivated workspaces) | Row displayed without checkmark indicator | - |
| Workspace selected | Click workspace row | Green checkmark appears on the right side of the row | `full-page.png`, `content-area.png`, `workspace-selection.png` |
| Workspace deselected | Click selected workspace row | Checkmark removed | - |
| Row hover | Hover over workspace row | Row background highlight | - |
| Max selections reached | 10 workspaces selected | Remaining unselected rows disabled/dimmed, selection prevented | - |

### Activate Button

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | At least one workspace selected | Button enabled with primary/CTA styling (dark red/magenta background) | `full-page.png`, `content-area.png` |
| Hover | Mouse over enabled button | Button highlight/elevation change | - |
| Disabled | No workspaces selected | Button dimmed/grayed, click prevented | - |
| Loading | Click button (activation in progress) | Spinner or loading indicator replaces button text | - |
| Success | Activation completes | Success notification, workspace list updated to reflect activated state | - |

### Workspace Name Link

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Workspace name displayed as clickable text | `workspace-selection.png` |
| Hover | Mouse over workspace name | Text underline or color change | - |
| Click | Click workspace name | Navigates to /settings/billing for that workspace | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Activate page heading & description | Premium activation settings view | @beep/customization-ui | P0 | H1 heading with description and contextual help link |
| Select Workspace section | Workspace selection for plan activation | @beep/iam-ui, @beep/iam-client | P0 | Selectable workspace list with avatar, name, and selection state |
| Workspace selection limit | Multi-select with max constraint | @beep/ui | P1 | "Select up to N workspaces" constraint enforcement on client side |
| Workspace row (avatar + name + checkmark) | Selectable workspace list item | @beep/ui | P0 | Reusable selectable list item with avatar, label, and check indicator |
| Green checkmark selection indicator | Selection state indicator | @beep/ui | P0 | Toggle checkmark icon on selectable list items |
| Workspace name billing link | Workspace billing navigation | @beep/iam-client | P1 | Links individual workspace to its billing settings page |
| Activate Selected Workspaces button | Premium activation CTA | @beep/iam-client, @beep/iam-server | P0 | Submits workspace activation request, toggles premium features for selected workspaces |
| Help Center link | Contextual help link | @beep/ui | P2 | Links to documentation/help article about premium plans |
| Credits display (navbar) | Credits balance indicator | @beep/iam-ui, @beep/iam-client | P1 | Shows current credit balance in navbar |
| Upgrade button (navbar) | Plan upgrade CTA | @beep/iam-ui, @beep/iam-client | P1 | Quick access to upgrade/plans page from navbar |
| Settings sidebar (Activate active) | Settings navigation | @beep/customization-ui | P0 | Persistent navigation with Activate highlighted under Manage group |

## Implementation Notes

- **Components**: shadcn Button (Activate Selected Workspaces CTA, destructive/primary variant), Checkbox or custom selectable-list (workspace selection with checkmark toggle), Avatar (workspace avatars in list rows), Link (Help Center contextual link, workspace name billing links), custom SelectableListItem (workspace row: avatar + name link + selection indicator)
- **Icons**: Phosphor - Lightning or ShieldCheck (activate page icon in sidebar), Check or CheckCircle (workspace selection checkmark, green variant), Buildings or Cube (workspace avatar fallback), GearSix (settings breadcrumb), Bell (notification), User/UserCircle (avatar), Coins or CreditCard (credits display), ArrowUp or Sparkle (upgrade button), CaretDown/CaretUp (Manage group expand/collapse)
- **State Management**: Selected workspace IDs set (multi-select, max 10 enforcement), workspace list with current activation status (already activated vs available), CTA button disabled state derived from empty selection, loading state during activation API call, optimistic UI update on successful activation, settings sidebar active item and Manage group expanded state
- **API Surface**: GET /api/workspaces (list available workspaces with current activation status), POST /api/billing/activate (activate premium features for selected workspace IDs, body: `{ workspaceIds: string[] }`), GET /api/billing/subscription (determine plan limits -- max activatable workspaces), GET /api/billing/credits (current credit balance for navbar display)
- **Complexity**: Low -- straightforward selectable list with a single CTA action. The primary logic is: (1) loading available workspaces with their current activation state, (2) enforcing the maximum selection limit (up to 10), (3) submitting the activation request for selected workspaces, and (4) updating the UI to reflect newly activated workspaces. The workspace name links to billing settings provide a secondary navigation path. No complex form inputs, no tabs, no expandable sections. The main edge case is handling the maximum workspace selection constraint and properly reflecting which workspaces are already activated vs available for activation.
