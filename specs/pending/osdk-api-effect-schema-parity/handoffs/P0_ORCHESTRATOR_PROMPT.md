# P0 Orchestrator Prompt

## 1. Context
You are running Phase P0 for `specs/pending/osdk-api-effect-schema-parity`.
This phase establishes a locked factual baseline before any contract or implementation work.

## 2. Mission
Produce a verified parity baseline, dependency order, conventions checklist, and risk register.

## 3. Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. Upstream API source tree
4. Local ontology source tree

## 4. Non-negotiable locks
1. Baseline counts must be evidence-backed.
2. No implementation edits in P0 outputs.
3. Capture missing vs stubbed vs implemented distinctions.

## 5. Agent assignments
1. `parity-inventory`: stable/unstable module matrix.
2. `dependency-map`: prerequisite ordering by module cluster.

## 6. Required outputs
1. `outputs/p0-baseline/parity-matrix.md`
2. `outputs/p0-baseline/module-dependency-order.md`
3. `outputs/p0-baseline/conventions-checklist.md`
4. `outputs/p0-baseline/risks-and-mitigations.md`

## 7. Required checks
1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`

## 8. Exit gate
P0 ends only when all outputs exist and P1 handoff/prompt are authored.

## 9. Memory protocol
1. Check proxy health: `curl -fsS http://127.0.0.1:8123/healthz`
2. Monitor during fan-out: `curl -fsS http://127.0.0.1:8123/metrics`
3. On failure, continue and record: `graphiti-memory skipped: proxy unavailable`
4. Use `http://127.0.0.1:8123/mcp` only.

## 10. Handoff document pointer
`handoffs/HANDOFF_P0.md`
