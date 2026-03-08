# Governance Hardening + Checkpoint Approval Implementation Plan (Remediated)

**Goal:** Close governance fail-open behavior, expand policy actions beyond `InvokeTool`, and implement durable checkpoint-based human-in-the-loop approval with correct replay semantics.

**Architecture:**
- `CheckpointPort` is a persistence port (not an entity).
- Governance policy evaluation supports 7 action types with default-deny.
- Checkpoints are created on `RequireApproval`.
- Two replay paths:
  - Turn-level replay for non-tool actions (`ReadMemory` gate in workflow).
  - Tool-level replay for `InvokeTool` approvals.
- Orchestration through `ChannelCore` + `CheckpointRoutes`.

**Tech Stack:** Effect (Schema, ServiceMap, Workflow, Activity), SQLite, Vitest

---

## Binding Decisions

1. **Replay creates a new `turnId`.**
   - Approved replay is a new execution, not a resume of the original turn id.
   - This avoids collisions with turn/workflow idempotency and old tool invocation idempotency keys.

2. **Checkpoint bypass is payload-bound.**
   - Bypass must verify `payloadHash` before execution.
   - Hash input:
     - Tool checkpoints: `"InvokeTool:${toolName}:${inputJson}"`
     - Non-tool checkpoints: `"ReadMemory::"` (action-only, because no tool payload).

3. **Checkpoint lifecycle is strict.**
   - States: `Pending | Approved | Rejected | Deferred | Expired | Consumed`.
   - `Pending -> Approved|Rejected|Deferred`
   - `Approved -> Consumed` only after replay completes successfully.
   - Replay failure leaves checkpoint in `Approved` for retry.

4. **Expired checkpoints cannot be approved.**
   - Transition logic must reject approval on expired checkpoints with `CheckpointExpired`.

5. **Streaming compatibility is preserved.**
   - When checkpoint is required, server emits:
     - `turn.checkpoint_required`
     - then terminal `turn.completed` with `accepted: false` and `auditReasonCode: "turn_processing_checkpoint_required"`.

---

## Task 1: Domain Contract Updates

**Files:**
- `packages/domain/src/ids.ts`
- `packages/domain/src/status.ts`
- `packages/domain/src/errors.ts`
- `packages/domain/src/events.ts`
- `packages/domain/src/ports.ts`

### 1a. IDs
- Add `CheckpointId` brand.

### 1b. Status Enums
- Add `GovernanceAction`:
  - `InvokeTool`, `ReadMemory`, `WriteMemory`, `ExecuteSchedule`, `SpawnSubAgent`, `CreateGoal`, `TransitionTask`
- Add `CheckpointStatus`:
  - `Pending`, `Approved`, `Rejected`, `Deferred`, `Expired`, `Consumed`

### 1c. Errors
- Add:
  - `CheckpointNotFound`
  - `CheckpointAlreadyDecided`
  - `CheckpointExpired`
  - `CheckpointNotApproved`
  - `CheckpointPayloadMismatch`

### 1d. Stream Event
- Add `TurnCheckpointRequiredEvent`.
- Include it in `TurnStreamEvent` union.

### 1e. Port Type Expansion
- Change `PolicyInput.action` to `GovernanceAction`.
- Change `PermissionPolicyRecord.action` to `GovernanceAction`.

### 1f. Checkpoint Port Contract
Add `CheckpointRecord` and `CheckpointPort`:
- `CheckpointRecord` fields:
  - `checkpointId`, `agentId`, `sessionId`, `channelId`, `turnId`, `action`, `policyId`, `reason`
  - `payloadJson`, `payloadHash`, `status`, `requestedAt`, `decidedAt`, `decidedBy`, `expiresAt`
- `CheckpointPort` methods:
  - `create(record)`
  - `get(checkpointId)`
  - `transition(checkpointId, toStatus, decidedBy, decidedAt)` returning errors:
    - `CheckpointNotFound | CheckpointAlreadyDecided | CheckpointExpired`
  - `listPending(agentId?)`

**Verify:** `cd packages/domain && bun run check`

