# Agent-Effectiveness Opportunity Map

Generated: 2026-05-16

## Scope

This artifact ranks concrete opportunities for improving coding agents in this
repo by combining Phoenix capability ideas with the existing AI metrics and
JSDoc worker-eval surfaces.

Phase 0 remains read-only:

- no production package changes;
- no Phoenix dataset, prompt, experiment, annotation, or trace mutation;
- no raw prompt, response, transcript, private path, source path, archive path,
  or secret material in this artifact;
- Phoenix is treated as an observability/eval surface, while repo semantics stay
  in repo-owned tooling packages.

## Source Snapshot

Phoenix capability ideas used here:

- OTLP/OpenTelemetry traces for model calls, retrieval, tool use, and custom
  logic: <https://arize.com/docs/phoenix>
- evaluations over traces and spans, including LLM, code, and human labels:
  <https://arize.com/docs/phoenix>
- datasets and experiments for repeatable comparisons:
  <https://arize.com/docs/phoenix/datasets-and-experiments/tutorial/defining-the-dataset>
- server-side dataset evaluators with annotation outputs:
  <https://arize.com/docs/phoenix/evaluation/server-evals/overview>
- structured annotations on spans, traces, sessions, and documents:
  <https://arize.com/docs/phoenix/sdk-api-reference/typescript/packages/phoenix-client/annotations>
- TypeScript experiment helpers:
  <https://arize.com/docs/phoenix/sdk-api-reference/typescript/packages/phoenix-client/experiments>
- prompt management, playground, and span replay:
  <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts>
- Phoenix CLI export of traces, datasets, experiments, and annotations for AI
  coding workflows:
  <https://arize.com/docs/phoenix/release-notes/01-2026/01-21-2026-cli-datasets-experiments-annotations>

Repo evidence used here:

- `initiatives/agent-effectiveness-loop/SPEC.md` defines the Phase 0 privacy,
  ownership, and research-lane contract.
- `initiatives/ai-metrics-stack/SPEC.md` defines the config-impact scorecard,
  privacy model, OTLP-first Phoenix posture, and tooling ownership.
- `initiatives/ai-metrics-stack/history/outputs/p4-scorecards-labels-and-benchmarks.md`
  proves label queue, benchmark, and weekly report surfaces.
- `initiatives/ai-metrics-stack/history/outputs/p6-seven-day-proof-and-hardening.md`
  proves real-source forwarder, redacted OTLP export, Phoenix health, label
  queue, and baseline weekly report evidence.
- `initiatives/ai-metrics-stack/history/outputs/p6-proof-runner-isolation-and-runbook.md`
  proves source coverage, benchmark checks, scorecard readiness gaps, and the
  daily health checklist.
- `initiatives/jsdoc-worker-eval/SPEC.md` and
  `initiatives/jsdoc-worker-eval/research/2026-05-16-runpod-ollama-qwen3-coder-30b-worker-eval-10-packet.md`
  prove read-only worker eval, hosted/local/Runpod model evidence, advisory
  packet outcomes, and Phoenix OTLP export.
- `packages/tooling/library/ai-metrics/src/models.ts`,
  `scorecard.ts`, and `otlp.ts` contain the current schema surfaces for
  config snapshots, tasks, labels, benchmark cases, benchmark runs,
  scorecards, and redacted OTLP spans.
- `packages/tooling/tool/cli/src/commands/AIMetrics/index.ts` exposes current
  `beep ai-metrics` operator workflows.
- `packages/tooling/tool/cli/src/commands/Docgen/index.ts` and
  `packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts`
  expose current read-only JSDoc worker-eval workflows.

Live read-only Phoenix health was checked during this pass:

- endpoint responded `HTTP 200`;
- `x-phoenix-server-version` was `15.5.0`;
- no Phoenix data was mutated.

## Classification Legend

Impact:

- High: likely to change agent outcomes, reduce repeated failures, or unblock
  reliable automation.
- Medium: improves diagnosis, comparison, or operator workflow but depends on
  another loop for outcome lift.
- Low: useful hygiene or visibility with limited direct behavior change.

Effort:

