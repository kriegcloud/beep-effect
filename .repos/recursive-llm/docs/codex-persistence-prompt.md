# Codex Prompt: Artifact Persistence & Large-Output Handling for RLM

## Problem Statement

The Recursive Language Model (RLM) system executes an iterative code-generation loop: an LLM generates JavaScript, a sandboxed subprocess executes it, and the output feeds back into the next iteration. When the LLM is ready to finalize, it calls `SUBMIT({ answer })` as a tool call. This architecture has two critical failure modes:

### Failure 1: Large SUBMIT Answers Exceed Output Token Limits

When the model builds a large analysis (e.g., 85K chars across 1,637 articles), the `SUBMIT({ answer: "..." })` tool call exceeds the model's output token limit (4,096 tokens). The model then tries to "continue" the SUBMIT across subsequent iterations, each producing partial fragments. Eventually an iteration produces only whitespace/empty content, which gets added to the transcript. The next API call then fails with Anthropic's `"messages: text content blocks must be non-empty"` error.

**Root cause**: The SUBMIT answer is emitted inline in the model's token stream. There is no mechanism to reference large payloads by ID — the model must serialize the entire answer in one output turn.

### Failure 2: No State Persistence Across Crashes

All analysis state lives in the sandbox's in-memory variable space (`__vars`). When the process crashes (as above), all computed state — article classifications, sentiment analyses, temporal trends, the final report — is permanently lost. There is no persistence layer, no checkpointing, no recovery mechanism.

### Failure 3: Transcript Growth is Unbounded

Each iteration appends a `TranscriptEntry` (assistant response + execution output) to the transcript. The full transcript is sent to the model on every iteration. For long-running analyses (10+ iterations), this consumes increasing amounts of the context window with stale intermediate work.

---

## Solution Architecture: Artifact Store

Introduce a first-class **Artifact Store** backed by Effect's `KeyValueStore` that serves as the persistence backbone for:
1. Large SUBMIT payloads (stored by artifact ID, only ID crosses token boundary)
2. Sandbox variable snapshots (checkpoint/restore across crashes)
3. Transcript persistence (resume from last good state)

### Design Principles

- **Effect-native**: Use `@effect/platform` `KeyValueStore` with `Schema`-typed stores
- **Content-addressed**: Artifact IDs derived from content hash (SHA-256 prefix) for deduplication
- **Layered backends**: In-memory for tests, file-system for production (via `KeyValueStore.layerFileSystem`)
- **Transparent to the model**: The sandbox exposes `store(name, value)` and `load(name)` functions; the SUBMIT mechanism auto-detects large answers and stores them as artifacts

---

## Implementation Plan

### Phase 1: Artifact Store Service

Create `src/ArtifactStore.ts` — an Effect service wrapping `KeyValueStore` with content-addressed storage and Schema-typed operations.

**Key types:**
```typescript
// Content-addressed artifact reference
interface ArtifactRef {
  readonly _tag: "ArtifactRef"
  readonly id: string        // sha256 prefix (12 chars)
  readonly size: number       // byte length of stored content
  readonly createdAt: number  // Date.now()
}

// What gets persisted
interface StoredArtifact {
  readonly ref: ArtifactRef
  readonly content: string    // the actual payload
  readonly contentType: "text" | "json"
}
```

**Service interface:**
```typescript
interface ArtifactStore {
  // Store content, return a ref
  readonly store: (content: string, contentType?: "text" | "json") => Effect<ArtifactRef, PlatformError>

  // Retrieve by ref ID
  readonly load: (id: string) => Effect<Option<string>, PlatformError>

  // Check existence
  readonly has: (id: string) => Effect<boolean, PlatformError>

  // List all artifact refs
  readonly list: () => Effect<ReadonlyArray<ArtifactRef>, PlatformError>
}
```

**Layer implementations:**
- `ArtifactStore.layerMemory` — wraps `KeyValueStore.layerMemory` (for tests)
- `ArtifactStore.layerFileSystem(directory)` — wraps `KeyValueStore.layerFileSystem` (for production)
- Both use `KeyValueStore.prefix(store, "artifact:")` for namespacing

**Effect patterns to use:**
- `Context.Tag` for the service
- `Layer.effect` to capture `KeyValueStore` dependency
- `Schema.TaggedClass` for `ArtifactRef` and `StoredArtifact`
- `KeyValueStore.forSchema(StoredArtifactSchema)` for typed persistence
- Content-address via `crypto.subtle.digest("SHA-256", ...)` → hex prefix

### Phase 2: Large-Output SUBMIT Handling

Modify the SUBMIT flow so that when the model's answer exceeds a threshold, it is automatically stored as an artifact and only the artifact ref is passed through the system.

**Changes to `src/Scheduler.ts` (GenerateStep handler):**

