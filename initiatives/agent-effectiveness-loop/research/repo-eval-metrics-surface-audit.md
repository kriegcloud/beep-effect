# Repo Eval And Metrics Surface Audit

## Status

Phase 0 research artifact for `agent-effectiveness-loop`.

This audit maps the repo-local eval and metrics surfaces that already exist,
the work that the existing packets still classify as planned/follow-up, and the
surfaces that must not be disturbed while agent-effectiveness planning happens.
It is intentionally docs-only: no production code, infra, timer, deployment, or
agent config behavior was changed for this artifact.

## Scope And Evidence

Primary packets inspected:

- `initiatives/agent-effectiveness-loop/{README.md,SPEC.md,PLAN.md,ops/manifest.json}`
- `initiatives/ai-metrics-stack/{README.md,SPEC.md,PLAN.md,ops/manifest.json}`
- `initiatives/ai-metrics-stack/history/outputs/*.md`
- `initiatives/jsdoc-worker-eval/{README.md,SPEC.md,PLAN.md,ops/manifest.json}`
- `initiatives/jsdoc-worker-eval/research/*.md`
- `initiatives/jsdoc-worker-eval/history/outputs/*.json`

Primary code surfaces inspected:

- `packages/tooling/library/ai-metrics`
- `packages/tooling/tool/cli/src/commands/AIMetrics/index.ts`
- `packages/tooling/tool/cli/src/commands/Docgen/index.ts`
- `packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts`
- `packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerRunpodEval.ts`
- `packages/foundation/capability/observability`
- `packages/drivers/duckdb`
- `infra/src/AIMetrics.ts`
- `infra/test/AIMetrics.test.ts`
- `standards/ARCHITECTURE.md`
- `standards/architecture/07-non-slice-families.md`
- `standards/architecture/12-observability.md`

Commands used for discovery:

```sh
rg --files initiatives | rg "(agent-effectiveness-loop|ai-metrics-stack|jsdoc-worker-eval|metrics|eval)"
rg --files packages infra standards | rg "(repo-ai-metrics|AIMetrics|ai-metrics|quality-worker-eval|forwarder|otlp|mirror|retention)"
rg -n "label|benchmark|weekly|forwarder|OTLP|mirror|retention|follow-up|must not" initiatives/ai-metrics-stack packages/tooling
```

## Executive Classification

Existing:

- `@beep/repo-ai-metrics` exists at `packages/tooling/library/ai-metrics` as a
  private tooling library with schema-first models and helpers for source
  discovery, ingest, encrypted raw archive, derived DuckDB/Parquet storage,
  config snapshots, forwarder runs, OTLP projection/export, labels,
  benchmarks, weekly scorecards, mirror bundles, retention, and install specs.
- `beep ai-metrics` exists in `@beep/repo-cli` at
  `packages/tooling/tool/cli/src/commands/AIMetrics/index.ts` and exposes the
  operator workflows the AI-metrics packet names.
- `beep docgen quality-worker-eval` and
  `beep docgen quality-worker-eval-runpod` exist in `@beep/repo-cli` and are
  intentionally read-only eval surfaces.
- Phoenix is the default UI and OTLP target for the AI-metrics stack, with
  deployment owned by `@beep/infra`.

Planned/follow-up:

- AI-metrics P7e closeout remains the packeted V1 completion gate until a final
  seven-day report and confirmed sanitized derived mirror are recorded.
- P7c provider/model/tool/token/cost enrichment and P7d dashboard/backend
  expansion are follow-up capabilities, not blockers for V1.
- Server-owned collection is a future topology target requiring transcript
  access/sync and privacy design.
- `jsdoc-worker-eval` auto-remediation, human draft acceptance rubrics, and
  repeated remote Qwen cost reductions are follow-up initiatives, not current
  write-mode permission.

Must not be disturbed:

- Do not change the active AI-metrics proof runner, timer cadence, source
  window, proof data root, or privacy contract while the existing packet still
  treats P6/P7e closeout as active.
- Do not mutate Phoenix projects, datasets, prompts, annotations, traces,
  experiments, or server config during this research bootstrap.
