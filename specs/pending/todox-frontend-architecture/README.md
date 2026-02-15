# TodoX Frontend Architecture

> Decompose the monolithic prototype into a production-grade frontend architecture for an AI-native wealth management knowledge platform.

## Status: Pending | Complexity: High (Score: 58)

### Phase Status

| Phase | Name | Status | Date |
|-------|------|--------|------|
| P0 | Scaffolding | Complete | 2026-02-14 |
| P1 | Prototype Decomposition | Pending | - |
| P2 | App Shell & Design Tokens | Pending | - |
| P3 | Core Feature Modules | Pending | - |
| P4 | Settings & Profile | Pending | - |
| P5 | Communications & AI | Pending | - |
| P6 | Integration & Polish | Pending | - |

## Problem Statement

The `apps/todox` application has a 1,380-line monolithic prototype (`app-layout/page.tsx`) that mixes production-ready providers with hardcoded mock data, inline SVGs, and mixed styling (MUI + Tailwind). This prototype must be decomposed into a modular, feature-based architecture that serves TodoX's specific mission: **evidence-backed knowledge management for wealth advisors**.

TodoX is NOT a generic task manager. It is NOT Taskade. While the Taskade UI reference capture (`specs/pending/taskade-ui-reference-capture/`) provides design inspiration for layout systems, navigation patterns, and component structure, every architectural decision must align with TodoX's wealth management goals.

## Product Context

**Target Users**: RIAs and MFOs serving UHNWI ($30M+ AUM)
**Hero Feature**: GraphRAG meeting prep - "Prepare me for my Thompson meeting" in 30 seconds
**Core Principle**: Evidence Always - every AI-generated fact links to source text

Key documents (MUST read before implementation):
- `documentation/todox/PRD.md` - Full product requirements
- `documentation/todox/MVP_COFUNDER_BRIEF.md` - MVP scope and 5-minute demo script
- `documentation/todox/feature-ideas.md` - Feature roadmap
- `documentation/brainstorming/synthesize-refined-mvp-plan.md` - Refined MVP plan
- `documentation/brainstorming/workspaces-migration-kickoff.md` - Workspace domain model

## Tech Stack (Non-Negotiable)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Components | shadcn v3 (`base-nova` style) + `@base-ui/react` | NOT radix. Use shadcn MCP server for docs |
| Icons | Phosphor React | NOT lucide |
| Styling | Tailwind CSS v4 + CSS variables (oklch) | No MUI component usage |
| State | `@effect-atom/atom-react` | Reactive, server, URL (`Atom.searchParam`), and storage (`Atom.kvs`) state |
| Editor | Lexical + Liveblocks | Already implemented |
| Routing | Next.js 16 App Router | RSC-compatible |
| Registries | basecn, elevenlabs-ui, prompt-kit, shadcn-editor, billingsdk | See `components.json` |

## Taskade Reference Bridge

The Taskade captures provide **inspiration**, not requirements. Key transferable patterns:

| Taskade Pattern | TodoX Application | Priority |
|----------------|-------------------|----------|
| 3-column settings layout | Settings shell for account/workspace config | P1 |
| URL-driven tab navigation | Workspace/settings routing | P0 |
| Sortable data tables | Client lists, session management, action items | P1 |
| Dark theme via lightness (no borders) | Already aligned with oklch color system | P0 |
| Empty state strategies | Knowledge graph onboarding, first-run experiences | P2 |

Patterns that do NOT transfer (TodoX-specific needs):
- Dashboard system (TodoX uses FlexLayout + Liveblocks, not static pages)
- AI chat panel (TodoX needs evidence-linked responses, not generic chat)
- Meeting prep views (no Taskade equivalent)
- Knowledge graph visualization (domain-specific)
- Email thread integration (Front-style inline AI, not simple email list)

## Phases Overview

| Phase | Name | Scope | Key Deliverables |
|-------|------|-------|-----------------|
| P1 | Prototype Decomposition | Break apart page.tsx, establish component hierarchy | Component tree, routing map, extracted modules |
| P2 | App Shell & Design Tokens | Layout system, navigation, theme tokens | AppShell, Sidebar, Navbar, token system |
| P3 | Core Feature Modules | Workspace nav, page system, dashboard frame | Feature module structure, state management |
| P4 | Settings & Profile | Settings views (Taskade-inspired layout) | Settings shell, account/workspace config |
| P5 | Communications & AI | Email/calendar UI, AI chat, meeting prep | Comms hub, evidence-linked AI responses |
| P6 | Integration & Polish | Cross-feature wiring, responsive, performance | End-to-end flows, accessibility |

## Success Criteria

- [ ] Zero MUI component imports in `apps/todox` (shadcn v3 + base-ui only)
- [ ] No file exceeds 300 lines
- [ ] Slice-scoped features in `packages/{slice}/ui/`; cross-slice composition in `apps/todox/src/features/`
- [ ] State management uses `@effect-atom/atom-react` for all state (reactive, server, URL, storage)
- [ ] All routes use Next.js App Router with proper RSC/client boundaries
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint --filter @beep/todox` passes
- [ ] Prototype page.tsx fully decomposed (file deleted or reduced to route composition)

## Reference Files

| File | Purpose |
|------|---------|
| `apps/todox/src/app/app-layout/page.tsx` | Monolithic prototype to decompose |
| `apps/todox/src/app/globals.css` | Theme system (66KB, production-ready) |
| `apps/todox/components.json` | shadcn v3 configuration |
| `apps/todox/src/theme/` | Current MUI theme (to be replaced) |
| `apps/todox/src/components/` | Existing components to evaluate |
| `apps/todox/src/features/` | Partial feature modules (mail, knowledge-graph) |
| `specs/pending/taskade-ui-reference-capture/outputs/` | 19 Taskade reference docs |
| `specs/pending/taskade-ui-reference-capture/outputs/COMPLETION_SUMMARY.md` | Pattern synthesis |

## Anti-Patterns to Avoid

- Building "Taskade for wealth management" - TodoX has its own identity
- Keeping MUI components alongside shadcn v3 - pick one (shadcn v3)
- Monolithic page files - max 300 lines per file
- Local state where `Atom.searchParam` or `Atom` should be used
- Putting slice-scoped frontend code in `apps/todox` instead of `packages/{slice}/client` and `packages/{slice}/ui` -- app shell (navbar, sidebar, layout) is app-level and stays in `apps/todox/src/components/`; slice features (workspace, knowledge, calendar) go in their respective packages
- Implementing settings before core workspace/dashboard features
- Generic AI chat UI - every response needs evidence linking