- Small: mostly report/query/CLI wrapper over existing tables or JSON reports.
- Medium: new repo-owned data projection or Phoenix export path, but no new
  backend semantics.
- Large: new durable model, backend API integration, provider enrichment, or
  human-review workflow.

Privacy risk:

- Low: hashes, counts, low-cardinality labels, command names, and aggregate
  scores only.
- Medium: touches human notes, worker drafts, prompt references, or trace
  selection and needs explicit redaction/review.
- High: touches raw transcripts, prompt/output content, provider payloads,
  source paths, or cost/token enrichment from external logs.

Architecture home:

- `@beep/repo-ai-metrics`: developer AI analytics semantics, labels,
  benchmark records, scorecards, datasets, redacted derived projections.
- `@beep/repo-cli`: operator commands and user-facing workflows.
- `@beep/repo-docgen`: deterministic docgen quality semantics, if a future
  slice needs reusable quality packet APIs outside the CLI.
- `@beep/observability`: generic Effect/OTLP helpers only.
- `@beep/infra`: Phoenix/dankserver deployment topology.
- `packages/drivers/*`: only if a future Phoenix API wrapper is needed beyond
  OTLP export or CLI shell-out.

## Ranked Opportunity Table

| Rank | Opportunity | Impact | Effort | Privacy Risk | Architecture Home | Verification Evidence |
|---:|---|---|---|---|---|---|
| 1 | Agent outcome annotation bridge | High | Medium | Medium | `@beep/repo-ai-metrics`, `@beep/repo-cli` | Existing outcome labels, benchmark runs, scorecards, redacted OTLP spans, Phoenix annotations support |
| 2 | JSDoc worker-eval Phoenix experiment lane | High | Medium | Medium | `@beep/repo-cli`, possible `@beep/repo-docgen`, `@beep/repo-ai-metrics` | 10-packet Runpod worker eval, hosted Codex baseline, deterministic `beep docgen quality` packets, Phoenix experiments/datasets |
| 3 | Config snapshot A/B scorecard loop | High | Small | Low | `@beep/repo-ai-metrics`, `@beep/repo-cli` | Existing config snapshots, weekly scorecards, label and benchmark readiness gates |
| 4 | Agent diagnostics doctor | High | Small | Low | `@beep/repo-cli`, `@beep/repo-ai-metrics` | Current `ai-metrics` health commands, Phoenix health, source coverage, scorecard gaps |
| 5 | Human review queue for worker drafts | High | Medium | Medium | `@beep/repo-cli`, `@beep/repo-ai-metrics` | Worker report dispositions, policy violation codes, existing label queue pattern |
| 6 | Failure-mode taxonomy and scorecard | High | Medium | Low | `@beep/repo-ai-metrics`, `@beep/repo-cli` | Current label dimensions plus JSDoc policy violations and scorecard coverage gaps |
| 7 | Prompt/config experiment registry | Medium-High | Medium | Medium | `@beep/repo-ai-metrics`, `@beep/repo-cli`; Phoenix prompt support optional | Config snapshot diffs, Phoenix prompt/version/playground capabilities |
| 8 | Trace taxonomy hardening for agent tasks | Medium-High | Medium | Low | `@beep/repo-ai-metrics`, `@beep/observability` | OTLP allowlist, `session.id`, source role/hash attribution, Phoenix root-span caveat |
| 9 | Source coverage and blind-spot dashboard | Medium | Small | Low | `@beep/repo-ai-metrics`, `@beep/repo-cli` | P6 source coverage shows recent Codex-only collection and all-time Claude/OpenClaw visibility |
| 10 | Provider/model/tool/cost enrichment | Medium-High | Large | High | `@beep/repo-ai-metrics`, possible provider/gateway driver, `@beep/infra` | Current scorecards explicitly mark these metrics unavailable/not-scored |
| 11 | Phoenix CLI export/import runbooks | Medium | Small | Medium | `@beep/repo-cli` first; driver only if needed | Phoenix CLI now exports traces/experiments/datasets/annotations; repo mirror/retention patterns exist |
| 12 | Architecture-doctrine benchmark pack | Medium-High | Medium | Low | `@beep/repo-cli`, `@beep/repo-ai-metrics` | Existing architecture standards, repo quality commands, recurring agent failure classes |