Currently, when SUBMIT is found:
```typescript
// Current: inline answer
yield* enqueueOrWarn(RlmCommand.Finalize({
  callId: command.callId,
  payload: submitAnswer.value  // <-- full string, can be huge
}))
```

New flow:
```typescript
const answer = submitAnswer.value
const ARTIFACT_THRESHOLD = 16_000 // chars

if (typeof answer === "string" && answer.length > ARTIFACT_THRESHOLD) {
  const artifactStore = yield* ArtifactStore
  const ref = yield* artifactStore.store(answer)
  // Finalize with artifact ref — downstream resolves it
  yield* enqueueOrWarn(RlmCommand.Finalize({
    callId: command.callId,
    payload: answer,          // still pass full answer for the result
    artifactRef: ref          // also persist ref for recovery
  }))
} else {
  yield* enqueueOrWarn(RlmCommand.Finalize({ callId: command.callId, payload: answer }))
}
```

**But the deeper problem is that the model can't even emit the full SUBMIT in one turn.** The real fix is to let the model store the answer in `__vars` first, then SUBMIT a reference:

**New sandbox function: `store_artifact(name, value)`**
- Exposed alongside `print`, `llm_query`, etc. in the sandbox scope
- Sends an IPC message to the host: `{ _tag: "StoreArtifact", requestId, name, value }`
- Host stores via `ArtifactStore.store()`, returns artifact ID
- Worker receives `{ _tag: "StoreArtifactResult", requestId, artifactId }`
- Model can then call `SUBMIT({ answer: __vars.finalReport })` where the answer is already a JS variable — BUT the SUBMIT tool call still serializes the answer in the token stream

**The actual solution**: Allow SUBMIT to accept a variable name reference:
```typescript
// New SUBMIT parameter schema
Tool.make("SUBMIT", {
  parameters: Schema.Union(
    Schema.Struct({ answer: Schema.String }),                    // inline answer
    Schema.Struct({ variable: Schema.String }),                  // reference to __vars key
    Schema.Struct({ value: Schema.Unknown }),                    // structured output
    Schema.Struct({ variable: Schema.String, schema: Schema.String }) // structured from var
  )
})
```

When the model calls `SUBMIT({ variable: "finalReport" })`, the scheduler:
1. Reads `__vars.finalReport` from sandbox via `getVariable("finalReport")`
2. Stores the content as an artifact
3. Passes the full content to Finalize

This keeps the token-space cost of SUBMIT to ~20 tokens regardless of answer size.

### Phase 3: Checkpoint & Recovery

Add checkpointing so that sandbox state and transcript can be recovered after a crash.

**Checkpoint structure:**
```typescript
interface Checkpoint {
  readonly callId: CallId
  readonly iteration: number
  readonly timestamp: number
  readonly transcriptEntries: ReadonlyArray<TranscriptEntry>
  readonly variableNames: ReadonlyArray<string>  // keys that have been stored
  readonly budgetSnapshot: { iterationsUsed: number; llmCallsUsed: number }
}
```

**Checkpoint triggers:**
- After each successful code execution (before next GenerateStep)
- Store checkpoint as artifact: `checkpoint:{callId}:latest`
- Store variable snapshots: `var:{callId}:{varName}` for key variables

**Recovery flow:**
- On CLI startup, check for existing checkpoint for the same query+context hash
- If found, offer to resume (or auto-resume with `--resume` flag)
- Restore transcript, inject stored variables back into sandbox, continue from last iteration

**Changes needed:**
- `src/Scheduler.ts`: After `attachExecutionOutput` and before `GenerateStep`, emit checkpoint
- `src/CallContext.ts`: Add `checkpoint` method that serializes state
- `src/cli/Run.ts`: Check for existing checkpoint on startup
- New IPC messages: `SetVarBulk` to restore multiple variables at once

### Phase 4: Sandbox-Side `store()` / `load()` Functions

Expose artifact persistence directly in the sandbox so the model can explicitly persist intermediate results.

**New sandbox globals:**
```javascript
// Store a value persistently (survives crashes)
const artifactId = await store("analysis_results", myLargeObject)

// Load a previously stored value
const data = await load("analysis_results")

// List stored artifacts
const artifacts = await list_artifacts()
```

**IPC protocol additions:**
```typescript
// Worker → Host
{ _tag: "StoreArtifact", requestId: string, name: string, value: unknown }

// Host → Worker
{ _tag: "StoreArtifactResult", requestId: string, artifactId: string }

// Worker → Host
{ _tag: "LoadArtifact", requestId: string, name: string }

// Host → Worker
{ _tag: "LoadArtifactResult", requestId: string, value: unknown | null }
```

These route through the bridge handler pattern already used by `llm_query` / `llm_query_batched`.

---

## Key Files to Read and Modify