- Do not sync raw transcripts, local paths, source paths, archive paths,
  prompt/output text, decrypted bodies, or secret values into reports, mirrors,
  OTLP spans, or research artifacts.
- Do not move developer AI analytics semantics into `@beep/observability`,
  `shared/*`, product slices, generic foundation packages, or backend drivers.
- Do not treat worker-eval output as source of truth or make it blocking
  enforcement.

## Surface Inventory

| Surface | Exists | Planned / Follow-Up | Must Not Disturb | Evidence |
|---|---|---|---|---|
| `@beep/repo-ai-metrics` | Yes. `package.json`, `README.md`, and `src/index.ts` export archive, compose, config snapshot, derived storage, forwarder, ingest, install, mirror, models, OTLP, privacy, retention, scorecard, shell, and source-discovery modules. | Provider/gateway enrichment and dashboard expansion remain later P7 work. | Keep developer AI analytics semantics here; do not promote them into shared kernel, product slices, or `@beep/observability`. | `packages/tooling/library/ai-metrics/package.json`; `packages/tooling/library/ai-metrics/README.md`; `packages/tooling/library/ai-metrics/src/index.ts`; `initiatives/ai-metrics-stack/SPEC.md` |
| `beep ai-metrics` CLI | Yes. Root command exposes ingest, source discovery, config snapshots, privacy checks, install workflows, forwarder, OTLP export, labels, benchmarks, reports, mirror, retention, and archive drill. | Future agent-effectiveness workflows should bind to this CLI where they reuse existing data products. | Do not add commands that bypass privacy, confirmation, or dry-run gates. | `packages/tooling/tool/cli/src/commands/AIMetrics/index.ts`; `packages/tooling/tool/cli/test/ai-metrics-command.test.ts` |
| Forwarder | Yes. `forwarder run` writes encrypted raw archive objects, derived DuckDB rows, Parquet exports, config snapshots, and optional OTLP status. `forwarder timer` renders workstation systemd units with bounded budgets. | Server-owned collection remains future topology work. | Do not re-render or alter active proof runner/timer behavior unless the owning AI-metrics closeout explicitly calls for it. | `packages/tooling/library/ai-metrics/src/forwarder.ts`; `packages/tooling/library/ai-metrics/test/ingest.test.ts`; `initiatives/ai-metrics-stack/history/outputs/p6-proof-runner-isolation-and-runbook.md` |
| OTLP export | Yes. `otlp export` projects redacted derived DuckDB rows into allowlisted trace spans. `forwarder run --otlp` performs additive export after storage succeeds. | Backend-specific APIs are still deferred until a real non-OTLP need exists. | Preserve the attribute allowlist and hash-only identifiers. OTLP must not carry raw prompts, output text, local paths, or secret-shaped data. | `packages/tooling/library/ai-metrics/src/otlp.ts`; `packages/tooling/tool/cli/test/ai-metrics-command.test.ts`; `initiatives/ai-metrics-stack/history/outputs/p3-otlp-and-backend-stack.md` |
| Labels | Yes. `label queue` lists deploy-safe unlabeled tasks and `label add` records structured human outcome labels with rating, pass/fail, quality gate, intervention count, follow-up flag, and redacted note. | More labels may be added only from explicit human outcome judgment. | Do not fabricate labels from model output or worker-eval suggestions. | `packages/tooling/library/ai-metrics/src/scorecard.ts`; `packages/tooling/tool/cli/src/commands/AIMetrics/index.ts`; `initiatives/ai-metrics-stack/history/outputs/p4-scorecards-labels-and-benchmarks.md` |
| Benchmarks | Yes. `benchmark case add/list`, `benchmark run`, and `benchmark compare` exist. Benchmark cases store prompt hashes/refs rather than prompt text and runs link to config snapshots. | Additional benchmark curation is useful for agent-effectiveness loops, but should reuse the existing benchmark tables and commands. | Do not store benchmark prompt bodies in derived storage or reports. | `packages/tooling/library/ai-metrics/src/scorecard.ts`; `packages/tooling/tool/cli/test/ai-metrics-command.test.ts`; `initiatives/ai-metrics-stack/history/outputs/p4-scorecards-labels-and-benchmarks.md` |
| Weekly reports / scorecards | Yes. `report weekly` writes Markdown and JSON config-impact reports and persists scorecard rows. Completion readiness requires labels plus benchmark evidence; provider/tool/cost gaps are explicit unavailable/not-scored fields. | The final credited seven-day report is part of AI-metrics P7e closeout until recorded. | Do not silently score empty provider/model/tool/token/cost tables as measured data. | `packages/tooling/library/ai-metrics/src/scorecard.ts`; `initiatives/ai-metrics-stack/ops/manifest.json`; `initiatives/ai-metrics-stack/history/outputs/p6-pre-may16-readiness-ledger.md` |
| Mirror | P7a exists. `mirror build` creates sanitized derived bundles; `mirror sync` is dry-run unless confirmed; `mirror status` reads remote state. Bundles omit raw archive rows and hash sensitive label/benchmark notes/refs. | Final confirmed mirror sync/status is a V1 closeout gate after the final report. Remote mirror lifecycle automation beyond sync/status is follow-up. | Do not sync raw encrypted transcripts or local storage paths. Do not write mirror artifacts into the active proof root during proof preservation work; use a disposable copy when needed. | `packages/tooling/library/ai-metrics/src/mirror.ts`; `packages/tooling/tool/cli/test/ai-metrics-command.test.ts`; `initiatives/ai-metrics-stack/history/outputs/p7-topology-first-production-plan.md` |
| Retention | P7b exists. `retention list`, `restore-drill`, `delete`, and `compact` exist. Delete/compact default to dry-run and require explicit windows plus confirmation. Restore drills decrypt and replay without printing transcript text. | Remote mirror pruning/lifecycle automation is follow-up. | Do not run destructive retention commands without the explicit confirmation token and bounded window. Preserve raw archive objects on compact. | `packages/tooling/library/ai-metrics/src/retention.ts`; `packages/tooling/tool/cli/test/ai-metrics-command.test.ts`; `initiatives/ai-metrics-stack/history/outputs/p7-topology-first-production-plan.md` |
| `beep docgen quality-worker-eval` | Yes. The local/hosted command consumes deterministic docgen quality packets, requires explicit provider/model, emits JSON, and does not edit source. | Human draft review and write-mode remediation need separate planning and thresholds. | Deterministic `beep docgen quality` remains source of truth; worker output remains advisory. | `initiatives/jsdoc-worker-eval/SPEC.md`; `packages/tooling/tool/cli/src/commands/Docgen/index.ts`; `packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts` |
| `beep docgen quality-worker-eval-runpod` | Yes. Remote GPU route supports Runpod Ollama Qwen proof runs, explicit confirmation, opt-in Phoenix export, and cleanup by default. 10-packet evidence is complete. | Prebuilt images, persistent model cache, cost/runtime tuning, and larger acceptance rubrics are follow-up. | Do not default to billable GPU work, do not keep pods unless debugging, and do not use Qwen worker evidence as auto-remediation approval. | `initiatives/jsdoc-worker-eval/research/2026-05-16-runpod-ollama-qwen3-coder-30b-worker-eval-10-packet.md`; `packages/tooling/tool/cli/src/commands/Docgen/index.ts`; `packages/tooling/tool/cli/test/docgen.test.ts` |
| Infra / Phoenix deployment | Yes. `@beep/infra` owns `AIMetricsStack`, Phoenix compose/systemd/Tailscale Serve remote commands, OTLP endpoint outputs, and remote mirror-root config. | Optional LiteLLM/gateway deployment remains deferred. | Keep deployable topology in `infra`; do not hand-author host mutations as the durable deployment mechanism. | `infra/src/AIMetrics.ts`; `infra/src/internal/ai-metrics-entry.ts`; `infra/Pulumi.beep-ai-metrics-dankserver.yaml`; `infra/test/AIMetrics.test.ts` |
| Observability ownership | Yes. `@beep/observability` owns reusable runtime OTLP/metrics/logs/traces helpers. AI-metrics is a semantic producer, not a semantics tenant inside observability. | Future runtime observability helpers may be reused, but developer analytics language stays in tooling. | Do not move repo AI-agent labels, benchmarks, scorecards, transcript semantics, or privacy contracts into `@beep/observability`. | `packages/foundation/capability/observability/README.md`; `standards/architecture/12-observability.md`; `initiatives/ai-metrics-stack/SPEC.md` |
| DuckDB ownership | Yes. `@beep/duckdb` owns the technical DuckDB driver and Parquet export boundary. AI-metrics owns tables, privacy, retention, and projections. | None needed for Phase 0 unless a technical DuckDB capability gap appears. | Do not push AI-metrics domain tables or privacy semantics down into the driver. | `packages/drivers/duckdb/README.md`; `packages/tooling/library/ai-metrics/src/derived-storage.ts`; `standards/architecture/07-non-slice-families.md` |

