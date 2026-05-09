# P7 Topology-First Production Plan

## Status

Planned. P7 starts after the P6 seven-day proof is credited or intentionally
abandoned.

P7 must not rewrite the P6 proof while it is running. Its job is to turn the
workstation-owned proof into a production topology with explicit ownership,
privacy boundaries, retention, and real provider or gateway metrics.

## Goal

Move from workstation-owned live collection to a production collection topology
that can answer the same scorecard questions without depending on a mutable
developer checkout.

The center of gravity is topology first:

1. Decide where raw transcript access is owned.
2. Decide what may sync off the workstation.
3. Prove retention, deletion, restore, and re-derivation.
4. Add provider/gateway usage metrics only after the raw/derived boundary is
   explicit.
5. Expand dashboard backends only when the backend-specific API need is real.

## Doctrine Fit

- `@beep/repo-ai-metrics` remains the tooling library that owns developer AI
  analytics semantics.
- `@beep/repo-cli` remains the operator workflow surface.
- `@beep/duckdb` remains the DuckDB driver boundary.
- `@beep/observability` remains general runtime observability and does not
  absorb AI metrics semantics.
- `@beep/infra` owns deployable topology on dankserver.
- Backend-specific SDKs become `drivers/*` only when the initiative needs a
  real API wrapper beyond OTLP/install/export contracts.

No architecture doctrine change is required for P7 planning. This is
initiative-level topology and operator workflow design inside the existing
tooling, infra, driver, and observability boundaries.

## P7a: Collection Topology Decision

Decide one production topology before implementation:

- workstation scheduled collection with redacted sync to dankserver
- workstation raw archive with remote derived mirror
- server-owned collection with explicit transcript sync
- hybrid collection where raw remains local and only derived DuckDB/Parquet plus
  OTLP spans leave the workstation

The recommended default is hybrid collection: raw encrypted archives remain
workstation-local unless a transcript-sync design earns explicit privacy
approval; derived DuckDB/Parquet and OTLP spans may sync to dankserver after
the metadata allowlist is re-verified.

Acceptance gates:

- topology diagram and trust boundary written in the initiative packet
- explicit raw, derived, OTLP, report, and dashboard data classes
- failure policy for missed syncs, partial runs, and duplicate ingest ids
- proof that local source paths and transcript bodies do not leave the
  workstation

## P7b: Retention, Restore, And Deletion

Promote P6 runbook notes into executable operator workflows.

Required capabilities:

- list retained raw archive objects and derived exports by window
- drill archive decrypt without printing transcript text
- re-derive DuckDB and Parquet from retained raw archive objects
- delete a proof window from raw, derived, report, and optional remote mirrors
- compact or prune old Parquet/report outputs after the retention window

Acceptance gates:

- restore drill from retained raw archive to derived report
- deletion drill against a disposable local target
- clear distinction between ignored local evidence and tracked initiative
  documentation

## P7c: Provider And Gateway Metrics

Add real model-call, tool-invocation, token, cost, and latency data only from
sources that can prove their privacy and attribution contract.

Candidate sources:

- xAI passive usage where available
- Venice.ai passive usage where available
- LiteLLM gateway enrichment
- OpenClaw gateway metadata beyond P1-safe service-unit metadata
- backend enrichment from Langfuse, Opik, or PostHog only if their APIs become
  a real source of measured data

Acceptance gates:

- rows in `ai_metrics_model_calls` and `ai_metrics_tool_invocations` are real,
  not synthetic placeholders
- unavailable metrics remain explicit `*_unavailable_not_scored` gaps
- scorecards explain when cost/latency fields are measured versus unavailable
- provider/model/gateway identifiers are low-cardinality and deploy-safe

## P7d: Dashboard And Backend Expansion

Keep Phoenix as the default UI until a second backend has a specific job.

Backend expansion rules:

- Langfuse, Opik, and PostHog remain install/export targets by default.
- Add a backend-specific driver only for a backend API that cannot be modeled
  as OTLP export, static report output, or operator install config.
- Do not expose raw prompt, output, transcript body, local path, or secret
  values in any dashboard.

Acceptance gates:

- backend target decision recorded in the initiative packet
- redacted payload proof for any new backend
- operator command or infra path that can reproduce the deployment

## P7e: Production Readiness

P7 is complete when the stack can survive normal operator use without relying on
the mutable development checkout.

Completion gates:

- collection topology is implemented and documented
- timer/scheduler ownership is explicit and observable
- sync or mirror failure modes are visible in status artifacts
- retention, restore, deletion, and compaction workflows are proven
- real provider/gateway metrics populate measured tables, or remain explicitly
  unavailable and not scored
- final scorecard explains which data came from raw archive, derived storage,
  OTLP traces, labels, benchmarks, and provider/gateway enrichment

