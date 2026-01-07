# Schema Annotation Orchestration Prompt

This prompt orchestrates the annotation of 62 identified Effect Schemas across the beep-effect monorepo using the `$I` Identity Composer pattern.

## Context

An audit has identified 62 Effect Schemas missing annotations across 17 packages. This prompt guides systematic annotation using the `@beep/identity` system.

## Reference Files

- **Master Report**: `specs/.specs/schema-annotations/MASTER_REPORT.md`
- **Identity System**: `packages/common/identity/src/packages.ts`
- **Pattern Examples**: `packages/common/schema/src/primitives/characters.ts`

## Identity Composer Pattern

Each package has a dedicated identity composer exported from `@beep/identity/packages`:

```typescript
// Import the package-specific identity composer
import { $SchemaId } from "@beep/identity/packages";
// Or for other packages:
// $IamDomainId, $SharedDomainId, $DocumentsDomainId, $UtilsId, etc.

// Create a module-scoped identity composer
const $I = $PackageId.create("path/to/module");
```

## Annotation Patterns by Schema Type

### 1. S.Class / S.TaggedClass

```typescript
const $I = $PackageId.create("path/to/file");

export class MySchema extends S.Class<MySchema>("MySchema")(
  { field: S.String }
).annotations(
  $I.annotations("MySchema", {
    description: "Description of what this schema represents"
  })
) {}
```

### 2. S.Struct (Named Export)

```typescript
const $I = $PackageId.create("path/to/file");

export const MyStruct = S.Struct({
  field: S.String
}).annotations(
  $I.annotations("MyStruct", {
    description: "Description of the struct"
  })
);
```

### 3. S.TaggedError

```typescript
const $I = $PackageId.create("path/to/file");

export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String
}, $I.annotations("MyError", {
  description: "Error thrown when..."
})) {}
```

### 4. BS.StringLiteralKit / MappedLiteralKit

```typescript
const $I = $PackageId.create("path/to/file");

export class MyEnum extends BS.StringLiteralKit(
  "option1",
  "option2",
  "option3"
).annotations(
  $I.annotations("MyEnum", {
    description: "Enumeration of..."
  })
) {}
```

### 5. M.Class (SQL Models)

```typescript
const $I = $PackageId.create("entities/Model/Model.model");

export class Model extends M.Class<Model>($I`ModelName`)(
  makeFields(EntityId, { /* fields */ }),
  $I.annotations("ModelName", {
    description: "Description of the model"
  })
) {}
```

### 6. S.Union / S.Array / S.NonEmptyArray

```typescript
const $I = $PackageId.create("path/to/file");

export const MyUnion = S.Union(SchemaA, SchemaB).annotations(
  $I.annotations("MyUnion", {
    description: "Union of A or B"
  })
);

export const MyArray = S.Array(ItemSchema).annotations(
  $I.annotations("MyArray", {
    description: "Array of items"
  })
);
```

### 7. S.brand / Branded Types

```typescript
const $I = $PackageId.create("path/to/file");

export const NodeId = S.String.pipe(
  S.brand("NodeId")
).annotations(
  $I.annotations("NodeId", {
    description: "Unique identifier for a node"
  })
);
```

### 8. RpcGroup.make

```typescript
const $I = $PackageId.create("workers/rpc-name");

export class MyRpc extends RpcGroup.make("MyRpc")(
  { /* methods */ }
).annotations(
  $I.annotations("MyRpc", {
    description: "RPC group for..."
  })
) {}
```

### 9. S.declare

```typescript
const $I = $PackageId.create("path/to/file");

export const MyDeclare = S.declare(
  isMyType,
  { /* options */ }
).annotations(
  $I.annotations("MyDeclare", {
    description: "Declaration for..."
  })
);
```

### 10. S.transformLiterals / S.transformOrFail

```typescript
const $I = $PackageId.create("path/to/file");

export class MyTransform extends S.transformLiterals(
  ["a", 1],
  ["b", 2]
).annotations(
  $I.annotations("MyTransform", {
    description: "Transforms literals..."
  })
) {}
```

## Package Identity Composer Mapping

| Package | Identity Composer |
|---------|-------------------|
| @beep/constants | $ConstantsId |
| @beep/contract | $ContractId |
| @beep/errors | $ErrorsId |
| @beep/invariant | $InvariantId |
| @beep/schema | $SchemaId |
| @beep/utils | $UtilsId |
| @beep/yjs | $YjsId |
| @beep/iam-domain | $IamDomainId |
| @beep/iam-client | $IamClientId |
| @beep/documents-domain | $DocumentsDomainId |
| @beep/documents-server | $DocumentsServerId |
| @beep/runtime-client | $RuntimeClientId |
| @beep/shared-client | $SharedClientId |
| @beep/shared-domain | $SharedDomainId |
| @beep/shared-env | $SharedServerId |
| @beep/shared-server | $SharedServerId |
| @beep/shared-tables | $SharedTablesId |
| @beep/ui-core | $UiCoreId |
| @beep/ui | $UiId |

