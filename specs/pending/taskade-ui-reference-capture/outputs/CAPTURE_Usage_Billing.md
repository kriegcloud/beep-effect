# Usage & Billing Settings

> Captured from: `https://www.taskade.com/settings/usage`
> Screenshots: 4 total (persistent S3 URLs)

## Overview

The Usage & Billing settings page is a top-level settings view within Taskade's settings area. It provides users with an overview of their current subscription plan, AI credit purchasing, automation health monitoring, and detailed resource usage metrics. The page displays a current plan card with billing management actions, an upsell card for premium AI credits, an automation health check link, an expandable "Detailed Usage Breakdown" accordion showing workspace count, storage, automation runs, and AI credits consumed, and a workspace table listing workspaces with their agent and seat counts. Unlike other settings pages (e.g., General/Account), this page has no sub-tabs -- it is a direct top-level item in the settings sidebar. The page heading is "AI Credits & Plan" with a description linking to a help article.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `usage-billing-full.png` | Full page with Usage & Billing view | [View](https://static.vaultctx.com/notion/taskade-ui-reference/usage-billing/screenshots/usage-billing-full.png) |
| `usage-content.png` | Main content area (plan card, upsell, automation health) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/usage-billing/screenshots/usage-content.png) |
| `usage-breakdown-expanded.png` | Page with Detailed Usage Breakdown expanded | [View](https://static.vaultctx.com/notion/taskade-ui-reference/usage-billing/screenshots/usage-breakdown-expanded.png) |
| `usage-workspaces-table.png` | Scrolled view showing workspace table | [View](https://static.vaultctx.com/notion/taskade-ui-reference/usage-billing/screenshots/usage-workspaces-table.png) |

## Layout

The Usage & Billing view uses the standard 3-column settings layout. The persistent icon sidebar (56px) anchors the left edge. A settings-specific sidebar (~165px) provides category navigation (General, Plans, Usage & Billing, etc.). The main content area fills the remaining width and contains the page heading, description, a series of stacked cards (current plan, upsell, automation health), an expandable detailed usage breakdown accordion, and a workspaces data table. There are no sub-tabs on this page.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: Fills remaining space, vertically scrollable
- **Card layout**: Stacked vertical cards within main content, each full-width
- **Usage breakdown**: Expandable accordion with 4 metric rows
- **Workspaces table**: Full-width data table below usage breakdown

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo] / Settings                              [🔔] [👤]          │  48px navbar
├──────┬──────────┬──────────────────────────────────────────────────┤
│  🔍  │ General  │  AI Credits & Plan                              │
│  🕐  │ Plans    │  Track your AI credit usage and manage your     │
│  👥  │ Usage &  │  Genesis subscription. Learn more.              │
│      │ *Billing*│                                                  │
│  🟢  │ Credits  │  ┌──────────────────────────────────────────┐   │
│  ＋  │ Integr.▸ │  │ ⬡ Pro Legacy (Mar 2025)    [Active ✓]   │   │
│      │ Notifs   │  │ Your current plan                        │   │
│      │ Archives │  │         [Manage Billing] [Explore Plans] │   │
│  📝  │ Manage ▸ │  └──────────────────────────────────────────┘   │
│  📅  │          │  ┌──────────────────────────────────────────┐   │
│  ⭐  │ ──────── │  │ Need More Power?                         │   │
│  ⊕   │ WORKSPACE│  │ Use premium AI models like GPT-4, Claude │   │
│      │  🟢 Work │  │                          [Buy Credits ⬡] │   │
│  ▲   │          │  └──────────────────────────────────────────┘   │
│  📢  │          │  ┌──────────────────────────────────────────┐   │
│  ❓  │          │  │ ⬡ Automation Health                      │   │
│  ⚙   │          │  │ Check for failed automations ...         │   │
│      │          │  │                    Check Activity → ↗    │   │
│      │          │  └──────────────────────────────────────────┘   │
│      │          │  ▸ Detailed Usage Breakdown                     │
│      │          │  ┌──────────────────────────────────────────┐   │
│      │          │  │ Workspaces         │  Name  │ Agents│Seats│  │
│ 56px │  ~165px  │  │ (info ⓘ)           │  Work  │ 12/50 │ 1/3│  │
│      │          │  └──────────────────────────────────────────┘   │
└──────┴──────────┴──────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (Usage & Billing highlighted), expandable groups (Integrations, Manage) | `usage-billing-full.png` |
| 2 | Page heading | heading (H1) | Main content top | "AI Credits & Plan" | Static | `usage-billing-full.png`, `usage-content.png` |
| 3 | Page description | text | Below heading | "Track your AI credit usage and manage your Genesis subscription. Learn more." | Static (with "Learn more" link) | `usage-billing-full.png`, `usage-content.png` |
| 4 | Current plan card | card | Main content | Icon + "Pro Legacy (Mar 2025)", "Your current plan" | Static display | `usage-content.png`, `usage-billing-full.png` |
| 5 | Active badge | badge | Current plan card | "Active" with checkmark icon | Static (green/active indicator) | `usage-content.png` |
| 6 | Manage Billing button | button (secondary) | Current plan card | "Manage Billing" | Default, hover | `usage-content.png` |
| 7 | Explore Plans button | button (secondary) | Current plan card | "Explore Plans" | Default, hover | `usage-content.png` |
| 8 | Need More Power card | card (upsell) | Main content, below plan card | "Need More Power?" heading, description text | Static display | `usage-content.png` |
| 9 | Buy Credits button | button (primary) | Need More Power card | "Buy Credits" with icon | Default, hover | `usage-content.png` |
| 10 | Automation Health card | card | Main content, below upsell | Icon + "Automation Health", description text | Static display | `usage-content.png` |
| 11 | Check Activity link | link (with icon) | Automation Health card | "Check Activity" with arrow icon, navigates to /activity | Default, hover | `usage-content.png` |
| 12 | Detailed Usage Breakdown | accordion | Main content, below cards | "Detailed Usage Breakdown" | Collapsed (default), expanded (shows 4 metric rows) | `usage-breakdown-expanded.png`, `usage-billing-full.png` |
| 13 | Workspaces metric | metric-row | Usage breakdown (expanded) | Icon + "1 / 10", "Total workspaces created" | Static display | `usage-breakdown-expanded.png` |
| 14 | Storage metric | metric-row | Usage breakdown (expanded) | Icon + "0.002GB / 100GB", "Files and media storage" | Static display | `usage-breakdown-expanded.png` |
| 15 | Automation Runs metric | metric-row | Usage breakdown (expanded) | Icon + "16 / 1,000", "Monthly automation executions" | Static display | `usage-breakdown-expanded.png` |
| 16 | AI Credits Used metric | metric-row | Usage breakdown (expanded) | Icon + "2,332 / 100,000", "Monthly AI credits" | Static display | `usage-breakdown-expanded.png` |
| 17 | Usage footer text | text | Usage breakdown (expanded), bottom | "These metrics reflect account-level aggregate usage across all your workspaces." | Static | `usage-breakdown-expanded.png` |
| 18 | Workspaces table header | table-header | Main content, below accordion | "Workspaces" with info icon | Static | `usage-workspaces-table.png` |
| 19 | Workspaces table | data-table | Main content | Columns: Name, Agents, Seats | Static display, rows per workspace | `usage-workspaces-table.png` |
| 20 | Workspace row | table-row | Workspaces table | Workspace icon + "Workspace", "12 / 50" agents, "1 / 3" seats | Default, hover | `usage-workspaces-table.png` |
| 21 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `usage-billing-full.png` |
| 22 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `usage-billing-full.png` |
| 23 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `usage-billing-full.png` |
| 24 | User avatar | icon-button | Navbar far right | User avatar/initials | Default, hover | `usage-billing-full.png` |

## Interactive States

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Usage & Billing active | Default (current page) | Highlighted/bold in sidebar list | `usage-billing-full.png` |
| Integrations expanded | Click "Integrations" | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | `usage-billing-full.png` |
| Manage expanded | Click "Manage" | Reveals sub-items: Workspaces, Activate | `usage-billing-full.png` |
| Other item hover | Hover over sidebar item | Background highlight | - |

### Current Plan Card

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Shows plan name, period, active badge | `usage-content.png` |
| Manage Billing hover | Hover "Manage Billing" | Button highlight | - |
| Manage Billing click | Click "Manage Billing" | Opens external billing portal (e.g., Stripe) | - |
| Explore Plans hover | Hover "Explore Plans" | Button highlight | - |
| Explore Plans click | Click "Explore Plans" | Navigates to /settings/plans | - |

### Upsell & Automation Cards

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Buy Credits default | Page load | Primary button displayed | `usage-content.png` |
| Buy Credits hover | Hover "Buy Credits" | Button highlight | - |
| Buy Credits click | Click "Buy Credits" | Opens credit purchase flow/modal | - |
| Check Activity default | Page load | Link displayed with arrow icon | `usage-content.png` |
| Check Activity hover | Hover "Check Activity" | Link underline/highlight | - |
| Check Activity click | Click "Check Activity" | Navigates to /activity page | - |

### Detailed Usage Breakdown Accordion

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Collapsed | Default (page load) | Arrow/chevron pointing right, metrics hidden | `usage-billing-full.png` |
| Expanded | Click accordion header | Arrow/chevron rotates down, reveals 4 metric rows + footer text | `usage-breakdown-expanded.png` |
| Collapsed again | Click accordion header again | Metrics hidden, arrow reverts | - |

### Workspaces Table

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Table rows displayed with workspace data | `usage-workspaces-table.png` |
| Row hover | Hover over workspace row | Row background highlight | - |
| Info icon hover | Hover info icon in header | Tooltip with workspace info explanation | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Current plan display | Subscription plan card | @beep/iam-domain, @beep/iam-ui | P0 | Show plan name, billing period, active status |
| Active badge | Plan status indicator | @beep/iam-ui | P1 | Badge component with status variant (active, expired, trial) |
| Manage Billing button | Billing portal redirect | @beep/iam-client, @beep/iam-server | P0 | Integration with payment provider (e.g., Stripe customer portal) |
| Explore Plans button | Plan selection navigation | @beep/iam-ui | P1 | Routes to plans/pricing settings page |
| Buy Credits upsell | Credit purchase flow | @beep/iam-client, @beep/iam-server | P2 | AI credit top-up, payment integration |
| Automation Health | Automation status monitoring | @beep/calendar-ui, @beep/calendar-client | P2 | Link to activity/automation log page |
| Workspace usage metric | Workspace count tracking | @beep/iam-domain, @beep/iam-server | P1 | Current vs. plan limit display |
| Storage usage metric | Storage quota tracking | @beep/documents-domain, @beep/documents-server | P1 | Aggregate file/media storage across workspaces |
| Automation runs metric | Automation execution tracking | @beep/calendar-domain, @beep/calendar-server | P2 | Monthly execution count vs. plan limit |
| AI credits metric | AI credit consumption tracking | @beep/iam-domain, @beep/iam-server | P1 | Monthly usage vs. plan allocation |
| Usage breakdown accordion | Expandable metrics section | @beep/customization-ui | P1 | Accordion/collapsible component with metric rows |
| Workspaces table | Workspace overview table | @beep/iam-ui, @beep/iam-client | P1 | Data table with agent/seat counts per workspace |
| Settings sidebar | Settings navigation | @beep/customization-ui | P0 | Persistent navigation for all settings views |

## Implementation Notes

- **Components**: shadcn Card (current plan card, upsell card, automation health card), Accordion/Collapsible (detailed usage breakdown), Table (workspaces table), Badge (active status indicator), Button (Manage Billing secondary, Explore Plans secondary, Buy Credits primary), Progress or custom metric-row component (usage metrics with current/limit display)
- **Icons**: Phosphor - CreditCard or CurrencyCircleDollar (plan/billing context), Lightning or Sparkle (AI credits upsell), Heartbeat or Activity (automation health), ArrowSquareOut or ArrowRight (check activity link), Buildings or Cube (workspaces), HardDrive or Database (storage), Robot or GearSix (automation runs), Brain or Cpu (AI credits), CaretRight/CaretDown (accordion toggle), Info (workspaces table header tooltip)
- **State Management**: Accordion expand/collapse state (single toggle), plan data fetched on page load (subscription status, plan name, period), usage metrics fetched on page load (workspace count, storage, automation runs, AI credits with their respective limits), workspace list with agent/seat counts, no form state needed (read-only display page with action buttons)
- **API Surface**: GET /api/subscription (current plan details, status, billing period), GET /api/usage (aggregate usage metrics: workspaces, storage, automations, AI credits), GET /api/workspaces (workspace list with agent/seat counts), POST /api/billing/portal (generate Stripe billing portal URL), POST /api/credits/purchase (initiate credit purchase flow)
- **Complexity**: Low-Medium - primarily a read-only dashboard page with no form inputs. Main complexity lies in aggregating usage metrics across workspaces, integrating with the payment provider for billing management, and the credit purchase flow. The accordion and table are straightforward UI components. The page requires multiple API calls to assemble the full view (subscription, usage, workspaces).
