# Phase 2 Orchestrator Prompt

> Copy-paste this entire file as a message to start Phase 2 implementation.

---

You are implementing Phase 2 of the `todox-frontend-architecture` spec: **App Shell & Design System**.

## Context

Phase 1 is complete. The monolithic `apps/todox/src/app/app-layout/page.tsx` (1,380 lines) has been decomposed into 10 modular files totaling ~33 lines in page.tsx. Key components created:

- `components/app-shell/app-shell.tsx` (64 lines) -- outermost shell with providers, navbar, sidebar, portal roots
- `components/settings-nav/settings-nav.tsx` (179 lines) -- settings sidebar with nav items
- `components/settings-content/` -- header, page header, tab strip
- `data/mock.ts` (74 lines) -- centralized mock data with Phosphor icons
- `types/navigation.ts` (33 lines) -- TypeScript interfaces

All verification gates passed: 105/105 typecheck, 0 lint errors, 0 inline SVGs, 0 MUI imports in page.tsx.

## Mission

Build a production-grade layout system with:
1. **Resizable panels** via `react-resizable-panels` (already available in `components/ui/resizable.tsx`)
2. **Responsive breakpoints** (mobile sheet sidebar, tablet auto-collapse, desktop full layout)
3. **Route groups** for layout boundaries: `(app)/`, `(auth)/`, `(settings)/`
4. **Phosphor icon system** with standardized size presets
5. **shadcn v3 component audit** ensuring all use `@base-ui/react`
6. **MUI removal** from remaining locations (theme files, global-providers.tsx)

## Steps

### Step 1: Audit current state

Read and understand current component structure:
- `apps/todox/src/components/app-shell/app-shell.tsx` -- current AppShell
- `apps/todox/src/components/ui/resizable.tsx` -- existing resizable panel wrapper
- `apps/todox/src/global-providers.tsx` -- provider stack with MUI references
- `apps/todox/src/theme/` -- MUI theme files (dead code to remove)
- `apps/todox/components.json` -- shadcn v3 configuration
- `apps/todox/src/components/mini-sidebar/mini-sidebar.tsx` -- existing interactive sidebar

### Step 2: Build resizable AppShell (WI 2.1)

Rewrite `app-shell.tsx` to integrate `react-resizable-panels`:
- MiniSidebar: fixed 50px (not resizable)
- WorkspaceSidebar: resizable 180-400px
- Side panel (AI chat): resizable 300-600px
- Persist panel sizes via `Atom.kvs({ runtime, key: "panel-sizes", schema, defaultValue })`
- Use existing `BrowserKeyValueStore.layerLocalStorage` from `@beep/runtime-client`

### Step 3: Responsive breakpoints (WI 2.5)

Create `hooks/use-media-query.ts`:
- Mobile (<768px): sidebar as Sheet overlay, single-column layout
- Tablet (768-1024px): sidebar auto-collapses, expandable on hover/click
- Desktop (>1024px): full multi-panel layout

### Step 4: Audit and update shadcn components (WI 2.2)

Audit `components/ui/` against `base-nova` style:
- Verify all use `@base-ui/react` primitives (NOT `@radix-ui/react`)
- Add missing components: `command` (for search), `sheet` (for mobile sidebar), `popover` (for dropdowns)
- Use `bunx shadcn@latest add <component>` to add missing ones

### Step 5: Create Phosphor icon system (WI 2.3)

Create `components/icons/index.ts`:
- Re-export commonly used Phosphor icons with size presets (sm=16, md=20, lg=24)
- Include mapping from prototype audit (inline SVG -> Phosphor equivalent)

### Step 6: CSS variable consolidation (WI 2.4)

Audit `globals.css` (~2,700 lines):
- Identify and remove MUI-specific CSS variable references
- Verify oklch color system is complete for all component needs
- Verify dark mode works via `data-theme` attribute or class strategy
- DO NOT rewrite the file. Only surgical additions/removals.

### Step 7: Set up route groups (WI 2.6)

Create route group layouts:
- `app/(app)/layout.tsx` -- AppShell wrapper (RSC)
- `app/(auth)/layout.tsx` -- centered auth card layout
- `app/(settings)/layout.tsx` -- AppShell + settings nav sidebar
- Move existing auth pages under `(auth)/`
- Preserve `app/api/` routes unchanged
- Keep `app/app-layout/page.tsx` as development reference (can coexist with route groups)

### Step 8: Remove MUI dependencies (part of WI 2.4)

- Remove `apps/todox/src/theme/` directory (19 MUI theme files, all dead code)
- Update `global-providers.tsx` to remove `InitColorSchemeScript` and `AppRouterCacheProvider`
- Remove MUI packages from `apps/todox/package.json` if no other imports remain
- Run `grep -r "from ['\"]@mui" apps/todox/src/` to verify zero results

### Step 9: Verification gates

Run all verification commands:
```bash
bun run check --filter @beep/todox --force
bun run lint:fix --filter @beep/todox

# Architecture gates
grep -r "from ['\"]@mui" apps/todox/src/ --include="*.tsx" --include="*.ts"
grep -r "from ['\"]@radix-ui" apps/todox/src/ --include="*.tsx" --include="*.ts"
grep -r "from ['\"]lucide-react" apps/todox/src/ --include="*.tsx" --include="*.ts"
grep -rn "<svg" apps/todox/src/ --include="*.tsx" | grep -v "node_modules" | grep -v "components/editor/"

# File size check
find apps/todox/src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```

## Critical Rules

1. **shadcn v3 uses `@base-ui/react`** (NOT radix). Verify in `components.json`: `style: "base-nova"`
2. **Icons: Phosphor ONLY** (`@phosphor-icons/react`). No lucide. No inline SVGs.
3. **State: Effect Atom ONLY** (`@effect-atom/atom-react`). NO TanStack Query.
4. **DO NOT rewrite `globals.css`** -- only surgical edits. 66KB of production-ready oklch tokens.
5. **DO NOT modify `components/editor/`** -- Lexical editor is production-ready.
6. **No file exceeds 300 lines.**
7. **All client components need `"use client"` directive.**

## Reference Files

| File | Purpose |
|------|---------|
| `specs/pending/todox-frontend-architecture/handoffs/HANDOFF_P2.md` | Full Phase 2 context |
| `specs/pending/todox-frontend-architecture/MASTER_ORCHESTRATION.md` | Master plan (Section 3, Phase 2) |
| `specs/pending/todox-frontend-architecture/outputs/prototype-audit.md` | P1 prototype audit |
| `specs/pending/todox-frontend-architecture/outputs/REFERENCE_BRIDGE.md` | Architecture reference |
| `specs/pending/taskade-ui-reference-capture/outputs/ARCHITECTURE_APP_SHELL.md` | Layout inspiration |
| `apps/todox/components.json` | shadcn v3 config |
| `.claude/rules/effect-patterns.md` | Effect coding conventions |

## After Completing Phase 2

1. Update `REFLECTION_LOG.md` with learnings, key insights, pattern candidates, and gotchas
2. Create `HANDOFF_P3.md` (context document for Phase 3: Core Feature Modules)
3. Create `P3_ORCHESTRATOR_PROMPT.md` (copy-paste prompt to start Phase 3)
