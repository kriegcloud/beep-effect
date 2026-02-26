# Handoff P0

## Objective
Freeze baseline parity facts, dependency order, conventions checklist, and risk register before contract freeze and code work.

## Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. Upstream `@osdk/api` source tree
4. Current `@beep/ontology` source tree

## Required Work
1. Build a module-level stable parity matrix (`present`, `missing`, `stubbed`, `implemented`).
2. Produce dependency-aware implementation order for missing/stub modules.
3. Capture established local ontology schema conventions.
4. Capture phase risks and mitigation gates.
5. Author P1 handoff and orchestrator prompt.

## Deliverables
- `outputs/p0-baseline/parity-matrix.md`
- `outputs/p0-baseline/module-dependency-order.md`
- `outputs/p0-baseline/conventions-checklist.md`
- `outputs/p0-baseline/risks-and-mitigations.md`

## Completion Checklist
- [ ] Stable and unstable baseline counts verified.
- [ ] Dependency order frozen and phaseable.
- [ ] Conventions checklist explicit and reviewable.
- [ ] Risks and mitigations captured.
- [ ] P1 handoff + prompt authored.

## Memory Protocol
1. Preflight `curl -fsS http://127.0.0.1:8123/healthz` before parallel analysis.
2. If unavailable: `graphiti-memory skipped: proxy unavailable`.
3. Route to proxy only (`127.0.0.1:8123/mcp`).

## Exit Gate
P0 closes when baseline is locked and P1 can execute without discovery ambiguity.