| File | Role | Changes |
|---|---|---|
| `src/ArtifactStore.ts` | **NEW** — Artifact persistence service | Create: service interface, Schema types, layerMemory, layerFileSystem |
| `src/Scheduler.ts` | Command loop, GenerateStep, Finalize | Add checkpoint writes, artifact-backed SUBMIT handling |
| `src/SubmitTool.ts` | SUBMIT tool definition + extraction | Add `variable` parameter variant, variable-ref resolution |
| `src/CallContext.ts` | Per-call state (transcript, iteration) | Add `checkpoint()` serialization method |
| `src/Sandbox.ts` | Sandbox interface + factory | Add `storeArtifact` / `loadArtifact` IPC methods |
| `src/sandbox-worker.ts` | Worker subprocess | Add `store` / `load` / `list_artifacts` scope functions, IPC handlers |
| `src/BridgeHandler.ts` | Handles bridge calls from sandbox | Add StoreArtifact/LoadArtifact method routing |
| `src/RlmTypes.ts` | Shared types | Add ArtifactRef, Checkpoint, new IPC message schemas |
| `src/RlmConfig.ts` | Configuration | Add `artifactThreshold`, `artifactDirectory`, `enableCheckpoints` |
| `src/cli/Run.ts` | CLI entry point | Add `--resume` flag, checkpoint detection, ArtifactStore layer wiring |
| `src/Runtime.ts` | Layer composition | Wire ArtifactStore into the runtime layer stack |

## Effect Platform Reference

The `KeyValueStore` from `@effect/platform` provides the persistence backbone:

```typescript
import * as KeyValueStore from "@effect/platform/KeyValueStore"
```

**Core API:**
- `KeyValueStore.KeyValueStore` — Context tag for the service
- `.get(key)` → `Effect<Option<string>, PlatformError>`
- `.set(key, value)` → `Effect<void, PlatformError>`
- `.remove(key)` → `Effect<void, PlatformError>`
- `.has(key)` → `Effect<boolean, PlatformError>`
- `.forSchema(schema)` → `SchemaStore<A, R>` (typed get/set with auto JSON encode/decode)

**Layers:**
- `KeyValueStore.layerMemory` — in-memory `Map`, for tests
- `KeyValueStore.layerFileSystem(directory)` — each key = one file, requires `FileSystem` + `Path` services
- `KeyValueStore.prefix(store, "ns:")` — namespace combinator

**Schema Store** (typed persistence):
```typescript
const { tag, layer } = KeyValueStore.layerSchema(MySchema, "MyStore")
// tag: Context.Tag<SchemaStore<A, R>>
// layer: Layer<SchemaStore<A, R>, never, KeyValueStore>
```

**File-backed layer for Bun:**
```typescript
import { BunFileSystem } from "@effect/platform-bun"
// or use NodeFileSystem from @effect/platform-node

const kvLayer = KeyValueStore.layerFileSystem(".rlm/artifacts").pipe(
  Layer.provide(BunFileSystem.layer),
  Layer.provide(BunPath.layer)
)
```

Check `node_modules/@effect/platform/src/KeyValueStore.ts` for the full interface and `node_modules/@effect/platform/src/internal/keyValueStore.ts` for implementation reference.

## Effect Source Code Reference

Consult these for implementation patterns:
- `.reference/effect/packages/ai/ai/src/` — Effect AI package (Tool, Toolkit, LanguageModel patterns)
- `.reference/effect/packages/platform/src/KeyValueStore.ts` — KeyValueStore interface
- `.reference/effect/packages/platform/src/internal/keyValueStore.ts` — layerMemory and layerFileSystem implementations
- `src/Scheduler.ts` — existing command loop pattern to extend
- `src/BridgeHandler.ts` — existing bridge call routing to extend
- `src/sandbox-worker.ts` — existing IPC handler + scope injection pattern

## Testing Strategy

- Unit tests for `ArtifactStore` service (memory layer): store/load/has/list
- Unit tests for `SUBMIT({ variable })` parameter variant extraction
- Integration test: large answer stored as artifact, finalized correctly
- Integration test: checkpoint written after iteration, restored on new run
- Integration test: sandbox `store()` / `load()` round-trip through IPC
- Property test: ArtifactRef content-addressing is deterministic (same content → same ID)

Use `bun test` and the existing test patterns in `test/` directory. See `test/helpers/` for `FakeRlmModel` and sandbox test utilities.

## Constraints

- **Bun runtime** — use `Bun.file`, `bun:sqlite` if needed, no Node-only APIs
- **Effect-native** — all persistence through Effect services and layers, no bare `fs` calls
- **exactOptionalPropertyTypes** enabled in tsconfig — use conditional spread for optional fields
- **Schema-first** — all persisted types must have `Schema.TaggedClass` or `Schema.Struct` definitions
- **IPC frame limit** — sandbox IPC messages max 32MB (configurable). Artifact store bypasses this since storage happens host-side
- **Backward compatible** — existing `SUBMIT({ answer: "..." })` inline form must continue to work
