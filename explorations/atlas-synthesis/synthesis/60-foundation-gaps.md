# 60 — Foundation Capability Gaps (what to fill in to make the goals achievable)

_Date: 2026-06-17 · Packet: atlas-synthesis · Posture: opinionated recommendation, in types._

> Answers the question: "what foundation gaps/capabilities are we missing (à la `@beep/langextract`,
> `@beep/nlp`, `@beep/editor`) that would make the things we're striving for more achievable?"
> Grounded in this packet's recon + `12` (nlp/kg), `14` (foundation inventory), `16` (census),
> `00` (gap map), `30`/`32` (assessment), `43` (v3 prior art). It is a **recommendation**, not a
> build; it coordinates with the now-graduated `epistemic-claim-lifecycle-gate` packet.

## TL;DR

You're missing **far less foundation than it feels like.** The foundation is ~80% there. The thing
standing between you and a *coherent* system is **one small connective primitive** plus **thin
migration of proven v3 pieces** — not another big `@beep/*` engine.

- **Single highest-ROI fill-in:** a shared **provenance anchor** — `@beep/provenance` (`TextAnchor` /
  `SourceRef`). It turns "every assertion resolves to its exact source span" — your whole thesis —
  from a per-integration chore into a *type*. It's small.
- **Almost everything else is migrate-from-v3, not greenfield** (entity resolution, GraphRAG +
  citation-validation, grounded-answer, embeddings all exist in `@beep/knowledge-server` and are a
  port, per `43` and the `[[beep-v3-knowledge-engine-prior-art]]` memory).
- **The graph and the SHACL gate already exist** (`@beep/nlp/Graph`, `@beep/semantic-web`). Don't
  rebuild them, and don't wait on FalkorDB — it's a *future driver*, not a prerequisite.

The trap your instinct ("I'll build another capability package") sets is rebuilding the v3 KG engine.
v3 + your own memory both say: **migrate the thin slice, don't rebuild.** So the foundation move is:
add **one small `@beep/provenance` primitive**, wire the **thin epistemic boundary** (already a
packet), and spend everything else on the *slice-owned* `IR → law-entity` mapping + the loop.

## 1. What you already have (don't rebuild these)

| Capability | Package(s) | Notes |
|---|---|---|
| Document ingestion | `@beep/file-processing` + drivers `@beep/tika` / `@beep/libpff` | content-addressed `ArtifactId`/`ContentDigest` |
| Span-grounded extraction | `@beep/langextract` | real `LangExtractService`, tested; emits char spans |
| NLP IR + **canonical char span** | `@beep/nlp` → `Handoff/Contract.Span` = `{start,end}` (branded `NonNegativeInt`, half-open) | the one good shared offset type |
| **Typed in-memory graph** | `@beep/nlp/Graph` → `AnnotatedTextGraph`, `EffectGraph`, `GraphOps` | over `effect/Graph.DirectedGraph`; traversals/folds. **This is your projection substrate — you do not need to build "BeepGraph" to turn the loop.** |
| **SHACL validation gate** | `@beep/semantic-web/adapters/shacl-engine` → `ShaclValidationService`, `ShaclValidationViolation` (focusNode/path/severity/message) | bounded (no SPARQL/negation), but a real typed verdict engine |
| RDF / PROV-O substrate | `@beep/rdf` (`Vocab/Prov`), `@beep/semantic-web` (jsonld, prov) | the authority-provenance vocab |
| Epistemic schema | `@beep/epistemic-domain` → `CandidateClaim` / `Evidence` / `Activity` / `UsageRecord` | domain-only (schema, not engine) |
| Sparse retrieval | `@beep/wink` → `WinkVectorizer` (BM25), `WinkSimilarity` | keyword ranking; **no dense embeddings** |
| LLM | `@beep/anthropic` | streaming, forced-tool structured output, repair |

> **Re-frame the "graph" instinct:** `@beep/nlp/Graph` already gives typed nodes/edges/traversal.
> The rung-0 "proven graph + ask" = `nlp/Graph` + a projection function. **FalkorDB is a later
> driver-backed impl of the same shape** (deferred per the office-action plan), not a blocker.

## 2. Gap #1 — the keystone: a shared provenance anchor (`@beep/provenance`)

Your product promise is *"every assertion resolves to the exact source span."* But today there are
**four incompatible "where is this from?" shapes, and nothing bridges them:**

| Package | "where from?" shape | path |
|---|---|---|
| `@beep/nlp` / `@beep/langextract` | `Span = {start,end}` char offsets ✅ + `DocumentId` (string label) | `foundation/capability/nlp/src/Handoff/Contract.ts` |
| `@beep/file-processing` | `ArtifactId = artifact:<sha256>`, `ContentDigest = sha256:<hex>` (content identity) | `foundation/capability/file-processing/src/Artifact/` |
| `@beep/epistemic-domain` `Evidence` | `{artifactFixtureKey, spanFixtureKey}` — **opaque strings, no offsets at all** | `packages/epistemic/domain/src/entities/Evidence/Evidence.model.ts` |
| `@beep/editor` `ArtifactRefNode` | `{__artifactId}` — bare string | `foundation/ui-system/editor/src/artifact-ref-node.tsx` |

