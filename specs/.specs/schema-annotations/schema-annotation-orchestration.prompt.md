---
name: schema-annotation-orchestration
version: 2
created: 2026-01-06T00:00:00Z
iterations: 1
---

# Schema Annotation Orchestration - Refined Prompt

## Context

The beep-effect monorepo requires consistent Effect Schema annotations for documentation, type generation, and API contracts. An audit has identified **62 Effect Schemas missing annotations** across **17 packages**.

**Codebase Structure**:
- Monorepo managed by Bun with Turbo
- Effect-first architecture with `@effect/platform`, `@effect/sql`, `@effect/rpc`
- Identity system at `@beep/identity` provides `$I` composers for each package
- Schemas live in domain packages (`*-domain`), with table schemas in `*-tables`

**Current State**:
- Master audit report: `specs/.specs/schema-annotations/MASTER_REPORT.md`
- 62 schemas across 7 batches need annotation
- Most packages already have properly annotated sibling schemas to reference

**Identity Composer System**:
Each `@beep/*` package has a dedicated identity composer:
```typescript
import { $SchemaId } from "@beep/identity/packages";  // For @beep/schema
import { $IamDomainId } from "@beep/identity/packages";  // For @beep/iam-domain
// ... etc

const $I = $PackageId.create("path/from/src");
```

---

## Objective

Systematically add Effect Schema annotations to all 62 identified schemas using the `$I` Identity Composer pattern, ensuring:

1. **All schemas have proper annotations** with `identifier`, `title`, and `description`
2. **Annotations follow package-specific patterns** matching existing annotated schemas in the same file/package
3. **Type checking passes** after each batch (`bun run check`)
4. **No breaking changes** to existing functionality

**Success Criteria**:
- [ ] All 62 schemas have `.annotations()` with `$I.annotations(...)` or equivalent
- [ ] `bun run check` passes with zero type errors
- [ ] `bun run build` succeeds
- [ ] `bun run test` passes (no regressions)

---

## Role

You are an **Effect TypeScript specialist** with expertise in:
- Effect Schema annotation APIs and their type signatures
- The beep-effect monorepo's identity composer system
- Batch processing of code modifications with verification gates
- TypeScript type safety and schema validation patterns

You will methodically process schemas batch by batch, reading existing patterns before making changes, and verifying type safety after each batch.

---

## Constraints

### Required Patterns

**Identity Import Convention**:
```typescript
import { $PackageId } from "@beep/identity/packages";
const $I = $PackageId.create("path/from/src/without/extension");
```

**Package-to-Composer Mapping**:
| Package | Import |
|---------|--------|
| @beep/schema | `$SchemaId` |
| @beep/constants | `$ConstantsId` |
| @beep/contract | `$ContractId` |
| @beep/errors | `$ErrorsId` |
| @beep/invariant | `$InvariantId` |
| @beep/utils | `$UtilsId` |
| @beep/yjs | `$YjsId` |
| @beep/iam-domain | `$IamDomainId` |
| @beep/iam-client | `$IamClientId` |
| @beep/documents-domain | `$DocumentsDomainId` |
| @beep/documents-server | `$DocumentsServerId` |
| @beep/runtime-client | `$RuntimeClientId` |
| @beep/shared-client | `$SharedClientId` |
| @beep/shared-domain | `$SharedDomainId` |
| @beep/shared-server | `$SharedServerId` |
| @beep/shared-tables | `$SharedTablesId` |
| @beep/shared-env | `$SharedServerId` (note: uses shared server identity, no dedicated `$SharedEnvId`) |
| @beep/ui-core | `$UiCoreId` |
| @beep/ui | `$UiId` |

### Annotation Patterns by Schema Type

**1. S.Class / S.TaggedClass** (uses `.annotations()` method chaining):
```typescript
export class MySchema extends S.Class<MySchema>("MySchema")(
  { field: S.String }
).annotations(
  $I.annotations("MySchema", { description: "..." })
) {}
```

