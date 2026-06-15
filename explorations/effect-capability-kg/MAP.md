# Map

## Candidate Goal Packets

### 1. `effect-capability-kg-seed`

**Mission:** Prove the first deterministic Effect capability intelligence loop
for the seed wedge: `Combiner`, `Reducer`, `Filter`, and adjacent helpers.

This goal should ingest the seed corpus from `.repos/effect-v4`, extract
AST/type/JSDoc/source-span facts, classify them with the tiny capability
ontology kernel, and emit an evidence-cited seed graph/report that can answer
"what capability exists, when should it be used, and what evidence supports
that suggestion?"

**Primary deliverables:**

- schema-first node/edge/fact models for the seed capability graph;
- deterministic extraction of modules, exported symbols, JSDoc tags, structured
  doc sections, examples, `@see` links, and source spans;
- repo export/catalog visibility for adjacent public helpers exposed through
  this repo;
- a small generated or test-owned seed artifact for inspection;
- evidence-cited advisory findings over a tiny fixture set;
- tests that prove the artifact contains the expected `Combiner`, `Reducer`,
  and `Filter` facts.

**Explicit non-goals:**

- no runtime Codex/Claude hook installation;
- no full Effect v4 ingestion;
- no hard enforcement;
- no graph database choice;
- no required embedding/vector store;
- no broad specialist taxonomy.

**Dependencies:** none beyond existing repo tooling capabilities.

**Why first:** This is the smallest vertical slice that proves the core bet:
deterministic Effect v4 JSDoc and AST facts can become useful capability
guidance without inventing a large runtime system.

### 2. `effect-capability-specialist-router`

**Mission:** Turn the seed graph into one specialist profile and a deterministic
judge/router contract.

This goal should define the `Combiner` / `Reducer` / `Filter` specialist
profile, query recipes, decline conditions, confidence model, and structured
`JudgeRoutingDecision` / `HookFinding` response shapes.

**Primary deliverables:**

- seed specialist profile contract;
- deterministic routing rules over the seed graph;
- LLM tie-breaker boundary for ambiguous cases, if needed;
- structured advisory finding examples;
- fixture-driven tests for select/decline behavior.

**Dependencies:** `effect-capability-kg-seed`.

**Why second:** A specialist profile only means something once there is a
grounded capability graph to cite.

### 3. `effect-capability-advisory-cli`

**Mission:** Expose the seed graph and specialist router through a repo-owned
advisory command/API that can inspect proposed code contexts or diffs.

This goal should keep the contract runtime-neutral. It should return structured
findings with deterministic evidence, confidence, and suggested direction, but
it should not install hooks or block writes.

**Primary deliverables:**

- repo-owned advisory request/response schema;
- command/API for checking a file, snippet, or diff fixture;
- machine-readable and human-readable finding output;
- false-positive/false-negative capture shape;
- docs showing how agents should consume the advisory output.

**Dependencies:** `effect-capability-specialist-router`.

**Why third:** Hooks should call a stable repo contract instead of embedding
runtime-specific logic directly.

### 4. `effect-capability-hook-adapters`

**Mission:** Map the advisory contract onto Codex/Claude hook surfaces through
repo-managed configuration/adapters.

This goal should use the repo's AI config modeling surface to generate or
validate hook configuration, then wire advisory pre-write backpressure in a
non-blocking mode first.

**Primary deliverables:**

- Codex/Claude hook adapter design;
- `@beep/ai-sync` integration where applicable;
- local trusted-hook setup docs;
- advisory-mode hook proof;
- clear opt-in path for blocking mode, left disabled.

**Dependencies:** `effect-capability-advisory-cli`.

**Why fourth:** Runtime hook APIs drift. The stable advisory contract should
exist before any adapter commits to a product-specific surface.

### 5. `effect-capability-quality-ratchet`

**Mission:** Promote proven advisory findings into repo quality gates only
after enough signal exists.

This goal should measure suggestion quality, identify low-risk rules, and
decide whether any pattern belongs in Fallow, docgen quality, reuse lookup, or
another existing repo quality lane.

**Primary deliverables:**

- reviewed advisory finding corpus;
- false-positive/false-negative thresholds;
- candidate promotion rules;
- quality-lane integration plan;
- first narrow non-blocking or warning-only gate, if justified.

**Dependencies:** `effect-capability-hook-adapters` and real advisory usage.

**Why last:** Enforcement without measured signal would create noise and teach
agents to route around the tool.

## Sequencing

1. `effect-capability-kg-seed`
2. `effect-capability-specialist-router`
3. `effect-capability-advisory-cli`
4. `effect-capability-hook-adapters`
5. `effect-capability-quality-ratchet`

The sequence moves from highest-certainty source evidence to progressively more
agent-facing behavior. Each later goal consumes the prior goal's contract rather
than reopening its internals.

## First Vertical Slice

Start with `effect-capability-kg-seed`.

The slice succeeds when a developer or agent can ask a narrow question such as
"what Effect capability should I consider for this reducer-like or filter-like
code?" and receive an answer backed by deterministic evidence from the seed
corpus.

