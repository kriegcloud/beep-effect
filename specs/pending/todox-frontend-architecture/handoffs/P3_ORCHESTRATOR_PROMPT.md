# Phase 3 Orchestrator Prompt

> Copy-paste this entire file as a message to start Phase 3 implementation.

---

You are implementing Phase 3 of the `todox-frontend-architecture` spec: **Core Feature Modules**.

## Context

Phase 2 is complete. The AppShell has been rewritten with `react-resizable-panels` (256 lines), responsive behavior via `useBreakpoint()`, and route groups `(app)/`, `(auth)/`, `(settings)/`. Key deliverables:

- `components/app-shell/app-shell.tsx` -- resizable panels: MiniSidebar (fixed 50px), WorkspaceSidebar (180-400px, collapsible), main content (flex), desktop panel layout with `useDefaultLayout` persistence
- `components/icons/index.ts` -- 29 Phosphor icons with size presets (sm=16, md=20, lg=24, xl=32)
- `hooks/use-media-query.ts` -- `useBreakpoint()` returning `{isMobile, isTablet, isDesktop}`
- `app/(app)/layout.tsx` -- wraps children in `<AppShell>`
- `app/(auth)/layout.tsx` -- GuestGuard + AuthSplitLayout
- `app/(settings)/layout.tsx` -- AppShell + SettingsNav

All paths relative to `apps/todox/src/`.

Verification: 105/105 typecheck, 0 lint errors, 0 @radix-ui, 0 lucide-react, 0 @mui in shell layer. MUI remains in `features/mail/`, demo pages, and `ConnectionsSettingsPage` (scoped for later phases).

## Mission

Establish the feature module pattern and build core workspace navigation, dashboard framework, Lexical editor integration, and knowledge graph panel.

**Critical constraint**: Slice-scoped features MUST live in `packages/{slice}/ui/src/`, NOT in `apps/todox/src/features/`. The `apps/todox` directory is for shell, routing, and cross-slice composition only.

## Steps

### Step 1: Audit current state

Read and understand:
- `apps/todox/src/components/app-shell/app-shell.tsx` -- current AppShell with WorkspaceSidebar placeholder
- `packages/workspaces/ui/src/` -- current state of workspaces UI package
- `packages/knowledge/ui/src/` -- current state of knowledge UI package
- `apps/todox/src/features/knowledge-graph/viz/` -- existing force-directed graph renderer
- `apps/todox/src/components/editor/` -- existing Lexical editor (DO NOT modify)
- `packages/iam/client/src/core/atoms.ts` -- canonical atom pattern for server state

### Step 2: Create feature module template (WI 3.1)

Establish canonical feature module structure in the first slice package you work on:
```
packages/{slice}/ui/src/
├── components/      # React components
│   ├── component-name.tsx
│   └── index.ts     # Barrel export
├── hooks/           # Custom hooks
├── types/           # TypeScript types
└── index.ts         # Package entry point
```

### Step 3: Build workspace navigation sidebar (WI 3.2)

Create workspace navigation in `packages/workspaces/ui/src/`:
- Workspace tree with page hierarchy
- Use `runtime.atom()` for workspace data fetching
- Canonical atom pattern: `packages/iam/client/src/core/atoms.ts`
- Wire to AppShell: replace the placeholder `WorkspaceSidebar` component in `app-shell.tsx` with the real workspace tree

### Step 4: Build dashboard framework (WI 3.3)

Create dashboard at `apps/todox/src/app/(app)/dashboard/page.tsx`:
- Use FlexLayout (or similar) for widget arrangement
- Create placeholder widgets: recent-activity, upcoming-meetings, action-items
- Widgets can use mock data initially

### Step 5: Integrate Lexical editor (WI 3.4)

Create `apps/todox/src/app/(app)/workspace/[id]/[pageId]/page.tsx`:
- Render existing Lexical editor from `components/editor/`
- Ensure proper height management (fills AppShell content area)
- DO NOT modify the editor itself

### Step 6: Build knowledge graph panel (WI 3.5)

Migrate and wrap existing knowledge graph:
- Move `features/knowledge-graph/viz/` to `packages/knowledge/ui/src/viz/`
- Create `packages/knowledge/ui/src/components/graph-explorer.tsx`
- Wire to `apps/todox/src/app/(app)/knowledge/page.tsx`

### Step 7: Workspace management views (WI 3.6)

Create workspace management in `packages/workspaces/ui/src/`:
- Workspace creation dialog
- Workspace settings entry point
- Wire workspace selector in MiniSidebar to navigate between workspaces

### Step 8: Verification gates

```bash
bun run check --filter @beep/todox --force
bun run lint:fix --filter @beep/todox

# Architecture gates
grep -r "from ['\"]@radix-ui" apps/todox/src/ --include="*.tsx" --include="*.ts"
# Expected: zero results

# Slice boundary check
grep -r "from ['\"]@beep/todox" packages/ --include="*.tsx" --include="*.ts"
# Expected: zero results (packages should NOT import from apps/todox)

# File size check
find apps/todox/src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
# Expected: no file over 300 lines
```

## Critical Rules

1. **Slice-scoped features in `packages/{slice}/ui/src/`**, NOT `apps/todox/src/features/`
2. **Icons: Phosphor ONLY** (`@phosphor-icons/react`). Import from `@beep/todox/components/icons` for common icons.
3. **State: Effect Atom ONLY** (`@effect-atom/atom-react`). NO TanStack Query. `TanStack Form` for forms.
4. **DO NOT modify `components/editor/`** -- production-ready Lexical editor.
5. **DO NOT modify `globals.css`** -- production-ready oklch tokens.
6. **No file exceeds 300 lines.**
7. **All client components need `"use client"` directive.**
8. **Canonical atom pattern**: See `packages/iam/client/src/core/atoms.ts` for `runtime.atom()` / `runtime.fn()` usage.

## Reference Files

| File | Purpose |
|------|---------|
| `specs/pending/todox-frontend-architecture/handoffs/HANDOFF_P3.md` | Full Phase 3 context |
| `specs/pending/todox-frontend-architecture/MASTER_ORCHESTRATION.md` | Master plan (Section 3, Phase 3) |
| `specs/pending/todox-frontend-architecture/outputs/REFERENCE_BRIDGE.md` | Architecture reference |
| `packages/iam/client/src/core/atoms.ts` | Canonical atom pattern |
| `apps/todox/src/components/app-shell/app-shell.tsx` | Current AppShell with placeholder |
| `.claude/rules/effect-patterns.md` | Effect coding conventions |

## After Completing Phase 3

1. Update `REFLECTION_LOG.md` with learnings, key insights, pattern candidates, and gotchas
2. Create `HANDOFF_P4.md` (context document for Phase 4: Settings & Profile)
3. Create `P4_ORCHESTRATOR_PROMPT.md` (copy-paste prompt to start Phase 4)
