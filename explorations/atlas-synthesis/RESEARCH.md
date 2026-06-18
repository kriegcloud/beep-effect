# RESEARCH — atlas-synthesis

> Per the explorations convention, the research stage has two halves: an **in-repo
> capability inventory** and an **external landscape**. Both were produced as dedicated
> synthesis artifacts in [`synthesis/`](./synthesis/); this file is the **INDEX** that
> links them. **Start with [`synthesis/00-baseline-gap-map.md`](./synthesis/00-baseline-gap-map.md)**,
> then [`synthesis/90-archaeology-pruned-repo-intel.md`](./synthesis/90-archaeology-pruned-repo-intel.md).

## How this packet was built

A maximal fan-out (~31 agents) on 2026-06-17: a barrier of **census + git-archaeology**,
then **13 synthesis agents** (doctrine, goals, current-state, external deep-research), each
followed by an **adversarial skeptic verifier** (pipelined), then a **centerpiece**
synthesis-of-syntheses. Two companions — `05` (user profile) and `23` (codebase lineage) —
were added after. Every in-repo claim is grounded in `standards/repo-exports.catalog.md` +
targeted reads/git; every external claim is cited and adversarially verified. Each artifact
carries its own `## Confidence & Caveats` (with a dated `### Verification` subsection).

## Recommended read order

`00` → `90` → `01` → `02` → `03` → `04` / `05` → `16` → `10`–`15` → `20`–`23`; then the
**assessment** `30` → `31` → `32`, and the **v3 prior art** `43` (impact) ← `40` / `41` / `42`

## Synthesis index

### Centerpiece & framing
| # | Doc | One line |
|---|---|---|
| **00** | [`00-baseline-gap-map.md`](./synthesis/00-baseline-gap-map.md) | The synthesis-of-syntheses: you-are-here ↔ vision ↔ gap ↔ critical path. **Read first.** |
| 90 | [`90-archaeology-pruned-repo-intel.md`](./synthesis/90-archaeology-pruned-repo-intel.md) | Commit-level proof the code-intelligence vehicle was pruned; disambiguates surviving tooling. **Read second.** |
| 05 | [`05-user-profile-working-style.md`](./synthesis/05-user-profile-working-style.md) | Who the builder is + how to collaborate (types/schemas-first, capability-decomposition, learn-by-porting). |

### Doctrine & vision
| # | Doc | One line |
|---|---|---|
| 01 | [`01-vision-prose-to-proof.md`](./synthesis/01-vision-prose-to-proof.md) | Prose-to-proof, Tom/flywheel, BeepGraph spine/shell, Have/Specced/Build ledger. |
| 02 | [`02-architecture-doctrine.md`](./synthesis/02-architecture-doctrine.md) | The binding architecture grammar: vertical+hexagonal slices, drivers, foundation, errors, layers. |
| 03 | [`03-memory-architecture.md`](./synthesis/03-memory-architecture.md) | No-Escape + 4-layer taxonomy as learned theory mapped onto product substrate. |
| 04 | [`04-goals-landscape.md`](./synthesis/04-goals-landscape.md) | Goal-packet statuses + exploration front end + thematic clusters + dependency graph. |

### In-repo capability inventory (current state)
| # | Doc | One line |
|---|---|---|
| 16 | [`16-package-topology-census.md`](./synthesis/16-package-topology-census.md) | The substrate reference — every workspace package, built-ness, naming resolved. **Read before 10–15.** |
| 10 | [`10-current-chat-runtime.md`](./synthesis/10-current-chat-runtime.md) | The shipping chat/runtime stack (learning-vehicle proving ground). |
| 11 | [`11-current-doc-processing.md`](./synthesis/11-current-doc-processing.md) | file-processing contract + tika/libpff drivers + pandoc-ast↔md interop. |
| 12 | [`12-current-nlp-kg.md`](./synthesis/12-current-nlp-kg.md) | NLP → extraction → (specced) KG; where "built" stops and "PENDING" begins. |
| 13 | [`13-current-corpus-data.md`](./synthesis/13-current-corpus-data.md) | The Oppold corpus as ahead-of-time data prep (tool in-repo, data out). |
| 14 | [`14-foundation-tooling-drivers.md`](./synthesis/14-foundation-tooling-drivers.md) | The reusable brick layer — what to build the product with. |
| 15 | [`15-apps-and-runtime-wiring.md`](./synthesis/15-apps-and-runtime-wiring.md) | Every app + how each wires its runtime; `law-practice` named-but-unwired. |

