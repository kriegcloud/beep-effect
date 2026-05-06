# AI Metrics Stack P0-P6 Handoff

## Mission

Complete the developer AI metrics stack from current scaffold to deployed
dankserver tailnet service with one seven-day real-data config-impact
scorecard.

## Starting State

P0 and P1 are already credited. The repo contains:

- `packages/tooling/library/ai-metrics`
- `packages/tooling/tool/cli/src/commands/AIMetrics`
- `infra/src/AIMetrics.ts`
- `infra/Pulumi.yaml`

Treat those as the current implementation base, not as final deploy readiness.
P1 added source discovery, config snapshots, and privacy checks; P2 starts with
durable ingest and storage.

## Decisions To Preserve

- Developer stack first.
- Dankserver tailnet is production; local is smoke.
- OTLP-first; Phoenix is the first default UI.
- Langfuse, Opik, and PostHog stay adapter targets.
- Passive capture first; optional LiteLLM gateway enrichment.
- Encrypted raw archive; redacted derived UI.
- Config snapshots plus outcome-heavy scorecards.
- JSONL/Parquet archive is the deploy-safe raw source of record.
- EventLog is an internal projection proof until it earns promotion.
- Completion requires one weekly report from seven days of real data.

## Phase Instructions

P1 source discovery and privacy:

- completed; see `history/outputs/p1-source-discovery-and-privacy.md`
- preserve the contract that source discovery emits private path hashes, not raw
  local paths
- preserve the contract that privacy checks emit raw event hashes and metadata,
  not prompt/output/message/payload bodies

P2 durable ingest and storage:

- write encrypted raw archive
- derive DuckDB and Parquet tables
- add idempotent ingest keys
- add EventLog memory/SQL projection proof behind an internal boundary

P3 OTLP and backend:

- instrument collectors with Effect `Metric`, `Tracer`, `Logger`, and
  `ErrorReporter`
- export with stable `@effect/opentelemetry`
- deploy Phoenix as the default UI
- keep unstable Effect observability/devtools out of deploy-critical paths

P4 scorecards and benchmarks:

- add CLI label review queue
- add curated benchmark cases
- link runs to config snapshots
- generate weekly config-impact reports

P5 install and remote deployment:

- expand install plan/doctor/apply commands
- make Pulumi remote apply configure dankserver
- deploy storage, services, OTLP endpoint, Phoenix, optional LiteLLM gateway,
  and tailnet-only access

P6 proof and hardening:

- collect seven days of live data
- publish first weekly scorecard
- verify backup, restore, retention, and failure recovery

## Stop Conditions

Stop and record the blocker if:

- a source format cannot be discovered locally or documented from the target
  tool
- redaction cannot prove raw prompt/output exclusion
- dankserver remote apply needs host secrets or credentials that are not
  available through the chosen config path
- Phoenix cannot receive OTLP or derived exports through the tailnet route

## Required Evidence

Each completed phase output must record:

- files changed
- commands run
- data samples or fixtures added
- privacy checks performed
- remaining gaps or explicit deferrals
