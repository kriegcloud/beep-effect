# P7 Topology-First Production Plan

## Status

Decision-complete and partially implemented. P7a/b landed without disturbing
the active P6 seven-day proof. Final P7e production closeout remains pending
until the proof window can be credited. P7c provider/gateway metrics and P7d
dashboard expansion are follow-up capabilities, not V1 blockers, when their
metrics remain explicitly unavailable and not scored.

P7 must not rewrite the P6 proof while it is running. This slice turns the
workstation-owned proof into a hybrid mirror plus retention topology with
explicit ownership and privacy boundaries, while deferring provider or gateway
enrichment.

## Goal

Move from workstation-owned live collection to a production collection topology
that can answer the same scorecard questions without depending on a mutable
developer checkout.

The center of gravity is topology first:

1. Decide where raw transcript access is owned.
2. Decide what may sync off the workstation.
3. Prove retention, deletion, restore, and re-derivation.
4. Close V1 with explicit unavailable/not-scored provider metrics if no real
   provider source is ready.
5. Add provider/gateway usage metrics only after the raw/derived boundary is
   explicit.
6. Expand dashboard backends only when the backend-specific API need is real.

## Implemented Decision

Chosen topology: hybrid derived mirror.

- Raw encrypted transcripts remain workstation-local in the existing AI metrics
  raw archive.
- Derived/report/status artifacts may sync to dankserver only after a P7-safe
  allowlist export step.
- The default remote mirror root is
  `/srv/data/ai-metrics/p7-derived-mirror`.
- `mirror sync` is dry-run by default and requires
  `--confirm p7-derived-mirror` before rsync writes.
- P7 retention mutations remain local-root workflows in this slice; remote
  mirror pruning is still an operator-managed follow-up.

## Trust Boundary

Data classes for this slice:

- raw: encrypted transcript archive objects and decrypt-only restore inputs;
  workstation-local only
- derived: sanitized DuckDB tables and P7-safe Parquet exports
- status: mirror manifests, status JSON, retention inventory, and operator
  drill results
- reports: weekly Markdown or JSON reports that already satisfy the derived
  privacy contract
- dashboards: Phoenix OTLP traces plus any mirror-fed derived inspection

Explicit exclusions from the remote mirror:

- `ai_metrics_raw_archive_objects`
- transcript bodies, prompt text, and output text
- `archive_path`, `rawArchiveDir`, `duckDbPath`, and other local filesystem
  paths
- repo root, home dir, and source file paths
- ciphertext, nonce, and raw archive key material

## Doctrine Fit

- `@beep/repo-ai-metrics` remains the tooling library that owns developer AI
  analytics semantics.
- `@beep/repo-cli` remains the operator workflow surface.
- `@beep/duckdb` remains the DuckDB driver boundary.
- `@beep/observability` remains general runtime observability and does not
  absorb AI metrics semantics.
- `@beep/infra` owns deployable topology on dankserver.
- Backend-specific SDKs become `drivers/*` only when the initiative needs a
  real API wrapper beyond OTLP/install/export contracts.

No architecture doctrine change is required for P7 planning. This is
initiative-level topology and operator workflow design inside the existing
tooling, infra, driver, and observability boundaries.

## P7a: Collection Topology Decision

Status: implemented

Considered topologies:

- workstation scheduled collection with redacted sync to dankserver
- workstation raw archive with remote derived mirror
- server-owned collection with explicit transcript sync
- hybrid collection where raw remains local and only derived DuckDB/Parquet plus
  OTLP spans leave the workstation

Chosen topology: hybrid collection. Raw encrypted archives remain
workstation-local unless a transcript-sync design earns explicit privacy
approval; only sanitized derived DuckDB/Parquet, report, and status artifacts
may sync to dankserver after the metadata allowlist is re-verified.

Implemented workflows:

- `beep ai-metrics mirror build --target dankserver --data-root <root> --json`
- `beep ai-metrics mirror sync --bundle latest --host dankserver-yubi --remote-root /srv/data/ai-metrics/p7-derived-mirror --json`
- `beep ai-metrics mirror status --host dankserver-yubi --remote-root /srv/data/ai-metrics/p7-derived-mirror --json`

