# icon-standardization Quick Start

> Resume guide for any agent session picking up this spec.

---

## Current State

Check `MASTER_ORCHESTRATION.md` for phase completion status.

## Phase Execution Order

### P1: Inventory (do this first)
```
1. Read outputs/icon-inventory.md - if it exists, skip to P2
2. If not, produce the inventory:
   - Use `better-icons` skill/MCP to find Phosphor equivalents for each icon
   - Catalog every Iconify usage (grep for "Iconify" and "@iconify/react")
   - Catalog every lucide-react import
   - Catalog MUI override SVGs in packages/ui/core/src/theme/core/components/
   - Write outputs/icon-inventory.md
```

### P2: Swarm Replace
```
1. Read outputs/icon-inventory.md for the complete mapping
2. Split work into batches by package (see MASTER_ORCHESTRATION.md)
3. Spawn 3-5 parallel agents, each handling one batch
4. CRITICAL: All imports must use Icon postfix: import { TrashIcon } from "@phosphor-icons/react"
5. Handle sx prop migration (Phosphor doesn't support MUI sx)
6. Handle styled(Iconify) → styled(PhosphorComponent) migration
```

### P3: Cleanup
```
1. Delete packages/ui/ui/src/atoms/iconify/
2. Delete packages/ui/core/src/constants/iconify/
3. Update barrel exports (remove Iconify re-exports)
4. Remove @iconify/react and lucide-react from all package.json files
5. Remove @iconify/react from NextConfig.ts transpile list
6. Run bun install
```

### P4: Quality Gates
```
bun run lint:fix
bun run check
bun run build
bun run test
bun run lint
```

---

## Key Files

| Purpose | Path |
|---------|------|
| Iconify wrapper | `packages/ui/ui/src/atoms/iconify/iconify.tsx` |
| Icon registration | `packages/ui/core/src/constants/iconify/register-icons.ts` |
| Icon SVG data | `packages/ui/core/src/constants/iconify/icon-sets.ts` |
| MUI overrides | `packages/ui/core/src/theme/core/components/*.tsx` |
| Build transpile list | `tooling/build-utils/src/NextConfig.ts` |
| Barrel (atoms) | `packages/ui/ui/src/atoms/index.ts` |
| Barrel (constants) | `packages/ui/core/src/constants/index.ts` |

## Gotchas

1. **`styled(Iconify)`** is used in nav items - needs `styled(CaretRightIcon)` or similar
2. **`iconifyClasses.root`** CSS targeting needs removal
3. **Social icons** (twitter, github, etc.) may need special handling
4. **Duotone variants** - Phosphor supports `weight="duotone"` prop
5. **`sx` prop** - Phosphor icons don't support MUI sx; wrap in Box or use className/style
6. **MUI Data Grid** uses slots API for icon overrides
