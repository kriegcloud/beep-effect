# Password Settings

> Captured from: `https://www.taskade.com/settings/password`
> Screenshots: 3 total (persistent S3 URLs)

## Overview

The Password Settings view is the security management page within Taskade's General settings. It provides four distinct sections for account security: changing the account password, configuring multi-factor authentication, generating personal access tokens for API interaction, and managing OAuth2 applications. The page uses a vertically stacked form layout with horizontal rule separators between each section, each containing a heading, description, and one or more input fields with a primary action button.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `password-full.png` | Full page with Password tab active | [View](https://static.vaultctx.com/notion/taskade-ui-reference/password/screenshots/password-full.png) |
| `password-form.png` | Change Password form detail | [View](https://static.vaultctx.com/notion/taskade-ui-reference/password/screenshots/password-form.png) |
| `password-lower-sections.png` | Page scrolled showing MFA, Access Tokens, OAuth sections | [View](https://static.vaultctx.com/notion/taskade-ui-reference/password/screenshots/password-lower-sections.png) |

## Layout

The page uses the standard 3-column settings layout. The icon sidebar (56px) sits at the far left, followed by the settings sidebar (~165px) with navigation links, and the main content area fills the remaining width. The main content area is headed by "General" with a description linking to security help docs. Four sub-tabs sit below the heading (Account, Password, Connected Accounts, Sessions) with "Password" in active state. Below the tabs, four form sections stack vertically, each separated by a horizontal rule. Each section follows a consistent pattern: H2 heading, descriptive paragraph, input field(s), and a primary action button.

### Layout Diagram

```
┌──────┬───────────┬──────────────────────────────────────────────┐
│ Icon │ Settings  │ Main Content                                 │
│ Bar  │ Sidebar   │                                              │
│ 56px │ ~165px    │ H1: "General"                                │
│      │           │ "Manage passwords, two-factor..."            │
│      │           │                                              │
│      │           │ [Account] [Password*] [Connected] [Sessions] │
│      │           │ ────────────────────────────────────────────  │
│      │           │                                              │
│      │           │ H2: "Change Password"                        │
│      │           │ "Make sure it's at least 6 characters."      │
│      │           │ ┌──────────────────────────┐                 │
│      │           │ │ Current Password          │                 │
│      │           │ ├──────────────────────────┤                 │
│      │           │ │ New Password              │                 │
│      │           │ ├──────────────────────────┤                 │
│      │           │ │ Confirm Password          │                 │
│      │           │ └──────────────────────────┘                 │
│      │           │ [Update]                                     │
│      │           │ ────────────────────────────────────────────  │
│      │           │                                              │
│      │           │ H2: "Multi-Factor Authentication"            │
│      │           │ "Multi-factor authentication enhances..."    │
│      │           │ [Configure]                                  │
│      │           │ ────────────────────────────────────────────  │
│      │           │                                              │
│      │           │ H2: "Personal Access Tokens"                 │
│      │           │ "Generate personal access tokens..."         │
│      │           │ ┌──────────────────────────┐                 │
│      │           │ │ Token name                │                 │
│      │           │ └──────────────────────────┘                 │
│      │           │ [Generate Token]                             │
│      │           │ ────────────────────────────────────────────  │
│      │           │                                              │
│      │           │ H2: "OAuth2 Applications"                    │
│      │           │ "You can manage your OAuth2 apps here."      │
│      │           │ [Create]                                     │
│      │           │                                              │
└──────┴───────────┴──────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot |
|---|-----------|------|----------|---------------|--------|------------|
| 1 | Page heading | text (H1) | Top of main content | "General" | Static | `password-full.png` |
| 2 | Page description | text | Below H1 | "Manage passwords, two-factor authentication, and API access tokens. Learn more." | Static, "Learn more" is a link | `password-full.png` |
| 3 | Sub-tab: Account | tab-link | Below description | "Account" | Default, hover | `password-full.png` |
| 4 | Sub-tab: Password | tab-link | Below description | "Password" | Active (selected) | `password-full.png` |
| 5 | Sub-tab: Connected Accounts | tab-link | Below description | "Connected Accounts" | Default, hover | `password-full.png` |
| 6 | Sub-tab: Sessions | tab-link | Below description | "Sessions" | Default, hover | `password-full.png` |
| 7 | Section heading: Change Password | text (H2) | Section 1 | "Change Password" | Static | `password-full.png`, `password-form.png` |
| 8 | Section description | text | Section 1 | "Make sure it's at least 6 characters." | Static | `password-full.png`, `password-form.png` |
| 9 | Current Password input | input (password) | Section 1 | "Current Password" | Empty, filled, error | `password-form.png` |
| 10 | New Password input | input (password) | Section 1 | "New Password" | Empty, filled, error, validation (<6 chars) | `password-form.png` |
| 11 | Confirm Password input | input (password) | Section 1 | "Confirm Password" | Empty, filled, error (mismatch) | `password-form.png` |
| 12 | Update button | button (primary/green) | Section 1 | "Update" | Default, hover, loading, disabled | `password-form.png` |
| 13 | Section heading: MFA | text (H2) | Section 2 | "Multi-Factor Authentication" | Static | `password-lower-sections.png` |
| 14 | MFA description | text | Section 2 | "Multi-factor authentication enhances your account security by introducing an extra verification step during login." | Static | `password-lower-sections.png` |
| 15 | Configure button | button (primary/green) | Section 2 | "Configure" | Default, hover | `password-lower-sections.png` |
| 16 | Section heading: Personal Access Tokens | text (H2) | Section 3 | "Personal Access Tokens" | Static | `password-lower-sections.png` |
| 17 | Tokens description | text | Section 3 | "Generate personal access tokens to authenticate and interact securely with the Taskade API." | Static | `password-lower-sections.png` |
| 18 | Token name input | input (text) | Section 3 | "Token name" | Empty, filled | `password-lower-sections.png` |
| 19 | Generate Token button | button (primary/green) | Section 3 | "Generate Token" | Default, hover, loading | `password-lower-sections.png` |
| 20 | Section heading: OAuth2 Applications | text (H2) | Section 4 | "OAuth2 Applications" | Static | `password-lower-sections.png` |
| 21 | OAuth2 description | text | Section 4 | "You can manage your OAuth2 applications here." | Static | `password-lower-sections.png` |
| 22 | Create button | button (primary/green) | Section 4 | "Create" | Default, hover | `password-lower-sections.png` |

## Interactive States

### Sub-tab Navigation

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Password tab active | Default / click | "Password" tab visually highlighted, content shows password sections | `password-full.png` |
| Account tab | Click "Account" | Navigates to /settings, shows account profile settings | - |
| Connected Accounts tab | Click "Connected Accounts" | Navigates to /settings/sso, shows SSO providers | - |
| Sessions tab | Click "Sessions" | Navigates to /settings/sessions, shows active sessions | - |

### Change Password Form

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| Empty form | Default | Three empty password inputs, Update button enabled | `password-form.png` |
| Filled form | User types in all 3 fields | Masked password dots visible in fields | - |
| Validation error: short password | New password < 6 chars | Error message below New Password field | - |
| Validation error: mismatch | Confirm differs from New | Error message below Confirm Password field | - |
| Submitting | Click "Update" with valid inputs | Button shows loading state, inputs may disable | - |
| Success | Server confirms update | Success toast/notification | - |
| Error | Server rejects (wrong current password) | Error message displayed | - |

### Multi-Factor Authentication

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| MFA not configured | Default | "Configure" button shown | `password-lower-sections.png` |
| MFA setup initiated | Click "Configure" | Opens MFA setup modal/flow (QR code, verification code entry) | - |
| MFA enabled | After successful setup | Section may show "Enabled" status, button changes to "Disable" or "Reconfigure" | - |

### Personal Access Tokens

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| No tokens | Default | Empty token name input, "Generate Token" button | `password-lower-sections.png` |
| Token generated | Click "Generate Token" with name | Newly generated token displayed (likely shown once), token list may appear below | - |
| Token list | After tokens exist | List of existing tokens with revoke/delete actions | - |

### OAuth2 Applications

| State | Trigger | Visual Change | Screenshot |
|-------|---------|---------------|------------|
| No apps | Default | "Create" button only | `password-lower-sections.png` |
| Create app | Click "Create" | Opens form/modal for OAuth2 app registration (client ID, redirect URIs) | - |
| App list | After apps created | List of registered OAuth2 apps with edit/delete actions | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | None captured | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Change Password form | Password update | @beep/iam-client | P0 | Core security feature, requires current password verification |
| Multi-Factor Authentication | MFA/TOTP setup | @beep/iam-client | P1 | TOTP-based second factor via better-auth MFA plugin |
| Personal Access Tokens | API token management | @beep/iam-client | P2 | Token CRUD for API authentication, backed by better-auth |
| OAuth2 Applications | OAuth2 app registry | @beep/iam-server | P3 | OAuth2 provider functionality, lower priority for MVP |
| Sub-tab navigation | Settings tab routing | @beep/iam-ui | P0 | Tab-based navigation within settings, Next.js App Router segments |
| Security help link | External docs link | @beep/shared-ui | P3 | "Learn more" link to help documentation |

## Implementation Notes

- **Components**: shadcn `Input` (type="password"), `Button` (primary variant for Update/Configure/Generate Token/Create), `Tabs` or custom sub-tab navigation, `Separator` (horizontal rules between sections), `Label` for form field labels, `Card` or section containers for each logical group, `Dialog` for MFA setup modal
- **Icons**: Phosphor - `Lock` (password fields), `ShieldCheck` (MFA section), `Key` (access tokens), `Code` (OAuth2), `Eye`/`EyeSlash` (password visibility toggle if implemented)
- **State Management**: Password form state (3 controlled inputs with validation), MFA configuration state (enabled/disabled, setup flow step), token list state (array of generated tokens), OAuth2 app list state. Form validation for password length (min 6) and confirmation match. All mutations via TanStack Query `useMutation`
- **API Surface**: `POST /auth/change-password` (better-auth endpoint), `POST /auth/mfa/enable` and `POST /auth/mfa/verify` (MFA setup), `POST /auth/tokens` and `DELETE /auth/tokens/:id` (token CRUD), `POST /auth/oauth2/apps` and `GET /auth/oauth2/apps` (OAuth2 app management). All backed by better-auth with Effect RPC layer
- **Complexity**: Medium - four independent form sections with straightforward CRUD patterns. Password change is a simple 3-field form. MFA adds complexity with the QR code setup flow. Token generation is a single-field create with list display. OAuth2 app management is standard CRUD. No complex client-side state interactions between sections
