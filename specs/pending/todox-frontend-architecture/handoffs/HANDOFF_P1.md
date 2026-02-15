# Phase 1 Handoff: Prototype Decomposition

> **Context Budget**: ~3,144/4,000 tokens (786 words, verified) | Working: ~1,600 | Episodic: ~600 | Semantic: ~400 | Procedural: links

---

### Working Context (<=2K tokens)

**Mission**: Decompose `apps/todox/src/app/app-layout/page.tsx` (1,380 lines) into proper modules WITHOUT changing visual behavior. Pure extraction refactor. Page should go from 1,380 lines to <100 lines of route composition.

**Success Criteria**:

- [ ] `page.tsx` reduced to <100 lines (imports + layout JSX)
- [ ] All extracted components render without visual regression (verify: `bun run check --filter @beep/todox` passes + manual visual inspection via `bun run dev` on the `/app-layout` route)
- [ ] No inline SVG icons remain (all replaced with Phosphor)
- [ ] No hardcoded mock data in components (centralized in `data/mock.ts` with typed interfaces)
- [ ] All client component files have `"use client"` as first line where needed
- [ ] No file exceeds 300 lines
- [ ] No new MUI imports introduced
- [ ] `bun run check --filter @beep/todox` passes (or pre-existing errors documented)
- [ ] `bun run lint:fix --filter @beep/todox` passes

**Critical Constraints**:

- shadcn v3 uses `@base-ui/react` (NOT radix). Verify in `apps/todox/components.json`: `style: "base-nova"`, `iconLibrary: "phosphor"`
- Icons: Phosphor ONLY (`@phosphor-icons/react`). No lucide-react. No inline SVGs.
- No new MUI imports introduced. Remove the unused `styled` import and `StyledAvatar` definition from page.tsx (they are dead code). Do NOT modify `global-providers.tsx` -- its MUI providers (`InitColorSchemeScript`, `AppRouterCacheProvider`) are deferred to a later phase.
- Do NOT modify `globals.css` (~2,700 lines, production-ready) or `global-providers.tsx` (production-ready).

**Work Items**:

| # | Task | Key Details | Output |
|---|------|-------------|--------|
| 1 | Audit the prototype | Read full page.tsx. Catalog: UI sections with line ranges, inline SVGs with Phosphor equivalents, mock data locations, MUI usage, already-extracted component divergence, commented-out code intent. Also review `mini-sidebar/`, `navbar/`, `sidebar/`, `side-panel/` directories. | `outputs/prototype-audit.md` |
| 2 | Extract AppShell layout | Outermost structural component: MiniSidebar, WorkspaceSidebar, main content, SidePanel, Navbar. Use `react-resizable-panels` via existing `ui/resizable.tsx`. | `components/app-shell/app-shell.tsx` + `index.ts` |
| 3 | Extract navigation components | Extracted components in `mini-sidebar/`, `navbar/`, `sidebar/`, `side-panel/` are the TARGET state (page.tsx is the SOURCE). Reconcile divergence: merge newer page.tsx content INTO extracted components, wire imports, delete inline duplicates. Decide flat vs grouped structure. Reconciliation rule: the extracted components (e.g., `top-navbar.tsx` which already uses Phosphor icons) represent the TARGET state. page.tsx is the SOURCE of current content. Strategy: (1) merge any newer content from page.tsx into extracted components, (2) wire page.tsx to import from extracted components, (3) delete duplicated inline code from page.tsx. | Updated component directories |
| 4 | Replace inline SVGs with Phosphor | Use audit from WI-1. Match original sizes. Custom SVGs with no Phosphor equivalent go in `components/icons/`. Decision rule: The settings gear icon (page.tsx line 67-81) maps to Phosphor `<GearSix>`. For other custom SVGs with complex `fillRule='evenodd'` paths, first check Phosphor's icon catalog. If no match exists, wrap the SVG in a `components/icons/{IconName}.tsx` component (e.g., `components/icons/CustomSettingsIcon.tsx`). There are ~7 custom SVGs and ~32 standard Lucide icons. | All component files updated |
| 5 | Remove mock data, establish contracts | Create `types/` for interfaces, `data/mock.ts` for centralized mock data. Components accept data via props/context. Mock data includes: navigation items, user profile data (e.g., 'benjamintoppold'), workspace names, sidebar menu items. It does NOT include: CSS values, icon sizes, layout constants, or Tailwind class strings. Plain TS interfaces (not Effect Schema yet). | `types/`, `data/mock.ts` |

