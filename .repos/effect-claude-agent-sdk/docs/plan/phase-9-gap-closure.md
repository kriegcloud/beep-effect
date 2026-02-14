# Phase 9 - Gap Closure + Hardening

Status: Draft

## Objectives
- Close high-priority gaps from the repo survey (layer wiring, docs drift, option merging).
- Improve Effect-native ergonomics (hook composition helpers).
- Add scoped MCP server lifecycle helpers.
- Add missing tests for new behavior.

## Scope
### Must-Have
- Fix `layerDefault` wiring for `AgentRuntime` and `QuerySupervisor`.
- Update README to match current API shapes.
- Implement deep merge for `Options` map fields (hooks/env/mcpServers/agents/extraArgs).
- Add Hook utilities (`mergeHookMaps`, `withHook`, `withHooks`) and export them.
- Add scoped MCP server helper with cleanup on scope exit.
- Add tests for options merging + hook helpers.

### Nice-to-Have
- Add config layer tests (env parsing, validation failures).
- Add tests for MCP lifecycle helper.
- Add doc note on hook composition and option merging.

## Plan
1. **Docs + plan wiring**
   - Add this phase to `docs/plan/README.md`.
2. **Layer wiring**
   - `QuerySupervisor.layerDefault` should provide `AgentSdk.layerDefault`.
   - `QuerySupervisor.layerDefaultFromEnv` should provide `AgentSdk.layerDefaultFromEnv`.
   - `AgentRuntime.layerDefault` should provide `QuerySupervisor.layerDefault`.
   - `AgentRuntime.layerDefaultFromEnv` should provide `QuerySupervisor.layerDefaultFromEnv`.
3. **Options + hooks**
   - Implement `mergeHookMaps` that concatenates matchers per hook event.
   - Provide `withHook` and `withHooks` helpers.
   - Update `mergeOptions` to deep-merge map fields; keep other fields as override.
4. **MCP lifecycle**
   - Add `createSdkMcpServerScoped` that closes the server instance on scope release.
5. **Docs + tests**
   - Fix README snippets (`stats.active`, `QueryHandle.send`/`sendAll`).
   - Add tests for hook utilities + options merge.
   - Optional: MCP lifecycle helper test if feasible without external transport.

## Test Plan
- `bun test` for all new/updated tests.
- Focused tests:
  - `mergeHookMaps` and `withHooks` composition behavior.
  - `mergeOptions` map-field deep merge semantics.

## Exit Criteria
- Layer defaults are self-contained and work with README examples.
- Options merge no longer drops hook maps or other map-style config.
- Hook helpers are exported and documented.
- Scoped MCP server helper exists with safe cleanup behavior.
- Tests pass under `bun test`.
