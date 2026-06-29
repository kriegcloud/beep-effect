# Phase 1 — Cross-cutting rollup (19)

Consolidates the five slice audits (10–14) into repo-wide findings, a priority
order, and the Phase-2 grounding map. This is the bridge into shape/decompose.

## A. The repo-wide patterns (ranked by leverage)

| # | Pattern / debt | Where | Strategy | Severity |
|---|---|---|---|---|
| **P1** | **`*FixtureKey: S.String` relationships instead of typed `EntityRef`/`EntityId`** | law-practice (all 9), workspace (`Workspace`, `EmailArtifact`, candidates, context), epistemic (`CandidateClaim`,`Evidence`,`Activity`), agents (both). **Counter-examples that do it right:** `Turn`/`Message`/`Thread`, `UsageRecord` | identity composition | **highest — structural** |
| **P2** | **`snapshot: UnknownRecord` untyped bodies** — the candidate/claim/activity payloads (the things humans approve) are opaque blobs | epistemic `CandidateClaim`,`Activity`; workspace `CandidateTask/Project/Draft`,`ApprovalGate`,`ContextPacket` | schema-first | **highest — violates the core "schema is truth" rule on the core primitive** |
| **P3** | **Placeholder single-value literals** (proof-seed vocabularies) | `MatterType`,`PatentAssetStatus`,`LegalClientStatus`,`LegalContactRole`,`DistinctionKind`,`CandidateLifecycle`,`ApprovalDecision`,`AgentMode` | matchable variants | high — domain language is stubbed |
| **P4** | **Typed-error gap** — `.errors.ts` absent | law-practice (0), workspace (0), agents (0). **Template:** epistemic `ClaimInvalidTransition` | tagged errors | high |
| **P5** | **Divergent candidate/approval lifecycles** for one product flow | epistemic `ClaimLifecycle` (4-state) vs workspace `CandidateLifecycle` (1) vs `ApprovalDecision` (1) | shared-kernel + variants | high — spine incoherence |
| **P6** | **No soft-delete; two competing audit bases** | kernel `BaseEntity` vs unused `DomainModel` | soft-delete | high |
| **P7** | **Bare `S.String` for narrowable domain fields** (displayName/name/title/text/applicationNumber/documentNumber/receivedAt) | every slice | refinement / VO | medium — cheap, high signal |
| **P8** | **Provenance/attestation substrate under-adopted** — `TextAnchor` only in `Distinction`/`EvidenceSpan`; `Sha256`/`Ed25519Signature`/`HybridLogicalClock`/`VectorClock` wired **nowhere** | repo-wide | provenance | medium — future-proofing |
| **P9** | **No temporal validity (`validFrom/validTo`)** | repo-wide (roadmap P4) | temporal validity | medium — opt-in VO |
| **P10** | **No domain-event substrate** despite "everything is a projection" doctrine + `.events.ts` role allowance | repo-wide | event-sourcing | medium |
| **P11** | **Aggregate roots not promoted to `aggregates/`** | `Turn`,`Thread` (workspace), `Matter` (law-practice) are real aggregates; shared `aggregates/` is an empty stub | aggregate | medium |
| **P12** | **Annotation hygiene** — `annotate`+`annotateKey` duplication; partial `ConstraintDecoder` migration | agents `AssistantContent`; repo-wide | lint/codemod | low |

## B. What is already exemplary (propagate, don't reinvent)
- Typed-ref + tagged-item aggregate: `Turn`/`TurnItem` (workspace).
- Rich observability entity: `UsageRecord` (epistemic).
- Typed-error pattern: `ClaimInvalidTransition` + union + smart ctor (epistemic).
- Provenance wrap: `EvidenceSpan = TextAnchor + Confidence` (epistemic).
- Verdict/payload tagged union: `ClaimGateResult`, `RejectionGround` (epistemic/law).
- Provenance+lifecycle on an entity: `Distinction` (law-practice).
- Rich-text-for-LLM value object: `AssistantContent` (agents).

## C. Phase-2 grounding map (which corpus validates which decision)

| Corpus | Validates / informs |
|---|---|
| `law_stuff` | P3 real vocabularies (matter/patent/client/contact), office-action dates, patent identifiers, party roles |
| `ontology_research` | P2 typed claim body (PROV-O Activity/Entity/Agent; assertion/SPO), party data model, identity/ontological soundness |
| `digital_signature_stuff/repos` | P8 attestation/signature envelopes (Ed25519), tamper-evidence at approval/admission |
| `dms_stuff/repos` | P6 soft-delete + versioning, content-addressing (Sha256), `EmailArtifact`/document modeling, P2 typed bodies |
| `meeting_notes_ai` | P8 capture/turn/annotation provenance, `Turn`/`Message` enrichment |
| `oppold-corpus` | P3/P2 real-world validation — do the vocabularies + typed bodies survive actual firm data shapes |

## D. Recommended decomposition seeds (for Phase 3 `MAP.md`)
Likely goal-packet slices, ordered by dependency:
1. **kernel-audit-base + soft-delete** (P6) — unblocks every slice; retire `DomainModel`.
2. **typed-reference migration** (P1) — `*FixtureKey` → `EntityRef`; biggest structural win.
3. **typed candidate/claim bodies** (P2) — kill `snapshot: UnknownRecord`; **gated on Phase-2 ontology grounding**.
4. **lifecycle + approval unification** (P5/P3 `ApprovalDecision`) — the candidate→approval spine.
5. **law-practice real domain** (P3 vocabularies, office-action dates, patent VOs, party model) — **gated on Phase-2 legal grounding**.
6. **typed-error convention** (P4) — `.errors.ts` per slice from the epistemic template.
7. **provenance/attestation adoption + cross-field refinement idiom** (P8, kernel R6/R7).
8. **narrowing + annotation-hygiene sweep** (P7/P12) — mechanical, cheap.

Items 3 and 5 are the hard dependencies on Phase-2; 1/2/4/6/8 are repo-grounded
and could proceed on the binding docs alone.
