# @beep/repo-ai-metrics

Schema-first metrics, transcript-ingest, scorecard, install, mirror, and
retention models for repo-local AI-agent analytics.

This is a tooling library, not product runtime language. It owns developer
operational concepts such as Codex/Claude/OpenClaw transcript ingestion,
benchmark scorecards, local/tailnet install specs, generated local Phoenix
compose smoke targets, redacted OTLP span projections, structured labels,
recorded benchmark runs, and weekly config-impact reports. Product usage
records in `agents` or `epistemic` should map to this package only
through explicit adapter code when a proof benchmark needs to compare the two
worlds.

P3 keeps backend-specific clients out of this package. Phoenix, Langfuse, Opik,
and PostHog are install/export targets until a backend-specific API is needed;
runtime OTLP wiring stays in `@beep/observability`.

P4 keeps scorecard artifacts deploy-safe: task metadata is hash-only, benchmark
prompts are stored by hash/reference only, label notes are redacted before
storage, and reports use coverage-aware neutral scoring while model/token/cost
enrichment remains sparse.

P5a keeps installer workflows contract-first: `plan`, `doctor`, and
dry-run-only `apply` use typed schemas, stdout/JSON output, Phoenix-only
concrete deployment steps, and no local or remote mutation. P5b keeps real
dankserver mutation in `@beep/infra`, where Pulumi remote commands deploy
Phoenix to the dedicated tailnet URL
`https://dankserver.tailc7c348.ts.net:8447`.

P6 keeps `forwarder run --otlp` additive: the forwarder still persists
encrypted raw archive objects plus derived DuckDB/Parquet outputs first, then
attempts a derived OTLP export for the same ingest run. The forwarder JSON
contains `otlpExport` only when OTLP is requested, with a tagged `exported` or
`failed` status so local collection evidence remains readable even when the
backend export fails.

P7a keeps production mirroring deploy-safe with sanitized derived bundles. Raw
encrypted transcript archives remain workstation-local; mirror bundles contain a
manifest, status report, and Parquet exports from an explicit safe table
allowlist. Raw archive object rows, local source paths, archive paths,
transcript bodies, prompt/output text, and secret-shaped fields are omitted or
hashed before export.

P7b keeps retention workflows operator-led and local-first. Inventory and
restore drills can prove retained encrypted archive objects without printing
transcript text, while real delete and compact operations require an explicit
time window and confirmation token. Provider/model/tool/token/cost enrichment
and dashboard expansion remain later P7 slices.

Snapshot self-pruning: `forwarder run` defaults `--parquet-mode snapshot`, which
writes a full per-run export to `derived/parquet/forwarder-<epochMillis>/`. To
keep `.beep/ai-metrics` from growing unbounded, the local `run` command now
always enforces retention after a successful run, keeping the newest
`--max-snapshot-exports` exports (default 5) and pruning the rest via
`enforceAiMetricsRetentionPolicy`. Each export is a full cumulative dump of the
derived DuckDB tables, so older snapshots are redundant subsets of the newest.
To reclaim accumulated snapshots manually, run
`ai-metrics retention enforce --max-snapshot-exports <keep> --confirm p7-retention-window`
(omit `--confirm` for a dry-run preview).