## Top Opportunities

### 1. Agent Outcome Annotation Bridge

Opportunity:

Export repo-owned outcome labels, benchmark results, scorecard readiness, and
worker-eval packet outcomes as Phoenix annotations on existing redacted spans,
traces, or sessions.

Why it matters:

Phoenix annotations are the natural feedback primitive for "this agent run was
good/bad/needs review." The repo already has structured labels and scorecards;
the missing link is making those labels visible at the exact trace/session level
where operators inspect agent behavior.

Candidate annotations:

| Annotation | Target | Source | Kind | Optimization |
|---|---|---|---|---|
| `agent.outcome.passed` | session or trace | `OutcomeLabel.passed` | human/code | maximize |
| `agent.outcome.rating` | session or trace | `OutcomeLabel.rating` | human | maximize |
| `agent.quality_gate` | session or trace | `OutcomeLabel.qualityGate` | human/code | categorical |
| `agent.interventions` | session or trace | `OutcomeLabel.interventionCount` | human | minimize |
| `agent.follow_up_fix` | session or trace | `OutcomeLabel.followUpFix` | human | minimize |
| `benchmark.passed` | trace or session | `BenchmarkRun.passed` | code/human | maximize |
| `benchmark.quality_gate` | trace or session | `BenchmarkRun.qualityGate` | code/human | categorical |
| `scorecard.completion_ready` | session/project window | `Scorecard.completionReady` | code | maximize |
| `scorecard.gap` | session/project window | `Scorecard.coverageGaps` | code | categorical |
| `worker.policy_violation` | worker packet span | `DocgenQualityWorkerEvalReport.policyViolations` | code | minimize |

Candidate evals:

- annotation completeness: every completion-creditable scorecard row has at
  least one label and one benchmark annotation;
- annotation privacy: no annotation value contains raw text, private path,
  source path, archive path, or secret-shaped content;
- trace linkage: annotation target can be resolved from hash-only task/session
  metadata without exposing raw transcript identifiers;
- reviewer agreement: compare human label and worker recommendation for
  selected JSDoc packets.

Datasets:

- `agent-outcomes-v1`: one row per labeled `AgentTask`, using task id,
  config snapshot id, source kind, source role, label dimensions, and hashed
  parentage only.
- `config-scorecard-v1`: one row per `Scorecard`, using aggregate counts,
  scores, readiness, and gap labels.
- `jsdoc-worker-packets-v1`: one row per selected JSDoc worker packet with
  package name, finding codes, review disposition, duration, and policy
  violation codes; no draft body by default.

Scorecard additions:

- `annotationCoverage`: percent of labeled tasks with matching Phoenix
  annotation evidence.
- `reviewAgreement`: percent of human-reviewed worker drafts whose final human
  label agrees with worker disposition.
- `policyPreservation`: percent of worker candidates with zero policy
  violation codes.

Prompt/config experiments:

- Compare scorecards before and after changes to `AGENTS.md`, `.codex`, or
  worker policy snippets.
- Use Phoenix experiment comparison only after the repo-owned scorecard defines
  the canonical metric names.

Diagnostics:

- report orphaned labels without trace/session target;
- report traces with `session.id` but no task/scorecard attribution;
- report annotations that would violate the OTLP/annotation privacy allowlist.

Future commands:

- `bun run beep agent-effectiveness annotations plan --target phoenix`
- `bun run beep agent-effectiveness annotations export --format json`
- `bun run beep agent-effectiveness annotations apply --target phoenix --confirm phoenix-annotation-write`
- `bun run beep agent-effectiveness annotations check --target phoenix`

Recommendation:

Make the first slice a dry-run JSON export and privacy checker. Defer the
Phoenix write command until a reviewer can inspect the exact annotation schema.

### 2. JSDoc Worker-Eval Phoenix Experiment Lane

Opportunity:

Promote the existing read-only JSDoc worker-eval evidence into a repeatable
experiment lane: deterministic quality packets become the dataset, worker
provider/model/reasoning/prompt variants become experiment runs, and
deterministic plus human-review checks become evaluators.

Why it matters:

This is the cleanest existing coding-agent eval surface in the repo. It already
has deterministic inputs, bounded packets, advisory model outputs, policy
violation codes, hosted Codex evidence, local negative evidence, Runpod
evidence, and Phoenix OTLP spans.

Candidate datasets:

- `jsdoc-quality-remediation-packets-v1`
  - inputs: subject id hash/ref, package name, finding codes, required tags,
    verification command argv, packet metadata;
  - references: deterministic missing-tag/finding set and expected policy
    constraints;
  - metadata: package family, symbol kind, source quality report id,
    packet selection rank.
- `jsdoc-worker-model-suitability-v1`
  - inputs: provider, model, environment class, packet count;
  - outputs: completed, failed, timed out, duration, policy violation set,
    cleanup status, Phoenix export status.
- `jsdoc-human-review-v1`
  - future human labels only; no source edits or draft bodies until explicitly
    approved.

Candidate evals:

| Eval | Type | Measurement |
|---|---|---|
| `jsdoc.required_tags_present` | code | candidate includes required documentation categories named by deterministic findings |
| `jsdoc.no_policy_violations` | code | candidate packet reports zero policy violation codes |
| `jsdoc.worker_completion` | code | completed packets divided by selected packets |
| `jsdoc.worker_timeout_rate` | code | timed-out packets divided by selected packets |
| `jsdoc.human_acceptance` | human | accepted candidate drafts divided by reviewed drafts |
| `jsdoc.prompt_cost_latency` | code | duration and cost once provider metrics exist |
| `jsdoc.no_runtime_change_claim` | human/code | candidate is documentation-only and does not claim source edits were made |

Annotations:

- `worker.status`: completed, failed, timed-out;
- `worker.disposition`: candidate, needs-human-review, reject;
- `worker.policy_violation`: bounded policy code;
- `worker.duration_ms`: packet duration;
- `worker.provider` and `worker.model`: low-cardinality selected values;
- `worker.sample_id`: source report or experiment id.

Scorecards:

- `workerReliability`: completion minus timeout/failure rate;
- `policySafety`: zero-policy-violation rate;
- `reviewYield`: human acceptance rate once review labels exist;
- `costRuntime`: not scored until provider/cost metrics are real.

Prompt/config experiments:

- hosted Codex low reasoning vs medium reasoning;
- hosted Codex vs Runpod Qwen on the same packet dataset;
- compact JSDoc policy excerpt variants;
- packet-only context vs packet plus selected deterministic policy examples;
- Runpod fallback image vs prebuilt image/cache once cost/runtime reduction is
  explicitly in scope.

Diagnostics:

- detect policy violation drift by finding code;
- detect model/environment pairings unsuitable for interactive work;
- detect provider routes that emit no Phoenix spans when `--otlp` is enabled;
- detect cleanup failures for billable remote evals.

Future commands:

- `bun run beep docgen quality-worker-eval dataset build --input <quality.json>`
- `bun run beep docgen quality-worker-eval experiment run --dataset <id>`
- `bun run beep docgen quality-worker-eval experiment compare --dataset <id>`
- `bun run beep docgen quality-worker-review queue`
- `bun run beep docgen quality-worker-review label --packet-id <id>`

Recommendation:

Use the JSDoc worker lane as the first Phoenix experiment candidate after the
annotation dry-run exists. It is bounded, already read-only, and has a known
failure signal: `missing-example` policy preservation.

### 3. Config Snapshot A/B Scorecard Loop

Opportunity:

Turn existing config snapshots and weekly scorecards into a deliberate
experiment workflow for agent config and prompt/guidance changes.

Why it matters:

The AI metrics stack was built to answer whether changes to agent-facing config
improve coding-agent outcomes. The current scorecard already weights outcome
more heavily than flow and cost, requires labels plus benchmark runs for
completion credit, and reports unavailable model/tool/cost fields as gaps.

Candidate evals:

- config snapshot readiness: at least one task, one human label, and one
  benchmark run;
