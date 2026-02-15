# Credits & Rewards Settings

> Captured from: `https://www.taskade.com/settings/credits`
> Screenshots: 3 total (persistent S3 URLs)

## Overview

The Credits & Rewards settings page is a gamified referral and engagement hub within Taskade's settings area. It allows users to earn free AI credits by sharing referral links, posting on social media, leaving reviews on third-party platforms, and following Taskade's social accounts. The page displays the user's current credit balance and organizes earning opportunities into four sections (Invite Friends, Share, Reviews, Follow), each with a credit reward badge and individual "Claim" buttons. A right-aligned sidebar card provides quick-share shortcuts and a "Get Featured" community section. An upgrade CTA at the bottom promotes unlimited AI access. The page is accessed as a top-level sidebar item under Settings with no sub-tabs.

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `credits-full.png` | Full page with Credits & Rewards view | [View](https://static.vaultctx.com/notion/taskade-ui-reference/credits-rewards/screenshots/credits-full.png) |
| `credits-top-section.png` | Heading, refer-and-earn card, invite friends | [View](https://static.vaultctx.com/notion/taskade-ui-reference/credits-rewards/screenshots/credits-top-section.png) |
| `credits-scrolled.png` | Page scrolled showing reviews, follow, Quick Share, Get Featured | [View](https://static.vaultctx.com/notion/taskade-ui-reference/credits-rewards/screenshots/credits-scrolled.png) |

## Layout

The Credits & Rewards view uses a 3-column layout. The persistent icon sidebar (56px) anchors the left edge. A settings-specific sidebar (~165px) provides category navigation (General, Plans, Usage & Billing, Credits & Rewards active, etc.). The main content area fills the remaining width and is split into a primary content column (left) with the credit-earning sections stacked vertically, and a secondary sidebar column (right) containing the Quick Share and Get Featured cards. No sub-tab bar is present -- Credits & Rewards is a direct top-level sidebar item.

- **Navbar**: 48px tall, full width, fixed top
- **Icon sidebar**: 56px wide, full height minus navbar, fixed left
- **Settings sidebar**: ~165px wide, scrollable category list
- **Main content**: Fills remaining space, two-column inner layout (primary + sidebar cards)
- **Primary column**: Stacked sections -- header card, invite, share, reviews, follow, upgrade CTA
- **Sidebar column**: Quick Share card, Get Featured card

### Layout Diagram

```
+--------------------------------------------------------------------+
| [Logo] / Settings                              [bell] [avatar]     |  48px navbar
+------+----------+--------------------------------------------------+
|  ic  | General  |  Credits & Rewards                               |
|  ic  | Plans    |  Earn free AI credits by sharing Taskade...       |
|  ic  | Usage &  |                                                   |
|      |  Billing |  +---------------------------+  +--------------+  |
|  ic  | Credits* |  | [ic] Refer and earn       |  | [ic] Quick   |  |
|  ic  | Integr.> |  | Earn free credits by...   |  |     Share    |  |
|      | Notifs   |  | Balance: 97,668           |  | Share your   |  |
|      | Archives |  +---------------------------+  | referral...  |  |
|  ic  | Manage > |                                  | [tw][fb][em] |  |
|  ic  |          |  [ic] Invite Friends  +250       | [copy link]  |  |
|  ic  | -------- |  [referral-link-code]   [Copy]   +--------------+  |
|  ic  | WORKSPACE|                                                    |
|      |  ws Work |  [ic] Share           +250       +--------------+  |
|  ic  |          |  Twitter/X      [Claim]          | [ic] Get     |  |
|      |          |  LinkedIn       [Claim]          |   Featured   |  |
|  ic  |          |                                  | Share your   |  |
|  ic  |          |  [ic] Reviews         +500       | experience.. |  |
|  ic  |          |  Trustpilot     [Claim]          | [Submit Rev] |  |
|      |          |  Google         [Claim]          | [Wall Love]  |  |
|      |          |  G2             [Claim]          | Facebook     |  |
|      |          |  Product Hunt   [Claim]          | Reddit       |  |
|      |          |                                  | Feedback     |  |
|      |          |  [ic] Follow          +100       +--------------+  |
|      |          |  Reddit         [Claim]                            |
|      |          |  YouTube        [Claim]                            |
|      |          |  Twitter/X      [Claim]                            |
|      |          |  Facebook       [Claim]                            |
|      |          |                                                    |
|      |          |  Unlock unlimited AI Apps, Agents & Automations    |
|      |          |                        [Upgrade Now]               |
| 56px |  ~165px  |                                                    |
+------+----------+--------------------------------------------------+
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Settings sidebar | nav-list | Left panel | General, Plans, Usage & Billing, Credits & Rewards, Integrations, Notifications, Archives, Manage, Workspace Settings | Item default, item active (highlighted), expandable groups (Integrations, Manage) | `credits-full.png` |
| 2 | Page heading | heading (H1) | Main content top | "Credits & Rewards" | Static | `credits-full.png`, `credits-top-section.png` |
| 3 | Page description | text | Below heading | "Earn free AI credits by sharing Taskade, leaving reviews, and joining our community. Learn more." | Static (with "Learn more" link) | `credits-full.png`, `credits-top-section.png` |
| 4 | Refer and earn card | card | Main content, header section | Icon + "Refer and earn" (H2), description text, Balance label + "97,668" value | Static display | `credits-full.png`, `credits-top-section.png` |
| 5 | Balance display | stat-value | Inside refer and earn card | "Balance" label, "97,668" numeric value | Static (reflects server-side balance) | `credits-top-section.png` |
| 6 | Invite Friends heading | heading (H3) + badge | Main content | "Invite Friends" with "+250" credit badge | Static | `credits-top-section.png`, `credits-full.png` |
| 7 | Referral link code block | code-block | Below Invite Friends heading | `https://www.taskade.com/signup?referral=x5tf6MCsoCFMMUue` | Static (read-only) | `credits-top-section.png`, `credits-full.png` |
| 8 | Copy referral link button | button (secondary) | Right of referral link | "Copy" with icon | Default, hover, clicked (copied feedback) | `credits-top-section.png`, `credits-full.png` |
| 9 | Share heading | heading (H3) + badge | Main content | "Share" with "+250" credit badge | Static | `credits-full.png` |
| 10 | Share Twitter/X row | action-row | Under Share heading | "Twitter/X" label with platform icon | Default | `credits-full.png` |
| 11 | Share Twitter/X Claim button | button | Right side of Twitter/X row | "Claim" | Default, hover, claimed/disabled | `credits-full.png` |
| 12 | Share LinkedIn row | action-row | Under Share heading | "LinkedIn" label with platform icon | Default | `credits-full.png` |
| 13 | Share LinkedIn Claim button | button | Right side of LinkedIn row | "Claim" | Default, hover, claimed/disabled | `credits-full.png` |
| 14 | Reviews heading | heading (H3) + badge | Main content | "Reviews" with "+500" credit badge | Static | `credits-scrolled.png`, `credits-full.png` |
| 15 | Trustpilot row | action-row + external-link | Under Reviews heading | "Trustpilot" with star icon, links to trustpilot.com/review/taskade.com | Default | `credits-scrolled.png` |
| 16 | Trustpilot Claim button | button | Right side of Trustpilot row | "Claim" | Default, hover, claimed/disabled | `credits-scrolled.png` |
| 17 | Google row | action-row + external-link | Under Reviews heading | "Google" with search icon, links to share.google | Default | `credits-scrolled.png` |
| 18 | Google Claim button | button | Right side of Google row | "Claim" | Default, hover, claimed/disabled | `credits-scrolled.png` |
| 19 | G2 row | action-row + external-link | Under Reviews heading | "G2" with chart icon, links to g2.com/products/taskade/reviews | Default | `credits-scrolled.png` |
| 20 | G2 Claim button | button | Right side of G2 row | "Claim" | Default, hover, claimed/disabled | `credits-scrolled.png` |
| 21 | Product Hunt row | action-row + external-link | Under Reviews heading | "Product Hunt" with rocket icon, links to producthunt.com/products/taskade/reviews | Default | `credits-scrolled.png` |
| 22 | Product Hunt Claim button | button | Right side of Product Hunt row | "Claim" | Default, hover, claimed/disabled | `credits-scrolled.png` |
| 23 | Follow heading | heading (H3) + badge | Main content | "Follow" with "+100" credit badge | Static | `credits-scrolled.png` |
| 24 | Reddit row | action-row + external-link | Under Follow heading | "Reddit" with Reddit icon, links to reddit.com/r/taskade | Default | `credits-scrolled.png` |
| 25 | Reddit Claim button | button | Right side of Reddit row | "Claim" | Default, hover, claimed/disabled | `credits-scrolled.png` |
| 26 | YouTube row | action-row + external-link | Under Follow heading | "YouTube" with play icon, links to youtube.com/@taskade | Default | `credits-scrolled.png` |
| 27 | YouTube Claim button | button | Right side of YouTube row | "Claim" | Default, hover, claimed/disabled | `credits-scrolled.png` |
| 28 | Twitter/X Follow row | action-row + external-link | Under Follow heading | "Twitter/X" with X icon, links to twitter.com/taskade | Default | `credits-scrolled.png` |
| 29 | Twitter/X Follow Claim button | button | Right side of Twitter/X row | "Claim" | Default, hover, claimed/disabled | `credits-scrolled.png` |
| 30 | Facebook Follow row | action-row + external-link | Under Follow heading | "Facebook" with Facebook icon, links to facebook.com/taskade/ | Default | `credits-scrolled.png` |
| 31 | Facebook Follow Claim button | button | Right side of Facebook row | "Claim" | Default, hover, claimed/disabled | `credits-scrolled.png` |
| 32 | Upgrade CTA card | card (promotional) | Below Follow section | "Unlock unlimited AI Apps, Agents & Automations" text, "Upgrade Now" button with icon | Default, hover on button | `credits-scrolled.png` |
| 33 | Quick Share sidebar card | card | Right sidebar column | Icon + "Quick Share" (H2), description text, 4 social share buttons (Twitter, Facebook, Email, Copy Link) | Default | `credits-scrolled.png`, `credits-full.png` |
| 34 | Quick Share Twitter button | icon-button | Inside Quick Share card | Twitter/X icon | Default, hover | `credits-scrolled.png` |
| 35 | Quick Share Facebook button | icon-button | Inside Quick Share card | Facebook icon | Default, hover | `credits-scrolled.png` |
| 36 | Quick Share Email button | icon-button | Inside Quick Share card | Email/envelope icon | Default, hover | `credits-scrolled.png` |
| 37 | Quick Share Copy Link button | icon-button | Inside Quick Share card | Link/copy icon | Default, hover, clicked (copied feedback) | `credits-scrolled.png` |
| 38 | Get Featured sidebar card | card | Right sidebar column, below Quick Share | Icon + "Get Featured" (H2), description text | Static | `credits-scrolled.png` |
| 39 | Submit Review link | link | Inside Get Featured card | "Submit Review" links to /contact | Default, hover | `credits-scrolled.png` |
| 40 | View Wall of Love link | link | Inside Get Featured card | "View Wall of Love" links to /reviews | Default, hover | `credits-scrolled.png` |
| 41 | Community Facebook link | link | Inside Get Featured card | "Facebook" links to groups/taskade | Default, hover | `credits-scrolled.png` |
| 42 | Community Reddit link | link | Inside Get Featured card | "Reddit" links to reddit.com/r/taskade | Default, hover | `credits-scrolled.png` |
| 43 | Community Feedback Forum link | link | Inside Get Featured card | "Feedback Forum" links to forum.taskade.com | Default, hover | `credits-scrolled.png` |
| 44 | Navbar logo | link | Navbar left | Taskade logo | Default, hover | `credits-full.png` |
| 45 | Navbar breadcrumb | text/link | Navbar left | "/ Settings" with icon | Default | `credits-full.png` |
| 46 | Notification bell | icon-button | Navbar right | Bell icon | Default, hover, notification dot | `credits-full.png` |
| 47 | User avatar | icon-button | Navbar far right | User avatar/initials | Default, hover | `credits-full.png` |

## Interactive States

### Settings Sidebar Navigation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Credits & Rewards active | Default / click Credits & Rewards | Highlighted/bold in sidebar list | `credits-full.png` |
| Integrations expanded | Click "Integrations" | Reveals sub-items: Calendar Feed, Google Calendar, Zapier, Automation, AI Agents, View All | - |
| Manage expanded | Click "Manage" | Reveals sub-items: Workspaces, Activate | - |
| Other item hover | Hover over sidebar item | Background highlight | - |

### Claim Buttons

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load (unclaimed action) | "Claim" button in default/active style | `credits-full.png`, `credits-scrolled.png` |
| Hover | Hover over Claim button | Button highlight/color shift | - |
| Claiming | Click Claim button | Opens external platform link (share/review/follow), button may show loading | - |
| Claimed | Action verified by server | Button disabled or shows checkmark/claimed state, credits added to balance | - |

### Copy Referral Link

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | "Copy" button with copy icon | `credits-top-section.png` |
| Hover | Hover over Copy button | Button highlight | - |
| Copied | Click Copy button | Copies URL to clipboard, button shows "Copied" or checkmark feedback | - |

### Quick Share Buttons

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | 4 social icon buttons in default state | `credits-scrolled.png` |
| Hover | Hover over any share button | Icon/button highlight | - |
| Clicked (Twitter) | Click Twitter button | Opens Twitter share intent with referral link in new tab | - |
| Clicked (Facebook) | Click Facebook button | Opens Facebook share dialog with referral link in new tab | - |
| Clicked (Email) | Click Email button | Opens mailto: link with referral URL in body | - |
| Clicked (Copy Link) | Click Copy Link button | Copies referral link to clipboard, shows copied feedback | - |

### Upgrade CTA

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | Page load | "Upgrade Now" button in promotional style | `credits-scrolled.png` |
| Hover | Hover over Upgrade Now button | Button highlight | - |
| Clicked | Click Upgrade Now | Navigates to Plans/pricing page | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| - | No GIF recordings for this view | - | - |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| Credit balance display | Credits/points balance | @beep/customization-domain, @beep/customization-server | P2 | Read-only display of server-side credit tally |
| Referral link generation | Referral system | @beep/iam-domain, @beep/iam-server | P2 | Unique per-user referral codes, signup tracking |
| Copy referral link | Clipboard copy action | @beep/customization-ui | P3 | Browser Clipboard API, copied feedback toast |
| Share on Twitter/LinkedIn | Social share intents | @beep/customization-ui | P3 | Opens external share URLs with pre-filled referral link |
| Review claim (Trustpilot, Google, G2, Product Hunt) | Review reward tracking | @beep/customization-server, @beep/customization-domain | P3 | External link + claim verification, anti-fraud consideration |
| Follow claim (Reddit, YouTube, Twitter, Facebook) | Follow reward tracking | @beep/customization-server, @beep/customization-domain | P3 | External link + claim verification, lightweight validation |
| Credit reward badges (+250, +500, +100) | Reward tier display | @beep/customization-ui | P3 | Static badge rendering per section |
| Quick Share sidebar card | Social sharing widget | @beep/customization-ui | P3 | Compact 4-button share panel |
| Get Featured sidebar card | Community engagement links | @beep/customization-ui | P3 | Static links to review submission, wall of love, community forums |
| Upgrade CTA | Plan upgrade prompt | @beep/customization-ui | P2 | Navigates to plans/pricing, conditional on free-tier status |
| Settings sidebar | Settings navigation | @beep/customization-ui | P0 | Persistent navigation for all settings views |

## Implementation Notes

- **Components**: shadcn Card (refer-and-earn header, Quick Share, Get Featured sidebar cards, upgrade CTA), Button (Copy, Claim buttons, Upgrade Now, Quick Share icon buttons), Badge ("+250", "+500", "+100" credit reward indicators), NavigationMenu (settings sidebar), custom action-row component (platform icon + label + external link + Claim button pattern repeated across Share, Reviews, Follow sections), code-block/Input (read-only referral link display)
- **Icons**: Phosphor - Gift/Coins (refer and earn section icon), UserPlus (invite friends icon), ShareNetwork/ShareFat (share section icon), Star (reviews section icon, Trustpilot), MagnifyingGlass (Google), ChartBar (G2), Rocket (Product Hunt), Users/UsersFour (follow section icon), RedditLogo (Reddit), YoutubeLogo (YouTube), XLogo/TwitterLogo (Twitter/X), FacebookLogo (Facebook), LinkedinLogo (LinkedIn), EnvelopeSimple (email share), Link/CopySimple (copy link), ArrowSquareOut (external link indicator), Lightning/RocketLaunch (upgrade CTA icon), Crown (Get Featured icon), Copy (copy button icon)
- **State Management**: Credit balance (server-fetched numeric value), claim status per action item (unclaimed/claimed persisted server-side, 12 total claimable items), referral link (server-generated per user), clipboard copy feedback state (transient UI-only), sidebar active item state
- **API Surface**: GET /api/credits/balance (current credit count), GET /api/credits/referral-link (user's unique referral URL), POST /api/credits/claim (claim credits for a specific action, params: action type e.g. "twitter_share", "trustpilot_review", "reddit_follow"), GET /api/credits/claims (list of claimed/unclaimed actions for current user), redirects to external platform URLs for share/review/follow actions
- **Complexity**: Low-Medium - primarily a read-heavy display page with 12 repeating claim action rows following the same pattern. Main complexity is server-side claim verification (preventing duplicate claims, validating external actions) and the referral tracking system. The UI is largely static cards and repeated action rows with uniform Claim button behavior. No forms, no drag-and-drop, no real-time updates required.