A langextract span **cannot flow into an epistemic `Evidence` and then resolve in an editor
hover-card** without bespoke glue at every hop. *That* is the "I struggle to assemble it into a
coherent system" pain — it's a missing **type**, not a missing engine.

**The fill-in (small): one anchor everything references.**

```ts
// WHICH source — content-addressed, stable across copies. (reuse file-processing's id types)
const SourceRef = S.Struct({
  artifactId: ArtifactId,        // artifact:<sha256>
  contentDigest: ContentDigest,  // sha256:<hex> — pins the exact bytes the offsets index into
})

// WHERE in it — reuse nlp's half-open char Span; carry the quote so the anchor is self-verifying
const TextAnchor = S.Struct({
  source: SourceRef,
  span: Span,        // {start, end}
  quote: S.String,   // the exact substring; lets a reader verify the offsets didn't drift
})
```

**Then the stack composes:**
- `@beep/langextract` **emits** `TextAnchor` (it already has the span; add the `SourceRef`).
- `@beep/epistemic-domain` `Evidence` **carries** `TextAnchor` (replace the opaque fixture keys).
- `@beep/editor` `ArtifactRefNode` **resolves** a `TextAnchor` → hover-card.
- `@beep/file-processing` **mints** the `SourceRef` at ingestion.

One type; provenance becomes *compositional* instead of a chore. This is the brick that pays off in
**every rung after** (the more grounding you do, the more it saves).

### Placement (doctrine-checked)

- **`foundation`, not `shared`.** Per `standards/architecture/02-shared-kernel.md` /
  `07-non-slice-families.md`: `shared` = deliberate cross-slice *product* language; `foundation` =
  domain-agnostic substrate. A source-span anchor is domain-agnostic (every grounding system uses it,
  not IP-law-specific) → **foundation**. No shared promotion record needed.
- **`foundation/modeling`, not `foundation/capability`.** It's pure schema value objects (no service,
  no Layer, no engine wrapper) → modeling substrate, a **new `@beep/provenance`** package, peer of
  `@beep/rdf`, `@beep/identity`, `@beep/md`. `foundation/capability` is for runtime services that pass
  the negative gate; this isn't one.
- **Layering note (the one wrinkle):** `Span` lives in `@beep/nlp` and `ArtifactId`/`ContentDigest`
  in `@beep/file-processing` — both **capability** packages. A modeling-layer anchor shouldn't depend
  on capability packages. So when this is built, **promote those id/span primitives down to a modeling
  home** (e.g. `@beep/provenance` owns `SourceRef`/`TextAnchor`/`Span`, or they move to
  `foundation/modeling/identity`), and let `nlp`/`file-processing` consume them — not the reverse.
- When built: a `standards/architecture/GLOSSARY.md` term ("provenance anchor / `TextAnchor`") is
  warranted; no architecture `DECISIONS.md` entry is needed (this is an application of existing
  routing, not a doctrine change).

> **Coordination (act on this):** the graduated `goals/epistemic-claim-lifecycle-gate` packet has an
> "EvidenceSpan char-offsets on `Evidence`" item. **It should consume `@beep/provenance`'s `TextAnchor`,
> not define offsets locally on `Evidence`** — otherwise you re-fragment the very thing this primitive
> exists to unify. Tell that branch.

## 3. Gap #2 — the epistemic boundary as a reusable capability

`@beep/epistemic-domain`'s `ClaimLifecycle` is **`candidate`-only** today
(`LiteralKit(["candidate"])`). The boundary your thesis depends on is net-new but **small and
domain-agnostic** (foundation-level), and mostly *composition over what you already have*:

- the full `ClaimLifecycle` state machine (`candidate → shape_valid → consistency_checked → admitted`)
- a `ClaimGate` — a **thin wrapper over the *existing* `ShaclValidationService`** (CandidateClaim +
  Evidence → SHACL dataset → admission verdict + transition)
- a transition function, and a **projection-as-pure-function** (rebuild the read model from authority;
  bake in the federation invariant: single-owner, local, no central write)

**Good news:** this is **already** the `goals/epistemic-claim-lifecycle-gate` packet — so it's
covered; this doc just confirms it's the right foundation bet and that the gate engine + RDF/PROV
substrate it needs **already exist**. It's a boundary on top, not a new engine.

## 4. Gap #3 — dense embeddings + a grounded "ask" (migrate, don't build)