## Existing Command Surface

Representative command patterns already owned by the repo:

```sh
bun run beep ai-metrics sources discover --target local --json
bun run beep ai-metrics config snapshot --json
bun run beep ai-metrics privacy check --source codex --input <file-or-dir> --json
bun run beep ai-metrics install plan --target local --json
bun run beep ai-metrics install doctor --target dankserver --json
bun run beep ai-metrics install compose --target local --json
bun run beep ai-metrics forwarder run --target local --data-root .beep/ai-metrics --json
bun run beep ai-metrics forwarder run --target dankserver --data-root .beep/ai-metrics --otlp --otlp-base-url https://dankserver.tailc7c348.ts.net:8447 --json
bun run beep ai-metrics forwarder timer --target dankserver --data-root .beep/ai-metrics --json
bun run beep ai-metrics otlp export --target dankserver --data-root .beep/ai-metrics --ingest-run latest --otlp-base-url https://dankserver.tailc7c348.ts.net:8447 --json
bun run beep ai-metrics label queue --target dankserver --data-root .beep/ai-metrics --json
bun run beep ai-metrics label add --task <run-id> --passed true --rating 5 --quality-gate passed --interventions 0 --follow-up-fix false --json
bun run beep ai-metrics benchmark case add --case <case-id> --title <title> --prompt-hash <hash> --json
bun run beep ai-metrics benchmark run --case <case-id> --config <config-snapshot-id> --passed true --quality-gate passed --json
bun run beep ai-metrics benchmark compare --json
bun run beep ai-metrics report weekly --target dankserver --data-root .beep/ai-metrics --json
bun run beep ai-metrics mirror build --target dankserver --data-root <disposable-or-active-data-root> --json
bun run beep ai-metrics mirror sync --bundle latest --data-root <data-root> --json
bun run beep ai-metrics mirror sync --bundle latest --data-root <data-root> --confirm p7-derived-mirror --json
bun run beep ai-metrics mirror status --target dankserver --json
bun run beep ai-metrics retention list --data-root <data-root> --json
bun run beep ai-metrics retention restore-drill --data-root <data-root> --restore-root <disposable-root> --before <iso-or-epoch-ms> --json
bun run beep ai-metrics retention delete --data-root <data-root> --before <iso-or-epoch-ms> --json
bun run beep ai-metrics retention compact --data-root <data-root> --before <iso-or-epoch-ms> --confirm p7-retention-window --json
bun run beep ai-metrics archive drill --target dankserver --data-root .beep/ai-metrics --json
```

