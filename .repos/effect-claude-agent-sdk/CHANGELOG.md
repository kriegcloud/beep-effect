# effect-claude-agent-sdk

## 0.5.0

### Minor Changes

- **SandboxService** -- Execute agent queries in isolated Cloudflare Sandbox containers or locally.
  New `Sandbox` module with `SandboxService`, `SandboxError`, `layerLocal`, and `layerCloudflare`.
  Cloudflare backend uses `@cloudflare/sandbox` (optional peer dep `>=0.7.0`) with SSE streaming,
  scoped lifecycle management, and full `QueryHandle` implementation.

- **Deployment Profiles** -- Extended `QuickConfig` with `sandbox`, `storageBackend`, `storageMode`,
  and `storageBindings` options for one-line environment configuration. Extended `AgentSdkConfig`
  with `SANDBOX_PROVIDER`, `STORAGE_BACKEND`, `STORAGE_MODE` environment variables.

- **R2 and KV Storage Backends** -- Two new `KeyValueStore` implementations backed by Cloudflare R2
  (object storage) and KV (key-value). Integrated into `StorageLayers` factory with validation for
  incompatible combinations (KV + journaled, sync + R2/KV).

- **QuerySupervisor extensions** -- Backpressure queue, active query tracking, metrics counters
  (started/completed/failed/duration), retry with exponential backoff, event emission, and
  sandbox-aware query dispatch with non-serializable options stripping.

### Breaking Changes

- `SandboxError` added to `AgentSdkError` union. Consumers with exhaustive pattern matches
  on `AgentSdkError._tag` will get compile-time errors for the unhandled `"SandboxError"` case.

- `@cloudflare/sandbox` moved from `dependencies` to optional `peerDependencies` at `>=0.7.0`.

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
