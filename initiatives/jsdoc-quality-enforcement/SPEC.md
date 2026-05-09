# JSDoc Quality Enforcement Spec

## Status

V1 implemented

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-08
- **Updated:** 2026-05-09

## Purpose

Create a canonical implementation path for improving how this repo enforces and
teaches useful JSDoc on exported symbols.

The motivating problem is that mandatory `@example` tags can satisfy type and
docgen checks while still providing little reader value when examples are only
trivial assignments or result-silencing snippets. V1 makes that gap visible
through deterministic quality-subject reports, typed findings, advisory scores,
and bounded remediation packets.

## Source Surfaces

Initial research should account for these repo surfaces:

- `.patterns/jsdoc-documentation.md`
- `.agents/skills/jsdoc-annotation-specialist/SKILL.md`
- `.aiassistant/skills/jsdoc-annotation-specialist/SKILL.md`
- `.claude/skills/jsdoc-annotation-specialist/SKILL.md`
- `packages/tooling/tool/docgen`
- `packages/tooling/tool/cli`
- `packages/tooling/library/repo-utils/src/TSMorph`

External or fast-moving references, such as Codex SDK behavior, Codex CLI
features, local model capabilities, and `ts-morph` APIs, must be verified by
the research agent at research time.

## V1 Decisions

- Quality review scores the whole JSDoc block, not only `@example`.
- The universal `@example` requirement for exported symbols remains
  non-negotiable in V1; exceptions are not introduced.
- Output uses a combined schema: `pass` / `warn` / `fail` tiers, typed finding
  codes, an advisory 1-10 score, and rationale.
- Every review subject carries parsed examples, description, tags, source
  anchor, signature, declaration kind, package identity, stable identity,
  content hash, and generated-doc snippet when present. The V1 schema also
  reserves diagnostics and related-symbol fields; they may be empty until
  deeper `@beep/repo-utils/TSMorph` enrichment is promoted.
- `@beep/repo-cli` owns orchestration, report writing, scope selection, and
  advisory remediation packets.
- `@beep/repo-docgen` remains deterministic and supplies parsing and required
  documentation policy.
- V1 enrichment uses source-file ts-morph evidence and
  `@beep/repo-utils/TSMorph` content hashing after docgen-oriented package and
  source enumeration; project diagnostics and related-symbol expansion remain
  follow-up enrichment.
- Default scope is affected packages. Supported non-default modes are
  `--package`, `--changed-files`, and `--all`.
- Codex use in V1 is advisory packet output only. No automatic edits are made.
- Local model workers are excluded from V1 and remain a future eval lane.
- Findings are report-only in V1. They do not block CI, local checks, or
  package quality gates.

## Public Surface

V1 adds:

- `beep docgen quality`
- `beep docgen quality -p <package>`
- `beep docgen quality --changed-files`
- `beep docgen quality --all`
- `beep docgen quality --json`
- `beep docgen quality --score codex`
- `beep docgen quality -o <path>`

Package-local runs without `--output` write `JSDOC_QUALITY.md` or
`JSDOC_QUALITY.json`. Multi-package runs print consolidated output unless
`--output` is provided.

## Report Contract

The consolidated report contains:

- `schemaVersion`
- `rubricVersion`
- `generatedAt`
- `scope`
- `scorer`
- `summary`
- `packages[].subjects[]`
- `packages[].reviews[]`
- `remediationPackets[]`

Finding codes include missing required documentation, invalid categories,
examples without code fences, trivial examples, result-silencing examples,
examples without observable results, effectful symbols missing `@effects`, and
insufficient review context.

## Research Report Contract

Synthesized research reports belong in [research/](./research). Use kebab-case
file names and include:

- the research question
- scope and non-scope
- repo evidence and source anchors
- external evidence, when relevant
- viable options
- tradeoffs and risks
- recommendation
- open questions for a future `grill-with-docs` session

Raw generated outputs, transcripts, or bulky evidence should only be preserved
under [history/outputs/](./history/outputs) when they are useful provenance.

## Completed Research Lanes

- Current JSDoc and docgen enforcement reality.
- Existing pattern and skill guidance quality.
- Agentic scoring and remediation feasibility using docgen analysis, `ts-morph`,
  Codex orchestration, and local model workers.
- Codex workflow surfaces such as review behavior, hooks, rules, skills, and
  `AGENTS.md` guidance.
- Cost, caching, batching, and incremental adoption strategy for repo-wide
  documentation quality review.

## Non-Goals

- Do not make advisory quality findings blocking in V1.
- Do not add `@example` exception categories in V1.
- Do not add automatic Codex edits or remediation execution in V1.
- Do not add local model or Qwen workers in V1.
- Do not move orchestration into `@beep/repo-docgen`; keep docgen deterministic.
- Do not treat heuristic score values as repo-wide enforcement thresholds until
  repo-specific evals prove value.

## Acceptance Criteria

- `@beep/repo-cli` exposes `docgen quality` with affected, package,
  changed-files, and all-package modes.
- The command emits stable JSON and Markdown report shapes.
- Quality subjects carry the V1 evidence contract before any model or human
  judgment.
- The command remains report-only even when failures are present.
- Tests cover subject extraction, advisory findings, JSON/Markdown rendering,
  and Codex remediation packet output.
- Guidance surfaces record the universal `@example` and whole-block usefulness
  policy.
