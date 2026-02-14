# icon-standardization: Master Orchestration

> Step-by-step workflow for standardizing all icons to `@phosphor-icons/react`.

---

## Phase 0: Scaffolding (COMPLETE)

### Completed
- [x] Spec directory structure created
- [x] README.md with scope, constraints, success criteria
- [x] Codebase audit of all icon imports across libraries
- [x] Identified ~60+ Iconify usages, ~9 Lucide usages, ~15 MUI override SVGs

---

## Phase 1: Icon Inventory

### Goal
Produce a complete mapping document: every non-Phosphor icon → Phosphor replacement.

### Agent: Orchestrator + `better-icons` MCP tool

### Process

1. **Catalog all Iconify wrapper usages** by file, line number, and icon string name
2. **Catalog all lucide-react imports** by file, line number, and component name
3. **Catalog all MUI override inline SVGs** by file, line number, and iconify reference
4. **For each icon**, use the `better-icons` MCP tool to find the best Phosphor equivalent:
   - Search: `mcp__better-icons__search_icons` with keyword derived from the icon name
   - Filter results to `@phosphor-icons/react` matches
   - Record the Phosphor component name (with `Icon` postfix)
5. **Handle special cases**:
   - Social/brand icons (twitter, facebook, etc.) - find Phosphor brand equivalents or note as custom SVG
   - Custom icons (`custom:send-fill`, `custom:menu-duotone`, etc.) - find closest Phosphor match
   - Duotone variants - Phosphor supports weight="duotone" prop
6. **Produce** `outputs/icon-inventory.md` with columns:
   - File path
   - Line number(s)
   - Current import/usage
   - Library (iconify/lucide/mui-override)
   - Phosphor replacement (component name with `Icon` postfix)
   - Notes (weight, size, special handling)

### Output
- `outputs/icon-inventory.md`

### Verification
- Every non-Phosphor icon in the codebase has a mapped replacement
- No unmapped icons remain

---

## Phase 2: Swarm Replacement

### Goal
Replace all Iconify & Lucide usages with Phosphor icons using parallel agents.

### Agent: Swarm of `general-purpose` agents (3-5 concurrent)

### Batch Strategy

Split work by package to avoid merge conflicts:

| Batch | Package | Agent | Estimated Files |
|-------|---------|-------|-----------------|
| A | `packages/ui/ui/src/components/` | agent-1 | ~25 files (shadcn components) |
| B | `packages/ui/ui/src/layouts/` + `packages/ui/ui/src/routing/` | agent-2 | ~15 files (nav, layout, breadcrumbs) |
| C | `packages/ui/ui/src/inputs/` + `packages/ui/ui/src/form/` + `packages/ui/ui/src/molecules/` + `packages/ui/ui/src/settings/` + `packages/ui/ui/src/animate/` + `packages/ui/ui/src/atoms/file-thumbnail/` | agent-3 | ~15 files |
| D | `packages/iam/ui/src/` + `apps/todox/src/features/mail/` + `apps/todox/src/app/settings/` | agent-4 | ~12 files |
| E | `apps/todox/src/components/editor/` + lucide replacements across all packages | agent-5 | ~8 files |
| F | `packages/ui/core/src/theme/core/components/` (MUI overrides) | agent-6 | ~10 files |

### Replacement Rules (ALL agents must follow)

```
RULE 1: Import Convention
  - ALWAYS: import { XxxIcon } from "@phosphor-icons/react"
  - NEVER:  import { Xxx } from "@phosphor-icons/react"

RULE 2: Iconify Wrapper Replacement
  - BEFORE: <Iconify icon="solar:eye-bold" width={20} />
  - AFTER:  <EyeIcon size={20} weight="bold" />

  - BEFORE: <Iconify icon="solar:eye-bold" sx={{ color: "text.disabled" }} />
  - AFTER:  <EyeIcon size={20} weight="bold" style={{ color: "var(--mui-palette-text-disabled)" }} />

  Note: Phosphor icons don't support MUI `sx` prop. Use `className` with Tailwind
  or inline `style` for simple color overrides. For MUI-integrated contexts, wrap
  in a Box/span with sx.

RULE 3: styled(Iconify) Pattern
  - BEFORE: const ItemArrow = styled(Iconify, { shouldForwardProp })(...);
  - AFTER:  const ItemArrow = styled(CaretRightIcon, { shouldForwardProp })(...);

  Note: Phosphor icons are React components and can be used with styled().
  Remove any `icon` prop from usage sites since Phosphor components ARE the icon.

RULE 4: iconifyClasses Usage
  - Remove all references to iconifyClasses.root
  - Replace with a generic class name or remove the targeting entirely

RULE 5: Lucide Replacement
  - BEFORE: import { GripVertical, Plus } from "lucide-react"
  - AFTER:  import { DotsSixVerticalIcon, PlusIcon } from "@phosphor-icons/react"

  - BEFORE: import { Loader2Icon } from "lucide-react"
  - AFTER:  import { SpinnerIcon } from "@phosphor-icons/react"

  Note: Lucide's Loader2 animated spinner → Phosphor's SpinnerIcon with CSS animation

RULE 6: MUI Component Override SVGs
  - BEFORE: Using createSvgIcon with raw SVG path data
  - AFTER:  Import Phosphor component and pass to MUI slots or use <PhosphorIcon /> directly

  For MUI Data Grid icon overrides, use the slots API pattern.

RULE 7: Import Deduplication
  - Consolidate multiple Phosphor imports into a single import statement per file
  - Sort alphabetically
```

