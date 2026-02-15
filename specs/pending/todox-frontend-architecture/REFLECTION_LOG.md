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

**Date**: 2026-02-14
**Phase**: P1 -- Extract components from monolithic prototype
**Context Budget**: Green Zone (1 codebase-researcher audit + 1 general-purpose implementation agent)

### What Worked
- Combined Steps 2-5 into a single implementation agent -- interdependent work items executed faster without cross-agent coordination overhead
- Treating extracted components (navbar/, mini-sidebar/, side-panel/) as TARGET state eliminated reconciliation complexity -- simply imported them rather than merging content
- Centralized mock data in `data/mock.ts` with TypeScript interfaces made component extraction clean -- each component accepts props with mock defaults
- Effect functional patterns (F.pipe, A.map, O.map, O.getOrNull) in React components followed codebase conventions naturally
- `--force` flag on turbo check avoided stale cache results after file changes

### What Didn't Work
- `codebase-researcher` agent has read-only tools -- cannot write audit output files. Orchestrator had to write the prototype-audit.md manually from agent findings.
- Task list IDs became stale after context transitions -- TaskUpdate returned "Task not found" for tasks 2-6. Did not block work but added noise.
- Initial turbo check hit cache from before changes, returning misleading "all pass" results. Always use `--force` after structural changes.

### Key Insights
1. **Settings sidebar had no extracted equivalent**: Unlike navbar/mini-sidebar/side-panel which were already extracted, the 700-line settings sidebar (lines 596-1289) had no counterpart. Required new component creation, not reconciliation.
2. **MUI footprint was trivial**: Only `styled` import (line 2) and `StyledAvatar` (lines 6-8), both dead code. Removal was a single-line deletion, not a migration effort.
3. **30+ inline SVGs all mapped to Phosphor**: No custom icon components needed. Every inline SVG had a direct Phosphor equivalent.
4. **74% line reduction in settings sidebar**: 693 lines inline -> 179 lines extracted component. Data centralization and proper sub-components drove the reduction.
5. **Content area was three distinct components**: Header bar, page header, and tab strip. Splitting into three small files (<40 lines each) was cleaner than one larger component.

### Pattern Candidates

| Pattern | Confidence | Quality Est. | Transferable? |
|---------|-----------|-------------|---------------|
| Mock data with typed defaults pattern | 95% | ~85/102 | Yes -- props with centralized defaults enable progressive replacement |
| Effect Option for conditional rendering | 90% | ~80/102 | Yes -- O.map + O.getOrNull cleaner than ternaries in JSX |
| Barrel export per component directory | 95% | ~90/102 | Yes -- standard React pattern, already used by existing components |
| AppShell as provider + layout compositor | 90% | ~85/102 | Yes -- wraps providers + structural layout, children for content injection |

### Prompt Refinements

| Before | After | Rationale |
|--------|-------|-----------|
| "Delegate audit to codebase-researcher" | "codebase-researcher for research, orchestrator writes output files" | Agent has read-only tools; cannot create output artifacts |
| "Run bun run check after changes" | "Run bun run check --force after structural changes" | Turbo cache can return stale results for file-level changes |
| "Reconcile extracted components with page.tsx" | "Extracted components are TARGET state: import them, delete page.tsx duplicates" | Reconciliation was unnecessary; extracted components were already ahead |
| "Create content-area.tsx component" | "Split content area into 3 small components: header, page-header, tab-strip" | One component would have mixed concerns; three small files are cleaner |

### Metrics
- Files created: 10 (3 components, 3 barrel exports, 1 types file, 1 mock data file, 1 app-shell, 1 audit doc)
- Files modified: 1 (page.tsx: 1,380 -> 33 lines)
- Lines removed from page.tsx: 1,347
- Inline SVGs replaced: 30+ (all mapped to Phosphor icons)
- Typecheck: 105/105 tasks passed (with --force)
- Lint: 0 errors in new code (5 pre-existing warnings in unrelated files)
- Context budget status: Green (2 agent invocations total)

---

