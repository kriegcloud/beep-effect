# Create-Slice CLI Bugs

> Tracking bugs discovered during `create-slice` command testing

---

## Resolution Summary

**Bugs 1-28 have been fixed.** Several new bugs (29-32) were discovered during the 2026-01-06 test cycle. The test cycle now passes after manual fixes, but the CLI needs updates to automate these fixes.

### Test Cycle 2026-01-06 Results

| Step | Result |
|------|--------|
| `bun run create-slice --name comms --description "..."` | PASS (with warnings) |
| `bun install` | PASS |
| `bun run check` | PASS |
| `bun run build` | PASS (after manual fix for apps/web/tsconfig.json) |
| `bun run lint:fix` | PASS (after manual fix for _check.ts unused imports) |

### Key Fixes Applied

1. **Bug #20: Root package.json workspaces entry missing** - FIXED in `config-updater.ts`
   - Added automatic workspace entry generation for new slices

2. **Bug #24: relations.ts unused import** - FIXED in `file-generator.ts`
   - Template now generates proper placeholder relations with used imports

3. **Bug #25: Server db namespace export conflicts** - FIXED in `file-generator.ts` and templates
   - Updated `db/index.ts` template to use proper namespace exports
   - Fixed Db/index.ts to export the database layer correctly

4. **Bug #26: Domain missing Entities export** - FIXED in `file-generator.ts` and templates
   - Domain index.ts now properly exports the Entities namespace

5. **Bug #27: .js import extension in relations.ts** - FIXED in `file-generator.ts` and template
   - Removed `.js` extension from placeholder import path

6. **Bug #28: Biome lint error: noEmptyPattern in relations.ts** - FIXED in `file-generator.ts` and template
   - Changed `({})` to `(_)` in the relations callback to avoid empty destructuring pattern lint error
   - Changed `import { relations } from "drizzle-orm"` to `import * as d from "drizzle-orm"` for consistency

### Root Cause Analysis

The primary issue was that `file-generator.ts` was using inline string generators instead of `.hbs` (Handlebars) templates. This caused:
- Inconsistent file generation across different package types
- Missing placeholder files that other generated files depended on
- Improper import/export patterns

The fix involved:
1. Converting inline generators to proper `.hbs` templates
2. Adding missing placeholder entity, repo, and table templates
3. Updating the file generator to use the template system consistently
4. Adding `config-updater.ts` for workspace and configuration updates

---

## Bug #1: Identity Composer Type Recursion Limit

**File**: `packages/common/identity/src/packages.ts`

**Error**:
```
src/packages.ts:18:19 - error TS2589: Type instantiation is excessively deep and possibly infinite.

 18 const composers = $I.compose(
                      ~~~~~~~~~~~
```

**Cause**: The `$I.compose()` function is being called with too many package names in a single call. TypeScript's recursive `TaggedModuleRecord` type hits its instantiation depth limit (~40-50 items).

**Manual Fix Applied**:
Split the existing `compose()` call into 3 batches of ~16 items each:
```typescript
const batch1 = $I.compose("shared-ui", ..., "shared-server"); // 16 items
const batch2 = $I.compose("identity", ..., "tooling-utils");  // 16 items
const batch3 = $I.compose("repo-cli", ..., "customization-ui"); // 14 items
```

**Status**: MANUALLY FIXED (pre-emptively)

**Root Cause in create-slice**: The ts-morph agent's `addIdentityComposers()` function adds 5 new package names to a single `compose()` call without:
1. Checking the current count of items
2. Using the batched pattern when count exceeds ~15 items
3. Distributing new items across existing batches

**Fix Required in ts-morph.ts**:
1. Parse existing batches (batch1, batch2, batch3, etc.)
2. Find the batch with fewest items
3. Add new slice packages to that batch
4. Update corresponding exports to use correct batch variable

---

## Bug #2: ts-morph Export Updates Reference Wrong Variable

**File**: `tooling/cli/src/commands/create-slice/utils/ts-morph.ts`

**Issue**: The `addIdentityComposers()` function generates exports like:
```typescript
export const $CommsDomainId = composers.$CommsDomainId;
```

But the pre-fixed file uses batch variables (`batch1`, `batch2`, `batch3`), not `composers`.

**Fix Required**:
- Detect which batch the new slice was added to
- Generate export with correct batch reference: `batch3.$CommsDomainId`