Today you only have **sparse BM25** (`@beep/wink`). No dense embeddings driver, no vector store
wrapper, no retrieval/"ask" orchestration in v4. But v3 `@beep/knowledge-server` **has the whole
thing, tested**: GraphRAG with **citation-validation + RRF fusion**, **grounded-answer generation**,
cosine embeddings (`43`). For the eventual "ask" rung this is a **thin v3→v4 migration onto pgvector**
(already available via PGlite) — *not* a greenfield engine.

- Name it when you get there: `@beep/embeddings` (provider-neutral, same posture as langextract) +
  a grounded-retrieval capability. **Deferred** to the ask rung; flagged so nobody rebuilds it.

## 5. Gap #4 — a bounded reasoner (the honest "proves")

Your thesis is *"retrieval proposes, logic **proves**."* Today the only runtime logic is SHACL
**shape** validation. The `consistency_checked` lifecycle state ("no contradiction") needs more than
shape — a bounded reasoner. Locally feasible path: **OWL-RL via eye-js / WASM** (per `22`). Until this
exists, "proof" honestly means "shape-valid" — exactly the promise-vs-reality risk `30` flagged.

- Future `@beep/reasoner` **driver** (it wraps an external engine → `drivers`, not foundation).
  **Deferred** to the "prove" rung; name it so the gap is on the record.

## 6. Recommended sequence

1. **Build `@beep/provenance` first** — it's small, and it unblocks compositional provenance across
   langextract → epistemic → editor immediately. Highest ROI per line.
2. **`epistemic-claim-lifecycle-gate` consumes it** — its EvidenceSpan work becomes "carry a
   `TextAnchor`," and the gate/lifecycle/projection compose over the existing SHACL engine.
3. **`law-practice-office-action-spike`** then spends its effort where the *real* net-new is: the
   **slice-owned `IR → law-entity` mapping** (the "least-typed hop" per `30`) + the loop wiring.
4. **Embeddings + reasoner are migrate-from-v3 / deferred** — wire them at the ask + prove rungs, by
   porting v3's proven code, not rebuilding.

## 7. Build / migrate / have ledger

| Capability | Status | Where it goes |
|---|---|---|
| Provenance anchor (`TextAnchor`/`SourceRef`) | **NET-NEW (foundation)** — small, keystone | `@beep/provenance` (`foundation/modeling`) |
| ClaimLifecycle state machine + `ClaimGate` + projection | **NET-NEW (foundation-level)** — composition over HAVE | `epistemic` slice (already a packet) |
| `IR → law-entity` mapping | **NET-NEW (slice)** — the real novelty | `law-practice` use-cases/server |
| Bespoke law schemas (OfficeAction/Claim/Rejection/Distinction) | **NET-NEW (slice)** | `law-practice/domain` |
| In-memory graph / projection substrate | **HAVE** | `@beep/nlp/Graph` |
| SHACL gate engine + RDF/PROV | **HAVE** | `@beep/semantic-web`, `@beep/rdf` |
| Span-grounded extraction + ingestion | **HAVE** | `@beep/langextract`, `@beep/file-processing` + drivers |
| Dense embeddings + grounded "ask" (GraphRAG/citation-validation/RRF) | **MIGRATE-v3** | `@beep/embeddings` + retrieval (onto pgvector) |
| Bounded reasoner (consistency) | **DEFERRED** | `@beep/reasoner` driver (eye-js/WASM) |
| FalkorDB projection store | **DEFERRED** | a driver-backed impl of the `nlp/Graph` projection shape |

## Confidence & Caveats

- **Grounded in:** two read-only recon agents this turn (foundation inventory + requirements/v3-
  migration) cross-read against `00`/`12`/`14`/`16`/`30`/`32`/`43`, and the architecture routing docs
  (`02`/`07`). The fragmentation table (§2) and the "graph/SHACL already exist" claims (§1) are from
  direct file reads (`Handoff/Contract.ts`, `Artifact/`, `Evidence.model.ts`, `shacl-engine.ts`,
  `artifact-ref-node.tsx`, `nlp/Graph/`).
- **Re-verify at build time:** the exact current homes of `Span` (`@beep/nlp`) and
  `ArtifactId`/`ContentDigest` (`@beep/file-processing`) and whether to promote-down vs re-own in
  `@beep/provenance` — that layering decision should be confirmed against the live tree when the
  package is created (it may have shifted since 2026-06-17).
- **Scope:** this is a recommendation, not a build, and deliberately does **not** scaffold a goal
  packet (that's the goal-packet branch's lane). The one cross-branch action item is the coordination
  note in §2 (epistemic EvidenceSpan should consume the shared anchor).
- **Opinion, stated plainly:** if you build exactly one foundation thing next, build `@beep/provenance`.
  Everything else is either already there, slice-owned, or a v3 port.
