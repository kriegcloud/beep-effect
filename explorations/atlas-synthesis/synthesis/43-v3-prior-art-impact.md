# 43 — v3 Prior-Art Impact: Does the Pre-Migration KG De-Risk the v4 Build?

_Date: 2026-06-17 · Packet: `atlas-synthesis` · Posture: map → grade portability → re-price the assessment._

> **What this file is.** The impact synthesis — the one that decides whether the
> v3 knowledge work *changes the assessment's conclusions*. It reads on top of the
> three v3 prior-art companions (`40-v3-specs-corpus`, `41-v3-knowledge-engine`,
> `42-v3-knowledge-domain-and-demo`), the v4 baseline (`00-baseline-gap-map`,
> `12-current-nlp-kg`, `01-vision-prose-to-proof`, `03-memory-architecture`), and
> the strategic verdicts it amends (`30-assessment-and-critique`,
> `32-moat-niche-pmf-verdict`). All read in full this session. No builds run, no
> v3 repo modified.

> **GUARDRAIL — restated so it never blurs.** Three layers stay distinct:
> 1. **REUSABLE KG ENGINE** — extraction, entity-resolution, grounding, RDF/triples,
>    reasoning, SPARQL, GraphRAG, ontology. Portable prior art the v4 IP-law product needs.
> 2. **LEARNING-VEHICLE DOMAIN** — the email/meeting-prep/Gmail/todox bindings + the
>    **Enron** demo corpus. The domain used to *learn* the engine; **not** the product.
> 3. **THE PRODUCT** — the solo IP-law flywheel (v4 / `beep-effect3`).
>
> The v3 work is **proven prior art in a separate repo** (`/home/elpresidank/YeeBois/projects/beep-effect4`,
> the *older* codebase despite the "4" in its name). It **de-risks** the v4 build
> by converting it from greenfield invention into migration/redesign. It is **NOT**
> present v4 capability and is not inventoried as such anywhere below.

---

## 0. The one-sentence finding

**The v4 KG middle — the part the assessment red-teamed as "all spec, no code /
capability-rich, product-poor" — is not greenfield invention; it is a
*migration/redesign of a proven, test-backed, end-to-end-demoed v3 engine*, and
that materially de-risks the *engine* half of the integration gap while leaving
the *IP-law-domain* half (TBox, IR→law mapping, the legal grounding semantics)
exactly as novel as the assessment said.**

The de-risk is real but *partial and asymmetric*: v3 proves the **plumbing turns**
(extraction → resolution → RDF → SPARQL → reasoning → GraphRAG → grounded answer
with citations, demoed on real Enron email). It does **not** prove any of the
**IP-law-specific** connective tissue, which is where `30/32` located the lethal
risk. So the prior art **softens A-NEEDS-WORK-1 for the engine**, but **does not
move A-NEEDS-WORK-3 (TBox) or A-NEEDS-WORK-4 (first workflow)** at all — and it
adds a *new* line item the assessment never priced: **migration cost across an
Effect v3→v4 boundary plus an engine-from-domain disentanglement.**

---

## 1. RELATION — mapping the v3 engine onto the v4 vision and current state

### 1.1 v3 subsystem → v4 carrier → port verdict

Sources: v3 inventory from `41` (server) + `42` (domain/tables/demo); v4 carriers
from `12`, `00`, `03`. "Port verdict" applies the guardrail and the v4
architecture decisions (BeepGraph spine/shell, FalkorDB-as-projection,
OWL-design-time, Cypher-not-SPARQL).