- quality gate delta: changed snapshot has higher pass/quality-gate rate than
  previous snapshot;
- intervention delta: changed snapshot reduces intervention count;
- follow-up-fix delta: changed snapshot reduces follow-up fixes;
- benchmark stability: changed snapshot does not regress curated benchmark
  checks.

Datasets:

- `agent-config-snapshots-v1`: config snapshot id, included path categories,
  changed path categories, previous snapshot id, label counts, benchmark counts.
- `agent-config-benchmark-runs-v1`: benchmark case id, config snapshot id,
  pass/fail, quality gate, elapsed time, prompt ref/hash only.

Annotations:

- `config.snapshot_id`;
- `config.changed_agent_guidance`: boolean or bounded category;
- `config.scorecard_ready`;
- `config.regression_detected`.

Scorecards:

- keep current total/outcome/flow/cost weights;
- add a config-experiment view comparing only snapshots that changed
  agent-facing guidance;
- keep provider/model/tool/cost as explicit unavailable/not-scored until P7c.

Prompt/config experiments:

- change one guidance surface at a time;
- run the same curated benchmark case against old/new snapshots;
- require a scorecard readiness gate before declaring a config change better.

Diagnostics:

- no labels for changed snapshot;
- no benchmark run for changed snapshot;
- scorecard compares snapshots with different source windows;
- actual changed paths do not overlap agent-facing config paths.

Future commands:

- `bun run beep agent-effectiveness config experiment start --label <name>`
- `bun run beep agent-effectiveness config experiment compare --from <snapshot> --to <snapshot>`
- `bun run beep agent-effectiveness scorecard config-impact --window 7d`

Recommendation:

This is the lowest-effort, highest-alignment loop. It should become the default
way to decide whether repo guidance and agent config changes helped.

### 4. Agent Diagnostics Doctor

Opportunity:

Add a read-only diagnostic command that summarizes whether the feedback loop is
healthy enough to trust before anyone interprets scorecards or Phoenix views.

Why it matters:

The repo already has many partial health signals: Phoenix health/version,
source coverage, forwarder status, label queue, benchmark case list, scorecard
gaps, OTLP export status, mirror status, retention status, and worker eval
cleanup. Operators need one "can I trust this loop today?" command.

Candidate checks:

- Phoenix endpoint reachable and version header present;
- redacted OTLP export produced session/turn spans for latest run;
- latest forwarder status has nonzero derived turns;
- source coverage reports candidates and included counts by source kind;
- no source kind is silently starved by global file limits;
- scorecard readiness has labels and benchmarks for the relevant config;
- `model_call_metrics_unavailable_not_scored`, tool, token, and cost gaps are
  explicit;
- JSDoc worker report has no failed/timed-out packets for selected sample;
- Runpod cleanup completed for remote worker runs;
- Graphiti memory lookup is not required for scorecard interpretation.

Datasets:

- `agent-loop-health-snapshots-v1`: one row per diagnostic run with bounded
  statuses and counts.

Annotations:

- `loop.health`: ok, degraded, blocked;
- `loop.blocker`: bounded code such as `no_labels`, `no_benchmark_runs`,
  `phoenix_unreachable`, `otlp_missing`, `worker_cleanup_failed`.

Scorecards:

- `loopTrust`: binary readiness gate before ranking agent config changes;
- `coverageTrust`: source coverage adequacy by source kind.

Future commands:

- `bun run beep agent-effectiveness doctor`
- `bun run beep agent-effectiveness doctor --json`
- `bun run beep agent-effectiveness doctor --include-phoenix`
- `bun run beep agent-effectiveness doctor --include-worker-eval <report.json>`

Recommendation:

Implement this before any Phoenix mutation. It turns the existing evidence
surfaces into a repeatable operator guardrail and should be almost entirely
read-only.

### 5. Human Review Queue For Worker Drafts

Opportunity:

Create a human review queue for worker-eval candidates, separate from source
editing. Human acceptance labels become the graduation signal for future
write-mode remediation.

Why it matters:

