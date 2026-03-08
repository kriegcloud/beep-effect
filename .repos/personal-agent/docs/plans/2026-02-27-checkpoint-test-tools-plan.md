# Checkpoint Test Tools Implementation Plan

**Date**: 2026-02-27
**Status**: Implemented
**Depends on**: [`2026-02-27-checkpoint-test-tools-design.md`](2026-02-27-checkpoint-test-tools-design.md)
**Goal**: Three tools (`file_write`, `shell_execute`, `send_notification`) with governance policies that trigger checkpoint escalation in Standard mode, enabling end-to-end testing of the TUI checkpoint approval UI.

**Architecture**: Tools follow `Tool.make` + `SafeToolkit` pattern in ToolRegistry. Handlers delegate to `ToolExecutionService` for real execution. Policies seeded via SQLite migration (0013). `shell_execute` backed by `CommandRuntime` hook pipeline. `send_notification` persists to `notifications` table (migration 0015).

**Tech Stack**: Effect (Tool, Toolkit, Schema, ServiceMap), SQLite migrations, CommandRuntime, Vitest

---

## 1. Tool Definitions in ToolRegistry

**Files**: `packages/server/src/ai/ToolRegistry.ts`

### TOOL_NAMES (lines 30-40)

Nine entries total — the three new tools added after the six original safe tools:
- `file_write`, `shell_execute`, `send_notification`

### Tool.make Definitions (lines 127-168)

| Tool | Parameters | Success Schema |
|------|-----------|---------------|
| `FileWriteTool` | `{ path: String, content: String }` | `{ ok: Literal(true), path: String, bytesWritten: Number }` |
| `ShellExecuteTool` | `{ command: String, cwd?: String }` | `{ ok: Literal(true), exitCode: Number, stdout: String, stderr: String }` |
| `SendNotificationTool` | `{ recipient: String, message: String }` | `{ ok: Literal(true), notificationId: String, delivered: Boolean }` |

All use `ToolFailure` (`{ errorCode: String, message: String }`) for failures.

### SafeToolkit (lines 170-180)

All nine tools composed into single toolkit.

### Handlers (lines 793-861)

All three delegate to `ToolExecution` via `runGovernedTool`:

**`file_write`** (lines 793-810):
- `toolExecution.writeFile({ path, content })` → maps result to `{ ok, path, bytesWritten }`

**`shell_execute`** (lines 811-843):
- `toolExecution.executeShell({ command, cwd, context })` → maps result to `{ ok, exitCode, stdout, stderr }`
- Builds `CommandInvocationContext` with source (`"tool"` or `"checkpoint_replay"`), agentId, sessionId, turnId, channelId, checkpointId, toolName

**`send_notification`** (lines 844-861):
- `toolExecution.sendNotification({ recipient, message })` → maps result to `{ ok, notificationId, delivered }`

---

## 2. ToolExecution Service

**Files**: `packages/server/src/tools/ToolExecution.ts`

### `writeFile` (lines 143-179)
- Validates `maxBytes > 0` and content fits within limit (default 256KB)
- Resolves path relative to workspace root; rejects paths outside workspace
- Creates parent directories recursively
- Atomic write: temp file with UUID suffix → rename to target

### `executeShell` (lines 119-141)
- Delegates to `CommandRuntime.execute({ context, request })`
- Maps `CommandResult` to `{ exitCode, stdout, stderr }`
- Maps `CommandExecutionError` variants to `ToolExecutionFailure` via `mapCommandErrorToToolFailure` (lines 55-88)

### `sendNotification` (lines 181-223)
- Validates recipient and message are non-empty strings
- Generates UUID-based `notificationId`
- Inserts into `notifications` table via SQL
- Returns `{ notificationId, delivered: true }`

---

## 3. Migration 0013 — Tool Definitions and Policies

**Files**: `packages/server/src/persistence/DomainMigrator.ts`

### Tool definitions
- `tooldef:file_write:v1`, `tooldef:shell_execute:v1`, `tooldef:send_notification:v1`
- All: `source_kind = 'BuiltIn'`, `is_safe_standard = 0`

### Standard mode policies (precedence 15, RequireApproval)
- `policy:invoke_tool:standard:require_file_write:v1`
- `policy:invoke_tool:standard:require_shell_execute:v1`
- `policy:invoke_tool:standard:require_send_notification:v1`

### Permissive mode policies (precedence 5, Allow)
- `policy:invoke_tool:permissive:allow_file_write:v1`
- `policy:invoke_tool:permissive:allow_shell_execute:v1`
- `policy:invoke_tool:permissive:allow_send_notification:v1`

### Junction table entries
All six policies linked to their tool definitions via `permission_policy_tools`.

---

## 4. Migration 0015 — Notifications Table

