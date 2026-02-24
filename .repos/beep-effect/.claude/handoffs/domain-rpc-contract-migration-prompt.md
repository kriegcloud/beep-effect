# Domain RPC Contract Migration: `Rpc.make` to `S.TaggedRequest`

## Branch & Context

Branch: `canonical-slice-domains`. Prior work on this branch migrated server-side repos and RPC handlers to canonical entity folders. This task converts **domain RPC endpoint definitions** in `packages/knowledge/domain/src/rpc/` from `Rpc.make` to `S.TaggedRequest` contracts in `src/entities/<Entity>/contracts/`.

## Task Summary

1. Delete ALL existing placeholder `.contract.ts` files from ALL 19 entity `contracts/` directories
2. Convert 35 RPC definition files from `src/rpc/` into new `.contract.ts` files under `src/entities/<Entity>/contracts/`
3. Create 3 new entity folders (GraphRag, Evidence, MeetingPrep) for RPC groups without existing entity directories
4. Update entity `*.rpc.ts` files to compose from new contracts
5. Replace `src/rpc/` subdirectories with thin re-export barrel files
6. Update server handler imports
7. Run repo-level quality checks

## Reference Patterns

### BEFORE: `Rpc.make` (current, in `src/rpc/Entity/Count.ts`)

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { CountResult } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Entity/Count");

export class Payload extends S.Class<Payload>($I`Payload`)({
  type: S.optional(S.String),
  ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
  organizationId: SharedEntityIds.OrganizationId,
}, $I.annotations("Payload", { description: "entity_count payload" })) {}

export class Success extends CountResult.extend<Success>($I`Success`)(
  {}, $I.annotations("Success", { description: "entity_count succeeded" })
) {}

export const Contract = Rpc.make("count", { payload: Payload, success: Success });
```

### AFTER: `S.TaggedRequest` (target, in `entities/Entity/contracts/Count.contract.ts`)

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { CountResult } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Entity/contracts/Count.contract");

export class Payload extends S.Class<Payload>($I`Payload`)({
  type: S.optional(S.String),
  ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
  organizationId: SharedEntityIds.OrganizationId,
}, $I.annotations("Payload", { description: "entity_count payload" })) {}

export class Success extends CountResult.extend<Success>($I`Success`)(
  {}, $I.annotations("Success", { description: "entity_count succeeded" })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "count",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Count entities Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.post("Count", "/count")
    .setPayload(Payload)
    .addSuccess(Success);
}
```

### Streaming reference: `Breadcrumbs.contract.ts` in documents-domain

Read `packages/documents/domain/src/entities/Page/contracts/Breadcrumbs.contract.ts` for the canonical streaming contract pattern using `RpcSchema.Stream`.

## Critical Rules

### 1. LOWERCASE tags

The tag in `S.TaggedRequest` MUST be lowercase to match the existing `Rpc.make` first argument. The `_rpcs.ts` files apply `.prefix("entity_")` — so `"count"` becomes `entity_count`. PascalCase would break wire format.

Map the tag from each source file's `Rpc.make("tagName", ...)` first argument.

### 2. `Error` becomes `Failure`

- `export const Error = SomeError` becomes `export const Failure = SomeError`
- Add: `export type Failure = typeof Failure.Type;`
- No error: `export const Failure = S.Never;` + `export type Failure = typeof Failure.Type;`
- Union errors: `export const Failure = S.Union(ErrorA, ErrorB);`

### 3. Streaming RPCs use `RpcSchema.Stream`

```typescript
import * as RpcSchema from "@effect/rpc/RpcSchema";

export const Success = RpcSchema.Stream({ success: ItemSchema, failure: StreamError });
export type Success = S.Schema.Type<typeof Success>;

// Outer failure is ALWAYS S.Never for streaming contracts
export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "list",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotations("Contract", { description: "..." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  // NO Tool or Http for streaming contracts
}
```

If the source has `stream: true` with no error, use `failure: S.Never` inside `RpcSchema.Stream`.
If the source has `stream: true` with error, use that error inside `RpcSchema.Stream`.

### 4. Protocol derivations

