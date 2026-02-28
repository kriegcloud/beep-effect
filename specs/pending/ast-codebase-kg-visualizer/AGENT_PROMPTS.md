# Agent Prompts

## PRE Orchestrator Prompt

Mission: align source contracts and freeze immutable KG v1 -> visualizer mapping tables.

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p-pre-contract-and-source-alignment.md`

Must include:

- source-of-truth alignment notes
- immutable node kind and edge kind mapping tables
- fallback mapping semantics with `meta.originalType`
- deterministic ID/provenance carry-through rules
- required `meta` fields for exported visualizer graph

## P0 Orchestrator Prompt

Mission: freeze architecture boundaries and acceptance gates.

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p0-architecture-and-gates.md`

Must include:

- CLI/API/UI ownership map
- output file map
- gate matrix for P1..P5
- explicit unresolved-risk ledger and mitigation ownership

## P1 Orchestrator Prompt

Mission: lock `beep kg export` command design and implementation plan.

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p1-kg-export-cli.md`

Must include:

- final CLI surface
- adapter flow from KG v1 artifacts to visualizer v2 schema
- deterministic sorting and hashing rules
- CLI unit test matrix

## P2 Orchestrator Prompt

Mission: lock `/api/kg/graph` and loader behavior.

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p2-web-api-and-loader.md`

Must include:

- success response contract
- missing export typed 404 remediation payload
- malformed export handling contract
- API/unit test cases

## P3 Orchestrator Prompt

Mission: lock `/kg` D3 UI architecture and interaction contract.

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p3-d3-ui-implementation.md`

Must include:

- component/module layout
- D3 simulation and rendering boundaries
- depth slider/filter/search/hover/inspector behavior
- accessibility and keyboard behavior

## P4 Orchestrator Prompt

Mission: define and execute performance + E2E validation plan.

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p4-performance-and-e2e-validation.md`

Must include:

- CLI/API/UI automated checks
- Playwright `/kg` interaction checks
- sample and large-graph scale evidence
- regression handling rubric

## P5 Orchestrator Prompt

Mission: produce rollout verdict and runbook.

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p5-rollout-decision.md`

Must include:

- gate-by-gate status
- final go/limited-go/no-go verdict
- staged rollout plan
- rollback triggers

## Specialist Prompts

- [P1 KG Export Engineer](./handoffs/P1_KG_EXPORT_ENGINEER_PROMPT.md)
- [P2 API Engineer](./handoffs/P2_API_ENGINEER_PROMPT.md)
- [P3 UI Engineer](./handoffs/P3_UI_ENGINEER_PROMPT.md)
- [P4 Perf + E2E Engineer](./handoffs/P4_PERF_E2E_ENGINEER_PROMPT.md)
- [P5 Rollout Engineer](./handoffs/P5_ROLLOUT_ENGINEER_PROMPT.md)
