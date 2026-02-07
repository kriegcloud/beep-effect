# Phase 5 Handoff: Next.js App tsconfig Sync

**From**: P4 Implementation (Bug Fixes)
**To**: P5 Implementation (Next.js App Support)
**Date**: 2026-01-22

---

## Executive Summary

P4 successfully fixed the 5 critical bugs in `tsconfig-sync` for monorepo packages. P5 extends the command to **also sync Next.js app tsconfig files** (`apps/*/tsconfig.json`).

Next.js apps use a **single tsconfig.json** with:
1. **`compilerOptions.paths`** — Maps `@beep/*` aliases to relative source paths
2. **`references`** — Points to `tsconfig.build.json` files for dependencies

Both sections must be derived from `package.json` dependencies.

---

## Context: Current State

### Next.js Apps in Monorepo

| App | Path | Dependencies |
|-----|------|--------------|
| `@beep/web` | `apps/web` | ~30+ @beep/* packages |
| `@beep/todox` | `apps/todox` | ~25+ @beep/* packages |
| `@beep/marketing` | `apps/marketing` | 0 @beep/* packages |

### Current Issues Found

**1. Duplicate References (apps/todox)**
```json
// Lines 196-200 AND 216-227 both have:
{ "path": "../../packages/comms/domain/tsconfig.build.json" },
{ "path": "../../packages/comms/tables/tsconfig.build.json" },
{ "path": "../../packages/comms/client/tsconfig.build.json" },
{ "path": "../../packages/comms/ui/tsconfig.build.json" },
```

**2. References to Non-Existent Packages (apps/todox)**
```json
// These packages don't exist:
{ "path": "../../packages/customization/client/tsconfig.build.json" },
{ "path": "../../packages/customization/ui/tsconfig.build.json" },
```

**3. Missing Paths for Dependencies**
- `apps/web/tsconfig.json` has paths for `@beep/shared-tables` but it's not in `package.json`
- Some dependencies in `package.json` lack corresponding paths entries

**4. Paths vs References Mismatch**
- Paths and references are not derived from the same source
- Manual maintenance leads to drift

---

## Requirements

### R1: Detect Next.js Apps

Identify Next.js apps by presence of:
- `next.config.mjs` OR `next.config.ts` in package directory
- Package is in `apps/` directory

### R2: Sync `compilerOptions.paths`

For each `@beep/*` dependency (dependencies + devDependencies):

```json
{
  "compilerOptions": {
    "paths": {
      "@beep/package-name": ["../../path/to/package/src/index"],
      "@beep/package-name/*": ["../../path/to/package/src/*"]
    }
  }
}
```

**Rules**:
- Path is relative from app directory to package `src/` directory
- Include both bare import and glob patterns (`/*`)
- Preserve app-specific paths (e.g., `"@/*": ["./src/*"]`, `"*": ["./*"]`)
- Preserve Next.js plugin configuration

**Special Cases**:
- `@beep/errors` has subpath exports: `/client`, `/shared`, `/server`
- `@beep/ui` and `@beep/ui-core` use glob-only patterns

### R3: Sync `references`

For each `@beep/*` dependency:

```json
{
  "references": [
    { "path": "../../path/to/package/tsconfig.build.json" }
  ]
}
```

**Rules**:
- Path is relative from app directory to package `tsconfig.build.json`
- References must be deduplicated (no duplicates)
- References should be topologically sorted (dependencies before dependents)
- Include transitive dependencies that need type information

### R4: Preserve Existing Sections

Do NOT modify these sections of `tsconfig.json`:
- `extends`
- `compilerOptions` (except `paths`)
- `include`
- `exclude`
- `plugins` (within compilerOptions)

### R5: Check Mode Support

```bash
# Check for drift without modifying
bun run repo-cli tsconfig-sync --check

# Should report drift in both packages AND apps
```

### R6: Selective Sync

```bash
# Sync all (default behavior - packages + apps)
bun run repo-cli tsconfig-sync

# Sync only packages (current P4 behavior)
bun run repo-cli tsconfig-sync --packages-only

# Sync only apps
bun run repo-cli tsconfig-sync --apps-only

# Sync specific app
bun run repo-cli tsconfig-sync --filter @beep/web
```

---

## Technical Implementation

### Architecture

```
tsconfigSyncHandler
├── Process packages (existing P4 logic)
│   ├── Sync tsconfig.build.json
│   ├── Sync tsconfig.src.json
│   └── Sync tsconfig.test.json
│
└── Process Next.js apps (NEW P5 logic)
    ├── Detect Next.js apps
    ├── Build path aliases from dependencies
    ├── Build references from dependencies
    ├── Check/write tsconfig.json
    └── Report results
```

### Key Files to Modify

| File | Changes |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Add Next.js app processing loop |
| `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts` | Add path alias and app tsconfig helpers |
| `tooling/cli/src/commands/tsconfig-sync/schemas.ts` | Add `--packages-only`, `--apps-only` options |

### Helper Functions to Add

```typescript
// In tsconfig-writer.ts

/**
 * Check if a package is a Next.js app
 */
export const isNextJsApp = (
  pkgDir: string
): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem>;

/**
 * Build path aliases from package.json dependencies
 * Returns: { "@beep/pkg": ["../../path/src/index"], "@beep/pkg/*": ["../../path/src/*"] }
 */
export const buildPathAliases = (
  appDir: string,
  dependencies: HashSet.HashSet<string>,
  pkgDirMap: HashMap.HashMap<string, string>
): Record<string, string[]>;

/**
 * Build reference paths for Next.js apps
 * Returns: ["../../path/to/pkg/tsconfig.build.json", ...]
 */
export const buildAppReferences = (
  appDir: string,
  dependencies: HashSet.HashSet<string>,
  tsconfigPaths: HashMap.HashMap<string, string[]>
): readonly string[];

