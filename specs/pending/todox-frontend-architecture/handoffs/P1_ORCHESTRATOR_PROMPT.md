# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `todox-frontend-architecture` spec: **Prototype Decomposition**.

### Context

TodoX is an AI-native wealth management knowledge platform for RIAs/MFOs serving UHNWI ($30M+ AUM). A 1,380-line monolithic prototype at `apps/todox/src/app/app-layout/page.tsx` needs decomposition into proper modules. Tech stack: shadcn v3 (`base-nova` style, `@base-ui/react` NOT radix), Phosphor icons (`@phosphor-icons/react`), Tailwind v4 with oklch, Effect Atom, Next.js 16 App Router.

**Existing extracted components** (may be out of sync with page.tsx -- reconcile during audit):

| Directory | Components |
|-----------|-----------|
| `components/mini-sidebar/` | MiniSidebar |
| `components/navbar/` | TopNavbar, CommandSearch, UserDropdown, NotificationDropdown |
| `components/sidebar/` | MainContentPanelSidebar, NavMain, NavProjects, NavUser, OrgSwitcher, TeamSwitcher |
| `components/side-panel/` | SidePanel |
| `components/editor/` | Full Lexical editor system (production-ready, DO NOT modify) |
| `components/ui/` | 60+ shadcn primitives (production-ready, DO NOT modify) |

All paths above are relative to `apps/todox/src/`.

### Your Mission

Break apart `page.tsx` into properly organized components WITHOUT changing visual behavior. This is a pure extraction refactor. The end state is `page.tsx` under 100 lines that imports and composes extracted modules.

### Steps

#### Step 1: Audit the Prototype

Read the full prototype and all existing extracted component directories. Create `specs/pending/todox-frontend-architecture/outputs/prototype-audit.md` documenting: every UI section (with line ranges), every inline SVG (with proposed Phosphor equivalent), every hardcoded mock data object, every MUI import, divergence between page.tsx and extracted components, commented-out code intent, and a proposed file tree (all files under 300 lines). Use the `codebase-researcher` agent.

#### Step 2: Extract AppShell

Create `apps/todox/src/components/app-shell/` with `app-shell.tsx` (arranges MiniSidebar + WorkspaceSidebar + Content + SidePanel + Navbar) and `index.ts` barrel. Use `components/ui/resizable.tsx` for panel sizing.

#### Step 3: Extract/Reconcile Navigation

For each existing extraction in `mini-sidebar/`, `navbar/`, `sidebar/`, `side-panel/`: compare against what page.tsx renders, update whichever is stale, ensure page.tsx imports from extracted components with no duplicate inline code.

#### Step 4: Replace Icons

Replace every inline `<svg>` with its Phosphor equivalent (`<IconName size={N} weight="regular" />`). For SVGs with no match, create components in `components/icons/`. Update ALL component files, not just page.tsx.

#### Step 5: Clean Mock Data

Create `types/navigation.ts` (and other type files) with TypeScript interfaces. Move all hardcoded data to `data/mock.ts`, clearly labeled as temporary. Update components to accept data via props or centralized import. No backend integrations -- just clean interfaces.

### Critical Rules

1. **NO new MUI imports** -- document existing ones for future removal
2. **Icons**: `@phosphor-icons/react` ONLY -- no lucide, no inline SVGs
3. **Style**: `base-nova` (base-ui, NOT radix) -- verify against `apps/todox/components.json`
4. **`"use client"`** MUST be the first line before any imports for client components
5. **Max 300 lines per file** -- decompose further if needed

See `HANDOFF_P1.md` for full rules including Effect patterns, CSS class preservation, path aliases, and provider stack constraints.

### Reference Files

| File | Purpose |
|------|---------|
| `apps/todox/src/app/app-layout/page.tsx` | Monolithic prototype to decompose |
| `apps/todox/components.json` | shadcn v3 config (base-nova, phosphor) |
| `apps/todox/src/app/globals.css` | Theme CSS (~2,700 lines, preserve) |
| `apps/todox/src/global-providers.tsx` | Provider stack (preserve) |
| `apps/todox/src/components/mini-sidebar/` | Existing MiniSidebar |
| `apps/todox/src/components/navbar/` | Existing Navbar components |
| `apps/todox/src/components/sidebar/` | Existing Sidebar components |
| `apps/todox/src/components/ui/resizable.tsx` | Resizable panel primitive |

### Verification

After each extraction step:

```bash
bun run check --filter @beep/todox
bun run lint:fix --filter @beep/todox
```

If `bun run check` fails due to upstream errors unrelated to your changes, isolate:

```bash
bun tsc --noEmit --isolatedModules path/to/your/file.tsx
```

Document any pre-existing errors in `specs/pending/todox-frontend-architecture/REFLECTION_LOG.md`.

### Success Criteria

- [ ] `page.tsx` reduced to <100 lines of route composition
- [ ] All extracted components render without visual regression
- [ ] No inline SVG icons remain (all Phosphor or custom icon components)
- [ ] No hardcoded mock data in component files (centralized in `data/mock.ts`)
- [ ] All client component files have proper `"use client"` directives
- [ ] No file exceeds 300 lines
- [ ] No new MUI imports (existing usage documented)
- [ ] `bun run check --filter @beep/todox` passes (or pre-existing errors documented)
- [ ] `bun run lint:fix --filter @beep/todox` passes

### Handoff Document

Read full context in: `specs/pending/todox-frontend-architecture/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings, key insights, pattern candidates, and gotchas
2. Create `HANDOFF_P2.md` (context document for Phase 2: App Shell and Design Tokens)
3. Create `P2_ORCHESTRATOR_PROMPT.md` (copy-paste prompt to start Phase 2)