The JSDoc worker evidence is promising but explicitly not enough for automatic
source edits. A review queue lets the repo learn which worker outputs are
actually acceptable without changing source files.

Candidate evals:

- candidate accepted without edits;
- candidate accepted after human edit;
- candidate rejected for policy reason;
- candidate rejected for repo-style reason;
- candidate failed deterministic verification;
- candidate would have changed runtime behavior.

Datasets:

- `worker-draft-review-v1`: packet metadata, model/provider, disposition,
  policy codes, human acceptance label, verification result.

Annotations:

- `review.accepted`;
- `review.rejection_reason`;
- `review.requires_policy_update`;
- `review.verification_passed`.

Scorecards:

- `humanAcceptanceRate`;
- `verificationPassRate`;
- `policyViolationEscapeRate`;
- `meanReviewTime`.

Prompt/config experiments:

- compare worker policy snippets by acceptance rate;
- compare model/reasoning variants by accepted-without-edit rate;
- compare packet selection strategies by review yield.

Future commands:

- `bun run beep docgen quality-worker-review queue --input <worker-report.json>`
- `bun run beep docgen quality-worker-review label --packet-id <id> --accepted`
- `bun run beep docgen quality-worker-review report --json`

Recommendation:

Do this before any auto-remediation plan. It supplies the precision and
policy-preservation evidence the worker-eval packet says is missing.

## Cross-Cutting Candidate Datasets

| Dataset | Source | Privacy Posture | First Use |
|---|---|---|---|
| `agent-outcomes-v1` | outcome labels plus `AgentTask` rows | low; hash ids and bounded labels | Phoenix annotations and config-impact scorecards |
| `agent-config-snapshots-v1` | config snapshot artifacts and scorecards | low; path categories and hashes, not file content | config A/B comparisons |
| `agent-loop-health-v1` | doctor output | low; statuses and counts | trust gate for scorecard interpretation |
| `jsdoc-quality-remediation-packets-v1` | deterministic quality reports | medium; must exclude prompt/draft text by default | worker experiments |
| `jsdoc-worker-model-suitability-v1` | worker eval reports | medium; include model/env/runtime, exclude draft bodies by default | model/provider selection |
| `worker-draft-review-v1` | future human labels | medium; human notes need redaction | remediation graduation |
| `source-coverage-v1` | source discovery and forwarder coverage | low; counts and source kinds only | source starvation diagnostics |
| `provider-enrichment-v1` | future gateway/provider metrics | high | cost/token/tool scorecards after P7c |

## Cross-Cutting Candidate Evals

| Eval | Input | Output | Type | Impact | Privacy Risk |
|---|---|---|---|---|---|
| `privacy.no_raw_text` | report/export/annotation payload | pass/fail with bounded reason | code | High | Low |
| `privacy.no_private_paths` | report/export/annotation payload | pass/fail with bounded reason | code | High | Low |
| `scorecard.completion_ready` | scorecard row | pass/fail | code | High | Low |
| `config.improved_outcome` | two config snapshots | delta score | code/human | High | Low |
| `worker.completed` | worker packet result | pass/fail | code | Medium | Low |
| `worker.no_policy_violation` | worker packet result | pass/fail/code set | code | High | Low |
| `worker.human_acceptance` | reviewed candidate | accepted/rejected | human | High | Medium |
| `trace.has_session_id` | Phoenix/repo span export | pass/fail | code | Medium | Low |
| `trace.has_repo_attribution` | OTLP span attributes | pass/fail | code | Medium | Low |
| `source.coverage_not_starved` | forwarder coverage | pass/fail by source kind | code | Medium | Low |
| `benchmark.no_regression` | benchmark runs | pass/fail/delta | code/human | High | Low |
| `provider.cost_available` | future provider rows | available/not scored | code | Medium | High |

## Annotation Schema Candidates

Start with a repo-owned JSON schema and only later map it to Phoenix writes.

Required fields:

- `annotation.name`: bounded dotted name;
- `annotation.targetKind`: trace, span, session, dataset_example,
  experiment_run;
- `annotation.targetRef`: hash-only local reference until Phoenix ids are
  resolved;
