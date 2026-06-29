# Brief — Domain-Layer Hardening

<!-- Stage 3 (shape). Problem, appetite, solution sketch (fat-marker), rabbit
holes, no-gos. Not a spec — graduation seeds the goal packet SPECs from this. -->

## Problem

The repo's domain layer has a world-class substrate (`BaseEntity`/`EntitySchema`,
`$I` identity, `LiteralKit`/`toTaggedUnion`, `TaggedErrorClass`, `TextAnchor`,
`Principal`) but the product entities built on it are, in large part, **fixture
seeds rather than a real domain**. Phase-1 audit + Phase-2 grounding (six corpora;
`law_stuff/repos/GOLD_SYNTHESIS.md` independently corroborated every finding) show
five repo-wide debts that compound over time:

- **P1** relationships are `*FixtureKey: S.String`, not typed `EntityRef`/`EntityId`.
- **P2** the core memory primitive (the claim) and every candidate are
  `snapshot: UnknownRecord` — opaque blobs the human "approves" sight-unseen.
- **P3** 8 single-value placeholder vocabularies (`MatterType=["patent_application"]`,
  `ApprovalDecision=["pending"]` — the approval gate cannot express approval).
- **P4** zero typed domain errors in 3 of 5 slices.
- **P6** no soft-delete; two competing audit bases.

Left alone, each becomes a data migration once real (privileged) data exists. The
product's own doctrine — "schema is the source of truth", "everything is a
projection of claim+evidence+provenance+lifecycle" — is violated exactly where it
matters most. This is the moment to harden, before law-practice carries real matters.

## Appetite

**Large initiative, small first slice.** The whole hardening is ~6–8 focused goal
packets rolled out over time; we do **not** boil the ocean in one packet. The
appetite for the *first* slice (kernel audit-base + soft-delete) is **one tight,
independently yeet-able packet** — it changes `BaseEntity` once and unblocks every
other slice. Each subsequent packet is similarly bounded. We end this exploration
on a graduated first packet + a MAP naming the rest; we do **not** implement here.

## Solution sketch (fat-marker)

Reuse-first, schema-first, Effect-native. Compose the existing bricks; add the few
genuinely missing primitives as shared value objects, applied **selectively** (not
base-wide) where the domain needs them:

- **Kernel:** port soft-delete (`deletedAt`/`deletedByPrincipal`, `Principal`-typed)
  into `BaseEntity`; retire `@beep/schema/DomainModel`. (`rowVersion` already covers
  `version`.)
- **Typed references:** `*FixtureKey: S.String` → `EntityRef`/`EntityId`; move
  `fixtureKey` to a fixtures/seed layer.
- **Typed bodies:** replace `snapshot: UnknownRecord` with typed VOs; the claim
  becomes an **SPO-capable assertion** (subject-ref + predicate + object) carrying
  confidence + derivation-source + lifecycle + supersession (G1/G4).
- **Lifecycle + approval:** one candidate/approval lifecycle relating to
  `ClaimLifecycle`; `ApprovalDecision` becomes a real union + `approverPrincipal` +
  `decidedAt` + `reason` (G2).
- **Law-practice real domain:** real vocabularies (G7/G8), office-action dates,
  patent identifier VOs, party model, claim/prosecution lineage (G6).
- **Provenance/attestation:** span verifier as the cross-field refinement idiom
  (G3); `Attestation`/`SignatureRequest` VO wiring `Sha256`/`Ed25519Signature`
  (G11); content-addressing (G10).
- **Typed errors + narrowing:** `.errors.ts` per slice from the epistemic
  `ClaimInvalidTransition` template; `S.String` → `NonEmptyString`/VO sweep.

## Rabbit holes (name them, don't dig)

- **Full FalkorDB/GraphRAG/SPARQL projection + 7-ontology TBox** — that is
  `ip-law-knowledge-graph`, not this. We model the *typed body*, not the graph engine.
- **Deep FOLIO/PROV-O ontology alignment** — defer; establish the SPO-capable shape now.
- **Drivers/ingestion** (USPTO/CourtListener/Box/notetaker clients) — out of scope;
  the GOLD_SYNTHESIS already routes these to driver/capability packets.
- **Bitemporal *enforcement*, matter-wall *enforcement*, reasoner** — roadmap P4;
  model-now/enforce-later. Add the fields/VOs, not the enforcement machinery.
- **Migrating existing data** — there is little real data yet; that is the point of
  doing this now, but migrations themselves are an implementation concern per packet.

## No-gos

- No implementation in this exploration — we end on a graduated first packet + MAP.
- No new entity base / id scheme / tagged-union builder / value-object library — the
  canonical-pattern catalog (`RESEARCH.md` §A.3) already has them; reuse-first.
- No raw `Data.TaggedError`, no optional-bag modeling of finite cases, no
  hand-mapped drizzle tables — binding rules stand.
- No base-wide temporal/event/crypto columns — those are opt-in VOs/mixins, applied
  where the domain needs them (the rubric's criterion-4 discipline).
- No client/corpus data into this public tree — corpus cited by reference only.