## Schemas to Annotate (62 Total)

### Batch 1: @beep/schema (14 schemas)
- `src/integrations/files/utils/formatSize.ts:39` - `InvalidFileSizeInput` - S.TaggedError
- `src/integrations/files/utils/formatSize.ts:119` - `FormattedNumberStruct` - S.Struct
- `src/primitives/number/formatted-number.ts:8` - `BigIntToSiSymbol` - MappedLiteralKit
- `src/integrations/sql/dsl/errors.ts:78` - `AutoIncrementTypeError` - S.TaggedError
- `src/integrations/sql/dsl/errors.ts:93` - `IdentifierTooLongError` - S.TaggedError
- `src/integrations/sql/dsl/errors.ts:110` - `InvalidIdentifierCharsError` - S.TaggedError
- `src/integrations/sql/dsl/errors.ts:128` - `NullablePrimaryKeyError` - S.TaggedError
- `src/integrations/sql/dsl/errors.ts:149` - `MissingVariantSchemaError` - S.TaggedError
- `src/integrations/sql/dsl/errors.ts:166` - `UnsupportedColumnTypeError` - S.TaggedError
- `src/integrations/sql/dsl/errors.ts:190` - `EmptyModelIdentifierError` - S.TaggedError
- `src/integrations/sql/dsl/errors.ts:204` - `MultipleAutoIncrementError` - S.TaggedError
- `src/integrations/sql/dsl/errors.ts:225` - `ModelValidationAggregateError` - S.TaggedError
- `src/primitives/json/json.ts:173` - `JsonArray` - S.Array
- `src/primitives/json/json.ts:225` - `NonEmptyJsonArray` - S.NonEmptyArray

### Batch 2: @beep/shared-domain (10 schemas)
- `src/rpc/v1/health.ts:8` - `Success` - S.Class
- `src/rpc/v1/files/move-files.ts:8` - `Payload` - S.Class
- `src/rpc/v1/files/delete-folders.ts:8` - `Payload` - S.Class
- `src/rpc/v1/files/get-files-by-keys.ts:8` - `Payload` - S.Class
- `src/entities/Folder/schemas/WithUploadedFiles.ts:8` - `WithUploadedFiles` - S.Class
- `src/entities/Organization/schemas/SubscriptionTier.schema.ts:4` - `SubscriptionTier` - BS.StringLiteralKit
- `src/entities/Organization/schemas/SubscriptionStatus.schema.ts:4` - `SubscriptionStatus` - BS.StringLiteralKit
- `src/services/EncryptionService/schemas.ts:27` - `EncryptionAlgorithm` - S.Literal
- `src/services/EncryptionService/schemas.ts:36` - `EncryptedPayloadBinary` - S.Struct
- `src/services/EncryptionService/schemas.ts:52` - `EncryptedPayload` - S.Struct

### Batch 3: @beep/utils (9 schemas)
- `src/md5/worker.ts:31` - `HashRequest` - S.TaggedRequest
- `src/md5/worker.ts:53` - `WorkerRequestSchema` - S.Union
- `src/topo-sort/topo-sort.ts:12` - `NodeId` - S.brand
- `src/topo-sort/topo-sort.ts:15` - `DirectedAcyclicGraph` - S.HashMap
- `src/topo-sort/topo-sort.ts:24` - `TaskList` - S.Array
- `src/topo-sort/topo-sort.graph.ts:13` - `NodeId` - S.brand
- `src/topo-sort/topo-sort.graph.ts:16` - `DirectedAcyclicGraph` - S.HashMap
- `src/topo-sort/topo-sort.graph.ts:25` - `TaskList` - S.Array

### Batch 4: @beep/documents-server (6 schemas)
- `src/db/repos/Discussion.repo.ts:19` - `DiscussionWithCommentsSchema` - S.Struct
- `src/db/repos/Document.repo.ts:16` - `SearchResultSchema` - S.Struct
- `src/db/repos/Document.repo.ts:24` - `SearchRequest` - S.Struct
- `src/db/repos/DocumentVersion.repo.ts:24` - `VersionWithAuthorSchema` - S.Struct
- `src/db/repos/DocumentFile.repo.ts:17` - `FileNotFoundError` - Data.TaggedError
- `src/db/repos/DocumentVersion.repo.ts:17` - `VersionNotFoundError` - Data.TaggedError

