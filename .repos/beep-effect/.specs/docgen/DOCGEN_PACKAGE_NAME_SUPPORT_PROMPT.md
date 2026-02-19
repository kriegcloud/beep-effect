# Docgen Package Name Support Implementation

## Objective

Enable all docgen CLI commands to accept `@beep/*` package names in addition to filesystem paths.

| Current (broken) | Desired |
|------------------|---------|
| `bun run docgen:init -- -p @beep/contract` → ERROR | Resolves to `packages/common/contract` |

---

## Files to Modify

| File | Purpose |
|------|---------|
| `tooling/cli/src/commands/docgen/shared/discovery.ts` | Add unified resolver function |
| `tooling/cli/src/commands/docgen/init.ts` | Update import & call site |
| `tooling/cli/src/commands/docgen/generate.ts` | Update import & call site |
| `tooling/cli/src/commands/docgen/aggregate.ts` | Update import & call site |
| `tooling/cli/src/commands/docgen/analyze.ts` | Update import & call site |

---

## Task 1: Update `discovery.ts`

**File:** `tooling/cli/src/commands/docgen/shared/discovery.ts` (416 lines)

### 1a. Add `Str` import

Add after the existing Effect imports (around line 10-25):

```typescript
import * as Str from "effect/String";
```

### 1b. Rename `D` → `resolvePackageByName` (line 395)

```typescript
// Line 395: Change
export const D = (
// To
export const resolvePackageByName = (
```

The JSDoc (lines 372-393) can remain; update the `@example` to use `resolvePackageByName`.

### 1c. Add `resolvePackageByPathOrName` (after line 416)

```typescript
/**
 * Resolve a package by either path or @-prefixed name.
 *
 * @example
 * ```typescript
 * yield* resolvePackageByPathOrName("packages/common/contract") // path
 * yield* resolvePackageByPathOrName("@beep/contract")           // name
 * ```
 */
export const resolvePackageByPathOrName = (
  input: string
): Effect.Effect<
  PackageInfo,
  InvalidPackagePathError | PackageNotFoundError,
  FileSystem.FileSystem | Path.Path | FsUtils.FsUtils
> =>
  F.pipe(input, Str.startsWith("@"))
    ? resolvePackageByName(input)
    : resolvePackagePath(input);
```

**Note:** Requires `FsUtils.FsUtils` because `resolvePackageByName` calls `discoverAllPackages` which needs it.

---

## Task 2: Update Command Files

### Changes per file

| File | Import Line | Resolver Line | Option Lines | Error Log Lines |
|------|-------------|---------------|--------------|-----------------|
| `init.ts` | 48 | 335 | 55-58 | 337, 345 |
| `generate.ts` | 43 | 187 | 50-53 | 189, 197 |
| `aggregate.ts` | 57 | 212 | 69-72 | 214, 222 |
| `analyze.ts` | 48 | 287 | 57-60 | 293, 301 |

### 2a. Update imports

Replace `resolvePackagePath` with `resolvePackageByPathOrName` in each import:

```typescript
// init.ts line 48: Change
import { resolvePackagePath } from "./shared/discovery.js";
// To
import { resolvePackageByPathOrName } from "./shared/discovery.js";

// generate.ts line 43: Change
import { discoverConfiguredPackages, resolvePackagePath } from "./shared/discovery.js";
// To
import { discoverConfiguredPackages, resolvePackageByPathOrName } from "./shared/discovery.js";

// aggregate.ts line 57: Change
import { discoverPackagesWithDocs, resolvePackagePath } from "./shared/discovery.js";
// To
import { discoverPackagesWithDocs, resolvePackageByPathOrName } from "./shared/discovery.js";

// analyze.ts line 48: Change
import { discoverConfiguredPackages, resolvePackagePath } from "./shared/discovery.js";
// To
import { discoverConfiguredPackages, resolvePackageByPathOrName } from "./shared/discovery.js";
```

### 2b. Replace resolver calls

In each file, change:
```typescript
resolvePackagePath(args.package)
```
To:
```typescript
resolvePackageByPathOrName(args.package)
```

### 2c. Update option descriptions

| File | Current | New |
|------|---------|-----|
| `init.ts` | `"Target package path (relative to repo root)"` | `"Target package (path or @beep/* name)"` |
| `generate.ts` | `"Target specific package (default: all with docgen.json)"` | `"Target package (path or @beep/* name; default: all configured)"` |
| `aggregate.ts` | `"Aggregate specific package only"` | `"Target package (path or @beep/* name; default: all with docs)"` |
| `analyze.ts` | `"Target package path (defaults to all configured packages)"` | `"Target package (path or @beep/* name; default: all configured)"` |

### 2d. Update error log messages

In each file, change `"Invalid package path"` to `"Invalid package"` in both:
1. The `logger.error()` call
2. The user-facing `error()` output

---

## Type Reference

```typescript
// PackageInfo (types.ts:229-259)
interface PackageInfo {
  name: string;              // "@beep/schema"
  relativePath: string;      // "packages/common/schema"
  absolutePath: string;      // Full filesystem path
  hasDocgenConfig: boolean;
  hasGeneratedDocs: boolean;
  status: "configured-and-generated" | "configured-not-generated" | "not-configured";
}

// Errors (errors.ts)
// InvalidPackagePathError (line 225): { path, reason, ...CauseFields }
// PackageNotFoundError (line 79): { path, message?, ...CauseFields }
```

---

## Testing

```bash
# Package name resolution (new)
bun run docgen:init -- -p @beep/contract --force --dry-run
bun run docgen:generate -- -p @beep/schema
bun run docgen:analyze -- -p @beep/identity
bun run docgen:aggregate -- -p @beep/utils

# Path resolution (must still work)
bun run docgen:init -- -p packages/common/contract --force --dry-run

# Error cases
bun run docgen:init -- -p @beep/nonexistent --force
# Expected: Package "@beep/nonexistent" not found

bun run docgen:init -- -p invalid/path --force
# Expected: Invalid package - Directory does not exist

# Type check
bun run check
```

---

## Success Criteria

1. `bun run docgen:init -- -p @beep/contract --force` works
2. All path-based commands still work
3. Error messages are appropriate for both paths and names
4. `bun run check` passes
5. Help text shows `(path or @beep/* name)` for package options

---

## Implementation Order

1. **First:** `discovery.ts` — add import, rename `D`, add `resolvePackageByPathOrName`
2. **Then (parallelizable):** Update all 4 command files
3. **Finally:** Run tests
