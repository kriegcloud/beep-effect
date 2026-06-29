# bitemporal-versioned-edge-modeling

> Scope: external prior art (Graphiti/Zep, agentmemory, courts-db, SQL:2011/Snodgrass, Fowler) for bitemporal, never-overwrite, versioned KG edges, and how to model them in Effect-Schema (LiteralKit/Model.Class) over the existing `@beep/semantic-web` PROV-O + `@beep/provenance` TextAnchor substrate, including the as-of read path.

## Findings

### Canonical bitemporal theory (the vocabulary to standardize on)

- **Two orthogonal time axes are the standard.** *Valid time* = the period a fact is true in the real world; *transaction time* = the period the fact is stored/known in the database. The terminology was coined by Richard T. Snodgrass and his student Ilsoo Ahn (1986) and is the basis of SQL:2011. — https://en.wikipedia.org/wiki/Transaction_time , https://grokipedia.com/page/Bitemporal_modeling
- **SQL:2011 names the constructs we should mirror:** "application-time period tables" (valid-time), "system-versioned tables" (transaction-time), and "system-versioned application-time period tables" (bitemporal). Implemented in DB2, Oracle, MariaDB. — https://www.researchgate.net/publication/261845780_Temporal_features_in_SQL2011 , https://en.wikipedia.org/wiki/Transaction_time
- **Never-overwrite = append-only record history.** Fowler (canonical reference): "Record history itself *is* append only. We don't change what we thought we knew… We just append the later knowledge we gained." This is exactly the "NEVER overwrite — always version" rule the gold-intake nuggets demand. — https://martinfowler.com/articles/bitemporal-history.html
- **As-of read takes two parameters, one per axis.** Fowler's point-in-time accessor is `sally.salaryAt('2021-02-25', '2021-03-25')` (valid-date, record-date): filter to records whose validity window contains the queried valid date, evaluated from the specified record-time perspective. The repo as-of read must accept (asOfValid, asOfKnown?) not a single date. — https://martinfowler.com/articles/bitemporal-history.html

### Graphiti / Zep (primary: arxiv paper + live `edges.py` source)

- **Graphiti stores all four bitemporal points on the entity edge.** Verbatim from `graphiti_core/edges.py` `EntityEdge`: `valid_at: datetime | None` ("when the fact became true"), `invalid_at: datetime | None` ("when the fact stopped being true"), `expired_at: datetime | None` ("when the node was invalidated"), plus inherited `created_at: datetime`. Also `name` (relation name), `fact: str`, `fact_embedding: list[float] | None`, `episodes: list[str]` (episode ids that reference the edge), `reference_time: datetime | None` (timestamp from the producing episode), `attributes: dict[str, Any]`, `group_id` (graph partition), `source_node_uuid`, `target_node_uuid`, `uuid`. — https://raw.githubusercontent.com/getzep/graphiti/main/graphiti_core/edges.py
- **Paper's formal model maps onto two timelines.** Zep paper: timeline **T** (valid time: `t_valid`, `t_invalid`) "track the temporal range during which facts held true"; timeline **T′** (transaction time: `t'_created`, `t'_expired`) "monitor when facts are created or invalidated in the system." T′ serves "traditional database auditing"; T adds the real-world dimension. — https://arxiv.org/html/2501.13956v1 (field-name skin `valid_at/invalid_at/created_at/expired_at` confirmed by the source file above; paper uses the `t_*` math notation — same four points, two names).
- **Invalidation is by closing the valid-time window, never deletion.** "When contradictions are detected, it invalidates the affected edges by setting their `t_invalid` to the `t_valid` of the invalidating edge." A subscription change closes `valid_at/invalid_at` on the old edge and opens a new edge — "preserving a queryable history." — https://arxiv.org/html/2501.13956v1 , https://www.getzep.com/ai-agents/temporal-knowledge-graph/
- **GOTCHA (verified, load-bearing):** Graphiti sets the superseded edge's `invalid_at` to the *valid_at of the invalidating edge* — i.e. it closes the **valid-time** axis at the moment the new fact became true, NOT at ingestion time. `expired_at` (transaction axis) is what moves to "now." A naive supersede pass that stamps `invalid_at = now()` is wrong and corrupts as-of-valid queries. — https://arxiv.org/html/2501.13956v1
- **Edge taxonomy:** episodic edges (ℰ_e) connect episodes → entities (provenance); semantic/entity edges (ℰ_s) are extracted entity-entity relations and carry the temporal fields. Episodic edges in the source carry no temporal fields of their own. — https://arxiv.org/html/2501.13956v1 , https://raw.githubusercontent.com/getzep/graphiti/main/graphiti_core/edges.py
- **Current state:** Graphiti **v0.29.2** (2026-06-08), **Apache-2.0** — permissive, portable with attribution (algorithm/shape reuse, not a Python dependency). — https://github.com/getzep/graphiti

