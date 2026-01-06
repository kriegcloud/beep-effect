---
name: apply-identity-pattern
version: 5
created: 2024-12-24T12:00:00Z
iterations: 4
---

# Apply Identity Pattern - Refined Prompt

## Context

The `beep-effect` monorepo uses a custom identity system (`@beep/identity`) that provides hierarchical, type-safe identifiers for Effect services, Context tags, Schema classes, and SQL models. This system produces identifiers like `@beep/iam-server/db/repos/UserRepo` for tracing, debugging, and observability.

**Current State:**
- ~26 files use hardcoded string identifiers instead of the `$I` pattern
- Inconsistent naming: some use full paths, others use short names
- Missing schema annotations (`identifier`, `title`, `description`)
- Poor observability: traces show ambiguous service names

**Target State:**
- All services, tags, models, schemas, and errors use `$I` pattern
- Consistent hierarchical identifiers across the monorepo
- Rich schema annotations for JSON Schema generation
- Full observability with traceable service names

**Available TaggedComposers** (from `packages/common/identity/src/packages.ts`):
```
$ConstantsId, $ContractId, $CustomizationClientId, $CustomizationDomainId,
$CustomizationServerId, $CustomizationTablesId, $CustomizationUiId, $DbAdminId,
$DocumentsClientId, $DocumentsDomainId, $DocumentsServerId, $DocumentsTablesId,
$DocumentsUiId, $ErrorsId, $IamClientId, $IamDomainId, $IamServerId,
$IamTablesId, $IamUiId, $InvariantId, $LexicalSchemasId, $RepoCliId,
$RuntimeClientId, $RuntimeServerId, $SchemaId, $SharedClientId, $SharedDomainId,
$SharedServerId, $SharedTablesId, $SharedUiId, $UiCoreId, $UiId, $UtilsId,
$WebId, $YjsId
```

## Objective

Apply the `$I` identity pattern to all files in the beep-effect monorepo that define:
1. **@effect/sql/Model classes** (9 files)
2. **Effect.Service classes** (6 files)
3. **Context.Tag classes** (2 files)
4. **S.TaggedError classes** (9 files)
5. **Schema classes with hardcoded annotations** (0 files - none found needing migration)

**Success Criteria:**
- [ ] All 26 identified files updated to use `$I` pattern
- [ ] Zero TypeScript compilation errors (`bun run check` passes)
- [ ] Zero lint errors (`bun run lint` passes)
- [ ] All existing tests pass (`bun run test` passes)
- [ ] Build succeeds (`bun run build` passes)

## Role

You are an **Effect TypeScript Expert** specializing in monorepo-scale refactoring. You have deep knowledge of:
- Effect's service and context patterns
- Schema annotation systems
- The `@beep/identity` TaggedComposer API
- Parallel agent orchestration for large-scale changes

You prioritize correctness over speed, verifying each batch of changes before proceeding.

## Constraints

### Mandatory Effect Patterns

```typescript
// REQUIRED imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import * as Context from "effect/Context";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as F from "effect/Function";
import { $PackageId } from "@beep/identity/packages";
```

### Import Organization

When adding the identity import, follow the codebase's alphabetical ordering convention:
1. **Effect modules** (`effect/*`, `@effect/*`) — first, alphabetically
2. **Internal project imports** (`@beep/*`) — after Effect modules, alphabetically (identity imports go here in alphabetical order among other `@beep/*` imports)
3. **Relative imports** (`./`, `../`) — at the bottom

```typescript
// Example import order:
import * as M from "@effect/sql/Model";                   // 1. Effect modules (alphabetical)
import * as S from "effect/Schema";
import { $IamDomainId } from "@beep/identity/packages";   // 2. @beep/* imports (alphabetical: identity before shared-domain)
import { makeFields } from "@beep/shared-domain/common";
import { IamEntityIds } from "../../entity-ids";          // 3. Relative imports
```

### Import Conflict Handling

If a file already has a variable named `$I`:
1. Check if it's already a TaggedComposer — if so, skip the file
2. If it's a different variable, rename it to avoid conflict (e.g., `$I_old` or more descriptive name)
3. Report the conflict in the agent's output

### Mixed Pattern Files

