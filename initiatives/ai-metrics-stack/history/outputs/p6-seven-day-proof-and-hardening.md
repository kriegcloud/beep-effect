# P6 Seven-Day Proof And Hardening

## Status

In progress.

## Evidence Captured

- Created the resolving AI metrics 1Password item in `TBK` with concealed
  fields referenced by `op://TBK/ai-metrics/hash-salt` and
  `op://TBK/ai-metrics/raw-archive-key`.
- Switched the shared `@beep/observability` Node SDK OTLP exporters from JSON
  HTTP packages to protobuf HTTP packages after live Phoenix rejected
  `application/json` OTLP trace payloads.
- Added a regression test proving the trace-only Node SDK layer emits
  `application/x-protobuf`.
- Ran live source discovery for the dankserver target with the real hash salt:
  11 files discovered, including 10 recent Codex JSONL files and OpenClaw safe
  gateway metadata.
- Ran the first live forwarder against `.beep/ai-metrics` with the real raw
  archive key and Phoenix OTLP enabled:
  - ingest run: `forwarder-1778118193315`
  - config snapshot:
    `config-910eecbb488885f42c4caea393b4dd4512bee62869a1f0df7c9a27d42839ebf1`
  - source files: 10
  - archive objects created in this run: 2
  - derived turns: 23,830
  - DuckDB path: `.beep/ai-metrics/derived/ai-metrics.duckdb`
  - Parquet export:
    `.beep/ai-metrics/derived/parquet/forwarder-1778118193315`
- Ran explicit redacted OTLP export for the latest derived ingest run:
  - endpoint:
    `https://dankserver.tailc7c348.ts.net:8447/v1/traces`
  - session spans: 10
  - turn spans: 23,830
  - total spans: 23,840
- Verified Phoenix over GraphQL:
  - project: `default`
  - `hasTraces`: `true`
  - `traceCount`: 2
  - `recordCount`: 58,366
- Verified label queue from real data:
  - returned five deploy-safe unlabeled Codex task rows with hash-only source
    identifiers
- Generated a baseline weekly report:
  - Markdown:
    `.beep/ai-metrics/reports/weekly-1777513584078-1778118384078.md`
  - JSON:
    `.beep/ai-metrics/reports/weekly-1777513584078-1778118384078.json`
  - expected gaps: `no_labels`, `no_benchmark_runs`,
    `model_call_metrics_missing`, `tool_invocation_metrics_missing`

## Privacy Checks

- No 1Password secret values were written to checked-in files.
- Temporary secret material was resolved into a `0700` temp directory for the
  live forwarder run and removed by shell trap after the command exited.
- Source discovery, label queue, report output, and OTLP export evidence use
  hashes and counts rather than raw local paths, prompt text, output text, or
  archive keys.
- Raw transcripts are stored only in the ignored `.beep/ai-metrics/raw`
  encrypted archive.

## Remaining Work

- Keep live collection running for a full seven-day window.
- Resume non-local collection with concealed secret loading:
  ```sh
  export BEEP_AI_METRICS_HASH_SALT_SECRET_REF="op://TBK/ai-metrics/hash-salt"
  export BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF="op://TBK/ai-metrics/raw-archive-key"
  export BEEP_AI_METRICS_HASH_SALT="$(op read "$BEEP_AI_METRICS_HASH_SALT_SECRET_REF")"
  export BEEP_AI_METRICS_RAW_ARCHIVE_KEY="$(op read "$BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF")"

  beep-cli ai-metrics forwarder run --target dankserver --data-root .beep/ai-metrics --hash-salt-secret-ref "$BEEP_AI_METRICS_HASH_SALT_SECRET_REF" --raw-archive-key-secret-ref "$BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF" --otlp --otlp-base-url https://dankserver.tailc7c348.ts.net:8447
  beep-cli ai-metrics report weekly --target dankserver --data-root .beep/ai-metrics --hash-salt-secret-ref "$BEEP_AI_METRICS_HASH_SALT_SECRET_REF" --raw-archive-key-secret-ref "$BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF"
  ```
- Add structured outcome labels for real queued tasks.
- Add benchmark cases and benchmark runs linked to the live config snapshot.
- Generate the credited seven-day weekly scorecard after the proof window.
- Document backup, restore, retention, and failure recovery.
- Reconcile the live dankserver deployment into Pulumi state from a shell with
  `PULUMI_CONFIG_PASSPHRASE` or `PULUMI_CONFIG_PASSPHRASE_FILE`.
