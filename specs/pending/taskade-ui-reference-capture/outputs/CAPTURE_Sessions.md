# Sessions

> Captured from: `https://www.taskade.com/settings/sessions`
> Screenshots: 2 total (persistent S3 URLs)

## Overview

The Sessions settings view displays all active login sessions across devices for the authenticated user. It allows users to review session metadata (platform, device, last activity) and revoke access to any non-current session. The current session is visually distinguished and cannot be revoked. This is the fourth sub-tab under the General settings section.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `sessions-full.png` | Full page with Sessions tab active | [View](https://static.vaultctx.com/notion/taskade-ui-reference/sessions/screenshots/sessions-full.png) |
| `sessions-table.png` | Sessions data table detail | [View](https://static.vaultctx.com/notion/taskade-ui-reference/sessions/screenshots/sessions-table.png) |

## Layout

The page uses the standard 3-column settings layout. The persistent icon sidebar (56px) occupies the left edge. The settings sidebar (~165px) provides navigation between settings categories (General, Members, Billing, etc.). The main content area fills the remaining width and contains the page heading, description, sub-tab navigation, section heading, and the sessions data table.

- **Icon sidebar**: 56px, fixed left
- **Settings sidebar**: ~165px, settings category navigation
- **Main content**: Fills remaining space
- **Sub-tabs**: Horizontal row (Account, Password, Connected Accounts, Sessions)
- **Sessions table**: Full-width within main content, 4 columns, 8 rows

### Layout Diagram

```
┌──────┬───────────┬──────────────────────────────────────────┐
│ Icon │ Settings  │ Main Content                             │
│ Bar  │ Sidebar   │                                          │
│ 56px │ ~165px    │ H1: "General"                            │
│      │           │ Description text + Learn more link       │
│      │           │                                          │
│      │ General   │ ┌────────────────────────────────────┐   │
│      │ Members   │ │ Account | Password | Connected     │   │
│      │ Billing   │ │ Accounts | [Sessions]              │   │
│      │ ...       │ ├────────────────────────────────────┤   │
│      │           │ │ H2: "Sessions"                     │   │
│      │           │ │ "Below are your recent sessions..." │   │
│      │           │ │                                     │   │
│      │           │ │ Platform | Device | Last Used | Act │   │
│      │           │ │ ─────────────────────────────────── │   │
│      │           │ │ Browser  | Linux  | seconds  | Cur  │   │
│      │           │ │ Browser  | Linux  | 19 min   | Rev  │   │
│      │           │ │ Browser  | Linux  | 19 hrs   | Rev  │   │
│      │           │ │ Browser  | Linux  | month    | Rev  │   │
│      │           │ │ Browser  | Linux  | month    | Rev  │   │
│      │           │ │ Mobile   | Android| month    | Rev  │   │
│      │           │ │ Mobile   | Android| month    | Rev  │   │
│      │           │ │ Browser  | Firefox| 5 months | Rev  │   │
│      │           │ └────────────────────────────────────┘   │
└──────┴───────────┴──────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Page heading | text (H1) | Main content top | "General" | Static | `sessions-full.png` |
| 2 | Page description | text | Below H1 | "View and manage your active login sessions across devices. Learn more." | Static | `sessions-full.png` |
| 3 | Learn more link | link | Inline in description | "Learn more" | Default, hover | `sessions-full.png` |
| 4 | Sub-tab: Account | tab-link | Sub-tab row | "Account" | Inactive | `sessions-full.png` |
| 5 | Sub-tab: Password | tab-link | Sub-tab row | "Password" | Inactive | `sessions-full.png` |
| 6 | Sub-tab: Connected Accounts | tab-link | Sub-tab row | "Connected Accounts" | Inactive | `sessions-full.png` |
| 7 | Sub-tab: Sessions | tab-link | Sub-tab row | "Sessions" | Active (selected) | `sessions-full.png` |
| 8 | Section heading | text (H2) | Main content | "Sessions" | Static | `sessions-full.png`, `sessions-table.png` |
| 9 | Section description | text | Below H2 | "Below are your recent sessions, revoke access to log out of that device." | Static | `sessions-full.png`, `sessions-table.png` |
| 10 | Table header row | table-header | Table top | "Platform", "Device", "Last Used", "Access" | Static | `sessions-table.png` |
| 11 | Platform cell | text | Table column 1 | "Browser" or "Mobile" | Static | `sessions-table.png` |
| 12 | Device cell | text | Table column 2 | "Linux Chrome", "Android", "Linux Firefox" | Static | `sessions-table.png` |
| 13 | Last Used cell | text | Table column 3 | Relative timestamps ("a few seconds ago", "19 minutes ago", etc.) | Static | `sessions-table.png` |
| 14 | Current Session indicator | badge/text | Table column 4 (row 1) | "Current Session" | Static (green text) | `sessions-table.png` |
| 15 | Revoke Access button | button (destructive) | Table column 4 (rows 2-8) | "Revoke Access" | Default, hover, loading | `sessions-table.png` |

## Interactive States

### Sub-tab Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Sessions active | Click "Sessions" tab | Tab highlighted/underlined, route changes to /settings/sessions | `sessions-full.png` |
| Account inactive | Default when on Sessions | No highlight, clickable | `sessions-full.png` |
| Password inactive | Default when on Sessions | No highlight, clickable | `sessions-full.png` |
| Connected Accounts inactive | Default when on Sessions | No highlight, clickable | `sessions-full.png` |

### Session Row States

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Current session | Automatic (server-identified) | "Current Session" displayed as green text; no revoke button | `sessions-table.png` |
| Other session (default) | Page load | Red/pink "Revoke Access" button displayed | `sessions-table.png` |
| Revoke hover | Hover over "Revoke Access" | Button darkens or gains emphasis | `sessions-table.png` |
| Revoke loading | Click "Revoke Access" | Button shows loading state while revoking | - |
| Revoke success | After revocation completes | Row removed from table or marked as revoked | - |

### Table Display

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| No sorting | Default | Rows ordered by "Last Used" descending (most recent first) | `sessions-table.png` |
| Borderless design | Static | No traditional table borders; uses alternating row backgrounds or spacing for visual separation | `sessions-table.png` |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | None captured | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Sessions list | Active sessions view | @beep/iam-ui | P1 | Display all active sessions for the user |
| Session metadata (platform, device, timestamp) | Session detail display | @beep/iam-domain | P1 | Domain model for session entities |
| Current session identification | Current session badge | @beep/iam-client | P1 | Server identifies and flags the requesting session |
| Revoke Access | Session revocation | @beep/iam-client | P1 | Invalidate a specific session token |
| Session CRUD (server) | Session management API | @beep/iam-server | P0 | List, identify current, revoke endpoints |
| Learn more link | Help documentation | External | P3 | External link to security help docs |
| Sub-tab navigation | Settings sub-navigation | @beep/customization-ui | P1 | Shared tab component across General settings |

## Implementation Notes

- **Components**: shadcn DataTable (or Table with custom rows), Badge (for "Current Session" indicator), Button (destructive variant for "Revoke Access"), Tabs (for sub-tab navigation Account/Password/Connected Accounts/Sessions), Text/Heading for section titles and descriptions
- **Icons**: Phosphor - Desktop (browser platform), DeviceMobile (mobile platform), Globe (session/device context), SignOut or XCircle (revoke action), Shield or LockKey (security context)
- **State Management**: Session list data fetched on page load, current session ID tracked from auth context, optimistic removal of revoked sessions from the list, loading state per-row for revoke actions, relative timestamp formatting (using Effect DateTime or a utility like `timeago`)
- **API Surface**: `GET /sessions` (list all active sessions for user), `GET /sessions/current` or session identification via auth token, `DELETE /sessions/:id` (revoke a specific session), session entity includes: `id`, `platform`, `device` (user agent parsed), `lastUsed` (timestamp), `isCurrent` (boolean)
- **Complexity**: Low - straightforward read-only table with a single destructive action per row. Primary complexity lies in server-side session identification and user agent parsing for platform/device columns. No forms, no drag-and-drop, no complex state transitions.