**2. S.Struct (named export)**:
```typescript
export const MyStruct = S.Struct({
  field: S.String
}).annotations(
  $I.annotations("MyStruct", { description: "..." })
);
```

**3. S.TaggedError (with HTTP status)**:
```typescript
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String
}, HttpApiSchema.annotations({
  status: 500,
  ...$I.annotations("MyError", { description: "..." })
})) {}
```

**4. S.TaggedError (without HTTP)**:
```typescript
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String
}, $I.annotations("MyError", { description: "..." })) {}
```

**5. BS.StringLiteralKit / MappedLiteralKit**:
```typescript
export class MyEnum extends BS.StringLiteralKit(
  "a", "b", "c"
).annotations(
  $I.annotations("MyEnum", { description: "..." })
) {}
```

**6. S.Array / S.NonEmptyArray / S.Union**:
```typescript
export const MyArray = S.Array(ItemSchema).annotations(
  $I.annotations("MyArray", { description: "..." })
);
```

**7. S.Literal** (union of literal values):
```typescript
export const MyLiteral = S.Literal("value1", "value2").annotations(
  $I.annotations("MyLiteral", { description: "..." })
);
```

**8. S.HashMap** (key-value collection):
```typescript
export const MyHashMap = S.HashMap({ key: S.String, value: S.Number }).annotations(
  $I.annotations("MyHashMap", { description: "..." })
);
```

**9. S.TaggedRequest** (for RPC request schemas):
```typescript
export class MyRequest extends S.TaggedRequest<MyRequest>()("MyRequest", {
  failure: FailureSchema,
  success: SuccessSchema,
  payload: { field: S.String }
}, $I.annotations("MyRequest", { description: "..." })) {}
```

**10. S.brand (branded types)**:
```typescript
export const NodeId = S.String.pipe(
  S.brand("NodeId"),
  S.annotations($I.annotations("NodeId", { description: "..." }))
);
```

**11. S.declare**:
```typescript
export const MyDeclare = S.declare(
  isMyType,
  {
    identifier: "MyDeclare",
    ...$I.annotations("MyDeclare", { description: "..." })
  }
);
```

**12. S.transformLiterals / S.transformOrFail**:
```typescript
export class MyTransform extends S.transformLiterals(
  ["a", 1], ["b", 2]
).annotations(
  $I.annotations("MyTransform", { description: "..." })
) {}
```

**13. BS.destructiveTransform** (from @beep/schema):
```typescript
const MyTransform = BS.destructiveTransform((i: string) =>
  S.decodeUnknownSync(TargetSchema)(parseInput(i))
)(S.String).annotations(
  $I.annotations("MyTransform", { description: "..." })
);
```

**14. RpcGroup.make**:
```typescript
export class MyRpc extends RpcGroup.make("MyRpc")(
  { method: Rpc.Rpc(...) },
  $I.annotations("MyRpc", { description: "..." })
) {}
```

### Forbidden Patterns

- **NO** `async/await` or bare Promises
- **NO** native array methods (`.map()`, `.filter()`)
- **NO** native string methods (`.split()`, `.trim()`)
- **NO** native `Date` object
- **NO** `any`, `@ts-ignore`, unchecked casts
- **NO** switch statements (use `Match.exhaustive`)

### Special Cases

**Data.TaggedError (from effect/Data)**:
- These are runtime-only errors, NOT Effect Schemas
- Cannot use `.annotations()` - use JSDoc comments instead
- Consider converting to `S.TaggedError` if serialization needed
- Document with JSDoc including `@identifier` and `@description` tags:
```typescript
/**
 * Error thrown when file is not found.
 * @identifier FileNotFoundError
 * @description Runtime error indicating the requested file does not exist
 */
export class FileNotFoundError extends Data.TaggedError("FileNotFoundError")<{
  readonly path: string;
}> {}
```

