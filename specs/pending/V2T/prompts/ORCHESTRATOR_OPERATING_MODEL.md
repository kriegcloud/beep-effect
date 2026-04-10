# V2T Orchestrator Operating Model

## Phase Role Rule

The session operating a V2T phase is always the phase orchestrator.

The orchestrator owns:

- Graphiti memory preflight and fallback handling
- Graphiti writeback and session-end summary handling
- the read order and interpretation of the active phase
- the local plan and immediate next task
- any decision to delegate
- worker selection and scope assignment
- integration of worker findings or patches
- command-gate execution and evidence capture
- updates to the active phase artifact, `outputs/manifest.json`, and
  `outputs/grill-log.md` when applicable

Sub-agents do not own:

- phase closure
- manifest authority
- scope expansion
- reopening locked defaults without evidence
- deciding that missing evidence is “good enough”

## Startup Sequence

1. Read the active phase inputs and determine the immediate blocking questions.
2. Run the Graphiti preflight using
   [GRAPHITI_MEMORY_PROTOCOL.md](./GRAPHITI_MEMORY_PROTOCOL.md) if the MCP is
   available and note any fallback. A failed lookup is evidence to document,
   not a reason to skip the phase-local repo-truth read.
3. Form a local phase plan before delegating.
4. Keep urgent or tightly coupled work local.
5. Delegate only bounded parallel work that does not change the phase objective.
6. Integrate every worker result yourself before updating the phase artifact.
7. Stop at the active phase exit gate instead of rolling forward.

## Review Loop

1. After a meaningful write wave, spawn or run a read-only review pass.
2. Treat substantive findings as reopen conditions, not optional follow-up.
3. Integrate the fixes yourself or through newly bounded workers.
4. Rerun review until the latest wave finds no substantive issues or the
   remaining issues are explicitly accepted as residual risk in the phase
   artifact.

## Delegation Rules

- Form a local plan before spawning any sub-agent.
- Keep urgent, tightly coupled, or immediately blocking work local.
- Delegate only work that is parallelizable, bounded, and materially useful.
- Assume the CLI workflow is a shared worktree unless explicit isolation is
  proven. Overlapping write scopes are forbidden.
- Give each write-capable worker a disjoint write scope.
- Prefer read-only scouts or reviewers for evidence gathering and adversarial
  checks.
- Do not spawn nested sub-agents from workers. The phase orchestrator remains
  the only orchestrator.
- Review every worker result yourself before treating it as accepted.
- Keep `outputs/manifest.json` and phase closure decisions in the orchestrator
  session unless a user explicitly asks otherwise.

## Standard Worker Packet

Every delegated prompt should include:

- phase and current objective
- assigned agent role
- exact read scope
- exact write scope or explicit read-only mode
- repo-truth checks the worker must perform, including live package names when
  commands or task surfaces matter, including `@beep/infra` when installer or
  deployment surfaces are involved
- repo-law inputs that must be read
- commands the worker is responsible for running
- explicit prohibitions
- exact Graphiti fallback expectations when recall is relevant
- required output format from
  [SUBAGENT_OUTPUT_CONTRACT.md](./SUBAGENT_OUTPUT_CONTRACT.md)
- the exact question the worker is expected to answer for the orchestrator
- the explicit stop condition if repo reality or phase assumptions contradict
  the assignment

## Evidence Rules

- A listed gate is not the same as a passed gate.
- Record concrete `passed`, `failed`, `blocked`, `not run`, or `not applicable`
  outcomes in the active phase artifact.
- Worker-reported command results are provisional until the orchestrator has
  reviewed and integrated them.
- Missing evidence is a blocker, not a silent pass.
- Record Graphiti recall attempted, fallback reason, and memory writeback
  status in the active phase artifact instead of treating memory work as
  invisible background behavior.
- When `search_memory_facts` fails or is empty, require the `get_episodes`
  fallback before concluding Graphiti recall was unusable.
- If a later phase uncovers an unresolved earlier-phase assumption, stop and
  route that issue back instead of hiding it in the current phase.
- If a worker returns vague recommendations without a concrete answer to its
  assigned question, treat the packet as incomplete and rerun or replace it.

## Recommended Agent Map

- `effect_v4_repo_mapper` for repo reality, command truth, and seam discovery
- `effect_v4_schema_worker` for schema-first domain work
- `effect_v4_service_architect` for services, layers, and runtime composition
- `effect_v4_error_guardian` for typed failures and recovery rules
- `effect_v4_http_ai_boundary` for protocol, route, tool, and provider-adapter
  boundaries
- `effect_v4_persistence_runtime_architect` for filesystem, SQLite, config,
  resource lifetimes, and local-first persistence seams
- `effect_v4_state_concurrency_guardian` for state, scope, retries, timeouts,
  and fiber behavior
- `effect_v4_quality_reviewer` for adversarial review of conformance and gate
  completeness

## Integration Sequence

1. Read the phase inputs and state the phase-local plan.
2. Decide which immediate task you should keep local.
3. Spawn only the workers that unblock parallel sidecar work.
4. Continue non-overlapping local work while workers run.
5. Review each worker result for scope drift, repo-law drift, and missing
   verification.
6. Integrate or refine the result yourself.
7. Run the required gates.
8. Update the phase artifact, manifest, and logs.
9. Write the Graphiti session-end summary before ending the session when the
   work produced durable repo truth, decisions, reusable failures, or
   meaningful in-progress state.

## Integration Checklist

- confirm the worker stayed inside scope
- confirm the result still matches the current phase objective
- confirm the worker actually answered the assigned question or objective
- confirm commands are reported precisely, including commands not run
- confirm Graphiti recall or fallback is documented precisely, including exact
  query, exact error text, and `get_episodes` fallback result when relevant
- confirm any residual risk or blocker is visible
- confirm the active phase artifact reflects the accepted result instead of the
  raw worker wording
- confirm the session-end memory writeback was completed or intentionally
  deferred with an explicit reason

## Default Stop Conditions

- Stop delegation if write scopes start to overlap.
- Stop delegation if the phase objective changes.
- Stop delegation if a worker result contradicts repo reality.
- Stop delegation if Graphiti or repo-truth inputs materially change the phase
  assumptions and require a new local plan.
- Stop delegation if the worker output is incomplete, misleading, or tries to
  claim phase closure.
- Stop the phase if a prerequisite earlier-phase decision is still unresolved.
- Stop the phase when its exit gate is satisfied; do not silently roll into the
  next phase.