Some files may contain multiple pattern types (e.g., both services and errors):
- Use ONE `const $I` declaration for the entire file
- Apply the appropriate pattern for each class type
- The TaggedComposer is chosen based on the package, not the class type

### Forbidden Patterns

```typescript
// NEVER use these
items.map(...)           // Use: F.pipe(items, A.map(...))
items.filter(...)        // Use: F.pipe(items, A.filter(...))
str.split(" ")           // Use: F.pipe(str, Str.split(" "))
new Date()               // Use: DateTime.unsafeNow()
async/await              // Use: Effect.gen + yield*
switch (x) { ... }       // Use: Match.value(x).pipe(...)
```

### Transformation Rules

**1. Effect.Service:**
```typescript
// BEFORE
export class MyRepo extends Effect.Service<MyRepo>()("MyRepo", {...}) {}

// AFTER
import { $IamServerId } from "@beep/identity/packages";
const $I = $IamServerId.create("db/repos/My");
export class MyRepo extends Effect.Service<MyRepo>()($I`MyRepo`, {...}) {}
```

**2. Context.Tag:**
```typescript
// BEFORE
export class MyDb extends Context.Tag("MyDb")<MyDb, Shape>() {}

// AFTER
import { $IamServerId } from "@beep/identity/packages";
const $I = $IamServerId.create("db/Db");
export class MyDb extends Context.Tag($I`MyDb`)<MyDb, Shape>() {}
```

**3. M.Class (Model):**
```typescript
// BEFORE
export class Model extends M.Class<Model>("MyModel")(fields, {
  identifier: "MyModel",
  schemaId: Symbol.for("@beep/domain/MyModel"),
}) {}

// AFTER
import { $IamDomainId } from "@beep/identity/packages";
const $I = $IamDomainId.create("entities/My/My.model");
export class Model extends M.Class<Model>($I`MyModel`)(
  fields,
  $I.annotations("MyModel", { description: "My model description" })
) {}
```

**4. S.TaggedError:**
```typescript
// BEFORE
export class MyError extends S.TaggedError<MyError>()("MyError", {...}) {}

// AFTER
import { $ErrorsId } from "@beep/identity/packages";
const $I = $ErrorsId.create("errors");
export class MyError extends S.TaggedError<MyError>()($I`MyError`, {...}) {}
```

**5. Schema Classes:**
```typescript
// BEFORE
export class MySchema extends S.Class<MySchema>("MySchema")(fields, {
  identifier: "MySchema",
}) {}

// AFTER
import { $IamClientId } from "@beep/identity/packages";
const $I = $IamClientId.create("contracts/my");
export class MySchema extends S.Class<MySchema>($I`MySchema`)(
  fields,
  $I.annotations("MySchema", { description: "My schema description" })
) {}
```

### Module Path Convention

The `$I.create("path")` argument must be:
- Relative to the package's `src/` directory
- Without the `.ts` extension
- Using forward slashes

**Examples:**
| File Path | Module Path |
|-----------|-------------|
| `packages/iam/server/src/db/repos/User.repo.ts` | `db/repos/User` |
| `packages/shared/domain/src/entities/Team/Team.model.ts` | `entities/Team/Team.model` |
| `packages/common/errors/src/errors.ts` | `errors` |
| `packages/shared/domain/src/common.ts` | `common` |
| `packages/iam/domain/src/index.ts` | `index` |

**Edge Case: Files at `src/` Root**
- Files directly in `src/` use just the filename (without extension)
- Example: `src/errors.ts` → `"errors"`, `src/config.ts` → `"config"`

### Multi-Class File Handling

When a file contains multiple classes (services, errors, schemas):
- Create **ONE** `const $I = $PackageId.create("module/path");` at the top
- **Share** that `$I` across all classes in the file
- Each class uses `` $I`ClassName` `` with its own unique name

```typescript
// Example: packages/common/errors/src/errors.ts
import { $ErrorsId } from "@beep/identity/packages";

const $I = $ErrorsId.create("errors"); // ONE $I for the whole file

// All errors in this file share the same $I
export class NotFoundError extends S.TaggedError<NotFoundError>()($I`NotFoundError`, {...}) {}
export class Unauthorized extends S.TaggedError<Unauthorized>()($I`Unauthorized`, {...}) {}
export class Forbidden extends S.TaggedError<Forbidden>()($I`Forbidden`, {...}) {}
```