**Context.Reference**:
- Does not support `.annotations()` directly
- Document with JSDoc comments

**M.Class (SQL Models)**:
- Uses different syntax: second parameter is annotation object, NOT `$I.annotations()`
```typescript
export class Model extends M.Class<Model>($I`ModelName`)(
  makeFields(EntityId, { ... }),
  { title: "...", description: "...", schemaId: Symbol.for("...") }
) {}
```

---

## Resources

### Files to Read First (per batch)

**Before editing any file**, read it to understand existing patterns:
```
Read packages/<package>/src/<path>.ts
```

### Reference Examples

| Pattern | Reference File |
|---------|----------------|
| StringLiteralKit | `packages/common/schema/src/primitives/characters.ts` |
| S.TaggedError | `packages/common/errors/src/errors.ts` |
| M.Class | `packages/documents/domain/src/entities/Comment/Comment.model.ts` |
| S.Class | `packages/common/contract/src/internal/contract-error/contract-error.ts` |
| Identity System | `packages/common/identity/src/packages.ts` |

### Verification Commands

After each batch:
```bash
bun run check  # Type check
```

After all batches:
```bash
bun run build  # Full build
bun run test   # Test suite
```

---

## Operational Guidance

### Pre-flight Validation

Before starting any batch:
1. Ensure working directory is clean: `git status`
2. Run baseline type check: `bun run check` (should pass)
3. Review the master report: `specs/.specs/schema-annotations/MASTER_REPORT.md`

### Handling Duplicate `$I` Variables

Some files may already have a `$I` variable defined. In these cases:
- **If path matches**: Reuse the existing `$I` without adding a new declaration
- **If path differs**: Add a descriptive suffix, e.g., `$I2` or `$ILocal`, and add a comment explaining why
- **Best practice**: Consolidate identity declarations at the top of the file when possible

### Rollback/Recovery Instructions

If a batch fails type checking:
1. **Identify failing files**: Review type errors from `bun run check`
2. **Revert specific files**: `git checkout -- <file-path>` for each failing file
3. **Investigate**: Read the file again to understand the correct pattern
4. **Retry**: Apply the correct pattern and re-run type check
5. **If blocked**: Document the issue in the batch report and continue to next schema

If multiple batches have been applied before failure:
```bash
# See what changed
git diff --name-only

# Revert all changes if needed
git checkout -- packages/

# Or selectively revert a package
git checkout -- packages/<package-name>/
```

---

## Output Specification

### Process Each Batch Sequentially

For each batch (1-7):

1. **Announce batch**: "Processing Batch N: @beep/package-name (X schemas)"
2. **Pre-check**: Verify `$I` doesn't already exist with conflicting path
3. **Read files**: Read each file that needs modification
4. **Apply annotations**: Add `$I` import if missing, add `.annotations()` calls
5. **Verify**: Run `bun run check`
6. **Report**: List completed schemas with checkmarks

### Annotation Description Guidelines

Write concise, meaningful descriptions:
- **Good**: "Error thrown when auto-increment column has incompatible type"
- **Bad**: "An error"

- **Good**: "Array of JSON-compatible values for serialization"
- **Bad**: "JSON array"

- **Good**: "Branded string identifier for directed graph nodes"
- **Bad**: "Node ID"

### Final Output Format

```markdown
## Batch N Complete: @beep/package-name

- [x] `src/path/file.ts:42` - `SchemaName` - Added annotations
- [x] `src/path/file.ts:78` - `AnotherSchema` - Added annotations

Type check: PASSED
```

---

## Examples

### Example 1: Adding annotations to S.TaggedError

**Before**:
```typescript
export class AutoIncrementTypeError extends S.TaggedError<AutoIncrementTypeError>()(
  "AutoIncrementTypeError",
  { message: S.String, code: S.String }
) {}
```

