# Handoff P4

## Objective

Run live four-way ablation benchmark and compare outcome metrics.

## Output Path Contract

All phase outputs and evidence artifacts are repo-root relative.

Canonical output root:
`specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs`

## Inputs

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p2-retrieval-reliability.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p3-semantic-coverage.md`
- benchmark task set
- PRE phase SDK migration contract

## Output

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p4-ablation-benchmark.md`

## Entry Criteria

- [ ] P2 and P3 outputs exist at canonical paths.
- [ ] P2 and P3 statuses marked complete in `manifest.json`.
- [ ] Four-mode benchmark matrix is locked before execution.

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P4-C01 | `curl -fsS http://127.0.0.1:8123/healthz` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/graphiti-healthz.json` |
| P4-C02 | `bun run agent:bench --live --execution-backend sdk --graphiti-url http://127.0.0.1:8123/mcp --graphiti-group-id beep-dev --conditions current,minimal,adaptive,adaptive_kg --output outputs/agent-reliability/runs/p4-ablation-live.json --report-output outputs/agent-reliability/weekly/p4-ablation-live-report.md` | `outputs/agent-reliability/runs/p4-ablation-live.json` |
| P4-C03 | `bun run agent:bench:report --input outputs/agent-reliability/runs/p4-ablation-live.json --output outputs/agent-reliability/weekly/p4-ablation-live-report.md --title "P4 Ablation Live Report"` | `outputs/agent-reliability/weekly/p4-ablation-live-report.md` |
| P4-C04 | `bun run agent:bench:compare --baseline outputs/agent-reliability/runs/baseline.json --candidate outputs/agent-reliability/runs/p4-ablation-live.json --output outputs/agent-reliability/weekly/p4-ablation-compare.md --title "P4 Ablation Compare"` | `outputs/agent-reliability/weekly/p4-ablation-compare.md` |
| P4-C05 | `rg -n "\"conditions\"|adaptive_kg|current|minimal|adaptive|commandBackend|backend" outputs/agent-reliability/runs/p4-ablation-live.json` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/p4-run-audit.log` |
| P4-C06 | `rg -n "baseline|semantic_only|ast_only|ast_jsdoc_hybrid|delta|@beep/ai-sdk|BLOCKED" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p4-ablation-benchmark.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/p4-report-audit.log` |

## Completion Checklist

- [ ] Four modes executed.
- [ ] Outcome deltas reported.
- [ ] Claude backend evidence shows `@beep/ai-sdk` path.
- [ ] Failure analysis included.
- [ ] Command/evidence artifacts captured for P4-C01..P4-C06.
- [ ] `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/manifest.json` updated (`phases.p4.status`, `updated`).
