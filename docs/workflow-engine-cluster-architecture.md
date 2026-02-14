# Workflow Engine and Cluster Architecture - Deep Dive

Status: Draft

## Purpose
Document how `@effect/workflow` executes workflows and how `@effect/cluster`
implements a durable, distributed `WorkflowEngine`. This is the reference
spec for building a Bun-first engine or integrating with the cluster runtime.

## Source References
- `.reference/effect/packages/workflow/src/Workflow.ts`
- `.reference/effect/packages/workflow/src/WorkflowEngine.ts`
- `.reference/effect/packages/workflow/src/Activity.ts`
- `.reference/effect/packages/workflow/src/DurableDeferred.ts`
- `.reference/effect/packages/workflow/src/DurableClock.ts`
- `.reference/effect/packages/cluster/src/ClusterWorkflowEngine.ts`
- `.reference/effect/packages/cluster/src/Sharding.ts`
- `.reference/effect/packages/cluster/src/MessageStorage.ts`
- `.reference/effect/packages/cluster/src/RunnerStorage.ts`

## Core Services and Data Types
### Workflow
- `Workflow.make` defines a deterministic workflow with:
  - Payload schema
  - Success schema
  - Error schema
  - Annotations (Context)
- `Workflow.execute` delegates to `WorkflowEngine.execute`.
- `Workflow.poll`, `Workflow.interrupt`, `Workflow.resume` delegate to the engine.

### WorkflowEngine
The `WorkflowEngine` service provides the execution runtime:
- `register(workflow, execute)` registers a workflow definition + handler.
- `execute(workflow, options)` runs a registered workflow.
- `poll(workflow, executionId)` returns the latest `Workflow.Result` if any.
- `interrupt(workflow, executionId)` interrupts a workflow execution.
- `resume(workflow, executionId)` resumes a suspended workflow execution.
- `activityExecute(activity, attempt)` runs or replays a workflow activity.
- `deferredResult(deferred)` retrieves a durable deferred exit (if completed).
- `deferredDone(deferred, options)` sets deferred results and resumes workflows.
- `scheduleClock(workflow, options)` schedules a durable clock wake up.

### WorkflowInstance
`WorkflowInstance` is the per-execution state:
- `executionId`, `workflow`, `scope`
- `suspended`, `interrupted`
- `cause` when suspension on failure is used
- `activityState` with `count` and `latch`

### Workflow.Result
Result of running a workflow or activity:
- `Complete` with `Exit` (success or error)
- `Suspended` to indicate pause points (waiting for deferred or clock)

### Activity
Activities wrap non-deterministic effects:
- Activity results are persisted and replayed on workflow restarts.
- Activities are keyed by name and attempt number.

### DurableDeferred and DurableClock
Durable wait primitives:
- `DurableDeferred` blocks until an external signal is recorded.
- `DurableClock.sleep` schedules a wake up without consuming resources.

## Architecture Overview

ASCII flow for a distributed engine:

  [Workflow] -> [WorkflowEngine] -> [ClusterWorkflowEngine.makeUnsafe]
                        |                    |
                        v                    v
                  [Sharding] -----------> [MessageStorage]
                        |                    |
                        v                    v
                   [Entities] <---------- [Replies]
                        |
                        v
               [Workflow Runtime + Activities]

Supporting services:
- `RunnerStorage` manages runner registration and shard locks.
- `Sharding` routes messages to the runner that owns a shard.
- `MessageStorage` persists requests, replies, and dedupe state.

### Shard Assignment Diagram

  Entities (workflow executions) -> hash -> shard -> runner

  Entity: ("MultiAgentReview", executionId = "exec-123")
               |
               v
        Hash + ShardGroup
               |
               v
          ShardId = 17
               |
               v
     Runner A owns shard 0..31
     Runner B owns shard 32..63
     Runner C owns shard 64..95

  Result: entity routes to Runner A (shard 17)

### Mailbox / Message Flow Diagram

  Client call
     |
     v
  [MessageStorage.saveRequest]
     |
     v
  [Sharding.pollStorage] -> unprocessed messages for shard 17
     |
     v
  [Runner A] -> [Entity Handler] -> [MessageStorage.saveReply]
     |
     v
  Client poll -> [MessageStorage.repliesForUnfiltered]

