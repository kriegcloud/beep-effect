# AI Metrics Stack Specification

## Status

**ACTIVE**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-05
- **Updated:** 2026-05-12

## Purpose

The repo needs a durable, privacy-safe metrics stack for developer AI usage.
The first data product is not generic product analytics. It is a config-impact
scorecard that answers:

- did changes to `.codex`, `.claude`, `.ai`, `.aiassistant`, `AGENTS.md`, or
  `CLAUDE.md` improve coding-agent outcomes?
- did adding or changing repo guidance improve completion rate, quality gates,
  intervention rate, cost, latency, or cycle time?
- which agent/provider/model/gateway paths are effective for this repo?

## Scope

In scope:

- Codex, Claude Code, OpenClaw transcript and session discovery
- xAI and Venice.ai usage where available through passive logs or optional
  LiteLLM gateway enrichment
- config snapshot hashing and attribution
- outcome-heavy scorecards and curated repo benchmarks
- encrypted raw archive plus redacted derived dashboards
- OTLP-first export with Phoenix as the default UI
- local smoke workflow and dankserver tailnet production deployment
- CLI install, doctor, ingest, label, benchmark, and report workflows

Out of scope for v1:

- product/runtime customer AI analytics
- replacing `@beep/observability` as the runtime observability package
- making `effect/unstable/eventlog` the only deploy-safe raw source of record
- exposing raw prompt or transcript bodies in observability UIs
- public internet access to the metrics stack

## Architectural Boundaries

`@beep/repo-ai-metrics` owns developer AI analytics language: source
discovery, transcript ingest, redaction results, raw event envelopes, config
snapshots, benchmark cases, outcome labels, scorecards, install specs, and
export adapters.

`@beep/observability` owns general Effect runtime observability: OTLP layers,
metrics, logs, traces, resource attributes, and reusable runtime signal
helpers. This initiative may use it, but must not move developer AI analytics
semantics into it.

`@beep/infra` owns Pulumi deployment orchestration, including real dankserver
remote apply.

`@beep/duckdb` owns the technical DuckDB boundary: native client execution,
transactions, JSON row reads, and Parquet copy mechanics. AI metrics semantics
remain in `@beep/repo-ai-metrics`.

`@beep/repo-cli` owns operator workflows and user-facing command output.
Diagnostic logging remains Effect logging; command results remain `Console`
output.

## Canonical Decisions

- Production target: dankserver tailnet.
- Smoke target: local workstation.
- Backend posture: OTLP-first with Phoenix as the default UI.
- Swappable targets: Langfuse, Opik, PostHog.
- Capture posture: passive-first with optional LiteLLM gateway enrichment.
- Attribution model: config snapshots plus outcome-heavy scorecards.
- Raw data posture: encrypted raw archive plus redacted UI payloads.
- Durable raw spine: JSONL/Parquet archive as deploy-safe source of record,
  with internal EventLog projection proof.
- Benchmark lane: curated cases plus real outcome labels.
- Labeling workflow: CLI review queue.
- Completion evidence: P6a hardening gates, deployed stack, and one restarted
  seven-day real-data scorecard.
- P7 topology posture: decide collection ownership, sync, retention, deletion,
  and restore before adding provider/gateway enrichment or new dashboards.
- P7 production default: hybrid derived mirror. Raw encrypted archives remain
  workstation-local; only sanitized derived/report/status artifacts may sync to
  dankserver.

## Data Products

The primary data product is the weekly config-impact scorecard. It must compare
config snapshots across real sessions and curated benchmark runs.

Minimum scorecard dimensions:

- task success and failure outcome
- quality gate pass/fail state
- human intervention count
- revert or follow-up fix flag
- elapsed cycle time
- model/provider/gateway path
- token and cost metrics when available
- transcript source and agent tool
- primary/subagent source role and hashed parentage when available
- config snapshot hash, included paths, and actual changed paths

A weekly report is completion-creditable only when it has at least one real
outcome label and at least one benchmark run linked to the scored config
snapshot. Model-call, tool-invocation, token, latency, and cost fields may be
reported as unavailable/not-scored until a real provider/gateway source is
integrated, but they must not be silently treated as measured values.

## Privacy Contract

Raw transcripts and provider payloads are private. They may be retained only in
the encrypted raw archive under the selected target data root. Derived tables,
OTLP payloads, and dashboard events must use redacted text, hashed identifiers,
bounded low-cardinality attributes, and explicit allowlists.

Derived metadata is part of the privacy boundary. Session ids, parent thread
ids, fork ids, local paths, source paths, agent roles/nicknames, raw event ids,
timestamps, tool names, labels, and exception text must be explicitly reviewed
before entering derived DuckDB, Parquet, OTLP, or report payloads. P6a derived
attribution preserves source role and hash-only parentage for Codex subagents;
raw transcript bodies and raw local paths remain excluded from derived outputs.

The default privacy mode is `encrypted_raw_redacted_ui`.

Raw archive encryption uses a separate key contract from private identifier
hashing. Install and IaC plans refer to `rawArchiveKeySecretRef`; P2 runtime
commands consume the actual 32-byte base64 key from
`BEEP_AI_METRICS_RAW_ARCHIVE_KEY` and do not resolve secret-manager references
themselves.

P7 remote mirrors are inside the same privacy contract. Synced bundles may
contain only sanitized manifests, status artifacts, reports, and Parquet
exports from an explicit allowlist of derived tables. They must exclude raw
archive tables, transcript bodies, prompt/output text, local repo or home
paths, source paths, archive paths, DuckDB file paths, and encryption
material.

## Deployment Contract

The local target must support repeatable smoke tests without a remote host.

The dankserver target must use Pulumi remote apply from `@beep/infra` to
install and verify required services, storage directories, tailnet-only access,
OTLP endpoints, Phoenix, and health checks. The first deployable P5b slice is
Phoenix-only on the dedicated tailnet URL
`https://dankserver.tailc7c348.ts.net:8447`; optional LiteLLM gateway
enrichment is deferred until after Phoenix is live.

Manual host commands may appear as debugging aids but must not be the final
deployment mechanism.

P6a live collection is workstation-owned because Codex and Claude raw sources
live on the workstation. The credited proof window must use a local scheduled
runner with a lock, retry/backoff, status artifact, and journal evidence.
During the credited P6 window, that scheduled runner may execute from a locked,
pinned sibling worktree as long as the proof data root, timer budgets, privacy
contract, and source window remain stable and the isolation evidence is
recorded.
Server-owned collection is a P7 topology target and requires a separate
transcript access/sync and privacy design.

The current P7 default remote mirror root is
`/srv/data/ai-metrics/p7-derived-mirror`. Before the P6 proof is credited,
infra work for that root is preview-only and any live proof should use the CLI
mirror workflow without modifying the active proof runner.

## Completion Criteria

The initiative is complete only when:

- `beep-cli ai-metrics install doctor --target dankserver` passes
- Pulumi preview and apply succeed for the dankserver target
- P6a source-aware collection, subagent attribution, scorecard readiness,
  config diffs, metadata allowlist, and archive drill gates pass
- live collection is owned by the workstation timer for the restarted seven-day
  proof and populates raw and derived storage
- Phoenix or the selected default UI shows real data
- source discovery covers Codex, Claude Code, OpenClaw, and optional gateway
  logs
- the CLI label queue can record real outcome labels
- benchmark runs are linked to config snapshots
- a restarted seven-day weekly report exists in derived storage and as a
  readable output, with labels and benchmark evidence sufficient for completion
  credit
