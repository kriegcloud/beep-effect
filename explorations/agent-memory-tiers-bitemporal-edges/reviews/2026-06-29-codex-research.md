# Codex research-gate critique — agent-memory-tiers-bitemporal-edges (2026-06-29)

## Blocking

1. **False repo-verification claim for `rejected|superseded`.**
   - Claim or gap: `RESEARCH.md` says "`ClaimLifecycle` has no `rejected`/`superseded` members; confirmed: `rg rejected|superseded` returns zero across current implementation areas."
   - Why wrong/risky/missing: The narrow lifecycle gap is real, but the repo-wide verification claim is false. `packages/epistemic/domain/src/values/ClaimGate/ClaimGateResult.model.ts:82` defines `ClaimGateVerdict = LiteralKit(["admitted", "rejected"])`, and `packages/epistemic/use-cases/src/ClaimLifecycle/ClaimLifecycle.service.ts:73` branches on `gateResult.verdict === "rejected"`. The implementation currently leaves rejected claims unchanged, which is the actual gap. Stating that `rg` returns zero hides existing gate semantics and risks duplicating or bypassing them.
   - Concrete fix: Replace the claim with: "`ClaimLifecycle` has no durable `rejected`/`superseded` state; `rejected` already exists as a `ClaimGate` verdict, and the current transition service treats it as a no-op." Cite `ClaimLifecycle.model.ts`, `ClaimGateResult.model.ts`, and `ClaimLifecycle.service.ts`.

2. **False citation to an exported `ProvDateTimeChecks` symbol.**
   - Claim or gap: `RESEARCH.md` and `research/bitemporal-versioned-edge-modeling.md` say `@beep/semantic-web/prov` exports reusable `ProvDateTimeChecks` for temporal validation.
   - Why wrong/risky/missing: `packages/foundation/capability/semantic-web/src/prov.ts` defines `provDateTimeChecks` as a private lowercase constant. The public exports are `ObjectRef`, `ProvDateTimeEncoded`, `ProvDateTime`, `Entity`, `Revision`, and related schemas. Importing `ProvDateTimeChecks` from `@beep/semantic-web/prov` will fail.
   - Concrete fix: Change the design to reuse the exported `ProvDateTime` or `ProvDateTimeEncoded` schemas, or add a deliberate public export in `@beep/semantic-web/prov` before depending on a checks helper.

3. **Lifecycle-state strategy contradicts itself and would mutate a shared kernel.**
   - Claim or gap: `RESEARCH.md` correctly says lifecycle progression and truth disposition should be orthogonal, but `research/license-aware-clean-room-reimplementation.md` says the mike-inspired rejected/superseded states should "extend existing forward-only `ClaimLifecycle`."
   - Why wrong/risky/missing: `ClaimLifecycle` is a shared-domain value used outside this packet, including `packages/epistemic/domain/src/entities/CandidateClaim/CandidateClaim.model.ts` and `packages/law-practice/domain/src/entities/Distinction/Distinction.model.ts`. Extending it with rejection/disposition states contradicts the packet's own architecture and turns a workflow-progress enum into a truth-state enum.
   - Concrete fix: Keep `ClaimLifecycle` unchanged. Add a slice-local `ClaimDisposition` or `ClaimTruthStatus` model with values such as `active`, `rejected`, `superseded`, and `conflicted`, then wire it beside lifecycle on claim or edge projections.

4. **Missed governing memory-architecture prior art.**
   - Claim or gap: The research treats the external landscape as five new donor passes and cites `standards/memory-architecture/01-memory-layer-taxonomy.md`, but it does not incorporate the repo's existing capability-assessment and SaaS-landscape standards.
   - Why wrong/risky/missing: `standards/memory-architecture/05-context-graph-capability-assessment.md` already evaluates Graphiti/Zep, GraphZep, Cognee, LangGraph/LangMem, Letta, mem0, TrustGraph, and OpenClaw, and defines the authority rule that repo-native storage remains durable truth while external systems may be candidates, projections, caches, or donor capabilities. `standards/memory-architecture/03-saas-landscape-assessment.md` already covers Graphiti/Zep and OpenClaw Memory/Dreaming. Omitting these standards misses the better existing repo approach and can produce a design that re-argues settled authority boundaries.
   - Concrete fix: Add a "Repo prior-art baseline" section that summarizes the authority model and donor-tool portfolio from those two standards, then map this packet's memory tiers and bitemporal edges to durable truth, projection, cache, and candidate roles.

5. **Bitemporal storage feasibility is under-specified against the actual table layer.**
   - Claim or gap: `RESEARCH.md` says to use indexed relational/temporal columns and never overwrite edges, but it does not specify the owning table package, schema, migration, indexes, overlap rules, or as-of query contract.
   - Why wrong/risky/missing: `@beep/epistemic-tables` exists, but its current schema only materializes `UsageRecord`; it does not expose claim, evidence, or versioned-edge tables. `@beep/drizzle` supports timestamp columns and generic index hints, but there is no observed repo helper for bitemporal period overlap constraints, open intervals, exclusion constraints, or edge supersession invariants. The current research therefore underestimates the storage work required to make `validFrom`/`validTo`/`recordedAt`/`expiredAt` reliable.
   - Concrete fix: Add a required storage contract: table owner, schema fields, open-interval representation, btree/gin/unique indexes, `asOf(validAt, recordedAt)` query shape, no-overlap policy, cycle policy, migration path, and whether overlap prevention is enforced in Postgres constraints or in Effect services.

