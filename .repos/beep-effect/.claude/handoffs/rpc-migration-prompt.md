# RPC Migration to Canonical Entity Folders

## Branch & Context

You are on branch `canonical-slice-domains`. Prior work on this branch migrated **repository implementations** from `src/db/repos/` directories into `src/entities/<Entity>/` folders in each slice server package. That migration is complete and all quality gates pass (build, lint, test).

Your task: perform the same migration for **RPC handler implementations**, moving them from `src/rpc/v1/` directories into the corresponding `src/entities/<Entity>/rpc/` folders.

## Scope

Only `@beep/knowledge-server` has RPC handler implementations. Other slice server packages do not have `src/rpc/` directories. Focus exclusively on `packages/knowledge/server/`.

## Current Structure

```
packages/knowledge/server/src/
├── index.ts                          # exports `Rpc` from "./rpc"
├── rpc/
│   ├── index.ts                      # exports V1 from "./v1"
│   └── v1/
│       ├── index.ts                  # re-exports layer + sub-module namespaces
│       ├── _rpcs.ts                  # ROOT COMPOSITION: merges all sub-group layers, provides service bundles
│       ├── entity/
│       │   ├── index.ts              # re-exports layer from _rpcs
│       │   ├── _rpcs.ts             # EntityRpcs middleware + implementation + toLayer
│       │   ├── count.ts             # Handler
│       │   ├── get.ts               # Handler
│       │   └── list.ts              # Handler
│       ├── batch/
│       │   ├── index.ts
│       │   ├── _rpcs.ts            # BatchRpcs + provides BatchOrchestrator/Aggregator
│       │   ├── startBatch.ts
│       │   ├── getStatus.ts
│       │   ├── cancelBatch.ts
│       │   └── streamProgress.ts
│       ├── relation/
│       │   ├── index.ts
│       │   └── _rpcs.ts            # All stubs (not implemented)
│       ├── evidence/
│       │   ├── index.ts
│       │   ├── _rpcs.ts
│       │   └── list.ts             # CROSS-ENTITY: uses Mention, RelationEvidence, MeetingPrepEvidence repos
│       ├── graphrag/
│       │   ├── index.ts
│       │   ├── _rpcs.ts            # Provides GraphRAGServiceLive
│       │   └── query.ts
│       └── meetingprep/
│           ├── index.ts
│           ├── _rpcs.ts
│           └── generate.ts         # CROSS-ENTITY: uses RelationEvidence, MeetingPrepBullet, MeetingPrepEvidence repos
```

## Target Structure

```
packages/knowledge/server/src/
├── index.ts                          # exports `Rpc` from "./rpc" (UNCHANGED)
├── rpc/
│   ├── index.ts                      # exports V1 from "./v1" (UNCHANGED)
│   └── v1/
│       ├── index.ts                  # (UPDATED) re-exports layer
│       └── _rpcs.ts                  # (UPDATED) ROOT COMPOSITION: imports layers from entity folders
├── entities/
│   ├── index.ts                      # (UPDATED) re-exports entity namespaces
│   ├── Entity/
│   │   ├── index.ts                  # re-exports repo + rpc
│   │   ├── Entity.repo.ts           # (existing)
│   │   └── rpc/
│   │       ├── index.ts              # re-exports layer from _rpcs
│   │       ├── _rpcs.ts             # EntityRpcs middleware + implementation + toLayer
│   │       ├── count.ts
│   │       ├── get.ts
│   │       └── list.ts
│   ├── Batch/
│   │   ├── index.ts
│   │   ├── Batch.repo.ts            # (existing)
│   │   └── rpc/
│   │       ├── index.ts
│   │       ├── _rpcs.ts
│   │       ├── startBatch.ts
│   │       ├── getStatus.ts
│   │       ├── cancelBatch.ts
│   │       └── streamProgress.ts
│   ├── Relation/
│   │   ├── index.ts
│   │   ├── Relation.repo.ts         # (existing)
│   │   └── rpc/
│   │       ├── index.ts
│   │       └── _rpcs.ts             # Stubs stay as-is
│   ├── Evidence/                     # NEW entity folder (no repo, RPC only)
│   │   ├── index.ts
│   │   └── rpc/
│   │       ├── index.ts
│   │       ├── _rpcs.ts
│   │       └── list.ts
│   ├── GraphRAG/                     # NEW entity folder (no repo, RPC only)
│   │   ├── index.ts
│   │   └── rpc/
│   │       ├── index.ts
│   │       ├── _rpcs.ts
│   │       └── query.ts
│   └── MeetingPrep/                  # NEW entity folder (no repo, RPC only)
│       ├── index.ts
│       └── rpc/
│           ├── index.ts
│           ├── _rpcs.ts
│           └── generate.ts
```

