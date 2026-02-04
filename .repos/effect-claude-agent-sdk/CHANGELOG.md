# effect-claude-agent-sdk

## 0.4.1

### Patch Changes

- a878e54: Remediate persistence defaults, pagination, and audit logging; update docs/examples.

## 0.4.0

### Minor Changes

- 7f5dc11: add storage module for chat history, artifacts, and audit log persistence

## 0.3.1

### Patch Changes

- Republish session layer updates

## 0.3.0

### Minor Changes

- 4b09e68: Add Effect-native logging helpers

  - New `Logging` module with pattern matching for SDK message events
  - `LoggingConfig` for configurable log levels and formatting
  - `LoggingLayer` for integrating SDK logging with Effect's logger
  - `LoggingMatch` combinators for building custom message handlers
  - `LoggingStream` utilities for streaming log transformations

### Patch Changes

- e3404d7: Add session config defaults, manager/service layers, and session docs/tests

## 0.2.0

### Minor Changes

- bd3f146: Add scoped MCP server creation, improved options merging, and hook utilities

  - Add `createSdkMcpServerScoped` for automatic resource cleanup
  - Improve options merging to properly combine hooks, env, mcpServers, agents, and extraArgs
  - Add hook utilities for merging hook maps
  - Fix layer composition in AgentRuntime and QuerySupervisor to include dependencies
  - Make HookMap schema partial for better flexibility
