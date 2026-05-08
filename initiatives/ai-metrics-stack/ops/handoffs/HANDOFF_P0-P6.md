# AI Metrics Stack P0-P6 Handoff

## Mission

Complete the developer AI metrics stack from current scaffold to deployed
dankserver tailnet service with one seven-day real-data config-impact
scorecard.

## Starting State

P0 through P4 plus P5a are already credited. P5b implementation exists, the
Phoenix backend is live on dankserver at
`https://dankserver.tailc7c348.ts.net:8447`, and the first P6 real-data
forwarder/export proof has reached Phoenix. Pulumi state reconciliation still
needs the local Pulumi passphrase environment. The repo contains:

- `packages/tooling/library/ai-metrics`
- `packages/tooling/tool/cli/src/commands/AIMetrics`
- `infra/src/AIMetrics.ts`
- `infra/Pulumi.yaml`

Treat those as the current implementation base for real-data collection.
P1 added source discovery, config snapshots, and privacy checks. P2 added
durable ingest and storage. P3 added OTLP/Phoenix contracts, local compose
smoke, and redacted derived span export. P4 added labels, benchmarks, and
weekly scorecards. P5a added the non-mutating install plan, doctor, and
dry-run apply operator contract. P5b added `@beep/infra` Pulumi remote command
resources for Phoenix compose/systemd apply, dedicated Tailscale Serve HTTPS on
`8447`, and health checks.

## Decisions To Preserve

- Developer stack first.
- Dankserver tailnet is production; local is smoke.
- OTLP-first; Phoenix is the first default UI.
- Langfuse, Opik, and PostHog stay adapter targets.
- Passive capture first; optional LiteLLM gateway enrichment.
- Encrypted raw archive; redacted derived UI.
- Config snapshots plus outcome-heavy scorecards.
- JSONL/Parquet archive is the deploy-safe raw source of record.
- EventLog is an internal projection proof until it earns promotion.
- Completion requires one weekly report from seven days of real data.

## Phase Instructions

P1 source discovery and privacy:

- completed; see `history/outputs/p1-source-discovery-and-privacy.md`
- preserve the contract that source discovery emits private path hashes, not raw
  local paths
- preserve the contract that privacy checks emit raw event hashes and metadata,
  not prompt/output/message/payload bodies

P2 durable ingest and storage:

- completed; see `history/outputs/p2-durable-ingest-and-derived-storage.md`
- preserve encrypted raw archive and redacted DuckDB/Parquet derived storage

P3 OTLP and backend:

- completed; see `history/outputs/p3-otlp-and-backend-stack.md`
- preserve trace-only Phoenix smoke and metadata-only OpenInference exports
- keep unstable Effect observability/devtools out of deploy-critical paths

P4 scorecards and benchmarks:

- completed; see `history/outputs/p4-scorecards-labels-and-benchmarks.md`
- preserve hash-only task/report metadata and redacted label notes
- keep benchmark cases prompt-hash/reference only until an explicit decrypt or
  prompt registry workflow exists
- use coverage-aware neutral scoring while model/token/cost enrichment remains
  sparse

P5 install and remote deployment:

- P5a completed; see
  `history/outputs/p5a-operator-contract-and-dry-run-apply.md`
- P5b implementation complete; see
  `history/outputs/p5b-real-pulumi-remote-apply.md`
- reconcile Pulumi state from a shell with `PULUMI_CONFIG_PASSPHRASE` or
  `PULUMI_CONFIG_PASSPHRASE_FILE`
- preserve the verified `https://dankserver.tailc7c348.ts.net:8447` Phoenix
  route and the verified Phoenix OTLP export with real redacted traces
- preserve the resolving 1Password refs
  `op://TBK/ai-metrics/hash-salt` and
  `op://TBK/ai-metrics/raw-archive-key`
- use both resolved runtime values and secret-ref flags when resuming
  non-local forwarder/export/report commands:
  ```sh
  export BEEP_AI_METRICS_HASH_SALT_SECRET_REF="op://TBK/ai-metrics/hash-salt"
  export BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF="op://TBK/ai-metrics/raw-archive-key"
  export BEEP_AI_METRICS_HASH_SALT="$(op read "$BEEP_AI_METRICS_HASH_SALT_SECRET_REF")"
  export BEEP_AI_METRICS_RAW_ARCHIVE_KEY="$(op read "$BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF")"
  ```
- optional LiteLLM gateway remains deferred until after the Phoenix-only slice
  is live

P6 proof and hardening:

- first live collection/export proof completed; see
  `history/outputs/p6-seven-day-proof-and-hardening.md`
- continue collecting seven days of live data
- publish first seven-day weekly scorecard
- add outcome labels and benchmark runs for real tasks
- verify backup, restore, retention, and failure recovery

## Stop Conditions

Stop and record the blocker if:

- a source format cannot be discovered locally or documented from the target
  tool
- redaction cannot prove raw prompt/output exclusion
- dankserver remote apply needs host secrets or credentials that are not
  available through the chosen config path
- Phoenix cannot receive OTLP or derived exports through the tailnet route

## Required Evidence

Each completed phase output must record:

- files changed
- commands run
- data samples or fixtures added
- privacy checks performed
- remaining gaps or explicit deferrals