| Type | Derivations |
|------|-------------|
| Regular (no error or single error) | `Rpc`, `Tool`, `Http` |
| Regular (union error) | `Rpc`, `Tool`, `Http` (with `.addError()` per error) |
| Streaming | `Rpc` only (no Tool or Http) |
| Void success (delete) | `Rpc`, `Tool`, `Http` — use `S.Void.annotations(...)` for Success |

### 5. HTTP method selection

| Pattern | Method | Example |
|---------|--------|---------|
| Get by ID | `HttpApiEndpoint.get` | Get, GetStatus, GetClasses |
| Query/List/Search/Count | `HttpApiEndpoint.post` | Count, List, Search, Query |
| Create/Start/Extract/Generate | `HttpApiEndpoint.post` | Create, Start, Extract |
| Update | `HttpApiEndpoint.patch` | Update |
| Delete/Cancel | `HttpApiEndpoint.del` | Delete, Cancel |

### 6. Identity string path

Change from `$KnowledgeDomainId.create("rpc/Entity/Count")` to `$KnowledgeDomainId.create("entities/Entity/contracts/Count.contract")`.

### 7. Use `$I.annotationsHttp` for non-streaming, `$I.annotations` for streaming

Non-streaming contracts with Http derivation use `$I.annotationsHttp(...)`. Streaming contracts (RPC only) use `$I.annotations(...)`.

### 8. Preserve helper class exports

Some RPC files export helper classes (e.g., `BatchDocument` in `StartBatch.ts`, `SeedEntity` in `queryFromSeeds.ts`, `EvidenceItem` in `Evidence/list.ts`, `Bullet` in `MeetingPrep/generate.ts`). Include these in the contract file.

## File Inventory

### Entity group (prefix: `entity_`)

| Source | Target | Tag | Stream | Error |
|--------|--------|-----|--------|-------|
| `rpc/Entity/Count.ts` | `entities/Entity/contracts/Count.contract.ts` | `count` | No | None |
| `rpc/Entity/Create.ts` | `entities/Entity/contracts/Create.contract.ts` | `create` | No | None |
| `rpc/Entity/Delete.ts` | `entities/Entity/contracts/Delete.contract.ts` | `delete` | No | `EntityNotFoundError` |
| `rpc/Entity/Get.ts` | `entities/Entity/contracts/Get.contract.ts` | `get` | No | `EntityNotFoundError` |
| `rpc/Entity/List.ts` | `entities/Entity/contracts/List.contract.ts` | `list` | YES | None |
| `rpc/Entity/Search.ts` | `entities/Entity/contracts/Search.contract.ts` | `search` | YES | `EntityNotFoundError` (in stream) |
| `rpc/Entity/Update.ts` | `entities/Entity/contracts/Update.contract.ts` | `update` | No | `EntityNotFoundError` |

### Batch group (prefix: `batch_`)

| Source | Target | Tag | Stream | Error |
|--------|--------|-----|--------|-------|
| `rpc/Batch/CancelBatch.ts` | `entities/Batch/contracts/CancelBatch.contract.ts` | `cancel` | No | `BatchNotFoundError \| InvalidStateTransitionError` |
| `rpc/Batch/GetBatchStatus.ts` | `entities/Batch/contracts/GetBatchStatus.contract.ts` | `getStatus` | No | `BatchNotFoundError` |
| `rpc/Batch/StartBatch.ts` | `entities/Batch/contracts/StartBatch.contract.ts` | `start` | No | `InvalidStateTransitionError \| BatchAlreadyRunningError` |
| `rpc/Batch/StreamProgress.ts` | `entities/Batch/contracts/StreamProgress.contract.ts` | `streamProgress` | YES | `BatchNotFoundError` (in stream) |

### Extraction group (prefix: `extraction_`)

| Source | Target | Tag | Stream | Error |
|--------|--------|-----|--------|-------|
| `rpc/Extraction/Cancel.ts` | `entities/Extraction/contracts/Cancel.contract.ts` | `cancel` | No | `ExtractionError` |
| `rpc/Extraction/Extract.ts` | `entities/Extraction/contracts/Extract.contract.ts` | `extract` | No | `ExtractionError` |
| `rpc/Extraction/GetStatus.ts` | `entities/Extraction/contracts/GetStatus.contract.ts` | `getStatus` | No | `ExtractionError` |
| `rpc/Extraction/List.ts` | `entities/Extraction/contracts/List.contract.ts` | `list` | YES | None |