### Concrete Example (Workflow + Review Gate)

Workflow: `MultiAgentReview` with payload `{ task: "draft homepage" }`.

1) **Execution id**
   - `idempotencyKey(payload) = "draft homepage"`
   - `executionId = hash("MultiAgentReview-draft homepage")`
   - `ShardId = hash(executionId) % shardCount`

2) **Run request persisted**
   - `tag = "run"`, `id = ""`
   - `MessageStorage.requestIdForPrimaryKey({ address, tag, id })`
   - If no prior request id, `saveRequest` persists a new request.

3) **Shard routing**
   - Sharding maps the entity to a shard.
   - Runner A owns that shard and receives the request.

4) **Activity execution**
   - Workflow hits `DraftAgent` activity.
   - Activity primary key: `activityPrimaryKey("DraftAgent", attempt=1)`
   - `MessageStorage.requestIdForPrimaryKey({ tag: "activity", id })`
   - If already present, the result is replayed; otherwise the activity runs
     (Agent SDK call) and saves a reply.

5) **Review gate (suspend)**
   - Workflow calls `DurableDeferred.await(ReviewGate)`.
   - Engine checks `deferredResult` and finds no exit → workflow suspends.
   - A `Suspended` reply is persisted for the original `run` request.

6) **External review (resume)**
   - Reviewer submits approval using `DurableDeferred.succeed(ReviewGate, { token, value })`.
   - Engine persists the deferred exit and triggers `resume`.
   - `sharding.reset(requestId)` + `pollStorage` re-delivers the run request.

7) **Resume on current owner**
   - If shard ownership changed, Runner B may now own the shard.
   - Runner B replays deterministic workflow steps, reuses stored activity
     results, and finishes with `Complete`.

8) **Client sees final result**
   - `poll` reads the `Complete` reply and decodes the success value.

## How Workflow Interacts with Cluster

### 1) Register
`Workflow.toLayer` calls `WorkflowEngine.register`. In cluster:
- A workflow is mapped to an `Entity` with RPC endpoints:
  - `run` (execute workflow)
  - `activity` (execute activity)
  - `deferred` (complete deferred)
  - `resume` (resume a suspended workflow)
- `Sharding.registerEntity` registers handlers for those RPCs.

### 2) Execute
`Workflow.execute` -> `WorkflowEngine.execute`:
- Cluster engine builds an RPC request to the workflow `Entity`.
- The request is persisted in `MessageStorage`.
- `Sharding` assigns the request to a runner and delivers it.
- Workflow runtime executes deterministically, using activities for IO.
- Result is persisted as a reply (`Complete` or `Suspended`).

Suspended workflows:
- `WorkflowEngine.execute` in `makeUnsafe` retries based on
  `suspendedRetrySchedule` until a `Complete` result is observed.
- `ClusterWorkflowEngine` uses `sharding.reset` and `pollStorage` to resume
  suspended executions when a deferred or clock completes.

### 3) Poll
`Workflow.poll` -> `WorkflowEngine.poll`:
- Cluster engine queries `MessageStorage.repliesForUnfiltered` by request id.
- If a `WithExit` reply exists, it returns the decoded result.

### 4) Activities
`Activity.make` inside workflow:
- `WorkflowEngine.activityExecute` is called with an activity + attempt.
- Cluster engine routes to the workflow entity RPC `activity`.
- Primary key is the activity name + attempt to guarantee idempotency.
- Result is persisted and replayed on workflow re-execution.

### 5) DurableDeferred
`DurableDeferred.await` uses `deferredResult`:
- `deferredResult` checks durable storage for the completion exit.
`DurableDeferred.done` uses `deferredDone`:
- Cluster engine persists the exit, then issues `resume` to the workflow.

### 6) DurableClock
`DurableClock.sleep` uses `scheduleClock`:
- Cluster engine stores a wake up timestamp (deliverAt).
- A clock entity triggers `resume` on the workflow when time elapses.

### 7) Interrupt and Resume
`Workflow.interrupt` and `Workflow.resume` delegate to the engine:
- Cluster engine sends RPC messages to trigger interrupt or resume.
- `makeUnsafe` links interruption between parent and child workflows.