Worker-eval command patterns already owned by `@beep/repo-cli`:

```sh
bun run beep docgen quality --all --json --score codex --packet-limit 25 --output <quality-report.json>
bun run beep docgen quality-worker-eval --input <quality-report.json> --provider codex --model <model-id> --reasoning-effort low --packet-limit 3 --output <worker-eval.json>
bun run beep docgen quality-worker-eval-runpod --input <quality-report.json> --provider ollama --model qwen3-coder:30b --packet-limit 10 --otlp --otlp-base-url https://dankserver.tailc7c348.ts.net:8447 --otlp-project beep-jsdoc-worker-eval --confirm-runpod-eval --skip-template-search --readiness-timeout-ms 2700000 --output <runpod-worker-eval.json>
```

Quality and package verification commands cited by the existing packets:

```sh
bun run check
bun run config-sync
cd packages/tooling/library/ai-metrics && bun run check && bun run test && bun run lint && bun run docgen
cd packages/tooling/tool/cli && bun run check && bun run test && bun run lint
cd infra && bun run check && bun run test && bun run lint
cd infra && pulumi preview -s beep-ai-metrics-dankserver --non-interactive --diff
cd infra && pulumi up -s beep-ai-metrics-dankserver --yes --non-interactive
```

## Data Products Already Available

