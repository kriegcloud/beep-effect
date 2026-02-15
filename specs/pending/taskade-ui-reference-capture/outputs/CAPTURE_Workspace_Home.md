# Workspace Home

> Captured from: `https://www.taskade.com/spaces/Yufy1godJk9Yddwv`
> Screenshots: 7 total (persistent S3 URLs)

## Overview

The Workspace Home is the primary landing page for a Taskade workspace. It serves as the central hub where users create AI-powered apps via a natural language prompt, browse existing workspace projects as visual cards, and access integration points. The page is dominated by a hero section with an AI prompt input that cycles through placeholder suggestions (e.g., "Invoice maker tool...", "Support agent deployment...", "Weekly review system...").

## Screenshots

| Filename | Description | URL |
|----------|-------------|-----|
| `workspace-home-default.png` | Full viewport default view (hero, prompt, cards) | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-home/screenshots/workspace-home-default.png) |
| `workspace-home-fullpage.png` | Full scrollable page | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-home/screenshots/workspace-home-fullpage.png) |
| `workspace-home-cards.png` | Scrolled down to card grid | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-home/screenshots/workspace-home-cards.png) |
| `workspace-home-hero.png` | Hero/prompt area closeup | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-home/screenshots/workspace-home-hero.png) |
| `workspace-home-cardgrid.png` | Card grid area closeup | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-home/screenshots/workspace-home-cardgrid.png) |
| `workspace-home-sidebar.png` | Sidebar only strip | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-home/screenshots/workspace-home-sidebar.png) |
| `workspace-home-navbar.png` | Navbar only strip | [View](https://static.vaultctx.com/notion/taskade-ui-reference/workspace-home/screenshots/workspace-home-navbar.png) |

## Layout

The workspace home occupies the full viewport minus the persistent sidebar (56px left) and navbar (48px top). The content area is centered with generous padding. The hierarchy flows: hero text → AI prompt → category tabs → integration icons → app tabs → project card grid.

- **Navbar**: 48px tall, full width, fixed top
- **Sidebar**: 56px wide, full height minus navbar, fixed left
- **Main content**: Fills remaining space (~1689px wide), vertically scrollable
- **Hero section**: Centered, ~600px wide
- **Card grid**: 4 columns, responsive

### Layout Diagram

```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] / [Workspace ▾]                    [+People][…][🔔][👤]│  48px navbar
├──────┬─────────────────────────────────────────────────────────┤
│  🔍  │                                                         │
│  🕐  │         ═══ Imagine It. Run It. ═══                     │
│  👥  │         One prompt → a live AI app.                     │
│      │                                                         │
│  🟢  │  ┌─────────────────────────────────────────────────┐    │
│  ＋  │  │ [rotating placeholder text...]                  │    │
│      │  │ [Auto▾][✂️][⇋][📋]              [📎][✨]       │    │
│      │  └─────────────────────────────────────────────────┘    │
│      │                                                         │
│      │  [Forms][Commerce][CRM][AI][Tools][Portal][▾]           │
│      │  [Gmail][Slack][Teams][Evernote][S][YT][+more][+]       │
│      │                                                         │
│  📝  │  ═══════════════════════════════════════════════════     │
│  📅  │  [Workspace Apps] [Community Apps] [...]    [⚙][+]     │
│  ⭐  │                                                         │
│  ⊕   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  ▲   │  │ Home │ │GWP   │ │Sprint│ │App   │                  │
│  📢  │  │      │ │      │ │Flow  │ │Build │                  │
│  ❓  │  │ 9📄5👍│ │4📄3👍│ │4📄1👍│ │AddAI │                  │
│  ⚙   │  └──────┘ └──────┘ └──────┘ └──────┘                  │
│ 56px │  ┌──────┐                                               │
│      │  │Store │  (5th card on next row)                       │
│      │  │front │                                               │
│      │  └──────┘                                               │
└──────┴─────────────────────────────────────────────────────────┘
```

## Component Inventory

| # | Component | Type | Location | Label/Content | States | Screenshot IDs |
|---|-----------|------|----------|---------------|--------|----------------|
| 1 | Hero heading | text | Top center | "Imagine It. Run It." | Static | `workspace-home-default.png`, `workspace-home-hero.png` |
| 2 | Hero subtitle | text | Below heading | "One prompt → a live AI app." | Static | `workspace-home-default.png`, `workspace-home-hero.png` |
| 3 | AI prompt input | textarea | Center | Rotating placeholder text | Empty, focused, typing | `workspace-home-hero.png` |
| 4 | Auto mode dropdown | dropdown | Prompt toolbar left | "Auto" with chevron | Default, expanded | `workspace-home-default.png`, `workspace-home-hero.png` |
| 5 | AI tool: Edit | icon-button | Prompt toolbar | Scissors icon | Default, hover | `workspace-home-default.png`, `workspace-home-hero.png` |
| 6 | AI tool: Transform | icon-button | Prompt toolbar | Double-arrow icon | Default, hover | `workspace-home-default.png`, `workspace-home-hero.png` |
| 7 | AI tool: Template | icon-button | Prompt toolbar | Document icon | Default, hover | `workspace-home-default.png`, `workspace-home-hero.png` |
| 8 | Attach files | icon-button | Prompt toolbar right | Paperclip icon | Default, hover | `workspace-home-default.png`, `workspace-home-hero.png` |
| 9 | Submit/Generate | icon-button | Prompt toolbar far right | Green sparkle icon | Default, active | `workspace-home-default.png`, `workspace-home-hero.png` |
| 10 | Category tab: Forms | chip-button | Below prompt | "Forms" with icon | Default, selected | `workspace-home-hero.png` |
| 11 | Category tab: Commerce | chip-button | Below prompt | "Commerce" with icon | Default, selected | `workspace-home-hero.png` |
| 12 | Category tab: CRM | chip-button | Below prompt | "CRM" with icon | Default, selected | `workspace-home-hero.png` |
| 13 | Category tab: AI | chip-button | Below prompt | "AI" with icon | Default, selected | `workspace-home-hero.png` |
| 14 | Category tab: Tools | chip-button | Below prompt | "Tools" with icon | Default, selected | `workspace-home-hero.png` |
| 15 | Category tab: Portal | chip-button | Below prompt | "Portal" with icon | Default, selected | `workspace-home-hero.png` |
| 16 | More categories | chevron-button | After Portal | "▾" chevron | Default | `workspace-home-hero.png` |
| 17 | Integration: Gmail | icon-button | Integration row | Gmail "M" icon | Default | `workspace-home-hero.png` |
| 18 | Integration: Slack | icon-button | Integration row | Slack hashtag icon | Default | `workspace-home-hero.png` |
| 19 | Integration: Teams | icon-button | Integration row | MS Teams icon | Default | `workspace-home-hero.png` |
| 20 | Integration: Evernote | icon-button | Integration row | Evernote elephant icon | Default | `workspace-home-hero.png` |
| 21 | Integration: Stripe | icon-button | Integration row | Stripe "S" icon | Default | `workspace-home-hero.png` |
| 22 | Integration: YouTube | icon-button | Integration row | YouTube play icon | Default | `workspace-home-hero.png` |
| 23 | Integration: +more (4) | icon-buttons | Integration row | RSS, red icon, Analytics, + | Default | `workspace-home-hero.png` |
| 24 | Workspace Apps tab | tab | App section | "Workspace Apps" (selected) | Active, inactive | `workspace-home-default.png`, `workspace-home-cards.png` |
| 25 | Community Apps tab | tab | App section | "Community Apps" | Active, inactive | `workspace-home-default.png`, `workspace-home-cards.png` |
| 26 | App section menu | icon-button | App section | "..." dots | Default | `workspace-home-default.png`, `workspace-home-cards.png` |
| 27 | App settings | icon-button | App section right | Tune/settings icon | Default | `workspace-home-default.png`, `workspace-home-cards.png` |
| 28 | New app button | icon-button | App section right | "+" icon | Default | `workspace-home-default.png`, `workspace-home-cards.png` |
| 29 | Project card: Home | card | Grid row 1 | Green, home icon, 9 docs, 5 likes | Default, hover | `workspace-home-cardgrid.png` |
| 30 | Project card: Genesis Wealth Planner | card | Grid row 1 | Red/dark, 4 docs, 3 likes, 10m ago | Default, hover | `workspace-home-cardgrid.png` |
| 31 | Project card: Sprint Flow Studio | card | Grid row 1 | Kanban preview, 4 docs, 1 like, 2 branches, Jan 18 | Default, hover | `workspace-home-cardgrid.png` |
| 32 | Project card: App Builder Studio | card | Grid row 1 | Brown/green, "Add AI", Dec 23 | Default, hover | `workspace-home-cardgrid.png` |
| 33 | Project card: Storefront Studio | card | Grid row 2 | Dashboard preview $2,849.95, 4 docs, 3 likes, 3 branches, Oct 13 | Default, hover | `workspace-home-cards.png`, `workspace-home-fullpage.png` |

## Interactive States

### AI Prompt Placeholder Rotation

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Placeholder cycle | Automatic (timer) | Text rotates through suggestions: "Invoice maker tool...", "Support agent deployment...", "Weekly review automation...", "Market scan intelligence...", "AI chatbot for customer support...", "Blog factory with SEO brief...", "Contact intake form...", "Order manager app...", "Membership portal with benefits...", "Smart reminder workflow...", "Daily news signals..." | `workspace-home-hero.png`, `workspace-home-default.png` |

### Category Tabs

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Default | - | Outlined chip buttons in a row | `workspace-home-hero.png` |
| More categories | Click chevron | Reveals additional category options | - |

### App Tabs

| State | Trigger | Visual Change | Screenshot ID |
|-------|---------|---------------|---------------|
| Workspace Apps (active) | Default | Green icon + bold text | `workspace-home-default.png`, `workspace-home-cards.png` |
| Community Apps | Click | Switches to community templates | - |

## GIF Recordings

| # | Interaction | Duration | File/ID |
|---|-------------|----------|---------|
| 1 | Sidebar icon hover tooltip sequence | ~15s | taskade_sidebar_hover_tooltips.gif |

## Feature Mapping

| Taskade Feature | TodoX Equivalent | Package/Slice | Priority | Notes |
|-----------------|------------------|---------------|----------|-------|
| AI prompt input | AI agent prompt | @beep/shared-ai | P1 | Core feature - prompt-to-app generation |
| Category tabs (Forms, CRM, etc.) | Template categories | @beep/workspaces-domain | P2 | Template categorization system |
| Integration icons row | Integration hub | @beep/integrations | P3 | Third-party service connections |
| Workspace Apps / Community Apps tabs | App library tabs | @beep/workspaces-ui | P1 | Primary workspace navigation |
| Project card grid | Workspace app grid | @beep/workspaces-ui | P0 | Core workspace view |
| Project card metadata (docs, likes) | App metadata display | @beep/workspaces-domain | P1 | Document count, engagement metrics |
| Card thumbnail preview | App preview thumbnails | @beep/workspaces-ui | P2 | Visual preview of workspace apps |
| New App "+" button | Create new app | @beep/workspaces-client | P0 | Primary creation action |
| "Add people" button | Workspace sharing | @beep/iam-client | P1 | Team invitation flow |

## Implementation Notes

- **Components**: shadcn Card, Tabs, Input/Textarea, Button, DropdownMenu, Badge
- **Icons**: Phosphor - MagnifyingGlass, Clock, Users, House, Plus, Notepad, Calendar, Star, Lightning, Gear, Question, Megaphone
- **State Management**: AI prompt state (text, mode, loading), category selection, active tab (Workspace/Community), card grid data
- **API Surface**: Workspace apps CRUD, template categories, integration registry, activity feed
- **Complexity**: High - multiple interactive subsystems (AI prompt, categories, integrations, card grid with metadata)
