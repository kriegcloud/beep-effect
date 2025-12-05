# Task: Remove `@beep/core-env` Package

## Overview

Completely remove the `@beep/core-env` package (located at `packages/core/env`) from this monorepo. The functionality has been migrated to `@beep/shared-infra` (specifically `packages/shared/infra/src/ServerEnv.ts` and `packages/shared/infra/src/ClientEnv.ts`).

## IMPORTANT: Context for Import Replacements

The `@beep/core-env` package exports:
- `@beep/core-env/server` → exports `serverEnv`, `ServerConfig`, `isPlaceholder`
- `@beep/core-env/client` → exports `clientEnv`
- `@beep/core-env/common` → exports `ConfigArrayURL`

These have been moved to:
- `@beep/shared-infra/ServerEnv` → exports `serverEnv`, `ServerConfig`, `isPlaceholder`
- `@beep/shared-infra/ClientEnv` → exports `clientEnv`

The `ConfigArrayURL` from `@beep/core-env/common` is now imported internally within `@beep/shared-infra/ServerEnv.ts` (see line 15 - it's already using a local import).

---

## Task List

### 1. Delete the Package Directory

**Action:** Delete the entire directory tree
```
rm -rf packages/core/env
```

**Files being deleted:**
- `packages/core/env/package.json`
- `packages/core/env/LICENSE`
- `packages/core/env/AGENTS.md`
- `packages/core/env/README.md`
- `packages/core/env/tsconfig.json`
- `packages/core/env/tsconfig.build.json`
- `packages/core/env/tsconfig.src.json`
- `packages/core/env/tsconfig.test.json`
- `packages/core/env/src/client.ts`
- `packages/core/env/src/server.ts`
- `packages/core/env/src/common.ts`
- `packages/core/env/test/Dummy.test.ts`
- `packages/core/env/build/` (entire build directory)
- `packages/core/env/.turbo/` (entire turbo cache directory)

---

### 2. Update `tsconfig.slices/core.json`

**File:** `tsconfig.slices/core.json`

**Current content:**
```json
{
  "files": [],
  "references": [
    { "path": "../packages/core/env/tsconfig.build.json" },
    { "path": "../packages/core/email/tsconfig.build.json" },
    { "path": "../packages/core/db/tsconfig.build.json" }
  ]
}
```

**Action:** Remove the `@beep/core-env` reference. After removal:
```json
{
  "files": [],
  "references": [
    { "path": "../packages/core/email/tsconfig.build.json" },
    { "path": "../packages/core/db/tsconfig.build.json" }
  ]
}
```

**NOTE:** If `@beep/core-email` and `@beep/core-db` packages have also been removed (check git status - they appear deleted), then delete this entire file: `rm tsconfig.slices/core.json`

---

### 3. Update `tsconfig.base.jsonc`

**File:** `tsconfig.base.jsonc`

**Action:** Remove these path aliases (lines 208-216):
```jsonc
      "@beep/core-env/client": [
        "./packages/core/env/src/client"
      ],
      "@beep/core-env/server": [
        "./packages/core/env/src/server"
      ],
      "@beep/core-env/test/*": [
        "./packages/core/env/test/*"
      ],
```

---

### 4. Update Package Dependencies

Remove `"@beep/core-env": "workspace:^"` from the following `package.json` files:

#### 4.1 `packages/runtime/server/package.json`
- Remove from `peerDependencies` (line 60)
- Remove from `devDependencies` (line 116)

#### 4.2 `packages/iam/sdk/package.json`
- Remove from `peerDependencies` (line 60)
- Remove from `devDependencies` (line 123)

#### 4.3 `packages/iam/infra/package.json`
- Remove from `peerDependencies` (line 69)
- Remove from `devDependencies` (line 126)

#### 4.4 `packages/iam/ui/package.json`
- Remove from `peerDependencies` (line 48)
- Remove from `dependencies` (line 83)

#### 4.5 `packages/documents/infra/package.json`
- Remove from `peerDependencies` (line 44)
- Remove from `devDependencies` (line 73)

#### 4.6 `packages/documents/sdk/package.json`
- Remove from `peerDependencies` (line 38)
- Remove from `devDependencies` (line 56)

#### 4.7 `packages/documents/ui/package.json`
- Remove from `peerDependencies` (line 39)
- Remove from `devDependencies` (line 60)

#### 4.8 `packages/shared/sdk/package.json`
- Remove from `peerDependencies` (line 38)
- Remove from `devDependencies` (line 54)

#### 4.9 `packages/shared/ui/package.json`
- Remove from `peerDependencies` (line 39)
- Remove from `devDependencies` (line 56)

#### 4.10 `packages/runtime/client/package.json`
- Remove from `peerDependencies` (line 49)
- Remove from `devDependencies` (line 88)

#### 4.11 `packages/_internal/db-admin/package.json`
- Remove from `dependencies` (line 73)

#### 4.12 `apps/web/package.json`
- Remove from `dependencies` (line 179)

#### 4.13 `apps/server/package.json`
- Remove from `dependencies` (line 35)

#### 4.14 `apps/notes/package.json`
- Remove from `dependencies` (line 52)

---

### 5. Update Source File Imports

#### 5.1 `packages/iam/infra/src/config.ts`

**Current import (line 1):**
```typescript
import { serverEnv } from "@beep/core-env/server";
```

**Replace with:**
```typescript
import { serverEnv } from "@beep/shared-infra/ServerEnv";
```

---

### 6. Update App TSConfig Files

#### 6.1 `apps/web/tsconfig.json`

**Remove path aliases (lines 70-71):**
```json
      "@beep/core-env/client": ["../../packages/core/env/src/client"],
      "@beep/core-env/server": ["../../packages/core/env/src/server"],
```

**Remove reference (lines 148-150):**
```json
    {
      "path": "../../packages/core/env/tsconfig.build.json"
    },
```

#### 6.2 `apps/web/tsconfig.test.json`

**Remove path aliases (lines 120-121):**
```json
      "@beep/core-env/client": ["../../packages/core/env/src/client"],
      "@beep/core-env/server": ["../../packages/core/env/src/server"],
```

**Remove reference (lines 44-46):**
```json
    {
      "path": "../../packages/core/env/tsconfig.build.json"
    },
```

#### 6.3 `apps/notes/tsconfig.json`

**Remove path aliases (lines 71-72):**
```json
      "@beep/core-env/client": ["../../packages/core/env/src/client"],
      "@beep/core-env/server": ["../../packages/core/env/src/server"],
```

**Remove reference (lines 149-151):**
```json
    {
      "path": "../../packages/core/env/tsconfig.build.json"
    },
```

#### 6.4 `apps/notes/tsconfig.test.json`

**Remove path aliases (lines 104-105):**
```json
      "@beep/core-env/client": ["../../packages/core/env/src/client"],
      "@beep/core-env/server": ["../../packages/core/env/src/server"],
```

**Remove reference (lines 34-36):**
```json
    {
      "path": "../../packages/core/env/tsconfig.build.json"
    },
```

---

### 7. Update Next.js Configs

#### 7.1 `apps/notes/next.config.ts`

**Remove from `candidateTranspilePackages` array (line 70):**
```typescript
  "@beep/core-env",
```

---

### 8. Verify No Remaining References

After completing all tasks above, run:
```bash
grep -r "@beep/core-env" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.jsonc" .
```

This should return no results.

---

### 9. Update Lock File and Verify Build

```bash
# Remove node_modules and reinstall to update lockfile
bun install

# Run type checking
bun run check

# Run build to verify everything compiles
bun run build

# Run tests
bun run test
```

---

## Summary Checklist

- [ ] Delete `packages/core/env/` directory
- [ ] Update or delete `tsconfig.slices/core.json`
- [ ] Remove path aliases from `tsconfig.base.jsonc`
- [ ] Remove dependency from 14 `package.json` files
- [ ] Update import in `packages/iam/infra/src/config.ts`
- [ ] Update `apps/web/tsconfig.json` (paths + reference)
- [ ] Update `apps/web/tsconfig.test.json` (paths + reference)
- [ ] Update `apps/notes/tsconfig.json` (paths + reference)
- [ ] Update `apps/notes/tsconfig.test.json` (paths + reference)
- [ ] Update `apps/notes/next.config.ts` (transpilePackages)
- [ ] Verify no remaining `@beep/core-env` references with grep
- [ ] Run `bun install` to update lockfile
- [ ] Run `bun run check` to verify types
- [ ] Run `bun run build` to verify build
- [ ] Run `bun run test` to verify tests pass
