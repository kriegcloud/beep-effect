# P6a Fresh Review And Hardening

## Status

Completed.

The fresh review found the initiative is directionally correct, but P6 should
pause before its seven-day proof is credited. The earlier `.beep/ai-metrics`
evidence remains baseline pre-P6a evidence; the official seven-day window now
starts from the closeout evidence below.

Closeout follow-up branch `ops/ai-metrics-p6a-closeout` passed the restart
gates on May 9, 2026 and restarted the credited P6 proof window. Evidence is
recorded in
[p6a-closeout-proof-restart.md](./p6a-closeout-proof-restart.md).

## Review Findings

- Codex subagent sessions were detectable in raw `session_meta` lines but were
  flattened into ordinary Codex sessions in derived tables.
- The forwarder was runnable on demand, but the credited proof needed an owned
  scheduler, lock, retry/backoff, status artifact, and journal evidence.
- Scorecards could render with neutral placeholder scores while labels,
  benchmarks, model/tool rows, token/cost, and latency metrics were empty.
- Config snapshots listed included paths as changed paths, so scorecards could
  not mechanically explain before/after config causality.
- Forwarder file selection used a global limit that could crowd out lower
  recency sources.
- Phoenix was live, but Pulumi state reconciliation and live-version alignment
  remained gates before restarting the proof.
- Secret references were mixed with runtime secret values in operator examples;
  commands that decrypt or archive raw transcripts need actual
  `BEEP_AI_METRICS_RAW_ARCHIVE_KEY` values.
- Privacy needed to treat metadata as part of the derived boundary, not only
  prompt/output text.
- Backup, restore, retention, deletion, and archive decrypt proof were
  under-specified.

## Implemented P6a Hardening

- Added hash-only source attribution for primary vs subagent work, including
  available Codex session/thread/fork/role/nickname metadata.
- Persisted attribution through sanitized privacy projections, derived DuckDB
  source/session/turn tables, Parquet exports, label queues, and OTLP span
  projections.
- Added per-source forwarder coverage so `maxFiles` limits Codex, Claude Code,
  and OpenClaw independently.
- Added config snapshot manifests, `latest.json`, included paths, actual
  changed paths, and added/modified/removed/unchanged diff fields.
- Added scorecard `completionReady`; missing labels or benchmark runs now block
  completion credit instead of silently passing as neutral data.
- Added explicit not-scored coverage gaps for unavailable model/tool/cost data.
- Added an OTLP attribute allowlist for derived AI metrics spans.
- Added a workstation systemd user timer render path with lock, retry/backoff,
  status file, and journal commands.
- Added an archive decrypt drill that verifies one raw archive object without
  printing transcript text.
- Updated install-plan commands to use `op read` for runtime secret values
  while preserving secret refs as metadata.

## Review Loop Evidence

- `quality-review-fix-loop` reviewer rerounds closed the P6a blockers for
  subagent attribution, operator workflow, privacy/security, data correctness,
  and migration defaults.
- The secret-backed archive drill passed with matching plaintext hash and did
  not print transcript bodies or secret values.
- Focused `@beep/repo-ai-metrics` and `@beep/repo-cli` check, test, lint, and
  docgen lanes passed.
- Full `bash scripts/run-github-checks.sh quality` passed after the final
  source-role migration fallback fix.

## Restart Gates

- `@beep/repo-ai-metrics` focused checks and tests passed.
- `@beep/repo-cli` focused checks and tests passed.
- Source discovery and forwarder JSON show source-aware coverage plus bounded
  `--max-file-bytes` protection for scheduled runs.
- DuckDB rows can distinguish primary and subagent sessions without raw text or
  raw local paths.
- Weekly scorecard has `completionReady=true` for restarted config snapshot
  `config-d0b05a2d64c9c40c21e0df11f8cfc611be5ce41139f52f4db79b77f73ca895bc`.
- Workstation timer units are rendered, installed, active, and visible in the
  user journal before the credited window starts.
- Archive decrypt drill passed without printing transcript text.
- Pulumi preview/apply/health passed for `beep-ai-metrics-dankserver`, and
  live Phoenix version drift is resolved at `15.5.0`.
- Retention, deletion, backup, restore, and archive decrypt runbook text is in
  the closeout output.

## Deferred P7 Follow-Ups

- True server-owned collection with a transcript access/sync and privacy
  topology.
- Real provider/gateway model-call, token, cost, and latency integrations for
  xAI, Venice.ai, LiteLLM, OpenClaw enrichment, Langfuse, Opik, and PostHog.