### Batch 5: @beep/iam-client (4 schemas)
- `src/adapters/better-auth/errors.ts:3` - `BetterAuthError` - Data.TaggedError
- `src/clients/user/user.contracts.ts:57` - `ChangeEmailPayload` - S.Class
- `src/clients/user/user.contracts.ts:72` - `ChangePasswordPayload` - S.Class
- `src/clients/verify/verify.contracts.ts:116` - `VerifyEmailUser` - S.Struct

### Batch 6: @beep/shared-server (4 schemas)
- `src/internal/email/adapters/resend/errors.ts:9` - `ResendErrorCode` - BS.StringLiteralKit
- `src/internal/email/adapters/resend/errors.ts:40` - `ResendError` - S.TaggedError
- `src/internal/email/adapters/resend/errors.ts:61` - `EmailTemplateRenderError` - S.TaggedError
- `src/db/repos/UploadSession.repo.ts:61` - `UploadSessionRepoError` - S.TaggedError

### Batch 7: Remaining Packages (15 schemas)
- @beep/constants: `src/AuthProviders.ts:82` - `TaggedAuthProviderNameValue` - Union
- @beep/contract: `src/internal/contract-kit/contract-kit.ts:191` - `LiftServiceMode` - BS.StringLiteralKit
- @beep/contract: `src/internal/contract/annotations.ts:77` - `SupportsAbort` - Context.Reference
- @beep/errors: `src/errors.ts:27` - `Es5Error` - Data.Error
- @beep/invariant: `src/meta.ts:39` - `CallMetadata` - S.Struct
- @beep/yjs: `src/protocol/Ai.ts:30` - `ContextualPromptResponseOther` - S.Class
- @beep/yjs: `src/protocol/Groups.ts:17` - `GroupScopes` - S.Struct
- @beep/iam-domain: `src/entities/DeviceCode/schemas/DeviceCodeStatus.ts:4` - `DeviceCodeStatus` - StringLiteralKit
- @beep/documents-domain: `src/entities/Discussion/Discussion.rpc.ts:16` - `DiscussionWithComments` - S.Struct
- @beep/documents-domain: `src/entities/Document/Document.rpc.ts:11` - `SearchResult` - S.Struct
- @beep/runtime-client: `src/workers/image-compression-rpc.ts:5` - `ImageCompressionRpc` - RpcGroup.make
- @beep/runtime-client: `src/workers/worker-rpc.ts:12` - `WorkerRpc` - RpcGroup.make
- @beep/runtime-client: `src/services/unsafe-http-api-client.ts:46` - `HttpBodyFromSelf` - S.declare
- @beep/shared-client: `src/atom/files/types.ts:78` - `StartUploadFolder` - S.TaggedClass
- @beep/shared-env: `src/ClientEnv.ts:15` - `AuthProviderNames` - Transformed Schema
- @beep/shared-env: `src/ClientEnv.ts:19` - `ClientEnvSchema` - S.Struct
- @beep/shared-tables: `src/columns/custom-datetime.ts:17` - `DateTimeToIsoString` - S.transformOrFail
- @beep/ui-core: `src/i18n/constants.ts:14` - `LangValueToAdapterLocale` - S.transformLiterals
- @beep/ui-core: `src/i18n/SupportedLangValue.ts:3` - `SupportedLangValue` - StringLiteralKit
- @beep/ui: `src/components/editor/use-chat.ts:71` - `ToolName` - S.Class

## Execution Instructions

1. **Process in batches**: Work through schemas batch by batch (7 batches total)
2. **Read before editing**: Always read the file first to understand existing patterns
3. **Add identity import**: If `$I` doesn't exist, add the identity composer import and create statement
4. **Follow existing patterns**: Match the annotation style of neighboring schemas in the same file
5. **Write meaningful descriptions**: Each schema should have a clear, concise description
6. **Handle Data.TaggedError specially**: These use `effect/Data`, not `effect/Schema`. Convert to S.TaggedError if appropriate, or document why they remain as Data.TaggedError
7. **Run type check**: After each batch, run `bun run check` to verify no type errors
8. **Mark progress**: Update the master report checklist as schemas are annotated

## Special Cases

### Data.TaggedError vs S.TaggedError
- `Data.TaggedError` (from `effect/Data`) is for runtime-only errors
- `S.TaggedError` (from `effect/Schema`) is for serializable errors with schema validation
- Consider converting to S.TaggedError if the error needs to be serialized across boundaries

### Context.Reference
- `Context.Reference` doesn't support `.annotations()` the same way
- Document with JSDoc comments instead

### Internal/Non-exported Schemas
- Some identified schemas may be internal implementation details
- Add annotations anyway for documentation purposes, or mark as intentionally unannotated with a comment

## Verification

After completing all annotations:
1. Run `bun run check` - Ensure no type errors
2. Run `bun run build` - Ensure successful build
3. Run `bun run test` - Ensure tests pass
4. Update `MASTER_REPORT.md` status to reflect completion