**After**:
```typescript
import { $SchemaId } from "@beep/identity/packages";
const $I = $SchemaId.create("integrations/sql/dsl/errors");

export class AutoIncrementTypeError extends S.TaggedError<AutoIncrementTypeError>()(
  "AutoIncrementTypeError",
  { message: S.String, code: S.String },
  $I.annotations("AutoIncrementTypeError", {
    description: "Error thrown when auto-increment column has incompatible data type"
  })
) {}
```

### Example 2: Adding annotations to BS.StringLiteralKit

**Before**:
```typescript
export class DeviceCodeStatus extends BS.StringLiteralKit(
  "pending", "approved", "denied"
) {}
```

**After**:
```typescript
import { $IamDomainId } from "@beep/identity/packages";
const $I = $IamDomainId.create("entities/DeviceCode/schemas/DeviceCodeStatus");

export class DeviceCodeStatus extends BS.StringLiteralKit(
  "pending", "approved", "denied"
).annotations(
  $I.annotations("DeviceCodeStatus", {
    description: "Status of device authorization code flow (pending approval, approved, or denied)"
  })
) {}
```

### Example 3: Adding annotations to S.brand

**Before**:
```typescript
export const NodeId = S.String.pipe(S.brand("NodeId"));
```

**After**:
```typescript
import { $UtilsId } from "@beep/identity/packages";
const $I = $UtilsId.create("topo-sort/topo-sort");

export const NodeId = S.String.pipe(
  S.brand("NodeId"),
  S.annotations($I.annotations("NodeId", {
    description: "Branded string identifier for directed acyclic graph nodes"
  }))
);
```

---

## Verification Checklist

- [ ] All 62 schemas have annotations with `identifier`, `title`, `description`
- [ ] Each annotation uses the correct package identity composer
- [ ] `$I` variable follows `$PackageId.create("path/from/src")` pattern
- [ ] S.TaggedError annotations are in third parameter position
- [ ] S.Class/S.Struct annotations use `.annotations()` method
- [ ] Data.TaggedError schemas documented with JSDoc (not converted)
- [ ] `bun run check` passes after each batch
- [ ] `bun run build` succeeds after all batches
- [ ] `bun run test` passes with no regressions
- [ ] MASTER_REPORT.md updated to reflect completion

---

## Metadata

### Research Sources
- **Files Explored**:
  - `packages/common/schema/src/primitives/characters.ts`
  - `packages/documents/domain/src/entities/Comment/Comment.model.ts`
  - `packages/common/schema/src/integrations/sql/dsl/errors.ts`
  - `packages/common/identity/src/packages.ts`
  - `packages/common/errors/src/errors.ts`
  - `packages/common/contract/src/internal/contract-error/contract-error.ts`

- **Documentation Consulted**:
  - Effect Schema annotation API (via MCP tools)
  - Effect Schema S.TaggedError signature
  - Effect Schema S.declare annotation pattern

- **AGENTS.md Files**:
  - `packages/common/schema/AGENTS.md`
  - `packages/shared/domain/AGENTS.md`
  - `packages/documents/domain/AGENTS.md`
  - `packages/iam/domain/AGENTS.md`
  - `packages/iam/client/AGENTS.md`

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 10 issues (2 HIGH, 5 MEDIUM, 3 LOW) | Fixed S.Class pattern to use method chaining; clarified @beep/shared-env uses $SharedServerId; added S.TaggedRequest, S.HashMap, S.Literal, BS.destructiveTransform patterns; added JSDoc example for Data.TaggedError; clarified "Transformed Schema" as BS.destructiveTransform; added duplicate $I handling notes; added pre-flight validation; added rollback/recovery instructions |

---

## Batch Definitions (for reference)

### Batch 1: @beep/schema (14 schemas)
`packages/common/schema/src/integrations/files/utils/formatSize.ts`:
- Line 39: `InvalidFileSizeInput` (S.TaggedError)
- Line 119: `FormattedNumberStruct` (S.Struct)