---

## Bug #3: Unused Imports in Generated Entity IDs File

**File**: `packages/shared/domain/src/entity-ids/comms/ids.ts` (generated)

**Error**:
```
src/entity-ids/comms/ids.ts(2,1): error TS6133: 'EntityId' is declared but its value is never read.
src/entity-ids/comms/ids.ts(3,1): error TS6133: 'S' is declared but its value is never read.
src/entity-ids/comms/ids.ts(5,7): error TS6133: '$I' is declared but its value is never read.
```

**Cause**: The template generates imports and a local `$I` variable but doesn't create any actual entity IDs - just comments showing examples.

**Fix Required**: Either:
1. Remove unused imports from the template (add them only when creating actual IDs)
2. Or add a `// @ts-nocheck` comment at the top
3. Or generate at least one placeholder entity ID

---

## Bug #4: entity-kind.ts Not Updated with New Slice

**File**: `packages/shared/domain/src/entity-ids/entity-kind.ts`

**Issue**: The file imports and uses TableName.Options from each slice (Iam, Shared, Documents, Customization) but create-slice didn't add the Comms import/usage.

**Current Code**:
```typescript
import * as Customization from "./customization";
import * as Documents from "./documents";
import * as Iam from "./iam";
import * as Shared from "./shared";
// MISSING: import * as Comms from "./comms";

export class EntityKind extends BS.StringLiteralKit(
  ...Iam.TableName.Options,
  ...Shared.TableName.Options,
  ...Documents.TableName.Options,
  ...Customization.TableName.Options
  // MISSING: ...Comms.TableName.Options
)
```

**Fix Required**: The ts-morph agent needs to:
1. Add `import * as ${SliceName} from "./${sliceName}"` to entity-kind.ts
2. Add `...${SliceName}.TableName.Options` to the StringLiteralKit call

---

## Bug #5: tsconfig.build.json Not Updated

**File**: Various `tsconfig.build.json` files (e.g., in shared-domain)

**Issue**: The create-slice command doesn't update the tsconfig.build.json files to include the new slice's directory references.

**Fix Required**: Add ts-morph/jsonc-parser function to update tsconfig.build.json files that need to reference the new slice.

---

## Bug #6: runtime/server package.json Not Updated

**Files**: `packages/runtime/server/package.json`

**Issue**: New slice dependencies not added to peerDependencies & devDependencies.

---

## Bug #7: runtime/server tsconfig Files Not Updated

**Files**:
- `packages/runtime/server/tsconfig.build.json`
- `packages/runtime/server/tsconfig.src.json`
- `packages/runtime/server/tsconfig.test.json`

**Issue**: References to new slice packages not added.

---

## Bug #8: db-admin package.json Not Updated

**File**: `packages/_internal/db-admin/package.json`

**Issue**: New slice dependencies not added.

---

## Bug #9: db-admin tsconfig Files Not Updated

**Files**: All `packages/_internal/db-admin/tsconfig.*.json` files

**Issue**: References to new slice packages not added.

---

## Bug #10: Placeholder Entity Not Created in Domain

**Files**:
- `packages/comms/domain/src/entities/Placeholder/Placeholder.model.ts` - NOT CREATED
- `packages/comms/domain/src/entities/Placeholder/index.ts` - NOT CREATED

**Issue**: A placeholder entity should be created so the slice compiles and demonstrates the pattern.

---

## Bug #11: Domain index.ts Missing Placeholder Export

**File**: `packages/comms/domain/src/index.ts`

**Issue**: Missing `export * as Placeholder from "./entities/Placeholder"` namespace export.

---

## Bug #12: Templates Use .js Extensions

**Files**: Multiple generated files use `.js` import extensions:
- `packages/comms/domain/src/index.ts`
- `packages/comms/server/src/db/repositories.ts`
- `packages/comms/server/src/db/index.ts`
- `packages/comms/server/src/index.ts`
- `packages/comms/tables/src/schema.ts`

**Issue**: Import/export statements use `.js` extension which is inconsistent with codebase patterns.

---

## Bug #13: Identity Composers Not Exported

**File**: `packages/common/identity/src/packages.ts`

