# Governance Hardening + Checkpoint Approval System

## Problem

The governance system has three gaps that block building more complex agent capabilities:

1. **Fail-open for non-tool actions.** `GovernancePortSqlite.ts:137` returns `Allow` with `"mvp_default_allow"` for anything except `InvokeTool`. Memory, schedule, and future delegation actions bypass governance entirely.

2. **RequireApproval is just Deny.** Both ToolRegistry and TurnProcessingWorkflow treat `RequireApproval` as immediate failure. No checkpoint, no queuing, no resumption path.

3. **No checkpoint persistence.** The ontology defines `Checkpoint` with `CheckpointDecision` (Approved/Rejected/Deferred) linked to tasks, but zero implementation exists.

## Goal

Close the fail-open hole, make `RequireApproval` a real durable checkpoint with human-in-the-loop approval, and replay gated actions on approval. This is the foundation for safe delegation and complex agent capabilities.

## Design Decisions

- **Approver identity:** Channel user (the userId from the active session). No separate auth system.
- **Resumption model:** Replay from checkpoint. The blocked action's full context is persisted and re-executed on approval.
- **Action scope:** Forward-looking. Seven governance actions including future delegation stubs.
- **Checkpoint is a port, not an entity.** No independent actor behavior; orchestration through ChannelCore.
- **Default-deny for unmatched actions.** Replaces the fail-open branch.

---

## 1. Expanded Action Model

`PolicyInput.action` expands from 4 to 7 values:

| Action | When evaluated | Status |
|--------|---------------|--------|
| `InvokeTool` | Before tool execution | Exists (full policy flow) |
| `ReadMemory` | Before memory retrieval | Exists (currently fail-open) |
| `WriteMemory` | Before memory write | Exists (currently fail-open) |
| `ExecuteSchedule` | Before scheduler runs a job | Exists (currently fail-open) |
| `SpawnSubAgent` | Before creating a child agent | Future stub |
| `CreateGoal` | Before creating a goal/plan/task tree | Future stub |
| `TransitionTask` | Before state transitions on tasks | Future stub |

**Default behavior change:** The fail-open branch is removed. If no policy matches an action, the default is **Deny** with reason `"no_matching_policy"`.

### Seeded Policies Per Mode

| Mode | ReadMemory | WriteMemory | ExecuteSchedule | SpawnSubAgent | CreateGoal | TransitionTask |
|------|-----------|-------------|-----------------|---------------|------------|----------------|
| Permissive | Allow | Allow | Allow | Allow | Allow | Allow |
| Standard | Allow | Allow | Allow | RequireApproval | RequireApproval | Allow |
| Restrictive | RequireApproval | RequireApproval | RequireApproval | RequireApproval | RequireApproval | RequireApproval |

Existing `InvokeTool` policies are untouched.

---

## 2. Checkpoint Lifecycle

When `evaluatePolicy` returns `RequireApproval`, the system persists a checkpoint capturing the blocked action's full context.

### CheckpointRecord

```
CheckpointRecord {
  checkpointId     CheckpointId        "ckpt:<uuid>"
  agentId          AgentId
  sessionId        SessionId
  turnId           string              the turn that was blocked
  action           GovernanceAction    which action was gated
  decision         "RequireApproval"
  policyId         PolicyId | null
  reason           string
  payload          string (JSON)       serialized action context for replay
  status           CheckpointStatus    Pending | Approved | Rejected | Deferred | Expired
  requestedAt      Instant
  decidedAt        Instant | null
  decidedBy        string | null       channel userId who decided
  expiresAt        Instant | null      optional TTL (default 24h)
}
```

### Payload by Action Type

The `payload` field captures everything needed to replay the gated action:

- **InvokeTool:** `{ toolName, inputJson, turnId, sessionId, conversationId, agentId, iteration }`
- **ReadMemory/WriteMemory:** `{ operation, memoryKey, memoryValue, turnId, sessionId }`
- **SpawnSubAgent (future):** `{ parentAgentId, childAgentConfig, taskId }`
- **CreateGoal (future):** `{ goalDefinition, planDefinition, taskDefinitions }`

