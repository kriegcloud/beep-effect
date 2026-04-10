# beep-effect Codex Agents

This directory defines project-scoped custom Codex agents for `beep-effect`.

Codex loads the registry from [../config.toml](../config.toml) when the project
is trusted. The active V2T spec now assumes:

- the session working a phase is the orchestrator
- sub-agents are selectively spawned specialists
- sub-agents own only bounded scopes and never own phase closure

## Available Agents

### `effect_v4_repo_mapper`

- Read-only scout for repo seams, package boundaries, command reality, and
  Effect v4 hotspot discovery.
- Best for P0 research, P2 planning preflight, and P4 evidence gathering.

### `effect_v4_schema_worker`

- Write-capable schema-first specialist for `S.Class`, tagged unions,
  annotations, codecs, defaults, and boundary modeling.
- Best for domain-heavy P1 and P3 work.

### `effect_v4_service_architect`

- Write-capable service and layer specialist for `ServiceMap.Service`,
  `Layer.effect`, explicit runtime seams, and dependency wiring.
- Best for sidecar, orchestration, and adapter work in P1 through P3.

### `effect_v4_error_guardian`

- Write-capable typed-error specialist for tagged errors, `Option`, `Match`,
  recovery rules, and `Cause`-aware failure handling.
- Best for failure-prone provider, persistence, and orchestration paths.

### `effect_v4_http_ai_boundary`

- Write-capable boundary specialist for protocol contracts, HTTP or tool
  handlers, provider adapters, and bounded AI retrieval packets.
- Best for app-side or sidecar-side protocol work.

### `effect_v4_persistence_runtime_architect`

- Write-capable persistence specialist for SQLite, filesystem, `Config`,
  resource lifetimes, and local artifact storage seams.
- Best for sidecar persistence, local-first artifact handling, and runtime
  boundaries that need explicit managed resources.

### `effect_v4_state_concurrency_guardian`

- Write-capable runtime specialist for `Scope`, `Ref`-family state, retries,
  timeouts, fiber lifetimes, and concurrency semantics.
- Best for long-running jobs, cancellation, and orchestration control flows.

### `effect_v4_quality_reviewer`

- Read-only adversarial reviewer for repo-law conformance, command-gate
  completeness, docs, and test coverage.
- Best as the last sub-agent before phase closeout.

## Recommended Use

- Start the main phase session with `codex -p v2t_orchestrator`.
- Verify the live workspace names from `apps/V2T/package.json` and
  `packages/VT2/package.json` before copying Turbo filters. The current names
  are `@beep/v2t` and `@beep/VT2`.
- Keep the active phase session as the orchestrator.
- Spawn specialists only after the orchestrator has formed a local plan.
- Give each write-capable worker a disjoint write scope. In the CLI workflow,
  assume workers share the same worktree unless explicit isolation exists.
- Use the quality reviewer after merges, not as a replacement for integration.

The V2T spec delegation kit lives under
`specs/pending/V2T/prompts/` and is the normative prompt source for these
agents.
