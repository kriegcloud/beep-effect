# Master Orchestration

## Phase State Machine
`P0 -> P1 -> P2 -> P3 -> P4 -> P5 -> P6 -> P7`

A phase is complete only when:
1. Declared outputs exist.
2. Required checks pass.
3. Next-phase handoff + orchestrator prompt exist.

## Global Locks

1. Hybrid parity + aliases.
2. High type fidelity.
3. Unstable deferred to P6.
4. Effect alias conventions (`A/O/P/R/S`).
5. No unsafe typing escapes.
6. Graphiti routing via proxy `127.0.0.1:8123`.

## Phase Responsibilities

### P0
- Lock baseline parity facts and dependency-ordered module plan.
- Produce risk register and conventions checklist.

### P1
- Freeze contracts: schema strategy, type fidelity, API compatibility, test matrix.
- No unresolved `TBD` at phase exit.

### P2
- Implement and audit low-dependency foundation modules.
- Confirm recursive schema blockers are closed.

### P3
- Implement ontology core SCC and compile-time metadata model.
- Validate type fixtures for core generics.

### P4
- Implement aggregate/filter/query primitives and groupby stack.
- Validate stack composition and query schema behavior.

### P5
- Implement ObjectSet + Osdk core + actions/queries + derived properties.
- Validate heavy interdependent generic scenarios.

### P6
- Finalize stable exports, alias compatibility, unstable namespace, package exports.
- Generate export parity matrix as release gate.

### P7
- Execute full verification commands and scenario suite.
- Record command evidence and unresolved risks.

## Memory and Parallelism Controls

1. Before high-fan-out sub-agent work:
   - `curl -fsS http://127.0.0.1:8123/healthz`
2. During fan-out:
   - `curl -fsS http://127.0.0.1:8123/metrics`
3. If proxy unavailable:
   - Record `graphiti-memory skipped: proxy unavailable`
4. If `rejected > 0` or queue grows too large:
   - Reduce sub-agent parallelism and continue.

## Required Cross-Phase Checks

1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`
4. `bun run agents:pathless:check` when prompt/handoff/agent docs are edited.

## Required Handoff Artifacts

At phase boundary N -> N+1:
1. `handoffs/HANDOFF_P{N+1}.md`
2. `handoffs/P{N+1}_ORCHESTRATOR_PROMPT.md`
3. Phase outputs in `outputs/p{N}-*/`
4. Updated `outputs/manifest.json`
