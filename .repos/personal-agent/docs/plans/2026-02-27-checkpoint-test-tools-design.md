# Checkpoint Test Tools Design

**Date**: 2026-02-27
**Status**: Implemented (evolved beyond original stub design)
**Goal**: Provide realistic tool definitions with governance policies so checkpoint escalation can be tested end-to-end through the TUI with live API calls.

## Components

### 1. Three Tools in ToolRegistry

All three tools were originally designed as stubs returning canned data. They have since been upgraded to real implementations delegating to `ToolExecutionService`.

| Tool | Description (LLM-facing) | Parameters | Delegate |
|------|--------------------------|------------|----------|
| `file_write` | Write content to a file at the specified path | `{ path: string, content: string }` | `ToolExecution.writeFile` |
| `shell_execute` | Execute a shell command and return output | `{ command: string, cwd?: string }` | `ToolExecution.executeShell` → `CommandRuntime` |
| `send_notification` | Send a notification message to a user or channel | `{ recipient: string, message: string }` | `ToolExecution.sendNotification` |

All tools are wrapped with `runGovernedTool` so governance policies apply normally.

Marked `is_safe_standard = 0` so the existing `SafeStandardTools` Allow policy does not match them.

### 2. Tool Implementations (in ToolExecution)

**`file_write`**:
- Workspace path validation (lexical, relative to `process.cwd()`)
- Size limit enforcement (default 256KB)
- Atomic write via temp file + rename
- Parent directory auto-creation

**`shell_execute`**:
- Delegates to `CommandRuntime.execute` (full hook pipeline)
- `CommandBackendLocal` spawns shell with workspace confinement, timeout (15s), output truncation (16KB)
- `CommandPolicyHook` blocks dangerous commands (sudo, rm -rf /, fork bombs, etc.)
- `CommandInvocationContext` populated from `ToolExecutionContext` (source, agentId, sessionId, turnId, channelId, checkpointId, toolName)
- Error mapping: all `CommandExecutionError` variants → `ToolExecutionFailure` codes

**`send_notification`**:
- Validates recipient and message are non-empty
- Persists to `notifications` table (migration 0015)
- Returns UUID-based `notificationId`

### 3. Governance Policies (Migration 0013)

**Standard mode** (the default development mode):
- All three tools: `ExplicitToolList` selector, decision `RequireApproval`, precedence 15
- Sits between existing SafeStandardTools Allow (precedence 10) and AllTools Deny (precedence 20)
- Triggers checkpoint on every invocation

**Permissive mode**:
- All three tools: `ExplicitToolList` selector, decision `Allow`, precedence 5
- Allows use without checkpoint when you want uninterrupted flow

**Restrictive mode**:
- Already covered by existing `policy:invoke_tool:restrictive:v1` (AllTools → RequireApproval)

### 4. No Synthetic Endpoints

Natural flow only. The LLM calls the tool, governance evaluates the policy, checkpoint fires. High fidelity, no mocking.

## Files

### Created
| File | Purpose |
|------|---------|
| `packages/server/src/tools/command/CommandTypes.ts` | Data contracts for command execution |
| `packages/server/src/tools/command/CommandErrors.ts` | Tagged error types |
| `packages/server/src/tools/command/CommandHooks.ts` | Hook service contract |
| `packages/server/src/tools/command/CommandBackend.ts` | Backend service contract |
| `packages/server/src/tools/command/CommandRuntime.ts` | Execution orchestrator |
| `packages/server/src/tools/command/CommandBackendLocal.ts` | Local shell backend |
| `packages/server/src/tools/command/hooks/CommandPolicyHook.ts` | Command policy enforcement |
| `packages/server/src/tools/command/hooks/AuditCommandHook.ts` | Command audit logging |
| `packages/server/src/tools/command/hooks/CommandHooksDefault.ts` | Default hook layer |

### Modified
| File | Change |
|------|--------|
| `packages/server/src/ai/ToolRegistry.ts` | Tool definitions + handlers delegating to `ToolExecution` |
| `packages/server/src/tools/ToolExecution.ts` | Real `writeFile`, `executeShell`, `sendNotification` implementations |
| `packages/server/src/persistence/DomainMigrator.ts` | Migration 0013 (tool defs + policies), migration 0015 (notifications table) |
| `packages/server/src/server.ts` | Command system layer wiring |

## Testing Flow

1. Start server: `cd packages/server && bun run dev`
2. Start TUI: `cd packages/cli && bun run dev`
3. Ensure agent is in Standard mode (default)
4. Type a message like "please run the command `ls -la`"
5. LLM calls `shell_execute` → governance returns RequireApproval → checkpoint_required emitted
6. TUI shows checkpoint indicator + decision bar
7. Press Y (approve) → turn replays with approved bypass → tool executes via `CommandRuntime` → real output returned
8. Press N (reject) → message completes without tool output
9. Press D (defer) → message completes, checkpoint stays pending

## Decisions

- **Always available**: Tools are part of the standard registry, not gated behind an env flag. Policies control access.
- **All three checkpoint in Standard**: `send_notification` also requires approval in Standard mode for consistent testing surface.
- **No synthetic bypass**: Natural LLM flow gives higher fidelity.
- **Real implementations**: All three tools execute real operations (file I/O, shell commands, DB writes) rather than returning canned data. This gives higher test fidelity and enables the tools to be used beyond checkpoint testing.
- **Command hook system**: `shell_execute` is backed by a full hook pipeline (see [`2026-02-28-command-hooks-architecture-design.md`](2026-02-28-command-hooks-architecture-design.md)).