---

## Task 2: Turn Payload + Result + SessionEntity Contract

**Files:**
- `packages/server/src/turn/TurnProcessingWorkflow.ts`
- `packages/server/src/entities/SessionEntity.ts`

### 2a. Audit Reason Literal
- Add `turn_processing_checkpoint_required` to `TurnAuditReasonCode` literals.

### 2b. `ProcessTurnPayload`
- Add required `channelId: string`.
- Add optional `checkpointId?: string`.

### 2c. `ProcessTurnResult`
- Add optional fields:
  - `checkpointId?: string`
  - `checkpointAction?: string`
  - `checkpointReason?: string`

### 2d. Session RPC Schema
- Add `channelId` and `checkpointId` to `ProcessTurnPayloadFields` in `SessionEntity` RPC schema.
- This prevents sharded session path from dropping checkpoint context.

**Verify:** `cd packages/server && bun run check`

---

## Task 3: Migration `0012_governance_checkpoints_and_actions`

**File:**
- `packages/server/src/persistence/DomainMigrator.ts`

### 3a. Create `checkpoints` table
Columns:
- `checkpoint_id` (PK), `agent_id`, `session_id`, `channel_id`, `turn_id`, `action`, `policy_id`
- `reason`, `payload_json`, `payload_hash`
- `status` with CHECK for all 6 statuses
- `requested_at`, `decided_at`, `decided_by`, `expires_at`

Indexes:
- `idx_checkpoints_status`
- `idx_checkpoints_agent_status`

### 3b. Rebuild `permission_policies` action CHECK (fail-fast)
- Rename old table to backup.
- Create new table with expanded action CHECK.
- Copy rows from backup.
- Drop backup.
- Recreate `permission_policies_mode_idx`.
- Do **not** wrap rebuild in blanket `catch(() => Effect.void)`.

### 3c. Seed new policies
- Add policies for new actions/modes using `INSERT OR IGNORE`.

### 3d. Migration Quality Constraints
- No unused locals in migration code (strict `noUnusedLocals`).
- Any failure aborts migration.

**Verify:** `cd packages/server && bun run check`

---

## Task 4: CheckpointPortSqlite + PortTag + Wiring

**Files:**
- Create `packages/server/src/CheckpointPortSqlite.ts`
- Modify `packages/server/src/PortTags.ts`
- Modify `packages/server/src/server.ts`

### 4a. Implement `CheckpointPortSqlite`
Operations:
- `create`: insert full record.
- `get`: fetch by id; lazily mark pending expired checkpoints as `Expired` when past `expires_at`.
- `transition` CAS semantics:
  - `Pending -> Approved|Rejected|Deferred`
  - `Approved -> Consumed`
  - reject expired approval attempts with `CheckpointExpired`.
- `listPending`: pending only, excluding expired.

### 4b. Tag Pattern
- Use repo-consistent pattern:
  - `export const CheckpointPortTag = ServiceMap.Service<CheckpointPort>("server/ports/CheckpointPort")`

### 4c. Server Layer Wiring
- Add `CheckpointPortSqlite.layer`.
- Provide it via `CheckpointPortTag`.

**Verify:** `cd packages/server && bun run check`

---

## Task 5: Governance Hardening (All Actions, Default-Deny)

**Files:**
- `packages/server/src/GovernancePortSqlite.ts`
- `packages/server/src/GovernancePortMemory.ts`
- `packages/server/src/gateway/GovernanceRoutes.ts`

### 5a. `GovernancePortSqlite`
- Expand `PolicyRow.action` to `GovernanceAction`.
- Parameterize policy queries by action.
- `evaluatePolicy` behavior:
  - Shared mode resolution.
  - `InvokeTool`: existing tool definition + selector matching path.
  - Non-tool actions: action-specific policy matching (typically `AllTools` selector).
  - No-match => `Deny` (`reason: "no_matching_policy"`).
- Remove all fail-open non-tool branches.
- Update `listPoliciesForAgent` to return all action types (not only `InvokeTool`).