### Ontology group (prefix: `ontology_`)

| Source | Target | Tag | Stream | Error |
|--------|--------|-----|--------|-------|
| `rpc/Ontology/Create.ts` | `entities/Ontology/contracts/Create.contract.ts` | `create` | No | `OntologyMutationError` |
| `rpc/Ontology/Delete.ts` | `entities/Ontology/contracts/Delete.contract.ts` | `delete` | No | `OntologyNotFoundError` |
| `rpc/Ontology/Get.ts` | `entities/Ontology/contracts/Get.contract.ts` | `get` | No | `OntologyNotFoundError` |
| `rpc/Ontology/GetClasses.ts` | `entities/Ontology/contracts/GetClasses.contract.ts` | `getClasses` | YES | `OntologyNotFoundError` (in stream) |
| `rpc/Ontology/GetProperties.ts` | `entities/Ontology/contracts/GetProperties.contract.ts` | `getProperties` | YES | `OntologyNotFoundError` (in stream) |
| `rpc/Ontology/List.ts` | `entities/Ontology/contracts/List.contract.ts` | `list` | YES | None |
| `rpc/Ontology/Update.ts` | `entities/Ontology/contracts/Update.contract.ts` | `update` | No | `OntologyNotFoundError \| OntologyMutationError` |

### Relation group (prefix: `relation_`)

| Source | Target | Tag | Stream | Error |
|--------|--------|-----|--------|-------|
| `rpc/Relation/Count.ts` | `entities/Relation/contracts/Count.contract.ts` | `count` | No | None |
| `rpc/Relation/Create.ts` | `entities/Relation/contracts/Create.contract.ts` | `create` | No | None |
| `rpc/Relation/Delete.ts` | `entities/Relation/contracts/Delete.contract.ts` | `delete` | No | `RelationNotFoundError` |
| `rpc/Relation/Get.ts` | `entities/Relation/contracts/Get.contract.ts` | `get` | No | `RelationNotFoundError` |
| `rpc/Relation/ListByEntity.ts` | `entities/Relation/contracts/ListByEntity.contract.ts` | `listByEntity` | YES | None |
| `rpc/Relation/ListByPredicate.ts` | `entities/Relation/contracts/ListByPredicate.contract.ts` | `listByPredicate` | YES | None |

### GraphRag group (prefix: `graphrag_`) — NEW entity folder

| Source | Target | Tag | Stream | Error |
|--------|--------|-----|--------|-------|
| `rpc/GraphRag/query.ts` | `entities/GraphRag/contracts/Query.contract.ts` | `query` | No | `GraphRAGError` |
| `rpc/GraphRag/queryFromSeeds.ts` | `entities/GraphRag/contracts/QueryFromSeeds.contract.ts` | `queryFromSeeds` | No | `GraphRAGError` |

### Evidence group (prefix: `evidence_`) — NEW entity folder

| Source | Target | Tag | Stream | Error |
|--------|--------|-----|--------|-------|
| `rpc/Evidence/list.ts` | `entities/Evidence/contracts/List.contract.ts` | `list` | No | None |

### MeetingPrep group (prefix: `meetingprep_`) — NEW entity folder

| Source | Target | Tag | Stream | Error |
|--------|--------|-----|--------|-------|
| `rpc/MeetingPrep/generate.ts` | `entities/MeetingPrep/contracts/Generate.contract.ts` | `generate` | No | None |

## Execution Plan

### Phase 1: Read all source files

Read every RPC definition file (35 files across 8 groups in `src/rpc/`) and every `_rpcs.ts` composition file. Also read the reference contract at `packages/documents/domain/src/entities/Page/contracts/Breadcrumbs.contract.ts`.

### Phase 2: Delete placeholder contracts

Delete ALL `contracts/` directories from ALL 19 entity folders:

