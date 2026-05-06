# AI Metrics Stack

## Status

Active

## Overview

This initiative owns the end-to-end developer AI metrics stack for this repo.
It turns Codex, Claude Code, OpenClaw, xAI, Venice.ai, and optional LiteLLM
gateway activity into privacy-safe raw archives, derived rollups, OTLP traces,
and weekly scorecards that answer whether agent-facing config changes improved
coding-agent performance.

Production-complete means the dankserver tailnet stack is deployed, local smoke
collection works, real sources are flowing, and one seven-day config-impact
scorecard has been generated from live data.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative contract
- [PLAN.md](./PLAN.md) - phased execution plan and progress
- [ops/manifest.json](./ops/manifest.json) - machine-readable phase and gate
  tracking
- [history/outputs/p0-current-state.md](./history/outputs/p0-current-state.md)
  - current implemented scaffold and open gaps
- [history/outputs/p1-source-discovery-and-privacy.md](./history/outputs/p1-source-discovery-and-privacy.md)
  - source discovery, config snapshot, and privacy proof evidence
- [history/outputs/p2-durable-ingest-and-derived-storage.md](./history/outputs/p2-durable-ingest-and-derived-storage.md)
  - encrypted raw archive, DuckDB derived storage, Parquet export, and EventLog
    proof evidence
- [research/effect-native-observability.md](./research/effect-native-observability.md)
  - Effect v4 observability package findings
- [research/backend-shortlist.md](./research/backend-shortlist.md) - backend
  shortlist and default posture

## Current Progress

P0, P1, and P2 are complete enough to use as the starting checkpoint:

- `@beep/repo-ai-metrics` exists with schema-first models, tolerant transcript
  ingest summaries, target-agnostic install specs, benchmark and scorecard
  models.
- `beep-cli ai-metrics` exists with install preview, ingest, source discovery,
  config snapshot, privacy check, durable forwarder, and benchmark command
  scaffolds.
- `@beep/infra` exposes an import-safe `AIMetricsStack` Pulumi component and
  Pulumi entrypoint.
- Source discovery covers Codex, Claude Code, and OpenClaw safe gateway
  metadata without emitting private local paths or service secrets.
- Config snapshots hash repo-owned `.codex`, `.claude`, `.ai`, `.aiassistant`,
  `AGENTS.md`, and `CLAUDE.md` inputs while excluding vendored/generated roots.
- Privacy checks emit sanitized transcript summaries and hash-only event
  envelopes, with synthetic and real local smoke evidence.
- The durable forwarder writes AES-256-GCM encrypted raw archive objects,
  derived DuckDB tables, and per-run Parquet exports.
- Current gaps are explicit in the packet: OTLP export, backend deployment,
  labels, benchmarks, real Pulumi remote apply, and the seven-day scorecard
  proof.

## Completion Standard

This initiative is done only when all are true:

- dankserver tailnet deployment is applied and verified
- Phoenix is receiving real traces or derived exports
- raw encrypted archive and redacted derived views are populated
- Codex, Claude Code, OpenClaw, and optional gateway sources have discovery and
  ingest coverage
- config snapshots are linked to real sessions and benchmark runs
- CLI label review produces outcome labels for real work
- one weekly config-impact scorecard is generated from seven days of live data