Stored as opaque JSON. Each action's replay handler knows how to deserialize its own payload.

### State Machine

```
Pending → Approved → (action replayed)
Pending → Rejected → (turn.failed emitted)
Pending → Deferred → (no action; can be decided later)
Pending → Expired  → (treated as rejection)
```

- **Pending:** Awaiting human decision.
- **Approved:** Triggers replay of the gated action.
- **Rejected:** Turn fails with policy denial.
- **Deferred:** Stays queryable; can be decided later.
- **Expired:** TTL elapsed without decision; treated as rejection.

### Concurrent Decision Safety

Transition uses compare-and-swap — only transitions from `Pending`. Second caller gets `CheckpointAlreadyDecided` (409).

---

## 3. Actor Model Integration

### Current Flow (for reference)

```
HTTP Route → AdapterEntity (Cluster) → ChannelCore → SessionEntity → TurnProcessingWorkflow
                                                           │
                                                     TurnProcessingRuntime
                                                           │
                                                     ToolRegistry.runGovernedTool
```

### Checkpoint as a Port

Checkpoints don't have independent behavior — they're records with a state machine driven by external decisions. No entity needed.

- **CheckpointPort** — new port (like GovernancePort). Handles CRUD + state transitions.
- **ChannelCore** — gets `createCheckpoint` and `decideCheckpoint` methods. Orchestration layer, consistent with existing patterns.
- **Replay routes through the existing pipeline** — approved checkpoint re-enters through ChannelCore → SessionEntity → TurnProcessingRuntime, same as a normal turn.

### Creation Flow (inside existing actors)

```
SessionEntity → TurnProcessingWorkflow → ToolRegistry.runGovernedTool
                                              │
                                         evaluatePolicy → RequireApproval
                                              │
                                         checkpointPort.create(checkpoint)
                                              │
                                         emit TurnCheckpointRequiredEvent
                                              │
                                         end turn gracefully (not failure)
```

### Decision + Replay Flow

```
POST /checkpoints/:id/decide { decision: "Approved" }
     │
     ▼
ChannelCore.decideCheckpoint(checkpointId, decision, decidedBy)
     │
     ├─ checkpointPort.transition(checkpointId, "Approved", decidedBy)
     │
     ├─ deserialize checkpoint.payload → reconstruct action context
     │
     └─ route into existing pipeline:
          │
          ├─ InvokeTool → TurnProcessingRuntime.replayTool(payload)
          │     runs tool with checkpoint-authorized bypass
          │     streams TurnStreamEvents back
          │
          ├─ ReadMemory/WriteMemory → direct execution with bypass
          │
          └─ SpawnSubAgent (future) → DelegationWorkflow
```

### Checkpoint Bypass in Governance

When replaying an approved checkpoint, the action must not be re-evaluated against policy. The replay context carries the `checkpointId` as authorization:

```typescript
// In ToolRegistry.runGovernedTool:
if (context.checkpointId) {
  // Verify checkpoint is Approved
  const checkpoint = yield* checkpointPort.get(context.checkpointId)
  if (checkpoint?.status !== "Approved") {
    return yield* failWithPolicyDenied("checkpoint_not_approved")
  }
  // Skip evaluatePolicy, proceed to execution
} else {
  // Normal policy evaluation flow
}
```

---

## 4. New Stream Event

```typescript
TurnCheckpointRequiredEvent {
  type: "turn.checkpoint_required"
  sequence: number
  turnId: string
  sessionId: string
  checkpointId: string
  action: GovernanceAction
  reason: string
}
```

Clients use this to show approval UI or notify the user.

---

## 5. API Routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/checkpoints/pending` | List pending checkpoints (optional `?agentId=` filter) |
| `GET` | `/checkpoints/:checkpointId` | Get checkpoint details |
| `POST` | `/checkpoints/:checkpointId/decide` | Submit decision |

