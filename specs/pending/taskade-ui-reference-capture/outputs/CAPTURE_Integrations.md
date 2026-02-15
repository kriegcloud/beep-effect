# Integrations Settings

> Captured from: `https://www.taskade.com/settings/integrations/calendar-feed`
> Screenshots: 4 total (persistent S3 URLs)

## Overview

The Integrations settings area is an expandable category in the settings sidebar that groups third-party service connections and data export features. It contains three in-app sub-views (Calendar Feed, Google Calendar, Zapier) and two external help links (Automation, AI Agents), plus a "View All" link to a separate integrations directory page. The Calendar Feed sub-view is the most complex, providing a webcal URL for exporting tasks/due dates to external calendar apps and a full API Token management section with token generation, permissions display, and revocation. The Google Calendar sub-view is a minimal single-action page with an OAuth "Connect Calendar" button for two-way sync. The Zapier sub-view embeds a third-party Zapier Partner SDK widget showing 20+ integration app logos and Zap creation/management directly within the Taskade UI. Each sub-view demonstrates a distinct integration pattern: token-based export (Calendar Feed), OAuth-based connection (Google Calendar), and embedded third-party widget (Zapier).

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `integrations-calendar-feed-full.png` | Full page with Calendar Feed view | [View](https://static.vaultctx.com/notion/taskade-ui-reference/integrations/screenshots/integrations-calendar-feed-full.png) |
| `integrations-calendar-feed-api-token.png` | API Token section of Calendar Feed | [View](https://static.vaultctx.com/notion/taskade-ui-reference/integrations/screenshots/integrations-calendar-feed-api-token.png) |
| `integrations-google-calendar.png` | Google Calendar integration view | [View](https://static.vaultctx.com/notion/taskade-ui-reference/integrations/screenshots/integrations-google-calendar.png) |
| `integrations-zapier.png` | Zapier integration view with embedded widget | [View](https://static.vaultctx.com/notion/taskade-ui-reference/integrations/screenshots/integrations-zapier.png) |

## Layout

All three Integrations sub-views use the standard 3-column settings layout. The persistent icon sidebar (56px) anchors the left edge. The settings sidebar (~165px) provides category navigation with the "Integrations" group expanded to show its sub-items (Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All). The main content area fills the remaining width. Calendar Feed is the tallest page with a heading, description, collapsible platform instructions, a read-only calendar URL field with copy action, and an API Token management section containing a generate button and a data table. Google Calendar is the shortest page with just a heading, description, and a single connect button. Zapier fills the main content area with an embedded third-party widget.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list with Integrations expanded
- **Main content**: Fills remaining space, vertically scrollable
- **Calendar Feed**: Stacked sections (heading, instructions collapsible, URL field, API token table)
- **Google Calendar**: Minimal single-section layout (heading, description, connect button)
- **Zapier**: Embedded widget fills content area

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo] / Settings                              [🔔] [👤]          │  48px navbar
├──────┬──────────┬──────────────────────────────────────────────────┤
│  🔍  │ General  │  Calendar Feed                                   │
│  🕐  │ Plans    │  Add your tasks and due dates to your favorite   │
│  👥  │ Usage &  │  calendar app with a Taskade Calendar URL.       │
│      │  Billing │                                                  │
│  🟢  │ Credits  │  How to add a Calendar Feed:                     │
│  ＋  │ Integr.▼ │  ▸ Apple Calendar                                │
│      │  Cal Feed│  ▸ Google Calendar                               │
│      │ *CalFeed*│  ▸ Microsoft Outlook                             │
│  📝  │  Google  │                                                  │
│  📅  │  Zapier  │  Calendar URL                                    │
│  ⭐  │  Automat.│  ┌────────────────────────────────┬────────┐     │
│  ⊕   │  AI Agent│  │ webcal://www.taskade.com/...   │ [Copy] │     │
│      │  View All│  └────────────────────────────────┴────────┘     │
│  ▲   │ Notifs   │                                                  │
│  📢  │ Archives │  API TOKEN                                       │
│  ❓  │ Manage ▸ │  [Generate new token]                            │
│  ⚙   │          │  ┌────────┬────────┬─────────────┬─────────┐    │
│      │ ──────── │  │ Label  │ Token  │ Permissions │ Actions │    │
│      │ WORKSPACE│  ├────────┼────────┼─────────────┼─────────┤    │
│      │  🟢 Work │  │ My tok │ ••••   │ Read Write  │  [🗑]   │    │
│ 56px │  ~165px  │  └────────┴────────┴─────────────┴─────────┘    │
└──────┴──────────┴──────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot |
|---|-----------|------|----------|---------------|--------|------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations (expanded), Notifications, Archives, Manage | Item default, item active, expandable groups (Integrations expanded showing sub-items) | `integrations-calendar-feed-full.png` |
| 2 | Integrations sidebar group | nav-group (expanded) | Settings sidebar | Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | Expanded state, sub-item default, sub-item active | `integrations-calendar-feed-full.png` |
| 3 | Calendar Feed sub-item | nav-link | Integrations group | "Calendar Feed" | Active (highlighted), default | `integrations-calendar-feed-full.png` |
| 4 | Google Calendar sub-item | nav-link | Integrations group | "Google Calendar" | Active (when on Google Calendar view), default | `integrations-google-calendar.png` |
| 5 | Zapier sub-item | nav-link | Integrations group | "Zapier" | Active (when on Zapier view), default | `integrations-zapier.png` |
| 6 | Automation sub-item | nav-link (external) | Integrations group | "Automation" | Default, hover (opens external help article) | `integrations-calendar-feed-full.png` |
| 7 | AI Agents sub-item | nav-link (external) | Integrations group | "AI Agents" | Default, hover (opens external help article) | `integrations-calendar-feed-full.png` |
| 8 | View All sub-item | nav-link | Integrations group | "View All" | Default, hover (navigates to /integrations) | `integrations-calendar-feed-full.png` |
| 9 | Calendar Feed heading | heading (H2) | Main content top | "Calendar Feed" | Static | `integrations-calendar-feed-full.png` |
| 10 | Calendar Feed description | text | Below heading | "Add your tasks and due dates to your favorite calendar app with a Taskade Calendar URL (webcal)." | Static | `integrations-calendar-feed-full.png` |
| 11 | How-to section heading | text | Main content | "How to add a Calendar Feed:" | Static | `integrations-calendar-feed-full.png` |
| 12 | Apple Calendar instructions | collapsible | How-to section | "Apple Calendar" with link to help article | Collapsed (default), expanded | `integrations-calendar-feed-full.png` |
| 13 | Google Calendar instructions | collapsible | How-to section | "Google Calendar" with link to help article | Collapsed (default), expanded | `integrations-calendar-feed-full.png` |
| 14 | Microsoft Outlook instructions | collapsible | How-to section | "Microsoft Outlook" with link to help article | Collapsed (default), expanded | `integrations-calendar-feed-full.png` |
| 15 | Calendar URL field | input (read-only) | Main content | "webcal://www.taskade.com/..." | Read-only, text selectable | `integrations-calendar-feed-full.png` |
| 16 | Calendar URL Copy button | button | Calendar URL field, right side | "Copy" | Default, hover, clicked (copied feedback) | `integrations-calendar-feed-full.png` |
| 17 | API Token section heading | heading (H3) | Main content, below URL | "API TOKEN" | Static | `integrations-calendar-feed-api-token.png` |
| 18 | Generate new token button | button | API Token section | "Generate new token" | Default, hover, loading | `integrations-calendar-feed-api-token.png` |
| 19 | API Token table | data-table | API Token section | Columns: Label, Token, Permissions, Actions | Empty state (no tokens), populated with rows | `integrations-calendar-feed-api-token.png` |
| 20 | Token row | table-row | API Token table | Label text, masked token, permission tags, action buttons | Default, hover | `integrations-calendar-feed-api-token.png` |
| 21 | Permission tags | badge/tag | Token row, Permissions column | "Read", "Write" | Static (read-only display) | `integrations-calendar-feed-api-token.png` |
| 22 | Token delete/revoke button | icon-button | Token row, Actions column | Trash/delete icon | Default, hover, confirm dialog | `integrations-calendar-feed-api-token.png` |
| 23 | Google Calendar heading | heading (H2) | Main content top | "Google Calendar" | Static | `integrations-google-calendar.png` |
| 24 | Google Calendar description | text | Below heading | Description about two-way sync between Google Calendar and Taskade | Static | `integrations-google-calendar.png` |
| 25 | Connect Calendar button | button (primary) | Main content | "Connect Calendar" | Default, hover, loading (redirects to /auth/google/calendar) | `integrations-google-calendar.png` |
| 26 | Zapier heading | heading (H2) | Main content top | "Zapier" | Static | `integrations-zapier.png` |
| 27 | Zapier embedded widget | iframe/embed | Main content | Zapier Partner SDK widget with 20+ integration app logos and Zap management | Loading, loaded, interactive (third-party controlled) | `integrations-zapier.png` |
| 28 | Integration app logos | icon-grid | Zapier widget | Gmail, Google Calendar, Slack, and 20+ more | Static display within widget | `integrations-zapier.png` |

## Interactive States

### Settings Sidebar - Integrations Group

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Integrations expanded | Click "Integrations" in sidebar | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | `integrations-calendar-feed-full.png` |
| Calendar Feed active | Click "Calendar Feed" or navigate to /settings/integrations/calendar-feed | Calendar Feed sub-item highlighted/bold | `integrations-calendar-feed-full.png` |
| Google Calendar active | Click "Google Calendar" or navigate to /settings/integrations/google-calendar | Google Calendar sub-item highlighted/bold | `integrations-google-calendar.png` |
| Zapier active | Click "Zapier" or navigate to /settings/integrations/zapier | Zapier sub-item highlighted/bold | `integrations-zapier.png` |
| Automation click | Click "Automation" | Opens external help article in new tab (https://help.taskade.com/en/articles/8958467) | - |
| AI Agents click | Click "AI Agents" | Opens external help article in new tab (https://help.taskade.com/en/articles/8958457) | - |
| View All click | Click "View All" | Navigates to /integrations (separate page, leaves settings) | - |

### Calendar Feed - Instructions Collapsibles

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| All collapsed | Default (page load) | Chevrons pointing right, instruction content hidden | `integrations-calendar-feed-full.png` |
| Apple expanded | Click "Apple Calendar" row | Chevron rotates down, reveals setup instructions with help article link | - |
| Google expanded | Click "Google Calendar" row | Chevron rotates down, reveals setup instructions with help article link | - |
| Outlook expanded | Click "Microsoft Outlook" row | Chevron rotates down, reveals setup instructions with help article link | - |

### Calendar Feed - URL and Copy

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| URL default | Page load | Read-only input showing webcal URL, Copy button visible | `integrations-calendar-feed-full.png` |
| Copy hover | Hover "Copy" button | Button highlight | - |
| Copy clicked | Click "Copy" button | URL copied to clipboard, button shows confirmation (e.g., "Copied!" or checkmark) | - |
| Copy reset | After ~2 seconds | Button reverts to "Copy" label | - |

### Calendar Feed - API Token Management

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Generate default | Page load | "Generate new token" button displayed | `integrations-calendar-feed-api-token.png` |
| Generate hover | Hover "Generate new token" | Button highlight | - |
| Generate click | Click "Generate new token" | May open modal for label/permissions input, or directly creates token | - |
| Token generated | After generation completes | New row appears in token table with label, masked token, permission tags | - |
| Token table empty | No tokens exist | Table shows empty state or is hidden | - |
| Token table populated | Tokens exist | Rows displayed with Label, Token (masked), Permissions (Read/Write tags), Actions | `integrations-calendar-feed-api-token.png` |
| Token row hover | Hover over table row | Row background highlight | - |
| Delete hover | Hover delete/revoke icon | Icon highlight/color change | - |
| Delete click | Click delete/revoke icon | Confirmation dialog appears (are you sure?) | - |
| Delete confirmed | Confirm deletion | Token row removed from table, token revoked server-side | - |

### Google Calendar - Connection

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Disconnected | Default (not connected) | "Connect Calendar" button displayed | `integrations-google-calendar.png` |
| Connect hover | Hover "Connect Calendar" | Button highlight | - |
| Connect click | Click "Connect Calendar" | Redirects to /auth/google/calendar (Google OAuth consent screen) | - |
| Connected | After OAuth success | Button changes to "Disconnect" or shows connected status indicator | - |

### Zapier - Embedded Widget

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Widget loading | Page load | Loading spinner or skeleton while Zapier SDK initializes | - |
| Widget loaded | SDK initialization complete | Full Zapier widget rendered with app logos, search, Zap creation | `integrations-zapier.png` |
| Widget interaction | Click within widget | Third-party controlled interactions (Zap creation, search, configuration) | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Calendar Feed webcal URL | Calendar export URL generation | @beep/calendar-client, @beep/calendar-server | P1 | Generate webcal URL for subscribing to tasks/due dates in external calendar apps |
| Calendar URL copy action | Copy-to-clipboard utility | @beep/calendar-ui | P2 | Read-only input with copy button, confirmation feedback |
| Platform setup instructions | Help/onboarding collapsibles | @beep/customization-ui | P3 | Collapsible instruction sections with links to help articles (Apple, Google, Outlook) |
| API Token generation | API key management | @beep/iam-domain, @beep/iam-server | P1 | Token creation with label, permissions (Read/Write), secure storage |
| API Token table display | API key listing | @beep/iam-ui, @beep/iam-client | P1 | Data table showing label, masked token, permission tags, actions |
| API Token revocation | API key deletion | @beep/iam-client, @beep/iam-server | P1 | Delete/revoke action with confirmation dialog |
| Permission tags | Token permission display | @beep/iam-ui | P2 | Badge/tag components for Read, Write permissions |
| Google Calendar OAuth connect | Google Calendar two-way sync | @beep/integrations-client, @beep/integrations-server | P1 | OAuth2 flow via /auth/google/calendar, two-way sync capability |
| Google Calendar disconnect | OAuth revocation | @beep/integrations-client, @beep/integrations-server | P2 | Revoke Google Calendar connection, stop sync |
| Zapier embedded widget | Third-party integration marketplace | @beep/integrations-client | P3 | Zapier Partner SDK embed for Zap creation/management |
| Integrations sidebar navigation | Settings sub-navigation | @beep/customization-ui | P0 | Expandable sidebar group with sub-items (in-app routes + external links) |
| External help links (Automation, AI Agents) | Help article redirects | @beep/customization-ui | P3 | External links opening in new tab to help center |

## Implementation Notes

- **Components**: shadcn Input (calendar URL, read-only with copy action), Button (Copy, Generate new token, Connect Calendar), Table (API token listing with Label, Token, Permissions, Actions columns), Badge (permission tags: Read, Write), Card (integration overview sections), Collapsible (Apple Calendar, Google Calendar, Microsoft Outlook setup instructions), AlertDialog (token deletion confirmation), Tooltip (copy confirmation feedback)
- **Icons**: Phosphor - CalendarBlank (calendar feed heading/sidebar), GoogleLogo (Google Calendar view), Link (Zapier/integrations context), Key (API token section), Copy (copy URL button), ArrowSquareOut (external help links for Automation and AI Agents), Trash (token delete/revoke action), Plus (generate new token), CaretRight/CaretDown (collapsible toggle for platform instructions), CheckCircle (connected status for Google Calendar), ShieldCheck (permission tags context)
- **State Management**: Calendar URL fetched on page load (generated per-user webcal URL), API token list fetched on page load (array of token objects with label, masked value, permissions), token CRUD operations with optimistic UI for deletion, Google Calendar connection status fetched on page load (connected boolean + account info), Zapier widget state managed entirely by third-party SDK, copy-to-clipboard state with temporary confirmation feedback (2s timeout)
- **API Surface**: GET /api/integrations/calendar-feed (returns webcal URL for current user), GET /api/integrations/calendar-feed/tokens (list API tokens with permissions), POST /api/integrations/calendar-feed/tokens (generate new token with label and permissions), DELETE /api/integrations/calendar-feed/tokens/:id (revoke/delete token), GET /api/integrations/google-calendar/status (connection status), POST /api/integrations/google-calendar/connect (initiate OAuth, returns redirect URL to /auth/google/calendar), DELETE /api/integrations/google-calendar/disconnect (revoke connection), GET /api/integrations/zapier/config (Zapier Partner SDK configuration for embed initialization)
- **Complexity**: Medium-High - three distinct integration patterns coexist under one sidebar group. Calendar Feed combines a static URL display with full CRUD token management (table, generation, revocation, permission assignment). Google Calendar requires OAuth2 redirect flow with callback handling and connection state persistence. Zapier requires third-party SDK initialization and iframe/widget embedding with cross-origin considerations. The API token table introduces the most UI complexity with multi-column data display, badge-based permission rendering, and destructive action confirmation. Each sub-view is a separate route requiring its own data fetching and state management.
