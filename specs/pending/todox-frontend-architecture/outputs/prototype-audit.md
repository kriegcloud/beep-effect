# Prototype Audit: TodoX `page.tsx` and Extracted Components

> Comprehensive audit of the 1,381-line prototype at `apps/todox/src/app/app-layout/page.tsx` and all existing extracted component directories. This document provides the ground truth for implementation agents performing decomposition.

**Audited file:** `apps/todox/src/app/app-layout/page.tsx` (1,381 lines)

**Audited component directories:**
- `apps/todox/src/components/mini-sidebar/` (2 files)
- `apps/todox/src/components/navbar/` (5 files)
- `apps/todox/src/components/sidebar/` (7 files)
- `apps/todox/src/components/side-panel/` (2 files)
- `apps/todox/src/components/ui/resizable.tsx`

---

## 1. page.tsx Section Map

The entire file is a single `Page` component rendering a static Taskade-style settings page prototype. It contains zero interactivity -- purely static HTML with inline SVGs and hardcoded data. No useState, no useEffect, no event handlers.

| Section | Lines | Description |
|---------|-------|-------------|
| Imports and StyledAvatar | 1--8 | MUI `styled` import, `assetPaths` import, `StyledAvatar` styled-component |
| Outer Shell | 10--13 | Full viewport container (`flex h-dvh w-dvw flex-col`) |
| Header/Navbar | 14--160 | Top bar: logo, breadcrumb separator, settings link, notification bell, user avatar |
| Body Container | 161--163 | Main area below navbar |
| Overlay Panel (hidden) | 164--171 | Left-side overlay with `opacity: 0, width: 0` -- invisible |
| Mini Sidebar | 172--567 | 50px-wide left icon strip: nav icons, workspace avatar, utility buttons |
| Main Content Container | 569--1373 | Content area with portal roots, rounded border, orb backdrop |
| Settings Sidebar | 596--1289 | 200px-wide settings navigation (General, Plans, Usage, etc.) |
| Content Area Header | 1295--1323 | 40px sub-header with hamburger menu button |
| Content Area Body | 1324--1364 | "General" heading, description, tab strip, "beep" placeholder |
| Portal Roots | 573--578, 1369--1371 | Three portal root divs |

### Detailed Breakdown

**Header/Navbar (lines 14--160)**
- Orb backdrop divs (lines 15--18)
- Logo image linking to `/` (lines 26--42)
- Breadcrumb slash SVG separator (lines 44--60)
- Settings gear icon (complex custom SVG with `fillRule="evenodd"`) + "Settings" text link (lines 61--83)
- Notification bell button with Lucide SVG (lines 86--111)
- User avatar button with bug/insect SVG (lines 113--157), hardcoded username "benjamintoppold"

**Mini Sidebar (lines 172--567)**
Three vertical zones within a 50px strip:
- Top nav (lines 188--258): Search, Clock/Recent, Shared/People icons
- Workspace section (lines 262--337): Workspace avatar using MUI `StyledAvatar` with gradient, plus/add button, react-beautiful-dnd drag attributes
- Bottom utilities (lines 339--563): My Tasks, Calendar, Star, Check+Plus composite icon, Chevron-up toggle, What's New megaphone, Help question-circle, Settings gear (duplicate)

**Settings Sidebar (lines 596--1289)**
- Mobile collapsible "General" group with sub-items (lines 614--761): Account, Password, Connected Accounts, Sessions -- `block sm:hidden`
- Desktop nav items (lines 762--1289): General (active), Plans, Usage & Billing, Credits & Rewards, Integrations (expandable, sub-items commented out), Notifications, Archives, Manage (expandable, sub-items commented out), Workspace Settings header, Workspace link with avatar

**Content Area (lines 1292--1367)**
- Sub-header with hamburger toggle (lines 1295--1323)
- "General" h1 heading and description with Taskade help link (lines 1326--1339)
- Tab strip using `AccountTabs__StyledNavLink` CSS classes: Account, Password, Connected Accounts, Sessions (lines 1340--1357)
- Placeholder "beep" text (line 1361)

