# P2 Durable Ingest And Derived Storage

Date: 2026-05-06

Status: completed

## Delivered

- Added `@beep/duckdb` as the driver-owned technical boundary for DuckDB Node
  API execution, transactions, JSON row reads, and Parquet export.
- Added encrypted raw archive support in `@beep/repo-ai-metrics` using
  AES-256-GCM with a 32-byte base64 key and a random nonce per archive object.
- Made raw archive objects content-addressed by source kind, salted source path
  hash, and plaintext content hash so repeated forwarder runs do not rewrite
  the same raw object.
- Added derived DuckDB storage for ingest runs, source files, raw archive
  objects, sessions, and turn/raw-event envelopes.
- Added future-ready empty DuckDB tables for model calls, tool invocations,
  outcome labels, benchmark runs, and scorecards.
- Added per-run Parquet exports for every derived table.
- Upgraded `beep-cli ai-metrics forwarder run` from a contract printout to a
  durable local workflow.
- Kept `beep-cli ai-metrics ingest` as summary-only.
- Added a separate raw archive key contract:
  `rawArchiveKeySecretRef` for install/IaC planning and
  `BEEP_AI_METRICS_RAW_ARCHIVE_KEY` or `--raw-archive-key` for runtime.
- Added an internal in-memory Effect EventLog proof for sanitized turn
  projection.
- Updated the dankserver Pulumi stack config with
  `aiMetrics:rawArchiveKeySecretRef`.

## Boundaries

- `@beep/repo-ai-metrics` owns AI metrics semantics, privacy posture,
  projection rules, and forwarder workflow.
- `@beep/duckdb` owns DuckDB execution, transactions, and Parquet copy
  mechanics.
- The CLI provides the DuckDB service at the command boundary so library code
  does not dynamically provide Layers.
- P2 does not resolve `op://` secret references at runtime. Operators provide
  the actual raw archive key through the environment or CLI flag.
- P2 does not expose a raw decrypt CLI command.

## Evidence

- `bun run --filter @beep/duckdb check`
- `bun run --filter @beep/duckdb test`
- `bun run --filter @beep/repo-ai-metrics check`
- `bun run --filter @beep/repo-ai-metrics test`
- `bun run --filter @beep/repo-cli check`
- `bun run --filter @beep/repo-cli test -- ai-metrics-command.test.ts`
- `bun run --filter @beep/infra check`
- `bun run config-sync`

Synthetic proof coverage includes:

- Durable forwarder reads Codex and Claude JSONL.
- Raw archive files do not contain raw transcript text.
- Archive decrypt succeeds only through package-level test helper and key.
- DuckDB derived tables contain the expected turn count.
- Per-run Parquet export exists for derived turn data.
- CLI forwarder JSON does not expose raw transcript content.
- Effect EventLog in-memory proof writes and handles sanitized turn events.

## Deferred To P3+

- OTLP export and backend adapter contracts.
- Phoenix deployment and optional Langfuse, Opik, PostHog, and LiteLLM
  services.
- xAI, Venice, LiteLLM, and gateway enrichment beyond local transcript files.
- Label review CLI, benchmark execution, weekly scorecard, and seven-day
  real-data proof.