`packages/common/schema/src/primitives/number/formatted-number.ts`:
- Line 8: `BigIntToSiSymbol` (MappedLiteralKit)

`packages/common/schema/src/integrations/sql/dsl/errors.ts`:
- Line 78: `AutoIncrementTypeError` (S.TaggedError)
- Line 93: `IdentifierTooLongError` (S.TaggedError)
- Line 110: `InvalidIdentifierCharsError` (S.TaggedError)
- Line 128: `NullablePrimaryKeyError` (S.TaggedError)
- Line 149: `MissingVariantSchemaError` (S.TaggedError)
- Line 166: `UnsupportedColumnTypeError` (S.TaggedError)
- Line 190: `EmptyModelIdentifierError` (S.TaggedError)
- Line 204: `MultipleAutoIncrementError` (S.TaggedError)
- Line 225: `ModelValidationAggregateError` (S.TaggedError)

`packages/common/schema/src/primitives/json/json.ts`:
- Line 173: `JsonArray` (S.Array)
- Line 225: `NonEmptyJsonArray` (S.NonEmptyArray)

### Batch 2: @beep/shared-domain (10 schemas)
`packages/shared/domain/src/rpc/v1/health.ts`:
- Line 8: `Success` (S.Class)

`packages/shared/domain/src/rpc/v1/files/move-files.ts`:
- Line 8: `Payload` (S.Class)

`packages/shared/domain/src/rpc/v1/files/delete-folders.ts`:
- Line 8: `Payload` (S.Class)

`packages/shared/domain/src/rpc/v1/files/get-files-by-keys.ts`:
- Line 8: `Payload` (S.Class)

`packages/shared/domain/src/entities/Folder/schemas/WithUploadedFiles.ts`:
- Line 8: `WithUploadedFiles` (S.Class)

`packages/shared/domain/src/entities/Organization/schemas/SubscriptionTier.schema.ts`:
- Line 4: `SubscriptionTier` (BS.StringLiteralKit)

`packages/shared/domain/src/entities/Organization/schemas/SubscriptionStatus.schema.ts`:
- Line 4: `SubscriptionStatus` (BS.StringLiteralKit)

`packages/shared/domain/src/services/EncryptionService/schemas.ts`:
- Line 27: `EncryptionAlgorithm` (S.Literal)
- Line 36: `EncryptedPayloadBinary` (S.Struct)
- Line 52: `EncryptedPayload` (S.Struct)

### Batch 3: @beep/utils (8 schemas)
`packages/common/utils/src/md5/worker.ts`:
- Line 31: `HashRequest` (S.TaggedRequest)
- Line 53: `WorkerRequestSchema` (S.Union)

`packages/common/utils/src/topo-sort/topo-sort.ts`:
- Line 12: `NodeId` (S.brand)
- Line 15: `DirectedAcyclicGraph` (S.HashMap)
- Line 24: `TaskList` (S.Array)

`packages/common/utils/src/topo-sort/topo-sort.graph.ts`:
- Line 13: `NodeId` (S.brand) - Note: Duplicate, consider consolidation
- Line 16: `DirectedAcyclicGraph` (S.HashMap)
- Line 25: `TaskList` (S.Array)

### Batch 4: @beep/documents-server (6 schemas)
`packages/documents/server/src/db/repos/Discussion.repo.ts`:
- Line 19: `DiscussionWithCommentsSchema` (S.Struct)

`packages/documents/server/src/db/repos/Document.repo.ts`:
- Line 16: `SearchResultSchema` (S.Struct)
- Line 24: `SearchRequest` (S.Struct)

`packages/documents/server/src/db/repos/DocumentVersion.repo.ts`:
- Line 17: `VersionNotFoundError` (Data.TaggedError - JSDoc only)
- Line 24: `VersionWithAuthorSchema` (S.Struct)