**Files**: `packages/server/src/persistence/DomainMigrator.ts`

```sql
CREATE TABLE IF NOT EXISTS notifications (
  notification_id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  delivery_status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);
```

---

## 5. Command Hook System (for shell_execute)

**Files**: `packages/server/src/tools/command/` (6 core files + 3 hook files)

See [`2026-02-28-command-hooks-architecture-plan.md`](2026-02-28-command-hooks-architecture-plan.md) for the full plan.

Summary: `shell_execute` → `ToolExecution.executeShell` → `CommandRuntime.execute` → hooks (policy, audit) → `CommandBackendLocal` (spawn, timeout, output truncation).

---

## 6. Layer Wiring

**Files**: `packages/server/src/server.ts`

```
ToolRegistry
  └─ ToolExecution
      ├─ CommandRuntime
      │   ├─ CommandHooks (default = [CommandPolicyHook])
      │   ├─ CommandBackendLocal
      │   │   └─ ChildProcessSpawner
      │   └─ FileSystem, Path
      ├─ FileSystem, Path (for writeFile)
      └─ SqlClient (for sendNotification)
```

Test layer factories in `ToolRegistry.test.ts`, `ChatFlow.e2e.test.ts`, `TurnProcessingWorkflow.e2e.test.ts` mirror this wiring with `NodeServices.layer`.

---

## 7. Tests

### ToolRegistry tests (`packages/server/test/ToolRegistry.test.ts`)

| Test | Covers |
|------|--------|
| `shell_execute` basic execution | Real shell via CommandBackendLocal |
| `shell_execute` denies blocked commands | CommandPolicyHook rejects `sudo ls` |
| `shell_execute` forwards invocation context | Context propagation to hooks |

### Command system tests

| File | Tests | Covers |
|------|-------|--------|
| `CommandRuntime.test.ts` | 7 | Pipeline ordering, error paths, constraint enforcement, symlink escape |
| `CommandRuntime.property.test.ts` | 3 | Path traversal, fingerprint determinism, output truncation bounds |
| `CommandPolicyHook.test.ts` | 7 | Denied executables, regex patterns, shell parsing, source-aware enforcement |

### E2e tests (layer wiring)

| File | Tests | Covers |
|------|-------|--------|
| `ChatFlow.e2e.test.ts` | 5 | Full chat flow with command layers wired |
| `TurnProcessingWorkflow.e2e.test.ts` | 10 | Turn processing with command layers wired |

---

## 8. Verification Commands

```bash
cd packages/server && bun run check
cd packages/server && bun run test -- ToolRegistry.test.ts
cd packages/server && bun run test -- CommandRuntime.test.ts
cd packages/server && bun run test -- CommandRuntime.property.test.ts
cd packages/server && bun run test -- CommandPolicyHook.test.ts
cd packages/server && bun run test -- ChatFlow.e2e.test.ts
cd packages/server && bun run test -- TurnProcessingWorkflow.e2e.test.ts
cd packages/server && bun run test
```

---

## 9. File Inventory

### Created
| File | Purpose |
|------|---------|
| `packages/server/src/tools/command/CommandTypes.ts` | Data contracts |
| `packages/server/src/tools/command/CommandErrors.ts` | Tagged errors |
| `packages/server/src/tools/command/CommandHooks.ts` | Hook service |
| `packages/server/src/tools/command/CommandBackend.ts` | Backend service |
| `packages/server/src/tools/command/CommandRuntime.ts` | Orchestrator |
| `packages/server/src/tools/command/CommandBackendLocal.ts` | Local shell backend |
| `packages/server/src/tools/command/hooks/CommandPolicyHook.ts` | Policy enforcement |
| `packages/server/src/tools/command/hooks/AuditCommandHook.ts` | Audit logging |
| `packages/server/src/tools/command/hooks/CommandHooksDefault.ts` | Default hook layer |
| `packages/server/test/CommandRuntime.test.ts` | Runtime unit tests |
| `packages/server/test/CommandRuntime.property.test.ts` | Property tests |
| `packages/server/test/CommandPolicyHook.test.ts` | Policy hook tests |

### Modified
| File | Change |
|------|--------|
| `packages/server/src/ai/ToolRegistry.ts` | Tool definitions + real handlers |
| `packages/server/src/tools/ToolExecution.ts` | Real writeFile, executeShell, sendNotification |
| `packages/server/src/persistence/DomainMigrator.ts` | Migrations 0013, 0015 |
| `packages/server/src/server.ts` | Command system layer wiring |
| `packages/server/test/ToolRegistry.test.ts` | Integration tests for shell_execute |
| `packages/server/test/ChatFlow.e2e.test.ts` | Command layer wiring |
| `packages/server/test/TurnProcessingWorkflow.e2e.test.ts` | Command layer wiring |