**Decide request body:**
```json
{ "decision": "Approved" | "Rejected" | "Deferred" }
```

**Decide response:**
- **Approved:** Returns SSE stream with turn events from replayed action (same pattern as `POST /channels/:id/messages`).
- **Rejected/Deferred:** Returns `{ ok: true }` JSON.

---

## 6. Migration

**`0012_governance_checkpoints_and_actions`:**

1. Create `checkpoints` table with indexes on `(status)` and `(agent_id, status)`.
2. Rebuild `permission_policies` to expand action CHECK constraint to full 7-action union.
3. Seed 18 new policies (6 actions x 3 modes) per the table in Section 1.

---

## 7. Edge Cases

**Checkpoint expiry:** Default 24h TTL. Expired checkpoints treated as rejected on read. No background reaper — check `expiresAt` on access.

**Replay failure:** If the approved action fails (network error, tool timeout), the SSE stream carries `turn.failed`. Checkpoint stays `Approved` — the decision was made; execution just failed. User can re-send.

**Multiple checkpoints per turn:** A turn could hit RequireApproval multiple times (tool A, then tool B). Each creates a separate checkpoint. Each is approved/rejected independently.

**Non-tool actions at workflow level:** When TurnProcessingWorkflow evaluates policy for ReadMemory/WriteMemory at the turn level, RequireApproval creates a checkpoint and ends the turn. Replay re-runs the entire turn with a checkpoint bypass.

**WebSocket channels:** The decide endpoint returns SSE regardless of channel type. WebSocket channels can optionally be notified if the connection is still live, but the SSE response is the reliable path.

---

## 8. Testing Strategy

| Test | Validates |
|------|-----------|
| CheckpointPort CRUD | Create, get, transition, expiry, concurrent decide error |
| Policy evaluation for new actions | Each action matches correct policy per mode |
| Default-deny | Unknown action with no policy → Deny |
| ToolRegistry checkpoint creation | RequireApproval → checkpoint + event, not failure |
| Workflow checkpoint | Non-tool RequireApproval → checkpoint + graceful end |
| Checkpoint replay | Approved → tool re-executes with bypass, streams events |
| Checkpoint rejection | Rejected → turn.failed emitted |
| Checkpoint expiry | Expired → treated as rejection on decide |
| Existing tests pass | All 268 current tests unaffected |

---

## Files Summary

| File | Action |
|------|--------|
| `packages/domain/src/ids.ts` | Add CheckpointId |
| `packages/domain/src/status.ts` | Add GovernanceAction union, CheckpointStatus |
| `packages/domain/src/ports.ts` | Add CheckpointRecord, CheckpointPort |
| `packages/domain/src/errors.ts` | Add CheckpointAlreadyDecided, CheckpointNotFound, CheckpointExpired |
| `packages/domain/src/events.ts` | Add TurnCheckpointRequiredEvent |
| `packages/server/src/persistence/DomainMigrator.ts` | Migration 0012 |
| `packages/server/src/CheckpointPortSqlite.ts` | New — implements CheckpointPort |
| `packages/server/src/PortTags.ts` | Add CheckpointPortTag |
| `packages/server/src/ChannelCore.ts` | Add createCheckpoint, decideCheckpoint |
| `packages/server/src/ai/ToolRegistry.ts` | Checkpoint creation on RequireApproval, bypass on replay |
| `packages/server/src/turn/TurnProcessingWorkflow.ts` | Checkpoint creation for non-tool RequireApproval |
| `packages/server/src/persistence/GovernancePortSqlite.ts` | Remove fail-open, support expanded actions |
| `packages/server/src/gateway/CheckpointRoutes.ts` | New — pending list, get, decide |
| `packages/server/src/server.ts` | Wire new layers |
| `packages/server/src/entities/AdapterProtocol.ts` | Add checkpoint RPCs if needed |