### Package to TaggedComposer Mapping

| Package Path | TaggedComposer |
|--------------|----------------|
| `packages/iam/server/*` | `$IamServerId` |
| `packages/iam/domain/*` | `$IamDomainId` |
| `packages/iam/client/*` | `$IamClientId` |
| `packages/iam/tables/*` | `$IamTablesId` |
| `packages/iam/ui/*` | `$IamUiId` |
| `packages/documents/server/*` | `$DocumentsServerId` |
| `packages/documents/domain/*` | `$DocumentsDomainId` |
| `packages/documents/client/*` | `$DocumentsClientId` |
| `packages/documents/tables/*` | `$DocumentsTablesId` |
| `packages/documents/ui/*` | `$DocumentsUiId` |
| `packages/shared/server/*` | `$SharedServerId` |
| `packages/shared/domain/*` | `$SharedDomainId` |
| `packages/shared/client/*` | `$SharedClientId` |
| `packages/shared/tables/*` | `$SharedTablesId` |
| `packages/shared/ui/*` | `$SharedUiId` |
| `packages/common/schema/*` | `$SchemaId` |
| `packages/common/errors/*` | `$ErrorsId` |
| `packages/common/contract/*` | `$ContractId` |
| `packages/common/utils/*` | `$UtilsId` |
| `packages/common/invariant/*` | `$InvariantId` |
| `packages/common/lexical-schemas/*` | `$LexicalSchemasId` |
| `packages/common/yjs/*` | `$YjsId` |
| `packages/runtime/client/*` | `$RuntimeClientId` |
| `packages/runtime/server/*` | `$RuntimeServerId` |
| `packages/ui/ui/*` | `$UiId` |
| `packages/ui/core/*` | `$UiCoreId` |
| `packages/_internal/db-admin/*` | `$DbAdminId` |
| `apps/web/*` | `$WebId` |

### Exclusions

- **NEVER modify files in the `tooling/` directory** (at repository root) - causes circular dependencies with `@beep/identity`
- **NEVER modify files in `packages/common/identity/*`** - the identity package defines the TaggedComposer system itself and cannot use `$I` patterns (circular dependency)
- **NEVER modify `node_modules/`**
- **Skip files that already use `const $I =` pattern** - already migrated

### Description Writing Guidelines

When adding `$I.annotations("Name", { description: "..." })`:
- **Be specific**: Describe what the entity does, not what it is
- **Use active voice**: "Handles user authentication" not "User authentication handler"
- **Include context**: Mention the domain or use case
- **Keep it concise**: 1-2 sentences maximum

**Examples:**
| Entity | Good Description | Bad Description |
|--------|-----------------|-----------------|
| `UserRepo` | "Repository for managing user persistence and queries." | "User repository" |
| `NotFoundError` | "Indicates the requested resource does not exist." | "Not found error" |
| `SessionModel` | "Represents active user sessions with expiration tracking." | "Session model" |
| `DocumentsDb` | "Database client for the documents slice with connection pooling." | "Documents database" |

**For errors**, describe when they're thrown:
- `"Thrown when authentication credentials are invalid or expired."`
- `"Indicates a unique constraint violation in the database."`

## Resources

### Reference Implementations (Read These First)

| Category | File Path |
|----------|-----------|
| Effect.Service | `packages/shared/server/src/services/Upload.service.ts` |
| Context.Tag | `packages/shared/server/src/db/Db/Db.ts` |
| M.Class (Model) | `packages/shared/domain/src/entities/Organization/Organization.model.ts` |
| S.Class (Schema) | `packages/common/yjs/src/protocol/Op.ts` |

### Identity System

| File | Purpose |
|------|---------|
| `packages/common/identity/src/packages.ts` | All TaggedComposer exports |
| `packages/common/identity/src/Identifier.ts` | TaggedComposer API implementation |

### Files to Update

See **Appendix A** below for the complete file list organized by category.

## Output Specification

### Orchestration Strategy

Deploy parallel sub-agents organized by category:

**Batch 1: Models (9 files)**
- Agent 1: `packages/shared/domain/src/entities/*` (4 files)
- Agent 2: `packages/documents/domain/src/entities/*` (5 files)

**Batch 2: Services (6 files)**
- Agent 3: `packages/iam/client/src/clients/*` (6 files)

**Batch 3: Context Tags (2 files)**
- Agent 4: All Context.Tag files (2 files)

**Batch 4: TaggedErrors (9 files)**
- Agent 5: `packages/common/*` errors (5 files)
- Agent 6: `packages/documents/domain/*` errors (3 files)

### Pre-Flight Verification

**MUST be run on a clean working directory.** If `git status` shows modifications, commit or stash them first.

Before starting any batch:
```bash
# 1. Verify clean state (REQUIRED)
git status
# Expected: "nothing to commit, working tree clean"
# If not clean: git stash OR git commit -m "WIP: pre-migration state"

# 2. Update dependencies
bun install

# 3. Verify identity package compiles
bun run check --filter @beep/identity
# Must exit with status 0. If it fails, fix before proceeding.
```

### Pre-Processing Validation (MANDATORY)

**Before processing ANY file from the file lists, agents MUST validate each file.** This prevents wasted effort on non-existent or already-completed files.

#### Validation Steps (Per File)

For each file in the assigned batch:

1. **Verify File Exists**
   - Use Read tool or Glob tool to check if the file path exists
   - If file does NOT exist: **SKIP** and log: `⚠️ SKIPPED (not found): <file_path>`

2. **Check Migration Status**
   - Read the file content
   - Search for existing `$I` pattern: `const $I =` or `const $I=`
   - If pattern found: **SKIP** and log: `✅ SKIPPED (already migrated): <file_path>`

3. **Proceed Only If Valid**
   - File exists AND does not contain `$I` pattern → proceed with migration

#### Validation Report Format

**Before starting any modifications**, produce a validation report:

```markdown
## Pre-Processing Validation Report - [Batch Name]

### Summary
- Total files in batch: X
- Files to migrate: Y
- Files skipped (not found): Z
- Files skipped (already migrated): W

### Files to Migrate
1. `path/to/file1.ts` - needs migration
2. `path/to/file2.ts` - needs migration
...

### Files Skipped (Not Found)
1. `path/to/missing1.ts` - file does not exist
...

### Files Skipped (Already Migrated)
1. `path/to/done1.ts` - contains `const $I =`
...
```

#### Detection Patterns for Already Migrated Files

A file is considered **already migrated** if it contains ANY of:
- `const $I = $` (TaggedComposer assignment)
- `from "@beep/identity/packages"` (identity import)
- Pattern `` $I` `` followed by a class name (template tag usage)

**Example detection:**
```typescript
// These patterns indicate the file is ALREADY MIGRATED:
import { $IamDomainId } from "@beep/identity/packages";  // ← identity import
const $I = $IamDomainId.create("entities/User");          // ← $I assignment
export class UserModel extends M.Class<UserModel>($I`UserModel`)  // ← template tag
```

#### Agent Behavior Rules

1. **NEVER modify a file without first validating it**
2. **NEVER assume file lists are accurate** - always verify existence
3. **ALWAYS produce the validation report** before any modifications
4. **STOP and report** if >50% of files in a batch are missing (indicates stale file list)
5. **Log all skipped files** for audit trail and prompt maintenance

### Verification Between Batches

After each batch completes, run these commands in order:
```bash
# 1. Type check the specific packages modified
bun run check --filter @beep/iam-domain   # For IAM domain changes
bun run check --filter @beep/shared-domain  # For shared domain changes
# ... add filter for each modified package

# 2. If type check passes, run lint
bun run lint --filter @beep/iam-domain
bun run lint --filter @beep/shared-domain

# 3. If all above pass, run tests for modified packages
bun run test --filter @beep/iam-domain
```

**Failure Definition:** A batch fails if ANY of the following occurs:
- Any verification command exits with non-zero status
- TypeScript reports compilation errors (even warnings are acceptable)
- Lint reports unfixable errors (auto-fixable issues can be fixed with `bun run lint:fix`)

**If a batch fails:**
1. **STOP** - Do NOT proceed to next batch
2. Check command output for specific file paths and line numbers
3. Fix each failing file individually
4. Re-run the failing verification command
5. Only proceed when ALL verification commands pass with exit code 0

### Rollback Strategy

If a batch causes unfixable errors:
```bash
# Discard changes to specific files
git checkout -- packages/iam/domain/src/entities/  # Example