### 5b. `GovernancePortMemory`
- Remove global fail-open behavior in tests.
- Add action-aware override map for deterministic test setup.
- Default to deny when no override/policy exists.

### 5c. `GovernanceRoutes`
- Expand action query validation to all `GovernanceAction` literals.

**Verify:** `cd packages/server && bun run check && bun run test -- GovernancePort`

---

## Task 6: ToolRegistry Checkpoint Flow (Correct Signal + Bypass)

**File:**
- `packages/server/src/ai/ToolRegistry.ts`

### 6a. Add shared checkpoint signal model
- Define `CheckpointSignal` type.
- Use a `Ref<ReadonlyArray<CheckpointSignal>>` created once per turn loop (not per iteration toolkit).

### 6b. Extend `ToolExecutionContext`
Add fields:
- `channelId: string`
- `checkpointId?: string`
- `userId?: string`
- `content?: string`

### 6c. RequireApproval path
On `RequireApproval`:
- Compute canonical tool `inputJson` + `payloadHash`.
- Create `Pending` checkpoint with replay payload context.
- Append checkpoint signal into shared ref.
- Keep existing invocation/audit recording (`decision: RequireApproval`).

### 6d. Approved bypass path
- If `context.checkpointId` is set:
  - Load checkpoint.
  - Require `status === Approved`.
  - Verify payload hash matches current action/tool/input.
  - On mismatch fail with `CheckpointPayloadMismatch`.
  - Bypass policy evaluation and idempotency replay path for that tool execution.

### 6e. Hash Helper
- Add helper for payload hash generation using SHA-256 and deterministic input string.

### 6f. Dependencies
- Add `CheckpointPortTag` dependency to `ToolRegistry.layer`.

**Verify:** `cd packages/server && bun run check`

---

## Task 7: Workflow-Level Checkpointing + Non-Tool Bypass

**File:**
- `packages/server/src/turn/TurnProcessingWorkflow.ts`

### 7a. ReadMemory governance gate
- Keep existing upfront `ReadMemory` policy check.
- If decision is `RequireApproval`:
  - If `payload.checkpointId` exists, validate approved checkpoint action/hash and bypass gate.
  - Else create `Pending` checkpoint and return non-accepted result with checkpoint fields.

### 7b. Tool-loop signal drain
- `processWithToolLoop` must receive a single shared signal ref for whole turn.
- After loop completes, read signals.
- If signal(s) exist, return result with checkpoint fields and `accepted: false`.

### 7c. Audit reason
- Use `turn_processing_checkpoint_required` when returning checkpoint-required result.

### 7d. Dependencies
- Add `CheckpointPortTag` to workflow layer requirements.

**Verify:** `cd packages/server && bun run check`

---

## Task 8: Runtime Event Mapping (Backward Compatible)

**File:**
- `packages/server/src/turn/TurnProcessingRuntime.ts`

### 8a. Event emission rule
When `result.checkpointId` exists:
- Emit normal iteration/content events.
- Emit `turn.checkpoint_required`.
- Emit terminal `turn.completed` with:
  - `accepted: false`
  - `auditReasonCode: "turn_processing_checkpoint_required"`.

### 8b. Sequence numbering
- Keep current sequence assignment scheme consistent.

**Verify:** `cd packages/server && bun run check`

---

## Task 9: ChannelCore + CheckpointRoutes + Replay Orchestration

**Files:**
- `packages/server/src/ChannelCore.ts`
- Create `packages/server/src/gateway/CheckpointRoutes.ts`
- `packages/server/src/server.ts`
- `packages/server/src/turn/TurnProcessingRuntime.ts` (if adding tool replay entrypoint)

### 9a. `ChannelCore` methods
Add methods:
- `listPendingCheckpoints(agentId?)`
- `getCheckpoint(checkpointId)`
- `decideCheckpoint({ checkpointId, decision, decidedBy })`

### 9b. Decision flow
- Rejected/Deferred:
  - `Pending -> Rejected|Deferred`, return `{ ok: true }`.
