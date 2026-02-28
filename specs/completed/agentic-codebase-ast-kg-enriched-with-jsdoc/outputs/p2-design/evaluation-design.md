# Evaluation Design

## Purpose
Freeze validation protocol, benchmark conditions, metric thresholds, and reporting ownership for P3 and P4 execution.

## Lock Alignment (Normative)

| Decision Surface | Frozen Value |
|---|---|
| Hook latency budget | `p95 <= 1.5s` enforced from `R2 Limited On` |
| Rollout stages | `R0 Shadow`, `R1 Advisory`, `R2 Limited On`, `R3 Default On` |
| Hook failure rule | Hard timeout + no-throw + emit no KG block |
| Read policy | Hybrid read (local deterministic cache + Graphiti semantic layer) |
| Interface surfaces | CLI/ID/provenance/tag-edge/envelope/hook contracts remain unchanged from locked defaults |

## Benchmark Conditions
1. `baseline`: existing non-KG hook behavior.
2. `kg_hook`: KG retrieval + bounded packet injection.

## Evaluation Dimensions and Thresholds

### Graph Coverage and Correctness

| Metric | Target |
|---|---|
| Exported symbol coverage | `>= 98%` |
| Import edge precision (manual sample) | `>= 95%` |
| Call edge precision (manual sample) | `>= 90%` |
| Determinism (same commit => same IDs/hashes) | `100%` |

### Semantic Enrichment Quality

| Metric | Target |
|---|---|
| Required tag parse success (`@category,@module,@since,@param,@returns`) | `>= 99%` |
| Domain semantic edge precision (`@domain/@provides/@depends/@errors`) | `>= 90%` |
| Semantic edge recall on labeled set | `>= 85%` |

### Query Usefulness

| Metric | Target |
|---|---|
| Top-5 hit rate on curated prompt set | `>= 80%` |
| Hook KG relevance (human review) | `>= 4.0/5` |
| Hook latency p95 (warm) | `<= 1.5s` |
| Hook latency p99 | `<= 2.5s` |

### Agentic Task Impact

| Metric | Target |
|---|---|
| Task success vs baseline | `+10pp minimum` |
| Wrong-API/resource hallucinations | `-30% minimum` |
| First-pass check+lint success | `+20% minimum` |
| Median token cost per successful task | `-10% minimum` |

## Sampling and Measurement Protocol
1. Curated prompt set size: minimum `100` prompts per benchmark condition.
2. Manual precision review sample:
minimum `200` edges per edge family (`import`, `call`, semantic).
3. Relevance scoring panel:
minimum `2` reviewers per prompt with rubric-based averaging.
4. Latency measurements collected with warm cache and separate cold-cache profiling.
5. Determinism check:
run full index twice on same commit and compare sorted artifact hashes.

## Execution Commands
1. `bun run check`
2. `bun run lint`
3. `bun run test`
4. `bun run docgen`
5. `bun run agents:pathless:check`
6. `bun run agent:bench` for both `baseline` and `kg_hook`
7. `bun run agent:bench:report`
8. `bun run agent:bench:compare`

## Stage-Gated Evaluation Policy

| Stage | Required Evidence |
|---|---|
| `R0 Shadow` | Coverage/correctness thresholds satisfied; determinism validated |
| `R1 Advisory` | Query usefulness thresholds met in logging mode |
| `R2 Limited On` | Early lift in task success and enforced `p95 <= 1.5s` |
| `R3 Default On` | Full metric suite at or above thresholds |

## Reporting Outputs (Frozen)
1. `outputs/p4-validation/coverage-correctness-report.md`
2. `outputs/p4-validation/semantic-enrichment-quality-report.md`
3. `outputs/p4-validation/query-usefulness-report.md`
4. `outputs/p4-validation/agent-performance-impact-report.md`
5. `outputs/p4-validation/rollout-readiness.md`
6. `outputs/p4-validation/fallback-drill-report.md`

## P3/P4 Ownership Handoff
- Eval Engineer:
implement benchmark condition wiring, data capture, and compare reports.
- Hook Engineer:
expose hook timing and packet inclusion telemetry.
- AST Engineer:
provide deterministic hash/delta integrity metrics.
- Graphiti Engineer:
provide replay/idempotency metrics and outage fallback telemetry.
- Validation Engineer:
run P4 metric audits and manual adjudication set.
- Rollout Engineer:
gate stage promotion using this contract's evidence requirements.

## P3 Task Graph Ownership Freeze
1. AST Engineer:
deliver deterministic extraction + delta metrics required for baseline correctness.
2. Semantic Engineer:
deliver semantic tag-edge metrics and labeled-set recall inputs.
3. Graphiti Engineer:
deliver replay/idempotency and outage-path telemetry.
4. Hook Engineer:
deliver hook packet and latency telemetry for `kg_hook`.
5. Eval Engineer:
integrate all telemetry into benchmark conditions and publish compare reports.
6. Orchestrator:
approve P3 exit only when all owner deliverables above are present and threshold-ready for P4 validation.

## Evidence Continuity (S1-S16 Retained)
`S1`, `S2`, `S3`, `S4`, `S5`, `S6`, `S7`, `S8`, `S9`, `S10`, `S11`, `S12`, `S13`, `S14`, `S15`, `S16`

## Freeze Statement
Evaluation criteria, thresholds, sampling requirements, commands, and ownership are fixed for implementation and validation phases.
