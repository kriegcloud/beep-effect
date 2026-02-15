# Agent Prompts: TodoX Frontend Architecture

> Copy-paste ready prompts for sub-agents used during spec execution.

---

## Phase 1: Prototype Decomposition

### P1-A1: Prototype Audit (codebase-researcher)

**Agent**: `codebase-researcher`
**Output**: `specs/pending/todox-frontend-architecture/outputs/prototype-audit.md`

```
Audit `apps/todox/src/app/app-layout/page.tsx` (1,380 lines) and document:

1. **UI Sections**: Every distinct visual section with line ranges (Navbar, MiniSidebar, WorkspaceSidebar, ContentArea)
2. **Inline SVGs**: Every `<svg>` element with line range, visual description, and proposed Phosphor icon equivalent
3. **Mock Data**: Every hardcoded array/object/constant with line ranges
4. **MUI Usage**: Every MUI import or `styled()` call with Tailwind replacement
5. **Component Divergence**: Cross-reference page.tsx with existing extracted components:
   - `apps/todox/src/components/mini-sidebar/`
   - `apps/todox/src/components/navbar/`
   - `apps/todox/src/components/sidebar/`
   - `apps/todox/src/components/side-panel/`
6. **Commented-Out Code**: Document sections with apparent intent
7. **Extraction Plan**: Proposed file tree (all files under 300 lines)

Format as markdown tables where possible. Include line numbers for every finding.
```

### P1-A2: Component Extraction (react-expert)

**Agent**: `react-expert`
**Depends on**: P1-A1 output (prototype-audit.md)

```
Using the audit at `specs/pending/todox-frontend-architecture/outputs/prototype-audit.md`, extract components from `apps/todox/src/app/app-layout/page.tsx`.

Tech constraints:
- shadcn v3 with `base-nova` style (`@base-ui/react`, NOT radix) -- see `apps/todox/components.json`
- Phosphor icons (`@phosphor-icons/react`) -- NO lucide, NO inline SVGs
- Tailwind v4 -- NO MUI `styled()` or component imports
- "use client" MUST be first line before imports for client components
- Max 300 lines per file
- Effect patterns: namespace imports (`import * as A from "effect/Array"`), no native methods

Tasks:
1. Create `apps/todox/src/components/app-shell/app-shell.tsx` -- L-shaped layout composition
2. Create `apps/todox/src/components/app-shell/index.ts` -- barrel export
3. Reconcile existing extractions in `mini-sidebar/`, `navbar/`, `sidebar/`, `side-panel/` with page.tsx
4. Replace ALL inline SVGs with Phosphor icons
5. Move mock data to `apps/todox/src/data/mock.ts` with TypeScript interfaces in `apps/todox/src/types/`
6. Reduce page.tsx to <100 lines of route composition

Verify after each step:
- `bun run check --filter @beep/todox`
- `bun run lint:fix --filter @beep/todox`

Preserve `globals.css` and `global-providers.tsx` unchanged.
```

### P1-A3: Icon Replacement (react-expert)

**Agent**: `react-expert`
**Depends on**: P1-A1 output (SVG-to-Phosphor mapping)

```
Replace ALL inline SVG icons in `apps/todox/src/` with Phosphor React equivalents.

Using the SVG inventory from `specs/pending/todox-frontend-architecture/outputs/prototype-audit.md`:

1. Verify `@phosphor-icons/react` is in `apps/todox/package.json`
2. For each inline SVG:
   - Replace `<svg>...</svg>` with `<IconName size={N} weight="regular" />`
   - Match original dimensions from SVG width/height attributes
3. For custom SVGs with no Phosphor match:
   - Create React component in `apps/todox/src/components/icons/`
4. Update ALL component files, not just page.tsx

Gate check: `grep -rn "<svg" apps/todox/src/ --include="*.tsx" | grep -v "node_modules" | grep -v "components/editor/"` should return zero results.
```

---

## Phase 2+ Agent Prompts

Phase 2+ prompts will be added as those phases are reached. Each phase handoff (`HANDOFF_P[N].md`) will reference the relevant agent prompts.