### agentmemory `GraphEdge` (primary: live `src/types.ts`)

- **Full verbatim interface** (the closest existing match to the target shape):
  ```ts
  export interface GraphEdge {
    id: string;
    type: GraphEdgeType;
    sourceNodeId: string;
    targetNodeId: string;
    weight: number;
    sourceObservationIds: string[];
    createdAt: string;
    tcommit?: string;     // transaction time
    tvalid?: string;      // valid-time start
    tvalidEnd?: string;   // valid-time end
    context?: EdgeContext;
    version?: number;
    supersededBy?: string; // id of the edge that replaced this one
    isLatest?: boolean;    // current-row denormalization
    stale?: boolean;
  }
  ```
  — https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/types.ts
- **`EdgeContext` carries the explainable-extraction metadata:** `{ reasoning?; sentiment?; alternatives?; situationalFactors?; confidence? }`. `confidence` here maps onto the repo's existing `UnitInterval`/epistemic `Confidence`. — https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/types.ts
- **`GraphEdgeType` is a closed literal union** (uses/imports/modifies/causes/fixes/depends_on/related_to/works_at/prefers/blocked_by/caused_by/optimizes_for/rejected/avoids/located_in/**succeeded_by**) — a LiteralKit candidate; note `succeeded_by`/`rejected` already bake supersession/lifecycle into the relation vocabulary. — https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/types.ts
- **agentmemory is genuinely bitemporal** (has BOTH `tcommit` and `tvalid/tvalidEnd`), unlike single-axis stores; `ConsolidationTier = "working"|"episodic"|"semantic"|"procedural"` and `SemanticMemory { id; fact; confidence; sourceSessionIds; sourceMemoryIds; accessCount; lastAccessedAt; strength; createdAt; updatedAt }`. — https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/types.ts
- **Supersession pattern stated explicitly:** "Evolution = mark old `isLatest=false`, write a new row pointing at it via `supersedes`/`parentId`"; "agentmemory uses supersession with `is_latest=false` instead of delete." — https://github.com/akitaonrails/ai-memory/blob/main/docs/research-agentmemory.md
- **GOTCHA / DO-NOT-COPY (second-source critique):** the temporal layer is underimplemented — stored as JSON blobs in KV, so "every time-based query requires a full table scan." Port the *shape*, back it with indexed relational/temporal columns (repo drizzle tables), not KV blobs. — https://github.com/akitaonrails/ai-memory/blob/main/docs/research-agentmemory.md
- **License:** Apache-2.0 (per gold-intake CAPTURE `cautions`) — port with attribution; it is plain TS + Zod v4, so DI/Layer patterns do NOT transfer — reimplement in Effect-Schema, reuse only shapes/algorithms. — `explorations/agent-memory-tiers-bitemporal-edges/CAPTURE.md`

### As-of read path — courts-db date-window filter (primary: live `__init__.py`)

- **The inclusive-range filter to port:** `filter_courts_by_date` keeps a record when `if date_start <= date_found <= date_end`. — https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/__init__.py
- **Open-ended handling via `strict_dates`:** non-strict (default) substitutes sentinels `date_start="1600-01-01"`, `date_end="2100-01-01"` when null; strict mode `continue`s (drops) records with a null start but still allows an open `2100-01-01` end. This is the null/open-interval policy for as-of reads. — https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/__init__.py
- **License:** **BSD-2-Clause** (permissive). `find_court(..., date_found=, bankruptcy=)` disambiguates non-unique names by active period — the same move as picking the operative edge version at an as-of date. — https://github.com/freelawproject/courts-db
- **RECOMMENDATION (design decision):** port the *inclusive-range comparison* but prefer Effect-Schema `Option`/nullable `validTo` with explicit open-interval semantics over magic sentinel dates; sentinels (1600/2100) are a pragmatic SQL-string hack, not a modeling primitive. Two-axis as-of read = courts-db's single comparison applied independently on valid-time AND transaction-time (Fowler's two-param query).

### mike — version-lineage source enum (disambiguation + license)

- **Disambiguation:** the `mike` in the gold-intake corpus is a private document-editing app (`backend/schema.sql`, `document_versions`/`document_edits` tables, **AGPL-3.0**), NOT the public `jimporter/mike` MkDocs version tool (web search only surfaces the latter — it is unrelated). — https://github.com/jimporter/mike (the unrelated public project) ; corpus snippet in `explorations/agent-memory-tiers-bitemporal-edges/CAPTURE.md`
- **The reusable idea (clean-room only, AGPL-3.0):** a provenance/authorship *source enum* on each persisted version distinguishing machine-proposed vs human-confirmed: `document_versions_source_check in (upload, user_upload, assistant_edit, user_accept, user_reject, generated)`, with `unique (document_id, version_number)`; and a candidate→accept/reject gate `document_edits(status check in (pending, accepted, rejected), resolved_at, context_before/after)`. — `explorations/agent-memory-tiers-bitemporal-edges/CAPTURE.md` (nuggets mike#4, mike#6)

### In-repo substrate to build over (grounded in source)

- **`TextAnchorFields` spread idiom** is the template for composable provenance fields: `EvidenceSpan` does `{ ...TextAnchorFields, confidence: Confidence }`. A `BitemporalFields` spread (validFrom/validTo + recordedAt/expiredAt) should follow the same pattern so any edge can mix it in. — `packages/foundation/modeling/provenance/src/TextAnchor.ts`, `packages/epistemic/domain/src/values/EvidenceSpan/EvidenceSpan.model.ts`
- **LiteralKit is the enum idiom** (`.Enum`, `.Options` canonical order, `.is`, `.Type`): `ClaimLifecycle = LiteralKit(["candidate","shape_valid","consistency_checked","admitted"])`. Use LiteralKit for the edge-relation-type vocabulary, the never-overwrite lifecycle (`active`/`superseded`/`invalidated`/`rejected`), and the authorship source enum. — `packages/shared/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts`
- **`BaseEntity.Class` + `EntitySchema.persist.*`** is the persisted-entity idiom: `Evidence` declares `fields` + `persisted` with `persist.jsonb({columnName})` for fractional/structured columns (used for `span`) and `persist.text({...})`. The versioned edge entity should use `persist.jsonb` for `EdgeContext` and `sourceObservationIds`, and timestamp columns for the four temporal fields. — `packages/epistemic/domain/src/entities/Evidence/Evidence.model.ts`
- **PROV-O lives in `@beep/semantic-web/prov`** with `ObjectRef` (IRI/CURIE/local) and the public `ProvDateTime` / `ProvDateTimeEncoded` schemas (ISO-8601 + Effect `DateTime.make` parseable; lines 120/165). **Correction (2026-06-29 Codex gate-1):** there is NO exported `ProvDateTimeChecks` — `provDateTimeChecks` is a *private* `S.makeFilterGroup` const (line 38), so the four bitemporal timestamps should reuse the exported `ProvDateTime`, or a deliberate public export of the checks group must be added first. The supersession chain should be projected to PROV: a versioned edge = `prov:Entity`, `supersededBy` ⇒ `prov:wasRevisionOf`, `sourceObservationIds` ⇒ `prov:wasDerivedFrom`, the extraction = `prov:Activity`. This is where beep's substrate is *richer* than agentmemory's flat KV. — `packages/foundation/capability/semantic-web/src/prov.ts`

### Recommended field-name reconciliation (decision input)

| Concept | SQL:2011 / Fowler | Graphiti | agentmemory | Recommended (beep) |
|---|---|---|---|---|
| valid-time start | application-time PERIOD start / "actual" | `valid_at` | `tvalid` | `validFrom` |
| valid-time end | application-time PERIOD end | `invalid_at` | `tvalidEnd` | `validTo` (Option, open) |
| txn-time start | system_time start / "record" | `created_at` | `tcommit`/`createdAt` | `recordedAt` |
| txn-time end | system_time end | `expired_at` | (implicit via `isLatest`) | `expiredAt` (Option, open) |
| version pointer | — | (new edge) | `version`/`supersededBy`/`isLatest` | `version`/`supersededBy`/`isLatest` |
| provenance refs | — | `episodes` | `sourceObservationIds` | `sourceObservationIds` (→ PROV `wasDerivedFrom`) |
| extraction ctx | — | `attributes` | `EdgeContext` | `EdgeContext` value class (confidence = `UnitInterval`) |

## Sources

- Zep paper (PRIMARY, bitemporal model): https://arxiv.org/html/2501.13956v1 , https://arxiv.org/abs/2501.13956
- Graphiti `edges.py` (PRIMARY, verbatim fields): https://raw.githubusercontent.com/getzep/graphiti/main/graphiti_core/edges.py
- Graphiti repo (version v0.29.2 2026-06-08, Apache-2.0): https://github.com/getzep/graphiti
- Zep temporal-KG definition: https://www.getzep.com/ai-agents/temporal-knowledge-graph/
- Neo4j Graphiti blog (secondary): https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/
- agentmemory `src/types.ts` (PRIMARY, verbatim GraphEdge): https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/types.ts
- akitaonrails ai-memory research-agentmemory.md (secondary critique): https://github.com/akitaonrails/ai-memory/blob/main/docs/research-agentmemory.md
- courts-db `__init__.py` (PRIMARY, as-of filter): https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/__init__.py
- courts-db repo (BSD-2-Clause): https://github.com/freelawproject/courts-db
- Fowler, Bitemporal History (canonical append-only + as-of): https://martinfowler.com/articles/bitemporal-history.html
- Transaction time / Snodgrass / SQL:2011: https://en.wikipedia.org/wiki/Transaction_time
- SQL:2011 temporal features: https://www.researchgate.net/publication/261845780_Temporal_features_in_SQL2011
- Bitemporal modeling overview: https://grokipedia.com/page/Bitemporal_modeling
- In-repo substrate: `packages/foundation/modeling/provenance/src/TextAnchor.ts`, `packages/epistemic/domain/src/values/EvidenceSpan/EvidenceSpan.model.ts`, `packages/shared/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts`, `packages/epistemic/domain/src/entities/Evidence/Evidence.model.ts`, `packages/foundation/capability/semantic-web/src/prov.ts`
- Gold-intake corpus (mike, doc-haus, courtlistener nuggets + licenses): `explorations/agent-memory-tiers-bitemporal-edges/CAPTURE.md`

## Open / Unverified

- **agentmemory exact license + version UNVERIFIED from primary:** CAPTURE asserts Apache-2.0; I did not open `rohitg00/agentmemory/LICENSE` directly this pass. The akitaonrails critique implies a ~v0.9 / underimplemented temporal layer but gives no pinned version. Confirm LICENSE file + latest release tag before porting.
- **Zep paper `t_*` notation vs source `*_at` field names:** I bridged the paper's `t_valid/t_invalid/t'_created/t'_expired` to the source file's `valid_at/invalid_at/created_at/expired_at`. The mapping is strongly implied (same four points) but the paper does not print the code field names; treat the 1:1 mapping as inferred, not quoted.
- **Graphiti `reference_time` vs `created_at` semantics:** source comments distinguish `reference_time` ("from the episode that produced this edge") from `created_at` (ingest). Whether `reference_time` or `created_at` is Graphiti's canonical transaction-time start was not pinned to a single authoritative line — verify against the ingestion code path if exact reproduction matters.
- **mike corpus source not web-reachable:** `document_versions`/`document_edits` schema comes only from the gold-intake CAPTURE snippet (private corpus, AGPL-3.0). Cannot adversarially second-source the verbatim SQL; treat as single-source and clean-room only.
- **courts-db sentinel exactness:** WebFetch reported `1600-01-01`/`2100-01-01` and the `strict_dates` branch behavior; confirmed against the raw `__init__.py` summary but exact line numbers (CAPTURE cites 150-167) not line-verified this pass.
- **RRF/FalkorDB projection deliberately out of scope** here (owned by `rag-retrieval-projection` / `goals/trustgraph-port`) — the edge-storage as-of read must not also implement retrieval fusion.