- Encrypted raw archive objects under the selected AI-metrics data root.
- Derived DuckDB tables:
  `ai_metrics_ingest_runs`, `ai_metrics_source_files`,
  `ai_metrics_raw_archive_objects`, `ai_metrics_agent_tasks`,
  `ai_metrics_sessions`, `ai_metrics_turns`, `ai_metrics_model_calls`,
  `ai_metrics_tool_invocations`, `ai_metrics_outcome_labels`,
  `ai_metrics_benchmark_cases`, `ai_metrics_benchmark_runs`, and
  `ai_metrics_scorecards`.
- Per-run derived Parquet exports.
- Redacted OTLP trace spans with an explicit allowlist.
- Markdown and JSON weekly config-impact scorecards.
- Sanitized P7 mirror bundles containing manifest/status plus safe Parquet
  tables and excluding raw archive tables.
- Path-safe retention inventories and restore-drill summaries.
- JSON `quality-worker-eval` and `quality-worker-eval-runpod` evidence reports.
- Sanitized Phoenix spans for the JSDoc worker-eval project when `--otlp` is
  explicitly enabled.

## Agent-Effectiveness Reuse Guidance

The first agent-effectiveness implementation slice should reuse the existing
AI-metrics data spine rather than inventing a new one:

- Use `@beep/repo-ai-metrics` for schemas, storage, scorecard, privacy, and
  report semantics.
- Use `@beep/repo-cli` for operator commands.
- Use Phoenix/OTLP only through existing redacted export contracts unless a
  specific Phoenix API wrapper is required.
- Use existing labels and benchmark cases for human-reviewed outcomes and
  repeatable repo tasks.
- Use existing weekly report/completion-ready semantics for scorecard gates.
- Use existing mirror/retention workflows for sanitized sharing and lifecycle
  proof.
- Treat `jsdoc-worker-eval` as a reference read-only eval packet, not an
  automation-graduation precedent.

## Follow-Up Queue

AI-metrics follow-up already packeted:

- P7e: final report, sanitized derived mirror build/sync/status, and production
  readiness evidence after the credited proof report exists.
- P7c: provider/model/tool/token/cost enrichment.
- P7d: dashboard/backend expansion.
- Server-owned collection: future topology design for transcript access/sync.
- Remote mirror lifecycle automation beyond confirmed sync/status.

JSDoc worker-eval follow-up already packeted:

- Human draft acceptance rubric.
- Precision, cost, runtime, and policy-preservation thresholds.
- Prebuilt Runpod image or persistent model cache for repeated remote Qwen
  evals.
- Write-mode remediation as a separate future initiative, not an implied next
  step.

Agent-effectiveness-loop follow-up:

- Convert this surface map, the Phoenix capability map, the live Phoenix audit,
  and the opportunity map into one ranked implementation plan.
- Pick a narrow first loop that reuses existing labels, benchmarks, scorecards,
  OTLP spans, and weekly reports.
- Keep Phase 0 research read-only until the synthesis selects a concrete
  implementation slice.

## Do-Not-Disturb Checklist

- Do not edit production package code for Phase 0 research artifacts.
- Do not mutate the live Phoenix instance.
- Do not alter the AI-metrics proof runner, timer, source window, data root, or
  privacy contract.
- Do not repeat private absolute paths from existing proof packets in new
  research artifacts.
- Do not print decrypted archive bodies.
- Do not add raw prompt/output text to derived tables, reports, mirrors, OTLP
  spans, or Phoenix.
- Do not write human outcome labels without explicit human judgment.
- Do not treat empty provider/tool/token/cost tables as measured.
- Do not turn `quality-worker-eval` findings into blocking enforcement.
- Do not add backend-specific drivers unless a real backend API wrapper is
  needed beyond OTLP/export/install contracts.