`mirror build` creates a sanitized bundle rooted at
`<dataRoot>/mirror/bundles/<bundleId>` with:

- `manifest.json`
- `status/mirror-status.json`
- `parquet/*.parquet` exports from the P7-safe table allowlist

`mirror sync` uses rsync over SSH, prints planned commands in dry-run mode, and
requires `--confirm p7-derived-mirror` for a real sync.

Acceptance gates:

- topology decision and trust boundary written in the initiative packet
- explicit raw, derived, status, report, and dashboard data classes
- dry-run plus explicit-confirmation sync semantics
- proofed exclusion of local source paths, transcript bodies, archive paths,
  DuckDB paths, and encryption material from the synced bundle

## P7b: Retention, Restore, And Deletion

Status: implemented for local-root operator workflows

Promoted P6 runbook notes into executable operator workflows.

Required capabilities:

- list retained raw archive objects and derived exports by window
- drill archive decrypt without printing transcript text
- re-derive DuckDB and Parquet from retained raw archive objects
- delete a proof window from raw, derived, report, and optional remote mirrors
- compact or prune old Parquet/report outputs after the retention window

Implemented workflows:

- `beep ai-metrics retention list --data-root <root> --json`
- `beep ai-metrics retention restore-drill --data-root <root> --restore-root <disposable-root> --before/--since/--until ... --json`
- `beep ai-metrics retention delete --data-root <root> --before/--since/--until ... --json`
- `beep ai-metrics retention compact --data-root <root> --before/--since/--until ... --json`

`delete` and `compact` default to dry-run, require an explicit time window, and
require `--confirm p7-retention-window` for real mutation. The restore drill
verifies raw archive decrypt plus content-hash integrity, then replays into a
disposable derived root without mutating the active P6 data root.

Acceptance gates:

- restore drill from retained raw archive to disposable derived report storage
- deletion and compaction drills against disposable local targets
- transcript text never printed during restore proof
- clear distinction between local-root retention automation and remote mirror
  follow-up work

## P7c: Provider And Gateway Metrics

Status: follow-up, not V1-blocking

Add real model-call, tool-invocation, token, cost, and latency data only from
sources that can prove their privacy and attribution contract.

Candidate sources:

- xAI passive usage where available
- Venice.ai passive usage where available
- LiteLLM gateway enrichment
- OpenClaw gateway metadata beyond P1-safe service-unit metadata
- backend enrichment from Langfuse, Opik, or PostHog only if their APIs become
  a real source of measured data

Acceptance gates:

- rows in `ai_metrics_model_calls` and `ai_metrics_tool_invocations` are real,
  not synthetic placeholders
- unavailable metrics remain explicit `*_unavailable_not_scored` gaps
- scorecards explain when cost/latency fields are measured versus unavailable
- provider/model/gateway identifiers are low-cardinality and deploy-safe

## P7d: Dashboard And Backend Expansion

Status: follow-up, not V1-blocking

Keep Phoenix as the default UI until a second backend has a specific job.

Backend expansion rules:

- Langfuse, Opik, and PostHog remain install/export targets by default.
- Add a backend-specific driver only for a backend API that cannot be modeled
  as OTLP export, static report output, or operator install config.
- Do not expose raw prompt, output, transcript body, local path, or secret
  values in any dashboard.

Acceptance gates:

- backend target decision recorded in the initiative packet
- redacted payload proof for any new backend
- operator command or infra path that can reproduce the deployment

## P7e: Production Readiness

Status: pending

P7e is the V1 closeout pass after the credited P6 report exists. V1 is complete
when the stack can survive normal operator use without relying on the mutable
development checkout and when unavailable provider/gateway metrics are explicit
rather than silently treated as measured values.

Completion gates:

- collection topology is implemented and documented
- timer/scheduler ownership is explicit and observable
- a sanitized derived mirror is built from the active data root after the final
  report and confirmed on dankserver
- sync or mirror failure modes are visible in status artifacts
- retention, restore, deletion, and compaction workflows are proven
- real provider/gateway metrics populate measured tables, or remain explicitly
  unavailable and not scored
- final scorecard explains which data came from raw archive, derived storage,
  OTLP traces, labels, benchmarks, and provider/gateway enrichment
