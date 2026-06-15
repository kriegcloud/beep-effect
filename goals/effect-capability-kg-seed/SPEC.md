# Effect Capability KG Seed Spec

## Objective

Create the first executable seed proof for Effect capability intelligence:
deterministically extract capability facts for `Combiner`, `Reducer`, `Filter`,
and adjacent helper modules from `.repos/effect-v4`, classify those facts with
a tiny schema-first capability graph model, and prove advisory suggestions over
small fixtures with evidence that cites exact source/JSDoc/catalog origins.

Provenance: graduated from
[`explorations/effect-capability-kg`](../../explorations/effect-capability-kg/README.md)
(back-links:
[`BRIEF.md`](../../explorations/effect-capability-kg/BRIEF.md),
[`DECISIONS.md`](../../explorations/effect-capability-kg/DECISIONS.md),
[`MAP.md`](../../explorations/effect-capability-kg/MAP.md)).

## Non-Goals

- Runtime Codex or Claude hook installation.
- Full Effect v4 ingestion beyond the named seed corpus.
- Hard enforcement, blocking quality gates, Fallow rules, or docgen policy
  ratchets.
- Graph database, vector database, embedding, MCP, or long-term storage
  decisions.
- Broad specialist taxonomy or runtime-native sub-agent configuration.
- Replacing `goals/repo-codegraph-jsdoc`; this goal is a focused child proof.
- Making ontology classifications, embeddings, or LLM summaries authoritative
  over AST/type/JSDoc/source-span facts.

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

- First implementation home must be under `packages/tooling/**`.
- Candidate reuse surfaces:
  - `packages/tooling/library/repo-utils` for ts-morph/JSDoc extraction;
  - `packages/tooling/library/repo-codegraph` for export-catalog lookup and
    boundary advice;
  - `packages/tooling/tool/cli` only if a thin command is needed for the seed
    proof.
- Read-only input corpus:
  - `.repos/effect-v4/packages/effect/src/{Combiner,Reducer,Filter}.ts`;
  - adjacent helper modules in `Option`, `Struct`, `Array`, `Record`,
    `Number`, `String`, and `Boolean`.
- Supporting docs/artifacts may be added under this goal packet's `research/`
  or `history/` folders.
- `standards/repo-exports.catalog.{md,jsonc}` may be read; refresh only if the
  implementation legitimately changes exports.

## Constraints

- Follow `AGENTS.md`: effect-first, schema-first domain models, typed errors,
  explicit service boundaries, and repo quality commands green.
- Architecture home is `tooling`; do not create an `agents` family and do not
  route this first proof to `shared` or `foundation/capability`.
- Deterministic facts are the authority layer: AST declarations, type
  signatures, import/export edges, source spans, JSDoc tags/sections, examples,
  repo export catalog entries, and observed call sites.
- Ontology/classification is a bounded classifier over deterministic facts, not
  a source of truth.
- Keep the ontology kernel tiny: `EffectModule`, `CapabilitySymbol`,
  `DocSection`, `UsageScenario`, `ExampleCase`, `CategoryRole`,
  `SeeAlsoRelation`, and evidence/finding shapes needed by the seed proof.
- Treat Effect v4 JSDoc as upstream capability evidence and this repo's JSDoc
  rules as local normalization/policy; do not collapse the dialects.
- Include decline fixtures and confidence notes so the advisory path can say
  "no suggestion" when evidence is weak.
- Choose and record exact package-specific verification commands during P0
  before implementation.

## Acceptance Criteria

- [x] A schema-first seed capability graph/report model exists with
      deterministic provenance for every extracted fact.
- [x] Extraction covers `Combiner`, `Reducer`, and `Filter` modules and at
      least one exported symbol per module with source span, signature summary,
      `@category`, `@since`, structured doc sections, examples, and `@see`
      relationships where present.
- [x] Adjacent helpers from `Option`, `Struct`, `Array`, `Record`, `Number`,
      `String`, and `Boolean` are connected when source/docs expose them.
- [x] Repo export visibility is included for adjacent helpers already surfaced
      through `standards/repo-exports.catalog.{md,jsonc}`.
- [x] Fixture advisory checks cover merge/combine, fold/aggregate,
      validation/transformation, and at least one decline/no-match scenario.
- [x] Tests prove the seed artifact contains expected `Combiner`, `Reducer`,
      and `Filter` facts and that fixture findings cite deterministic evidence.
- [x] Hooks, embeddings, graph DB/storage, full corpus ingestion, and hard
      enforcement remain absent from the implementation.
- [x] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/effect-capability-kg-seed/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/effect-capability-kg-seed/ops/manifest.json` | Passes |
| Packet references | `rg -n "effect-capability-kg-seed|GOAL.md|agentLaunchers|packetAnchorDocument" goals/effect-capability-kg-seed` | Returns expected packet references |
| Whitespace | `git diff --check -- goals/effect-capability-kg-seed` | Passes |
| Package check | P0-selected `bun run --filter=<package> check` or equivalent | Passes |
| Package tests | P0-selected test command for the touched package(s) | Passes |
| Export catalog | `bun run repo-exports:catalog:check` if public exports change | Passes or not applicable with rationale |
| Reflection lint | `bun run beep lint reflection-artifacts` at P3 close | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- The implementation would exceed named scope.
- Verification requires credentials, cost, destructive side effects, or policy
  approval not named in this spec.
- The same blocker repeats after reasonable investigation.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |

## Decision Log Seed

Inherited from `explorations/effect-capability-kg/DECISIONS.md`:

- Architecture ownership: `tooling` first.
- First success surface: advisory pipeline first, not enforcement.
- Seed corpus: `Combiner`, `Reducer`, `Filter`, plus adjacent helper modules.
- Relation to `repo-codegraph-jsdoc`: focused child/provenance-linked goal.
- Ontology role: bounded classifier, not authority.
- JSDoc dialects: Effect v4 docs are upstream capability evidence; repo JSDoc
  law is local normalization and policy.
- Integration lane: CLI/context first, runtime hooks later.
- Specialist partition: one seed specialist later, after seed graph proof.
- Router model: deterministic first; LLM tie-breaker only if needed.
