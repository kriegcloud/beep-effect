# Map — Domain-Layer Hardening decomposition

<!-- Stage 4 (decompose). Candidate goal packets: slug, mission, sequencing,
first slice, capability cites. Every major component cites an existing capability
or is marked NET-NEW. -->

## Candidate goal packets (7)

| # | slug | mission (one-liner) | depends on |
|---|---|---|---|
| 1 | **`domain-kernel-hardening`** | Retire `@beep/schema/DomainModel`; add `Principal`-typed soft-delete to `BaseEntity`; establish the `.errors.ts` convention + opt-in `TemporalValidity`/`DomainEvent` shared VOs. | — (unblocks all) |
| 2 | **`domain-typed-references`** | Replace `*FixtureKey: S.String` relationships with typed `EntityRef`/`EntityId` repo-wide; move `fixtureKey` to a fixtures/seed layer. | 1 |
| 3 | **`epistemic-claim-body`** | Replace `CandidateClaim`/`Activity` `snapshot: UnknownRecord` with a typed **SPO-capable assertion** VO + confidence/derivation-source; PROV-shaped `Activity`. | 2 |
| 4 | **`workspace-candidate-approval`** | Real `ApprovalDecision` union + `approverPrincipal`/`decidedAt`/`reason`; typed candidate bodies; reconcile candidate lifecycle with `ClaimLifecycle`; `EmailArtifact` VOs. | 2, (lifecycle from 1/3) |
| 5 | **`law-practice-real-domain`** | Real vocabularies, office-action dates/examiner/art-unit, patent identifier VOs, party model, claim/prosecution lineage, `Matter` as aggregate root. | 2 |
| 6 | **`provenance-attestation`** | Verbatim span verifier (cross-field refinement idiom) + `Attestation`/`SignatureRequest` VO wiring `Sha256`/`Ed25519Signature` + content-addressing + evidence authority grading. | 1, 3 |
| 7 | **`agents-and-narrowing-sweep`** | `Agent`/`Skill` real fields + versioning, `AgentMode` union; fix `AssistantContent` annotation-dup; repo-wide `S.String`→`NonEmptyString`/VO narrowing; finish `ConstraintDecoder` migration. | 2 |

## Sequencing / dependency edges

```
1 domain-kernel-hardening  (FIRST SLICE — changes BaseEntity once, unblocks all)
        │
        ▼
2 domain-typed-references   (the biggest structural debt; gates the body work)
        ├──────────────┬───────────────┬──────────────┐
        ▼              ▼               ▼              ▼
3 epistemic-      4 workspace-     5 law-practice-  7 agents-and-
  claim-body        candidate-       real-domain      narrowing-sweep
        │             approval                         (mostly independent)
        └─────┬───────┘
              ▼
        6 provenance-attestation   (needs kernel primitives + typed evidence/claim)
```
After **2**, packets **3/4/5/7** can proceed in parallel; **6** lands after **3**.

## Capability citations (compose bricks; do not rebuild)

| Component | Existing capability (reuse) | NET-NEW |
|---|---|---|
| Soft-delete fields | `BaseEntity.fields`/`persisted` (`@beep/shared-domain/entity/BaseEntity`), `Principal`, `EntitySchema.persist.*` | the `deletedAt`/`deletedByPrincipal` field pair + retirement of `DomainModel` |
| Typed errors convention | `TaggedErrorClass` (`@beep/schema`), epistemic `ClaimInvalidTransition` template | per-slice `.errors.ts` files |
| Typed references | `EntityRef`, `EntityId.factory`, `identity/*` registries (`@beep/shared-domain`) | — (pure reuse; remove fixtureKey strings) |
| SPO assertion / claim body | `LiteralKit.toTaggedUnion`, `EvidenceSpan`, `UnitInterval`, `ClaimLifecycle` | the `Assertion` VO (subject-ref+predicate+object) + derivation-source enum — grounded by patent-KG SPO + agentmemory (`synthesis/20`) |
| Approval/lifecycle unions | `LiteralKit.toTaggedUnion`, `Principal`, `DateTimeFromMillis` | real `ApprovalDecision`/lifecycle unions + shared candidate-lifecycle model |
| Email VOs | `Email`, `TextAnchor`, `DateTimeFromMillis` (`@beep/schema`/`@beep/provenance`) | `EmailContact` VO |
| Legal vocabularies / VOs | `LiteralKit`, `toTaggedUnion`, `RejectionGround` (template), `LocalDate` | court/jurisdiction SKOS, CPC/IPC, patent identifier VOs, party model — grounded `synthesis/20` G7/G8 |
| Attestation / integrity | `Sha256`, `Ed25519Signature`, `HybridLogicalClock`, `VectorClock` (`primitives.ts` — unused), `Principal` | `Attestation`/`SignatureRequest` VO + span verifier — grounded `synthesis/21` G11, `synthesis/20` G3 |
| Temporal validity | `LocalDate`, `DateTimeFromMillis` | opt-in `TemporalValidity` VO (open-interval) — grounded `synthesis/20` G9 |
| Narrowing/annotation | `NonEmptyString`, `ConstraintDecoder`, `$I.annoteKey` | — (mechanical sweep) |

## First vertical slice

**`domain-kernel-hardening`** — smallest change with the largest unblock: it
touches `BaseEntity` once, every slice inherits it, and it sets the `.errors.ts`
convention the other six packets reuse. Graduated now; packets 2–7 named here,
graduated later from this exploration (status stays `active`).

## Deferred (with rationale)
- **Ontology TBox / FalkorDB projection / SPARQL** → `ip-law-knowledge-graph` packet
  (projection/engine, not domain modeling).
- **Bitemporal/matter-wall/reasoner enforcement** → roadmap P4 (model-now/enforce-later).
- **Drivers/ingestion + vendor selection** → driver/capability packets (per GOLD_SYNTHESIS).
