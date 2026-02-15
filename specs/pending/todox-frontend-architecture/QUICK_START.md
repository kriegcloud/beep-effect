# Quick Start: TodoX Frontend Architecture

> 5-minute guide to understanding and executing this spec.

## What is TodoX?

An AI-native wealth management knowledge platform for RIAs/MFOs. NOT a task manager. NOT Taskade.

**Hero feature**: "Prepare me for my Thompson meeting" → 30-second evidence-backed briefing.

## What is this spec?

Decompose the monolithic prototype (`apps/todox/src/app/app-layout/page.tsx`, 1,380 lines) into a production-grade frontend architecture across 6 phases.

## Before You Start

1. Read `documentation/todox/PRD.md` for product context
2. Read `documentation/todox/MVP_COFUNDER_BRIEF.md` for MVP scope
3. Check `apps/todox/components.json` - confirms shadcn v3 `base-nova` style

## Tech Stack Rules

| Do | Don't |
|----|-------|
| shadcn v3 + base-ui | radix, MUI components |
| Phosphor icons | lucide, inline SVGs |
| Tailwind v4 | MUI `sx` prop, `styled()` |
| `@effect-atom/atom-react` | useState for shared state, SWR, manual fetch |
| `Atom.searchParam` | Local state for URL-driven navigation |
| `Atom.kvs` | Raw localStorage/IDB access |

## Start Phase 1

```
Copy-paste the prompt from:
specs/pending/todox-frontend-architecture/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

## Taskade Reference

The Taskade UI captures in `specs/pending/taskade-ui-reference-capture/outputs/` are **inspiration only**. Start with `COMPLETION_SUMMARY.md` for the pattern overview. See `outputs/REFERENCE_BRIDGE.md` for what transfers and what doesn't.

## Verification

```bash
bun run check --filter @beep/todox
bun run lint:fix --filter @beep/todox
```