- Approved:
  - Transition `Pending -> Approved` (with expiry-aware transition).
  - Load checkpoint and replay payload.
  - Replay by action:
    - `InvokeTool`: call tool-level replay path.
    - Non-tool: build new turn payload with new `turnId`, same session/conversation, `checkpointId` set.

### 9c. Consumed transition semantics (must be success-only)
- Transition `Approved -> Consumed` **only after replay stream completes successfully**.
- Replay stream failure leaves checkpoint `Approved`.
- Do not use unconditional stream finalizer for consume transition.

### 9d. Routes
`CheckpointRoutes`:
- `GET /checkpoints/pending?agentId=...`
- `GET /checkpoints/:checkpointId`
- `POST /checkpoints/:checkpointId/decide`
  - approved => SSE stream
  - rejected/deferred => JSON `{ ok: true }`

Map errors:
- `CheckpointNotFound` => 404
- `CheckpointAlreadyDecided` => 409
- `CheckpointExpired` => 410

### 9e. Server wiring
- Add route layer merge.
- Provide `CheckpointPortTag` to `ChannelCore`, workflow, and tool registry.

**Verify:** `cd packages/server && bun run check`

---

## Task 10: Client Compatibility Updates

**Files:**
- `packages/tui/src/types.ts`
- `packages/tui/src/hooks/useSendMessage.ts`
- `packages/cli/src/Cli.ts`

### 10a. TUI types
- Extend `ChatMessage.status` with `"checkpoint_required"`.
- Add optional `checkpointId?: string` to `ChatMessage`.

### 10b. TUI stream handler
- Add `turn.checkpoint_required` case.
- Preserve terminal handling on `turn.completed`.

### 10c. CLI stream handler
- Add `turn.checkpoint_required` case.

**Verify:**
- `cd packages/tui && bun run check`
- `cd packages/cli && bun run check`

---

## Task 11: Tests

**Files:**
- Create `packages/server/test/CheckpointPortSqlite.test.ts`
- Modify `packages/server/test/GovernancePortSqlite.test.ts`
- Modify `packages/server/test/ToolRegistry.test.ts`
- Modify `packages/server/test/TurnProcessingWorkflow.e2e.test.ts`
- Add replay/route tests for checkpoint decision flow

### 11a. Checkpoint port tests
- Create/get roundtrip
- pending list filtering
- expiry behavior
- state transitions and CAS errors
- expired approval rejection

### 11b. Migration upgrade-path tests
- pre-0012 DB -> apply 0012
- constraint expanded
- old policies preserved
- new policies seeded
- index recreated

### 11c. Governance tests
- all action types, mode behavior
- no fail-open defaults
- no-match default deny

### 11d. ToolRegistry tests
- RequireApproval creates checkpoint + signal
- approved bypass success with matching hash
- mismatch hash rejected
- not-approved rejected

### 11e. Workflow + replay tests
- non-tool checkpoint creation and approved replay
- approved replay uses new turnId
- consumed transition only on success
- failed replay remains approved
- stream includes checkpoint_required + terminal completed

### 11f. SessionEntity schema tests
- payload with/without checkpointId and with channelId

**Verify:** `cd packages/server && bun run test`

---

## Task 12: Final Verification

```bash
cd packages/domain && bun run check
cd packages/server && bun run check
cd packages/tui && bun run check
cd packages/cli && bun run check
bun run test
```

Validation criteria:
1. Expanded governance actions are enforced with default-deny.
2. Checkpoint lifecycle is correct and durable.
3. Expired checkpoints cannot be approved.
4. Approved replay consumes checkpoint only on successful completion.
5. Payload-hash binding is enforced for bypass.
6. Clients remain compatible with terminal stream semantics.

---

## Dependency Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9
10. Task 10
11. Task 11
12. Task 12

Recommended batching:
- **Batch A:** Tasks 1-4 (contracts + migration + port)
- **Batch B:** Tasks 5-7 (governance + tool/workflow checkpointing)
- **Batch C:** Tasks 8-10 (runtime events + routes + clients)
- **Batch D:** Tasks 11-12 (tests + final verification)
