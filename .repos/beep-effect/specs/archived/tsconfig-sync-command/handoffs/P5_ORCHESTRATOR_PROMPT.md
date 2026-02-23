# P5 Orchestrator Prompt: Next.js App tsconfig Sync

## Mission

Extend the `tsconfig-sync` command to sync `tsconfig.json` files for **Next.js apps** in the `apps/` directory.

## Context

P4 fixed critical bugs in `tsconfig-sync` for monorepo packages. Now the command correctly syncs `tsconfig.build.json`, `tsconfig.src.json`, and `tsconfig.test.json` for all 60 packages.

P5 extends this to also sync Next.js app configs:
- `apps/todox/tsconfig.json`
- `apps/marketing/tsconfig.json`

## What Next.js Apps Need

Unlike packages (which have 3 split configs), Next.js apps use a **single `tsconfig.json`** with:

### 1. `compilerOptions.paths`

Maps `@beep/*` imports to source directories for IDE intellisense:

```json
{
  "compilerOptions": {
    "paths": {
      "@beep/iam-domain": ["../../packages/iam/domain/src/index"],
      "@beep/iam-domain/*": ["../../packages/iam/domain/src/*"],
      "@beep/schema": ["../../packages/common/schema/src/index"],
      "@beep/schema/*": ["../../packages/common/schema/src/*"]
    }
  }
}
```

### 2. `references`

Points to `tsconfig.build.json` of dependencies for TypeScript project references:

```json
{
  "references": [
    { "path": "../../packages/iam/domain/tsconfig.build.json" },
    { "path": "../../packages/common/schema/tsconfig.build.json" }
  ]
}
```

## Current Problems

1. **Duplicate references** in `apps/todox` (comms, customization appear twice)
2. **Invalid references** to non-existent packages (`@beep/customization-client`, `@beep/customization-ui`)
3. **Paths/deps mismatch** - some paths exist for packages not in dependencies
4. **Missing paths** - some dependencies lack path aliases

## Your Task

### Step 1: Read Context Files

Read these files to understand the current state:
- `specs/tsconfig-sync-command/handoffs/HANDOFF_P5.md` (detailed requirements)
- `tooling/cli/src/commands/tsconfig-sync/handler.ts` (main handler)
- `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts` (utilities)
- `apps/todox/tsconfig.json` (example app config)
- `apps/todox/package.json` (app dependencies)

### Step 2: Add CLI Options

Add to `schemas.ts`:
- `--packages-only` flag - Only sync packages (skip apps)
- `--apps-only` flag - Only sync apps (skip packages)

### Step 3: Add Helper Functions

Add to `tsconfig-writer.ts`:

```typescript
// Detect if package is a Next.js app
export const isNextJsApp = (pkgDir: string): Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem>;

// Build path aliases from package.json dependencies
export const buildPathAliases = (
  appDir: string,
  dependencies: HashSet.HashSet<string>,
  pkgDirMap: HashMap.HashMap<string, string>
): Record<string, string[]>;

// Build reference paths for an app
export const buildAppReferences = (
  appDir: string,
  dependencies: HashSet.HashSet<string>,
  tsconfigPaths: HashMap.HashMap<string, string[]>
): readonly string[];
```

### Step 4: Extend Handler

After the existing package sync loop, add app processing:

```typescript
// Process Next.js apps
const apps = ["web", "todox", "marketing"];
for (const app of apps) {
  const appDir = `${repoRoot}/apps/${app}`;

  // 1. Check if it's a Next.js app (has next.config.*)
  // 2. Read package.json to get @beep/* dependencies
  // 3. Read existing tsconfig.json
  // 4. Compute expected paths from dependencies
  // 5. Compute expected references from dependencies
  // 6. Check or write based on mode
}
```

### Step 5: Handle Special Cases

**@beep/errors** has subpath exports (not a barrel):
```json
{
  "@beep/errors/client": ["../../packages/common/errors/src/client"],
  "@beep/errors/shared": ["../../packages/common/errors/src/shared"],
  "@beep/errors/server": ["../../packages/common/errors/src/server"]
}
```

**@beep/ui** and **@beep/ui-core** use glob-only patterns:
```json
{
  "@beep/ui/*": ["../../packages/ui/ui/src/*"],
  "@beep/ui-core/*": ["../../packages/ui/core/src/*"]
}
```

### Step 6: Preserve Existing Structure

When writing app tsconfig.json:
- Preserve `extends`
- Preserve `compilerOptions` (update only `paths`)
- Preserve `include`
- Preserve `exclude`
- Preserve `plugins`

### Step 7: Test

```bash
# Check current drift
bun run repo-cli tsconfig-sync --check

# Sync all (packages + apps)
bun run repo-cli tsconfig-sync

# Verify no drift
bun run repo-cli tsconfig-sync --check

# Verify builds
bun run build --filter @beep/todox
bun run build --filter @beep/marketing

# Verify type check
bun run check --filter @beep/todox
bun run check --filter @beep/marketing
```

### Step 8: Create Verification Report

Create `specs/tsconfig-sync-command/handoffs/VERIFICATION_REPORT_P5.md` documenting:
- Apps synced
- Paths generated
- References generated
- Build/check results

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| Apps detected | 3 Next.js apps processed |
| Paths computed | All @beep/* deps have path aliases |
| References computed | All @beep/* deps have references |
| Duplicates removed | apps/todox has no duplicate refs |
| Invalid refs removed | Non-existent packages removed |
| Build passes | All 3 apps build |
| Check passes | All 3 apps pass type check |

## Key Constraints

1. **DO NOT modify package sync logic** - P4 is working correctly
2. **Use jsonc-parser** - Preserve comments/formatting (already used)
3. **Preserve app-specific paths** - Keep `@/*`, `*` entries that are not `@beep/*`
4. **Topological sort references** - Consistent with package behavior

## Reference

- Detailed requirements: `specs/tsconfig-sync-command/handoffs/HANDOFF_P5.md`
- P4 verification: `specs/tsconfig-sync-command/handoffs/VERIFICATION_REPORT_P4.md`
- Handler implementation: `tooling/cli/src/commands/tsconfig-sync/handler.ts`
- Utilities: `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts`