- `annotation.kind`: human, llm, code;
- `annotation.score`: optional numeric score;
- `annotation.label`: optional bounded label;
- `annotation.explanation`: optional redacted bounded note;
- `annotation.optimization`: maximize, minimize, none;
- `annotation.source`: label, benchmark, scorecard, worker-eval, doctor;
- `annotation.privacyChecked`: boolean.

Initial allowlist:

- `agent.outcome.passed`
- `agent.outcome.rating`
- `agent.quality_gate`
- `agent.interventions`
- `agent.follow_up_fix`
- `benchmark.passed`
- `benchmark.quality_gate`
- `scorecard.completion_ready`
- `scorecard.gap`
- `worker.status`
- `worker.disposition`
- `worker.policy_violation`
- `worker.duration_ms`
- `loop.health`
- `loop.blocker`
- `source.coverage`

Blocked by default:

- raw worker draft text;
- raw prompt or response text;
- raw transcript ids;
- private paths;
- source paths;
- archive paths;
- unredacted human notes;
- provider payloads;
- token/cost data until the P7c privacy design is accepted.

## Scorecard Candidates

### Agent Config Impact

Existing spine:

- task count;
- label count;
- benchmark run count;
- completion readiness;
- total, outcome, flow, and cost scores;
- coverage gaps.

Additions:

- annotation coverage;
- source coverage adequacy;
- benchmark regression count;
- worker review agreement once review labels exist.

### Worker Model Suitability

Metrics:

- selected packet count;
- completion rate;
- timeout/failure rate;
- policy violation rate;
- human acceptance rate;
- mean duration;
- cleanup success for remote workers;
- Phoenix export success.

Decision gate:

- keep read-only until human acceptance, policy preservation, runtime, and cost
  thresholds are defined and met.

### Loop Trust

Metrics:

- Phoenix health;
- latest forwarder status freshness;
- derived turn count;
- OTLP span count;
- source coverage;
- label queue availability;
- benchmark case availability;
- scorecard readiness;
- mirror status if the target is dankserver.

Decision gate:

- do not interpret config-impact deltas when loop trust is blocked.

## Prompt And Config Experiments

Candidate experiments:

| Experiment | Variant Axis | Primary Metric | Dataset | Risk |
|---|---|---|---|---|
| JSDoc policy prompt | compact excerpt variants | policy violation rate, human acceptance | `jsdoc-quality-remediation-packets-v1` | Medium |
| Worker model/reasoning | provider/model/reasoning effort | completion, policy safety, runtime | `jsdoc-worker-model-suitability-v1` | Medium |
| Agent guidance update | `AGENTS.md` or `.codex` change | config-impact scorecard delta | `agent-config-snapshots-v1` | Low |
| Source window policy | recent-only vs broader coverage | loop trust and source coverage | `source-coverage-v1` | Low |
| Runpod runtime strategy | fallback image vs cached image | duration, cleanup, cost | worker model suitability | Medium |
| Review rubric | acceptance rubric variants | reviewer agreement | `worker-draft-review-v1` | Medium |

Rules:

- one config/prompt axis per experiment;
- require snapshot ids before and after;
- require at least one label and one benchmark for completion credit;
- keep prompt bodies as repo-local artifacts or Phoenix prompt versions only
  after privacy review;
- publish only hashes, refs, bounded labels, and aggregate scores in research.

## Diagnostics Map

| Diagnostic | Failure Found | Existing Evidence Surface | Future Command |
|---|---|---|---|
| Phoenix health | endpoint down or version missing | curl health, Phoenix version header | `agent-effectiveness doctor --include-phoenix` |
| OTLP export | spans not emitted or malformed | `ai-metrics otlp export`, span counts | `agent-effectiveness traces check` |
| Trace linkage | spans cannot link to task/session/scorecard | OTLP attributes, `session.id` | `agent-effectiveness traces link-check` |
| Source starvation | global limits hide non-Codex sources | source coverage counts | `agent-effectiveness sources coverage` |
| Scorecard readiness | no labels or benchmarks | scorecard gaps | `agent-effectiveness scorecard check` |
| Worker policy drift | candidate violates JSDoc policy | worker policy violation codes | `docgen quality-worker-eval compare` |
| Worker cleanup | billable remote pod left running | Runpod wrapper cleanup metadata | `docgen quality-worker-eval-runpod doctor` |
| Privacy leakage | raw text/path/secret in derived payload | privacy check and redaction rules | `agent-effectiveness privacy check` |
| Provider blind spot | model/tool/token/cost missing | scorecard explicit not-scored gaps | `agent-effectiveness enrichment gaps` |
| Graph/memory dependency | memory lookup unavailable or timed out | session-start Graphiti status | `agent-effectiveness memory doctor` |