## Phase 2: App Shell & Design System

**Date**: 2026-02-15
**Phase**: P2 -- Resizable panels, responsive behavior, MUI removal, route groups
**Context Budget**: Green Zone (4 parallel agents batch 1 + 1 react-expert + 1 general-purpose)

### What Worked
- Parallelizing 4 independent tasks (icons, media query hook, MUI removal, CSS audit) in batch 1 -- all completed without conflicts
- CSS audit discovering zero MUI references in globals.css eliminated a major risk identified in the handoff -- no surgical edits needed
- Identifying `extended-theme-types.ts` as orphaned (zero imports) enabled clean deletion alongside theme/ directory
- `react-resizable-panels` has built-in localStorage persistence via `useDefaultLayout({ id })` -- no custom persistence code needed
- Moving `app-layout/page.tsx` to `(settings)/` route group since it renders SettingsNav (correctly identified during route group planning)
- Clearing `.next/types/validator.ts` after `git mv` resolved stale path references in typecheck

### What Didn't Work
- Initial `app-shell.tsx` spec called for `Atom.kvs` panel persistence, but the runtime client isn't wired into these components yet. Pragmatically used `react-resizable-panels` built-in `useDefaultLayout` hook instead.
- `bun run check` after route group moves failed with 4 type errors from `.next/types/validator.ts` -- stale build artifacts from Next.js. Required `rm -rf apps/todox/.next/types` before re-running.
- MUI removal couldn't be complete -- `features/mail/`, demo pages, and `ConnectionsSettingsPage` still use MUI components extensively. Scoped removal to shell layer only.

### Key Insights
1. **react-resizable-panels has batteries**: Built-in `useDefaultLayout` handles localStorage persistence, `usePanelRef` enables imperative collapse/expand for responsive behavior. No custom hooks needed.
2. **globals.css is already MUI-free**: The 2,700-line CSS file uses oklch exclusively. The only `mui` reference is a harmless `@layer` declaration. Zero surgical edits required.
3. **MUI removal is layered**: Shell layer (providers, config, theme) cleaned in P2. Feature pages (mail, demo, settings/connections) remain MUI-dependent and require per-feature migration in later phases.
4. **Route groups don't affect URLs**: Moving `auth/` into `(auth)/auth/` preserves `/auth/sign-in` URLs. This is a Next.js App Router feature, not a path change.
5. **AppShell rewrite stayed compact**: 256 lines with 6 sub-components (WorkspaceSidebar placeholder, MobileSidebarSheet, MobileSidebarTrigger, OrbBackdrop, DesktopPanelLayout, AppShell main). Extracting OrbBackdrop eliminated repeated markup.
6. **shadcn component audit was pre-satisfied**: All 28 UI components already use `@base-ui/react`, zero `@radix-ui` imports. WI 2.2 required no work.

### Pattern Candidates

| Pattern | Confidence | Quality Est. | Transferable? |
|---------|-----------|-------------|---------------|
| `.next/types` cleanup after git mv | 95% | ~85/102 | Yes -- always clear after route restructuring |
| Layered MUI removal (shell first, features later) | 90% | ~80/102 | Yes -- any large dependency migration |
| useDefaultLayout for panel persistence | 95% | ~90/102 | Yes -- react-resizable-panels built-in |
| Route group layout composition | 90% | ~85/102 | Yes -- standard Next.js App Router pattern |

### Prompt Refinements

| Before | After | Rationale |
|--------|-------|-----------|
| "Persist via Atom.kvs" | "Use react-resizable-panels useDefaultLayout for persistence" | Runtime client not available in shell components yet; library has built-in solution |
| "Zero MUI imports in apps/todox/" | "Zero MUI imports in shell layer (components/, hooks/, global-providers, app-config)" | Full MUI removal impossible while features/mail/ exists |
| "Audit shadcn components for @base-ui" | "Verify zero @radix-ui imports (likely already clean)" | Pre-audit found 100% @base-ui adoption; audit was verification not remediation |
| "Clear .next/types after route moves" | Added to verification checklist | Stale Next.js type validators cause false typecheck failures |