## WorkflowEngine.makeUnsafe Contract

`makeUnsafe` expects an encoded engine with explicit responsibilities:

Required operations:
- `register(workflow, execute)` stores the workflow and its executor.
- `execute(workflow, options)` runs or resumes execution.
  - Must return `Workflow.Result` (`Complete` or `Suspended`).
  - Must support `discard` runs (fire-and-forget).
  - Must accept `parent` for nested workflows.
- `poll(workflow, executionId)` returns last known result, if any.
- `interrupt(workflow, executionId)` interrupts a running workflow.
- `resume(workflow, executionId)` restarts a suspended workflow.
- `activityExecute(activity, attempt)` runs or replays activity results.
- `deferredResult(deferred)` returns durable deferred exit if present.
- `deferredDone(options)` persists deferred exit and resumes waiters.
- `scheduleClock(workflow, options)` persists wake ups for clocks.

`makeUnsafe` adds the following semantics on top:
- Merges the workflow registration context into runtime execution.
- Encodes and decodes activity and deferred exits using Schema.
- Links child workflow interruption to parent workflow scope.
- Retries suspended workflows using a default exponential schedule.

## ClusterWorkflowEngine Mapping

`ClusterWorkflowEngine` implements the encoded engine using cluster services:
- `MessageStorage` provides:
  - Request persistence and dedupe
  - Reply persistence and lookup
  - Request id lookup from primary keys
  - Unprocessed message polling
- `Sharding` provides:
  - Entity registration and routing
  - Delivery and mailbox management
  - Reset and poll hooks for resuming workflows
- `RunnerStorage` provides:
  - Runner liveness and shard ownership
  - Shard lock acquisition and refresh

Key implementation details:
- Each workflow name maps to a cluster entity type.
- Activity requests are keyed by `activityPrimaryKey(name, attempt)`.
- Deferred completion uses RPC `deferred`, then triggers `resume`.
- Durable clocks use a special clock entity with `deliverAt` scheduling.
- Requests and replies are tagged to enable idempotent replay.

## Implementing a Custom Engine (Bun-first)

If we build a Bun-native engine using `makeUnsafe`, it must provide:

1) Storage model
- Persistent storage for:
  - Requests and replies (workflow + activity)
  - Deferred results
  - Clock schedules
- Primary key based idempotency (execution id + tag + id).
- Ability to look up replies by request id and primary key.

2) Execution lifecycle
- One active execution per `executionId`.
- Re-entrant execution to support replays.
- Ability to resume a suspended workflow (triggered by deferred or clock).

3) Activity replay and attempt handling
- Store activity results keyed by name + attempt.
- Reuse results for deterministic replays.
- Support `reset` of activity requests (cluster does this on retry).

4) Durable waits
- Deferred: store exit and resume waiting workflows.
- Clock: schedule wake up and resume workflow on delivery.

5) Concurrency and cancellation
- Clear mapping between workflow fibers and execution ids.
- Interrupt must stop running executions and cancel in-flight activities.
- Resume must rehydrate state without double-running activities.

6) Transport and routing
- In-process engine: direct execution, no RPC layer.
- Multi-process engine: requires routing, mailbox, and dedupe handling.
- If distributed, include runner registration and shard assignment.

## Agent SDK Integration Notes
- `AgentSdk.query` must run inside `Activity` to preserve determinism.
- Streaming output should be externalized (EventLog or DurableQueue).
- Long-running agent sessions align with deferred and clock semantics.

## Example: Multi-Branch Workflow With Shared Filesystem

Goal: coordinate a "multi-branch" workflow (fan-out + fan-in) that reads and
writes a shared workspace on disk. All file IO happens inside `Activity`
to remain deterministic on replay.

### Flow

  [Workflow.execute]
        |
        v
  [AcquireWorkspaceLock Activity] ----> [DurableDeferred wait if busy]
        |
        v
  [ReadInputs Activity] ---> [Branch A Activity] \
                             [Branch B Activity]  -> [Aggregate Activity]
                             [Branch C Activity] /
        |
        v
  [WriteOutputs Activity]
        |
        v
  [ReleaseWorkspaceLock Activity]

### Determinism Rules Applied
- Workflow control flow (branching, retries, ordering) is deterministic.
- All filesystem operations are moved into activities.
- Lock acquisition uses a durable token so a replay does not double-lock.

