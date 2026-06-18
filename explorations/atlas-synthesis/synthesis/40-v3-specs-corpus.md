# 40 — v3 Specs Corpus (Prior Art Survey)

**Date:** 2026-06-17
**Source repo:** `/home/elpresidank/YeeBois/projects/beep-effect4` (the OLDER Effect-v3 codebase; dir name is "beep-effect4" but content predates the v4 migration — last commits "preparing for migration to effect v4", "archiving main").
**Scope:** Read-only survey of the v3 `specs/` corpus and cross-checks against built `packages/knowledge/*` source. No builds run, no v3 files modified.

> **GUARDRAIL APPLIED.** This file inventories **proven prior art in another repo**, not current v4 (beep-effect3) capability. Three layers are kept distinct:
> 1. **Reusable KG engine** (RDF, SPARQL, reasoning, entity-resolution, GraphRAG, grounding, ontology, extraction) — portable to the v4 IP-law product.
> 2. **Learning-vehicle domain** (Enron email corpus; todox / wealth-management) — the domain used to *learn* the engine, **not** the product.
> 3. **The PRODUCT** is the solo IP-law flywheel (v4 / beep-effect3).
> This de-risks the v4 build (it becomes migration/redesign, not greenfield) but is **not** v4 present capability.

---

## 1. Corpus Shape + Spec Lifecycle

**Size:** 1,108 markdown files across the v3 `specs/` tree.

**Layout** (`specs/README.md`):
- `specs/pending/` — in-progress, planned, or not-yet-finished.
- `specs/completed/` — fully finished (success criteria met).
- `specs/archived/` — deferred / paused / superseded (intentionally parked).
- `specs/_guide/` — shared workflow docs, templates, `PATTERN_REGISTRY.md`, `HANDOFF_STANDARDS.md`.
- `specs/agents/` — agent-specific artifacts (`reflector`, `wealth-management-domain-expert`, a shared `REFLECTION_LOG.md`).

**Lifecycle policy** (`specs/SPEC_STATUS_POLICY.md`):
- New specs start in `pending/` only. Transitions: `pending→completed` (finished), `pending→archived` (deferred/superseded), `archived→pending` (resumed).
- Promotion to `completed` requires: explicit complete marker in `README.md`, success criteria + phase goals done, verification captured, `REFLECTION_LOG.md` updated, open follow-ups spun into a new pending spec.
- **Enforced**: `.husky/pre-commit` runs `bun run spec:status:check`; a `pending` spec that declares `Status: Complete`/`Archived` fails commit until moved.

**Caveat on folder truth:** the README's "Pending/Completed" tables are partly stale (they list `knowledge-architecture-foundation` under "Pending" though its README says COMPLETE, and vice-versa). The on-disk folder is the more reliable signal; per-spec README status markers are second. I treat folder-as-of-disk + README marker together below.

**Spec structure convention:** each non-trivial spec is multi-doc — `README.md`, `REFLECTION_LOG.md`, `handoffs/HANDOFF_P{N}.md` + `P{N}_ORCHESTRATOR_PROMPT.md` (a mandatory 4-tier-memory handoff gate), and often `QUICK_START.md`, `AGENT_PROMPTS.md`, `RUBRICS.md`. This is a heavyweight, agent-orchestrated spec methodology, not lightweight tickets.

**Catalog of the non-product remainder (brief):** agent tooling (`agent-config/context/effectiveness/infrastructure-*`, `codex/cursor-claude-parity`), IAM (`iam-client-entity-alignment`, `iam-client-schema-consistency-inventory`), RLS (`rls-implementation`, `orgtable-auto-rls`), repo/CLI infra (`repo-cli-verify-commands`, `scripts-to-cli-migration`, `spec-creation-improvements`, `tsconfig-sync-*`, `tagged-values-kit`, `db-repo-standardization`), and testkit/migration housekeeping. These are repo-foundation work, largely orthogonal to the KG engine and not portable IP-law product capability.

---

## 2. Product-Relevant Specs (Layer-Tagged Table)

Status = on-disk folder + README marker (where they disagree, both noted). "Layer" applies the guardrail: **ENGINE** = reusable KG capability; **DOMAIN** = learning-vehicle binding; **INFRA/UI** = supporting.

