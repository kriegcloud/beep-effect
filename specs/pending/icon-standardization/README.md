# icon-standardization

> Standardize all icon usage to `@phosphor-icons/react`, replacing the Iconify wrapper system and lucide-react imports.

---

## Problem Statement

The codebase uses three icon libraries simultaneously:

| Library | Import Count | Packages | Pattern |
|---------|-------------|----------|---------|
| `@phosphor-icons/react` | ~68+ | `@beep/ui`, `apps/todox`, `@beep/ui-editor` | React components (`<TrashIcon />`) |
| `@iconify/react` (via `Iconify` wrapper) | ~60+ | `@beep/ui`, `@beep/iam-ui`, `apps/todox` | String-based (`<Iconify icon="solar:eye-bold" />`) |
| `lucide-react` | ~9 | `@beep/ui`, `apps/todox` | React components (`<X />`) |

Additionally, `packages/ui/core/src/theme/core/components/` contains ~15 MUI component overrides with inline SVG paths sourced from Iconify designs (referenced via comments).

This fragmentation causes:
- Three different icon APIs with different prop interfaces
- Bundle bloat from multiple icon libraries
- Inconsistent developer experience
- The Iconify wrapper adds runtime overhead (icon registration, string-based lookups, SSR hydration)

---

## Scope

### In Scope
1. Replace ALL `Iconify` wrapper usages (~60+ files) with Phosphor React components
2. Replace ALL `lucide-react` imports (~9 files) with Phosphor React components
3. Replace MUI component override inline SVGs (~15 files in `packages/ui/core/src/theme/core/components/`) with Phosphor equivalents
4. Remove the Iconify infrastructure:
   - `packages/ui/ui/src/atoms/iconify/` (wrapper component, classes, types)
   - `packages/ui/core/src/constants/iconify/` (icon-sets.ts, register-icons.ts)
   - All barrel export references to Iconify
5. Remove `@iconify/react` and `lucide-react` dependencies from all package.json files
6. Update `tooling/build-utils/src/NextConfig.ts` transpile list (currently includes `@iconify/react`)
7. Pass quality gates: `bun run build`, `bun run check`, `bun run test`, `bun run lint:fix`, `bun run lint`

### Out of Scope
- `.repos/accountability/` (external subtree, uses lucide-react independently)
- Marketing app (`apps/marketing/`) - no icon imports found
- Creating new icon abstractions or wrapper components

---

## Critical Constraints

### Phosphor Import Convention (MANDATORY)
All Phosphor icons MUST use the `Icon` postfix. Non-postfix exports are deprecated.

```tsx
// INVALID - deprecated export
import { Trash } from "@phosphor-icons/react";

// VALID - canonical export
import { TrashIcon } from "@phosphor-icons/react";
```

Reference: `node_modules/@phosphor-icons/react/dist/csr/Info.d.ts` lines 10-11:
```ts
/** @deprecated Use InfoIcon */
export declare const Info: Icon;
export { I as InfoIcon };
```

### Iconify-to-Phosphor Mapping Challenges
The `Iconify` wrapper uses string-based icon names from multiple sets:
- `solar:*` (most common - eye-bold, trash-bin-trash-bold, settings-bold-duotone, etc.)
- `eva:*` (search-fill, star-outline, arrow-ios-back-fill, etc.)
- `mingcute:*` (close-line, add-line, rows-2-fill, etc.)
- `material-symbols:*` (close, add, chevron-right, etc.)
- `carbon:*` (close, chevron-sort)
- `custom:*` (send-fill, menu-duotone, profile-duotone, invoice-duotone)
- `socials:*` (twitter, facebook, instagram, linkedin, google, github)
- `ic:*` (round-label-important)
- `flowbite:*` (column-solid)

Each string icon name must be mapped to the closest Phosphor equivalent using the `better-icons` MCP tool.

### Social Icons
Social brand icons (`socials:twitter`, `socials:facebook`, etc.) may not have direct Phosphor equivalents. The `better-icons` tool should be used to find suitable replacements, or these may need special handling (e.g., using `@phosphor-icons/react` brand icons or keeping SVG inlines for brand marks).

### MUI Component Override SVGs
Files in `packages/ui/core/src/theme/core/components/` use `createSvgIcon` with raw SVG paths. These need to be replaced with Phosphor component references passed to MUI's `slots.icon` or equivalent pattern.

### `styled(Iconify)` Pattern
Several nav components use `styled(Iconify)` for arrow icons. These need migration to `styled(SomePhosphorIcon)` or a different composition pattern.

### `iconifyClasses` CSS System
The `iconifyClasses.root` CSS class is used in styled-components for targeting icon elements. This needs to be replaced or removed.

---

## Success Criteria

- [ ] Zero imports from `@iconify/react` or `lucide-react` in source code
- [ ] All Phosphor imports use `Icon` postfix (no deprecated bare names)
- [ ] Iconify infrastructure completely removed (wrapper, classes, icon-sets, registration)
- [ ] `@iconify/react` and `lucide-react` removed from all package.json and catalog
- [ ] Icon inventory document produced in `outputs/icon-inventory.md`
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint:fix && bun run lint` passes

---

## Phase Overview

| Phase | Focus | Agents | Output |
|-------|-------|--------|--------|
| P1: Inventory | Catalog every non-Phosphor icon with file, line, icon name, and Phosphor replacement | `codebase-researcher`, `better-icons` MCP | `outputs/icon-inventory.md` |
| P2: Swarm Replace | Replace all Iconify & Lucide usages in parallel batches | Swarm of `general-purpose` agents | Modified source files |
| P3: Infrastructure Cleanup | Remove Iconify wrapper, icon-sets, registration, barrel exports, dependencies | `general-purpose` agent | Clean dependency tree |
| P4: Quality Gates | Build, check, test, lint verification and fix cycle | `package-error-fixer` agents | All gates green |

---

## Affected Packages (Dependency Order)

1. `packages/ui/core` - Iconify registration, MUI component override SVGs
2. `packages/ui/ui` - Iconify wrapper, ~30+ Iconify usages, ~6 Lucide usages
3. `packages/iam/ui` - ~6 Iconify usages (social icons, form components)
4. `apps/todox` - ~15 Iconify usages (mail feature, settings), ~3 Lucide usages
5. `packages/shared/ui` - lucide-react dependency (may be transitive only)
6. `packages/ui/editor` - Phosphor dependency only (no changes needed unless imports lack `Icon` postfix)
7. `tooling/build-utils` - Remove `@iconify/react` from Next.js transpile list

---

## Entry Points

- **Full orchestration**: Start from this README + `MASTER_ORCHESTRATION.md`
- **Quick start**: `QUICK_START.md`
- **Resume after session break**: Use latest `handoffs/HANDOFF_P*.md` + `handoffs/P*_ORCHESTRATOR_PROMPT.md`

---

## Related

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Phosphor icons: https://phosphoricons.com/
- Better-icons skill: `.agents/skills/better-icons/`