### External landscape (cited, adversarially verified)
| # | Doc | One line |
|---|---|---|
| 20 | [`20-external-ontology-stack.md`](./synthesis/20-external-ontology-stack.md) | The IP-law ontology stack; the patent/TM IP-substance gap. |
| 21 | [`21-external-memory-kg-donors.md`](./synthesis/21-external-memory-kg-donors.md) | TrustGraph/FalkorDB/GraphRAG/Graphiti/Cognee/langextract as idea donors; FalkorDB SSPL flag. |
| 22 | [`22-external-noescape-foundations.md`](./synthesis/22-external-noescape-foundations.md) | No-Escape paper audit, SHACL/OWL local-first feasibility, langextract grounding. |
| 23 | [`23-external-codebase-lineage.md`](./synthesis/23-external-codebase-lineage.md) | The local learn-by-porting lineage: Lexical→effect-lexical-chat→repo; TrustGraph Python→Effect-native TS port→narrowed kernel. |

### Assessment & strategy (30-band — steelman → red-team → verdict)
| # | Doc | One line |
|---|---|---|
| 30 | [`30-assessment-and-critique.md`](./synthesis/30-assessment-and-critique.md) | Candid assessment: good / needs-work / bad + the architecture critique; the integration gap is THE risk. (+ v3 amendment) |
| 31 | [`31-competitive-landscape.md`](./synthesis/31-competitive-landscape.md) | Cited competitive landscape + positioning map + market/funding + UPL/ethics; the local+grounded+IP niche is empty. |
| 32 | [`32-moat-niche-pmf-verdict.md`](./synthesis/32-moat-niche-pmf-verdict.md) | The verdict: provenance is a *wedge* not a moat (corpus+trust is); office-action wedge; dad-tool-first; build it. (+ v3 amendment) |

### v3 prior art (40-band — the pre-migration Effect v3 repo `beep-effect4`)
| # | Doc | One line |
|---|---|---|
| 40 | [`40-v3-specs-corpus.md`](./synthesis/40-v3-specs-corpus.md) | The v3 specs corpus + the 47KB `KNOWLEDGE_LESSONS_LEARNED.md`; what was built/proven vs planned. |
| 41 | [`41-v3-knowledge-engine.md`](./synthesis/41-v3-knowledge-engine.md) | The v3 `@beep/knowledge-server` engine (189 src / 52 test files): extraction → … → GraphRAG-with-citation-validation. |
| 42 | [`42-v3-knowledge-domain-and-demo.md`](./synthesis/42-v3-knowledge-domain-and-demo.md) | The v3 domain model + tables + UI + the synthetic-email POC; how v4 `epistemic-domain` distills it. |
| 43 | [`43-v3-prior-art-impact.md`](./synthesis/43-v3-prior-art-impact.md) | **Impact:** the KG middle is a *migration* of a proven engine, not greenfield — softens the integration-gap red-team; amendments to 30/32. |

### Foundation gaps (60-band — what to build/migrate next)
| # | Doc | One line |
|---|---|---|
| 60 | [`60-foundation-gaps.md`](./synthesis/60-foundation-gaps.md) | The foundation is ~80% there: the shared **`@beep/provenance`** anchor is the keystone fill-in; the epistemic boundary is small; embeddings/reasoner/ask are migrate-from-v3; the graph + SHACL gate already exist. |

## Headline findings (drill into the docs above)

- **In-repo:** substrate is broad and mature; the one product slice (`law-practice`) is
  **domain-only**; the product-defining middle (IP-law TBox, IR→law mapping, graph
  projection, portal loop) is **all spec, no code**. The gap is **composition, not missing
  bricks**.
- **External caveats to carry:** FalkorDB is **SSPLv1**; the No-Escape "theorem" is an
  **unrefereed vendor preprint** (arXiv:2603.27116); **no off-the-shelf ontology models
  patent/TM IP substance** (likely bespoke Effect-Schema); the **TrustGraph TS port is
  locally near-complete** but documented-not-reproven.
- **Doctrine drift:** `standards/memory-architecture/` still calls L3 code-intelligence
  "the competitive edge" in present tense, pointing at pruned code — a candidate for a
  dated amendment.
- **Assessment verdict (`32`):** the niche is real (local + grounded + IP is empty);
  provenance is a *wedge*, the durable moat is `corpus + trust`; wedge on **office-action
  review**; **dad-tool-first, venture-option-held**; build it — but *turn the loop once*.
- **v3 prior art (`43`):** the KG engine middle was **built + tested** in the pre-migration v3
  repo (ran end-to-end on synthetic emails) — so the integration gap is substantially a
  *migration*, not greenfield; the IP-law-specific hops (IR→law mapping, TBox, lifecycle,
  FalkorDB store) stay net-new. New open question: **migrate the proven engine vs rebuild**.

## Confidence

Each synthesis doc was adversarially verified at write time (see its `### Verification`
section). This index and the centerpiece are a synthesis layer: they integrate the
companions' verified claims rather than re-verifying them. Open questions are consolidated
in `synthesis/00-baseline-gap-map.md` §5.