| Spec | Folder | README status | Layer | What it built / planned |
|---|---|---|---|---|
| knowledge-architecture-foundation | completed | COMPLETE | ENGINE | "Phase −1" foundation: package allocation (domain/tables/server/client/ui), RPC patterns, layer boundaries, branded EntityIds, tagged errors, core RDF value objects (Quad, QuadPattern, SparqlBindings). |
| knowledge-graph-integration | completed | (overview, multi-phase) | ENGINE+DOMAIN | Ports `effect-ontology` patterns: extract structured knowledge from text, OWL ontology modeling, GraphRAG subgraph retrieval, entity resolution, evidence-linked provenance. Built core Entity/Relation/Extraction/Ontology models on the bootstrapped slice. |
| knowledge-rdf-foundation | completed | "PLANNED" marker (stale) but **COMPLETE: 3 phases, 179 tests** per LESSONS doc | ENGINE | RdfStore (Effect.Service over N3.Store), QuadPattern queries, named-graph isolation, Turtle/N-Triples/JSON-LD serialization, fluent RdfBuilder. Perf: 1000 quads in 13ms (target 100ms). |
| knowledge-sparql-integration | completed | IN_PROGRESS (Phase 1 complete) — **73 tests** | ENGINE | Custom SPARQL parser + executor: SELECT/CONSTRUCT/ASK/FILTER/OPTIONAL/UNION, 3 typed error classes, type-guarded sparqljs handling. Deliberately custom (Oxigraph deferred). |
| knowledge-reasoning-engine | completed | Scaffolding complete | ENGINE | RDFS + OWL forward-chaining inference (ForwardChainer, RdfsRules, OwlRules, ReasonerService). SHACL validation is a *separate* `Validation/` module (ShaclService, ShaclParser, ShapeGenerator, ValidationReport), not part of `Reasoning/`; adopted "Re-SHACL" targeted-inference pattern from effect-ontology. |
| knowledge-graphrag-plus | completed | IN_PROGRESS (P1–2 done, P3 citation-validation not started) | ENGINE | Grounded answer generation with citation parsing/validation, confidence scoring, RRF fusion scorer, context formatting, reasoning-trace formatting. Legal-review pass remediated 24 violations. |
| knowledge-entity-resolution-v2 | completed | COMPLETE (P1–P4) | ENGINE | Two-tier resolution: immutable MentionRecord → mutable Entity cluster; EntityRegistry, BloomFilter, IncrementalClusterer, MergeHistory, SameAsLinker, SplitService, CanonicalSelector. Forward-only migration (no backfill). |
| knowledge-graph-poc-demo | completed (folder) | **Phase table: P1–P5 all "Pending"** | ENGINE+DOMAIN | Demo *spec* for a `/knowledge-demo` page (extraction UI → relations/evidence → GraphRAG query → resolution → demo flow). Folder=completed but internal phases read Pending — **spec authored, demo phases largely NOT executed as specced** (see §4). |
| knowledge-effect-workflow-migration | completed (folder) | P1 READY, P2–P6 PLANNED | ENGINE | Plan to migrate custom Workflow runtime to `@effect/workflow` with parity vs `effect-ontology`. Mostly **planning**, not executed. |
| knowledge-batch-machine-refactor | completed (folder) | P1–P2 DONE, P3 IN PROGRESS, P4 PLANNED | ENGINE | Replace hand-rolled `BatchStateMachine` (Ref<HashMap>) with `@beep/machine` (persistence, crash recovery, typed transitions). **Partially built.** |
| knowledge-ontology-comparison | pending | research spec (complete deliverables) | ENGINE | Gap analysis of `effect-ontology` vs the slice → 40 gaps → 23 work items (6 P0 / 9 P1 / 5 P2 / 3 P3), 18–24wk roadmap. **This is the spine that generated most knowledge specs.** |
| knowledge-schema-standardization | pending | pending | ENGINE | Plan: opaque schema classes (`S.Class` over `S.Struct`), canonical IDs/annotations across the slice. Not executed. |
| knowledge-stats-dashboard-poc | pending | pending | UI | Plan: stats dashboard + React-Flow ontology schema graph over real `@beep/knowledge-tables` aggregates. |
| knowledge-slice-conventions-review / code-quality-audit / repo-sqlschema-refactor / server-test-shared-fixtures-dedup / nonfatal-effect-lint-cleanup | mixed | mixed | INFRA | Hygiene passes over the knowledge slice (conventions, SqlSchema repos, test-fixture dedup, lint). |
| enron-data-pipeline | pending | planning | **DOMAIN** | Load Enron email corpus as realistic test data: ingest → extract → KG populate → meeting-prep gen. **Learning-vehicle corpus, not product.** |
| enron-knowledge-demo-integration | pending | planning | **DOMAIN** | Replace `knowledge-demo` mock with real Enron-backed extraction/GraphRAG/meeting-prep over RPC. Planned, not built. |
| todox-design | pending | Phase 0 | **DOMAIN** | Design of "Todox": AI-native multi-tenant SaaS for **wealth-management firms** (Org/WorkSpace/Agent/Dashboard). The learning-vehicle product shell. |
| todox-wealth-mgmt-knowledge-mvp | pending | P1 plan ready | **DOMAIN** | Demo-first wealth-mgmt KB MVP: Gmail→Documents→Knowledge→Graph UI ("Evidence Always")→grounded meeting-prep. Plan only. |
| lexical-playground-port | completed | COMPLETE (MVP) | UI | Ported Lexical Playground to Next.js `/lexical` (CSS 32→5, lint 106→0). |
| lexical-canonical-editor | completed | COMPLETE (Phase 3) | UI | Extracted Lexical POC into reusable editor component (171+ files, 54 plugins); replaced tiptap compose editor. |
| lexical-schemas | completed (folder) | "PENDING" marker, High(46) | UI | Effect-Schema validation for Lexical `SerializedEditorState` (envelope at domain, full discriminated union at app layer) — replaces `S.Unknown` document content. |
| lexical-editor-qa / utils-effect-refactor / editor-keyboard-shortcuts-qa | mixed | mixed | UI | Editor QA + Effect-ification of lexical utils. |
| semantic-web-uri-schema-refactor | pending | pending | ENGINE | Effect+Schema-first refactor of `common/semantic-web` uri-js port (RFC 3986), typed failures, `URI` schema export. |
| semantic-web-idna-schema-refactor | completed | COMPLETE | ENGINE | IDNA schema refactor companion (completed). |
| zero-email-port | archived | archived | DOMAIN | Deferred email port (parked). |