6. **"Explicitly deferred rejected/superseded states" is not supported by the live goal docs.**
   - Claim or gap: `RESEARCH.md` says the completed claim-lifecycle gate explicitly deferred the bitemporal store, RRF, and rejected/superseded states.
   - Why wrong/risky/missing: The live `goals/epistemic-claim-lifecycle-gate/SPEC.md` explicitly defers FalkorDB or another persistent projection store, the v3 GraphRAG/extraction pipeline port, richer SHACL than the bounded adapter, and matter-wall enforcement. It does not explicitly document rejected/superseded durable states as a deferred item. The optional routing snapshot supports broader routing context, but it is not a substitute for current goal docs.
   - Concrete fix: Rephrase this as: "The completed gate implements admitted/rejected verdicts and leaves rejected claims unchanged; durable rejected/superseded disposition remains unimplemented. Persistent graph projection and GraphRAG work were explicitly deferred." Cite the live SPEC plus the transition service.

## Advisory

1. **License research heading contradicts its own evidence.**
   - Claim or gap: `research/license-aware-clean-room-reimplementation.md` says "all four confirmed against repos themselves," then says `harvest-mcp` was not located and its repo identity is unverified.
   - Why wrong/risky/missing: That heading overstates verification and can lead downstream implementers to treat `harvest-mcp` as safe source-backed prior art.
   - Concrete fix: Change the heading to "three located repos plus one unverified corpus item" and keep `harvest-mcp` in a no-copy, concept-only quarantine until a repo and license are verified.

2. **`doc-haus` license posture is inconsistent and omitted from the license matrix.**
   - Claim or gap: The top-level research treats `doc-haus` RRF and citation patterns as MIT-safe, the claim-lifecycle subtopic calls it unknown/private-corpus, and the license-aware subtopic omits it.
   - Why wrong/risky/missing: `explorations/_gold-intake/research/per-repo/doc-haus.md` records MIT, while other routing notes contain conservative "license unknown" wording for a different cluster. The packet cannot both use `doc-haus` as safe prior art and leave it out of the clean-room/license table.
   - Concrete fix: Add a `doc-haus` row to the license matrix with the exact source used for MIT verification, and mark any private-corpus-only `doc-haus` claims as untrusted until tied to that verified repo.

3. **`UnitInterval` "ln alias" citation is false.**
   - Claim or gap: `RESEARCH.md` says `UnitInterval` lives at `@beep/schema/UnitInterval` "and `ln` alias."
   - Why wrong/risky/missing: `packages/foundation/modeling/schema/src/UnitInterval.ts` exports `UnitInterval`, `isUnitInterval`, `ZERO`, `ONE`, and `complement`; no `ln` alias exists in the source or package exports. This is a false symbol citation.
   - Concrete fix: Remove the `ln` alias reference and cite only `@beep/schema/UnitInterval` plus the observed exports.

4. **AgentMemory dependency/version inventory is internally stale.**
   - Claim or gap: `research/memory-tier-decay-and-eviction.md` says AgentMemory's runtime dependencies include Anthropic/OpenAI/Gemini SDKs and `@xenova/transformers`, while `research/license-aware-clean-room-reimplementation.md` records AgentMemory `package.json` with `iii-sdk` 0.11.2, `zod` 4.0.0+, Anthropic packages, `dotenv`, `@clack/prompts`, and `picocolors`.
   - Why wrong/risky/missing: These cannot both be the current dependency inventory. The stale dependency list affects license and implementation-risk analysis, especially if transitive SDK or model-runtime dependencies drive adoption decisions.
   - Concrete fix: Pick one dated upstream `package.json` snapshot as authoritative, cite it directly, and move older enrichment notes into an "older corpus observation" paragraph.

5. **Private-corpus assertions are promoted as source-backed facts.**
   - Claim or gap: Several donor claims from `agentmemory`, `doc-haus`, `research-squad`, and `harvest-mcp` are used in the top-level synthesis as if they were independently verified by live repo reads.
   - Why wrong/risky/missing: The packet mixes local gold-intake notes, private-corpus routing, and live repo/package verification. Without labeling provenance, implementers cannot tell which ideas are safe to copy, which are clean-room concept only, and which need second-source confirmation.
   - Concrete fix: Add a provenance marker to each donor claim: `live-repo verified`, `gold-intake note`, `private corpus asserted`, or `unverified`. Require live-repo verification before borrowing code shapes, APIs, or license conclusions.