**Blocking Issues**: None identified. All dependencies are local to `apps/todox`.

---

### Episodic Context (<=1K tokens)

**Pre-Phase Research Summary**: The research phase identified TodoX as an AI-native wealth management knowledge platform for RIAs/MFOs with UHNWI clients ($30M+ AUM). The hero feature is GraphRAG meeting prep. The monolithic prototype mixes production-ready code (provider stack, theme CSS, Lexical editor, 60+ shadcn components) with throwaway scaffolding (inline SVGs, hardcoded data, MUI styled imports).

**Key Decisions Made**:

- Preserve `globals.css`, `global-providers.tsx`, `components/editor/`, and `components/ui/` as-is (production-ready)
- Components in `mini-sidebar/`, `navbar/`, `sidebar/`, `side-panel/` are partially extracted and need reconciliation with page.tsx
- Phase 1 is extraction-only; no new features, no backend integration, no Effect Schema for UI types
- AppShell uses `react-resizable-panels` (already available via `ui/resizable.tsx`)

---

### Semantic Context (<=500 tokens)

- shadcn v3 with `base-nova` style, `@base-ui/react` (NOT radix)
- Phosphor React icons (`@phosphor-icons/react`), configured in `components.json`
- Tailwind CSS v4 with oklch color system
- `@effect-atom/atom-react` for all state: reactive (`Atom`), server (`runtime.atom`/`runtime.fn`), URL (`Atom.searchParam`), storage (`Atom.kvs`)
- Next.js 16 App Router
- Registries: basecn, elevenlabs-ui, prompt-kit, shadcn-editor, billingsdk
- Path aliases: `@beep/todox/components`, `@beep/todox/components/ui`, `@beep/todox/lib/utils`, `@beep/todox/hooks`
- `"use client"` must be first line of any file using React hooks/event handlers/browser APIs

---

### Gotchas (compressed)

- MUI `styled()` on line 2 of page.tsx: replace with Tailwind `cn()` during extraction, do NOT add new MUI imports
- Commented-out code may contain useful intent signals; document in audit, move to relevant extracted files
- `app-layout/` is a Next.js route segment; keep route file thin, components are separate concern
- Already-extracted components may have diverged from page.tsx; audit must reconcile
- CSS classes from `globals.css` (e.g., `header-panel-orb-backdrop`) must continue working after extraction
- Some components depend on React context from `global-providers.tsx`; verify extracted components stay within provider tree
- Route groups (`(app)/`, `(auth)/`, `(settings)/`) are Phase 2 scope. P1 keeps `app-layout/page.tsx` in its current location. Do NOT move route files.

---

### Verification

```bash
bun run check --filter @beep/todox
bun run lint:fix --filter @beep/todox
# If upstream errors, isolate:
bun tsc --noEmit --isolatedModules apps/todox/src/components/app-shell/app-shell.tsx
```

Document any pre-existing errors in the reflection log.

**Pre-existing lint errors** (fix during P1):
- Line 113: biome suppression comment with `<explanation>` placeholder -- replace with actual explanation or remove if suppression is no longer needed
- Line 2: unsorted imports -- run `bun run lint:fix --filter @beep/todox` to auto-fix
- 6 unrelated warnings exist in demo/editor/chart files -- ignore, they are out of P1 scope.

---

### Procedural Context (links only)

- Effect patterns: `.claude/rules/effect-patterns.md`
- Code standards: `.claude/rules/code-standards.md`
- Spec overview: `specs/pending/todox-frontend-architecture/README.md`
- Master orchestration: `specs/pending/todox-frontend-architecture/MASTER_ORCHESTRATION.md`
- Product requirements: `documentation/todox/PRD.md`
- shadcn v3 config: `apps/todox/components.json`

---

### Transition to Phase 2

After Phase 1 completion, create `HANDOFF_P2.md` and `P2_ORCHESTRATOR_PROMPT.md`. Phase 2 focuses on: formalizing AppShell responsive behavior, extracting design tokens from globals.css, establishing navigation state with Effect Atom, removing remaining MUI dependencies.