---

## 3. Lessons-Learned Synthesis (`KNOWLEDGE_LESSONS_LEARNED.md`, 47KB)

This doc is a post-hoc extraction of patterns from the completed engine specs (RDF, SPARQL, reasoning, GraphRAG, ontology-comparison) feeding the then-upcoming workflow-durability and entity-resolution-v2 work. Its claims are **self-reported by the v3 spec author** but corroborated by the existence of the named source files (§4).

### 3a. What WORKED (proven patterns to carry into v4)
1. **Library-type conversion layer (5/5 confidence).** Wrap external libs (N3.js, sparqljs) with explicit `to*/from*` converters so domain types stay library-agnostic; enables swapping N3→Oxigraph behind a stable service interface. ~200 LOC of converters in `RdfStoreService.ts`; zero library-type leakage.
2. **`Effect.Service` + `accessors: true` everywhere** (not `Context.Tag`); compose via `Layer.provideMerge`.
3. **`Layer.provideMerge` for shared mutable deps** is mandatory — without it, services get separate RdfStore/DB instances and tests silently fail ("no data found").
4. **Service vs helper decision matrix.** Stateful/I/O → Effect.Service; pure transforms → plain exported functions (e.g. `FilterEvaluator`, `PromptTemplates`, state-machine transitions as `Match`-based pure fns). Avoid "premature service" anti-pattern.
5. **`Effect.async` callback bridge** for N3 Parser/Writer (single-resume guard, error-first, null-quad = EOF).
6. **`live()` (real clock) for benchmarks**, never TestClock; perf baselines captured early caught regressions.
7. **Fluent builder via closure context** (RdfBuilder) for type-safe quad chaining without class boilerplate.
8. **Discipline scaffolding:** mandatory 4-tier handoff docs as a phase-completion gate; per-phase REFLECTION_LOG; complexity formula to right-size specs; test-first skeletons (`effect.skip`). 250+ tests across the engine specs.

