# Account Settings

> Captured from: `https://www.taskade.com/settings`
> Screenshots: 5 total (persistent S3 URLs)

## Overview

The Account Settings view is the primary profile management page within Taskade's settings area. It allows users to update their profile photo, username, full name, email, timezone, time format, start-of-week preference, and language. Below the profile form, a destructive "Delete Account" section requires email confirmation before permanently removing the user's account and all associated data. The page is accessed via the Settings gear icon in the sidebar and defaults to the "Account" sub-tab under the "General" settings category.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `account-full.png` | Full page with Account tab active | [View](https://static.vaultctx.com/notion/taskade-ui-reference/account/screenshots/account-full.png) |
| `settings-sidebar.png` | Settings sidebar cropped view | [View](https://static.vaultctx.com/notion/taskade-ui-reference/account/screenshots/settings-sidebar.png) |
| `account-subtabs.png` | Sub-tab navigation bar (Account, Password, Connected Accounts, Sessions) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/account/screenshots/account-subtabs.png) |
| `account-form.png` | Profile form with all fields | [View](https://static.vaultctx.com/notion/taskade-ui-reference/account/screenshots/account-form.png) |
| `account-delete-section.png` | Page scrolled to show Delete Account section | [View](https://static.vaultctx.com/notion/taskade-ui-reference/account/screenshots/account-delete-section.png) |

## Layout

The Account Settings view uses a 3-column layout. The persistent icon sidebar (56px) anchors the left edge. A settings-specific sidebar (~165px) provides category navigation (General, Plans, Usage & Billing, etc.). The main content area fills the remaining width and contains a horizontal sub-tab bar at the top, the page heading and description, a two-column profile form, and a destructive delete section at the bottom separated by a horizontal rule.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: Fills remaining space, vertically scrollable
- **Form layout**: Two-column within main content (photo left, fields right)
- **Delete section**: Full-width below form, separated by horizontal rule

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo] / Settings                              [🔔] [👤]          │  48px navbar
├──────┬──────────┬──────────────────────────────────────────────────┤
│  🔍  │ General  │  [Account] [Password] [Connected] [Sessions]   │
│  🕐  │ Plans    │                                                 │
│  👥  │ Usage &  │  General                                        │
│      │  Billing │  Update your profile, display name, timezone,   │
│  🟢  │ Credits  │  and language preferences. Learn more.          │
│  ＋  │ Integr.▸ │                                                 │
│      │ Notifs   │  ┌──────────┬────────────────────────────────┐  │
│      │ Archives │  │ [Avatar] │  Username: [benjamintoppold]   │  │
│  📝  │ Manage ▸ │  │  Upload  │  Full name: [Benjamin Oppold]  │  │
│  📅  │          │  │  Photo   │  Email: [benjamintoppold@...]   │  │
│  ⭐  │ ──────── │  │          │  Time zone: [America/Chicago ▾]│  │
│  ⊕   │ WORKSPACE│  │          │  Time format: [Browser Def. ▾] │  │
│      │  🟢 Work │  │          │  Start of week: [Sunday ▾]     │  │
│  ▲   │          │  │          │  Language: [Browser Default ▾]  │  │
│  📢  │          │  └──────────┴────────────────────────────────┘  │
│  ❓  │          │                              [Update]           │
│  ⚙   │          │  ──────────────────────────────────────────     │
│      │          │  Delete Account                                 │
│ 56px │  ~165px  │  Confirm Email: [________________]              │
│      │          │                        [Delete Account]         │
└──────┴──────────┴──────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (highlighted), expandable groups (Integrations, Manage) | `settings-sidebar.png`, `account-full.png` |
| 2 | Sub-tab: Account | tab | Top of main content | "Account" | Active (selected, underlined) | `account-subtabs.png`, `account-full.png` |
| 3 | Sub-tab: Password | tab-link | Top of main content | "Password" | Default, hover | `account-subtabs.png` |
| 4 | Sub-tab: Connected Accounts | tab-link | Top of main content | "Connected Accounts" | Default, hover | `account-subtabs.png` |
| 5 | Sub-tab: Sessions | tab-link | Top of main content | "Sessions" | Default, hover | `account-subtabs.png` |
| 6 | Page heading | heading (H1) | Main content | "General" | Static | `account-full.png`, `account-form.png` |
| 7 | Page description | text | Below heading | "Update your profile, display name, timezone, and language preferences. Learn more." | Static (with "Learn more" link) | `account-full.png`, `account-form.png` |
| 8 | Profile photo | avatar-upload | Form, left column | Green Taskade avatar image, "Upload Photo" overlay | Default (shows current photo), hover (shows "Upload Photo" overlay) | `account-form.png`, `account-full.png` |
| 9 | Username | text-input | Form, right column | "benjamintoppold" | Default (filled), focused, error | `account-form.png`, `account-full.png` |
| 10 | Full name | text-input | Form, right column | "Benjamin Oppold" | Default (filled), focused, error | `account-form.png`, `account-full.png` |
| 11 | Email | text-input | Form, right column | "benjamintoppold@gmail.com" | Default (filled), focused, error | `account-form.png`, `account-full.png` |
| 12 | Time zone | dropdown | Form, right column | "America/Chicago (GMT-06:00)" | Default (closed), open (timezone list), selected | `account-form.png`, `account-full.png` |
| 13 | Time format | dropdown | Form, right column | "Browser Default" | Default (closed), open (format options), selected | `account-form.png`, `account-full.png` |
| 14 | Start of the week | dropdown/button | Form, right column | "Sunday (Browser Default)" | Default (closed), open (day options), selected | `account-form.png`, `account-full.png` |
| 15 | Language | dropdown | Form, right column | "Browser Default" | Default (closed), open (language list), selected | `account-form.png`, `account-full.png` |
| 16 | Update button | button (primary) | Below form | "Update" | Default (green/primary), hover, loading/submitting, disabled (no changes) | `account-form.png`, `account-full.png` |
| 17 | Delete Account heading | heading (H2) | Delete section | "Delete Account" | Static | `account-delete-section.png` |
| 18 | Delete warning text | text | Delete section | "Deleting your account and all associated data is permanent and cannot be undone. Learn more." | Static (with "Learn more" link) | `account-delete-section.png` |
| 19 | Delete label | text | Delete section | "Delete your account and account data" | Static | `account-delete-section.png` |
| 20 | Confirm email input | text-input | Delete section | Empty with placeholder | Default (empty), filled, error (mismatch) | `account-delete-section.png` |
| 21 | Delete Account button | button (destructive) | Delete section | "Delete Account" | Disabled (email empty/mismatch), enabled (email matches), hover, loading | `account-delete-section.png` |
| 22 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `account-full.png` |
| 23 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `account-full.png` |
| 24 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `account-full.png` |
| 25 | User avatar | icon-button | Navbar far right | User avatar/initials | Default, hover | `account-full.png` |

## Interactive States

### Sub-tab Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Account active | Default / click Account | Underline indicator, bold text | `account-subtabs.png` |
| Password | Click "Password" | Navigates to /settings/password, Password tab underlined | - |
| Connected Accounts | Click "Connected Accounts" | Navigates to /settings/sso, Connected Accounts tab underlined | - |
| Sessions | Click "Sessions" | Navigates to /settings/sessions, Sessions tab underlined | - |

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| General active | Default | Highlighted/bold in sidebar list | `settings-sidebar.png` |
| Integrations expanded | Click "Integrations" | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | `settings-sidebar.png` |
| Manage expanded | Click "Manage" | Reveals sub-items: Workspaces, Activate | `settings-sidebar.png` |
| Other item hover | Hover over sidebar item | Background highlight | - |

### Dropdown Menus

| Dropdown | Options | Default Value | Screenshot ID |
|----------|---------|---------------|---------------|
| Time zone | Full IANA timezone list (e.g., America/New_York, Europe/London, Asia/Tokyo, ...) | America/Chicago (GMT-06:00) | `account-form.png` |
| Time format | Browser Default, 12-hour, 24-hour | Browser Default | `account-form.png` |
| Start of the week | Sunday (Browser Default), Monday, Saturday | Sunday (Browser Default) | `account-form.png` |
| Language | Browser Default, English, Spanish, French, German, ... | Browser Default | `account-form.png` |

### Form Submission

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Clean (no changes) | Page load | Update button default | `account-form.png` |
| Dirty (changes made) | Edit any field | Update button may highlight | - |
| Submitting | Click "Update" | Button shows loading state | - |
| Success | Successful save | Toast/notification confirming update | - |
| Validation error | Invalid input | Error message below field, field highlighted red | - |

### Delete Account Flow

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Confirm email empty, Delete button disabled (red but inactive) | `account-delete-section.png` |
| Email entered (mismatch) | Type non-matching email | Delete button remains disabled | - |
| Email entered (match) | Type matching account email | Delete button becomes enabled (active red) | - |
| Confirm deletion | Click enabled Delete button | Possible confirmation dialog before permanent deletion | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Profile photo upload | Avatar upload | @beep/iam-client, @beep/iam-ui | P1 | File upload to S3, image cropping optional |
| Username field | Username management | @beep/iam-domain, @beep/iam-server | P0 | Unique constraint, validation rules |
| Full name field | Display name | @beep/iam-domain, @beep/iam-server | P0 | Basic profile field |
| Email field | Email management | @beep/iam-domain, @beep/iam-server | P0 | May require verification on change |
| Time zone selector | User timezone preference | @beep/customization-domain | P1 | IANA timezone database, affects date display |
| Time format selector | Time format preference | @beep/customization-domain | P2 | 12h/24h/browser default |
| Start of week selector | Week start preference | @beep/customization-domain | P2 | Affects calendar rendering |
| Language selector | Locale/i18n preference | @beep/customization-domain | P2 | i18n integration |
| Update profile button | Save profile mutation | @beep/iam-client | P0 | Form validation + API call |
| Delete account | Account deletion flow | @beep/iam-server, @beep/iam-client | P1 | Email confirmation guard, cascading data deletion |
| Settings sidebar | Settings navigation | @beep/customization-ui | P0 | Persistent navigation for all settings views |
| Sub-tab navigation | Settings sub-routing | @beep/customization-ui | P0 | Tab-based navigation within General settings |

## Implementation Notes

- **Components**: shadcn Tabs (sub-tab navigation), Input (username, name, email, confirm email fields), Select/Combobox (timezone, time format, start of week, language dropdowns), Button (Update primary, Delete Account destructive), Avatar (profile photo display), Separator (between form and delete section), NavigationMenu (settings sidebar)
- **Icons**: Phosphor - GearSix (settings breadcrumb), Bell (notification), User/UserCircle (avatar), CaretDown (dropdown indicators), Trash (delete account section contextual), Upload (photo upload overlay)
- **State Management**: Form state (dirty tracking for 7+ fields), file upload state (avatar preview before save), delete confirmation state (email match validation), active sub-tab routing, settings sidebar active item and expand/collapse state for Integrations and Manage groups
- **API Surface**: GET /api/user/profile (load current profile), PATCH /api/user/profile (update profile fields), POST /api/user/avatar (upload profile photo), DELETE /api/user/account (delete account with email confirmation), GET /api/timezones (timezone list if dynamic)
- **Complexity**: Medium - standard CRUD form with multiple field types, the main complexity lies in the delete account flow (email confirmation guard, cascading deletion), avatar upload with preview, and timezone dropdown which requires a large searchable list of IANA timezones
