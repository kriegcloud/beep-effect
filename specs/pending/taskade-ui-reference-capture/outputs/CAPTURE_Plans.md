# Plans Settings

> Captured from: `https://www.taskade.com/settings/plans`
> Screenshots: 5 total (persistent S3 URLs)

## Overview

The Plans Settings view is the subscription management page within Taskade's settings area. It presents three pricing tiers (Starter, Pro, Business) as comparison cards with a Monthly/Yearly toggle, an Enterprise contact section, and a supplementary credits scaling area. The pricing content is rendered inside an embedded iframe within the main content area. Each tier card displays included users, monthly AI credits, a CTA button linking to the checkout flow, and a feature list with expandable "View more" sections for Pro and Business. The page is accessed via the "Plans" item in the settings sidebar navigation.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `plans-full.png` | Full page with Plans heading and pricing iframe | [View](https://static.vaultctx.com/notion/taskade-ui-reference/plans/screenshots/plans-full.png) |
| `plans-sidebar.png` | Settings sidebar with Plans active | [View](https://static.vaultctx.com/notion/taskade-ui-reference/plans/screenshots/plans-sidebar.png) |
| `plans-heading.png` | Plans heading and description area | [View](https://static.vaultctx.com/notion/taskade-ui-reference/plans/screenshots/plans-heading.png) |
| `plans-pricing-cards.png` | Pricing tier cards (Starter, Pro, Business) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/plans/screenshots/plans-pricing-cards.png) |
| `plans-scrolled.png` | Page scrolled showing Enterprise + Scale credits | [View](https://static.vaultctx.com/notion/taskade-ui-reference/plans/screenshots/plans-scrolled.png) |

## Layout

The Plans Settings view uses a 3-column layout. The persistent icon sidebar (56px) anchors the left edge. A settings-specific sidebar (~165px) provides category navigation (General, Plans, Usage & Billing, etc.). The main content area fills the remaining width and contains the page heading, a description paragraph with links, and an embedded iframe that renders the full pricing comparison including tier cards, Enterprise section, and credits scaling area.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: Fills remaining space, vertically scrollable
- **Heading area**: H1 "Plans" with description text and inline links
- **Pricing iframe**: Embedded content filling main content width, contains toggle, 3 tier cards in a row, Enterprise section, and credits scaling section

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo] / Settings                              [🔔] [👤]          │  48px navbar
├──────┬──────────┬──────────────────────────────────────────────────┤
│  🔍  │ General  │  Plans                                          │
│  🕐  │ *Plans*  │  Choose from our current available plans to     │
│  👥  │ Usage &  │  unlock premium features for you and your team. │
│      │  Billing │  Learn more. More details... found here.        │
│  🟢  │ Credits  │                                                 │
│  ＋  │ Integr.▸ │  ┌──────────────────────────────────────────┐   │
│      │ Notifs   │  │  [Monthly] [Yearly -20%]                 │   │
│      │ Archives │  │                                          │   │
│  📝  │ Manage ▸ │  │  ┌──────────┬──────────┬──────────┐     │   │
│  📅  │          │  │  │ Starter  │ Pro      │ Business │     │   │
│  ⭐  │ ──────── │  │  │ $6/mo    │ $16/mo   │ $40/mo   │     │   │
│  ⊕   │ WORKSPACE│  │  │ 3 users  │ 10 users │ Unlim.   │     │   │
│      │  🟢 Work │  │  │ 10K cred │ 50K cred │ 150K cr. │     │   │
│      │          │  │  │ [Buy]    │ [Buy]    │ [Buy]    │     │   │
│  ▲   │          │  │  │ Features │ Features │ Features │     │   │
│  📢  │          │  │  │ ...      │ ...+more │ ...+more │     │   │
│  ❓  │          │  │  └──────────┴──────────┴──────────┘     │   │
│  ⚙   │          │  │                                          │   │
│      │          │  │  Enterprise: [Contact Sales]              │   │
│ 56px │  ~165px  │  │  Compare all features →                  │   │
│      │          │  │  Scale your AI credits                    │   │
│      │          │  └──────────────────────────────────────────┘   │
└──────┴──────────┴──────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (Plans highlighted), expandable groups (Integrations, Manage) | `plans-sidebar.png`, `plans-full.png` |
| 2 | Page heading | heading (H1) | Main content top | "Plans" | Static | `plans-heading.png`, `plans-full.png` |
| 3 | Page description | text | Below heading | "Choose from our current available plans to unlock premium features for you and your team. Learn more. More details on your account's current plan can be found here." | Static (with "Learn more" external link, "here" links to /settings/billing) | `plans-heading.png`, `plans-full.png` |
| 4 | Billing period toggle | toggle-button-group | Top of pricing iframe | "Monthly" / "Yearly -20%" | Monthly selected, Yearly selected (default, shows discounted prices) | `plans-pricing-cards.png`, `plans-full.png` |
| 5 | Starter tier card | pricing-card (article) | Pricing row, left | "Starter", "$6/mo" (yearly), "3 users included", "10K credits / month" | Default (yearly pricing), monthly variant ($8/mo estimated) | `plans-pricing-cards.png`, `plans-full.png` |
| 6 | Pro tier card | pricing-card (article) | Pricing row, center | "Pro", "$16/mo" (yearly), "10 users included", "50K credits / month", "Popular" badge | Default (yearly pricing), monthly variant, Popular badge always visible | `plans-pricing-cards.png`, `plans-full.png` |
| 7 | Business tier card | pricing-card (article) | Pricing row, right | "Business", "$40/mo" (yearly), "Unlimited users and teams", "150K credits / month" | Default (yearly pricing), monthly variant | `plans-pricing-cards.png`, `plans-full.png` |
| 8 | Credits info button | icon-button (tooltip) | Each tier card, beside credits count | Info icon next to "10K/50K/150K credits / month" | Default, hover (shows tooltip with credits explanation) | `plans-pricing-cards.png` |
| 9 | Buy Starter button | link-button (CTA) | Starter card | "Buy Starter" | Default, hover; links to /billing/checkout/v8.starter/year | `plans-pricing-cards.png` |
| 10 | Buy Pro button | link-button (CTA) | Pro card | "Buy Pro" | Default, hover; links to /billing/checkout/v8.pro/year | `plans-pricing-cards.png` |
| 11 | Buy Business button | link-button (CTA) | Business card | "Buy Business" | Default, hover; links to /billing/checkout/v8.business/year | `plans-pricing-cards.png` |
| 12 | Starter feature list | feature-list | Starter card, below CTA | "Everything in Free, plus:" Taskade AI, Unlimited apps, Unlimited workspaces, Upload files and links, Private & unlisted apps, Frontier AI models | Static | `plans-pricing-cards.png` |
| 13 | Pro feature list | feature-list (expandable) | Pro card, below CTA | "Everything in Starter, plus:" Taskade AI, Unlimited AI agents, Unlimited automations, Train agents with your data, Password-protected sharing, Remove Taskade branding, Connect 100+ integrations | Collapsed (default, shows 7 features + "View 5 more"), expanded (shows all 12 features) | `plans-pricing-cards.png` |
| 14 | Business feature list | feature-list (expandable) | Business card, below CTA | "Everything in Pro, plus:" Taskade AI, Unlimited AI teams, Multi-agent workflows, Advanced analytics, Custom domains, White-label branding, API & custom integrations | Collapsed (default, shows 7 features + "View 5 more"), expanded (shows all 12 features) | `plans-pricing-cards.png` |
| 15 | View more toggle (Pro) | expandable-trigger | Pro feature list | "View 5 more" | Collapsed (shows "View 5 more"), expanded (hides toggle, reveals: Background AI agents, Always-on automations, Automated agent training, Web search and scraping, Pay-as-you-go credits) | `plans-pricing-cards.png` |
| 16 | View more toggle (Business) | expandable-trigger | Business feature list | "View 5 more" | Collapsed (shows "View 5 more"), expanded (hides toggle, reveals: Business-in-a-Box, Admin controls, Priority processing, Admin dashboard, Priority support) | `plans-pricing-cards.png` |
| 17 | Popular badge | badge | Pro card header | "Popular" | Static, always visible | `plans-pricing-cards.png` |
| 18 | Enterprise section | card/area | Below tier cards | Custom AI deployment, SSO/SAML/SCIM, Private cloud and infra, SLA and dedicated support | Static | `plans-scrolled.png` |
| 19 | Contact Sales link | link-button (CTA) | Enterprise section | "Contact Sales" | Default, hover; links to /contact | `plans-scrolled.png` |
| 20 | Compare all features link | text-link | Below Enterprise section | "Compare all features" | Default, hover; links to /upgrade | `plans-scrolled.png` |
| 21 | Scale credits heading | heading (H3) | Credits section | "Scale your AI credits" | Static | `plans-scrolled.png` |
| 22 | Scale credits description | text | Credits section | "Adjust quantity on any plan above to increase your monthly credits." | Static | `plans-scrolled.png` |
| 23 | Buy one-time credits link | text-link | Credits section | "Buy one-time credits" | Default, hover; links to /upgrade/credits | `plans-scrolled.png` |
| 24 | Credits learn more link | text-link | Credits section | "Learn more" | Default, hover; links to external help article | `plans-scrolled.png` |
| 25 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `plans-full.png` |
| 26 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `plans-full.png` |
| 27 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `plans-full.png` |
| 28 | User avatar | icon-button | Navbar far right | User avatar/initials | Default, hover | `plans-full.png` |

## Interactive States

### Billing Period Toggle

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Yearly selected (default) | Page load / click "Yearly -20%" | Yearly button active/highlighted, tier prices show yearly rate (e.g., $6/mo, $16/mo, $40/mo), CTA links use /year suffix | `plans-pricing-cards.png` |
| Monthly selected | Click "Monthly" | Monthly button active/highlighted, tier prices update to monthly rate, CTA links switch to /month suffix | - |

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Plans active | Default on this page | Plans item highlighted/bold in sidebar list | `plans-sidebar.png` |
| Integrations expanded | Click "Integrations" | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | `plans-sidebar.png` |
| Manage expanded | Click "Manage" | Reveals sub-items: Workspaces, Activate | `plans-sidebar.png` |
| Other item hover | Hover over sidebar item | Background highlight | - |

### Feature List Expansion

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Pro collapsed (default) | Page load | Shows 7 features + "View 5 more" link | `plans-pricing-cards.png` |
| Pro expanded | Click "View 5 more" | Reveals 5 additional features: Background AI agents, Always-on automations, Automated agent training, Web search and scraping, Pay-as-you-go credits | - |
| Business collapsed (default) | Page load | Shows 7 features + "View 5 more" link | `plans-pricing-cards.png` |
| Business expanded | Click "View 5 more" | Reveals 5 additional features: Business-in-a-Box, Admin controls, Priority processing, Admin dashboard, Priority support | - |

### CTA Buttons

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Styled link buttons ("Buy Starter", "Buy Pro", "Buy Business") | `plans-pricing-cards.png` |
| Hover | Mouse over CTA | Button highlight/elevation change | - |
| Click | Click CTA | Navigates to /billing/checkout/v8.{tier}/{period} | - |

### Credits Info Tooltip

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | Info icon visible beside credits count | `plans-pricing-cards.png` |
| Tooltip visible | Hover/click info icon | Tooltip appears explaining AI credits | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Pricing tier cards | Subscription plan display | @beep/iam-ui, @beep/iam-client | P1 | Read-only plan comparison, data from billing provider |
| Monthly/Yearly toggle | Billing period selector | @beep/iam-ui | P1 | Client-side toggle updating displayed prices and CTA links |
| Buy CTA buttons | Checkout flow initiation | @beep/iam-client, @beep/iam-server | P0 | Links to checkout page, integrates with payment provider (Stripe or similar) |
| Popular badge | Plan recommendation indicator | @beep/iam-ui | P2 | Static badge on recommended tier |
| Feature lists (expandable) | Plan feature comparison | @beep/iam-ui | P1 | Collapsible feature lists per tier with "View more" toggle |
| Credits display per tier | AI credits quota display | @beep/iam-domain, @beep/iam-ui | P1 | Credits count with info tooltip, per-plan allocation |
| Credits info tooltip | Credits explanation popover | @beep/iam-ui | P2 | Tooltip/popover explaining credit system |
| Enterprise contact section | Enterprise sales flow | @beep/iam-ui, @beep/comms-client | P2 | Contact form link, potentially separate landing page |
| Compare all features link | Full feature comparison page | @beep/iam-ui | P2 | Navigation to detailed comparison view |
| Scale credits section | Credits scaling guidance | @beep/iam-ui | P2 | Informational section linking to credit purchase and help docs |
| Buy one-time credits link | One-time credit purchase | @beep/iam-client, @beep/iam-server | P1 | Links to credit purchase flow |
| Settings sidebar (Plans active) | Settings navigation | @beep/customization-ui | P0 | Persistent navigation with Plans as active item |
| Plans page heading + description | Settings page header | @beep/customization-ui | P0 | Standard settings page header pattern with inline links |

## Implementation Notes

- **Components**: shadcn Card (pricing tier cards), ToggleGroup (Monthly/Yearly toggle), Button (Buy CTA links, Contact Sales), Badge (Popular indicator on Pro), Collapsible (expandable feature lists with "View more"), Tooltip (credits info icon), NavigationMenu (settings sidebar), Separator (between sections if needed)
- **Icons**: Phosphor - GearSix (settings breadcrumb), Bell (notification), User/UserCircle (avatar), Info (credits tooltip trigger), CaretDown (feature list expand indicator), Check (feature list checkmarks), ArrowRight (link arrows for "Compare all features", "Buy one-time credits")
- **State Management**: Billing period toggle state (monthly vs yearly, affects displayed prices and CTA URLs), feature list expand/collapse state (independent per tier card), settings sidebar active item and expand/collapse state for Integrations and Manage groups, current subscription status (to potentially show "Current Plan" instead of "Buy" on active tier)
- **API Surface**: GET /api/billing/plans (load available plans with pricing), GET /api/billing/subscription (load current user subscription to highlight active plan), POST /api/billing/checkout (initiate checkout session for selected plan/period), GET /api/billing/credits (load current credits balance for display)
- **Complexity**: Medium - primarily a read-only display page with pricing data rendered in an iframe (which TodoX would render natively). Main complexity lies in: (1) integrating with a payment/billing provider for checkout flow, (2) dynamically showing current plan state if user already has a subscription, (3) the Monthly/Yearly toggle recalculating all displayed prices and updating CTA URLs, (4) responsive layout for 3 side-by-side tier cards. The expandable feature lists and tooltip are straightforward UI patterns.
