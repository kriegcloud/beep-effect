# Phase 2 — External grounding: law_stuff + ontology (20)

Corpora: `~/YeeBois/research/law_stuff` and `~/YeeBois/research/ontology_research`.
Cited by reference (public third-party repos; nothing pasted into the tree
beyond tiny generic shape illustrations). The standout source is
`law_stuff/repos/GOLD_SYNTHESIS.md` (2,515 lines, generated 2026-06-29) — a
**same-day, beep-specific synthesis** that mines 27 *independent* legal/patent
repos against beep's exact state. It is NOT an independent observer of beep's gaps
(it was written for beep); its value is that it reaches the same conclusions as
this initiative from the independent upstream repos, and supplies concrete
vocabularies + modeling shapes.

## A. Convergent corroboration of Phase-1, via independent repos (the audit holds)

| Phase-1 finding | GOLD_SYNTHESIS corroboration |
|---|---|
| P1 `*FixtureKey:String` | "Real IP attributes … current state: **placeholder fixtureKey strings, single-literal enums**" (gap map) |
| P3 placeholder literals | "seed the placeholder vocabularies in the law-practice spike with real controlled taxonomies" |
| `RejectionGround` exemplary | "101/102/103/112 rejection vocabulary — **Dup** … the rest of the IP model is the gap" |
| N4 lifecycle thinness | "Extend lifecycle (**rejected/superseded**), don't reinvent gating" |
| P9/P10 temporal+events | "Bitemporal lineage / version-source / conflict edges on claims — forward-only lifecycle, no persisted Evidence/Activity" |

## B. Adopted modeling decisions (→ `DECISIONS.md`), each grounded

| ID | Decision | Grounds | Source (by reference) |
|---|---|---|---|
| **G1** | **Bitemporal, never-overwrite claim/fact edges** — carry `tvalid`/`tvalidEnd` (real-world validity), `version`/`supersededBy`/`isLatest` (assertion history), `sourceObservationIds`; NEVER overwrite, always version | R3, P9, P10, N4 | `agentmemory/src/types.ts:411-435` (GraphEdge) |
| **G2** | **Typed version-lineage `source` enum** separating machine-proposed from human-confirmed (`upload`/`assistant_edit`/`user_accept`/`user_reject`/`generated`) + soft-delete | N4, N5, P6 | `mike/backend/schema.sql:244-253` (`document_versions`) |
| **G3** | **Verbatim span verifier** as the shared cross-field refinement idiom — normalized→raw offset map, VERIFIED-with-location or NOT-FOUND, never near-match (closes the self-documented `TextAnchor` gap) | P8, kernel R7 | `doc-haus/.../verify-quote.ts:37-56` |
| **G4** | **Confidence + derivation-`source` enum on candidate records** (`heuristic`/`llm`/`manual`/`consistency_analysis`) — claims/evidence record *how derived*, not just confidence | N8, P2, E4 | `harvest-mcp/src/types/index.ts:187-242`; agentmemory per-fact confidence |
| **G5** | **Authority/quality grading on cited sources** — `authority_level` (high/med/low), `is_primary_source`, `recency`, `quality_score` | law `PriorArtReference`, Evidence | `research-squad/baml_src/types.baml:100-117` |
| **G6** | **Claim/prosecution version lineage** — `Claim`/`PatentAsset` carry a dated amendment chain (original/intermediate/final + amendment count) instead of a flat stub | P1, P9, law-practice L9 | `uspto_pfw_mcp/.../package_manager.py:361-425` (get_claim_evolution) |
| **G7** | **Court/jurisdiction SKOS taxonomy** (federal/state/tribal/territory/military) + **CPC classification** (section/class maps; IPC alignment is a later add — the cited file has CPC only) + **court→reporter crosswalk** as real vocabularies for `MatterType`/jurisdiction/classification | P3, N3 | `courtlistener/cl/search/models.py:1872-1937`; `courts-db`; `patents-mcp-server/.../utility.tools.ts:48-100` |
| **G8** | **Patent identifier + bibliographic VOs** (application/publication/patent number, filing/grant/publication dates, assignee, inventor, CPC) — ground L2/PatentAsset fields | P3, law L2 | `uspto-patents-mcp/src/patentsview.ts`; `mcp-uspto/.../patentsview-search.ts` |
| **G9** | **Temporal-validity as-of filtering** with open-interval sentinels + strict/loose mode — the `TemporalValidity` VO design (R3) | R3, P9 | `courts-db/courts_db/__init__.py:150-167` |
| **G10** | **Content-addressable hashing with metadata normalization** (blank volatile metadata before hashing for idempotent dedup) — wires the unused `Sha256` primitive | P8, kernel R6 | `doctor/doctor/lib/utils.py:265-278` |

## C. The N8 claim-body question — ontology grounding

The product's core primitive (currently `snapshot: UnknownRecord`) should become a
typed assertion. Grounding:
- **SPO triple shape is validated**: the patent KG models facts as
  subject–predicate–object triples (`patent → title/publication-date/classification/
  inventor/assignee → value`), `ontology_research/IP_ONTOLOGY_AI_RESEARCH/..._spo.spo`.
- **Claim-as-edge with confidence/validity/supersession** (G1/G4) is the
  agentmemory model — a claim is a typed, confidence-bearing, versioned assertion
  linking subjects, not an opaque blob.
- **Upper-ontology alignment targets present for a later grounding pass**: FOLIO
  (`ontology_research/legal_ontologies/openlegalstandards_folio/FOLIO` + `folio-mcp`/
  `folio-mapper`), LKIF Core (`The LKIF Core Ontology of Basic Legal Concepts.pdf`),
  LegalRuleML, and an **Effect-native ontology repo** (`ontology_research/ontology_repos/
  effect-ontology`) — reusable patterns for ontology-in-Effect and BFO/PROV-O alignment.

**Recommendation (N8):** model `Claim` as a typed assertion VO that is
**SPO-capable** (subject ref + predicate + object: literal | entity-ref | value)
carrying `confidence` + derivation-`source` (G4) + lifecycle + supersession (G1).
Defer deep FOLIO/PROV-O TBox alignment to the `ip-law-knowledge-graph` packet;
this pass establishes the *typed-body* shape, not the full ontology.

## D. Rejected / deferred (with WHY)
- **Full FalkorDB graph projection / GraphRAG / RRF retrieval** — real and well-sourced,
  but it is *projection/retrieval infrastructure*, not domain-layer modeling; out of
  scope (belongs to `ip-law-knowledge-graph`). Cited for traceability only.
- **Driver/ingestion patterns** (CourtListener auth, Lucene escaping, rate limiters,
  OCR gating, Orval codegen) — out of scope (drivers, not domain). The GOLD_SYNTHESIS
  already routes these to `goals/`/driver packets.
- **Four-tier agent-memory storage tiering** — adopt the *edge/lineage shape* (G1), not
  the KV storage tiers (a persistence concern, not domain language).

## E. Still-pending corpora (next paced pass)
`digital_signature_stuff/repos` (N6 attestation), `dms_stuff/repos` (document/version
modeling — partly pre-covered by doc-haus/mike above), `meeting_notes_ai` (capture/turn
provenance), `oppold-corpus` (real-world validation — **abstract shapes only; no client
specifics into this public tree**).