**Issue**: `$CommsServerId`, `$CommsDomainId`, `$CommsTablesId`, `$CommsClientId`, `$CommsUiId` not exported (ts-morph didn't add them because of the batch variable mismatch).

---

## Bug #14: Server Repos Not Created

**Files**:
- `packages/comms/server/src/db/repos/Placeholder.repo.ts` - NOT CREATED
- `packages/comms/server/src/db/repos/_common.ts` - NOT CREATED

**Issue**: Repository files not generated for the placeholder entity.

---

## Bug #15: Server repositories.ts Missing PlaceholderRepo

**File**: `packages/comms/server/src/db/repositories.ts`

**Issue**: PlaceholderRepo not included in `Repos` type and layer.

---

## Bug #16: Server db/index.ts Missing CommsRepos Export

**File**: `packages/comms/server/src/db/index.ts`

**Issue**: `CommsRepos` not exported as namespace.

---

## Bug #17: Placeholder Table Not Created

**File**: `packages/comms/tables/src/tables/placeholder.table.ts` - NOT CREATED

**Issue**: Placeholder table definition not generated.

---

## Bug #18: Tables index.ts Missing Placeholder Export

**File**: `packages/comms/tables/src/tables/index.ts`

**Issue**: Placeholder table not exported.

---

## Bug #19: Tables relations.ts Missing Placeholder Relations

**File**: `packages/comms/tables/src/relations.ts`

**Issue**: Placeholder relations not created.

---

## Bug Inventory

| # | Bug | Category | Status |
|---|-----|----------|--------|
| 1 | Identity composer type recursion | Type System | FIXED |
| 2 | Export references wrong variable | ts-morph | FIXED |
| 3 | Unused imports in entity IDs template | Template | FIXED |
| 4 | entity-kind.ts not updated | ts-morph | FIXED |
| 5 | tsconfig.build.json not updated | Config | FIXED |
| 6 | runtime/server package.json not updated | Config | FIXED |
| 7 | runtime/server tsconfigs not updated | Config | FIXED |
| 8 | db-admin package.json not updated | Config | FIXED |
| 9 | db-admin tsconfigs not updated | Config | FIXED |
| 10 | Placeholder entity not created | Template/Generator | FIXED |
| 11 | Domain index.ts missing placeholder export | Template | FIXED |
| 12 | Templates use .js extensions | Template | NOT A BUG (codebase uses .js) |
| 13 | Identity composers not exported | ts-morph | FIXED |
| 14 | Server repos not created | Template/Generator | FIXED |
| 15 | Server repositories.ts missing PlaceholderRepo | Template | FIXED |
| 16 | Server db/index.ts missing CommsRepos export | Template | FIXED |
| 17 | Placeholder table not created | Template/Generator | FIXED |
| 18 | Tables index.ts missing placeholder export | Template | FIXED |
| 19 | Tables relations.ts missing placeholder relations | Template | FIXED |
| 20 | Root package.json missing workspace entry | Config | FIXED |
| 21 | Server missing db.ts re-export file | Template | FIXED |
| 22 | Db/index.ts uses export * instead of namespace export | Template | FIXED |
| 23 | tsconfig.base.jsonc paths use .ts suffix | Config | FIXED |
| 24 | relations.ts unused import | Template | FIXED |
| 25 | Server db namespace export conflicts | Template/Generator | FIXED |
| 26 | Domain missing Entities export | Template/Generator | FIXED |
| 27 | .js import extension in relations.ts | Template | FIXED |
| 28 | Biome noEmptyPattern lint error in relations.ts | Template | FIXED |
| 29 | apps/web/tsconfig.json not updated | Config | NEW |
| 30 | Server package.json needs explicit ./db export | Package.json | FIXED |
| 31 | Duplicate identity warning in config-updater | Identity | FIXED |
| 32 | _check.ts has unused imports | Template/Generator | FIXED |

---

## Bug #29: apps/web/tsconfig.json Not Updated

**File**: `apps/web/tsconfig.json`

**Error** (during `bun run build`):
```
Type error: The project root is ambiguous, but is required to resolve export map entry '.'
in file '.../packages/comms/server/package.json'. Supply the `rootDir` compiler option to disambiguate.
```

**Cause**: The CLI updates `runtime/server` and `db-admin` tsconfigs, but not `apps/web/tsconfig.json`. Since `runtime/server` imports from `@beep/comms-server/db`, and `apps/web` depends on `runtime/server`, the web app needs:
1. Path aliases for all comms-* packages
2. References to their tsconfig.build.json files

**Manual Fix Applied**:
Added to `apps/web/tsconfig.json`:
- Path aliases: `@beep/comms-domain`, `@beep/comms-tables`, `@beep/comms-server`, `@beep/comms-client`, `@beep/comms-ui` (and their /* variants)
- References: All 5 slice packages' `tsconfig.build.json` files

**Status**: NEW - CLI needs update

**Fix Required**: Add function to `config-updater.ts` to update `apps/web/tsconfig.json`:
```typescript
export const updateWebAppTsconfig = (sliceName: string) => { ... }
```

---

## Bug #30: Server package.json Needs Explicit ./db Export

**File**: `packages/comms/server/package.json` (generated)

**Issue**: The exports map used wildcard `./*` which Next.js couldn't resolve during build:
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"  // Wildcard wasn't resolving ./db properly
  }
}
```

**Fix Applied**: Updated `file-generator.ts` to add explicit `./db` export for server layer:
```typescript
const layerExports = {
  server: {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./db": "./src/db.ts",  // Explicit export
    "./*": "./src/*.ts",
  },
  // ... other layers
};
```

**Status**: FIXED in file-generator.ts

---

## Bug #31: Duplicate Identity Warning

**File**: `tooling/cli/src/commands/create-slice/utils/config-updater.ts`

**Warning** (during create-slice execution):
```
[beep/identity] Duplicate identity detected: "@beep/repo-cli/commands/create-slice/utils/config-updater/updateTsconfigReferences"
This may indicate a copy-paste error. Each identity string must be unique.
```

**Cause**: The `updateTsconfigReferences` function was using `$I` template tags for `Effect.withSpan()` calls. The `$I` tag registers identities in a global registry (intended for Service/Context tags). Since these functions are called multiple times, duplicate warnings were triggered.

**Root Cause Analysis**:
- `$I` template tags should ONLY be used for Effect Service/Context identifiers (which must be unique)
- Span names (for telemetry) can be reused and don't need identity registration

**Fix Applied**: Changed all `Effect.withSpan($I`functionName`)` calls to use plain strings instead:
- `$I`updateTsconfigReferences`` → `"ConfigUpdater.updateTsconfigReferences"`
- Similar changes for all other functions in the file
- Kept `$I` only for the `ConfigUpdaterService` service tag (line ~542)

**Status**: FIXED in config-updater.ts

---

## Bug #32: _check.ts Has Unused Imports

**File**: `packages/comms/tables/src/_check.ts` (generated)

**Error** (during `bun run lint:fix`):
```
lint/correctness/noUnusedImports: This import is unused.
> import type { InferInsertModel as _InferInsertModel, InferSelectModel as _InferSelectModel } from "drizzle-orm";
```

**Cause**: The stub `_check.ts` file included unused imports aliased with underscores, which Biome still flagged.

**Fix Applied**: Updated `generateTablesCheck()` in `file-generator.ts` to generate a minimal stub without any imports:
```typescript
// Old (unused imports):
import type { InferInsertModel as _InferInsertModel, ... } from "drizzle-orm";

// New (no imports):
// Add type verification checks when you create real entities
// See JSDoc example above for the pattern to use
export {};
```

**Status**: FIXED in file-generator.ts and _check.ts.hbs template

---

## Files Modified by create-slice (need rollback before re-test)

- `packages/_internal/db-admin/src/slice-relations.ts`
- `packages/_internal/db-admin/src/tables.ts`
- `packages/common/identity/src/packages.ts` (keep the batch fix!)
- `packages/iam/domain/src/entities/Account/Account.model.ts`
- `packages/runtime/server/src/DataAccess.layer.ts`
- `packages/runtime/server/src/Persistence.layer.ts`
- `packages/shared/domain/src/entity-ids/any-entity-id.ts`
- `packages/shared/domain/src/entity-ids/entity-ids.ts`
- `tsconfig.base.jsonc`
- `tsconfig.json`
- `packages/comms/` (new directory)
- `packages/shared/domain/src/entity-ids/comms/` (new directory)
- `tsconfig.slices/comms.json` (new file)

---

## Notes

- The original file had 46 packages in a single compose() call
- When create-slice adds 5 more (comms-*), it becomes 51, exceeding the ~40-50 item type recursion limit
- The pre-emptive fix splits into batches to accommodate future growth
- Consider adding a batch4 for future slices to maintain ~15 items per batch

---