`packages/documents/server/src/db/repos/DocumentFile.repo.ts`:
- Line 17: `FileNotFoundError` (Data.TaggedError - JSDoc only)

### Batch 5: @beep/iam-client (4 schemas)
`packages/iam/client/src/adapters/better-auth/errors.ts`:
- Line 3: `BetterAuthError` (Data.TaggedError - JSDoc only)

`packages/iam/client/src/clients/user/user.contracts.ts`:
- Line 57: `ChangeEmailPayload` (S.Class)
- Line 72: `ChangePasswordPayload` (S.Class)

`packages/iam/client/src/clients/verify/verify.contracts.ts`:
- Line 116: `VerifyEmailUser` (S.Struct)

### Batch 6: @beep/shared-server (4 schemas)
`packages/shared/server/src/internal/email/adapters/resend/errors.ts`:
- Line 9: `ResendErrorCode` (BS.StringLiteralKit)
- Line 40: `ResendError` (S.TaggedError)
- Line 61: `EmailTemplateRenderError` (S.TaggedError)

`packages/shared/server/src/db/repos/UploadSession.repo.ts`:
- Line 61: `UploadSessionRepoError` (S.TaggedError)

### Batch 7: Remaining packages (16 schemas)
`packages/common/constants/src/AuthProviders.ts`:
- Line 82: `TaggedAuthProviderNameValue` (Union)

`packages/common/contract/src/internal/contract-kit/contract-kit.ts`:
- Line 191: `LiftServiceMode` (BS.StringLiteralKit)

`packages/common/contract/src/internal/contract/annotations.ts`:
- Line 77: `SupportsAbort` (Context.Reference - JSDoc only)

`packages/common/errors/src/errors.ts`:
- Line 27: `Es5Error` (Data.Error - JSDoc only)

`packages/common/invariant/src/meta.ts`:
- Line 39: `CallMetadata` (S.Struct)

`packages/common/yjs/src/protocol/Ai.ts`:
- Line 30: `ContextualPromptResponseOther` (S.Class)

`packages/common/yjs/src/protocol/Groups.ts`:
- Line 17: `GroupScopes` (S.Struct)

`packages/iam/domain/src/entities/DeviceCode/schemas/DeviceCodeStatus.ts`:
- Line 4: `DeviceCodeStatus` (StringLiteralKit)

`packages/documents/domain/src/entities/Discussion/Discussion.rpc.ts`:
- Line 16: `DiscussionWithComments` (S.Struct)

`packages/documents/domain/src/entities/Document/Document.rpc.ts`:
- Line 11: `SearchResult` (S.Struct)

`packages/runtime/client/src/workers/image-compression-rpc.ts`:
- Line 5: `ImageCompressionRpc` (RpcGroup.make)

`packages/runtime/client/src/workers/worker-rpc.ts`:
- Line 12: `WorkerRpc` (RpcGroup.make)

`packages/runtime/client/src/services/unsafe-http-api-client.ts`:
- Line 46: `HttpBodyFromSelf` (S.declare)

`packages/shared/client/src/atom/files/types.ts`:
- Line 78: `StartUploadFolder` (S.TaggedClass)

`packages/shared/env/src/ClientEnv.ts`:
- Line 15: `AuthProviderNames` (BS.destructiveTransform - transforms comma-separated string to array)
- Line 19: `ClientEnvSchema` (S.Struct)

`packages/shared/tables/src/columns/custom-datetime.ts`:
- Line 17: `DateTimeToIsoString` (S.transformOrFail)

`packages/ui/core/src/i18n/constants.ts`:
- Line 14: `LangValueToAdapterLocale` (S.transformLiterals)

`packages/ui/core/src/i18n/SupportedLangValue.ts`:
- Line 3: `SupportedLangValue` (StringLiteralKit)

`packages/ui/ui/src/components/editor/use-chat.ts`:
- Line 71: `ToolName` (S.Class)
