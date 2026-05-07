# P4 Scorecards, Labels, And Benchmarks

Date: 2026-05-06

Status: completed

## Delivered

- Added deploy-safe `ai_metrics_agent_tasks` rows derived from sessions using
  hash-only repo/source metadata and synthetic task titles.
- Added idempotent DuckDB schema ensure/migration support for P4 task, label,
  benchmark, and scorecard tables.
- Added structured outcome labels with pass/fail, rating, quality gate,
  intervention count, follow-up-fix flag, timestamp, and redacted note.
- Added benchmark case records with prompt hash/reference only, plus recorded
  benchmark run results linked to config snapshots.
- Added coverage-aware weekly scorecard generation that writes Markdown and JSON
  report artifacts and persists scorecard rows in DuckDB.
- Added scriptable CLI workflows:
  - `ai-metrics label queue`
  - `ai-metrics label add`
  - `ai-metrics benchmark case add`
  - `ai-metrics benchmark case list`
  - `ai-metrics benchmark run`
  - `ai-metrics report weekly`

## Boundaries

- `@beep/repo-ai-metrics` owns labels, benchmark records, scorecards, report
  rendering, and derived storage projection semantics.
- `@beep/repo-cli` owns operator-facing commands and output.
- P4 does not invoke Codex, Claude Code, OpenClaw, xAI, Venice.ai, or LiteLLM
  directly. Benchmark execution remains a recorded-result workflow.
- P4 does not deploy the remote dankserver stack. Remote apply, service health
  checks, and tailnet routing remain P5.
- Derived and report data remain prompt/path safe: benchmark prompts are stored
  by hash/reference only, labels redact notes, and task metadata uses hashes.

## Evidence

- `bun run --filter @beep/repo-ai-metrics check`
- `bun run --filter @beep/repo-ai-metrics test -- ingest.test.ts`
- `bun run --filter @beep/repo-ai-metrics lint`
- `bun run --filter @beep/repo-ai-metrics docgen`
- `bun run --filter @beep/repo-cli check`
- `bun run --filter @beep/repo-cli test -- ai-metrics-command.test.ts`
- `bun run --filter @beep/repo-cli lint`
- `bun run --filter @beep/repo-cli docgen`

Synthetic proof coverage includes:

- Durable forwarder writes agent task rows and label queue reads them by rolling
  window.
- Structured labels upsert by task and redact secret-shaped note text.
- Benchmark cases keep prompt content out of derived storage and report output.
- Benchmark runs link to config snapshots.
- Weekly report generation writes Markdown and JSON artifacts, persists
  scorecard rows, and does not include raw transcript text, private temp paths,
  or redacted label secrets.
- DuckDB epoch-millisecond values are passed through string parameters at the
  driver boundary so rolling-window filters avoid 32-bit truncation.

## Deferred To P5+

- `ai-metrics install doctor` and remote apply workflows.
- Dankserver Phoenix deployment, service health checks, storage directories, and
  tailnet-only routing.
- Optional LiteLLM gateway enrichment plus direct xAI/Venice usage enrichment.
- Seven-day live-data proof and hardening.