# Or discard all uncommitted changes
git checkout -- .
```

**Commit after each successful batch** to create restore points:
```bash
git add packages/iam/domain/
git commit -m "refactor(iam-domain): apply \$I identity pattern to models"
```

### Agent Instructions Template

Each sub-agent receives:
```markdown
## Task: Apply $I Pattern to [Category] in [Package]

### Files to Update
[List of specific file paths]

### TaggedComposer to Use
Import: `import { $PackageId } from "@beep/identity/packages";`

### Transformation Pattern
[Specific before/after for this category]

### Steps

#### Phase 1: Validation (MANDATORY - Do This First)
1. For EACH file in the list:
   a. Use Read tool to check if file exists
   b. If file not found → log "⚠️ SKIPPED (not found): <path>" and continue to next
   c. If file exists, search content for `const $I =` or `from "@beep/identity/packages"`
   d. If pattern found → log "✅ SKIPPED (already migrated): <path>" and continue to next
   e. If file exists AND not migrated → add to "files to process" list
2. Produce validation report with summary counts
3. If >50% of files are missing, STOP and report stale file list

#### Phase 2: Migration (Only After Validation)
For each file in "files to process" list:
1. Read the file to understand current implementation
2. Add import for TaggedComposer at top of file
3. Add `const $I = $PackageId.create("module/path");` after imports
4. Update class declaration to use `$I\`ClassName\``
5. Update annotations to use `$I.annotations("ClassName", {...})`
6. Remove any manual Symbol.for() definitions that are now redundant

### Verification
- File compiles without errors
- No lint warnings introduced
- Existing functionality preserved

### Output Format
Return:
1. Validation report (files found, skipped, migrated)
2. List of files actually modified
3. Any errors or issues encountered
```

## Examples

### Example 1: Model Transformation

**Before** (`packages/iam/domain/src/entities/Account/Account.model.ts`):
```typescript
import * as M from "@effect/sql/Model";
import { makeFields } from "@beep/shared-domain/common";
import { IamEntityIds } from "../../entity-ids";

export const AccountModelSchemaId = Symbol.for("@beep/iam-domain/AccountModel");

export class Model extends M.Class<Model>(`AccountModel`)(
  makeFields(IamEntityIds.AccountId, {
    accountId: S.NonEmptyString,
    providerId: S.NonEmptyString,
    // ...fields
  }),
  {
    identifier: "AccountModel",
    title: "Account Model",
    schemaId: AccountModelSchemaId,
  }
) {}
```

**After**:
```typescript
import { $IamDomainId } from "@beep/identity/packages";
import * as M from "@effect/sql/Model";
import { makeFields } from "@beep/shared-domain/common";
import { IamEntityIds } from "../../entity-ids";

const $I = $IamDomainId.create("entities/Account/Account.model");

export class Model extends M.Class<Model>($I`AccountModel`)(
  makeFields(IamEntityIds.AccountId, {
    accountId: S.NonEmptyString,
    providerId: S.NonEmptyString,
    // ...fields
  }),
  $I.annotations("AccountModel", {
    description: "Account model representing external OAuth provider accounts linked to users.",
  })
) {}
```

### Example 2: Service Transformation

**Before** (`packages/documents/server/src/files/ExifToolService.ts`):
```typescript
import * as Effect from "effect/Effect";