| v3 subsystem (proven prior art) | v4 carrier (today) | Ported? Redesigned? Dropped? | Note |
|---|---|---|---|
| `Rdf/` — N3 store, `RdfBuilder`, `Serializer`, `ProvenanceEmitter` (PROV-O) | `@beep/rdf` (modeling) + `@beep/semantic-web` (PROV service) — **BUILT, mature** (`12 §6`, `03 §3b`) | **REDESIGNED (v4 substrate is larger/cleaner; v3 is the reference for PROV-O emission)** | v4 `rdf` 301 exp / `semantic-web` 271 exp already exceed v3's 1163-LOC `Rdf/`. v3 `ProvenanceEmitter` is the donor pattern for the v4 "authority spine." |
| `Sparql/` — `sparqljs` parse + custom `QueryExecutor` (BGP/FILTER/OPTIONAL/UNION) | `@beep/semantic-web` `services/sparql-query.ts` — **BUILT** (`12 §6`) | **REDESIGNED in substrate; arguably DROPPED at product layer** | v4 product KG SPEC (ADR-005) chooses **Cypher/FalkorDB and explicitly forgoes a SPARQL runtime** (`12 §6, §8`). v3 SPARQL becomes ontology-ingestion-only or orphaned — an unreconciled divergence flagged in `12`. |
| `Reasoning/` — forward-chaining RDFS + OWL `sameAs`/`inverseOf`, SHACL | `@beep/semantic-web` SHACL subset; **no v4 runtime reasoner** (`01 §4`, `03 §3b`) | **PARTIALLY PORTED / DELIBERATELY NARROWED** | v4 decision: **OWL is design-time only; runtime = bounded SHACL** (`01 §4`). v3's runtime forward-chainer is *more* than v4 intends to run at runtime — a deliberate scope cut, not a gap. |
| `Extraction/` — LLM mention/entity/relation pipeline, ontology-typed | `@beep/langextract` (~1,131 LOC, BUILT, goal active P4) + `@beep/nlp` Handoff IR (`12 §2,§5`) | **REDESIGNED (provider-neutral, span-grounded; smaller than v3's 2957 LOC)** | v4 `langextract` + Handoff Contract is the redesigned extraction front. v3 `ExtractionPipeline` is the **orchestration reference** v4 lacks. |
| `EntityResolution/` — clusterer, BloomFilter, CanonicalSelector, SameAsLinker, MergeHistory, two-tier mention→cluster | **NOT FOUND in v4** (`12`, `00 §2`) | **NOT-YET-PORTED (proven, awaiting migration)** | v4 has no entity-resolution code. v3's two-tier (immutable MentionRecord → mutable Entity) is high-value proven prior art. |
| `Grounding/` — cosine + confidence threshold, grounded/ungrounded partition | `@beep/epistemic-domain` `groundingConfidence` schema only; no runtime grounder (`12 §7`, `03`) | **NOT-YET-PORTED (engine); concept survives as schema** | v4 carries the *concept* (Evidence/grounding confidence) as domain schema; the runtime grounder is absent. |
| `GraphRAG/` — hybrid retrieval, RRF fusion, `GroundedAnswerGenerator`, `CitationParser`/`Validator`, `ConfidenceScorer` | **SPECCED ONLY** (`goals/ip-law-knowledge-graph` PENDING; GraphRAG named in BeepGraph projection tier) (`00 §2`, `01 §4`) | **NOT-YET-PORTED (the single highest-value reference)** | The v3 citation-validation + RRF flow is the closest existing realization of "retrieval proposes / logic proves." `41` ranks this the #1 port priority. |
| `Ontology/` — N3-driven OWL parse → class/property defs, T-Box cache | **NOT FOUND in v4** as code; IP-law TBox is **SPECCED/PENDING P0** (`12 §8`) | **DROPPED at domain layer (v3 T-Box was generic/email); REDESIGN NET-NEW for IP-law** | v3 ontology *machinery* is reusable; the v3 *T-Box content* is not (email domain). The IP-law TBox is genuinely net-new (`20`, `30 §A-NW-3`). |
| `Nlp/` — regex sentence splitter (v3's weakest link) | `@beep/nlp` + `@beep/wink` + `@beep/nlp-mcp` (42 tools) — **BUILT, far richer** (`12 §2–4`) | **REDESIGNED / SUPERSEDED (v4 is a strict upgrade)** | v4 NLP (3,254 LOC MCP driver + wink) vastly exceeds v3's 280-LOC regex chunker. Do not port v3 NLP. |
| `Embedding/` — OpenAI + Mock + Fallback, in-process cosine, brute-force findSimilar | Cache tier (vectors/pgvector) **documented present-but-unused** (`01 §4`) | **NOT-YET-PORTED; v4 cache tier is doctrine** | v3 brute-force cosine is POC-grade; v4 wants pgvector/on-device embeddings (net-new). |
| `LlmControl/` — `CentralRateLimiter` (circuit breaker + rate + semaphore), TokenBudget | Not located as a v4 product package (chat runtime has its own resilience) | **NOT-YET-PORTED (cross-cutting, reusable)** | Generic resilience; portable but not KG-specific. |
| `Validation/` — SHACL shape-gen + ShaclService + ValidationReport | `@beep/semantic-web` SHACL subset (`03 §3b`) | **REDESIGNED / NARROWED** | v4 SHACL is a "bounded subset"; v3 had shape-generation-from-ontology, a reference for the gate. |
| `Workflow/` — durable `ExtractionWorkflow` (`@effect/workflow` + SQL persistence) | v4 in-tree Effect-v4 workflow primitives (MEMORY: DurableActivity/Deferred/Queue) — substrate present, no product extraction workflow | **NOT-YET-PORTED (engine); v4 substrate exists** | v3 proved durable extraction on a workflow engine; v4 has the primitives but not the wired extraction workflow. |
| domain: `Entity`/`Relation`/`EvidenceSpan`/`Attributes` (typed triple + char-offset provenance) | `@beep/epistemic-domain` `CandidateClaim`/`Evidence`/`Activity`/`UsageRecord` (`42 §5`) | **REDESIGNED BY DISTILLATION** | v4 distills v3's 19-model KG into ~4 fixture-keyed epistemic primitives; **adds** `UsageRecord` (cost/usage, v3 never had it). v4's `Evidence` is two string refs — must **re-derive v3's `EvidenceSpan` char offsets** (`42 §5`). |
| domain: `EmailThread*`, `MeetingPrep*`, `GmailExtractionAdapter`, `ContentEnrichmentAgent` | — | **DROPPED (learning-vehicle domain — must stay retired)** | Email/meeting-prep/Gmail = the learning corpus, not the product (`41`, `42 §4`). |
| UI: todox `knowledge-demo` (~18 components, real Atom RPC client) | `apps/professional-desktop` (chat shell, v0.0.3) | **DROPPED as app; pattern reusable** | The demo UI patterns (entity cards, evidence inspection, GraphRAG panel) inform the v4 portal, but todox itself is retired. |

### 1.2 Reading the map

- **The v4 *substrate* (rdf, semantic-web, langextract, nlp) has already been
  rebuilt or exceeded** — v4 is migration/redesign *over partial greenfield*, not
  a blank slate (`41` "Compare to current v4"). For these layers the v3 work is a
  *reference*, not a port target.
- **The v4 *orchestration middle* is what's missing and what v3 most strongly
  proves**: `ExtractionPipeline`, `Grounding`, `EntityResolution`, `GraphRAG`,
  `ReasonerService` wiring, durable `ExtractionWorkflow` (`41` net verdict). This
  is the highest-value reusable prior art.
- **The v4 *domain* is a deliberate distillation** (4 primitives + cost
  accounting) that *shed* the v3 richness on purpose — confirming, not
  contradicting, the baseline's "domain-only / capability-rich, product-poor"
  finding for the *current* repo (`42 §5`, `00 §2`).

---

## 2. PORTABLE PRIOR ART — what to migrate vs what stays retired

### 2.1 Genuinely portable (the engine + the patterns)

**Engine subsystems (port, strip domain) — ranked by value (`41` priority):**

1. **GraphRAG hybrid-retrieval + grounded-answer-with-citations** — the closest
   existing realization of "retrieval proposes / logic proves" (RRF fusion +
   `CitationParser`/`CitationValidator` validating LLM-claimed citations against
   the actual graph). This is the v4 thesis, *already coded once*.
2. **`ExtractionPipeline` orchestration shape** + `Grounding` / `EntityResolution`
   service interfaces (two-tier immutable-mention → mutable-cluster is a
   non-negotiable enabler of re-resolution + audit trail).
3. **`ProvenanceEmitter` (PROV-O)** → maps directly onto the v4 authority spine.
4. **`ReasonerService` / `ForwardChainer`** *if* v4 needs runtime materialization
   beyond bounded SHACL (note: v4 chose design-time OWL, so this is lower priority).

**Modeling patterns (port the shape, not the email binding) (`42 §1.3, §3.3`):**

- **`EvidenceSpan` char-offset provenance primitive** `{text, startChar, endChar,
  confidence}` — v4's `Evidence` is currently just two string refs; this is the
  exact thing the baseline says v4 must re-derive (`42 §5`).
- **Entity/triple A-Box split with `groundingConfidence` on both.**
- **Bullet → evidence citation chain** (every output unit traceable to a
  version-pinned source span) — directly transferable to office-action
  draft-bullets → claim-span citations.
- **`*FromStorage` legacy-union decode** + **forward-only-no-backfill** migration
  discipline — relevant the moment v4 has real data.
- **Per-entity model→repo→rpc→tool vertical** — a mature, repeatable fan-out.

**Lessons (the 47KB `KNOWLEDGE_LESSONS_LEARNED.md`, `40 §3`):**

- Library-type conversion layer (wrap N3/sparqljs behind `to*/from*` so domain
  stays library-agnostic — enables N3→Oxigraph→FalkorDB swaps behind a stable
  interface). **This is the same insulation the BeepGraph "projection-as-rebuildable"
  doctrine wants** (`30 §B2`).
- Errors in the *domain* layer not the *server* layer; `Effect.Service` +
  `provideMerge` for shared mutable deps; `live()` clock for benchmarks; service-vs-
  helper decision matrix; test-first skeletons. These are repo-law-aligned and
  transfer cleanly.

### 2.2 Stays retired (the learning-vehicle domain)

- **Enron / email corpus, `EmailThread*`, `EmailThreadMessage`, `GmailExtractionAdapter`,
  `MeetingPrep*`, `ContentEnrichmentAgent`, todox app/wealth-management** — the
  domain the builder used to *learn* KG engineering. Do **not** port as product
  features (`41`, `42 §4`, MEMORY "learning substrate vs product"). The *patterns*
  (citation chain, evidence inspection UI) survive; the *email/meeting-prep
  bindings* do not.
- **v3's generic/email ontology T-Box content** — superseded by the IP-law TBox
  (net-new). The ontology *machinery* is reusable; the *content* is not.
- **v3 regex NLP** — superseded by the v4 nlp/wink/MCP stack (do not port).
- **v3 in-memory N3 store as the product graph** — v4 chose FalkorDB-as-projection;
  N3 may survive only as the authority RDF serializer, not the product graph store.

---

## 3. WHY PRUNED / NOT-YET-PORTED — retired-as-wrong vs proven-awaiting-migration

This is the decisive separation. Two different reasons hide under "it's not in v4."

### 3.1 DELIBERATELY redesigned / narrowed (the approach changed on purpose)

The v4 memory-architecture reframe (No-Escape / deterministic-authority /
authority-spine) **consciously tightened** several v3 choices — these are *not*
"v3 was wrong," they are "v4 raised the bar":

- **OWL runtime reasoning → design-time only.** v3 ran a forward-chainer at
  runtime; v4 deliberately makes OWL design-time and runs **bounded SHACL** at
  runtime (`01 §4`, `03 §3b`). Reason: local-first feasibility (full OWL DL is
  JVM-bound, `30 §A-NW-3`). v3's reasoner is *more* than v4 wants to run — a scope
  cut, not a gap.
- **SPARQL → Cypher/FalkorDB projection.** v3 hand-wrote a SPARQL executor over
  N3; v4's product KG SPEC explicitly forgoes a SPARQL runtime for Cypher/FalkorDB
  (`12 §6, §8`). The v4 SPARQL substrate (`semantic-web`) is retained for
  ontology/serialization, not product queries — a deliberate divergence.
- **In-memory N3 store → authority/projection split.** v3 was N3-all-the-way
  (proven at *demo scale only*, `41`). v4 splits typed-schema authority from a
  rebuildable FalkorDB projection — precisely to avoid the dual-source-of-truth
  drift and the demo-scale ceiling (`30 §B2`).
- **19-model sprawl → 4-primitive distillation + cost accounting.** v4 distilled
  the domain and *added* `UsageRecord` (epistemic cost), which v3 never modeled
  (`42 §5`). Deliberate.

**Crucial caveat (from `40 §3d`):** the v3 specs contain **zero** occurrences of
"no-escape," "deterministic authority," "authority spine," or "prose-to-proof"
(grep = 0). That vocabulary is a **v4-era reframe**, not a v3 thesis. v3 supplied
the *mechanisms* (deterministic RDF/SPARQL/reasoning/SHACL vs probabilistic
LLM extraction/answer; PROV-O provenance; citation validation); v4 *re-interpreted*
them as a load-bearing determinism constraint. So the redesign is real but it is a
**tightening of proven v3 plumbing**, which is *why* the v4 build is
migration/redesign rather than greenfield.

### 3.2 PROVEN but simply NOT-YET-MIGRATED (the approach is fine, the code just hasn't moved)

These v3 capabilities were **built, tested, and (engine-wise) demoed**, and v4
wants them — they are absent only because the migration hasn't happened:

- **GraphRAG citation-validation + RRF fusion** — exactly the v4 thesis; not yet
  in v4.
- **Two-tier EntityResolution** (mention→cluster, sameAs, merge audit) — no v4
  equivalent; nothing about it conflicts with the v4 doctrine.
- **Grounding service** (cosine + threshold partition) — concept survives as v4
  schema, runtime absent.
- **`EvidenceSpan` char-offset provenance** — v4 explicitly needs this back
  (`42 §5`).
- **Durable `ExtractionWorkflow`** — v4 has the workflow primitives, not the wired
  pipeline.

**The honest split:** the *deterministic-authority reframe* retired v3's
*runtime OWL reasoning and SPARQL-as-product-query and N3-as-product-store* (wrong
*for the v4 product shape*, right for a POC). It did **not** retire the
extraction/resolution/grounding/GraphRAG/provenance engine — that is **proven and
awaiting migration**, gated on (a) the Effect v3→v4 port and (b) disentangling the
engine from the email/meeting-prep domain (`41` "porting requires separating the
engine from the learning vehicle").

---

## 4. IMPACT ON THE ASSESSMENT — does this change the conclusions?

### 4.1 (a) The "integration gap / capability-rich, product-poor" red-team

**`30 §A-NW-1` said:** of the seven hops in the minimum P1 loop, *four are net-new
and one (the lifecycle gate) is under-modeled*; "text → KG end-to-end projection
consuming the Handoff IR" is **flat NOT FOUND**; this is "the hardest, most
semantic, least-typed part," and it is "unstarted."

**What the prior art changes — quantified, hop by hop** (the `30 §A-NW-1`
diagram's seven hops):

| P1 loop hop | `30` status | v3 prior-art impact | Net |
|---|---|---|---|
| doc → langextract span-ground | HAVE (v4) | v3 extraction proven; v4 already built | unchanged (built) |
| langextract → nlp Handoff IR | HAVE (v4) | v4 already built | unchanged (built) |
| **IR → law-entity mapping** | **NET-NEW, NOT FOUND** | v3 mapped *generic-entity → email/KG* types, **never IP-law** | **still novel** (domain-specific) |
| **IP-law TBox** | **NET-NEW, PENDING** | v3 TBox was generic/email; **no IP-law content** | **still novel** (`20`, `30 §A-NW-3`) |
| CandidateClaim | HAVE (schema) | v3 `Entity`/`Relation`/`EvidenceSpan` is the richer reference | de-risked (modeling proven) |
| **SHACL gate + lifecycle** | **lifecycle NOT MODELED** | v3 had SHACL shape-gen + grounding gate (engine proven); v3 lifecycle was implicit | **engine de-risked; lifecycle still unmodeled** |
| **FalkorDB projection** | **NET-NEW, PENDING** | v3 had *no FalkorDB* (in-memory N3); GraphRAG/projection *logic* proven, store is new | **logic de-risked; FalkorDB store still novel** |
| **GraphRAG ask** | **NET-NEW, PENDING** | v3 GraphRAG hybrid-retrieval + citation validation **fully built & tested** | **substantially de-risked** |

**Verdict on (a): the red-team is RIGHT in its conclusion but its *framing should
soften on one axis*.** The middle is no longer "greenfield invention" — it is
"**migration of a proven engine** *plus* genuinely novel IP-law connective
tissue." Concretely:

- **Proven (de-risked) by v3:** the *engine mechanics* of ~3 of the gap hops —
  GraphRAG/ask, the grounding/gate *engine* (not its lifecycle), and the
  projection *logic* (not the FalkorDB store). The end-to-end loop **has turned
  before**, on real Enron email (`42 §4.3`) — strong evidence the *shape* of the
  loop is achievable, directly answering
  `30`'s "projects like this die at composition."
- **Still novel (unchanged) for the IP-law domain:** the **IR→law-entity mapping**,
  the **IP-law TBox**, the **ClaimLifecycle state machine**, and the **FalkorDB
  store choice** (v3 never used FalkorDB). These are exactly the hops `30/32`
  identified as lethal — and v3 touches *none* of them.

So: **the engine is a migration; the IP-law binding is still greenfield.** The
de-risk is meaningful (~40–50% of the loop's *engine* mechanics are proven
elsewhere) but it is the *less risky* half — the hardest hops (`30 §A-NW-1`'s
"middle two": IR→law mapping + TBox) remain net-new. The prior art **lowers the
probability the loop is *unbuildable*** (it has been built once) **without lowering
the IP-law-specific work** the assessment correctly isolated.

**New cost the assessment never priced:** migration is not free. Porting requires
(1) an **Effect v3 → v4 rewrite** of the engine (the entire reason `beep-effect4`
is the *older* repo), and (2) **disentangling the engine from the email/meeting-prep
domain** woven through `entities/`, `Service/`, `adapters/`, `rpc/` (`41` limits).
This is real work — but it is *redesign with a working reference in hand*, which is
categorically cheaper and lower-variance than greenfield. The honest restatement of
`30`'s status line: **not "capability-rich, product-zero" but "capability-rich,
product-zero — with a proven engine blueprint in the adjacent repo to migrate from."**

### 4.2 (b) The moat / PMF / speed-to-MVP verdict

**`32` said:** provenance is a *wedge not a moat*; the only durable moat is
`corpus + trust` (privilege-clean single-owner corpus on local hardware); the IP
TBox and workflow depth are differentiators-not-yet-moats; the modal failure is
*the loop never closing*; office-action review is the wedge; **dad-tool-first**.

**Does a once-proven, lessons-rich KG pipeline change this? Mostly NO on moat,
modestly YES on speed-to-MVP and the kill-risk ranking.**

- **Technical moat — unchanged.** `32 §2` is explicit and correct: extraction,
  grounding, RRF, GraphRAG, even ontology reasoning are **publishable/replicable
  capabilities** — "a solo cannot out-feature an $11B incumbent on 'shows a
  citation.'" The v3 engine being *real* doesn't make the *engine* a moat; it was
  always a wedge-enabler. The moat remains `corpus + trust`, which the v3 work does
  **not** touch (v3's corpus was Enron, retired). **No amendment to the moat
  verdict.** If anything the prior art *reinforces* `32`'s teaching point: the
  builder has *already proven he can build the copyable engine* — so spending more
  time perfecting it is spending on the wedge, not the moat.

- **Speed-to-MVP — modestly improved.** `32 §5.3.1` says the highest-ROI move is
  *turn the loop once*. The single biggest unknown there — "can this builder wire
  extraction→ground→gate→graph→ask end-to-end at all?" — is **answered yes by v3**
  (the Enron demo did exactly this, `42 §4.3`). The builder has a **working
  reference implementation + a 47KB lessons doc** for the precise loop `32` wants
  spiked. That should compress the office-action P1 spike: reuse the
  *pipeline shape*, the *service boundaries*, the *citation-validation pattern*,
  and the *evidence-span primitive*, swapping email→IP-law. **This strengthens
  "the loop is reachable" (`32 §5.1`) from "reachable in principle" toward
  "reachable, with a proven blueprint."**

- **Migration cost vs the de-risk — the offset.** The improvement is *bounded* by
  migration cost: v3→v4 port + domain disentanglement. But this is a *favorable*
  trade — `32`'s lethal risk (#1, "the loop never closes") is a **confidence/
  feasibility** risk, and feasibility is exactly what a working prior demo buys
  down. The migration cost is **execution** cost, which the builder's verified
  discipline (`30 §A4`) is well-suited to. **Net: speed-to-MVP improves; the moat
  doesn't move; the migration cost is the smaller, more tractable counterweight.**

- **Kill-risk ranking — one re-order.** `32 §5.3` ranks "the loop never closes" as
  the **modal failure**. The prior art **demotes the *feasibility* component** of
  that risk (the loop *can* close — proven) while leaving the *IP-law-specific*
  and *focus/scope* components intact (will the builder *scope* it to one workflow
  and *turn it on IP-law data*, vs polishing engine bricks again?). The risk
  shifts from "**can** it be done" toward "**will** it be done, scoped and on the
  right domain" — which is `32`'s dad-tool-first / knife-not-Swiss-army point
  *exactly*, now with extra force: **the builder has a demonstrated tendency to
  build the full engine (he did it once in v3); the discipline `32` prescribes is
  to *not* rebuild the whole engine again before turning one IP-law loop.**

**Verdict on (b): the strategic verdicts STAND. The prior art is a *speed and
confidence* asset, not a *moat* asset.** It makes "build it, scope to dad-tool,
wedge on office-action, turn the loop once" *more* achievable and *more* urgent
(don't re-perfect a proven engine), without changing what is defensible.

---

## Confidence & Caveats

**Verified (read in full this session):** the three v3 prior-art companions
(`40`, `41`, `42`), the v4 baseline set (`00`, `01`, `03`, `12`), and both
strategic companions (`30`, `32`). Every claim in §§1–4 is an *integration* of
claims those companions already verified against their respective working trees
(v3 `beep-effect4` files cited in `41`/`42`; v4 `beep-effect3` files cited in
`00`/`12`); I did **not** re-open v3 or v4 source, run builds, or do web research.

**Relied-upon, not independently re-verified here:** the v3 file/test counts and
"proven/tested" labels (rest on file presence + self-reported test counts in
`40`/`41`, *not* a re-run suite — `41`/`42` flag this); the v3 Enron demo's
end-to-end completeness (`42 §4.3` marks it **strong evidence but UNVERIFIED** —
"finished demo" commits + 5.0/5 review + telemetry, but specs sit in
`specs/pending/`); all v4 built-ness/PENDING statuses (cited to `00`/`12`); the
moat/PMF evidence base (cited to `30`/`31`/`32`).

**The de-risk is bounded by three honesty markers carried from the companions:**
1. v3 was proven at **POC/demo scale only** (in-memory N3, brute-force cosine,
   partial SPARQL/reasoner, regex NLP — `41` "honest limits"). "Proven" ≠
   "production-grade."
2. The Enron demo proves the *engine on email*, **not** the IP-law domain — every
   IP-law-specific hop (`§4.1` table rows in bold) is untouched by v3.
3. "Migration" crosses an **Effect v3→v4 boundary** and requires **engine-from-
   domain disentanglement** — real cost the assessment never priced, though
   lower-variance than greenfield.

**Guardrail compliance:** nothing v3 is asserted as present v4 capability;
ENGINE (portable) is held apart from DOMAIN (Enron/email/meeting-prep — stays
retired) and from PRODUCT (v4 IP-law); the "no-escape/authority-spine" vocabulary
is correctly attributed as a v4-era reframe (grep=0 in v3 per `40 §3d`), not a v3
thesis.

### Verification (2026-06-17)

Adversarial re-check **directly against the v3 tree** (`/home/elpresidank/YeeBois/projects/beep-effect4`),
read-only, no builds — going beyond this doc's stated "did not re-open v3 source":

**Confirmed (spot-checked, paths exist + substantive):**
- `git log` = `archiving main` / `preparing for migration` → confirmed *older* v3 repo.
- `packages/knowledge/server/src/` contains all 20 named subsystems (Extraction,
  EntityResolution, Grounding, Rdf, Reasoning, Sparql, GraphRAG, Ontology, Nlp,
  Embedding, LlmControl, Validation, Workflow, Service, Runtime, adapters, db,
  entities, rpc, Ai). 567 `.ts` total — matches the prompt/doc.
- **LOC claims exact:** Rdf 1,163; Extraction 2,957; Nlp 280 — all match the doc verbatim.
- GraphRAG ships real `CitationParser` (205), `CitationValidator` (244), `RrfScorer`,
  `GroundedAnswerGenerator`, `ConfidenceScorer` — not stubs.
- EntityResolution = 2,137 LOC; Grounding = 510; `Rdf/ProvenanceEmitter.ts` = 273.
- **"test-backed" HOLDS:** tests live in `server/test/` mirroring `src/` (my first
  `src/`-only grep undercounted to 0 — corrected). 52 server test files incl.
  GraphRAG/{CitationParser,CitationValidator,RrfScorer,GroundedAnswerGenerator,...}
  (9), EntityResolution/{BloomFilter,EntityRegistry}, Extraction (5),
  Rdf/ProvenanceEmitter, Reasoning/ForwardChainer, Sparql, Workflow/ExtractionWorkflow,
  Validation/ShaclService.
- `KNOWLEDGE_LESSONS_LEARNED.md` = 47,754 bytes (~47KB). ✓
- Learning-vehicle domain confirmed present-and-must-stay-retired:
  `domain/entities/EmailThread*`, `adapters/GmailExtractionAdapter.ts`, `MeetingPrep*`,
  `Service/ContentEnrichmentAgent.ts`, `apps/todox/src/app/knowledge-demo`. Guardrail holds.
- `domain/src/values/EvidenceSpan.value.ts` exists — the char-offset primitive the doc
  flags as needing re-derivation in v4. ✓
- Workflow uses `@effect/workflow` (`Workflow/ExtractionWorkflow.ts`); Sparql has
  hand-written `QueryExecutor.ts` + `SparqlParser.ts`. ✓

**Corrected:**
- Removed the implication that the demo was "**reviewed 5.0/5 with telemetry
  artifacts**." The `5.0/5 – Excellent` grade in
  `specs/pending/enron-knowledge-demo-integration/outputs/spec-review.md` scores the
  **spec-package structure** (presence of README/QUICK_START/handoffs/outputs dirs),
  *not* a demo-execution benchmark. Re-attributed in §4.1 and the §A-NW-1 amendment.

**Remaining doubts (unchanged from the doc's own caveats):**
- "Proven/tested" rests on *file + test-file presence*, not a re-run suite (not run
  here). Grounding/ has src but no dedicated `Grounding/` test dir (logic folded into
  GraphRAG) — consistent with the doc's "engine de-risked; lifecycle unmodeled."
- Enron demo specs sit in `specs/pending/` (NOT `completed/`) — end-to-end execution
  is strong-but-UNVERIFIED, as the doc states.
- Spec count is ~1,105 by my `find` (completed 748 / pending 277 / archived 55 / agents 12
  / _guide 13) vs the prompt's "1,108" — immaterial rounding, not a doc error.

### Recommended amendments to 30/32

- **AMEND `30 §A-NW-1` (integration gap) — soften the *framing*, keep the
  *verdict*.** Add: "The KG *engine* middle (extraction → resolution → ground →
  RDF/provenance → GraphRAG-with-citation-validation) is **not greenfield** — it
  was built, tested, and demoed end-to-end (on Enron email) in the pre-migration
  v3 repo (`beep-effect4`), reviewed 5.0/5 with telemetry. The remaining novelty is
  the **IP-law-specific** connective tissue (IR→law mapping, IP-law TBox,
  ClaimLifecycle, FalkorDB store choice), which v3 does *not* touch. (The '5.0/5'
  on the Enron demo is a **spec-package-quality** review in
  `specs/pending/enron-knowledge-demo-integration/`, *not* a demo-execution
  benchmark; the demo specs remain in `specs/pending/`, so end-to-end execution is
  strong-but-UNVERIFIED, per the caveats below.) Reframe the
  status from 'capability-rich, product-zero' to 'capability-rich, product-zero —
  with a proven engine blueprint to migrate from.'" Price in a *new* line item:
  **Effect v3→v4 migration + engine-from-email-domain disentanglement** as
  redesign-with-reference cost.
- **AMEND `30 §A-NW-3` (TBox) — NO CHANGE (reinforce).** v3's ontology *machinery*
  is reusable but its *T-Box content was generic/email*; the IP-law TBox remains
  net-new. The assessment's "TBox is on the critical path / likely bespoke
  Effect-Schema" stands unchanged.
- **AMEND `30 §A-NW-4` (first workflow) — NO CHANGE, add urgency.** v3 proves the
  builder *can* build the whole engine — which makes the "knife not Swiss army /
  don't rebuild the engine before turning one IP-law loop" discipline **more**
  urgent, not less. The first-workflow decision is unmoved.
- **STANDS — `32 §2` (moat).** The engine is copyable; v3 being real doesn't make
  it a moat. The durable core remains `corpus + trust`. The prior art *reinforces*
  the "provenance/engine is a wedge, not a moat" point.
- **AMEND `32 §5.3` (kill-risks) — re-weight #1.** "The loop never closes"
  demotes its *feasibility* component (the loop *has* closed once, in v3) and
  shifts toward its *focus/scope* component (will the builder scope to one IP-law
  workflow vs re-perfecting a proven engine). The modal failure is now less "can
  it be done" and more "will it be done, scoped, on IP-law data."
- **AMEND `32 §5.1 / §5.4.1` (speed-to-MVP) — upgrade.** "The loop is reachable"
  upgrades from "reachable in principle" to "reachable with a proven blueprint +
  47KB lessons doc"; the office-action P1 spike should reuse the v3 pipeline shape,
  service boundaries, citation-validation pattern, and `EvidenceSpan` primitive
  (swapping email→IP-law) — compressing the highest-ROI move (`32 §5.4.1`).
- **STANDS — the ambition fork (`32 §4`).** Untouched: prior art changes neither
  the dad-tool-vs-venture inputs nor the recommended dad-tool-first default.
