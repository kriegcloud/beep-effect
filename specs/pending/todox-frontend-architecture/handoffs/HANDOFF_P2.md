# Phase 2 Handoff: App Shell & Design System

> **Context Budget**: ~3,200/4,000 tokens | Working: ~1,800 | Episodic: ~600 | Semantic: ~400 | Procedural: links

---

### Working Context (<=2K tokens)

**Mission**: Production-grade layout system with resizable panels, responsive behavior, consolidated component library, Phosphor icon system, and route groups. Build on Phase 1's extracted components to make the AppShell interactive and responsive.

**Success Criteria**:

- [ ] AppShell renders with resizable WorkspaceSidebar (180-400px) and side panel (300-600px) via `react-resizable-panels`
- [ ] Panel sizes persist to localStorage via Effect Atom (`Atom.kvs`)
- [ ] Responsive breakpoints: mobile (<768px) sidebar collapses to Sheet overlay, tablet (768-1024px) auto-collapse, desktop (>1024px) full layout
- [ ] All components use shadcn v3 `base-nova` style (verified via `components.json`)
- [ ] Zero radix imports (only `@base-ui/react`)
- [ ] Zero MUI imports in `apps/todox/` (remove remaining MUI theme files)
- [ ] Phosphor icon system with size presets (sm=16, md=20, lg=24)
- [ ] Route groups created: `(app)/layout.tsx`, `(auth)/layout.tsx`, `(settings)/layout.tsx`
- [ ] `bun run check --filter @beep/todox` passes
- [ ] `bun run lint --filter @beep/todox` passes
- [ ] No file exceeds 300 lines

**Work Items**:

| # | Task | Key Details | Output |
|---|------|-------------|--------|
| 2.1 | Build resizable AppShell | Integrate `react-resizable-panels` (existing `ui/resizable.tsx`). MiniSidebar fixed 50px. WorkspaceSidebar resizable 180-400px. Side panel resizable 300-600px. Persist sizes via `Atom.kvs({ runtime, key, schema, defaultValue })`. | `components/app-shell/app-shell.tsx` rewrite |
| 2.2 | Audit shadcn v3 components | Audit `components/ui/` against `base-nova` style. Verify all use `@base-ui/react`. Add missing: `command` (search), `sheet` (mobile sidebar), `popover` (dropdowns). | `components/ui/` updates |
| 2.3 | Create Phosphor icon system | `components/icons/index.ts` re-exporting common icons with size presets. Mapping doc from prototype audit (old SVG -> Phosphor equivalent). | `components/icons/index.ts` |
| 2.4 | Consolidate CSS variables | Audit `globals.css` (66KB). Remove MUI-specific CSS references. Verify oklch system complete. Add missing tokens. Verify dark mode toggle. DO NOT rewrite -- only surgical edits. | `globals.css` targeted updates |
| 2.5 | Build responsive breakpoints | `hooks/use-media-query.ts`. Mobile: sidebar -> Sheet overlay. Tablet: auto-collapse. Desktop: full layout. | `hooks/use-media-query.ts`, mobile sidebar |
| 2.6 | Set up route groups | `(app)/layout.tsx` (AppShell wrapper), `(auth)/layout.tsx` (centered card), `(settings)/layout.tsx` (AppShell + settings nav). Move auth pages under `(auth)/`. | Route group layouts |

**Blocking Issues**: None. MUI theme files in `apps/todox/src/theme/` are dead code ready for removal.

---

### Episodic Context (<=1K tokens)

**Phase 1 Outcome**: Monolithic `page.tsx` (1,380 lines) decomposed to 33 lines. 10 new files created. All inline SVGs replaced with Phosphor icons. Mock data centralized in `data/mock.ts` with typed interfaces in `types/navigation.ts`. Extracted components: `AppShell` (64 lines), `SettingsNav` (179 lines), `SettingsContentHeader` (17 lines), `SettingsPageHeader` (32 lines), `SettingsTabStrip` (36 lines). Verification: 105/105 typecheck, 0 lint errors.

**Key P1 Decisions**:

- Existing extracted components (navbar/, mini-sidebar/, side-panel/) are TARGET state -- imported as-is
- MUI `styled` import and `StyledAvatar` removed (dead code)
- AppShell wraps MiniSidebarProvider + SidePanelProvider + TopNavbar + content area with portal roots
- Settings sidebar is a new component (no pre-existing extraction existed)

---

### Semantic Context (<=500 tokens)

- shadcn v3 with `base-nova` style, `@base-ui/react` (NOT radix)
- Phosphor React icons (`@phosphor-icons/react`), configured in `components.json`
- Tailwind CSS v4 with oklch color system
- `@effect-atom/atom-react` for all state management (NO TanStack Query)
- Next.js 16 App Router
- `react-resizable-panels` available via existing `components/ui/resizable.tsx`
- Path aliases: `@beep/todox/components`, `@beep/todox/lib/utils`, `@beep/todox/hooks`
- `globals.css` is ~2,700 lines, production-ready. Only surgical edits, never rewrite.
- MUI theme files in `apps/todox/src/theme/` (19 files) are dead code for removal

---

### Gotchas (compressed)

- `globals.css` is 66KB and production-ready. Accidental deletion of CSS variables breaks entire theme. Only add/remove specific MUI references.
- `global-providers.tsx` has `InitColorSchemeScript` and `AppRouterCacheProvider` from MUI. These need replacement or removal in P2.
- `react-resizable-panels` is already installed and wrapped in `components/ui/resizable.tsx`. Use the existing wrapper.
- `Atom.kvs` requires `BrowserKeyValueStore.layerLocalStorage` in the runtime layer (already provided by `@beep/runtime-client`).
- Route groups must preserve existing API routes under `app/api/` unchanged.
- Settings layout reuses AppShell but swaps workspace sidebar for settings nav sidebar.
- MiniSidebar is already interactive (collapsible via context). Don't re-implement its state.

---

### Verification

```bash
bun run check --filter @beep/todox --force
bun run lint:fix --filter @beep/todox

# Architecture gates
grep -r "from ['\"]@mui" apps/todox/src/ --include="*.tsx" --include="*.ts"
# Expected: zero results

grep -r "from ['\"]@radix-ui" apps/todox/src/ --include="*.tsx" --include="*.ts"
# Expected: zero results

grep -r "from ['\"]lucide-react" apps/todox/src/ --include="*.tsx" --include="*.ts"
# Expected: zero results
```

---

### Procedural Context (links only)

- Effect patterns: `.claude/rules/effect-patterns.md`
- Code standards: `.claude/rules/code-standards.md`
- Master orchestration: `specs/pending/todox-frontend-architecture/MASTER_ORCHESTRATION.md` (Section 3, Phase 2)
- P1 audit: `specs/pending/todox-frontend-architecture/outputs/prototype-audit.md`
- Reference bridge: `specs/pending/todox-frontend-architecture/outputs/REFERENCE_BRIDGE.md`
- Taskade app shell reference: `specs/pending/taskade-ui-reference-capture/outputs/ARCHITECTURE_APP_SHELL.md`
- shadcn v3 config: `apps/todox/components.json`

---

### Transition to Phase 3

After Phase 2 completion, create `HANDOFF_P3.md` and `P3_ORCHESTRATOR_PROMPT.md`. Phase 3 focuses on: feature module template, workspace navigation sidebar, dashboard framework with FlexLayout, Lexical editor integration, knowledge graph panel.
