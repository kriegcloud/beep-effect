# Codex Task: Implement Run Trace Persistence for RLM (Refined)

## Readiness Status

**Status: Not implementation-ready before refinement.**

The previous draft had four blockers:

1. **Directory identity conflict**: it specified `.rlm/traces/{completionId}/` but later switched to timestamp directories.
2. **Event coverage gap**: tracing only selected `publishEvent` call sites would miss events emitted through helper paths (especially scheduler warnings).
3. **Snapshot collision risk**: `iter-NNN` filenames were not unique across recursive sub-calls.
4. **KeyValueStore path assumption**: a single `KeyValueStore.layerFileSystem` store cannot naturally model nested `vars/` keys as separate directories.

This version resolves those and is implementation-ready.

---

## Scope

### Goal

Persist per-run traces so each scheduler run can be inspected after completion/failure:

- run metadata
- event transcript (NDJSON)
- full `__vars` snapshots after each code execution
- final answer payload

### Non-goals

- No sandbox IPC changes
- No changes to `src/sandbox-worker.ts`
- No resume/checkpoint recovery in this task
- No model-facing API/tool changes

---

## Output Format

Each run writes:

```text
.rlm/traces/{completionId}/
  meta.json
  transcript.ndjson
  vars/
    call-root.depth-0.iter-001.json
    call-root.depth-0.iter-002.json
    call-root-bridge-<id>.depth-1.iter-001.json
    ...
  result.json
```

### Naming rules

- `completionId` comes from `RlmRuntime.completionId`
- variable snapshots must include **callId + depth + iteration** to prevent collisions across sub-calls
- transcript is append-only NDJSON (one event per line)

---

## Data Contracts

```ts
interface RunTraceMeta {
  readonly completionId: string
  readonly query: string
  readonly contextChars: number
  readonly contextMetadata?: ContextMetadata
  readonly model: string
  readonly maxIterations: number
  readonly maxLlmCalls: number
  readonly startedAt: string
}

interface TraceVarSnapshot {
  readonly callId: string
  readonly depth: number
  readonly iteration: number
  readonly vars: Record<string, unknown>
}
```

### Redaction/filtering

When building `vars` snapshot payloads:

- omit `context`
- omit `contextMeta`
- omit `query`
- include all other keys from `sandbox.listVariables()`

### Serialization safety

Before writing events/vars:

- use a safe JSON serialization path
- if value serialization fails, store a sentinel string like `"(serialization failed)"`
- if serialized payload exceeds threshold (e.g. `5_000_000` bytes), truncate and annotate
- snapshot failure must never fail the main scheduler loop

---

## Architecture

## New service: `RunTraceWriter`

Create `src/RunTraceWriter.ts` with a `Context.Tag` service:

```ts
export class RunTraceWriter extends Context.Tag("@recursive-llm/RunTraceWriter")<
  RunTraceWriter,
  {
    readonly writeMeta: (meta: RunTraceMeta) => Effect.Effect<void>
    readonly appendEvent: (event: RlmEvent) => Effect.Effect<void>
    readonly writeVarSnapshot: (snapshot: TraceVarSnapshot) => Effect.Effect<void>
    readonly writeResult: (payload: FinalAnswerPayload) => Effect.Effect<void>
  }
>() {}
```

Also export:

- `RunTraceWriterNoop` (all methods `Effect.void`)
- `makeRunTraceWriter` constructor from two stores (`rootStore`, `varsStore`)
- `RunTraceWriterMemory` layer (for tests)
- `RunTraceWriterBun` layer factory for CLI (file-backed)

## Store layout strategy

To preserve the `vars/` subdirectory while staying KeyValueStore-based:

- create one store for run root directory
- create one store for run `vars` directory

That means `RunTraceWriterBun(traceBaseDir)` should create:

- root store at `.rlm/traces/{completionId}`
- vars store at `.rlm/traces/{completionId}/vars`

Use `@effect/platform-bun/BunKeyValueStore.layerFileSystem` to back both stores.

---

## Scheduler Integration

## 1) Trace all events centrally

Modify `src/scheduler/Events.ts`:

- in `publishEvent`, after `PubSub.publish`, call `traceWriter.appendEvent(event)`
- catch/log trace errors (`Effect.logDebug`) and continue

Then make `publishSchedulerWarning` build `RlmEvent.SchedulerWarning(...)` and delegate to `publishEvent` so warnings are also traced.

This avoids missing events and avoids touching every callsite in `Scheduler.ts`.

## 2) Write `meta.json` at root start

In `src/Scheduler.ts`, `handleStartCall`:

- only when `command.callId === rootCallId`
- call `writeMeta` after `CallStarted` is published

## 3) Write vars snapshots after each code execution

In `handleCodeExecuted` after `vars.sync`:

- fork snapshot write in `callState.callScope` (best-effort)
- enumerate variable names from cached snapshot
- read full values via `vars.read(name)`
- filter reserved keys (`context`, `contextMeta`, `query`)
- write with `{ callId, depth, iteration, vars }`

Do not block the main loop on trace writes.

## 4) Write `result.json` on root finalize

In `handleFinalize`:

- only for `command.callId === rootCallId`
- call `writeResult(command.payload)`
- failure is logged and ignored

---

## Layer Wiring

## CLI runtime (`rlmBunLayer` path)

Tracing should be configured from CLI args and instantiated **per call**, not once globally.

Reason: per-call runtime has the authoritative `completionId`.

### Required wiring changes

1. Add CLI args:
- `noTrace?: boolean`
- `traceDir?: string` (default `.rlm/traces`)

2. Add CLI options:
- `--no-trace`
- `--trace-dir <path>`

3. Normalize options in `src/cli/Normalize.ts` and carry in `CliArgs`.

4. In `src/Rlm.ts` (`rlmBunLayer`), merge tracing into **per-call** dependencies:
- if tracing disabled: provide `RunTraceWriterNoop`
- if enabled: provide `RunTraceWriterBun(traceDir)` (depends on per-call `RlmRuntime`)

## Non-CLI / tests

For `rlmLayer` and test harnesses that do not need file traces, provide `RunTraceWriterNoop` unless explicitly testing trace behavior.

---

## Implementation Steps

## Step 1: Create `src/RunTraceWriter.ts`

Implement:

- `RunTraceMeta`, `TraceVarSnapshot`
- `RunTraceWriter` tag
- `RunTraceWriterNoop`
- `makeRunTraceWriter(rootStore, varsStore)`
- helpers:
  - safe stringify
  - payload size guard/truncation
  - deterministic snapshot filename formatter

Suggested key usage:

- root store:
  - `meta.json`
  - `transcript.ndjson`
  - `result.json`
- vars store:
  - `call-<callId>.depth-<depth>.iter-<NNN>.json`

## Step 2: Add file-backed + memory layers

In `src/RunTraceWriter.ts`:

- `RunTraceWriterMemory` from in-memory stores
- `RunTraceWriterBun(baseDir: string)`:
  - read `completionId` from `RlmRuntime`
  - build two Bun KV layers:
    - `${baseDir}/${completionId}`
    - `${baseDir}/${completionId}/vars`
  - create writer from both stores

## Step 3: Integrate into scheduler events

Modify `src/scheduler/Events.ts`:

- append trace in `publishEvent`
- route warnings through `publishEvent`

## Step 4: Integrate into `src/Scheduler.ts`

- capture `traceWriter = yield* RunTraceWriter` near other services
- root `writeMeta` in `handleStartCall`
- forked `writeVarSnapshot` in `handleCodeExecuted`
- root `writeResult` in `handleFinalize`

## Step 5: CLI options and normalization

Modify:

- `src/cli/Command.ts`: add `--no-trace`, `--trace-dir`
- `src/cli/Normalize.ts`: parse/validate/map to `CliArgs`
- `src/CliLayer.ts`: include new fields in `CliArgs`

## Step 6: Layer composition

Modify `src/Rlm.ts`:

- wire per-call tracing in `rlmBunLayer.makePerCallDeps`
- provide `RunTraceWriterNoop` in `rlmLayer` path (unless a test explicitly overrides it)

---

## Tests

## Unit

Create `test/RunTraceWriter.test.ts`:

- `writeMeta` writes parsable `meta.json`
- `appendEvent` appends multiple NDJSON lines
- `writeVarSnapshot` uses collision-safe filename format
- `writeResult` persists final payload
- noop writer methods do not fail

## Integration

Add scheduler integration tests (new file or existing scheduler suite):

- with memory trace layer, run a short code-exec flow and assert:
  - transcript has expected event types
  - at least one vars snapshot exists
  - result is written on finalize

## CLI option tests

Extend `test/CliCommand.test.ts`:

- `--no-trace` maps to `cliArgs.noTrace === true`
- `--trace-dir` maps to `cliArgs.traceDir`

---

## Validation Checklist

Run after each major step:

1. `bunx tsc --noEmit`
2. `bun test`
3. `bun test test/RunTraceWriter.test.ts`
4. manual smoke run:
   - `bun run src/cli.ts "test query" --context "x"`
   - verify `.rlm/traces/<completionId>/` contains `meta.json`, `transcript.ndjson`, `vars/`, and `result.json`

---

## Constraints (must hold)

- Do not modify `src/sandbox-worker.ts`
- Do not add IPC message types
- Never block scheduler progress on trace write failures
- Keep tracing host-side only
- Keep Bun-first tooling (`bun test`, `bunx tsc`)