### Metrics
- Files created: 6 (app-shell.tsx rewrite, use-media-query.ts, icons/index.ts, (app)/layout.tsx, (auth)/layout.tsx, (settings)/layout.tsx)
- Files deleted: 26 (entire theme/ directory)
- Files modified: 3 (global-providers.tsx, app-config.ts, app-layout/page.tsx)
- Directories moved: 3 (auth → (auth)/auth, app-layout → (settings)/app-layout, settings → (settings)/settings)
- Typecheck: 105/105 passed
- Lint: 0 errors, 5 pre-existing warnings
- Architecture gates: 0 @radix-ui, 0 lucide-react, 0 @mui in shell layer
- All files under 300 lines (max: app-shell.tsx at 256)
- Agent invocations: 6 (4 parallel batch 1 + 2 sequential)

---

## Pre-Phase 1: Comprehensive Review

**Date**: 2026-02-14
**Phase**: Pre-P1 gotcha elimination
**Context Budget**: Green Zone (4 sub-agents for parallel review)

### What Worked
- Parallel 4-agent review (prototype audit, dependency verification, spec cross-check, build gates) covered all dimensions simultaneously
- Build gate agent confirmed typecheck passes (105/105) -- no pre-existing type errors
- Prototype audit revealed page.tsx has ZERO React hooks (useState/useEffect) -- purely static JSX, simplifying extraction
- Discovered `StyledAvatar` on lines 5-7 is completely unused (dead code)

### Key Insights
1. **Extracted components already exist** but page.tsx doesn't import them. `top-navbar.tsx` is ahead of page.tsx (already uses Phosphor icons)
2. **38+ inline SVGs**: 32 standard Lucide (easy Phosphor mapping) + 7 custom (need `components/icons/` wrappers)
3. **MUI footprint minimal**: 1 unused import, 1 unused styled component. `global-providers.tsx` has MUI providers but is explicitly out of P1 scope
4. **Pre-existing lint errors**: 2 in page.tsx (trivial), 6 warnings in unrelated files
5. **Styled-components residue**: Auto-generated class names (`sc-dPKAra`, `sc-fuExOL`) in page.tsx lines 1257-1280 will break if DOM changes -- must replace with Tailwind during extraction

### Prompt Refinements

| Before | After | Rationale |
|--------|-------|-----------|
| "No new MUI imports introduced" | "Remove unused `styled` import and `StyledAvatar`. Do NOT modify `global-providers.tsx`." | Contradicted MASTER_ORCHESTRATION "Zero styled MUI imports". Now both docs align. |
| "All extracted components render without visual regression" | "...render without visual regression (verify: check passes + manual dev server inspection)" | No automated visual testing exists. Manual verification is the only option. |
| "Reconcile divergence" (vague) | "Extracted components are TARGET state, page.tsx is SOURCE. Merge, wire imports, delete duplicates." | Agents needed a decision tree for which version to prefer. |
| "Features go in `apps/todox/src/features/{domain}/`" | "Slice-scoped features go in `packages/{slice}/ui/src/`. Cross-slice stays in `apps/todox`." | Contradicted vertical slice architecture anti-pattern. |
| No pre-existing error documentation | "2 lint errors in page.tsx (trivial). 6 warnings in unrelated files (ignore)." | Build gate found issues that would confuse implementing agent. |
| "For SVGs with no match, create components in `components/icons/`" | "7 custom SVGs identified. Settings gear = Phosphor GearSix. Others need audit." | Reduced subjectivity in icon mapping decisions. |

### Metrics
- Spec documents updated: 4 (HANDOFF_P1, MASTER_ORCHESTRATION, REFERENCE_BRIDGE, REFLECTION_LOG)
- Contradictions resolved: 3 (MUI scope, component reconciliation, feature scoping)
- Missing definitions added: 4 (mock data scope, visual regression method, pre-existing errors, route group timing)
- Agents used: 4 parallel explorers + 4 parallel writers
