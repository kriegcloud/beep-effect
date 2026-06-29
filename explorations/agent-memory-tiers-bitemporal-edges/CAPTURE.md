# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-29 — Gold-intake seed

Source synthesis: [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../_gold-intake/GOLD_SYNTHESIS.md)
— see Executive summary → "Top ~12 highest-ROI items" **item 8** ("Four-tier
agent-memory schema with per-fact confidence + conflict/contradiction edges"),
plus the detail sections "Bitemporal, never-overwrite provenance edges",
"Version lineage with authorship/provenance source enum", "Triple-stream hybrid
retrieval (BM25 + vector + graph) fused via RRF", "Amendment-chain resolution +
transitive lineage", and "Temporal-validity filtering of facts by as-of date".

Routing record: [`explorations/_gold-intake/routing.json`](../_gold-intake/routing.json)
(`jq '.clusters[] | select(.cluster=="Four-tier agent-memory schema w/ confidence + conflict edges")'`).

### Cluster rationale

GOLD_SYNTHESIS item 8 plus the bitemporal/RRF table rows route this cluster to
"extend CandidateClaim/ClaimLifecycle + borrow doc-haus redline-gate semantics,"
but the natural extension home (`goals/epistemic-claim-lifecycle-gate`) is
`lifecycle:completed-retained` and explicitly DEFERRED the bitemporal store,
FalkorDB/GraphRAG, and rejected/superseded states — so these cannot be an
in-place extend-goal. `rg` confirms per-fact confidence + the semantic tier
already exist, but `ConsolidationTier`/accessCount/strength/RRF/bitemporal edges
have zero presence in packages. The coherent net-new capability (tier schema +
decay + conflict edges + never-overwrite bitemporal edges + RRF retrieval) needs
a fresh wedge packet that graduates into a NEW goal extending the epistemic
slice, with `standards/memory-architecture` as the governing taxonomy and
`goals/trustgraph-port` as the FalkorDB/GraphRAG retrieval home.

route=`new-exploration` · primaryTarget=`agent-memory-tiers-bitemporal-edges` (targetExists=false) · wave=`P2` (histogram P1:5 / P2:7 / P3:3) · themeSpan=[agent-memory, governance-ops, kg-ontology-reasoning, legal-nlp, provenance-evidence] · secondaryTargets=[`goals/epistemic-claim-lifecycle-gate`, `standards/memory-architecture`, `goals/agentic-professional-runtime`, `goals/trustgraph-port`, `explorations/_gold-intake`]

### Nuggets (15)

- **agentmemory#2** (agentmemory) — Bitemporal, versioned knowledge-graph edges with provenance and never-overwrite semantics. `src/types.ts:411-435`. → feeds netNew "Bitemporal versioned claim/fact edges (tvalid/tvalidEnd, version/supersededBy/isLatest, sourceObservationIds, EdgeContext) with NEVER-overwrite/always-version semantics" (the gate's explicitly-deferred edge store). Snippet: `GraphEdge { tvalid/tvalidEnd; version/supersededBy/isLatest; sourceObservationIds[]; context?: EdgeContext; stale? }` [P1, adopt]
- **agentmemory#3** (agentmemory) — XML-schema LLM extraction prompt + regex parser for entities/relations with temporal + context metadata. `src/functions/temporal-graph.ts:14-46`. → feeds the candidate-claim extraction prompt SHAPE (weights 1.0 explicit / 0.5 inferred / 0.1 speculative) for the bitemporal-edge build; reuse prompt shape ONLY, NOT the brittle `parseTemporalGraphXml` regex (no char-span grounding). Snippet: `TEMPORAL_EXTRACTION_SYSTEM` → `<relationship type source target weight valid_from valid_to><reasoning><sentiment>`; "NEVER overwrite — always create new versioned edges". [P3, study]
- **agentmemory#5** (agentmemory) — Memory retention scoring: salience x exponential temporal decay + reinforcement boost, with hot/warm/cold/evictable tiers. `src/functions/retention.ts:81-95`. → feeds netNew "accessCount/strength/sourceMemoryIds + retention/decay scoring (salience x exp temporal decay + reinforcement, hot/warm/cold/evictable tiers)". Snippet: `computeRetention = min(1, salience * exp(-lambda*deltaT) + reinforcementBoost)`; tier thresholds + evict pass with dryRun + audit. [P2, port]
- **agentmemory#6** (agentmemory) — Four-tier memory model (working/episodic/semantic/procedural) with confidence + provenance per fact. `src/types.ts:494-527`. → feeds netNew "Explicit four-tier consolidation taxonomy enum (ConsolidationTier)"; semantic-tier `fact + confidence + sources` shape maps onto CandidateClaim/Evidence (alreadyCovered). Snippet: `ConsolidationTier = "working" | "episodic" | "semantic" | "procedural"`; `SemanticMemory { fact; confidence; sourceSessionIds/sourceMemoryIds; accessCount; strength }`. [P1, adopt]
- **agentmemory#7** (agentmemory) — Heuristic confidence scoring for typed memory relations (supersedes/contradicts/extends/derives/related). `src/functions/relations.ts:10-37`. → feeds netNew "Conflict/contradiction edges + per-anchor supersede pass" — an explainable contradiction/ranking signal before the human gate. Snippet: `computeConfidence` base 0.5 + sharedSessions*0.1 (cap .3) + recency; `supersedes +0.1`, `contradicts -0.05`; clamp [0,1]. [P2, port]
- **courtlistener#9** (courtlistener) — Additive bitmask provenance for multi-source records (DocketSources). `cl/search/docket_sources.py:10-47`. → reference for a compact queryable provenance-of-origin fast-filter index over `sourceObservationIds`/`sourceMemoryIds` (beep's typed PROV-O graph is richer). Snippet: bitmask RECAP=1, SCRAPER=2, COLUMBIA=4, IDB=8, HARVARD=16, ... all 0-255 pre-enumerated. [P3, reference]
- **courts-db#4** (courts-db) — Temporal validity filtering of courts by date_found. `courts_db/__init__.py:150-167`. → feeds the bitemporal as-of read path: keep edges/facts whose [tvalid, tvalidEnd] contains the as-of date, with strict_dates null/open-ended handling (1600-01-01 .. 2100-01-01 sentinels). Snippet: `if date_start <= date_found <= date_end: append`. [P2, adopt]
- **doc-haus#10** (doc-haus) — Amendment-chain resolution + transitive chain building from extracted relations. `dochaus/tool/amendment-chain.ts:42-65`. → feeds supersede-lineage resolution: resolve `amends` targets by token-subset/defined-term match, exclude the amender itself, report resolved/ambiguous/unmatched honestly, flatten transitively with a cycle guard, surface the operative version. Refuses to fabricate edges. Snippet: `resolveTarget → { kind: "resolved" | "ambiguous" | "unmatched" }`. [P2, study]
- **doc-haus#7** (doc-haus) — Candidate→approved redline gate: pending proposal queue, ctx.ask permission, conflict/supersede logic. `dochaus/lib/redlines.ts:86-108`. → feeds netNew "Conflict/contradiction edges + per-anchor supersede pass before admission (doc-haus redline-gate semantics)"; working impl of candidate→approved gate states. Snippet: `conflictingRedlines` = same `anchor_id` AND (clause scope OR overlapping find-text substring); only newest edit per paragraph stays pending, rest "superseded". [P1, study]
- **harvest-mcp#2** (harvest-mcp) — Parameter classification taxonomy: dynamic / sessionConstant / staticConstant / userInput / optional with confidence + provenance source. `src/types/index.ts:187-242`. → analog of CandidateClaim shape (fallible proposal + confidence + how-derived provenance + manual override); informs the per-fact `source` enum on consolidated memory. Snippet: `ClassifiedParameter { classification; confidence; source: "heuristic"|"llm"|"manual"|"consistency_analysis"; metadata{...} }`. UNKNOWN license → reimplement, do not copy. [P2, adopt]
- **mike#4** (mike) — Candidate edit → human accept/reject gate (document_edits table). `backend/schema.sql:284-304`. → feeds netNew "rejected + superseded ClaimLifecycle STATES"; relational template for pending→accepted/rejected with source-span anchors. Snippet: `document_edits ( change_id, deleted_text, inserted_text, context_before/after, status check in (pending,accepted,rejected), resolved_at )`. AGPL-3.0 → clean-room. [P1, study]
- **mike#6** (mike) — Version lineage with authorship/provenance source enum. `backend/schema.sql:244-253`. → feeds netNew bitemporal-edge provenance: distinguishes machine-proposed vs human-confirmed in persisted lineage. Snippet: `document_versions_source_check in (upload, user_upload, assistant_edit, user_accept, user_reject, generated)`; unique (document_id, version_number). AGPL-3.0 → clean-room. [P1, port]
- **research-squad#10** (research-squad) — Agent-memory compression / snapshot / restore prompt suite. `baml_src/agents/memory_manager.baml:437-485`. → feeds the working-tier context-management design: progressive context reduction + snapshot persistence + recovery for long-running matters (compress near the 200k-token limit). Snippet: `UtilitySaveResearchContext → MemorySnapshot{ query, strategy, key findings, remaining tasks, constraints, completion % }`; companion `UtilityRestoreFromMemorySnapshot`. [P2, study]
- **research-squad#8** (research-squad) — Source quality / authority evidence schema. `baml_src/types.baml:100-117`. → feeds per-fact confidence + authority weighting on semantic-tier sources (which agent/extractor proposed; primary-source preference maps to legal-authority weighting). Snippet: `Source { quality_score 1-10; source_type; recency current|recent|dated|outdated; authority_level high|medium|low; is_primary_source; potential_issues[]; found_by_agent }`. [P2, adopt]
- **screenpipe#3** (screenpipe) — Namespaced tag linking model across heterogeneous content types. `packages/screenpipe-mcp/src/index.ts:330-340`. → reference for cross-tier/cross-slice linking: a uniform namespaced-tag (`person:`/`project:`/`topic:`) join across distinct stores + `include_related` one-call context expansion. Snippet: comma-separated tags returning items with ALL of them; co-occurring tags ranked by frequency. LicenseRef-Screenpipe-Commercial (most restrictive) → reference shapes only, reimplement. [P3, reference]

### netNew (build list)

1. Explicit four-tier consolidation taxonomy enum (working/episodic/semantic/procedural) — agentmemory `ConsolidationTier`; nothing in packages (`rg` found zero hits).
2. accessCount/strength/sourceMemoryIds + retention/decay scoring (salience x exp temporal decay + reinforcement, hot/warm/cold/evictable tiers) — no working-memory/decay tier exists.
3. rejected + superseded ClaimLifecycle STATES (today "rejected" is only a ClaimGate verdict; ClaimLifecycle is forward-only candidate→shape_valid→consistency_checked→admitted).
4. Conflict/contradiction edges + per-anchor supersede pass before admission (doc-haus redline-gate semantics) — no conflict detection exists.
5. Bitemporal versioned claim/fact edges (tvalid/tvalidEnd, version/supersededBy/isLatest, sourceObservationIds, EdgeContext) with NEVER-overwrite/always-version semantics — explicitly DEFERRED by the completed epistemic gate; no persisted edge store.
6. Triple-stream BM25+vector+graph retrieval fused via RRF (k=60) with weight renormalization — planned FalkorDB/GraphRAG projection, not built.

### alreadyCovered (reuse, do not rebuild)

- Per-fact confidence: Evidence/EvidenceSpan carry `Confidence = UnitInterval` (`packages/epistemic/domain/src/values/EvidenceSpan/EvidenceSpan.model.ts`) + startChar/endChar/quote char-span grounding.
- Semantic tier itself: CandidateClaim + Evidence + ClaimLifecycle + SHACL-backed ClaimGate built and shipped (`epistemic-claim-lifecycle-gate` is completed-retained; 11 tests green).
- Provenance substrate: `@beep/semantic-web` PROV-O + bounded SHACL + `@beep/provenance` TextAnchor (the never-overwrite edge's provenance fields align here).
- The four-LAYER memory taxonomy is already a binding decision record in `standards/memory-architecture/01-memory-layer-taxonomy.md` (conceptual, not implemented).

### cautions

- Licensing: agentmemory is Apache-2.0 (permissive — port with attribution), but it is plain TS + Zod v4 + the bespoke iii-sdk, NOT Effect/effect-Schema, so DI/Layer/service patterns do NOT transfer — reimplement data models in Effect-Schema (LiteralKit/Model.Class), reuse only the algorithms/shapes. Do NOT copy the XML-tag extraction prompt's regex parser (`parseTemporalGraphXml`) — it is brittle and lacks beep's required char-span grounding; reuse the prompt SHAPE only and add span grounding (or use BAML/Standard-Schema structured output). RRF: validate k=60 default (Cormack 2009; k in [40,80] comparable), fuse on rank only, do not score-normalize across streams. The RRF/FalkorDB-projection sub-capability overlaps GOLD_SYNTHESIS item 9 and `goals/trustgraph-port` — coordinate to avoid building two retrieval layers. PatentsView/USPTO-ODP deprecations appear in the agentmemory web-enrichment but are out of scope for this memory cluster. Keep zero IP-law vocabulary in the epistemic/memory slice (federation + no-vocabulary invariants from the completed gate).
- License: screenpipe#3 is from screenpipe (LicenseRef-Screenpipe-Commercial — the most restrictive source in the corpus) → reference patterns/shapes only, reimplement in Effect-Schema; mike#6 (version-lineage/provenance enum, rec=port) is AGPL-3.0 → clean-room; harvest-mcp#2 (rec=adopt) is unknown-license → reimplement, do not copy.
- RRF retrieval fusion here OVERLAPS `rag-retrieval-projection` (the designated RRF owner) and `goals/trustgraph-port` (FalkorDB/GraphRAG) — CONSUME a single shared RRF/retrieval layer, do not build a third.

<dump>