---

## 2. Inline SVGs

### Count Summary

| Category | Active | Commented Out | Total |
|----------|--------|---------------|-------|
| Lucide-class stroke SVGs | 21 | 10 | 31 |
| Custom filled SVGs (`fillRule="evenodd"`) | 7 | 0 | 7 |
| Iconify-class SVGs | 2 | 0 | 2 |
| **Total** | **30** | **10** | **40** |

### Complete Active SVG Inventory

| # | Start Line | CSS Class | Represents | Custom? | Phosphor Replacement |
|---|-----------|-----------|------------|---------|---------------------|
| 1 | 45 | `lucide lucide-slash` | Breadcrumb separator | No | Use `/` text or `SlashForward` |
| 2 | 67 | (none, filled) | Settings gear | Yes (`fillRule="evenodd"`, complex path) | `GearSix` |
| 3 | 93 | `lucide lucide-bell` | Notification bell | No | `Bell` |
| 4 | 132 | `iconify iconify--lucide` | Bug/insect avatar | No | `Bug` |
| 5 | 196 | `lucide lucide-search` | Search | No | `MagnifyingGlass` |
| 6 | 221 | `lucide lucide-clock` | Recent/Clock | No | `Clock` |
| 7 | 246 | (none, filled) | Shared/People | Yes (`fillRule="evenodd"`) | `UsersThree` |
| 8 | 320 | (none, filled) | Plus/Add | Yes (`fillRule="evenodd"`) | `Plus` |
| 9 | 363 | `lucide lucide-square-check-big` | My Tasks | No | `CheckSquare` |
| 10 | 386 | `lucide lucide-calendar` | Calendar | No | `Calendar` |
| 11 | 415 | `lucide lucide-star` | Favorites | No | `Star` |
| 12 | 439 | (none, filled, 4 paths) | Check+Plus composite | Yes (`fillRule="evenodd"` x4) | `ListChecks` or `CheckCircle` |
| 13 | 473 | `lucide lucide-chevron-up` | Collapse chevron | No | `CaretUp` |
| 14 | 502 | (none, filled) | Megaphone/What's New | Yes (`fillRule="evenodd"`) | `Megaphone` |
| 15 | 526 | (none, filled) | Help/Question circle | Yes (`fillRule="evenodd"`) | `Question` |
| 16 | 547 | (none, filled) | Settings gear (duplicate of #2) | Yes (`fillRule="evenodd"`) | `GearSix` |
| 17 | 620 | `lucide lucide-user` | User (mobile General, h-5) | No | `User` |
| 18 | 642 | `lucide lucide-chevron-down` | Expand chevron (mobile) | No | `CaretDown` |
| 19 | 670 | `lucide lucide-user` | User (Account sub, h-4) | No | `User` |
| 20 | 695 | `lucide lucide-key` | Key (Password sub) | No | `Key` |
| 21 | 721 | `lucide lucide-link` | Link (Connected Accounts sub) | No | `Link` |
| 22 | 742 | `lucide lucide-shield` | Shield (Sessions sub) | No | `Shield` |
| 23 | 768 | `lucide lucide-user` | User (desktop General, h-5) | No | `User` |
| 24 | 794 | `lucide lucide-rocket` | Rocket (Plans) | No | `Rocket` |
| 25 | 822 | `lucide lucide-chart-no-axes-combined` | Chart (Usage & Billing) | No | `ChartLineUp` |
| 26 | 848 | `lucide lucide-gift` | Gift (Credits & Rewards) | No | `Gift` |
| 27 | 882 | `lucide lucide-plug` | Plug (Integrations) | No | `Plug` |
| 28 | 902 | `lucide lucide-chevron-down` | Expand chevron (Integrations) | No | `CaretDown` |
| 29 | 1099 | `lucide lucide-bell` | Bell (Notifications) | No | `Bell` |
| 30 | 1123 | `lucide lucide-archive` | Archive (Archives) | No | `Archive` |
| 31 | 1153 | `lucide lucide-settings` | Settings gear (Manage) | No | `GearSix` |
| 32 | 1175 | `lucide lucide-chevron-down` | Expand chevron (Manage) | No | `CaretDown` |
| 33 | 1303 | `iconify iconify--lucide` | Hamburger menu (3 lines) | No | `List` |

### Commented-Out SVGs (lines 918--1254)

All 10 are inside two commented-out collapsible sections:
- `lucide-calendar` x2 (Calendar Feed, Google Calendar)
- `lucide-zap` (Zapier)
- `lucide-workflow` (Automation)
- `lucide-bot` (AI Agents)
- `lucide-external-link` (View All)
- `lucide-building` (Workspaces)
- `lucide-rocket` (Activate)

---

## 3. Hardcoded Mock Data

### User Data

| Value | Line(s) | Context |
|-------|---------|---------|
| `"benjamintoppold"` | 128, 130 | User avatar `title` and `aria-label` |

### Workspace/Space Data

| Value | Line(s) | Context |
|-------|---------|---------|
| `"spaces.6320446@Yufy1godJk9Yddwv"` | 281, 285 | Drag-n-drop draggable/handle IDs |
| `"/spaces/Yufy1godJk9Yddwv"` | 291 | Workspace link href |
| `"/settings/manage/Yufy1godJk9Yddwv"` | 1265 | Workspace settings link |
| `"Workspace"` | 302, 1279, 1261, 1284 | Workspace name text and alt text |
| `assetPaths.logo` | 301, 1278 | Workspace avatar image src |

### Hardcoded IDs

| Value | Line(s) | Context |
|-------|---------|---------|
| `"radix-:rm:"` | 115 | Hardcoded radix ID on user avatar div |
| `"radix-:rf:"` | 521 | Hardcoded radix ID on help button |
| `"rbd-hidden-text-0-hidden-text-0"` | 284 | react-beautiful-dnd hidden text ID |

### Navigation Labels (all inline strings)

Settings nav: General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings

Mini sidebar nav hrefs: `/search`, `/recent`, `/shared`, `/my-tasks`, `/calendar`, `/lists/starred`

Settings sub-nav: Account, Password, Connected Accounts, Sessions

Settings hrefs: `/settings`, `/settings/plans`, `/settings/usage`, `/settings/credits`, `/settings/notifications`, `/settings/archives`, `/settings/password`, `/settings/sso`, `/settings/sessions`, `/settings/manage`

### External URLs (Taskade leftovers)

| URL | Line |
|-----|------|
| `https://help.taskade.com/en/articles/8958467-getting-started-with-automation` | 1003 |
| `https://help.taskade.com/en/articles/8958457-custom-ai-agents` | 1038 |
| `https://help.taskade.com/en/articles/8958487-account-settings` | 1336 |

### Placeholder Content

| Value | Line | Context |
|-------|------|---------|
| `"beep"` | 1361 | Placeholder body content |

---

## 4. MUI Imports/Usage

### Import

| Import | Line | Status |
|--------|------|--------|
| `import { styled } from "@mui/material/styles"` | 2 | **Active** |

### Usage

| Usage | Line(s) | Description |
|-------|---------|-------------|
| `const StyledAvatar = styled("div")\`...\`` | 6--8 | Creates gradient-background div for workspace avatar |
| `<StyledAvatar>` | 294--306 | Renders the workspace avatar in mini sidebar |

**Note:** This is the only MUI usage in the entire file. The `styled` call creates a `div` with `background: linear-gradient(135deg, rgb(40, 164, 40) 0%, rgb(71, 195, 122) 100%)`. This can be trivially replaced with Tailwind: `bg-gradient-to-br from-green-600 to-green-400` or inline style.

### Dead Styled-Components CSS Classes

These class names appear in the JSX but have no corresponding CSS definitions (they are artifacts from Taskade's styled-components build):

| Class | Line(s) | Origin |
|-------|---------|--------|
| `sc-dPKAra iuIVrI` | 300, 1277 | Styled-component hash (image wrapper) |
| `sc-fuExOL chHJJg` | 303, 1280 | Styled-component hash (workspace img) |
| `styled__OverlineTitle-sc-1223950e-1 gWupuW` | 1257 | Styled-component hash (section heading) |
| `AccountTabs__StyledNavLink-sc-a9bbfe19-0 hssqxQ` | 1342--1354 | Styled-component hash (tab links) |

These render as class attributes but produce no visual effect. They should all be removed during decomposition.

---

## 5. Existing Extracted Components

### 5a. `mini-sidebar/` -- 2 files, 315 lines total

**`mini-sidebar.tsx`** (314 lines)

Exports:
- `MiniSidebarProvider` -- Context provider with open/close state, auto-close timer (1.5s delay, 150ms animation)
- `useMiniSidebar` -- Hook for sidebar context
- `MiniSidebarTrigger` -- Button that opens on hover/click
- `MiniSidebarPanel` -- Absolutely-positioned icon panel with main nav and bottom nav groups
- `mainNavItems` -- `[Home, Projects, AI Agents, Automations, Media]` (Phosphor icons)
- `bottomNavItems` -- `[Tasks, Calendar, Favorites, Settings]` (Phosphor icons)
- `NavItem` type

Stack: Phosphor icons, Effect (`A.empty()`, `A.map`, `F.pipe`), shadcn `Button`/`Tooltip`

### 5b. `navbar/` -- 5 files

**`top-navbar.tsx`** (232 lines) -- Main navbar with breadcrumb chain: Logo / Org / Team / Workspace / App, plus search, notifications, user dropdown. Contains inline mock data for organizations (3), teams (3), workspaces (3), apps (3).

**`command-search.tsx`** (105 lines) -- Ctrl+K command palette with mock suggestions and recent files.

**`navbar-user-dropdown.tsx`** (141 lines) -- Avatar dropdown: user info, Upgrade to Pro, Account/Billing/Notifications, theme switcher (system/light/dark), sign-out. Uses `Core.Atoms.use()` from `@beep/iam-client`.

**`notification-dropdown.tsx`** (129 lines) -- Bell icon with unread badge, 4 hardcoded notifications, "Mark all as read". Uses `Match.discriminators` for notification type icon mapping.

### 5c. `sidebar/` -- 7 files

**`main-content-panel-sidebar.tsx`** (42 lines) -- Mail feature sidebar wrapping `MailNav`. Mock user: `{ name: "John Doe", email: "john@example.com" }`. **Not a settings sidebar.**

**`nav-main.tsx`** (76 lines) -- Collapsible sidebar menu groups with sub-items. Phosphor `CaretRightIcon`.

**`nav-projects.tsx`** (95 lines) -- Project list with kebab menus (View, Share, Delete).

**`nav-user.tsx`** (166 lines) -- Sidebar user dropdown (same as `navbar-user-dropdown` but for sidebar context). Uses `Core.Atoms.use()`, `useRouter`, theme switcher.

**`org-switcher.tsx`** (163 lines) -- `OrgSwitcher` (sidebar) and `OrgSwitcherCompact` (navbar). Org selector dropdown.

**`team-switcher.tsx`** (163 lines) -- `TeamSwitcher` (sidebar) and `TeamSwitcherCompact` (navbar). Team selector dropdown.

### 5d. `side-panel/` -- 2 files, 115 lines total

**`side-panel.tsx`** (115 lines) -- `SidePanelProvider` (localStorage-persisted open/close state), `useSidePanel` hook, `SidePanel` container (renders children when open, default 320px width). Handles hydration mismatch.

### 5e. `ui/resizable.tsx` -- 44 lines

Wraps `react-resizable-panels` (`Group`, `Panel`, `Separator`). Exports `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`. Custom styling with pill-shaped drag affordance via CSS pseudo-element.

---

## 6. Divergence Analysis

### 6a. Navbar -- DIVERGED (extracted is newer)

| Aspect | page.tsx | Extracted `top-navbar.tsx` | Winner |
|--------|----------|---------------------------|--------|
| Logo | `<img>` in nested divs | `<Avatar>` with `MiniSidebarTrigger` | Extracted |
| Breadcrumb | SVG slash, then "Settings" link | `/` text separators between Org/Team/Workspace/App selectors | Extracted |
| Right side | Bell SVG + bug avatar SVG | `CommandSearch` + `NotificationDropdown` + `NavbarUserDropdown` | Extracted |
| Layout | `grid-cols-[1fr_auto_1fr]` | Flexbox with `justify-between` | Extracted |

**Verdict:** Extracted navbar is a complete redesign with richer breadcrumb navigation. Prototype navbar should be **discarded**.

### 6b. Mini Sidebar -- DIVERGED (different nav items)

| Aspect | page.tsx | Extracted `mini-sidebar.tsx` | Winner |
|--------|----------|------------------------------|--------|
| Width | 50px | 48px (`w-12`) | Close match |
| Top icons | Search, Recent, Shared | Home, Projects, AI Agents, Automations, Media | **Different** |
| Bottom icons | Tasks, Calendar, Star, Check+Plus, ChevronUp, Megaphone, Help, Settings | Tasks, Calendar, Favorites, Settings | Extracted (simplified) |
| Workspace section | MUI StyledAvatar with gradient, plus button, dnd attrs | Not present | **Missing** |
| Icons | Inline SVGs (Lucide + custom) | Phosphor icons | Extracted |
| Behavior | Static | Interactive (hover/click/auto-close) | Extracted |

**Verdict:** Extracted is properly migrated to Phosphor with interactivity. Workspace avatar section from prototype needs to be captured as mock data but is not present in extracted version. Nav items differ -- extracted represents the TARGET.

### 6c. Settings Sidebar -- NO EXTRACTED EQUIVALENT

The 200px settings sidebar in page.tsx (lines 596--1289) has **no corresponding extracted component**. The existing `main-content-panel-sidebar.tsx` is for the mail feature. A new settings sidebar component must be created.

### 6d. Side Panel -- NOT CONNECTED

The `SidePanel` component exists as infrastructure but is not rendered by page.tsx. It is ready for integration when needed.

### 6e. Content Area -- FULLY UNEXTRACTED

The content sub-header, page heading, tab strip, and body are all inline in page.tsx with no extracted equivalents. Everything in lines 1292--1367 needs new components.

---

## 7. Commented-out Code

### Block 1: Integrations Sub-Items (lines 918--1092)

**Intent:** Expandable children under the "Integrations" settings nav group.

**Would contain:**
- Calendar Feed (`/settings/integrations/calendar-feed`, calendar icon)
- Google Calendar (`/settings/integrations/google-calendar`, calendar icon)
- Zapier (`/settings/integrations/zapier`, zap icon)
- Automation (external Taskade help link, workflow icon)
- AI Agents (external Taskade help link, bot icon)
- View All (`/integrations`, external-link icon)

**Action:** Preserve intent in mock data. Rebuild as proper collapsible nav items with Phosphor icons and TodoX-specific routes.

### Block 2: Manage Sub-Items (lines 1191--1254)

**Intent:** Expandable children under the "Manage" settings nav group.

**Would contain:**
- Workspaces (`/settings/manage`, building icon)
- Activate (`/settings/activate`, rocket icon)

**Action:** Preserve intent in mock data. Rebuild as proper collapsible nav items.

### Inline Comments

| Line | Content | Action |
|------|---------|--------|
| 113 | `{/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}` | Fix or remove during extraction |
| 119 | `// style="--primary: 345.42857142857144deg 100% 58.82352941176471%;"` | Delete |

---

## 8. Proposed File Tree (P1 Scope)

**Note:** Route groups (`(app)/`, `(auth)/`, `(settings)/`) are Phase 2 scope. P1 keeps `app-layout/page.tsx` in its current location and reduces it to composition.

```
apps/todox/src/
  app/
    app-layout/
      page.tsx                          # REDUCE to <100 lines: imports + composition
  components/
    app-shell/
      index.ts                          # Barrel [NEW]
      app-shell.tsx                     # Shell: navbar + mini-sidebar + content [NEW] (~80 lines)
    mini-sidebar/
      index.ts                          # KEEP as-is
      mini-sidebar.tsx                  # KEEP as-is (314 lines)
    navbar/
      index.ts                          # KEEP as-is
      top-navbar.tsx                    # KEEP as-is (232 lines)
      command-search.tsx                # KEEP as-is (105 lines)
      navbar-user-dropdown.tsx          # KEEP as-is (141 lines)
      notification-dropdown.tsx         # KEEP as-is (129 lines)
    sidebar/
      index.ts                          # KEEP, update exports
      main-content-panel-sidebar.tsx    # KEEP (mail feature)
      nav-main.tsx                      # KEEP as-is
      nav-projects.tsx                  # KEEP as-is
      nav-user.tsx                      # KEEP as-is
      org-switcher.tsx                  # KEEP as-is
      team-switcher.tsx                 # KEEP as-is
    settings-nav/
      index.ts                          # Barrel [NEW]
      settings-nav.tsx                  # Settings navigation panel [NEW] (~200 lines)
    settings-content/
      index.ts                          # Barrel [NEW]
      settings-content-header.tsx       # Sub-header with hamburger toggle [NEW] (~50 lines)
      settings-page-header.tsx          # Page heading + description [NEW] (~40 lines)
      settings-tab-strip.tsx            # Tab navigation strip [NEW] (~60 lines)
    side-panel/
      index.ts                          # KEEP as-is
      side-panel.tsx                    # KEEP as-is (115 lines)
    icons/
      (custom SVGs if needed)           # [NEW] only for SVGs without Phosphor match
  data/
    mock.ts                             # Centralized mock data [NEW] (~100 lines)
  types/
    navigation.ts                       # Navigation TypeScript interfaces [NEW] (~80 lines)
```

### Lines Budget Verification

| File | Est. Lines | Status |
|------|-----------|--------|
| `app-shell.tsx` | ~80 | NEW, under 300 |
| `settings-nav.tsx` | ~200 | NEW, under 300 |
| `settings-content-header.tsx` | ~50 | NEW, under 300 |
| `settings-page-header.tsx` | ~40 | NEW, under 300 |
| `settings-tab-strip.tsx` | ~60 | NEW, under 300 |
| `data/mock.ts` | ~100 | NEW, under 300 |
| `types/navigation.ts` | ~80 | NEW, under 300 |
| `mini-sidebar.tsx` | 314 | EXISTING, slightly over (acceptable) |
| All other existing | <232 each | EXISTING, under 300 |

---

## Appendix A: Legacy Artifacts to Clean Up

| Artifact | Lines | Action |
|----------|-------|--------|
| MUI `styled` import | 2 | Remove |
| `StyledAvatar` component | 6--8, 294--306 | Replace with Tailwind gradient |
| `sc-dPKAra`, `sc-fuExOL` classes | 300, 303, 1277, 1280 | Remove (dead) |
| `styled__OverlineTitle` class | 1257 | Remove (dead) |
| `AccountTabs__StyledNavLink` classes | 1342--1354 | Replace with Tailwind |
| `data-rbd-*` attributes | 275--286 | Remove (dnd not used) |
| `radix-:rm:`, `radix-:rf:` IDs | 115, 521 | Remove (hardcoded) |
| `data-discover="true"` attributes | Multiple | Remove |
| `help.taskade.com` URLs | 1003, 1038, 1336 | Replace with `#` placeholder |
| `data-state="closed"` on static elements | Multiple | Remove |

## Appendix B: Portal Root IDs to Preserve

| ID | Line | Purpose |
|----|------|---------|
| `secondary-panel-desktop-portal-root` | 573 | Desktop side panel portal |
| `app-header-portal-root` | 577 | App-specific header portal |
| `secondary-panel-mobile-portal-root` | 1369 | Mobile side panel portal |