### Sketch (Workflow + Activities)

```ts
import * as Activity from "@effect/workflow/Activity"
import * as DurableDeferred from "@effect/workflow/DurableDeferred"
import * as Workflow from "@effect/workflow/Workflow"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const Payload = {
  workspacePath: Schema.String,
  requestId: Schema.String
}

const WorkspaceLock = DurableDeferred.make("WorkspaceLock", {
  success: Schema.Void,
  error: Schema.String
})

const acquireLock = (workspacePath: string, requestId: string) =>
  Activity.make({
    name: "AcquireWorkspaceLock",
    success: Schema.Struct({ acquired: Schema.Boolean }),
    error: Schema.String,
    execute: Effect.sync(() => {
      // file lock logic goes here (Activity -> IO)
      return { acquired: true }
    })
  })

const notifyLockManager = (workspacePath: string, token: string) =>
  Activity.make({
    name: "NotifyLockManager",
    success: Schema.Void,
    error: Schema.String,
    execute: Effect.sync(() => {
      // send token to lock manager so it can call DurableDeferred.succeed
    })
  })

const readInputs = (workspacePath: string) =>
  Activity.make({
    name: "ReadInputs",
    success: Schema.Struct({ files: Schema.Array(Schema.String) }),
    error: Schema.String,
    execute: Effect.sync(() => {
      // read files from disk
      return { files: [] }
    })
  })

const runBranch = (name: string, files: Array<string>) =>
  Activity.make({
    name,
    success: Schema.Struct({ result: Schema.String }),
    error: Schema.String,
    execute: Effect.sync(() => ({ result: `${name}-ok` }))
  })

const aggregate = (results: Array<string>) =>
  Activity.make({
    name: "Aggregate",
    success: Schema.Struct({ summary: Schema.String }),
    error: Schema.String,
    execute: Effect.sync(() => ({ summary: results.join(",") }))
  })

const writeOutputs = (workspacePath: string, summary: string) =>
  Activity.make({
    name: "WriteOutputs",
    success: Schema.Void,
    error: Schema.String,
    execute: Effect.sync(() => {
      // write to disk
    })
  })

export const WorkspaceWorkflow = Workflow.make({
  name: "WorkspaceWorkflow",
  payload: Payload,
  idempotencyKey: ({ requestId }) => requestId,
  success: Schema.Struct({ summary: Schema.String }),
  error: Schema.String
})(({ workspacePath, requestId }) =>
  Effect.gen(function*() {
    const token = yield* DurableDeferred.token(WorkspaceLock)
    const { acquired } = yield* acquireLock(workspacePath, requestId)
    if (!acquired) {
      yield* notifyLockManager(workspacePath, token)
      yield* DurableDeferred.await(WorkspaceLock)
    }

    const { files } = yield* readInputs(workspacePath)

    // Fan-out branches (deterministic order, parallel runtime).
    const results = yield* Effect.all(
      [
        runBranch("BranchA", files),
        runBranch("BranchB", files),
        runBranch("BranchC", files)
      ],
      { concurrency: 3 }
    )

    const { summary } = yield* aggregate(results.map((result) => result.result))

    yield* writeOutputs(workspacePath, summary)
    return { summary }
  })
)
```

### Notes
- `Effect.all` is deterministic when the inputs and ordering are stable.
- Activities are replayed by the engine, not re-run, if results are persisted.
- Locking can use a durable token (`DurableDeferred.token`) to release and resume.
- For streaming outputs, emit to a `DurableQueue` or `EventLog` from the branch
  activities rather than returning streams from the workflow itself.

## Example: Multi-Agent Review Pipeline (Human-in-the-loop)

Goal: coordinate multiple agents where each agent consumes the previous agent's
output, and a reviewer validates before finalization. This example uses the
Effect-based Claude Agent SDK wrapper and a durable review gate.

### Flow

  [Workflow.execute]
        |
        v
  [Agent A Activity] -> [Agent B Activity] -> [Notify Reviewer Activity]
        |
        v
  [DurableDeferred.await ReviewGate]
        |
        v
  [If approved] -> [Finalize Agent Activity]
        |
        v
  [Return summary]