### Handoff Context
Each swarm agent receives:
- The icon inventory (`outputs/icon-inventory.md`) filtered to their batch
- The replacement rules above
- Specific file list for their batch

### Output
- All source files modified with Phosphor replacements
- No Iconify or Lucide imports remain

---

## Phase 3: Infrastructure Cleanup

### Goal
Remove all Iconify infrastructure and dependencies.

### Agent: Single `general-purpose` agent

### Tasks

1. **Delete Iconify files**:
   - `packages/ui/ui/src/atoms/iconify/` (entire directory)
   - `packages/ui/core/src/constants/iconify/` (entire directory)

2. **Update barrel exports**:
   - `packages/ui/ui/src/atoms/index.ts` - remove Iconify re-exports
   - `packages/ui/core/src/constants/index.ts` - remove iconify re-exports
   - Any other barrels that re-export Iconify types/components

3. **Update package.json files** - remove dependencies:
   - Root `package.json` catalog: remove `@iconify/react`, `lucide-react`
   - `packages/ui/ui/package.json`: remove `@iconify/react`, `lucide-react`
   - `packages/ui/core/package.json`: remove `@iconify/react`
   - `packages/shared/ui/package.json`: remove `lucide-react`
   - `apps/todox/package.json`: remove `@iconify/react`, `lucide-react`

4. **Update build config**:
   - `tooling/build-utils/src/NextConfig.ts`: remove `"@iconify/react"` from transpile list

5. **Run `bun install`** to update lockfile

### Output
- Clean dependency tree with no Iconify/Lucide references
- Updated lockfile

---

## Phase 4: Quality Gates

### Goal
All gates pass with zero errors.

### Agent: `package-error-fixer` agents (parallel per package)

### Gate Sequence

```bash
# 1. Lint fix (auto-fixable issues)
bun run lint:fix

# 2. Type check
bun run check

# 3. Build
bun run build

# 4. Test
bun run test

# 5. Final lint (verify no remaining issues)
bun run lint
```

### Fix Loop
If any gate fails:
1. Identify the failing package(s)
2. Deploy `package-error-fixer` agent per package
3. Re-run gates
4. Repeat until all green

### Output
- All gates green
- Ready for commit

---

## Verification Commands

```bash
# Confirm no remaining Iconify imports
grep -r "@iconify/react" --include="*.ts" --include="*.tsx" packages/ apps/ tooling/ | grep -v node_modules | grep -v .repos

# Confirm no remaining Lucide imports
grep -r "lucide-react" --include="*.ts" --include="*.tsx" packages/ apps/ tooling/ | grep -v node_modules | grep -v .repos

# Confirm no remaining Iconify wrapper usage
grep -r "from.*@beep/ui/atoms/iconify" --include="*.ts" --include="*.tsx" packages/ apps/ | grep -v node_modules

# Confirm all Phosphor imports use Icon postfix
grep -rP "import.*\{[^}]*(?<![A-Z])Icon[^}]*\}.*from.*@phosphor" --include="*.tsx" packages/ apps/ | head -20

# Quality gates
bun run build && bun run check && bun run test && bun run lint:fix && bun run lint
```

---

## Success Criteria

- [ ] `outputs/icon-inventory.md` produced with complete mapping
- [ ] Zero imports from `@iconify/react` or `lucide-react`
- [ ] All Phosphor imports use `Icon` postfix
- [ ] Iconify infrastructure removed (wrapper, classes, icon-sets, registration)
- [ ] Dependencies removed from package.json files
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
- [ ] REFLECTION_LOG.md updated with learnings
