# Taskade UI Reference Capture

> Systematically capture every page, component, interaction state, and architectural pattern from [Taskade](https://www.taskade.com) into structured markdown outputs, creating an exhaustive UI/architecture reference for aligning the TodoX frontend (`apps/todox`) with Taskade's design system and navigation model.

---

## Purpose

Taskade is a production SaaS application with a polished dark-theme UI, glass-morphism effects, and a well-structured settings/workspace architecture. The TodoX app (`apps/todox`) is being aligned to match Taskade's frontend architecture. A throwaway POC at `app-layout/` has already captured core styles and animations as a CSS reference.

This spec defines a systematic workflow for a Claude Code instance to:

1. Navigate every significant page/view in the Taskade app using Claude in Chrome
2. Capture exhaustive screenshots of every page state, component variant, and interaction
3. Document layout measurements, component inventories, and navigation patterns
4. Produce a structured reference library in `outputs/` that accelerates TodoX implementation

## Context

- **Taskade workspace URL**: `https://www.taskade.com/spaces/Yufy1godJk9Yddwv`
- **Taskade settings URL**: `https://www.taskade.com/settings`
- **TodoX app**: `apps/todox/` (Next.js 16 with MUI + shadcn + Tailwind)
- **Style POC**: `apps/todox/src/app/app-layout/` (throwaway, captures orb-glow and glass effects)
- **Real target**: `apps/todox/src/app/layout.tsx` (root layout, full architectural alignment)

## Success Criteria

- [ ] All views listed below have structured markdown captures in `outputs/`
- [ ] Each capture includes layout measurements, component inventory, and interaction states
- [ ] Screenshot IDs referenced for every significant visual state
- [ ] Architectural patterns documented (nav model, route structure, sidebar behavior, transitions)
- [ ] Feature mapping tables link each Taskade feature to a TodoX package/slice
- [ ] GIFs captured for key interactive flows (sidebar collapse, tab switching, dropdown menus)

## Tools Required

- **Claude in Chrome** (`mcp__claude-in-chrome__*`) - browser automation, screenshots, GIFs, element discovery

## Views to Capture (17 total)

### Workspace Shell (3 views)

| # | View | URL / Interaction | Architectural Importance |
|---|------|-------------------|--------------------------|
| 1 | Workspace Home | `/spaces/Yufy1godJk9Yddwv` | App shell, sidebar, AI prompt, project grid |
| 2 | Sidebar Navigation | Icon sidebar interactions | Navigation model, tooltips, active states |
| 3 | Workspace Header | Top bar + breadcrumb | Workspace switching, user menu, notifications |

### Settings - General (4 views)

| # | View | URL | Key Components |
|---|------|-----|----------------|
| 4 | Account | `/settings` | Profile form, two-column layout, dropdowns |
| 5 | Password | `/settings/password` | Password form, MFA config, access tokens |
| 6 | Connected Accounts | `/settings/sso` | SSO toggles, connect buttons |
| 7 | Sessions | `/settings/sessions` | Data table, revoke buttons |

### Settings - Billing (3 views)

| # | View | URL | Key Components |
|---|------|-----|----------------|
| 8 | Plans | `/settings/plans` | Pricing cards, monthly/yearly toggle |
| 9 | Usage & Billing | `/settings/usage` | Plan badges, promo banners, usage tables |
| 10 | Credits & Rewards | `/settings/credits` | Referral cards, social sharing, balance |

### Settings - Features (3 views)

| # | View | URL | Key Components |
|---|------|-----|----------------|
| 11 | Notifications | `/settings/notifications` | Multi-column table, per-workspace overrides |
| 12 | Integrations | Sidebar expandable | External link pattern, sub-items |
| 13 | Archives | `/settings/archives` | Tab layout (Spaces/Members), empty states |

### Settings - Admin (4 views)

| # | View | URL | Key Components |
|---|------|-----|----------------|
| 14 | Manage > Workspaces | Via sidebar | Workspace list management |
| 15 | Manage > Activate | Via sidebar | Activation workflow |
| 16 | Workspace Overview | `/settings/manage/{id}` | Overview/Members/Apps tabs, member list |
| 17 | Workspace Members/Apps | Tab switching | Team management, app configuration |

## Phase Plan

| Phase | Scope | Views | Est. Work Items |
|-------|-------|-------|-----------------|
| **P1** | Pilot - Workspace Home | 1-3 | 5 |
| **P2** | Settings General | 4-7 | 5 |
| **P3** | Settings Billing | 8-10 | 4 |
| **P4** | Settings Features | 11-13 | 4 |
| **P5** | Settings Admin + Review | 14-17 + review | 6 |

## Timeline Estimate

| Phase | Views | Est. Duration | Critical Path |
|-------|-------|---------------|---------------|
| P1 | 3 | 1-2 hours | Tool setup + first capture validation |
| P2 | 4 | 1-2 hours | Sub-tab navigation pattern |
| P3 | 3 | 1 hour | Card/table patterns |
| P4 | 3 | 1 hour | Expandable sections |
| P5 | 4 + synthesis | 2-3 hours | Cross-cutting synthesis |
| **Total** | **17 views** | **6-10 hours** | Session management |

## Related Documents

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md` | Full workflow specification for all 5 phases |
| `AGENT_PROMPTS.md` | Index of specialized sub-agent prompts |
| `agents/PAGE_CAPTURER.md` | Combined scout + capture agent prompt |
| `templates/capture.template.md` | Output template for each view |
| `handoffs/HANDOFF_P1.md` | Phase 1 pilot context |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt to start Phase 1 |

## Architectural Patterns to Document

Beyond individual page captures, the spec must document these cross-cutting patterns:

1. **App Shell Composition** - How sidebar, navbar, and content area compose
2. **Navigation Model** - Icon sidebar → page routing → settings sidebar hierarchy
3. **Settings Architecture** - Sidebar with expandable sections, sub-tabs per page, URL routing
4. **Transition Patterns** - Page transitions, tab switching animations, sidebar expand/collapse
5. **Theme System** - Dark mode, orb glow, glass effects, color variables
6. **Component Patterns** - Form layouts, data tables, pricing cards, toggle switches, badges
7. **Responsive Behavior** - Sidebar collapse points, content reflow
