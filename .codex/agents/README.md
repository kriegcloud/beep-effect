# beep-effect Codex Agents

This directory defines project-scoped custom Codex agents for `beep-effect`.

Codex loads the registry from [../config.toml](../config.toml) when the project
is trusted. The active phase workflow assumes:

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

- Write-capable service and layer specialist for `Context.Service`,
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

- Verify live workspace names from package manifests before copying Turbo
  filters.
- Keep the active phase session as the orchestrator.
- Spawn specialists only after the orchestrator has formed a local plan.
- Give each write-capable worker a disjoint write scope. In the CLI workflow,
  assume workers share the same worktree unless explicit isolation exists.
- Use the quality reviewer after merges, not as a replacement for integration.

These agents no longer depend on the old checked-in packet layout. When a task
needs an explicit delegation contract, treat the active initiative packet's
`ops/` surfaces as the normative prompt source.

## Dispatch Heuristics

- Use `effect_v4_repo_mapper` when the orchestrator needs repo truth, command
  truth, or path validation before changing docs or code.
- Use `effect_v4_schema_worker` when the center of gravity is domain shape,
  codecs, tagged unions, and schema-derived helpers.
- Use `effect_v4_service_architect` when the main question is service seams,
  `Layer` composition, and runtime wiring.
- Use `effect_v4_persistence_runtime_architect` when the main question is
  SQLite, filesystem, `Config`, managed resources, or local artifact storage.
- Use `effect_v4_http_ai_boundary` when the main question is protocol surface,
  route or tool handling, provider boundaries, or bounded retrieval packets.
- Use `effect_v4_error_guardian` when the main risk is error-channel design,
  recovery semantics, or `Option` / `Match` boundary handling.
- Use `effect_v4_state_concurrency_guardian` when the main risk is retries,
  timeouts, structured concurrency, cancellation, queues, or `Ref`-family
  state.
- Use `effect_v4_quality_reviewer` after a meaningful write wave, not instead
  of the orchestrator's own integration pass.

## Overlap Guardrails

- If the work is mostly about persistence internals, prefer
  `effect_v4_persistence_runtime_architect` and keep
  `effect_v4_service_architect` focused on service seams and layer topology.
- If the work is mostly about protocol packets or handlers, prefer
  `effect_v4_http_ai_boundary` and keep persistence or concurrency redesign out
  of that worker's scope.
- If the work is mostly about runtime behavior under load, prefer
  `effect_v4_state_concurrency_guardian` and keep schema or transport redesign
  out of that worker's scope.
- If the work is mostly about error surfaces, prefer
  `effect_v4_error_guardian` and keep broader architectural ownership with the
  orchestrator.
- When a task spans multiple specialties, either keep it local in the
  orchestrator or split it into disjoint file scopes. Do not ask two write
  workers to reshape the same files.

## Intentionally Not Specialized

- There is no generic "execution" worker. Cross-cutting tasks that would need
  multiple specialties at once should usually stay in the orchestrator until
  they can be split cleanly.
- There is no dedicated UI or styling specialist in this roster. If a task is
  mostly presentational or app-shell UX work rather than Effect-centered
  architecture, either keep it local or use a more appropriate non-Effect
  workflow outside this registry.
- There is no nested-worker coordinator. Sub-agents return to the orchestrator;
  they do not spawn additional workers.

## Worker Return Shape

- When a prompt provides an explicit output contract, follow it exactly.
- For initiative work with a defined output contract, follow the contract
  shipped inside that initiative packet's `ops/` tree.
- Explicitly report commands not run, repo-truth checks performed, Graphiti
  fallback behavior, and any residual risk the orchestrator still needs to own.