### Sketch (Workflow + Agent Activities)

```ts
import { AgentRuntime, type SDKMessage } from "effect-claude-agent-sdk"
import * as Activity from "@effect/workflow/Activity"
import * as DurableDeferred from "@effect/workflow/DurableDeferred"
import * as Workflow from "@effect/workflow/Workflow"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"

const Payload = {
  task: Schema.String
}

const ReviewGate = DurableDeferred.make("ReviewGate", {
  success: Schema.Struct({
    approved: Schema.Boolean,
    notes: Schema.String
  }),
  error: Schema.String
})

const AgentResult = Schema.Struct({
  text: Schema.String
})

const collectResult = (stream: Stream.Stream<SDKMessage, unknown>) =>
  Stream.runCollect(stream).pipe(
    Effect.flatMap((messages) => {
      const result = Array.from(messages).find(
        (message) =>
          message.type === "result" &&
          message.subtype === "success"
      )
      if (!result || result.type !== "result" || result.subtype !== "success") {
        return Effect.fail("Missing result message")
      }
      return Effect.succeed(result.result)
    })
  )

const runAgent = (name: string, prompt: string) =>
  Activity.make({
    name,
    success: AgentResult,
    error: Schema.String,
    execute: Effect.gen(function*() {
      const runtime = yield* AgentRuntime
      const text = yield* collectResult(runtime.stream(prompt)).pipe(
        Effect.mapError((error) => String(error))
      )
      return { text }
    })
  })

const notifyReviewer = (draft: string, token: string) =>
  Activity.make({
    name: "NotifyReviewer",
    success: Schema.Void,
    error: Schema.String,
    execute: Effect.sync(() => {
      // send draft + token to a review UI or queue
    })
  })

const finalize = (refined: string, notes: string) =>
  runAgent(
    "FinalizeAgent",
    `Finalize with review notes:\n${notes}\n\nDraft:\n${refined}`
  )

export const MultiAgentReview = Workflow.make({
  name: "MultiAgentReview",
  payload: Payload,
  idempotencyKey: ({ task }) => task,
  success: AgentResult,
  error: Schema.String
})(({ task }) =>
  Effect.gen(function*() {
    const draft = yield* runAgent("DraftAgent", `Draft a response:\n${task}`)
    const refined = yield* runAgent("RefineAgent", `Improve this:\n${draft.text}`)
    const token = yield* DurableDeferred.token(ReviewGate)
    yield* notifyReviewer(refined.text, token)
    const review = yield* DurableDeferred.await(ReviewGate)

    if (!review.approved) {
      return { text: `Rejected: ${review.notes}` }
    }

    return yield* finalize(refined.text, review.notes)
  })
)

export const submitReview = (token: string, approved: boolean, notes: string) =>
  DurableDeferred.succeed(ReviewGate, {
    token,
    value: { approved, notes }
  })
```

### Runtime Wiring Notes
- Provide `AgentRuntime.layerDefaultFromEnv` (or custom config) so activities can call the SDK.
- Provide a `WorkflowEngine` layer (memory, cluster, or custom engine).
- `submitReview` should run in an API handler or worker that has access to the same `WorkflowEngine`.

### Why Activities Here?
- Each agent call is non-deterministic and must be executed as an `Activity`.
- The workflow only coordinates the sequence and decision logic.
- On replay, the engine reuses recorded activity results instead of rerunning.
- The review gate is durable and resumes the workflow when the reviewer submits.

## Concept Map: Workflow vs Activity vs Engine vs Shards

- **Workflow**: deterministic orchestration (control flow, branching, retries).
- **Activity**: non-deterministic IO (Agent SDK calls, filesystem, HTTP, DB).
- **WorkflowEngine**: runtime that executes workflows and persists results.
- **Cluster/Shards**: distributed routing and persistence for durable execution.
- **Resources**:
  - Workflow resources are "logical" and deterministic (data flow).
  - Activity resources are real-world (files, network, SDK calls).
  - Engines and shards manage durability and delivery, not business logic.

## Open Questions
- Bun compatibility with `@effect/cluster` runtime dependencies.
- Preferred storage for a Bun-native engine (SQLite vs Postgres).
- Whether to expose a "workflow worker" process separate from API services.
