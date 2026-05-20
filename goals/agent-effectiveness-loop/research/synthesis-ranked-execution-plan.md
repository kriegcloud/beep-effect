# Synthesis And Ranked Execution Plan

## Status

Phase 0 research complete on 2026-05-16.

## Inputs

This synthesis combines:

- [Phoenix capability map](./phoenix-capability-map.md)
- [Live Phoenix state audit](./live-phoenix-state-audit.md)
- [Repo eval and metrics surface audit](./repo-eval-metrics-surface-audit.md)
- [Agent-effectiveness opportunity map](./agent-effectiveness-opportunity-map.md)

It also relies on the existing `ai-metrics-stack` and `jsdoc-worker-eval`
initiative packets, the live read-only Phoenix audit, and the repo architecture
doctrine for tooling, observability, testing, and non-slice package ownership.

## Executive Decision

The first implementation slice should be a no-mutation **agent-effectiveness
doctor plus annotation-plan loop**.

Do not start by writing Phoenix annotations, creating Phoenix datasets, or
adding new backend drivers. The live Phoenix instance is trace-bearing but has
no datasets, prompts, custom evaluators, or annotation configs yet. The repo
already has enough local evidence surfaces to produce a high-value trust gate
and a reviewed annotation plan without mutating Phoenix.

The first slice should answer:

- is the agent-effectiveness data loop healthy enough to trust today?
- which labels, benchmarks, scorecards, worker-eval outcomes, and Phoenix spans
  can be linked safely?
- what Phoenix annotations would we write later, and would they pass privacy
  checks?

## Ranked Implementation Plan

| Rank | Slice | Why first | Primary home | Writes | Exit gate |
| ---: | --- | --- | --- | --- | --- |
| 1 | Agent-effectiveness doctor | Converts existing health signals into one trust gate before anyone interprets scorecards or Phoenix views. | `@beep/repo-cli`, `@beep/repo-ai-metrics` | local JSON/Markdown only | Doctor reports Phoenix health, source coverage, latest forwarder/report state, labels, benchmarks, worker-eval status, explicit unavailable metrics, and privacy status. |
| 2 | Annotation plan dry run | Bridges repo-owned outcomes to Phoenix-native feedback without mutating Phoenix. | `@beep/repo-ai-metrics`, `@beep/repo-cli` | local JSON/Markdown only | Planned annotations pass schema and privacy checks and resolve to hash-only task/session/span references. |
| 3 | JSDoc worker dataset builder | Turns the strongest existing eval lane into a repeatable dataset candidate. | `@beep/repo-cli`, possible docgen helper extraction later | local JSON only | Dataset excludes draft bodies by default and can be built from the 10-packet worker-eval evidence. |
| 4 | Human worker-review queue | Supplies missing acceptance evidence before any write-mode remediation discussion. | `@beep/repo-cli`, `@beep/repo-ai-metrics` | local derived labels only after explicit human judgment | Review labels distinguish accepted, edited, rejected, policy violation, and verification result. |
| 5 | Phoenix annotation apply | Writes reviewed annotations to Phoenix after the dry-run schema is accepted. | `@beep/repo-cli`; `drivers/*` only if direct API wrapping is justified | confirmed Phoenix mutation | Requires explicit confirmation token, write credential boundary, and rollback/readback proof. |
| 6 | Phoenix datasets/experiments | Runs true Phoenix experiments after sanitized dataset and evaluator contracts exist. | `@beep/repo-ai-metrics`, `@beep/repo-cli` | confirmed Phoenix mutation | One narrow dataset plus deterministic evaluators can compare a prompt/config/model variant without raw payload leakage. |

## Phase 1 Contract

Phase 1 should implement only local, read-only outputs:

- `beep agent-effectiveness doctor --json`
- `beep agent-effectiveness annotations plan --json`
- `beep agent-effectiveness annotations check --json`

Minimum doctor checks:

- Phoenix endpoint reachable and version visible.
- Phoenix project inventory includes trace-bearing projects.
- Latest AI-metrics forwarder/report evidence is fresh enough for the selected
  window.
- Source coverage is explicit by source kind.
- Scorecard readiness gaps are visible, especially `no_labels`,
  `no_benchmark_runs`, and unavailable provider/model/tool/token/cost metrics.
- JSDoc worker-eval reports summarize completed, failed, timed-out, cleanup,
  policy-violation, and Phoenix-export status.
- Mirror/retention status is included only as sanitized status/count evidence.
- Graphiti availability is reported as optional context, never a blocker for
  scorecard interpretation.

Minimum annotation-plan checks:

- Uses a repo-owned bounded annotation schema before any Phoenix write path.
- Plans annotations for labels, benchmark runs, scorecard readiness/gaps,
  worker status/disposition/policy violations, source coverage, and loop health.
- Uses hash-only local references until Phoenix target IDs are resolved.
- Rejects raw prompt/output/transcript text, private paths, archive paths,
  source paths, unredacted human notes, secrets, and provider payloads.
- Emits a no-op result when Phoenix is unavailable.

## Architecture Decisions

- Keep developer AI analytics language in `@beep/repo-ai-metrics`.
- Keep user-facing workflows in `@beep/repo-cli`.
- Keep generic OTLP/runtime helpers in `@beep/observability`; do not move
  scorecards, labels, worker-eval semantics, or privacy rules there.
- Keep deployable Phoenix/dankserver topology in `@beep/infra`.
- Add a Phoenix-specific driver only after a direct API wrapper is needed beyond
  OTLP export, local JSON plans, or shelling to an official Phoenix CLI.
- Do not use shared kernel or product slices for this initiative.

## Deferred Backlog

- Direct Phoenix annotation writes.
- Phoenix dataset, prompt, experiment, or evaluator creation.
- Phoenix MCP server wiring for live instance operations.
- Storing worker draft bodies in Phoenix.
- Provider/model/tool/token/cost enrichment from external logs.
- Server-owned transcript collection or sync.
- Write-mode JSDoc remediation.
- Backend expansion beyond Phoenix.

## Acceptance Criteria

Phase 1 is complete when:

- doctor and annotation-plan commands produce deterministic JSON and readable
  Markdown or console summaries;
- tests cover privacy rejection, no-op Phoenix-unavailable behavior, and
  existing report/worker-eval fixture inputs;
- the 10-packet JSDoc worker-eval report and current AI-metrics scorecard data
  can be consumed without Phoenix mutation;
- `@beep/repo-cli` and `@beep/repo-ai-metrics` package checks pass for touched
  code;
- no raw transcript, prompt/output text, private path, archive path, source
  path, secret, or decrypted body appears in planned annotations or reports.