### 3b. What DIDN'T work / had to be corrected (anti-patterns)
- Native `Array`/`String` methods instead of `effect/Array`,`effect/String` (lint-enforced remediation).
- Plain `S.String` for entity IDs instead of branded `EntityId` + table `.$type<>()` — surfaced as type-unsafe joins that compile but fail at runtime (caught in GraphRAG "legal review").
- `Effect.fail(new TaggedError(...))` instead of yielding the error directly.
- `bun:test` + manual `Effect.runPromise` instead of `@beep/testkit` runners.
- Errors placed in the **server** layer instead of the **domain** layer (contracts belong in domain) — corrected in SPARQL pre-implementation review.
- Generic single error type instead of specific tagged errors per failure mode.
- `exactOptionalPropertyTypes` violations from conditional optional props.

### 3c. Architecture decisions that shaped the approach
- **Forward-only migration, no backfill** (new MentionRecord provenance can't be synthesized for legacy rows → data-integrity preserved).
- **Re-SHACL**: validate shapes against source + *targeted* inference rather than full materialization (memory/perf win, same outcome).
- **Custom SPARQL executor first, Oxigraph later** — learn query-optimization before pulling a heavyweight dep; service abstraction keeps the migration path open.
- **Two-tier entity resolution** (immutable evidence → mutable cluster) as a non-negotiable enabler of re-resolution, audit trail, temporal tracking.

### 3d. Connection to the v4 "no-escape / deterministic-authority" reframe
**Explicit caveat: the v3 specs do NOT contain the terms "no-escape theorem," "deterministic authority," "authority spine," or "prose-to-proof"** (grep over `specs/` returned zero hits). That vocabulary is a **v4-era reframe**, not present v3 language. The connection is *latent, not stated*:
- The v3 engine already separates **retrieval/LLM (proposes)** from **deterministic graph/logic (proves)**: extraction & GraphRAG answer-*generation* are LLM-driven and explicitly mocked/probabilistic, while RDF store, SPARQL, RDFS/OWL forward-chaining, and SHACL validation are deterministic. This is the embryo of the v4 "retrieval proposes / logic proves" split.
- **Evidence-linked provenance** (named graphs, `ProvenanceEmitter`/`ProvOConstants`, immutable MentionRecord with `extractionId`/`llmResponseHash`, "Evidence Always" in the wealth MVP) is the seed of the v4 **provenance-grounded** stance.
- **Citation validation** in GraphRAG (validating LLM-claimed citations against the actual graph via real SPARQL) is exactly the "the model may propose, but the authority spine must verify" instinct that the v4 no-escape framing formalizes.
- So: the v3 work supplies the *mechanisms* the v4 theorem governs, but the v3 author had not yet articulated the **determinism-as-load-bearing-constraint** thesis. The v4 reframe is a re-interpretation/tightening of proven v3 plumbing, which is precisely why the v4 build is migration/redesign rather than greenfield.

---

## 4. Built & Proven in v3 vs Merely Planned

Cross-checked the LESSONS claims against on-disk source in `packages/knowledge/*` (v3 repo). Counts: **domain 281 .ts, tables 26, server 189**; client/ui = 1 each (thin). Server test files: 52; domain test files: 3.

### BUILT & substantively PROVEN (real source files exist, tests present)
- **RDF engine** — `Rdf/{RdfStoreService,RdfBuilder,Serializer,ProvenanceEmitter,ProvOConstants}.ts`. (LESSONS: 179 tests, perf-validated.)
- **SPARQL engine** — `Sparql/{SparqlParser,SparqlService,QueryExecutor,FilterEvaluator,SparqlGenerator,SparqlModels}.ts`. (73 tests.)
- **Reasoning** — `Reasoning/{ForwardChainer,RdfsRules,OwlRules,ReasonerService}.ts` (RDFS+OWL forward-chaining).
- **SHACL validation** — `Validation/{ShaclService,ShaclParser,ShapeGenerator,ValidationReport}.ts` (a distinct module from `Reasoning/`, with `domain/.../Shacl.errors.ts` + `ShaclPolicy.value.ts`; one test file `Validation/ShaclService.test.ts`).
- **GraphRAG + Grounding** — `GraphRAG/{GraphRAGService,GroundedAnswerGenerator,CitationParser,CitationValidator,ConfidenceScorer,RrfScorer,ContextFormatter,ReasoningTraceFormatter,PromptTemplates}.ts`; `Grounding/{GroundingService,ConfidenceFilter}.ts`.
- **Extraction pipeline** — `Extraction/{ExtractionPipeline,MentionExtractor,EntityExtractor,RelationExtractor,GraphAssembler}.ts` + LLM output schemas.
- **Entity resolution v2** — `EntityResolution/{EntityRegistry,BloomFilter,EntityClusterer,IncrementalClustererLive,MergeHistoryLive,SameAsLinker,SplitService,CanonicalSelector,EntityResolutionService}.ts`.
- **Ontology** — `Ontology/{OntologyService,OntologyParser,OntologyCache}.ts`.
- **Supporting**: `Embedding/`, `LlmControl/` (rate limiter/circuit breaker), `Nlp/`, `Validation/`, `Workflow/`, `Runtime/`, `rpc/v1/`, ~25 persisted entity models (Entity, Relation, Extraction, Mention, MentionRecord, MergeHistory, EntityCluster, Evidence, RelationEvidence, SameAsLink, Ontology, ClassDefinition, PropertyDefinition, MeetingPrep + bullets/evidence, EmailThread(+Message), KnowledgeAgent, Batch, GraphRAG).

**Verdict:** the full KG-engine *middle* — extraction → resolution → RDF/triples → SPARQL → reasoning → GraphRAG/grounded-answers with provenance — was **genuinely built and test-backed** in v3. This is the strongest counter-evidence to a "all spec, no code" reading *of the v3 repo* (the v4/beep-effect3 baseline's "spec, no code" finding is about **v4**, which is correct and unchanged by this).

### PARTIALLY built
- `knowledge-batch-machine-refactor` (P3 in progress), `knowledge-effect-workflow-migration` (mostly planning), `knowledge-graphrag-plus` P3 citation-validation (CitationValidator file exists but spec phase marked not-started — verify before trusting end-to-end).

### PLANNED ONLY (spec authored, NOT executed)
- **`knowledge-graph-poc-demo`**: folder=completed but all five internal phases read "Pending." A `/knowledge-demo` route **does exist** in `apps/todox/src/app/knowledge-demo/` (page, components, actions, rpc-client) but its `data/` holds `sample-emails.ts` + `scenarios.ts` (curated/mock-leaning). So a demo *surface* was scaffolded; a fully real end-to-end demo as specced was not clearly completed.
- **`enron-data-pipeline`** + **`enron-knowledge-demo-integration`**: pending/planning. The "Enron knowledge-graph demo" is **specified and partially wired, not a confirmed shipped demo.** (DOMAIN layer regardless.)
- **`todox-wealth-mgmt-knowledge-mvp`**, **`todox-design`**: design/plan stage. (DOMAIN.)
- `knowledge-schema-standardization`, `knowledge-stats-dashboard-poc`, `semantic-web-uri-schema-refactor`: planned.

### Guardrail restatement
The BUILT items in the ENGINE layer are the portable prior art the v4 IP-law product can migrate/redesign from. The Enron/todox/wealth-mgmt items are the **learning-vehicle domain** — they prove the engine *works on a corpus*, but their domain bindings are **not** the IP-law product and must not be carried over as product features.

---

## Confidence & Caveats

- **High confidence:** corpus shape, lifecycle policy, the lessons-learned synthesis (read in full), and the existence of the built engine source files (directly listed on disk). The product-relevant spec table's "what it built" column is grounded in each spec's own README plus the matching source tree.
- **Medium confidence:** per-spec *completeness*. README status markers, folder location, and internal phase tables frequently disagree (e.g. rdf-foundation README says "PLANNED" while LESSONS says complete with 179 tests; graph-poc-demo folder=completed but phases=Pending). I flagged each conflict but did **not** run the v3 test suite to confirm pass/fail — "proven" rests on file presence + self-reported test counts, not a re-run.
- **The "Enron KG demo was built and DEMOED" hypothesis from the task brief is only PARTIALLY supported:** the engine is built and a `knowledge-demo` route exists, but the Enron/demo-integration specs are pending and the demo data is curated/mock-leaning. I did **NOT** find proof of a fully real, end-to-end Enron demo. Mark as **UNVERIFIED — likely partially demoed, not confirmed production-real.**
- **"no-escape / deterministic-authority / authority-spine / prose-to-proof" vocabulary is NOT in the v3 specs** (grep = 0 hits). The §3d connection is my interpretation linking proven v3 mechanisms to the v4 reframe, not a v3-stated thesis.
- I skimmed READMEs/status/phase tables and the 47KB lessons doc; I did **not** read every sub-file of 1,108 markdown files. Sampling was targeted at the product-relevant set named in the brief.
- This is v3 (beep-effect4) prior art. **Do not** record any of it as present beep-effect3 (v4) capability.

### Verification (2026-06-17)

Adversarial read-only re-check against `/home/elpresidank/YeeBois/projects/beep-effect4`. No builds run, no v3 files modified.

**Checked & CONFIRMED:**
- Corpus size: `find specs -name '*.md'` = **1,108** (exact).
- Knowledge package counts: domain **281**, tables **26**, server **189**, client **1**, ui **1** `.ts` — all match.
- Git head matches the brief: `archiving main` / migration-prep commits.
- Engine source files all exist on disk as cited: `Rdf/{RdfStoreService,RdfBuilder,Serializer,ProvenanceEmitter,ProvOConstants}`, `Sparql/{SparqlParser,SparqlService,QueryExecutor,FilterEvaluator,SparqlGenerator,SparqlModels}`, `Reasoning/{ForwardChainer,RdfsRules,OwlRules,ReasonerService}`, `GraphRAG/{GraphRAGService,GroundedAnswerGenerator,CitationParser,CitationValidator,ConfidenceScorer,RrfScorer,ContextFormatter,ReasoningTraceFormatter,PromptTemplates}`, `Grounding/{GroundingService,ConfidenceFilter}`, `Extraction/{ExtractionPipeline,MentionExtractor,EntityExtractor,RelationExtractor,GraphAssembler}`, full `EntityResolution/*`, `Ontology/{OntologyService,OntologyParser,OntologyCache}`. The KG-engine middle is genuinely built and test-backed in v3 — verdict in §4 holds.
- Test files: server **52** `.test.ts`, domain **3** — match. RDF tests present (6 files, ~117 `it()` calls on disk; the "179 tests" figure is self-reported in LESSONS and counts assertions/Reasoning-adjacent specs — same order of magnitude, not contradicted).
- `KNOWLEDGE_LESSONS_LEARNED.md` = 47,754 bytes (≈47KB, exact). "179"/"73 tests" claims are sourced from this doc as the file states.
- "no-escape / prose-to-proof / authority spine / deterministic authority" grep over `specs/` = **0 hits** — the §3d "latent, not stated" caveat is correct.
- `apps/todox/src/app/knowledge-demo/` route exists with `data/{sample-emails.ts,scenarios.ts}` (curated/mock-leaning) — §4 "demo surface scaffolded, not confirmed real end-to-end" holds. `knowledge-entity-resolution-v2` confirmed in `specs/completed/`; `knowledge-ontology-comparison` confirmed in `specs/pending/`.

**CORRECTED:**
- **SHACL misattribution.** Original §2 and §4 placed SHACL under the `Reasoning/` module. On disk, `Reasoning/` contains only ForwardChainer/RdfsRules/OwlRules/ReasonerService; SHACL lives in a **separate `Validation/` module** (`ShaclService`, `ShaclParser`, `ShapeGenerator`, `ValidationReport` + `domain/.../Shacl.errors.ts`, `ShaclPolicy.value.ts`, one test file). Fixed both rows; SHACL is now its own BUILT bullet in §4.

**Remaining doubts (unchanged from Caveats):** did NOT re-run the v3 test suite — "proven" rests on file presence + self-reported counts; per-spec completeness still rests on README/folder/phase-table markers that sometimes disagree; the "fully real Enron end-to-end demo" remains UNVERIFIED (demo surface + engine exist, integration specs pending). Guardrail (reusable ENGINE vs learning-vehicle Enron/email DOMAIN; v3 ≠ present v4 capability) holds throughout and is not overstated.
