# icon-standardization: Agent Prompts

> Copy-paste prompts for each phase's agents.

---

## Phase 1: Inventory Agent Prompt

```
You are producing an icon inventory for the icon-standardization spec.

TASK: Create outputs/icon-inventory.md containing every non-Phosphor icon usage in the codebase.

PROCESS:
1. Search for all Iconify wrapper usages: grep for `Iconify` component and `@iconify/react` imports
2. Search for all lucide-react imports
3. Search for MUI component override inline SVGs in packages/ui/core/src/theme/core/components/
4. For EACH icon found, use the `better-icons` MCP tool (search_icons) to find the closest
   Phosphor equivalent. Filter to phosphor results.
5. Record in a markdown table with columns:
   | File | Line(s) | Current Usage | Library | Phosphor Replacement | Notes |

CRITICAL RULES:
- All Phosphor replacements MUST use the Icon postfix (e.g., TrashIcon, not Trash)
- For Iconify string icons like "solar:eye-bold", derive search term "eye" and find Phosphor match
- For social/brand icons, note if Phosphor has a match or mark as "NEEDS_CUSTOM_SVG"
- For duotone variants, note weight="duotone" in the Notes column
- Group entries by package for readability

OUTPUT: specs/pending/icon-standardization/outputs/icon-inventory.md
```

---

## Phase 2: Swarm Agent Prompt Template

```
You are replacing icons in batch [BATCH_LETTER] of the icon-standardization spec.

SCOPE: [LIST OF FILES FOR THIS BATCH]

INVENTORY: Read specs/pending/icon-standardization/outputs/icon-inventory.md for the
mapping of current icons to Phosphor replacements.

REPLACEMENT RULES:

1. IMPORTS - Always use Icon postfix:
   import { TrashIcon, EyeIcon } from "@phosphor-icons/react"

2. ICONIFY WRAPPER → PHOSPHOR COMPONENT:
   BEFORE: <Iconify icon="solar:eye-bold" width={20} />
   AFTER:  <EyeIcon size={20} weight="bold" />

3. ICONIFY WITH sx PROP:
   BEFORE: <Iconify icon="eva:search-fill" sx={{ color: "text.disabled" }} />
   AFTER:  <Box component={MagnifyingGlassIcon} size={20} weight="fill" sx={{ color: "text.disabled" }} />
   (Or wrap in a span with sx if Box is too heavy)

4. styled(Iconify) PATTERN:
   BEFORE: const Arrow = styled(Iconify, { shouldForwardProp })(...);
           <Arrow icon="eva:arrow-ios-downward-fill" />
   AFTER:  const Arrow = styled(CaretDownIcon, { shouldForwardProp })(...);
           <Arrow />
   (Remove the icon prop from JSX since the component IS the icon)

5. LUCIDE → PHOSPHOR:
   BEFORE: import { GripVertical, Plus } from "lucide-react"
   AFTER:  import { DotsSixVerticalIcon, PlusIcon } from "@phosphor-icons/react"

6. Remove Iconify imports:
   - Remove: import { Iconify } from "@beep/ui/atoms"
   - Remove: import { Iconify } from "@beep/ui/atoms/iconify"
   - Remove: import type { IconifyName } from "@beep/ui/atoms/iconify"
   - Remove: import { iconifyClasses } from "@beep/ui/atoms"

7. Consolidate Phosphor imports per file (single import statement, sorted alphabetically)

8. Preserve existing Phosphor imports already in the file

DO NOT modify files outside your batch scope.
DO NOT modify package.json files (that's Phase 3).
DO NOT delete the Iconify wrapper files (that's Phase 3).
```

---

## Phase 3: Cleanup Agent Prompt

```
You are performing infrastructure cleanup for the icon-standardization spec.

TASKS:
1. Delete directories:
   - packages/ui/ui/src/atoms/iconify/ (entire directory)
   - packages/ui/core/src/constants/iconify/ (entire directory)

2. Update barrel exports:
   - packages/ui/ui/src/atoms/index.ts: remove Iconify, IconifyProps, iconifyClasses exports
   - packages/ui/core/src/constants/index.ts: remove iconify re-export
   - Search for any other files that import from the deleted paths

3. Remove dependencies from package.json files:
   - Root package.json catalog: @iconify/react, lucide-react
   - packages/ui/ui/package.json: @iconify/react, lucide-react
   - packages/ui/core/package.json: @iconify/react
   - packages/shared/ui/package.json: lucide-react
   - apps/todox/package.json: @iconify/react, lucide-react

4. Update tooling/build-utils/src/NextConfig.ts:
   - Remove "@iconify/react" from the transpilePackages array

5. Run: bun install (to update lockfile)

6. Verify no remaining references:
   - grep for @iconify/react, lucide-react, iconify, IconifyName in source files
   - Fix any remaining broken imports

DO NOT modify icon component usages (that was Phase 2).
```

---

## Phase 4: Quality Gate Agent Prompt

```
You are running quality gates for the icon-standardization spec.

Run these commands in order, fixing issues between each:

1. bun run lint:fix
2. bun run check
3. bun run build
4. bun run test
5. bun run lint

For each failure:
- Identify the package and error
- Fix the issue (usually missing imports, type errors, or unused imports)
- Re-run the failing gate
- Proceed to next gate only when current passes

Common issues to expect:
- Missing Phosphor imports (component referenced but not imported)
- Type errors from sx prop on Phosphor components (need Box wrapper)
- Unused Iconify imports that weren't fully cleaned up
- styled() type mismatches (Phosphor component vs Iconify wrapper have different prop types)
- Test snapshots that include icon class names or component names

When all 5 gates pass, report success.
```
