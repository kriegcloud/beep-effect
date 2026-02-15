# Phase 1 Handoff: Prototype Decomposition

> **Context Budget**: ~3,144/4,000 tokens (786 words, verified) | Working: ~1,600 | Episodic: ~600 | Semantic: ~400 | Procedural: links

---

### Working Context (<=2K tokens)

**Mission**: Decompose `apps/todox/src/app/app-layout/page.tsx` (1,380 lines) into proper modules WITHOUT changing visual behavior. Pure extraction refactor. Page should go from 1,380 lines to <100 lines of route composition.

**Success Criteria**:

- [ ] `page.tsx` reduced to <100 lines (imports + layout JSX)
- [ ] All extracted components render without visual regression
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
- No new MUI imports. Existing `styled()` on line 2 of page.tsx must be replaced with Tailwind during extraction.
- Do NOT modify `globals.css` (~2,700 lines, production-ready) or `global-providers.tsx` (production-ready).

**Work Items**:

| # | Task | Key Details | Output |
|---|------|-------------|--------|
| 1 | Audit the prototype | Read full page.tsx. Catalog: UI sections with line ranges, inline SVGs with Phosphor equivalents, mock data locations, MUI usage, already-extracted component divergence, commented-out code intent. Also review `mini-sidebar/`, `navbar/`, `sidebar/`, `side-panel/` directories. | `outputs/prototype-audit.md` |
| 2 | Extract AppShell layout | Outermost structural component: MiniSidebar, WorkspaceSidebar, main content, SidePanel, Navbar. Use `react-resizable-panels` via existing `ui/resizable.tsx`. | `components/app-shell/app-shell.tsx` + `index.ts` |
| 3 | Extract navigation components | Verify existing extractions in `mini-sidebar/`, `navbar/`, `sidebar/` match page.tsx. Reconcile divergence. Remove inline duplicates. Decide flat vs grouped structure. | Updated component directories |
| 4 | Replace inline SVGs with Phosphor | Use audit from WI-1. Match original sizes. Custom SVGs with no Phosphor equivalent go in `components/icons/`. | All component files updated |
| 5 | Remove mock data, establish contracts | Create `types/` for interfaces, `data/mock.ts` for centralized mock data. Components accept data via props/context. Plain TS interfaces (not Effect Schema yet). | `types/`, `data/mock.ts` |

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

---

### Verification

```bash
bun run check --filter @beep/todox
bun run lint:fix --filter @beep/todox
# If upstream errors, isolate:
bun tsc --noEmit --isolatedModules apps/todox/src/components/app-shell/app-shell.tsx
```

Document any pre-existing errors in the reflection log.

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
