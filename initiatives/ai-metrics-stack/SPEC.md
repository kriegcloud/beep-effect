# AI Metrics Stack Specification

## Status

**ACTIVE**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-05
- **Updated:** 2026-05-06

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
- Completion evidence: deployed stack plus one seven-day real-data scorecard.

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
- config snapshot hash and changed paths

## Privacy Contract

Raw transcripts and provider payloads are private. They may be retained only in
the encrypted raw archive under the selected target data root. Derived tables,
OTLP payloads, and dashboard events must use redacted text, hashed identifiers,
bounded low-cardinality attributes, and explicit allowlists.

The default privacy mode is `encrypted_raw_redacted_ui`.

Raw archive encryption uses a separate key contract from private identifier
hashing. Install and IaC plans refer to `rawArchiveKeySecretRef`; P2 runtime
commands consume the actual 32-byte base64 key from
`BEEP_AI_METRICS_RAW_ARCHIVE_KEY` or `--raw-archive-key` and do not resolve
secret-manager references themselves.

## Deployment Contract

The local target must support repeatable smoke tests without a remote host.

The dankserver target must use Pulumi remote apply from `@beep/infra` to
install and verify required services, storage directories, tailnet-only access,
OTLP endpoints, Phoenix, optional LiteLLM gateway, and health checks.

Manual host commands may appear as debugging aids but must not be the final
deployment mechanism.

## Completion Criteria

The initiative is complete only when:

- `beep-cli ai-metrics install doctor --target dankserver` passes
- Pulumi preview and apply succeed for the dankserver target
- live collectors populate raw and derived storage
- Phoenix or the selected default UI shows real data
- source discovery covers Codex, Claude Code, OpenClaw, and optional gateway
  logs
- the CLI label queue can record real outcome labels
- benchmark runs are linked to config snapshots
- a seven-day weekly report exists in derived storage and as a readable output