export class ExifToolService extends Effect.Service<ExifToolService>()("ExifToolService", {
  accessors: true,
  dependencies: [],
  effect: Effect.gen(function* () {
    // ...implementation
  }),
}) {}
```

**After**:
```typescript
import { $DocumentsServerId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";

const $I = $DocumentsServerId.create("files/ExifToolService");

export class ExifToolService extends Effect.Service<ExifToolService>()($I`ExifToolService`, {
  accessors: true,
  dependencies: [],
  effect: Effect.gen(function* () {
    // ...implementation
  }),
}) {}
```

### Example 3: TaggedError Transformation

**Before** (`packages/common/errors/src/errors.ts`):
```typescript
import * as S from "effect/Schema";

export class NotFoundError extends S.TaggedError<NotFoundError>()(
  "NotFoundError",
  { id: S.String, resource: S.String },
  HttpApiSchema.annotations({ status: 404 })
) {}
```

**After**:
```typescript
import { $ErrorsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $ErrorsId.create("errors");

// CASE 1: Original has HTTP/API annotations (status codes, headers, etc.)
// → MERGE them with $I.annotations using spread
export class NotFoundError extends S.TaggedError<NotFoundError>()(
  $I`NotFoundError`,
  { id: S.String, resource: S.String },
  {
    ...HttpApiSchema.annotations({ status: 404 }),  // Keep HTTP-specific annotations
    ...$I.annotations("NotFoundError", {            // Add identity annotations
      description: "Indicates the requested resource does not exist.",
    }),
  }
) {}

// CASE 2: Original has only identifier/title (or no annotations at all)
// → REPLACE entirely with $I.annotations (no spread needed)
export class Forbidden extends S.TaggedError<Forbidden>()(
  $I`Forbidden`,
  { reason: S.String },
  $I.annotations("Forbidden", { description: "Access denied due to insufficient permissions." })
) {}
```

**Decision Rule**: If the original 3rd argument contains anything OTHER than `identifier`, `title`, or `description` (e.g., `status`, `headers`, `security`), use the merge pattern. Otherwise, use the replace pattern.

## Verification Checklist

### Pre-Migration
- [ ] Read all reference implementation files
- [ ] Verify `@beep/identity` package is available
- [ ] Confirm TaggedComposer exports in `packages.ts`

### Pre-Processing Validation (Per Batch)
- [ ] All files in batch validated for existence
- [ ] All files checked for existing `$I` pattern
- [ ] Validation report produced with summary counts
- [ ] Missing files logged with `⚠️ SKIPPED (not found)` prefix
- [ ] Already-migrated files logged with `✅ SKIPPED (already migrated)` prefix
- [ ] Batch not started if >50% files missing (stale list detection)

### Per-File Checks
- [ ] Correct TaggedComposer imported for package
- [ ] `const $I = $PackageId.create("correct/module/path");` added
- [ ] Class identifier uses `` $I`ClassName` `` template tag
- [ ] Annotations use `$I.annotations("ClassName", {...})`
- [ ] No manual `Symbol.for()` definitions remain (unless needed elsewhere)
- [ ] File compiles without TypeScript errors

### Post-Migration
- [ ] `bun run check` passes for all modified packages
- [ ] `bun run lint` passes for all modified packages
- [ ] `bun run test` passes for all modified packages
- [ ] `bun run build` succeeds
- [ ] No regressions in existing functionality

---

## Appendix A: Complete File List

**Last validated:** 2026-01-06 - File lists verified against actual codebase state.

### Category 1: @effect/sql/Model Classes (9 files)

| File | Package ID | Module Path |
|------|------------|-------------|
| `packages/shared/domain/src/entities/AuditLog/AuditLog.model.ts` | `$SharedDomainId` | `entities/AuditLog/AuditLog.model` |
| `packages/shared/domain/src/entities/Team/Team.model.ts` | `$SharedDomainId` | `entities/Team/Team.model` |
| `packages/shared/domain/src/entities/Session/Session.model.ts` | `$SharedDomainId` | `entities/Session/Session.model` |
| `packages/shared/domain/src/entities/Folder/Folder.model.ts` | `$SharedDomainId` | `entities/Folder/Folder.model` |
| `packages/documents/domain/src/entities/DocumentVersion/DocumentVersion.model.ts` | `$DocumentsDomainId` | `entities/DocumentVersion/DocumentVersion.model` |
| `packages/documents/domain/src/entities/Document/Document.model.ts` | `$DocumentsDomainId` | `entities/Document/Document.model` |
| `packages/documents/domain/src/entities/DocumentFile/DocumentFile.model.ts` | `$DocumentsDomainId` | `entities/DocumentFile/DocumentFile.model` |
| `packages/documents/domain/src/entities/Discussion/Discussion.model.ts` | `$DocumentsDomainId` | `entities/Discussion/Discussion.model` |
| `packages/documents/domain/src/entities/Comment/Comment.model.ts` | `$DocumentsDomainId` | `entities/Comment/Comment.model` |

### Category 2: Effect.Service Classes (6 files)

| File | Package ID | Module Path | Service Name |
|------|------------|-------------|--------------|
| `packages/iam/client/src/clients/sign-in/sign-in.service.ts` | `$IamClientId` | `clients/sign-in/sign-in.service` | `SignInService` |
| `packages/iam/client/src/clients/verify/verify.service.ts` | `$IamClientId` | `clients/verify/verify.service` | `VerifyService` |
| `packages/iam/client/src/clients/user/user.service.ts` | `$IamClientId` | `clients/user/user.service` | `UserService` |
| `packages/iam/client/src/clients/sign-out/sign-out.service.ts` | `$IamClientId` | `clients/sign-out/sign-out.service` | `SignOutService` |
| `packages/iam/client/src/clients/session/session.service.ts` | `$IamClientId` | `clients/session/session.service` | `SessionService` |
| `packages/iam/client/src/clients/recover/recover.service.ts` | `$IamClientId` | `clients/recover/recover.service` | `RecoverService` |

### Category 3: Context.Tag Classes (2 files)

| File | Package ID | Module Path | Tags |
|------|------------|-------------|------|
| `packages/_internal/db-admin/src/Db/AdminDb.ts` | `$DbAdminId` | `Db/AdminDb` | `AdminDb` |
| `packages/common/utils/src/md5/parallel-hasher.ts` | `$UtilsId` | `md5/parallel-hasher` | `ParallelHasher` |

### Category 4: S.TaggedError Classes (9 files)

| File | Package ID | Module Path | Errors |
|------|------------|-------------|--------|
| `packages/common/utils/src/md5/errors.ts` | `$UtilsId` | `md5/errors` | `Md5ComputationError`, `UnicodeEncodingError`, `FileReadError`, `BlobSliceError`, `WorkerHashError` |
| `packages/common/schema/src/integrations/files/pdf-metadata/errors.ts` | `$SchemaId` | `integrations/files/pdf-metadata/errors` | `PdfParseError`, `PdfTimeoutError`, `PdfFileTooLargeError`, `PdfEncryptedError`, `PdfInvalidError` |
| `packages/common/schema/src/integrations/files/exif-metadata/errors.ts` | `$SchemaId` | `integrations/files/exif-metadata/errors` | `MetadataParseError`, `ExifTimeoutError`, `ExifFileTooLargeError` |
| `packages/common/schema/src/integrations/files/file-types/detection.ts` | `$SchemaId` | `integrations/files/file-types/detection` | `InvalidChunkSizeError` |
| `packages/common/schema/src/integrations/files/file-types/utils.ts` | `$SchemaId` | `integrations/files/file-types/utils` | `InvalidFileTypeError`, `IllegalChunkError` |
| `packages/documents/domain/src/entities/Document/Document.errors.ts` | `$DocumentsDomainId` | `entities/Document/Document.errors` | `DocumentNotFoundError`, `DocumentPermissionDeniedError`, `DocumentArchivedError`, `DocumentLockedError`, `DocumentAlreadyPublishedError`, `DocumentNotPublishedError` |
| `packages/documents/domain/src/entities/Discussion/Discussion.errors.ts` | `$DocumentsDomainId` | `entities/Discussion/Discussion.errors` | `DiscussionNotFoundError`, `DiscussionPermissionDeniedError`, `DiscussionAlreadyResolvedError`, `DiscussionNotResolvedError` |
| `packages/documents/domain/src/entities/Comment/Comment.errors.ts` | `$DocumentsDomainId` | `entities/Comment/Comment.errors` | `CommentNotFoundError`, `CommentPermissionDeniedError`, `CommentTooLongError` |

### Category 5: Schema Classes with Hardcoded Annotations (0 files)

No files found needing migration.

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/common/identity/src/packages.ts` - TaggedComposer exports
- `packages/common/identity/src/Identifier.ts` - TaggedComposer API
- `packages/shared/server/src/services/Upload.service.ts` - Effect.Service reference
- `packages/shared/server/src/db/Db/Db.ts` - Context.Tag reference
- `packages/shared/domain/src/entities/Organization/Organization.model.ts` - M.Class reference
- `packages/common/yjs/src/protocol/Op.ts` - S.Class reference
- `packages/iam/domain/src/entities/Account/Account.model.ts` - Before example
- `packages/common/errors/src/errors.ts` - Before example
- `packages/documents/server/src/files/ExifToolService.ts` - Before example

**Documentation Referenced:**
- Effect.Service API documentation
- Context.Tag patterns
- Schema annotations system
- @effect/sql/Model patterns

**AGENTS.md Files Consulted:**
- `packages/common/identity/AGENTS.md`
- `packages/common/schema/AGENTS.md`
- `packages/common/errors/AGENTS.md`
- `packages/common/contract/AGENTS.md`
- `packages/shared/domain/AGENTS.md`
- `packages/shared/server/AGENTS.md`
- `packages/iam/domain/AGENTS.md`
- `packages/iam/server/AGENTS.md`
- `packages/documents/domain/AGENTS.md`
- `packages/documents/server/AGENTS.md`

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | HIGH: Module path edge cases, multi-class handling, annotation syntax clarity, verification specificity. MEDIUM: Import organization, description guidelines, conflict handling, mixed patterns, rollback strategy. | Added edge case examples for src/ root files. Added Multi-Class File Handling section. Clarified Example 3 with merge vs standalone annotation patterns. Added Import Organization section with order rules. Added Import Conflict Handling section. Added Mixed Pattern Files guidance. Added Description Writing Guidelines with examples. Added Pre-Flight Verification section. Made Verification Between Batches commands specific. Added Rollback Strategy section. |
| 2         | HIGH: Exclusion path notation. MEDIUM: Annotation merging decision rule unclear, git status vague, missing failure threshold, file list inaccuracies. | Clarified exclusion path as "tooling/ directory at repo root". Added explicit Decision Rule for annotation merging (CASE 1 vs CASE 2). Made pre-flight verification require clean working directory. Added Failure Definition section with explicit criteria. Fixed incomplete error listings (removed already-migrated files). Clarified SignedUrlService/StorageService filename vs classname difference. |
| 3         | HIGH: No validation of file existence before processing. HIGH: No detection of already-migrated files leading to wasted effort. MEDIUM: No validation report format. | Added comprehensive "Pre-Processing Validation (MANDATORY)" section with per-file validation steps, validation report format template, detection patterns for already-migrated files, and agent behavior rules. Updated Agent Instructions Template with two-phase approach (Validation → Migration). Added Pre-Processing Validation checklist items. Added stale file list detection (>50% missing threshold). |
| 4         | HIGH: Import order incorrect (identity at top vs alphabetical). MEDIUM: TaggedComposer list stale (non-existent: `$ScratchpadId`, `$MockId`, `$IdentityId`, `$NotesId`, `$ServerId`, `$TypesId`; missing: `$RepoCliId`, `$Customization*Id` variants). MEDIUM: Package-to-TaggedComposer mapping incomplete. MEDIUM: File paths incorrect (`adapters/repos` → `db/repos`, `internal/db/pg` → `factories/db-client/pg`). | Fixed Import Organization section: identity imports now alphabetically among `@beep/*` imports, not at top. Updated TaggedComposer list to match actual packages.ts exports (35 composers). Added missing package mappings: `$IamTablesId`, `$IamUiId`, `$DocumentsTablesId`, `$DocumentsUiId`, `$DocumentsClientId`, `$SharedTablesId`, `$SharedUiId`, `$InvariantId`, `$LexicalSchemasId`, `$YjsId`, `$RuntimeServerId`. Fixed IAM server repo paths from `adapters/repos` to `db/repos`. Fixed documents server repo paths. Fixed PgClient path from `internal/db/pg` to `factories/db-client/pg`. Removed `packages/common/identity/src/schema.ts` from Category 4 (no `$IdentityId` exists). Added identity package to Exclusions section. Updated Category 4 file count from 15 to 14. |
