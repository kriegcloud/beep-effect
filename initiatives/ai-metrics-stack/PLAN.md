# AI Metrics Stack Plan

This plan executes [SPEC.md](./SPEC.md). The current target phase is P2 because
P0 bootstrap and P1 source/privacy proof are complete.

## P0: Initiative Bootstrap And Current State

Status: completed

- Create `@beep/repo-ai-metrics` with schema-first models, tolerant JSONL
  ingest summaries, benchmark/scorecard models, and target-agnostic install
  specs.
- Add `beep-cli ai-metrics` command scaffolding for install preview, ingest,
  forwarder, and benchmark workflows.
- Add `@beep/infra` `AIMetricsStack` as an import-safe Pulumi contract.
- Record current gaps in `history/outputs/p0-current-state.md`.

## P1: Source Discovery And Privacy

Status: completed

- Added source discovery for Codex, Claude Code, and OpenClaw safe gateway
  metadata, with configurable repo/home/unit roots, last-seven-days defaults,
  `--since`, `--max-files`, and `--all`.
- Replaced the install-spec hardcoded transcript assumption with source
  discovery, config snapshot, and privacy-check planned commands.
- Added redaction result schemas, hash-only raw event envelopes, sanitized
  transcript projections, and salted private identifier hashes.
- Added deterministic config snapshots for `.codex`, `.claude`, `.ai`,
  `.aiassistant`, `AGENTS.md`, and `CLAUDE.md`, excluding `.repos`,
  `node_modules`, generated, cache, and build roots.
- Added synthetic tests and CLI smoke tests proving raw prompt/output text,
  secrets, and private local paths do not leak into derived JSON outputs.
- Recorded evidence in
  [history/outputs/p1-source-discovery-and-privacy.md](./history/outputs/p1-source-discovery-and-privacy.md).

## P2: Durable Ingest And Derived Storage

Status: pending

- Write encrypted raw JSONL archive files under the target data root.
- Materialize derived Parquet and DuckDB tables for sessions, turns, model
  calls, tool invocations, labels, benchmark runs, and scorecards.
- Add replay/projection interfaces and an internal EventLog memory/SQL proof.
- Add idempotent ingest keys so re-running collectors does not duplicate
  derived events.

## P3: OTLP And Backend Stack

Status: pending

- Use core Effect `Metric`, `Tracer`, `Logger`, `LogLevel`, `ErrorReporter`,
  `Clock`, and `Redacted` APIs as the instrumentation vocabulary.
- Export through stable `@effect/opentelemetry/NodeSdk.layer` for v1.
- Keep `effect/unstable/observability` and `effect/unstable/devtools` as later
  or experimental references.
- Deploy Phoenix as the default UI and keep Langfuse, Opik, and PostHog behind
  adapter contracts.
- Add low-cardinality OTLP attribute policy for agent, source, provider, model,
  config snapshot, and outcome labels.

## P4: Scorecards, Labels, And Benchmarks

Status: pending

- Add `ai-metrics label review` for quick human labels on recent sessions and
  tasks.
- Add curated benchmark cases that can run against named config snapshots.
- Compare real sessions and benchmark runs with the outcome-heavy score model.
- Generate a weekly config-impact report from derived tables.

## P5: Install And Remote Deployment

Status: pending

- Expand `ai-metrics install` into `plan`, `doctor`, and `apply` workflows.
- Use `@beep/infra` and Pulumi remote apply to configure dankserver storage,
  services, tailnet-only routing, Phoenix, optional LiteLLM gateway, and health
  checks.
- Preserve local as the repeatable smoke target.

## P6: Seven-Day Proof And Hardening

Status: pending

- Run live collection for seven days.
- Generate the first weekly scorecard from real data.
- Verify raw archive, derived DuckDB/Parquet tables, OTLP traces, labels,
  benchmarks, and dashboard views.
- Document backup, restore, retention, and failure recovery.

## Required Checks

- `bun run check`
- `bun run config-sync`
- `@beep/repo-ai-metrics`: `check`, `test`, `lint`, `docgen`
- `@beep/repo-cli`: `check`, `test`, `lint`
- `@beep/infra`: `check`, `test`, `lint`
- CLI smoke for source discovery, ingest, install plan/doctor, labels,
  benchmarks, and report generation
- Pulumi preview and apply for the dankserver target