## What Changes

### 1. Move handler files into entity folders

For each RPC group (`entity/`, `batch/`, `relation/`, `evidence/`, `graphrag/`, `meetingprep/`):
- Move handler `.ts` files (count.ts, get.ts, list.ts, etc.) into `src/entities/<Entity>/rpc/`
- Move the `_rpcs.ts` file (middleware + implementation + toLayer) into `src/entities/<Entity>/rpc/`
- Create an `index.ts` in each `rpc/` folder that re-exports `{ layer }` from `./_rpcs`

### 2. Update entity folder barrel files

Each entity's `index.ts` must re-export both repo AND rpc:
```typescript
// src/entities/Entity/index.ts
export * from "./Entity.repo";
export * as Rpc from "./rpc";
```

For new entity folders that only have RPC (Evidence, GraphRAG, MeetingPrep):
```typescript
// src/entities/Evidence/index.ts
export * as Rpc from "./rpc";
```

### 3. Update entities barrel

Add new entity namespaces to `src/entities/index.ts`:
```typescript
// Add these to existing exports:
export * as EvidenceLive from "./Evidence";
export * as GraphRAGLive from "./GraphRAG";
export * as MeetingPrepLive from "./MeetingPrep";
```

### 4. Update root RPC composition

The root `src/rpc/v1/_rpcs.ts` must import layers from entity folders instead of local sub-directories:
```typescript
// BEFORE:
import * as Batch from "./batch";
import * as Entity from "./entity";

// AFTER:
import * as Live from "../../entities";
// Then use: Live.EntityLive.Rpc.layer, Live.BatchLive.Rpc.layer, etc.
```

### 5. Delete old rpc/v1/ sub-directories

After moving all files, delete:
- `src/rpc/v1/entity/` (entire directory)
- `src/rpc/v1/batch/` (entire directory)
- `src/rpc/v1/relation/` (entire directory)
- `src/rpc/v1/evidence/` (entire directory)
- `src/rpc/v1/graphrag/` (entire directory)
- `src/rpc/v1/meetingprep/` (entire directory)

Keep `src/rpc/v1/index.ts` and `src/rpc/v1/_rpcs.ts` as the thin composition layer.

### 6. Fix all relative import paths in moved handler files

Handler files have relative imports like `import * as Count from "./count"`. These stay the same since the files move together. But `_rpcs.ts` files may import from domain packages or other services using path aliases — those don't change. Check for any relative imports that reference `../` paths that would break after the move.

## Critical Rules — Lessons from the Repo Migration

### DO NOT change any types in domain packages
This is purely a file reorganization. Domain `.rpc.ts` files, contracts, and type definitions must not be modified. If you find a type mismatch, it's a sign you've moved something incorrectly.

### ALWAYS verify with `tsc -b`, not just `tsgo --noEmit`
The turbo `check` task uses `tsgo --noEmit` which is LESS STRICT than `tsc -b`. Errors hide in `check` but surface in `build`.

**Verification commands (run in this order):**
```bash
# 1. Isolated type check (catches most errors quickly)
bunx tsc -b packages/knowledge/server/tsconfig.build.json

# 2. Full build (catches errors tsgo misses)
bunx turbo run build --filter=@beep/knowledge-server --force

# 3. Full affected build (catches downstream breakage)
bunx turbo run build --affected --force

# 4. Full test suite (catches runtime import errors)
bunx turbo run test --force

# 5. Lint fix
bunx turbo run lint:fix --force
```

### Check ALL downstream consumers
After moving files, grep for ALL import paths that reference the old locations:
```bash
# Search for any imports from old rpc paths
rg "from.*knowledge-server.*rpc" --type ts
rg "from.*\./batch" packages/knowledge/server/src/rpc/ --type ts
rg "from.*\./entity" packages/knowledge/server/src/rpc/ --type ts
# etc.
```

