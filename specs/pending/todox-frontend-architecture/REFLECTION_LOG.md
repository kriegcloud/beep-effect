# Reflection Log: TodoX Frontend Architecture

> Cumulative learnings from spec execution. Updated after each phase.
> Pattern candidates scoring 75+ are promoted to `specs/_guide/PATTERN_REGISTRY.md`.

---

## Pre-Phase: Research & Synthesis

**Date**: 2026-02-14
**Phase**: Pre-implementation research
**Context Budget**: Green Zone (4 sub-agents, 0 direct large file reads)

### What Worked
- Parallel exploration of 9 product documents via 4 sub-agents yielded comprehensive product understanding
- Identifying the fundamental tension early: TodoX is NOT Taskade, patterns transfer but goals diverge
- Reading `components.json` to confirm shadcn v3 `base-nova` style before spec creation
- Cross-referencing Taskade UI captures with TodoX PRD to filter transferable vs non-transferable patterns

### Key Insights
1. **TodoX identity**: AI-native wealth management knowledge platform, not a productivity tool
2. **Hero feature**: GraphRAG meeting prep (30 seconds vs 30 minutes) -- drives all UI decisions
3. **Evidence Always principle**: Every AI response must link to source text -- non-negotiable
4. **Tech stack clarity**: shadcn v3 + base-ui (not radix), Phosphor icons, no MUI components
5. **Workspace migration**: The `documents` → `workspaces` package rename is in-flight
6. **Existing prototype value**: Provider stack, theme CSS variables, and Lexical editor are production-ready; layout and mock data are throwaway

### Pattern Candidates

| Pattern | Confidence | Quality Est. | Transferable? |
|---------|-----------|-------------|---------------|
| Taskade 3-column settings layout | 90% | ~70/102 | Yes -- adapt to TodoX settings |
| URL-driven tab navigation | 95% | ~80/102 | Yes -- direct adoption |
| Dark theme via lightness variation | 95% | ~85/102 | Yes -- already aligned with oklch |
| Sortable data tables | 85% | ~65/102 | Yes -- client lists, sessions |
| Feature-based directory structure | 95% | ~90/102 | Yes -- standard React architecture |

### Prompt Refinements

| Before | After | Rationale |
|--------|-------|-----------|
| "Use shadcn components" | "Use shadcn v3 with `base-nova` style (`@base-ui/react`, NOT `@radix-ui/react`)" | Agents default to radix; explicit negation prevents wrong imports |
| "Replace icons" | "Icons: Phosphor ONLY (`@phosphor-icons/react`). NO lucide. NO inline SVGs." | Without negation, agents may introduce lucide (shadcn default) |
| "TodoX is a productivity platform" | "TodoX is NOT Taskade. It is an AI-native wealth management knowledge platform." | Identity confusion led to generic task-manager patterns in early drafts |
| No verification | "Gate check: `grep -rn '<svg' apps/todox/src/ | grep -v editor`" | Added after discovering Phase 1 audit could miss inline SVGs without automated check |
| No config verification | "Verify `apps/todox/components.json`: `style: 'base-nova'`, `iconLibrary: 'phosphor'`" | Single source of truth for tech stack; prevents drift across phases |
| "Effect Atom + TanStack Query" | "`@effect-atom/atom-react` for ALL state: `Atom` (reactive), `runtime.atom`/`runtime.fn` (server), `Atom.searchParam` (URL), `Atom.kvs` (storage)" | Project does NOT use TanStack Query. All state management uses `@effect-atom/atom-react`. See `packages/iam/client/src/core/atoms.ts` for canonical server-state pattern |
| "Use `searchParams` for URL state" | "Use `Atom.searchParam('key')` for URL state with optional `Schema` parsing" | `Atom.searchParam` from `@effect-atom/atom-react` wraps URL search params as reactive atoms |
| "Features in `apps/todox/src/features/`" | "Slice-scoped frontend code MUST live in `packages/{slice}/client` and `packages/{slice}/ui`. Only cross-slice composition and app shell belong in `apps/todox`." | Vertical slice architecture requires slice-specific code in `packages/`, not aggregated in the app |

---

## Phase 1: Prototype Decomposition

**Date**: _pending_
**Phase**: P1 -- Extract components from monolithic prototype

### What Worked
_To be filled after Phase 1 execution_

### What Didn't Work
_To be filled after Phase 1 execution_

### Key Insights
_To be filled after Phase 1 execution_

### Pattern Candidates
_To be filled after Phase 1 execution_

### Prompt Refinements
_To be filled after Phase 1 execution_

### Metrics
- Files created: _pending_
- Files modified: _pending_
- Lines removed from page.tsx: _pending_
- Inline SVGs replaced: _pending_
- Context budget status: _pending_
