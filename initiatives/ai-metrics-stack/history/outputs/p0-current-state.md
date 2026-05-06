# P0 Current State

## Status

Completed on 2026-05-05.

## Implemented Surfaces

`@beep/repo-ai-metrics` exists under `packages/tooling/library/ai-metrics`.
It currently provides:

- deploy targets: `local`, `dankserver`
- candidate tools: `langfuse`, `phoenix`, `opik`, `posthog`
- transcript sources: `codex`, `claude`, `openclaw`
- privacy modes including `encrypted_raw_redacted_ui`
- score weights with outcome-heavy defaults
- config snapshot, task, session, turn, model call, tool invocation, label,
  benchmark, run, scorecard, and ingest summary models
- tolerant JSONL transcript summarization
- target-agnostic install specs

`beep-cli ai-metrics` exists under `packages/tooling/tool/cli`. It currently
provides:

- `install preview`
- `ingest`
- `forwarder run`
- `benchmark run`
- `benchmark compare`

`@beep/infra` exposes `AIMetricsStack`, `loadAIMetricsStackArgs`, and a Pulumi
entrypoint for the AI metrics contract.

## Verified Before Packet Creation

The scaffold was previously verified with:

- root `bun run check`
- root `bun run config-sync`
- `@beep/repo-ai-metrics` `check`, `test`, `lint`, and `docgen`
- `@beep/repo-cli` `check` and `lint`
- `@beep/infra` `check`, `test`, and `lint`
- CLI smoke for JSONL ingest
- CLI smoke for `install preview --target dankserver --tool phoenix --json`

## Known Gaps

- Source discovery is not implemented.
- Current planned install command references `ai-metrics ingest --target`, but
  the CLI ingest command does not yet accept `--target`.
- Forwarder mode prints a contract but does not yet copy, normalize, or export
  raw/derived data.
- Redaction, encrypted raw archive, Parquet, and DuckDB materialization are not
  implemented.
- Phoenix, optional LiteLLM gateway, and tailnet service deployment are not
  implemented.
- Pulumi component is import-safe but does not yet perform real remote apply.
- CLI label review queue is not implemented.
- Weekly config-impact report generation is not implemented.
- EventLog projection proof is not implemented.

## Next Phase

P1 should implement source discovery and privacy contracts before expanding
deployment. Without that, later phases risk hardcoding local assumptions into
the stack.
