# Phase 4 - Tools, Hooks, and MCP

Status: Source Dive Updated (Effect AI + SDK)

## Objectives
- Provide Schema-first tool definitions and handler adapters.
- Implement hook routing with timeouts and permission flow handling.
- Wrap MCP server configuration and SDK MCP helpers.

## Scope
- `Tool.fromSchema` and `Toolkit` adapters.
- Hook callback execution pipeline and permission decisions.
- MCP server setup, status, and dynamic updates.

## SDK Surface Covered
- `tool()`, `createSdkMcpServer()`
- `HookEvent`, `HookInput`, `HookJSONOutput`, `HookCallbackMatcher`
- `PermissionResult`, `PermissionUpdate`
- `McpServerConfig`, `setMcpServers`, `mcpServerStatus`
- `CanUseTool`, `PermissionRequestHookInput`, `PermissionRequestHookSpecificOutput`

## Effect Modules to Apply
- `Schema` and `JSONSchema` for tool parameters and output format
- `Layer` for tool handler provisioning
- `Effect.timeout`, `Duration`, `Schedule` for hook timeouts
- `Fiber` for hook execution concurrency
- `Queue` or `PubSub` for hook event routing
- `Context` for tool/hook handler injection
- `Stream` for MCP status and hook event pipelines
- `@effect/ai/Tool`, `@effect/ai/Toolkit` as behavioral reference (not direct dependency)

## Effect Source Review Targets (Refine After Source Dive)
- `.reference/effect/packages/ai/ai/src/Tool.ts`
- `.reference/effect/packages/ai/ai/src/Toolkit.ts`
- `.reference/effect/packages/ai/ai/src/McpSchema.ts`
- `.reference/effect/packages/ai/ai/src/McpServer.ts`
- `.reference/effect/packages/effect/src/Layer.ts`
- `.reference/effect/packages/effect/src/Schedule.ts`

## Source Dive Findings
### Effect AI Tool/Toolkit Patterns
- `Tool.getJsonSchema` uses `JsonSchema.fromAST` with `topLevelReferenceStrategy: "skip"` and attaches `$defs` when needed; for empty object shapes it returns `{ additionalProperties: false }`.
- Tool metadata is stored via Context annotations (`Title`, `Readonly`, `Destructive`, `Idempotent`), not embedded in schema.
- `Toolkit.commit` caches per-tool decoder/validator/encoder in a `WeakMap` to avoid recomputation.
- `Toolkit.handle` decodes params via `Schema.decodeUnknown`, validates output with `Schema.validate` against `Schema.Union(success, failure)`, encodes output via `Schema.encodeUnknown`.
- Failure handling: `failureMode: "error"` fails the Effect; `failureMode: "return"` captures failure as a tool result with `isFailure: true`.
- Errors are categorized as `MalformedOutput` (decode/lookup) vs `MalformedInput` (validation/encoding).

### SDK Hook and MCP Behavior
- Hooks are registered by callback IDs; `initialize` sends `{ matcher, hookCallbackIds, timeout }` per matcher to the CLI.
- `HookCallbackMatcher.timeout` is in seconds and applies to all hooks in the matcher.
- Hook callbacks receive `AbortSignal`; cancellation is driven by control cancel requests.
- `HookJSONOutput` is a union of `SyncHookJSONOutput` (primary result) and `AsyncHookJSONOutput` (`{ async: true; asyncTimeout? }`).
- `PermissionRequestHookInput` includes `permission_suggestions`; `PermissionRequestHookSpecificOutput` controls allow/deny plus optional updates.
- `canUseTool` receives `blockedPath`, `decisionReason`, `toolUseID`, `agentID` and must return a `PermissionResult` with `toolUseID`.
- SDK MCP support uses in-process `McpServer` from `@modelcontextprotocol/sdk`; tool schemas are Zod-based internally.

## Refined Plan
### 4.1 Tools (Schema-First)
- Define `ToolDefinition` using `Schema.Struct` and enforce `failureMode` semantics aligned with `@effect/ai/Toolkit` (`error` vs `return`).
- Implement a `Toolkit` wrapper that:
  - caches decoders/validators/encoders per tool (WeakMap).
  - runs handlers via `Effect` with clear error classification.
  - surfaces `encodedResult` for MCP compatibility.
- Add tool annotations (`Title`, `Readonly`, `Destructive`, `Idempotent`) and map to MCP tool metadata when constructing SDK MCP tools.
- Provide a strict tool name validator aligned with MCP name rules to surface warnings early.
- JSON Schema export for tools should follow Effect AI's `getJsonSchemaFromSchemaAst` behavior.

### 4.2 Hooks (Effect-Driven)
- Model `HookInput` and `HookJSONOutput` with Effect `Schema`, including:
  - `SyncHookJSONOutput` fields (`continue`, `suppressOutput`, `stopReason`, `decision`, `systemMessage`, `reason`, `hookSpecificOutput`).
  - `AsyncHookJSONOutput` (`async: true`, optional `asyncTimeout`).
  - full set of hook-specific inputs/outputs (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `Notification`, `UserPromptSubmit`, `SessionStart`, `SessionEnd`, `Stop`, `SubagentStart`, `SubagentStop`, `PreCompact`, `PermissionRequest`, `Setup`).
- Define `HookMatcher` wrapper with `matcher?: string` and `timeout?: Duration`; convert to SDK seconds.
- Implement hook adapter that:
  - runs handler effects in a scoped fiber per callback.
  - honors `AbortSignal` by interrupting the running effect.
  - allows optional `Effect.timeout` when SDK timeouts are not enforced.
- Provide helper constructors for common hook outputs (approve/block, allow/deny, additionalContext).

### 4.3 MCP Server Wrappers
- Represent `McpServerConfig` in Schema-first form and map to SDK config types.
- Provide an opt-in `SdkMcpServer` builder that accepts Effect `ToolDefinition` and creates a `McpSdkServerConfigWithInstance`.
- In-process MCP schema strategy:
  - Attempt internal Zod conversion from Effect Schema (private dependency).
  - Allow an explicit Zod schema override when conversion is unsupported.
  - Otherwise fail with a typed error and recommend process/SSE/HTTP MCP servers.
- Implement `mcpServerStatus` and `setMcpServers` wrappers with Effect error types and structured results.

### 4.4 Integration Points
- Extend `AgentSdkConfig` to accept hook matchers, hook handlers, and MCP server configs in Schema-first form.
- Use `Context`/`Layer` for handler provisioning and to keep SDK configuration pure.
- Provide `CanUseTool` adapters that surface `PermissionUpdate` suggestions in a typed Effect API.

## Deliverables
- `src/Tools/Tool.ts` and `src/Tools/Toolkit.ts`
- `src/Hooks/*` for hook handlers and adapters
- `src/Mcp/*` for MCP config and server wrappers

## Exit Criteria
- Tool handlers run via Effect and return SDK-compatible results.
- Hooks execute with timeout control and structured outputs.
- MCP server status and dynamic server updates operate end-to-end.

## Risks and Open Questions
- In-process MCP is opt-in; ensure clear errors when schema conversion is unsupported.
- Hook timeout semantics and cancellation are driven by CLI control requests; ensure Effect interruption mirrors AbortSignal.
- `AsyncHookJSONOutput` semantics are minimally documented; validate via behavior tests in Phase 4 or Phase 7.
