# Connected Accounts

> Captured from: `https://www.taskade.com/settings/sso`
> Screenshots: 2 total (persistent S3 URLs)

## Overview

The Connected Accounts settings view manages third-party authentication and service integrations for the user's Taskade account. It displays three provider rows: Google SSO (for sign-in), Google Contacts (for contact sync), and Apple SSO (for sign-in). Each provider has a distinct interaction pattern: connected providers show a status indicator, while disconnected providers show either a "Connect" link or a toggle switch. This is the third sub-tab under the General settings category.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `connected-accounts-full.png` | Full page with Connected Accounts tab active | [View](https://static.vaultctx.com/notion/taskade-ui-reference/connected-accounts/screenshots/connected-accounts-full.png) |
| `connected-accounts-providers.png` | Provider list detail | [View](https://static.vaultctx.com/notion/taskade-ui-reference/connected-accounts/screenshots/connected-accounts-providers.png) |

## Layout

The page uses the standard 3-column settings layout. The persistent icon sidebar (56px) occupies the left edge. The settings sidebar (~165px) provides category navigation. The main content area contains the page heading ("General"), description text, sub-tab navigation bar with "Connected Accounts" in active state, a section heading, and a vertically stacked list of provider rows. Each provider row is a card-like element with the provider icon/name on the left and the connection status/action on the right.

- **Icon sidebar**: 56px, fixed left
- **Settings sidebar**: ~165px, settings category navigation
- **Main content**: Fills remaining space
- **Sub-tabs**: Horizontal row (Account, Password, Connected Accounts, Sessions)
- **Provider list**: Full-width within main content, 3 rows

### Layout Diagram

```
┌──────┬───────────┬──────────────────────────────────────────────┐
│ Icon │ Settings  │ Main Content                                 │
│ Bar  │ Sidebar   │                                              │
│ 56px │ ~165px    │ H1: "General"                                │
│      │           │ "Connect third-party accounts..."            │
│      │           │                                              │
│      │ General   │ [Account] [Password] [Connected*] [Sessions] │
│      │ Plans     │ ────────────────────────────────────────────  │
│      │ Usage &   │                                              │
│      │  Billing  │ H2: "Connected Accounts"                     │
│      │ Credits   │                                              │
│      │ Integr.▸  │ ┌──────────────────────────────────────────┐ │
│      │ Notifs    │ │ 🔴 Google          Connected (SSO)       │ │
│      │ Archives  │ ├──────────────────────────────────────────┤ │
│      │ Manage ▸  │ │    Google Contacts  [Connect]            │ │
│      │           │ ├──────────────────────────────────────────┤ │
│      │ ──────    │ │    Apple            [Toggle: Off]        │ │
│      │ WORKSPACE │ └──────────────────────────────────────────┘ │
│      │  🟢 Work  │                                              │
└──────┴───────────┴──────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot |
|---|-----------|------|----------|---------------|--------|------------|
| 1 | Page heading | text (H1) | Main content top | "General" | Static | `connected-accounts-full.png` |
| 2 | Page description | text | Below H1 | "Connect third-party accounts for single sign-on and contact synchronization. Learn more." | Static (with "Learn more" link) | `connected-accounts-full.png` |
| 3 | Learn more link | link | Inline in description | "Learn more" | Default, hover | `connected-accounts-full.png` |
| 4 | Sub-tab: Account | tab-link | Sub-tab row | "Account" | Inactive | `connected-accounts-full.png` |
| 5 | Sub-tab: Password | tab-link | Sub-tab row | "Password" | Inactive | `connected-accounts-full.png` |
| 6 | Sub-tab: Connected Accounts | tab-link | Sub-tab row | "Connected Accounts" | Active (selected) | `connected-accounts-full.png` |
| 7 | Sub-tab: Sessions | tab-link | Sub-tab row | "Sessions" | Inactive | `connected-accounts-full.png` |
| 8 | Section heading | text (H2) | Main content | "Connected Accounts" | Static | `connected-accounts-full.png`, `connected-accounts-providers.png` |
| 9 | Google SSO row | card-row | Provider list, row 1 | Google icon + "Google" label | Connected (red dot indicator) | `connected-accounts-providers.png` |
| 10 | Google SSO status indicator | badge/dot | Row 1, right side | Red dot / "Connected" | Connected | `connected-accounts-providers.png` |
| 11 | Google Contacts row | card-row | Provider list, row 2 | Google Contacts icon + "Google Contacts" label | Not connected | `connected-accounts-providers.png` |
| 12 | Google Contacts Connect link | link/button | Row 2, right side | "Connect" | Default, hover, loading | `connected-accounts-providers.png` |
| 13 | Apple SSO row | card-row | Provider list, row 3 | Apple icon + "Apple" label | Not connected | `connected-accounts-providers.png` |
| 14 | Apple SSO toggle | toggle-switch | Row 3, right side | Toggle switch (off position) | Off, hover, on (connected) | `connected-accounts-providers.png` |

## Interactive States

### Sub-tab Navigation

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Connected Accounts active | Click "Connected Accounts" tab | Tab highlighted/underlined, route changes to /settings/sso | `connected-accounts-full.png` |
| Account inactive | Default when on Connected Accounts | No highlight, clickable | `connected-accounts-full.png` |
| Password inactive | Default when on Connected Accounts | No highlight, clickable | `connected-accounts-full.png` |
| Sessions inactive | Default when on Connected Accounts | No highlight, clickable | `connected-accounts-full.png` |

### Provider Connection States

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Google SSO connected | Previously authenticated via Google | Red dot indicator visible, no disconnect action visible | `connected-accounts-providers.png` |
| Google Contacts disconnected | Default (not yet connected) | "Connect" link displayed, navigates to /auth/google/people | `connected-accounts-providers.png` |
| Google Contacts connecting | Click "Connect" | Redirects to Google OAuth consent screen | - |
| Google Contacts connected | After OAuth success | Status changes to connected indicator, "Connect" becomes "Disconnect" | - |
| Apple SSO disconnected | Default (not yet connected) | Toggle switch in off position | `connected-accounts-providers.png` |
| Apple SSO connecting | Toggle switch on | Redirects to Apple sign-in flow (/auth/apple) | - |
| Apple SSO connected | After Apple auth success | Toggle switch in on position, connected indicator | - |

### Provider Row Interactions

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Row hover | Mouse over provider row | Subtle background highlight on card row | - |
| Connect hover | Hover over "Connect" link | Link underline or color change | - |
| Toggle hover | Hover over Apple toggle | Toggle gains hover emphasis | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | None captured | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Google SSO connection | OAuth provider link | @beep/iam-client | P1 | Google OAuth2 integration via better-auth |
| Google Contacts sync | Contact import | @beep/integrations-client | P3 | Google People API integration for contact sync |
| Apple SSO connection | Apple sign-in link | @beep/iam-client | P2 | Apple OAuth integration via better-auth |
| SSO status indicator | Connection status display | @beep/iam-ui | P1 | Visual indicator for connected/disconnected state |
| Connect/Disconnect actions | OAuth flow trigger | @beep/iam-client | P1 | Initiate/revoke third-party OAuth connections |
| Provider list display | Connected accounts list | @beep/iam-ui | P1 | List of available SSO providers with status |
| Sub-tab navigation | Settings sub-navigation | @beep/customization-ui | P1 | Shared tab component across General settings |

## Implementation Notes

- **Components**: shadcn `Card` (provider row containers), `Badge` or custom dot indicator (connection status), `Button` variant="link" (Connect action), `Switch` (Apple toggle), `Tabs` (sub-tab navigation), `Avatar` or icon slot (provider logos)
- **Icons**: Phosphor - `GoogleLogo` (Google SSO), `AddressBook` (Google Contacts), `AppleLogo` (Apple SSO), `Link` / `LinkBreak` (connect/disconnect), `CheckCircle` (connected status), `Circle` (disconnected status)
- **State Management**: Provider connection status fetched on page load (array of connected provider IDs), optimistic toggle for Apple switch, redirect flow for Google OAuth (leaves app, returns via callback), connection status polling or refetch after OAuth callback return
- **API Surface**: `GET /auth/providers` (list available providers with connection status), `POST /auth/connect/:provider` (initiate OAuth flow, returns redirect URL), `DELETE /auth/disconnect/:provider` (revoke provider connection), `GET /auth/callback/:provider` (OAuth callback handler). Better-auth handles OAuth flow internally
- **Complexity**: Low-Medium - three static provider rows with binary connected/disconnected state. Primary complexity is the OAuth redirect flow (leaving the app, handling callback return) and the three different interaction patterns per provider (status-only, link, toggle). No forms or data entry required
