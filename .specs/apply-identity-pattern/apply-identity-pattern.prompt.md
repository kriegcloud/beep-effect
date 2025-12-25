---
name: apply-identity-pattern
version: 3
created: 2024-12-24T12:00:00Z
iterations: 2
---

# Apply Identity Pattern - Refined Prompt

## Context

The `beep-effect` monorepo uses a custom identity system (`@beep/identity`) that provides hierarchical, type-safe identifiers for Effect services, Context tags, Schema classes, and SQL models. This system produces identifiers like `@beep/iam-server/adapters/repos/UserRepo` for tracing, debugging, and observability.

**Current State:**
- ~100+ files use hardcoded string identifiers instead of the `$I` pattern
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
$SharedUiId, $SharedClientId, $IamServerId, $DocumentsTablesId, $UiId,
$YjsId, $InvariantId, $WebId, $SchemaId, $DocumentsDomainId, $ContractId,
$RuntimeServerId, $IamClientId, $IamUiId, $SharedServerId, $IdentityId,
$UtilsId, $IamDomainId, $RuntimeClientId, $ScratchpadId, $SharedTablesId,
$MockId, $UiCoreId, $ErrorsId, $TypesId, $DocumentsClientId, $DocumentsUiId,
$ConstantsId, $NotesId, $DocumentsServerId, $SharedDomainId, $DbAdminId,
$ServerId, $IamTablesId, $LexicalSchemasId
```

## Objective

Apply the `$I` identity pattern to all files in the beep-effect monorepo that define:
1. **Effect.Service classes** (40 files)
2. **Context.Tag classes** (9 files)
3. **@effect/sql/Model classes** (24 files)
4. **S.TaggedError classes** (15 files, 59 errors)
5. **Schema classes with hardcoded annotations** (13+ files)

**Success Criteria:**
- [ ] All 100+ identified files updated to use `$I` pattern
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

When adding the identity import, follow this order:
1. **External packages** (`@beep/identity/packages`) — at the very top
2. **Effect modules** (`effect/*`, `@effect/*`) — after external packages
3. **Internal project imports** (`@beep/*`) — after Effect modules
4. **Relative imports** (`./`, `../`) — at the bottom

```typescript
// Example import order:
import { $IamDomainId } from "@beep/identity/packages";  // 1. Identity first
import * as M from "@effect/sql/Model";                   // 2. Effect modules
import * as S from "effect/Schema";
import { makeFields } from "@beep/shared-domain/common";  // 3. Internal packages
import { IamEntityIds } from "../../entity-ids";          // 4. Relative imports
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
const $I = $IamServerId.create("adapters/repos/My");
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
| `packages/iam/server/src/adapters/repos/User.repo.ts` | `adapters/repos/User` |
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
| `packages/documents/server/*` | `$DocumentsServerId` |
| `packages/documents/domain/*` | `$DocumentsDomainId` |
| `packages/shared/server/*` | `$SharedServerId` |
| `packages/shared/domain/*` | `$SharedDomainId` |
| `packages/shared/client/*` | `$SharedClientId` |
| `packages/common/schema/*` | `$SchemaId` |
| `packages/common/errors/*` | `$ErrorsId` |
| `packages/common/contract/*` | `$ContractId` |
| `packages/common/utils/*` | `$UtilsId` |
| `packages/common/identity/*` | `$IdentityId` |
| `packages/runtime/client/*` | `$RuntimeClientId` |
| `packages/ui/ui/*` | `$UiId` |
| `packages/ui/core/*` | `$UiCoreId` |
| `packages/_internal/db-admin/*` | `$DbAdminId` |
| `apps/web/*` | `$WebId` |

### Exclusions

- **NEVER modify files in the `tooling/` directory** (at repository root) - causes circular dependencies with `@beep/identity`
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

**Batch 1: Models (24 files)**
- Agent 1: `packages/iam/domain/src/entities/*` (18 files)
- Agent 2: `packages/shared/domain/src/entities/*` (5 files)
- Agent 3: `packages/documents/domain/src/entities/*` (5 files)

**Batch 2: Services (40 files)**
- Agent 4: `packages/iam/server/src/adapters/repos/*` (13 files)
- Agent 5: `packages/iam/client/src/clients/*` (3 files)
- Agent 6: `packages/documents/server/src/*` (5 files)
- Agent 7: `packages/shared/server/src/*` (2 files)
- Agent 8: `packages/runtime/client/src/*` (2 files)
- Agent 9: `packages/ui/ui/src/services/*` (2 files)
- Agent 10: `apps/web/src/*` (1 file)

**Batch 3: Context Tags (9 files)**
- Agent 11: All Context.Tag files

**Batch 4: TaggedErrors (15 files)**
- Agent 12: `packages/common/*` errors
- Agent 13: `packages/iam/*` errors
- Agent 14: `packages/documents/*` errors
- Agent 15: `packages/shared/*` errors

**Batch 5: Schema Annotations (13 files)**
- Agent 16: All schema annotation files

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
1. Read each file to understand current implementation
2. Add import for TaggedComposer at top of file
3. Add `const $I = $PackageId.create("module/path");` after imports
4. Update class declaration to use `$I\`ClassName\``
5. Update annotations to use `$I.annotations("ClassName", {...})`
6. Remove any manual Symbol.for() definitions that are now redundant

### Verification
- File compiles without errors
- No lint warnings introduced
- Existing functionality preserved
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

### Category 1: @effect/sql/Model Classes (24 files)

| File | Package ID | Module Path |
|------|------------|-------------|
| `packages/iam/domain/src/entities/TeamMember/TeamMember.model.ts` | `$IamDomainId` | `entities/TeamMember/TeamMember.model` |
| `packages/iam/domain/src/entities/Subscription/Subscription.model.ts` | `$IamDomainId` | `entities/Subscription/Subscription.model` |
| `packages/iam/domain/src/entities/Verification/Verification.model.ts` | `$IamDomainId` | `entities/Verification/Verification.model` |
| `packages/iam/domain/src/entities/ApiKey/ApiKey.model.ts` | `$IamDomainId` | `entities/ApiKey/ApiKey.model` |
| `packages/iam/domain/src/entities/DeviceCode/DeviceCode.model.ts` | `$IamDomainId` | `entities/DeviceCode/DeviceCode.model` |
| `packages/iam/domain/src/entities/Invitation/Invitation.model.ts` | `$IamDomainId` | `entities/Invitation/Invitation.model` |
| `packages/iam/domain/src/entities/Member/Member.model.ts` | `$IamDomainId` | `entities/Member/Member.model` |
| `packages/iam/domain/src/entities/OAuthAccessToken/OAuthAccessToken.model.ts` | `$IamDomainId` | `entities/OAuthAccessToken/OAuthAccessToken.model` |
| `packages/iam/domain/src/entities/ScimProvider/ScimProvider.model.ts` | `$IamDomainId` | `entities/ScimProvider/ScimProvider.model` |
| `packages/iam/domain/src/entities/Account/Account.model.ts` | `$IamDomainId` | `entities/Account/Account.model` |
| `packages/iam/domain/src/entities/WalletAddress/WalletAddress.model.ts` | `$IamDomainId` | `entities/WalletAddress/WalletAddress.model` |
| `packages/iam/domain/src/entities/TwoFactor/TwoFactor.model.ts` | `$IamDomainId` | `entities/TwoFactor/TwoFactor.model` |
| `packages/iam/domain/src/entities/SsoProvider/SsoProvider.model.ts` | `$IamDomainId` | `entities/SsoProvider/SsoProvider.model` |
| `packages/iam/domain/src/entities/RateLimit/RateLimit.model.ts` | `$IamDomainId` | `entities/RateLimit/RateLimit.model` |
| `packages/iam/domain/src/entities/Passkey/Passkey.model.ts` | `$IamDomainId` | `entities/Passkey/Passkey.model` |
| `packages/iam/domain/src/entities/OrganizationRole/OrganizationRole.model.ts` | `$IamDomainId` | `entities/OrganizationRole/OrganizationRole.model` |
| `packages/iam/domain/src/entities/OAuthConsent/OAuthConsent.model.ts` | `$IamDomainId` | `entities/OAuthConsent/OAuthConsent.model` |
| `packages/iam/domain/src/entities/OAuthApplication/OAuthApplication.model.ts` | `$IamDomainId` | `entities/OAuthApplication/OAuthApplication.model` |
| `packages/iam/domain/src/entities/Jwks/Jwks.model.ts` | `$IamDomainId` | `entities/Jwks/Jwks.model` |
| `packages/shared/domain/src/entities/Team/Team.model.ts` | `$SharedDomainId` | `entities/Team/Team.model` |
| `packages/shared/domain/src/entities/Session/Session.model.ts` | `$SharedDomainId` | `entities/Session/Session.model` |
| `packages/shared/domain/src/entities/AuditLog/AuditLog.model.ts` | `$SharedDomainId` | `entities/AuditLog/AuditLog.model` |
| `packages/shared/domain/src/entities/Folder/Folder.model.ts` | `$SharedDomainId` | `entities/Folder/Folder.model` |
| `packages/documents/domain/src/entities/Document/Document.model.ts` | `$DocumentsDomainId` | `entities/Document/Document.model` |
| `packages/documents/domain/src/entities/DocumentFile/DocumentFile.model.ts` | `$DocumentsDomainId` | `entities/DocumentFile/DocumentFile.model` |
| `packages/documents/domain/src/entities/Discussion/Discussion.model.ts` | `$DocumentsDomainId` | `entities/Discussion/Discussion.model` |
| `packages/documents/domain/src/entities/DocumentVersion/DocumentVersion.model.ts` | `$DocumentsDomainId` | `entities/DocumentVersion/DocumentVersion.model` |
| `packages/documents/domain/src/entities/Comment/Comment.model.ts` | `$DocumentsDomainId` | `entities/Comment/Comment.model` |

### Category 2: Effect.Service Classes (40 files)

| File | Package ID | Module Path | Service Name |
|------|------------|-------------|--------------|
| `packages/iam/server/src/adapters/repos/User.repo.ts` | `$IamServerId` | `adapters/repos/User` | `UserRepo` |
| `packages/iam/server/src/adapters/repos/Account.repo.ts` | `$IamServerId` | `adapters/repos/Account` | `AccountRepo` |
| `packages/iam/server/src/adapters/repos/ApiKey.repo.ts` | `$IamServerId` | `adapters/repos/ApiKey` | `ApiKeyRepo` |
| `packages/iam/server/src/adapters/repos/DeviceCode.repo.ts` | `$IamServerId` | `adapters/repos/DeviceCode` | `DeviceCodeRepo` |
| `packages/iam/server/src/adapters/repos/Invitation.repo.ts` | `$IamServerId` | `adapters/repos/Invitation` | `InvitationRepo` |
| `packages/iam/server/src/adapters/repos/Jwks.repo.ts` | `$IamServerId` | `adapters/repos/Jwks` | `JwksRepo` |
| `packages/iam/server/src/adapters/repos/Member.repo.ts` | `$IamServerId` | `adapters/repos/Member` | `MemberRepo` |
| `packages/iam/server/src/adapters/repos/Passkey.repo.ts` | `$IamServerId` | `adapters/repos/Passkey` | `PasskeyRepo` |
| `packages/iam/server/src/adapters/repos/RateLimit.repo.ts` | `$IamServerId` | `adapters/repos/RateLimit` | `RateLimitRepo` |
| `packages/iam/server/src/adapters/repos/Session.repo.ts` | `$IamServerId` | `adapters/repos/Session` | `SessionRepo` |
| `packages/iam/server/src/adapters/repos/Team.repo.ts` | `$IamServerId` | `adapters/repos/Team` | `TeamRepo` |
| `packages/iam/server/src/adapters/repos/TeamMember.repo.ts` | `$IamServerId` | `adapters/repos/TeamMember` | `TeamMemberRepo` |
| `packages/iam/server/src/adapters/repos/TwoFactor.repo.ts` | `$IamServerId` | `adapters/repos/TwoFactor` | `TwoFactorRepo` |
| `packages/iam/server/src/adapters/better-auth/Emails.ts` | `$IamServerId` | `adapters/better-auth/Emails` | `AuthEmailService` |
| `packages/iam/client/src/clients/sign-in/sign-in.service.ts` | `$IamClientId` | `clients/sign-in/sign-in` | `SignInService` |
| `packages/iam/client/src/clients/user/user.service.ts` | `$IamClientId` | `clients/user/user` | `UserService` |
| `packages/iam/client/src/clients/verify/verify.service.ts` | `$IamClientId` | `clients/verify/verify` | `VerifyService` |
| `packages/documents/server/src/adapters/repos/Comment.repo.ts` | `$DocumentsServerId` | `adapters/repos/Comment` | `CommentRepo` |
| `packages/documents/server/src/adapters/repos/Document.repo.ts` | `$DocumentsServerId` | `adapters/repos/Document` | `DocumentRepo` |
| `packages/documents/server/src/files/ExifToolService.ts` | `$DocumentsServerId` | `files/ExifToolService` | `ExifToolService` |
| `packages/documents/server/src/files/PdfMetadataService.ts` | `$DocumentsServerId` | `files/PdfMetadataService` | `PdfMetadataService` |
| `packages/documents/server/src/SignedUrlService.ts` | `$DocumentsServerId` | `SignedUrlService` | `StorageService` (note: class name differs from filename) |
| `packages/shared/server/src/internal/email/adapters/resend/service.ts` | `$SharedServerId` | `internal/email/adapters/resend/service` | `ResendService` |
| `packages/shared/server/src/rpc/v1/event-stream-hub.ts` | `$SharedServerId` | `rpc/v1/event-stream-hub` | `EventStreamHub` |
| `packages/runtime/client/src/services/network-monitor.ts` | `$RuntimeClientId` | `services/network-monitor` | `NetworkMonitor` |
| `packages/runtime/client/src/workers/worker-client.ts` | `$RuntimeClientId` | `workers/worker-client` | `WorkerClient` |
| `packages/ui/ui/src/services/toaster.service.ts` | `$UiId` | `services/toaster` | `ToasterService` |
| `packages/ui/ui/src/services/zip.service.ts` | `$UiId` | `services/zip` | `ZipService` |
| `packages/_internal/db-admin/test/container.ts` | `$DbAdminId` | `test/container` | `PgContainer` |
| `apps/web/src/features/upload/UploadFileService.ts` | `$WebId` | `features/upload/UploadFileService` | `UploadFileService` |

### Category 3: Context Tags (9 files)

| File | Package ID | Module Path | Tags |
|------|------------|-------------|------|
| `packages/_internal/db-admin/src/Db/AdminDb.ts` | `$DbAdminId` | `Db/AdminDb` | `AdminDb` |
| `packages/common/utils/src/md5/parallel-hasher.ts` | `$UtilsId` | `md5/parallel-hasher` | `ParallelHasher` |
| `packages/documents/server/src/config.ts` | `$DocumentsServerId` | `config` | `FilesConfig` |
| `packages/documents/server/src/db/Db/Db.ts` | `$DocumentsServerId` | `db/Db/Db` | `DocumentsDb` |
| `packages/iam/server/src/db/Db/Db.ts` | `$IamServerId` | `db/Db/Db` | `IamDb` |
| `packages/shared/domain/src/Policy.ts` | `$SharedDomainId` | `Policy` | `AuthContext`, `CurrentUser` |
| `packages/shared/domain/src/services/EncryptionService/EncryptionService.ts` | `$SharedDomainId` | `services/EncryptionService/EncryptionService` | `EncryptionService` |
| `packages/shared/server/src/internal/db/pg/PgClient.ts` | `$SharedServerId` | `internal/db/pg/PgClient` | `TransactionContext` |

### Category 4: TaggedError Classes (15 files)

| File | Package ID | Module Path | Errors |
|------|------------|-------------|--------|
| `packages/common/errors/src/errors.ts` | `$ErrorsId` | `errors` | `UnrecoverableError`, `NotFoundError`, `UniqueViolationError`, `DatabaseError`, `TransactionError`, `ConnectionError`, `ParseError`, `Unauthorized`, `Forbidden`, `UnknownError` |
| `packages/common/identity/src/schema.ts` | `$IdentityId` | `schema` | `InvalidSegmentError`, `InvalidModuleSegmentError`, `InvalidBaseError` |
| `packages/common/schema/src/integrations/files/SignedFile.ts` | `$SchemaId` | `integrations/files/SignedFile` | `FileIntegrityError` |
| `packages/common/schema/src/integrations/files/pdf-metadata/errors.ts` | `$SchemaId` | `integrations/files/pdf-metadata/errors` | `PdfParseError`, `PdfTimeoutError`, `PdfFileTooLargeError`, `PdfEncryptedError`, `PdfInvalidError` |
| `packages/common/schema/src/integrations/files/exif-metadata/errors.ts` | `$SchemaId` | `integrations/files/exif-metadata/errors` | `MetadataParseError`, `ExifTimeoutError`, `ExifFileTooLargeError` |
| `packages/common/utils/src/md5/errors.ts` | `$UtilsId` | `md5/errors` | `Md5ComputationError`, `UnicodeEncodingError`, `FileReadError`, `BlobSliceError`, `WorkerHashError` |
| `packages/common/contract/src/internal/contract-error/contract-error.ts` | `$ContractId` | `internal/contract-error/contract-error` | `HttpRequestError`, `HttpResponseError`, `MalformedInput`, `MalformedOutput`, `UnknownError` |
| `packages/common/lexical-schemas/src/errors.ts` | `$LexicalSchemasId` | `errors` | `LexicalSchemaValidationError`, `UnknownNodeTypeError` |
| `packages/iam/client/src/errors.ts` | `$IamClientId` | `errors` | `IamError` |
| `packages/iam/domain/src/api/common/errors.ts` | `$IamDomainId` | `api/common/errors` | `IamAuthError` |
| `packages/documents/domain/src/entities/Document/Document.errors.ts` | `$DocumentsDomainId` | `entities/Document/Document.errors` | `DocumentNotFoundError`, `DocumentPermissionDeniedError`, `DocumentArchivedError`, `DocumentLockedError`, `DocumentAlreadyPublishedError`, `DocumentNotPublishedError` |
| `packages/documents/domain/src/entities/Discussion/Discussion.errors.ts` | `$DocumentsDomainId` | `entities/Discussion/Discussion.errors` | `DiscussionNotFoundError`, `DiscussionPermissionDeniedError`, `DiscussionAlreadyResolvedError`, `DiscussionNotResolvedError` |
| `packages/documents/domain/src/entities/Comment/Comment.errors.ts` | `$DocumentsDomainId` | `entities/Comment/Comment.errors` | `CommentNotFoundError`, `CommentPermissionDeniedError`, `CommentTooLongError` |
| `packages/runtime/client/src/workers/worker-rpc.ts` | `$RuntimeClientId` | `workers/worker-rpc` | `FilterError` |
| `packages/shared/client/src/atom/files/errors.ts` | `$SharedClientId` | `atom/files/errors` | `ImageTooLargeAfterCompression` |

**Note:** The following files already use the `$I` pattern and should be SKIPPED:
- `packages/shared/client/src/atom/services/Upload/Upload.errors.ts` (already migrated)
- `packages/shared/server/src/internal/email/adapters/resend/errors.ts` (already migrated)
- `packages/shared/server/src/internal/db/pg/errors.ts` (already migrated)

### Category 5: Schema Classes with Hardcoded Annotations (13+ files)

| File | Package ID | Module Path | Schemas |
|------|------------|-------------|---------|
| `packages/ui/core/src/adapters/schema.ts` | `$UiCoreId` | `adapters/schema` | `DateInputToDateTime` |
| `packages/shared/domain/src/entity-ids/any-entity-id.ts` | `$SharedDomainId` | `entity-ids/any-entity-id` | `AnyEntityId` |
| `packages/shared/domain/src/entity-ids/SharedTableNames/SharedTableNames.ts` | `$SharedDomainId` | `entity-ids/SharedTableNames/SharedTableNames` | `SharedTableName` |
| `packages/shared/domain/src/entity-ids/DocumentsTableNames.ts` | `$SharedDomainId` | `entity-ids/DocumentsTableNames` | `DocumentsTableName` |
| `packages/shared/domain/src/entity-ids/entity-kind.ts` | `$SharedDomainId` | `entity-ids/entity-kind` | `EntityKind` |
| `packages/shared/domain/src/Policy.ts` | `$SharedDomainId` | `Policy` | `PolicyRecord`, `Permission`, `Action`, `PolicyRule`, `PolicySet`, `AuthorizationDecision`, etc. |
| `packages/iam/client/src/clients/verify/verify.contracts.ts` | `$IamClientId` | `clients/verify/verify.contracts` | `VerifyPhonePayload`, `SendEmailVerificationPayload`, etc. |
| `packages/iam/client/src/clients/recover/recover.contracts.ts` | `$IamClientId` | `clients/recover/recover.contracts` | `ResetPasswordPayload`, `RequestResetPasswordPayload` |
| `packages/iam/client/src/clients/session/session.contracts.ts` | `$IamClientId` | `clients/session/session.contracts` | `GetSessionSuccess`, `ListSessionsSuccess` |
| `packages/iam/client/src/clients/sign-in/sign-in.contracts.ts` | `$IamClientId` | `clients/sign-in/sign-in.contracts` | `SignInEmailPayload`, `SignInSocialPayload`, etc. |
| `packages/shared/domain/src/entities/Organization/schemas/OrganizationType.schema.ts` | `$SharedDomainId` | `entities/Organization/schemas/OrganizationType.schema` | `OrganizationType` |
| `packages/common/constants/src/AuthProviders.ts` | `$ConstantsId` | `AuthProviders` | `AuthProviderNameValue` |
| `packages/common/schema/src/integrations/files/AspectRatio.ts` | `$SchemaId` | `integrations/files/AspectRatio` | `AspectRatioDimensions`, `AspectRatioStringSchema` |
| `packages/common/schema/src/integrations/files/FileAttributes.ts` | `$SchemaId` | `integrations/files/FileAttributes` | `FileAttributes` |
| `packages/common/schema/src/integrations/files/file-types/FileSignature.ts` | `$SchemaId` | `integrations/files/file-types/FileSignature` | `FileSignature` |
| `packages/shared/domain/src/services/EncryptionService/schemas.ts` | `$SharedDomainId` | `services/EncryptionService/schemas` | `HmacSignature` |
| `apps/web/src/features/upload/UploadModels.ts` | `$WebId` | `features/upload/UploadModels` | `PresignedUrlItem`, `TraceHeadersSchema`, etc. |

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