Minimum useful proof:

- extract `Combiner`, `Reducer`, and `Filter` modules from
  `.repos/effect-v4/packages/effect/src`;
- extract at least one exported symbol per module with source span, signature
  summary, `@category`, `@since`, structured doc sections, examples, and
  `@see` relationships where present;
- connect adjacent helpers from `Option`, `Struct`, `Array`, `Record`,
  `Number`, `String`, and `Boolean` when the source/docs expose them;
- include repo export catalog visibility for already surfaced adjacent helpers;
- emit a seed graph/report with deterministic provenance for every fact;
- provide at least three fixture advisory checks:
  - a merge/combine scenario that should suggest `Combiner` or an adjacent
    `makeCombiner` helper;
  - a fold/aggregate scenario that should suggest `Reducer` or a prebuilt
    reducer;
  - a validation/transformation scenario that should suggest `Filter`;
- include at least one decline fixture where the specialist should not fire.

This first slice should remain package/tooling scoped. It should not install
hooks, choose long-term graph storage, or require embeddings.

## Capability Check

| Component | Existing repo capability | Status | Notes |
| --- | --- | --- | --- |
| Effect seed corpus | `.repos/effect-v4/packages/effect/src` | Existing | Source of upstream Effect v4 facts for `Combiner`, `Reducer`, `Filter`, and adjacent modules. |
| AST/type/JSDoc extraction | `@beep/repo-utils` / `TSMorphService` | Existing | Use scoped ts-morph graph extraction and deterministic JSDoc derivation instead of building a parser from scratch. |
| Repo export visibility | `@beep/repo-codegraph`, `standards/repo-exports.catalog.{md,jsonc}` | Existing | Use deterministic export lookup and boundary advice for local helper visibility. |
| JSDoc category normalization | `packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts` | Existing | Normalize local category policy separately from upstream Effect v4 JSDoc evidence. |
| Repo documentation quality context | docgen/JSDoc inventory tooling | Existing | Reuse as evidence for tag requirements and future quality integration. |
| Architecture home | `standards/architecture/07-non-slice-families.md` | Existing | First package belongs under `tooling`, not `agents`, `shared`, or `foundation/capability`. |
| Memory authority model | `standards/memory-architecture/01-memory-layer-taxonomy.md` | Existing | Deterministic code intelligence is authority; semantic layers are derived/candidate. |
| RDF/linked-data primitives | `@beep/rdf`, `@beep/semantic-web` | Existing / optional | Available if the first slice needs RDF/JSON-LD/PROV/evidence shapes; do not force them into v1 if simple typed graph artifacts are enough. |
| AI hook/config schemas | `@beep/ai-sync` | Existing / later | Useful for hook adapter goals, not required in the seed goal. |
| Capability ontology kernel | none specific | NET-NEW | Keep tiny and classifier-only; do not design a comprehensive UFO-derived ontology up front. |
| Specialist profile contract | none specific | NET-NEW | First profile is a repo-owned guidance contract, not a runtime-native agent config. |
| Judge/router | none specific | NET-NEW | Build after seed graph exists; deterministic first, LLM tie-breaker only if needed. |
| Advisory request/response contract | none specific | NET-NEW | Needed before hooks; should cite deterministic graph evidence. |
| Runtime hook adapters | Codex/Claude docs + `@beep/ai-sync` | Partly existing / later | Runtime surfaces exist, but repo-owned adapters are new and should come after advisory proof. |
| Embeddings/vector retrieval | research prior art only | Deferred | Useful later for prose recall; not part of first proof. |
| Graph database/storage | prior `repo-codegraph-jsdoc` research | Deferred | Avoid choosing FalkorDB/other storage for the seed proof unless the goal spec reopens that decision. |

## Inherited Risks

- **False-positive pressure:** The first slice must include decline fixtures and
  confidence notes so suggestions do not become noise.
- **Ontology overreach:** The ontology kernel should classify observed facts;
  it should not try to model all of Effect v4 or all of UFO.
- **Dialect confusion:** Effect v4 structured prose is upstream capability
  evidence; this repo's JSDoc law is local policy and normalization. Do not
  collapse them.
- **Storage premature commitment:** A typed artifact or in-memory graph may be
  enough for the seed. Durable graph storage can wait.
- **Runtime drift:** Codex and Claude hooks should remain adapter concerns over
  a stable repo contract.
- **Prior-art overlap:** `goals/repo-codegraph-jsdoc` is broad provenance, not
  the implementation target. This packet should link to it and avoid copying
  its whole ambition.

## Graduation Readiness

This exploration is now decomposed, but it should pause before graduation.

Ready items:

- brief is complete;
- candidate goal packets are named;
- first vertical slice is chosen;
- major components have a capability check.

Still waiting on owner approval:

- accept `effect-capability-kg-seed` as the first goal;
- decide whether to scaffold one goal now or keep the exploration active for
  more review;
- confirm that no implementation scope beyond the seed proof should sneak into
  the first goal.