```
rm -rf packages/knowledge/domain/src/entities/{Agent,Batch,ClassDefinition,EmailThread,EmailThreadMessage,Embedding,Entity,EntityCluster,Extraction,MeetingPrepBullet,MeetingPrepEvidence,Mention,MentionRecord,MergeHistory,Ontology,PropertyDefinition,Relation,RelationEvidence,SameAsLink}/contracts/
```

### Phase 3: Create new contract files

For each of the 35 RPC files, create a `.contract.ts` file at the target path. Each file:

1. Copy `Payload` and `Success` classes verbatim (update `$I` path only)
2. Convert `export const Error` / `export class Error` to `export const Failure` + `export type Failure`
3. Replace `Rpc.make(...)` with `S.TaggedRequest` contract class
4. Add protocol derivations (`Rpc`, `Tool`, `Http` or just `Rpc` for streaming)
5. Preserve any helper class exports (`BatchDocument`, `SeedEntity`, `EvidenceItem`, `Bullet`)

Create `contracts/index.ts` barrels for each entity that has contracts:

```typescript
// entities/Entity/contracts/index.ts
export * as Count from "./Count.contract";
export * as Create from "./Create.contract";
export * as Delete from "./Delete.contract";
export * as Get from "./Get.contract";
export * as List from "./List.contract";
export * as Search from "./Search.contract";
export * as Update from "./Update.contract";
```

### Phase 4: Create new entity folders

Create 3 new entity folders for RPC groups without existing entity directories:

```
entities/GraphRag/
  contracts/
    Query.contract.ts
    QueryFromSeeds.contract.ts
    index.ts
  GraphRag.rpc.ts
  index.ts

entities/Evidence/
  contracts/
    List.contract.ts
    index.ts
  Evidence.rpc.ts
  index.ts

entities/MeetingPrep/
  contracts/
    Generate.contract.ts
    index.ts
  MeetingPrep.rpc.ts
  index.ts
```

Each `index.ts`:
```typescript
export * as Contracts from "./contracts";
export * as Rpcs from "./GraphRag.rpc";
```

### Phase 5: Update entity `*.rpc.ts` files

For the 5 entities WITH matching RPC groups (Entity, Batch, Extraction, Ontology, Relation), rewrite `*.rpc.ts` to compose from new contracts:

```typescript
// entities/Entity/Entity.rpc.ts
import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Count, Create, Delete, Get, List, Search, Update } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Count.Contract.Rpc,
  Create.Contract.Rpc,
  Delete.Contract.Rpc,
  Get.Contract.Rpc,
  List.Contract.Rpc,
  Search.Contract.Rpc,
  Update.Contract.Rpc,
).prefix("entity_") {}

export { Count, Create, Delete, Get, List, Search, Update };
```

For the 3 NEW entity folders (GraphRag, Evidence, MeetingPrep), create `*.rpc.ts` following the same pattern.

For the 14 entities WITHOUT RPC groups (Agent, ClassDefinition, EmailThread, etc.):
- Their placeholder contracts are deleted (Phase 2)
- Remove the `export * as Contracts from "./contracts"` line from their `index.ts`
- Update their `*.rpc.ts` to remove contract imports. If they compose ONLY from placeholder contracts, make it an empty export: `export class Rpcs extends RpcGroup.make() {}`
- If `RpcGroup.make()` with no arguments doesn't compile, remove the `*.rpc.ts` entirely and update `*.entity.ts` to not depend on it (this may require removing `ClusterEntity.fromRpcGroup` calls or finding an alternative)

### Phase 6: Update entity `index.ts` barrels

For entities with new contracts, ensure `index.ts` exports contracts:
```typescript
export * as Contracts from "./contracts";
```

Remove `export * as Contracts from "./contracts"` from entities whose contracts/ was deleted entirely.

### Phase 7: Update `entities/index.ts` barrel

Add new entity exports:
```typescript
export * as Evidence from "./Evidence";
export * as GraphRag from "./GraphRag";
export * as MeetingPrep from "./MeetingPrep";
```

### Phase 8: Replace `src/rpc/` with thin re-export barrel

Delete ALL subdirectories and definition files from `src/rpc/`, then replace with thin re-export files.

