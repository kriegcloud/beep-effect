# Plan: Share MUI Module Augmentation Across Packages

## Problem Statement

Currently, the MUI theme module augmentation defined in `@beep/ui-core` is duplicated across multiple packages:

| File | Purpose |
|------|---------|
| `packages/ui/core/src/theme/extend-theme-types.ts` | **Source of truth** - canonical augmentation |
| `packages/ui/ui/src/theme/extend-theme-types.ts` | Duplicate |
| `apps/web/src/types/extended-theme-types.ts` | Duplicate |
| `packages/iam/ui/src/types/extended-theme-types.ts` | Duplicate |
| `packages/comms/ui/src/types/extended-theme-types.ts` | Duplicate |

This duplication leads to maintenance burden and risk of drift between files.

## Research Summary

Based on research from:
- [TypeScript Module Augmentation Stack Overflow](https://stackoverflow.com/questions/68482092/material-ui-module-augmentation-across-multiple-packages-in-a-monorepo)
- [TypeScript Declaration Merging Documentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [Managing TypeScript Packages in Monorepos - Nx Blog](https://nx.dev/blog/managing-ts-packages-in-monorepos)
- [Logto Blog on Module Augmentation](https://blog.logto.io/typescript-module-augmentation)

### Key Findings

1. **Side-effect imports are the primary mechanism**: TypeScript requires explicit imports to recognize augmentations across package boundaries. The pattern `import type {} from "@beep/ui-core/theme/extend-theme-types"` triggers TypeScript to load and apply the augmentation.

2. **Module augmentation files must be modules**: The file containing `declare module` must have a top-level import/export to be treated as a module (not a script). Our current file already has imports at the top.

3. **typeRoots is NOT the right solution**: The Google search suggestion about `typeRoots` is primarily for `.d.ts` files in a dedicated types folder. Our augmentation file is a `.ts` file with imports, which makes it a module that needs explicit importing.

4. **The existing pattern in `@beep/ui-ui` is correct**: The file `packages/ui/ui/src/theme/theme-provider.tsx` already imports the augmentation correctly:
   ```typescript
   import type {} from "@beep/ui-core/theme/extend-theme-types";
   ```

5. **Why duplicates were needed before**: The duplicate files exist because dependent packages weren't importing the canonical augmentation. TypeScript didn't "see" the augmentation in those compilation units.

## Solution

**Strategy**: Use side-effect type imports (`import type {} from ...`) in each package that needs the MUI theme augmentations, rather than duplicating the augmentation file.

### Why This Works

When TypeScript encounters `import type {} from "@beep/ui-core/theme/extend-theme-types"`:
1. It resolves the module via path aliases in `tsconfig.base.jsonc`
2. It loads the file and processes all `declare module` statements
3. The augmentations become active for that compilation unit
4. The `import type {}` produces no runtime code (erased during compilation)

---

## Tasks

### Phase 1: Verify Current Setup Works

- [ ] **1.1** Confirm the canonical file exports correctly
  - File: `packages/ui/core/src/theme/extend-theme-types.ts`
  - Verify it has imports that make it a module (it does)

- [ ] **1.2** Confirm path alias exists
  - Check `tsconfig.base.jsonc` for `@beep/ui-core/*` alias (it exists: line 235-239)

### Phase 2: Update Dependent Packages

For each package that needs MUI theme augmentations, add the side-effect import to an entry point or commonly-imported file:

- [ ] **2.1** `@beep/ui-ui` (packages/ui/ui)
  - Current: Has `import type {} from "@beep/ui-core/theme/extend-theme-types"` in `theme-provider.tsx`
  - Action: Keep as-is, but also add to main index if needed for broader coverage
  - Delete: `packages/ui/ui/src/theme/extend-theme-types.ts`

- [ ] **2.2** `@beep/iam-ui` (packages/iam/ui)
  - Add import to a central file (e.g., the package's index.ts or a types file that's always included)
  - Delete: `packages/iam/ui/src/types/extended-theme-types.ts`

- [ ] **2.3** `@beep/comms-ui` (packages/comms/ui)
  - Add import to a central file
  - Delete: `packages/comms/ui/src/types/extended-theme-types.ts`

- [ ] **2.4** `apps/web`
  - Add import to a central file (e.g., `src/app/layout.tsx` or a dedicated types include file)
  - Delete: `apps/web/src/types/extended-theme-types.ts`

### Phase 3: Verification

- [ ] **3.1** Comment out the duplicate files first (don't delete yet)
  - This allows easy rollback if verification fails

- [ ] **3.2** Run full verification
  ```bash
  bun run purge && bun i && bun run build && bun run check
  ```

- [ ] **3.3** If verification passes, delete the duplicate files

- [ ] **3.4** Run verification again after deletion
  ```bash
  bun run build && bun run check
  ```

### Phase 4: Documentation

- [ ] **4.1** Add a comment to `extend-theme-types.ts` explaining how to consume it
  ```typescript
  /**
   * MUI Theme Module Augmentation
   *
   * To use these augmentations in dependent packages, add this import
   * to a file that's always included in your compilation:
   *
   *   import type {} from "@beep/ui-core/theme/extend-theme-types";
   *
   * This is a side-effect-only type import that activates the augmentations.
   */
  ```

---

## Alternative Approaches Considered (and rejected)

### 1. typeRoots Approach
**Why rejected**: `typeRoots` is designed for `.d.ts` ambient declaration files, not module files with imports. Our augmentation file uses imports to reference types from `@beep/ui-core`, which makes it a module. Using `typeRoots` would require restructuring the file to be an ambient declaration, which would lose the type imports.

### 2. Include in tsconfig.json
**Why rejected**: Adding the file to `include` in each package's `tsconfig.json` would work but is less explicit and harder to understand. The import approach is more idiomatic.

### 3. Re-export from @beep/ui-core index
**Why rejected**: The augmentation doesn't export anything - it only augments existing modules. Re-exporting would be confusing and wouldn't work as expected.

---

## Files to Modify

| Action | File |
|--------|------|
| KEEP | `packages/ui/core/src/theme/extend-theme-types.ts` |
| DELETE | `packages/ui/ui/src/theme/extend-theme-types.ts` |
| DELETE | `apps/web/src/types/extended-theme-types.ts` |
| DELETE | `packages/iam/ui/src/types/extended-theme-types.ts` |
| DELETE | `packages/comms/ui/src/types/extended-theme-types.ts` |
| MODIFY | Add import to entry points of `@beep/iam-ui`, `@beep/comms-ui`, `apps/web` |

---

## Rollback Plan

If the approach fails:
1. Restore the duplicate files from git
2. Investigate why the import isn't working (likely path resolution issue)
3. Consider alternative approaches like tsconfig `include` patterns

---

## Success Criteria

1. `bun run build` passes
2. `bun run check` passes
3. Only ONE `extend-theme-types.ts` file exists (in `packages/ui/core/src/theme/`)
4. MUI components in all UI packages have proper type augmentations (e.g., `theme.customShadows` is recognized)