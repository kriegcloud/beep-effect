# Agent Effectiveness Loop Specification

## Status

**Phase 1 complete**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-16
- **Updated:** 2026-05-20

## Mission

Design a repo-specific feedback loop for improving coding-agent effectiveness.
The loop should use Phoenix capabilities, existing AI metrics artifacts, and
read-only worker-eval evidence to answer:

- where do coding agents struggle in this repo?
- which repo guidance, config, prompt, or workflow changes improve outcomes?
- which evals and scorecards should be repeatable before changing agent
  configs or graduating worker automation?
- which operator commands would make those insights easy to collect and review?

Phoenix is a tool in this loop, not the owner of the repo semantics.

## Inputs

Required repo packets:

- `initiatives/ai-metrics-stack/{README.md,SPEC.md,PLAN.md,ops/manifest.json}`
- `initiatives/ai-metrics-stack/history/outputs/*`
- `initiatives/jsdoc-worker-eval/{README.md,SPEC.md,PLAN.md,ops/manifest.json}`
- `initiatives/jsdoc-worker-eval/research/*`
- `initiatives/jsdoc-worker-eval/history/outputs/*`

Required doctrine:

- `standards/ARCHITECTURE.md`
- `standards/architecture/07-non-slice-families.md`
- `standards/architecture/08-testing.md`
- `standards/architecture/12-observability.md`

Required Phoenix sources:

- Phoenix docs index: <https://arize.com/docs/phoenix/llms.txt>
- Live read-only Phoenix instance:
  <https://dankserver.tailc7c348.ts.net:8447/projects>

## Ownership

Agent effectiveness metrics are repo-operational tooling.

- `@beep/repo-ai-metrics` owns developer AI analytics semantics.
- `@beep/repo-cli` owns operator commands and user-facing workflows.
- `@beep/observability` owns general runtime OTLP, metrics, logs, traces, and
  reusable observability helpers.
- `@beep/infra` owns deployable topology and dankserver automation.
- Backend-specific `drivers/*` are allowed only when a real Phoenix or
  alternate-backend API wrapper is needed beyond OTLP/export/install contracts.

The initiative must not move developer AI analytics semantics into shared
kernel, product slices, generic foundation packages, or runtime observability.

## Privacy Contract

Research artifacts may include sanitized evidence only:

- project names
- aggregate counts
- feature availability
- schema, attribute, and command names
- hashed identifiers already accepted by the AI metrics privacy contract
- links to repo artifacts and public documentation

Research artifacts must not include:

- raw prompt, response, transcript, or tool payload text
- private local paths, home paths, source paths, or archive paths
- secrets, tokens, 1Password refs with resolved values, or encryption material
- raw Phoenix span payload bodies
- unreviewed exception text that could contain private content

Live Phoenix access is read-only. Do not mutate projects, datasets,
experiments, prompts, annotations, traces, or server configuration during this
research bootstrap.

## Research Lanes

Phase 0 uses four artifact-producing lanes:

1. **Phoenix capability map** - comprehensive Phoenix feature inventory mapped
   to coding-agent improvement opportunities.
2. **Live Phoenix state audit** - read-only evidence from the deployed Phoenix
   instance and existing projects.
3. **Repo eval and metrics surface audit** - map existing repo commands,
   artifacts, privacy rules, and data products.
4. **Agent-effectiveness opportunity map** - ranked candidate evals,
   diagnostics, datasets, annotations, scorecards, and future CLI workflows.

Each lane writes one Markdown artifact under `research/`.

## Completion Criteria

Phase 0 is complete when:

- all four research artifacts exist and cite their repo or public-doc sources;
- live Phoenix evidence is sanitized and read-only;
- the synthesis ranks first implementation slices by impact, effort, privacy
  risk, architecture home, and verification burden;
- the plan chooses one recommended first path instead of only preserving an
  idea list;
- no production package, infra, timer, deployment, or agent config behavior is
  changed during research bootstrap.

## Selected Phase 1 Slice

The selected first implementation slice is local and no-mutation:

- `beep agent-effectiveness doctor --json`
- `beep agent-effectiveness annotations plan --json`
- `beep agent-effectiveness annotations check --json`

This slice produces a trust gate and privacy-checked annotation plan before any
Phoenix mutation, dataset creation, prompt management, experiment creation, or
backend driver work is allowed.

Phase 1 closeout also landed guarded Phoenix sync plumbing:

- `beep agent-effectiveness datasets bundle --json`
- `beep agent-effectiveness prompts bundle --json`
- `beep agent-effectiveness experiments bundle --json`
- `beep agent-effectiveness phoenix sync --json`

The sync path defaults to dry-run and requires explicit confirmation before live
Phoenix writes. Phase 1 completion is proven by the no-mutation live proof,
privacy checks, CI, and review closeout; it does not require live Phoenix
mutation.

## Phase 1 Implementation Contract

The Phase 1 implementation is split across:

- `@beep/repo-ai-metrics`, which owns the report schemas, doctor evidence
  aggregation, annotation-plan construction, and annotation privacy checks.
- `@beep/repo-cli`, which owns the `beep agent-effectiveness ...` operator
  commands and terminal/JSON rendering.

The default Phoenix target is
`https://dankserver.tailc7c348.ts.net:8447`. The default local metrics root is
`.beep/ai-metrics`. The default worker-eval evidence is the 2026-05-16
Runpod/Ollama Qwen3-Coder 30B worker-eval packet under
`initiatives/jsdoc-worker-eval/history/outputs/`.

Phase 1 reports use report-only statuses. Missing Phoenix, missing local
DuckDB evidence, or missing worker-eval reports are represented as
`unavailable` data, not as blocking process failures. Encoding failures remain
typed command failures.

Annotation plans are metadata-only. They may include source coverage, scorecard,
label, benchmark, worker-eval, and loop-health metadata, but they must not
include raw transcript bodies, private local paths, secrets, draft JSDoc bodies,
or code examples.

Phase 1 live proof is recorded in
`history/outputs/phase1-live-proof.md`. The proof keeps the acceptance gate at
the section level: Phoenix inventory must decode and pass, annotation privacy
checks must pass, and the overall doctor may remain `warning` when optional
local AI-metrics evidence is unavailable.

Phase 1 post-merge closeout is recorded in
`history/outputs/phase1-closeout.md`.
