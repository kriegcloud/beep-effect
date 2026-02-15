# Phase 3 Handoff: Core Feature Modules

> **Context Budget**: ~3,100/4,000 tokens | Working: ~1,800 | Episodic: ~600 | Semantic: ~400 | Procedural: links

---

### Working Context (<=2K tokens)

**Mission**: Establish the feature module pattern and build core workspace navigation, dashboard framework, Lexical editor integration, and knowledge graph panel. All slice-scoped features live in `packages/{slice}/ui/src/`, NOT in `apps/todox/src/features/`.

**Success Criteria**:

- [ ] Feature module template established with canonical structure: `components/`, `hooks/`, `types/`, `index.ts`
- [ ] Workspace sidebar in `packages/workspaces/ui/src/` displays workspace tree with page hierarchy
- [ ] Workspace sidebar wired to `(app)/layout.tsx` via the resizable AppShell WorkspaceSidebar panel
- [ ] Dashboard page at `(app)/dashboard/page.tsx` renders FlexLayout with placeholder widgets
- [ ] Lexical editor loads within `(app)/workspace/[id]/[pageId]/page.tsx` inside AppShell content area
- [ ] Knowledge graph renders at `(app)/knowledge/page.tsx` from `packages/knowledge/ui/src/`
- [ ] Workspace switching works via MiniSidebar
- [ ] All slice-scoped features in `packages/{slice}/ui/`
- [ ] `bun run check --filter @beep/todox` passes
- [ ] No file exceeds 300 lines

**Work Items**:

| # | Task | Key Details | Output |
|---|------|-------------|--------|
| 3.1 | Create feature module template | Canonical structure in first slice package. `components/`, `hooks/`, `types/`, barrel `index.ts`. | Pattern documentation in code |
| 3.2 | Build workspace navigation sidebar | Workspace tree, page hierarchy in `packages/workspaces/ui/src/`. Use `runtime.atom()` for data fetching (canonical: `packages/iam/client/src/core/atoms.ts`). Wire to `(app)/layout.tsx` WorkspaceSidebar panel. | `packages/workspaces/ui/src/` |
| 3.3 | Build dashboard framework | FlexLayout widget arrangement. Placeholder widgets: recent-activity, upcoming-meetings, action-items. Wire to `(app)/dashboard/page.tsx`. | Dashboard route + components |
| 3.4 | Integrate Lexical editor | `(app)/workspace/[id]/[pageId]/page.tsx` rendering existing `components/editor/`. Proper height management in AppShell content area. | Route file + integration |
| 3.5 | Build knowledge graph panel | Migrate `features/knowledge-graph/viz/` to `packages/knowledge/ui/src/viz/`. Create graph-explorer.tsx. Wire to `(app)/knowledge/page.tsx`. | `packages/knowledge/ui/src/` |
| 3.6 | Workspace management views | Workspace creation dialog, workspace settings. MiniSidebar workspace selector navigation. | `packages/workspaces/ui/src/` |

**Blocking Issues**: None. AppShell WorkspaceSidebar panel is a placeholder ready to receive workspace tree content.

---

### Episodic Context (<=1K tokens)

**Phase 2 Outcome**: AppShell rewritten to 256 lines with `react-resizable-panels`. Responsive behavior via `useBreakpoint()`: mobile Sheet overlay, tablet auto-collapse, desktop full layout. Panel persistence via `useDefaultLayout`. Route groups created: `(app)/`, `(auth)/`, `(settings)/`. MUI removed from shell layer (26 theme files deleted, global-providers cleaned). Phosphor icon system at `components/icons/index.ts` (29 icons, 4 size presets). Verification: 105/105 typecheck, 0 lint errors, 0 @radix-ui, 0 lucide-react.

**Key P2 Decisions**:

- `react-resizable-panels` `useDefaultLayout` handles panel size persistence (not Atom.kvs yet)
- MUI removal scoped to shell layer only; `features/mail/`, demo pages, `ConnectionsSettingsPage` still use MUI
- `app-layout/page.tsx` moved to `(settings)/app-layout/` (it renders settings content)
- WorkspaceSidebar is a placeholder component ready for Phase 3 content injection
- AppShell has `usePanelRef` for imperative panel collapse/expand on breakpoint changes

---

### Semantic Context (<=500 tokens)

- shadcn v3 with `base-nova` style, `@base-ui/react` (NOT radix)
- Phosphor React icons (`@phosphor-icons/react`), size presets at `components/icons/index.ts`
- Tailwind CSS v4 with oklch color system, dark mode via `.dark` class
- `@effect-atom/atom-react` for ALL state management (NO TanStack Query)
- `TanStack Form` for form state
- Next.js 16 App Router with route groups: `(app)/`, `(auth)/`, `(settings)/`
- `react-resizable-panels` for AppShell panel layout
- Path aliases: `@beep/todox/components`, `@beep/todox/lib/utils`, `@beep/todox/hooks`
- Existing Lexical editor at `components/editor/` -- production-ready, DO NOT modify
- Vertical slice scoping: slice features in `packages/{slice}/ui/src/`, NOT `apps/todox/src/features/`
- Canonical atom pattern: `packages/iam/client/src/core/atoms.ts`

---

### Gotchas (compressed)

- AppShell WorkspaceSidebar is currently a placeholder div. Phase 3 replaces it with workspace tree from `packages/workspaces/ui/src/`.
- `components/editor/` is production-ready Lexical + Liveblocks. DO NOT modify -- only create route wrapper.
- MiniSidebar workspace avatars are mock data. Phase 3 wires them to actual workspace switching.
- `features/knowledge-graph/viz/` exists with force-directed graph renderer. Migrate to `packages/knowledge/ui/src/viz/`, don't rewrite.
- FlexLayout package needs to be verified/installed for dashboard widget arrangement.
- All new slice UI components must be in `packages/{slice}/ui/src/`, NOT in `apps/todox/src/features/`.
- The `(app)/layout.tsx` currently just wraps children in `<AppShell>`. The workspace sidebar content injection happens through the AppShell's WorkspaceSidebar component, not through layout props.

---

### Verification

```bash
bun run check --filter @beep/todox --force
bun run lint:fix --filter @beep/todox

# Architecture gates
grep -r "from ['\"]@radix-ui" apps/todox/src/ --include="*.tsx" --include="*.ts"
# Expected: zero results

# File size check
find apps/todox/src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
# Expected: no file over 300 lines
```

---

### Procedural Context (links only)

- Effect patterns: `.claude/rules/effect-patterns.md`
- Code standards: `.claude/rules/code-standards.md`
- Master orchestration: `specs/pending/todox-frontend-architecture/MASTER_ORCHESTRATION.md` (Section 3, Phase 3)
- Reference bridge: `specs/pending/todox-frontend-architecture/outputs/REFERENCE_BRIDGE.md`
- Canonical atom patterns: `packages/iam/client/src/core/atoms.ts`
- AppShell source: `apps/todox/src/components/app-shell/app-shell.tsx`
- Existing knowledge graph viz: `apps/todox/src/features/knowledge-graph/viz/`

---

### Transition to Phase 4

After Phase 3 completion, create `HANDOFF_P4.md` and `P4_ORCHESTRATOR_PROMPT.md`. Phase 4 focuses on: settings shell refinement, account settings forms, security settings, notification preferences, integration management.
