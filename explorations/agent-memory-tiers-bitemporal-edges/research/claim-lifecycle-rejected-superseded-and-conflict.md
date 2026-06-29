# Research — claim-lifecycle-rejected-superseded-and-conflict

Scope: add `rejected` + `superseded` claim states and conflict/contradiction edges to the epistemic spine **additively** (no in-place edit of the completed-retained gate) via a per-anchor supersede pass, explicit-vs-implicit conflict edges, heuristic relation confidence as a pre-gate triage signal, and a candidate→approved human-gate persistence model for a fresh extending goal.

## Findings

### Repo grounding — what exists today and the exact gap

- **`ClaimLifecycle` is a forward-only 4-state LiteralKit owned by `@beep/shared-domain`** (cross-slice product language, not epistemic-private): `["candidate", "shape_valid", "consistency_checked", "admitted"]`. Source: `packages/shared/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts`. Its docstring asserts the four states "form a linear admission pipeline." There is **no** `rejected` or `superseded` member.
- **"rejected" today is a *gate verdict*, not a *claim state*.** The transition service `makeClaimTransition.advance` (in `packages/epistemic/use-cases/src/ClaimLifecycle/ClaimLifecycle.service.ts`) does: on `gateResult.verdict === "rejected"` it returns the claim **unchanged** (silent no-op); otherwise it steps `candidate → shape_valid` or fails `ClaimInvalidTransition`. So a rejection currently leaves no durable state — exactly the gap this subtopic fills.
- **`CandidateClaim`** (`packages/epistemic/domain/src/entities/CandidateClaim/CandidateClaim.model.ts`) persists `lifecycle: ClaimLifecycle` via `EntitySchema.persist.literal({ columnName: "lifecycle" })` plus an `UnknownRecord` `snapshot` jsonb. This is the relational template the new disposition column would parallel.
- **Architectural constraint (load-bearing):** because `ClaimLifecycle` lives in the **shared kernel** and is consumed cross-slice (law-practice and future verticals type work-product state off it — see the model's own docstring and `packages/shared/domain/CLAUDE.md`), *widening the enum in place* mutates the completed-retained gate's contract and forces every vertical to handle new states. The shared-kernel guide (`packages/shared/AGENTS.md`) explicitly says prefer keeping evolving semantics in a concrete slice until multiple slices agree. ⇒ **the additive states belong in the new extending slice, not in the shared enum.**

### Design recommendation: two orthogonal axes, never one widened enum

- **Keep `ClaimLifecycle` (admission pipeline) untouched; add a separate disposition/status axis in the new slice.** `rejected` and `superseded` are *terminal dispositions* (post-gate verdicts / supersession outcomes), not *pipeline stages*; conflating them onto the linear-order enum breaks `ClaimLifecycle.Options` (the "canonical forward order" the existing projection relies on). This separation is exactly how the cited corpus templates model it: **mike** keeps `document_edits.status` (`pending | accepted | rejected`) as a column *distinct* from the version pipeline, and the version-source enum (`upload | user_upload | assistant_edit | user_accept | user_reject | generated`) is a *third* axis (CAPTURE mike#4 `backend/schema.sql:284-304`, mike#6 `:244-253`). The general human-in-the-loop literature stores the decision axis as its own status set — "pending, approved, rejected, and expired" — separate from the agent's trajectory ([LangChain HITL docs](https://docs.langchain.com/oss/python/langchain/human-in-the-loop); [Architecting HITL Agents in LangGraph](https://medium.com/data-science-collective/architecting-human-in-the-loop-agents-interrupts-persistence-and-state-management-in-langgraph-fa36c9663d6f)).
- In beep terms: a new `ClaimDisposition` = `LiteralKit(["active","rejected","superseded"])` (slice-local), persisted with the same `EntitySchema.persist.literal` pattern as the existing `lifecycle` column, with a paired `resolvedAt`/`resolvedBy`/`reason` audit. This is purely additive — the shipped gate, transition table, and shared enum are unchanged.

### Never-overwrite is the governing invariant — three independent primaries agree

- **Event sourcing (additive-state principle):** "You should never remove an event from an append-only event log… the right approach is typically to define a compensating event." And because past events are immutable, "you can — from the future — change how to interpret the past," enabling "forward-compatible extensions to your state machine without modifying existing events." ([Deriving state from events, DEV](https://dev.to/jakub_zalas/deriving-state-from-events-1plj); [Event Sourcing & Append-Only Files, Medium](https://medium.com/@hesenger/event-sourcing-and-append-only-files-simplifying-database-persistence-in-domain-driven-design-10ca394a0223)). ⇒ `rejected`/`superseded` are *recorded transitions/dispositions*, not destructive edits.
- **Bi-temporal SCD Type 2 (supersede mechanics):** close the old row with `valid_to` + `is_current = false` and insert a new current row; a row with empty `valid_to` is the live record. Bi-temporal SCD2 separates *valid time* (`valid_from`/`valid_to`) from *transaction time* (`transaction_from`/`transaction_to`). ([Bi-Temporal SCD Type 2, Software Patterns Lexicon](https://softwarepatternslexicon.com/bitemporal-modeling/bi-temporal-data-warehouses/bi-temporal-slowly-changing-dimensions-scd-type-2/); [Slowly changing dimension, Wikipedia](https://en.wikipedia.org/wiki/Slowly_changing_dimension)). This is the public, standards-aligned basis for the CAPTURE's `supersededBy`/`isLatest`/`tvalid`/`tvalidEnd` fields (the search confirmed `is_current`/`valid_to` are the canonical names; `supersededBy`/`isLatest` are project nomenclature for the same pattern — UNVERIFIED as a standard term).
- **Graphiti / Zep (the canonical agent-memory primary for conflict + supersession):** every edge carries four timestamps — event-time `t_valid`/`t_invalid` and system-time `t'_created`/`t'_expired` (a.k.a. `created_at`/`expired_at`, with `valid_at`/`invalid_at` for event time). On a temporally-overlapping contradiction Graphiti "invalidates the affected edges by setting their `t_invalid` to the `t_valid` of the invalidating edge" and "consistently prioritizes new information." It **never deletes** — "old facts are invalidated — not deleted. Query what's true now, or what was true at any point in time," tracking "when it became true, and when (if ever) it was **superseded**." Apache-2.0. Sources (triangulated): [Zep arXiv 2501.13956 §temporal model](https://arxiv.org/html/2501.13956v1); [Neo4j × Zep Graphiti blog](https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/); [getzep/graphiti README](https://github.com/getzep/graphiti).

### Conflict/contradiction edges — explicit edge vs implicit invalidation (keep both)

- **Two valid representations exist in the primaries:**
  - **Explicit typed relation (agentmemory):** a `contradicts` / `supersedes` edge is a first-class, queryable relation carrying a heuristic confidence weight. CAPTURE agentmemory#7 `src/functions/relations.ts:10-37`.
  - **Implicit invalidation (Graphiti):** no persisted "contradicts" edge — contradictions are *detected* by "semantic, keyword, and graph search" (an LLM compares a new edge against semantically related existing edges) and *resolved* by setting `t_invalid`, preserving the old edge as history ([Zep arXiv](https://arxiv.org/html/2501.13956v1); [Neo4j blog](https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/)).
- **Recommendation:** keep **both** — an explicit `CONTRADICTS` edge (queryable, confidence-weighted, surfaced to the human gate as a ranked redline signal) **and** a `supersededBy` lineage pointer with bitemporal invalidation (audit + as-of reads). The explicit edge is the *redline-gate signal*; the invalidation is the *store mechanic*. This matches the CAPTURE netNew #4 ("conflict/contradiction edges") + #5 (bitemporal `supersededBy`/`isLatest`).

### Per-anchor supersede pass + conflict detection (doc-haus redline-gate semantics)

- **doc-haus redline gate** (CAPTURE doc-haus#7 `dochaus/lib/redlines.ts:86-108`): a pending-proposal queue with `ctx.ask` permission; `conflictingRedlines` = same `anchor_id` **AND** (clause scope **OR** overlapping find-text substring); **only the newest edit per paragraph stays pending; the rest are marked "superseded."** This is the per-anchor "last-write-wins among pending proposals" pass — a deterministic, explainable supersede rule that runs *before* the human gate, not an auto-admit.
- **doc-haus amendment-chain** (CAPTURE doc-haus#10 `dochaus/tool/amendment-chain.ts:42-65`): resolve `amends` targets by token-subset/defined-term match, **exclude the amender itself**, report `resolved | ambiguous | unmatched` honestly, flatten transitively with a **cycle guard**, surface the operative version, and **refuse to fabricate edges**. This is the supersede-lineage resolver for the `supersededBy` chain (transitive `isLatest` computation with cycle protection). Honest "ambiguous/unmatched" reporting > silent best-guess — aligns with beep's char-span-grounded, no-hallucination posture.
- doc-haus license: **unknown/private corpus** (not web-verifiable) → study semantics only, reimplement in Effect-Schema. (See Open/Unverified.)

### Heuristic relation confidence — VERIFIED against agentmemory source (pre-gate triage signal)

- agentmemory's `computeConfidence` (rohitg00/agentmemory, **TypeScript + zod ^4.0.0, Apache-2.0**) — verified by fetching the source, matches the CAPTURE snippet exactly:
  - base `score = 0.5`
  - `+ Math.min(sharedSessions.length * 0.1, 0.3)` (shared-session support, capped at +0.3)
  - recency: `+0.1` if both memories updated within 7 days; `-0.1` if both older than 90 days
  - relation-type weights: `supersedes` **+0.1**, `contradicts` **-0.05**
  - clamp `Math.max(0, Math.min(1, score))` → `[0,1]`
  - **Nuance (new vs CAPTURE):** `extends`/`derives`/`related` carry **no explicit weight** in the code — only `supersedes` and `contradicts` adjust the score. Verified via [raw relations.ts](https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/functions/relations.ts); repo + license + zod v4 confirmed at [github.com/rohitg00/agentmemory](https://github.com/rohitg00/agentmemory) and its `package.json`.
- **Role in the design:** this is an *explainable ranking/triage* score that surfaces likely contradictions/supersessions to the human gate — **not** an auto-decider. Pair with agentmemory's stated consolidation behavior: "when new information contradicts… the new one explicitly supersedes it. The old version is preserved but marked stale" ([WebSearch summary of agentmemory](https://github.com/rohitg00/agentmemory); corroborates Graphiti's never-delete stance).
- **Port note (from CAPTURE cautions, still valid):** agentmemory is plain TS + Zod + bespoke SDK, **not** Effect/effect-Schema — DI/Layer/service patterns do **not** transfer; reimplement the *algorithm/shape* in Effect-Schema (LiteralKit / Model.Class), attribute Apache-2.0. Do **not** copy the brittle `parseTemporalGraphXml` regex (lacks char-span grounding).

### Candidate→approved human-gate persistence model (for the fresh extending goal)

- **Relational template (mike, AGPL-3.0 → clean-room):** `document_edits ( change_id, deleted_text, inserted_text, context_before/after, status CHECK IN (pending,accepted,rejected), resolved_at )` (CAPTURE mike#4 `backend/schema.sql:284-304`). The `status` CHECK + source-span anchors (`context_before/after`) + `resolved_at` is precisely the candidate→approved gate; in beep this maps to a `ClaimDisposition` LiteralKit + `EntitySchema.persist.literal` column + a `resolvedAt` timestamp, anchored to the existing `@beep/provenance` TextAnchor / `EvidenceSpan` (startChar/endChar/quote) rather than raw `context_before/after` text.
- **Provenance/authorship axis (mike#6, `:244-253`):** version-source enum `upload | user_upload | assistant_edit | user_accept | user_reject | generated` distinguishes machine-proposed vs human-confirmed in persisted lineage — feeds the per-fact `source` enum on the bitemporal edge (which agent/extractor proposed vs which human confirmed).
- **HITL infra pattern (LangGraph, public corroboration):** `interrupt()` pauses at a node, **persists state to a checkpointer** (PostgreSQL for production so approval state survives restarts), and resumes on human input with decision types **approve / edit / reject**; "audit trails should persist the entire envelope, producer result, validation record, reviewer decisions, and timestamps in an immutable audit store," and reviewer accept/reject/edit is a training signal. ([LangChain HITL docs](https://docs.langchain.com/oss/python/langchain/human-in-the-loop); [Architecting HITL Agents, Medium](https://medium.com/data-science-collective/architecting-human-in-the-loop-agents-interrupts-persistence-and-state-management-in-langgraph-fa36c9663d6f)). ⇒ the human gate is a persisted pending-queue + immutable audit, never an in-memory branch.
- **Classification-with-provenance analog (harvest-mcp#2, license UNKNOWN → reimplement):** `ClassifiedParameter { classification; confidence; source: "heuristic"|"llm"|"manual"|"consistency_analysis"; metadata }` — the shape for "fallible proposal + confidence + how-derived + manual override," informing the per-fact `source` enum.

### Licensing summary (sources a port would touch)

| Source | License | Verified? | Action |
|---|---|---|---|
| agentmemory (rohitg00) | **Apache-2.0** | ✅ web-verified (repo + package.json) | Port algorithm w/ attribution; reimplement in Effect-Schema |
| Graphiti (getzep) | **Apache-2.0** | ✅ web-verified (README) | Reference patterns/shapes (it's Python); reimplement |
| mike | **AGPL-3.0** (per CAPTURE) | ⚠️ private corpus, not web-verifiable | Clean-room: shapes only, no code copy |
| doc-haus | unknown/private (per CAPTURE) | ⚠️ private corpus, not web-verifiable | Study semantics, reimplement |
| harvest-mcp | unknown (per CAPTURE) | ⚠️ private corpus, not web-verifiable | Reimplement, do not copy |
| courtlistener (DocketSources bitmask) | (gov data, see other subtopic) | n/a here | reference only |

### Name-collision gotcha (avoid wrong-repo porting)

- **There are ≥3 distinct repos named "agentmemory."** The corpus/CAPTURE one (TS + Zod v4 + Apache-2.0, `src/functions/relations.ts`) is **[rohitg00/agentmemory](https://github.com/rohitg00/agentmemory)** (persistent memory for coding agents). It is **NOT** [JordanMcCann/agentmemory](https://github.com/JordanMcCann/agentmemory), which is **Python + MIT** (#1 LongMemEval) — a different project with `graph.py`/`models.py`/`temporal.py` and a 6-signal composite retrieval score (semantic 0.30 / lexical 0.12 / activation 0.18 / graph 0.18 / importance 0.10 / temporal 0.12), no `supersedes/+0.1`/`contradicts/-0.05` weights. Cite the right one when porting.

## Sources

Primary (web-verified):
- getzep/graphiti README + license — https://github.com/getzep/graphiti (Apache-2.0; "old facts are invalidated — not deleted… when it was superseded")
- Zep: A Temporal Knowledge Graph Architecture for Agent Memory (arXiv 2501.13956, Jan 2025) — https://arxiv.org/html/2501.13956v1 (four timestamps; invalidate by setting t_invalid = invalidating edge's t_valid; never delete)
- Neo4j × Zep, "Graphiti: Knowledge graph memory for an agentic world" — https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/ (semantic+keyword+graph conflict detection; invalidate-not-discard; (t_valid, t_invalid))
- rohitg00/agentmemory — https://github.com/rohitg00/agentmemory (TS, zod ^4.0.0, Apache-2.0) and raw relations.ts — https://raw.githubusercontent.com/rohitg00/agentmemory/main/src/functions/relations.ts (computeConfidence formula, verified)
- JordanMcCann/agentmemory — https://github.com/JordanMcCann/agentmemory (Python/MIT; the *other* agentmemory — collision warning)
- Bi-Temporal SCD Type 2 — https://softwarepatternslexicon.com/bitemporal-modeling/bi-temporal-data-warehouses/bi-temporal-slowly-changing-dimensions-scd-type-2/
- Slowly changing dimension — https://en.wikipedia.org/wiki/Slowly_changing_dimension
- Deriving state from events (event sourcing, additive states) — https://dev.to/jakub_zalas/deriving-state-from-events-1plj
- Event Sourcing & Append-Only Files — https://medium.com/@hesenger/event-sourcing-and-append-only-files-simplifying-database-persistence-in-domain-driven-design-10ca394a0223
- LangChain human-in-the-loop docs — https://docs.langchain.com/oss/python/langchain/human-in-the-loop
- Architecting Human-in-the-Loop Agents (LangGraph interrupts/persistence) — https://medium.com/data-science-collective/architecting-human-in-the-loop-agents-interrupts-persistence-and-state-management-in-langgraph-fa36c9663d6f

Repo-internal (filesystem-grounded, this repo):
- `packages/shared/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts` (forward-only 4-state enum + ClaimLifecycleTransition)
- `packages/epistemic/use-cases/src/ClaimLifecycle/ClaimLifecycle.service.ts` (rejected = silent no-op today)
- `packages/epistemic/domain/src/entities/CandidateClaim/CandidateClaim.model.ts` (lifecycle persisted via persist.literal; snapshot jsonb)
- `packages/shared/AGENTS.md`, `packages/shared/domain/CLAUDE.md` (shared-kernel promotion bar / "keep evolving semantics in a slice")

Internal corpus (CAPTURE.md nuggets — NOT web-verifiable, used for shapes only):
- doc-haus#7 redlines (per-anchor supersede), doc-haus#10 amendment-chain; mike#4 document_edits, mike#6 version-source enum; agentmemory#7 relations confidence; harvest-mcp#2 ClassifiedParameter.

## Open / Unverified

- **doc-haus and mike are private/corpus repos** — their exact source (file paths, line ranges, license claims AGPL-3.0/unknown) could **not** be independently web-verified. All doc-haus/mike claims derive solely from `explorations/agent-memory-tiers-bitemporal-edges/CAPTURE.md`. Treat licenses as CAPTURE-asserted; re-confirm before any code reuse.
- **`supersededBy` / `isLatest` are project nomenclature**, not standardized terms. The web-verified equivalents are SCD2 `is_current` + `valid_to` (open `valid_to` = current) and Graphiti `t_invalid`/`expired_at`. The semantics map cleanly; the field *names* in CAPTURE are bespoke (UNVERIFIED as standards).
- **CAPTURE's "iii-sdk" reference for agentmemory** could not be identified/verified; not load-bearing for the algorithm (the `computeConfidence` math is confirmed regardless).
- **The corpus agentmemory file path `src/functions/relations.ts`** matches rohitg00/agentmemory's live `main` layout (raw fetch succeeded) — but the corpus snapshot may be a pinned/older revision; the confidence *formula* is verified against current `main`, the exact line numbers (`:10-37`) were not re-counted.
- **Explicit-`contradicts`-edge vs implicit-invalidation** is a genuine open *design* choice for the new goal, not a settled fact: agentmemory persists an explicit edge; Graphiti does not. Recommendation (keep both) is an architectural judgment to validate in the align/shape stage, not a verified external standard.
- **RRF / FalkorDB retrieval projection** (CAPTURE netNew #6) is out of scope here and overlaps `rag-retrieval-projection` + `goals/trustgraph-port`; do not design a conflict-edge retrieval layer in this subtopic.