The consumers need these import paths to work:
- `import { Rpc } from "@beep/knowledge-domain"` → accesses `Rpc.Entity.Rpcs`, `Rpc.Batch.Rpcs`, etc.
- `import { Entity } from "@beep/knowledge-domain/rpc/Entity"` → accesses `Entity.Count.Payload`, etc.

Create this structure:

```
src/rpc/
  index.ts          # Barrel for Rpc namespace
  Entity.ts         # Re-export for deep import
  Batch.ts
  Extraction.ts
  Ontology.ts
  Relation.ts
  GraphRag.ts
  Evidence.ts
  MeetingPrep.ts
```

`src/rpc/index.ts`:
```typescript
export { Entity } from "./Entity";
export { Batch } from "./Batch";
export { Extraction } from "./Extraction";
export { Ontology } from "./Ontology";
export { Relation } from "./Relation";
export { GraphRag } from "./GraphRag";
export { Evidence } from "./Evidence";
export { MeetingPrep } from "./MeetingPrep";
```

Each re-export file (e.g., `src/rpc/Entity.ts`):
```typescript
export * as Entity from "../entities/Entity/Entity.rpc";
```

This preserves `import { Entity } from "@beep/knowledge-domain/rpc/Entity"` → `Entity.Count.Payload` etc., because `Entity.rpc.ts` re-exports `{ Rpcs, Count, Create, ... }`.

### Phase 9: Verify no broken imports

The `src/index.ts` already has `export * as Rpc from "./rpc"` which resolves to `src/rpc/index.ts`. This should still work after the changes.

Check all consumers:

**`packages/runtime/server/src/Rpc.layer.ts`** uses:
```typescript
import { Rpc as KnowledgeDomainRpc } from "@beep/knowledge-domain";
// KnowledgeDomainRpc.Entity.Rpcs, .Batch.Rpcs, etc.
```

**Server `_rpcs.ts` files (6)** use:
```typescript
import { Rpc as RpcContracts } from "@beep/knowledge-domain";
// RpcContracts.Entity.Rpcs, .Batch.Rpcs, etc.
```

**Server handler files (10)** use deep imports:
```
import { Entity } from "@beep/knowledge-domain/rpc/Entity"      → Entity.Count.Payload
import { Batch } from "@beep/knowledge-domain/rpc/Batch"        → Batch.StartBatch.Payload
import type { GraphRag } from "@beep/knowledge-domain/rpc/GraphRag"
import type { Evidence } from "@beep/knowledge-domain/rpc/Evidence"
import type { MeetingPrep } from "@beep/knowledge-domain/rpc/MeetingPrep"
```

All of these should work with the thin re-export barrel. Verify with a build.

### Phase 10: Quality gates

```bash
# Type check
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run check --filter @beep/runtime-server

# Build
bunx turbo run build --force

# Lint
bun run lint:fix --filter @beep/knowledge-domain

# Test
bunx turbo run test --force
```

All must pass.

## Key Files to Read Before Starting

1. `packages/documents/domain/src/entities/Page/contracts/Breadcrumbs.contract.ts` — canonical streaming contract
2. `packages/knowledge/domain/src/entities/Entity/contracts/Get.contract.ts` — placeholder contract (to understand what's being deleted)
3. `packages/knowledge/domain/src/rpc/Entity/Count.ts` — example `Rpc.make` source (non-streaming)
4. `packages/knowledge/domain/src/rpc/Entity/List.ts` — example `Rpc.make` source (streaming)
5. `packages/knowledge/domain/src/rpc/Batch/StreamProgress.ts` — streaming with error
6. `packages/knowledge/domain/src/entities/Entity/Entity.rpc.ts` — current *.rpc.ts composition
7. `packages/knowledge/domain/src/entities/Entity/Entity.entity.ts` — cluster entity dependency
8. `packages/runtime/server/src/Rpc.layer.ts` — primary Rpc namespace consumer
9. `packages/knowledge/server/src/entities/Entity/rpc/_rpcs.ts` — server _rpcs consumer
10. `packages/knowledge/server/src/entities/Entity/rpc/count.ts` — server handler deep import consumer