/**
 * Read and parse existing tsconfig.json preserving structure
 */
export const readAppTsconfig = (
  tsconfigPath: string
): Effect.Effect<TsconfigJson, TsconfigSyncError, FileSystem.FileSystem>;

/**
 * Write tsconfig.json with updated paths and references
 * Preserves all other sections
 */
export const writeAppTsconfig = (
  tsconfigPath: string,
  existingConfig: TsconfigJson,
  newPaths: Record<string, string[]>,
  newReferences: readonly string[]
): Effect.Effect<void, TsconfigSyncError, FileSystem.FileSystem>;
```

### Path Alias Generation

```typescript
// For @beep/iam-domain in apps/web:
// - App dir: apps/web
// - Pkg dir: packages/iam/domain

const buildPathAlias = (appDir: string, pkgDir: string): [string, string[]][] => {
  const pkgName = getPkgName(pkgDir); // "@beep/iam-domain"
  const relativePath = path.relative(appDir, pkgDir); // "../../packages/iam/domain"

  return [
    [pkgName, [`${relativePath}/src/index`]],
    [`${pkgName}/*`, [`${relativePath}/src/*`]]
  ];
};
```

### Special Cases

**@beep/errors** has subpath exports:
```json
{
  "@beep/errors/client": ["../../packages/common/errors/src/client"],
  "@beep/errors/shared": ["../../packages/common/errors/src/shared"],
  "@beep/errors/server": ["../../packages/common/errors/src/server"]
}
```

**@beep/ui** and **@beep/ui-core** use glob-only:
```json
{
  "@beep/ui/*": ["../../packages/ui/ui/src/*"],
  "@beep/ui-core/*": ["../../packages/ui/core/src/*"]
}
```

### Algorithm

```
FOR each Next.js app:
  1. Read package.json to get all @beep/* dependencies
  2. Read existing tsconfig.json

  3. BUILD paths:
     a. Start with app-specific paths (preserve @/*, */*, etc.)
     b. For each @beep/* dependency:
        - Compute relative path to package src/
        - Generate alias entries
     c. Sort alphabetically

  4. BUILD references:
     a. For each @beep/* dependency:
        - Find tsconfig.build.json path
        - Compute relative path
     b. Deduplicate
     c. Sort topologically

  5. IF check mode:
     - Compare computed vs existing
     - Report drift

  6. ELSE (sync mode):
     - Write updated tsconfig.json
     - Preserve compilerOptions (except paths), include, exclude
```

---

## Testing Strategy

### Unit Tests

```typescript
// test/commands/tsconfig-sync/app-sync.test.ts

effect("detects Next.js apps", () => ...);
effect("builds path aliases from dependencies", () => ...);
effect("handles @beep/errors subpath exports", () => ...);
effect("handles glob-only packages like @beep/ui", () => ...);
effect("deduplicates references", () => ...);
effect("preserves app-specific paths", () => ...);
effect("preserves compilerOptions except paths", () => ...);
```

### Integration Test

```bash
# After implementing, verify:
bun run repo-cli tsconfig-sync --check

# Should report clean for all apps after sync
bun run repo-cli tsconfig-sync
bun run repo-cli tsconfig-sync --check
# Expected: No drift detected

# Verify builds pass
bun run build --filter @beep/web
bun run build --filter @beep/todox
bun run build --filter @beep/marketing
```

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| Next.js apps detected | Handler processes `apps/web`, `apps/todox`, `apps/marketing` |
| Paths generated from deps | Each @beep/* dep has corresponding path aliases |
| References generated from deps | Each @beep/* dep has corresponding reference |
| No duplicate references | `apps/todox` duplicates removed |
| Invalid references removed | Non-existent packages removed from references |
| Check mode works | `--check` reports drift for apps |
| Filter works | `--filter @beep/web` processes only that app |
| Build passes | All apps build after sync |
| Type check passes | All apps pass `bun run check` |

---

## Files to Reference

| File | Purpose |
|------|---------|
| `apps/web/tsconfig.json` | Example of large Next.js app config |
| `apps/todox/tsconfig.json` | Example with issues (duplicates, invalid refs) |
| `apps/marketing/tsconfig.json` | Minimal Next.js app config |
| `apps/web/package.json` | Dependencies to sync |
| `apps/todox/package.json` | Dependencies to sync |
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Main handler to extend |
| `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts` | Utilities to extend |

---

## Execution Checklist

- [ ] Add `--packages-only` and `--apps-only` options to schemas.ts
- [ ] Add `isNextJsApp` detection helper
- [ ] Add `buildPathAliases` helper
- [ ] Add `buildAppReferences` helper
- [ ] Add `readAppTsconfig` helper
- [ ] Add `writeAppTsconfig` helper
- [ ] Extend handler to process Next.js apps after packages
- [ ] Handle special cases (@beep/errors, @beep/ui, @beep/ui-core)
- [ ] Preserve app-specific paths and compilerOptions
- [ ] Test with all three apps
- [ ] Create VERIFICATION_REPORT_P5.md

---

## Notes for Implementer

1. **JSON Preservation**: Use `jsonc-parser` (already in use) to preserve comments and formatting in tsconfig.json files.

2. **Relative Path Calculation**: Apps are at `apps/{name}/`, packages are at `packages/{layer}/{name}/` or `packages/{slice}/{sublayer}/`. Use `path.relative()` to compute correct relative paths.

3. **Topological Sort**: Reuse existing `topologicalSort` utility for reference ordering.

4. **Marketing App**: Will have empty paths and references (no @beep/* deps), which is valid.

5. **Existing P4 Logic**: Do NOT modify the package sync logic - it's working correctly. Add app sync as a separate phase.
