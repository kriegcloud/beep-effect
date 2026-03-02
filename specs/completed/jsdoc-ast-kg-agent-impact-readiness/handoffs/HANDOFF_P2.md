# Handoff P2

## Objective

Harden retrieval reliability so agent workflows remain stable during KG query failures.

## Output Path Contract

All phase outputs and evidence artifacts are repo-root relative.

Canonical output root:
`specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs`

## Inputs

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p0-baseline-and-gates.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p1-jsdoc-governance.md`

## Output

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p2-retrieval-reliability.md`

## Entry Criteria

- [ ] P1 output exists at canonical path.
- [ ] P1 status marked complete in `manifest.json`.
- [ ] Graphiti proxy health preflight passes (`127.0.0.1:8123/healthz`).

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P2-C01 | `curl -fsS http://127.0.0.1:8123/healthz` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/graphiti-healthz.json` |
| P2-C02 | `curl -fsS http://127.0.0.1:8123/metrics` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/graphiti-metrics.prom` |
| P2-C03 | `BEEP_GRAPHITI_URL=http://127.0.0.1:8123/mcp bun run beep kg verify --target both --group beep-ast-kg` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/kg-verify-both.json` |
| P2-C04 | `bun run --cwd tooling/cli test -- kg.test.ts` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/kg-cli-test.log` |
| P2-C05 | `rg -n "timeout|retry|no-throw|fallback|timeout rate|p95|p99|search_memory_facts" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p2-retrieval-reliability.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/p2-contract-audit.log` |

## Completion Checklist

- [ ] Timeout and retry policy verified.
- [ ] No-throw fallback behavior verified.
- [ ] Reliability metrics captured.
- [ ] Command/evidence artifacts captured for P2-C01..P2-C05.
- [ ] `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/manifest.json` updated (`phases.p2.status`, `updated`).