6. **RRF weight-renormalization is presented as locked when the owning packet treats it as a Beep-owned policy decision.**
   - Claim or gap: `RESEARCH.md` lists "rank-only, k=60 default, weight-renormalize" as locked RRF behavior.
   - Why wrong/risky/missing: `explorations/rag-retrieval-projection/research/rrf-fusion-and-retrieval-contract.md` says whole-empty-channel weight renormalization is not an industry-standard RRF rule; it is a local invariant to decide and document. Locking it here oversteps the RRF owner packet.
   - Concrete fix: State that rank-only fusion and `k=60` are imported constraints, while empty-channel renormalization and literal floors must be ratified in `rag-retrieval-projection` before this packet depends on them.

7. **Metrics and acceptance gates are too vague for a risky core-memory change.**
   - Claim or gap: The research names context precision, hallucination reduction, freshness, as-of correctness, eviction predictability, token savings, and contradiction detection, but it does not define datasets, thresholds, fixtures, or proof commands.
   - Why wrong/risky/missing: This packet touches durable memory semantics. Without measurable gates, "better memory" can ship as subjective behavior and regress the same correctness properties it claims to improve.
   - Concrete fix: Add acceptance fixtures: bitemporal as-of query examples, stale-vs-fresh retrieval cases, conflict/supersession cases, eviction pressure scenarios, RRF empty-channel cases, and concrete commands such as package-local tests plus any required architecture/docgen proof.

## Confirmed sound

1. **Tree snapshot handling is sound.**
   - Claim or gap: The task's optional tree snapshot path exists and was read.
   - Why wrong/risky/missing: The snapshot can be used as routing context, but not as the sole proof for live repo state.
   - Concrete fix: Keep it as secondary context and prefer current package source, current packet docs, and live goal docs for claims about implemented behavior.

2. **The main `@beep/*` package inventory is largely real.**
   - Claim or gap: The packet cites `@beep/schema`, `@beep/epistemic-domain`, `@beep/provenance`, `@beep/semantic-web`, `@beep/shared-domain`, `@beep/epistemic-use-cases`, `@beep/epistemic-tables`, and `@beep/epistemic-server`.
   - Why wrong/risky/missing: Those package paths and package names exist, and their package exports support the cited broad package boundaries. The concrete symbol exceptions are the blocking `ProvDateTimeChecks` and advisory `ln` alias findings above.
   - Concrete fix: Keep the package-level inventory, but tighten symbol-level citations to exported names only.

3. **Confidence and text-anchor reuse is a valid local capability.**
   - Claim or gap: The research says existing evidence spans already use `TextAnchor` and `UnitInterval` confidence.
   - Why wrong/risky/missing: `packages/epistemic/domain/src/values/EvidenceSpan/EvidenceSpan.model.ts` imports `UnitInterval`, defines `Confidence = UnitInterval`, and spreads `TextAnchorFields`; `packages/foundation/modeling/provenance/src/TextAnchor.ts` defines `startChar`, `endChar`, and `quote` semantics.
   - Concrete fix: Keep this as the reuse path for provenance-backed extraction evidence.

4. **The durable rejected/superseded gap is real when correctly scoped.**
   - Claim or gap: The research says durable rejected/superseded claim state is missing.
   - Why wrong/risky/missing: `packages/shared/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts` only defines `candidate`, `shape_valid`, `consistency_checked`, and `admitted`. The existing rejected verdict is not persisted as lifecycle or disposition.
   - Concrete fix: Preserve the gap, but describe it as missing durable disposition rather than missing every rejected concept.

5. **The memory-tier, bitemporal-edge, and RRF implementation gaps are real.**
   - Claim or gap: The research says there is no current `ConsolidationTier`, `accessCount`/`lastAccessedAt`, `tvalidEnd`, `supersededBy`, `reciprocal-rank`, `rrf_k`, or `rankConstant` implementation in the relevant packages.
   - Why wrong/risky/missing: Targeted source searches across package and app code did not find those symbols as implemented capabilities; unrelated UI or documentation hits do not close the domain gap.
   - Concrete fix: Keep these as implementation gaps and attach them to owner packets/packages before building.

6. **RRF ownership and TrustGraph Phase 1 boundaries are correctly identified.**
   - Claim or gap: The packet says `rag-retrieval-projection` owns RRF and `trustgraph-port` Phase 1 remains scoreless deterministic retrieval.
   - Why wrong/risky/missing: `explorations/rag-retrieval-projection/CAPTURE.md` identifies `agent-memory-tiers-bitemporal-edges` and `trustgraph-port` as consumers, and `goals/trustgraph-port/SPEC.md` documents ranked mixed-corpus output with no numeric scoring surface.
   - Concrete fix: Keep the boundary, and make this packet depend on the RRF contract rather than defining RRF semantics directly.

7. **Major license hazards are flagged, but need consistency cleanup.**
   - Claim or gap: The research flags `willchen96/mike` as AGPL, `mediar-ai/screenpipe` as commercial/proprietary-risk, and `harvest-mcp` as unverified/no-license.
   - Why wrong/risky/missing: Those are the right categories for clean-room handling. The remaining problem is inconsistent wording and missing `doc-haus` treatment, not the existence of these hazards.
   - Concrete fix: Keep the hazard flags and normalize the license matrix so every donor claim has one provenance and one reuse rule.