Key consumer: `packages/runtime/server/src/Rpc.layer.ts` imports:
```typescript
import { KnowledgeRepos, Rpc as KnowledgeServerRpc } from "@beep/knowledge-server";
// Uses: KnowledgeServerRpc.V1.layer
```
This import chain is: `@beep/knowledge-server` → `src/index.ts` → `export * as Rpc from "./rpc"` → `src/rpc/index.ts` → `export * as V1 from "./v1"` → `src/rpc/v1/index.ts` → `export { layer } from "./_rpcs"`.

As long as `src/rpc/v1/_rpcs.ts` still exports `layer`, and that layer correctly composes all sub-layers, this chain works unchanged.

### Do NOT introduce `as` type casts
This is a pure file move. If you need a type cast, something is wrong. The handler signatures, middleware applications, and layer compositions should be identical before and after the move.

### Run the FULL test suite, not just the package-specific one
The repo migration missed broken imports in `@beep/db-admin` tests. Run `bunx turbo run test --force` (all packages) to catch runtime import failures.

### Preserve the `_rpcs.ts` service dependency provision pattern
Some `_rpcs.ts` files provide service dependencies after `toLayer()`:
```typescript
// batch/_rpcs.ts - provides BatchAggregatorLive + BatchOrchestratorLive
export const layer = BatchRpcsWithMiddleware.toLayer(implementation).pipe(
  Layer.provide(Layer.mergeAll(BatchAggregatorLive, BatchOrchestratorLive))
);

// graphrag/_rpcs.ts - provides GraphRAGServiceLive
export const layer = GraphRAGRpcsWithMiddleware.toLayer(implementation).pipe(
  Layer.provide(GraphRAGServiceLive)
);
```
These `Layer.provide` calls MUST be preserved when moving the files.

### The root `v1/_rpcs.ts` also provides shared service bundles
```typescript
export const layer = Layer.mergeAll(
  Batch.layer, Entity.layer, Relation.layer, GraphRAG.layer, Evidence.layer, MeetingPrep.layer
).pipe(
  Layer.provide(LlmControlBundleLive),
  Layer.provide(LlmProviderBundleLive),
  Layer.provide(OpenAiEmbeddingLayerConfig),
  Layer.provide(EmbeddingServiceLive),
  Layer.provide(WorkflowRuntimeBundleLive)
);
```
This composition layer stays in `src/rpc/v1/_rpcs.ts` — only the import paths to sub-layers change.

## Execution Order

1. **Read** all handler files and `_rpcs.ts` files to understand exact import paths
2. **Create** new `rpc/` directories inside entity folders
3. **Move** handler files (write to new location, content identical except relative imports if needed)
4. **Move** `_rpcs.ts` files (write to new location)
5. **Create** `index.ts` barrel in each entity's `rpc/` folder
6. **Update** entity `index.ts` barrels to re-export rpc
7. **Update** `src/entities/index.ts` to add new entity namespaces
8. **Update** `src/rpc/v1/_rpcs.ts` to import from entity folders
9. **Update** `src/rpc/v1/index.ts` to remove old sub-module re-exports
10. **Delete** old `src/rpc/v1/{entity,batch,relation,evidence,graphrag,meetingprep}/` directories
11. **Verify** with `tsc -b`, build, test, lint (in that order)

## Edge Cases

### Cross-entity RPC handlers
`evidence/list.ts` and `meetingprep/generate.ts` use multiple entity repos. They still get their own entity folders (`Evidence/`, `MeetingPrep/`). The repo dependencies come via Effect context — the handler files just `yield*` the repos and don't care where they're physically located.

### Entity folders without repos
`Evidence/`, `GraphRAG/`, and `MeetingPrep/` are new entity folders that only contain RPC handlers (no `.repo.ts`). This is fine — entity folders can contain any combination of repo, rpc, services.

### Stub-only implementations
`relation/_rpcs.ts` contains only `Effect.die("Not implemented")` stubs. Move it as-is — don't skip or special-case it.

### The `src/rpc/v1/index.ts` currently re-exports sub-module namespaces
```typescript
export { layer } from "./_rpcs";
export * as Batch from "./batch";
export * as Entity from "./entity";
export * as GraphRAG from "./graphrag";
export * as Relation from "./relation";
```
After migration, these namespace re-exports should either be removed (if nothing consumes them) or redirected to entity folder paths. Check if anything imports `KnowledgeServerRpc.V1.Batch` etc. If not, remove the namespace re-exports and keep only `export { layer } from "./_rpcs"`.