## Possible Future `@beep/repo-cli` Commands

Prefer `beep agent-effectiveness` as the operator group if the loop grows
beyond AI metrics and docgen. Keep narrower commands under `beep ai-metrics`
or `beep docgen` when they are plainly owned by those domains.

| Command | Purpose | Writes? | Home |
|---|---|---:|---|
| `beep agent-effectiveness doctor` | summarize loop trust across Phoenix, source coverage, labels, benchmarks, worker reports | no | `@beep/repo-cli` |
| `beep agent-effectiveness dataset build` | build sanitized dataset JSON from existing derived tables/reports | local output only | `@beep/repo-cli`, `@beep/repo-ai-metrics` |
| `beep agent-effectiveness eval run` | run code/human-ready evals over a named sanitized dataset | local output only | `@beep/repo-cli` |
| `beep agent-effectiveness annotations plan` | render proposed Phoenix annotations without applying | local output only | `@beep/repo-cli`, `@beep/repo-ai-metrics` |
| `beep agent-effectiveness annotations apply` | apply reviewed annotations to Phoenix | yes, confirmed | `@beep/repo-cli`; driver if direct API is needed |
| `beep agent-effectiveness scorecard weekly` | render agent-effectiveness scorecard on top of existing AI metrics rows | local output only | `@beep/repo-ai-metrics` |
| `beep agent-effectiveness config experiment compare` | compare two config snapshots with labels and benchmarks | no | `@beep/repo-cli` |
| `beep agent-effectiveness traces check` | verify trace/span linkage and allowlisted attributes | no | `@beep/repo-ai-metrics` |
| `beep docgen quality-worker-review queue` | create review queue from worker candidates | local output only | `@beep/repo-cli` |
| `beep docgen quality-worker-review label` | record human acceptance/rejection for a worker candidate | yes, local derived store | `@beep/repo-cli`, `@beep/repo-ai-metrics` |
| `beep ai-metrics enrichment gaps` | report provider/model/tool/token/cost blind spots | no | existing AI metrics command group |

## Recommended First Slice

Start with a no-mutation loop:

1. `agent-effectiveness doctor --json`
2. `agent-effectiveness annotations plan --from-ai-metrics --from-worker-eval`
3. `agent-effectiveness dataset build --kind jsdoc-worker-packets`
4. `docgen quality-worker-review queue --input <worker-report.json>`

Acceptance evidence:

- all outputs are JSON/Markdown artifacts only;
- privacy checker proves no raw text, private path, source path, archive path,
  or secret material;
- annotations are planned but not applied;
- JSDoc worker datasets exclude draft bodies by default;
- scorecard readiness and explicit not-scored gaps are visible in the doctor
  output;
- the artifact can be run against the existing 10-packet worker report and P6
  AI metrics data without Phoenix mutation.

Why this first:

- it uses already-proven repo surfaces;
- it avoids new production or Phoenix writes;
- it gives operators one trust gate before interpreting Phoenix or scorecards;
- it creates the review evidence required before any future auto-remediation.

## Deferred Until After A Read-Only Proof

- Direct Phoenix writes for annotations, datasets, experiments, or prompts.
- Storing worker draft text in Phoenix.
- Auto-remediation or source-file write mode.
- Provider/gateway enrichment that touches raw provider payloads, costs, token
  counts, or model-call details.
- New backend drivers before a direct Phoenix API need is proven.
- Moving agent-effectiveness semantics into shared kernel, product slices, or
  generic observability packages.
