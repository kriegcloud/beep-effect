# Law-Practice Office-Action Spike Spec

_Date: 2026-06-17 · Slice: `law-practice` · Depends on:
`epistemic-claim-lifecycle-gate`._

## Objective

Graduate the `law-practice` slice from domain-only to **minimum-viable**
(domain + use-cases + server) by adding the IP-law vertical and wiring the
rung-0 office-action review loop end-to-end on **one** fixture office action.

Observable end state: a single integration test runs one synthetic/public
office-action document through the full loop —
`tika`/`@beep/file-processing` extract text → `@beep/langextract` aligns a
span-bearing `GroundedExtraction[]` → **IR→law-entity mapping** → one
`OfficeAction` + one `Rejection(§102)` + one `Claim` + one
`PriorArtReference` → one `Distinction` candidate emitted as a
`CandidateClaim` carrying `Evidence(char-span)` → the epistemic `ClaimGate` +
`ClaimLifecycle` (composed via the epistemic public surface) → in-memory
`ClaimProjection` → a trivial ask — and asserts the loop turns once GREEN,
with every claim linked back to a source character span.

Provenance: graduated from `explorations/atlas-synthesis`
([`MAP.md`](../../explorations/atlas-synthesis/MAP.md) §2/§4, the canonical
decomposition). Authority: `goals/agentic-professional-runtime/SPEC.md` and
its [`docs/data-model-law-practice.md`](../agentic-professional-runtime/docs/data-model-law-practice.md)
(already defines `OfficeAction`/`Matter`/`Claim`). Field-shape grounding:
`explorations/atlas-synthesis/synthesis/50-office-action-domain.md` (§6/§7) and
`51-office-action-data-and-ontology.md` (§1.2 fixture/privilege; 7-source
ontology defer). This packet **references, never merges**
`goals/ip-law-knowledge-graph` and `goals/oppold-corpus-pipeline`.

## Non-Goals

- No new `knowledge-law/*` packages: the vertical is slice-owned in
  `law-practice` (domain + use-cases + server), per the locked decisions.
- No epistemic mechanism here: the `ClaimLifecycle` state machine, the
  SHACL-gate mechanism, `ClaimProjection`, and the `Evidence(char-span)`
  primitive are owned by `epistemic-claim-lifecycle-gate` and consumed
  **only via its public surface** (no slice-to-slice internal imports).
- No 7-source IP-law ontology grounding: `@source` JSDoc is **light** only
  (CPC/IPC, PROV-O, SKOS as design-time annotations).
  `goals/ip-law-knowledge-graph` stays PENDING/referenced.
- No real client matter in the repo: the fixture office action is
  synthetic/public (privilege wall). The USPTO OA Rejection API is a schema
  `@source` donor, not a fixture or feed.
- No v3 engine port beyond the `Evidence(char-span)` primitive (owned by
  Packet A): FalkorDB, GraphRAG retrieval/RRF, entity-resolution, runtime
  reasoner are DEFERRED. `langextract` covers extraction.
- No breadth in the first slice: exactly **one** §102 rejection, **one**
  independent claim, **one** prior-art reference, **one** distinction kind
  (`missing_limitation`). Multi-ref §103, §101/§112, the §132 response
  ladder, and a real GraphRAG ask are out of scope.
- No matter-wall **enforcement**: `OfficeAction.matterId` is modeled now;
  permissioned-projection enforcement is deferrable (the model is not).

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards (`standards/ARCHITECTURE.md`;
   the minimum-viable-slice rule = domain + use-cases + server; no
   slice-to-slice internal imports).
4. Product authority: `goals/agentic-professional-runtime/SPEC.md` +
   `docs/data-model-law-practice.md`.
5. This `SPEC.md`.
6. `PLAN.md`.
7. `GOAL.md`.
8. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Target Surfaces

Exact packages and role-files (proposed at graduation per the role-suffix
convention `.model.ts → .errors.ts → .ports.ts/.service.ts`; finalized in P0):

**`@beep/law-practice-domain` (`packages/law-practice/domain` — HAVE package,
NET-NEW entities; extends existing `Matter`/`PatentAsset`/`LegalClient`):**

- `src/entities/OfficeAction/OfficeAction.model.ts` + `OfficeAction.errors.ts`
- `src/entities/Claim/Claim.model.ts` + `Claim.values.ts`
- `src/entities/Rejection/Rejection.model.ts` + `Rejection.values.ts`
  (tagged union on `statute`: §101/§102/§103/§112)
- `src/entities/PriorArtReference/PriorArtReference.model.ts`
- `src/entities/Distinction/Distinction.model.ts` (work-product, tagged union
  on `kind`; `lifecycleState` typed from the shared-kernel `ClaimLifecycle`
  (`@beep/shared-domain`); evidence char-span via `@beep/provenance` `TextAnchor`)

**`@beep/law-practice-use-cases` (`packages/law-practice/use-cases` — NEW
tier):**

- `src/IrToLaw/IrToLaw.ports.ts` + `IrToLaw.service.ts`
  (`(ReadonlyArray<GroundedExtraction>) => Effect<LawEntities>` — span-bearing
  langextract output, not the span-lossy nlp `AnnotatedDocument` envelope)
- `src/OfficeActionReview/OfficeActionReview.ports.ts` +
  `OfficeActionReview.service.ts` (loop orchestrator
  `(OfficeActionReviewInput) => Effect<ClaimProjectionView>`)

**`@beep/law-practice-server` (`packages/law-practice/server` — NEW tier):**

- `src/...` — loop wiring (live Layer composition) + a trivial ask/view.

**HAVE bricks composed (not modified):** `@beep/langextract`
(`Extraction`/`Alignment`/`Handoff`/`Service`/`Target`),
`@beep/nlp/Handoff/Contract` (generic IR), `@beep/file-processing`,
`@beep/tika`, `@beep/rdf/Vocab/{Prov,Skos}` (light `@source` only), and the
`epistemic-claim-lifecycle-gate` public surface
(`ClaimGate`/`ClaimLifecycle`/`ClaimProjection`, `Evidence(char-span)`).

**Fixture:** one synthetic/public office-action PDF/DOCX under the spike's
`fixtures/` (single §102 rejection, single claim, single prior-art ref).

## Constraints

- **BINDING design sequencing** (every phase and all implementation):
  (1) data model / schema → (2) Effect `Context.Service` contract (ports +
  service interfaces) → (3) implementation → (4) verify. FORBIDDEN: starting
  with loose helpers and composing them into a service at the end. Helpers
  are extracted **after** schema + contract are fixed. Role-suffix order:
  `.model.ts → .ports.ts/.service.ts → .repo.ts`.
- **Bespoke Effect-Schema TBox** in `law-practice/domain`; light `@source`
  JSDoc only (CPC/IPC, PROV-O, SKOS). `Rejection` is a tagged union on
  `statute` with statute-specific cardinality: §102 = exactly 1
  `PriorArtReference`; §103 = ≥1 refs + `combinationRationale`; §101/§112 = 0
  refs. `Rejection` and `Objection` stay distinct (appeal vs petition).
  `Distinction` is a tagged union on `kind`. Reconcile all field names
  against `docs/data-model-law-practice.md` during P0.
- **Slice ownership / no leakage:** `law-practice-domain` imports **only**
  `foundation` + shared-kernel — the `ClaimLifecycle` vocabulary from
  `@beep/shared-domain`, the char-offset anchor from `@beep/provenance`, the
  unit-interval from `@beep/schema` — with **zero** `@beep/epistemic-*` imports at
  the domain tier. `law-practice` composes the epistemic gate/projection
  **mechanism** only at the use-cases/server tier, as the bounded cross-slice
  exception recorded in the Exception Ledger below (per
  `standards/architecture/DECISIONS.md`, "2026-06-18: Cross-Slice Consumption Of
  The Epistemic Boundary"). The IP-law vocabulary never leaks into the epistemic
  slice; the mechanism is never re-implemented here.
- **Evidence is char-grounded:** every `Distinction`/`CandidateClaim`
  carries `Evidence` whose `startChar`/`endChar` re-slice the fixture text
  to the expected quote. A claim with no source span is a defect.
- **Candidate-only writes + approval gate:** the loop emits `CandidateClaim`
  records only; admission flows through the epistemic `ClaimGate` +
  `ClaimLifecycle`. No direct admitted/authoritative writes from the loop.
- **Federation invariant:** `ClaimProjection` is consumed as a pure function
  over a single-owner local authority; any cross-matter view is a
  permissioned projection, never a central write. `OfficeAction.matterId`
  (the matter wall) is modeled as a first-class field now.
- **Trivial ask only:** the view answers one question ("what distinguishes
  claim 1 over the cited reference, and where is the evidence?") returning
  the distinction text + its char-span. A real GraphRAG ask is DEFERRED.
- Domain imports only `foundation/primitive` + `foundation/modeling`; live
  composition stays in `server`. No God Layers.

## Acceptance Criteria

Each criterion gates the next phase (schema before contract before
implementation before verify).

- [ ] **P0 (schema):** `OfficeAction`/`Claim`/`Rejection`/`PriorArtReference`/
      `Distinction` exist in `packages/law-practice/domain/src/entities/**`
      as schema-first `.model.ts` (+ `.values.ts`/`.errors.ts`) with `$I`
      identity, light `@source` JSDoc, and `Rejection` cardinality encoded in
      the schema (§102 = 1 ref, §103 = ≥1 + rationale, §101/§112 = 0).
      `Distinction.lifecycleState` is typed from the epistemic public
      `ClaimLifecycle`. Field names reconciled with
      `docs/data-model-law-practice.md`. Domain tests use only slice Layers +
      shared test-kit.
- [ ] **P1 (service contract):** `IrToLaw` and `OfficeActionReview` exist as
      typed Effect `Context.Service` ports/interfaces in
      `packages/law-practice/use-cases/src/**` with **no implementation** —
      `IrToLaw: (ReadonlyArray<GroundedExtraction>) => Effect<LawEntities>`;
      `OfficeActionReview: (OfficeActionReviewInput) => Effect<ClaimProjectionView>`
      declaring deps on `@beep/langextract` (span-bearing `GroundedExtraction`),
      `IrToLaw`, and the epistemic `ClaimGate`/`ClaimLifecycle`/
      `ClaimProjection`, plus typed `SourceArtifact`/`OperationId` ingestion
      through `@beep/file-processing`. No loose helpers precede the contract.
- [ ] **P2 (implementation):** `IrToLaw` maps span-bearing `GroundedExtraction`
      records (keyed on the `label` vocabulary) → typed law entities, grounding
      the distinction's aligned `span` + original-case `matchedText` →
      `TextAnchor` → `Evidence(char-span)`. The `OfficeActionReview` orchestrator
      composes the HAVE ingestion bricks + the epistemic gate, emits one
      `Distinction(kind="missing_limitation")` as a `CandidateClaim`, gates
      it, projects it, and answers the trivial ask. Live Layer in
      `packages/law-practice/server`.
- [ ] **P2 (loop turns once, GREEN):** one integration test in
      `law-practice/use-cases` or `law-practice/server` runs the fixture
      through the orchestrator and asserts: (a) exactly one `Distinction`
      candidate is produced; (b) its `Evidence` carries non-empty
      `startChar`/`endChar` that re-slice the fixture text to the expected
      quote; (c) the gate admits it and the lifecycle reaches `shape_valid`;
      (d) the trivial ask returns the distinction + span. Bun test green.
- [ ] **P3 (verify/close):** `bun run check` clean for both new tiers, gating
      on **no NEW** failures vs the `@beep/schema` Bun-runtime baseline. No
      direct slice-to-slice internal imports. A closeout reflection exists.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/law-practice-office-action-spike/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/law-practice-office-action-spike/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/law-practice-office-action-spike` | Passes |
| Authoritative typecheck | `bun run check` | Green (no new failures) |
| Loop integration test | `bun test` on the office-action loop test | One distinction, char-span linked, gate admits, ask answers |
| No slice leakage | `rg -n 'from "@beep/epistemic-(domain\|use-cases\|server)' packages/law-practice/**/src` — every hit resolves to a canonical public subpath (root, `/values`, `/ClaimGate`, `/ClaimLifecycle`, `/ClaimProjection`, `/layer`); zero `/internal/*` | No internal imports; `packages/law-practice/domain/src` has zero hits |
| Reflection present | `bun run beep lint reflection-artifacts` | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- The `epistemic-claim-lifecycle-gate` public surface
  (`ClaimGate`/`ClaimLifecycle`/`ClaimProjection`, `Evidence(char-span)`) is
  not yet available — this packet hard-blocks on Packet A's P1+ surface.
- The implementation would exceed named scope (e.g. multi-ref §103, a real
  GraphRAG ask, FalkorDB, or the 7-source ontology grounding).
- The IR→law mapping cannot type a generic `Entity`/`Relation` into a law
  entity without product vocabulary leaking back into `@beep/nlp` — surface
  with evidence, do not widen the generic IR contract.
- Verification requires credentials, cost, destructive side effects, or
  policy approval not named in this spec.
- The same blocker repeats after reasonable investigation.

## Decision Log

Seeded from `explorations/atlas-synthesis/MAP.md` (§2/§3/§4/§5) and the locked
decisions (2026-06-17):

- **Two slice-owned packets, no `knowledge-law/*`.** This packet owns the
  IP-law product language + IR→law mapping + loop wiring + trivial view;
  `epistemic-claim-lifecycle-gate` owns the reusable boundary.
- **Sequencing: A first, then B.** A's reusable surface was routed to its
  correct homes by the `provenance-shared-claim-kernel` prep packet:
  `ClaimLifecycle` -> `@beep/shared-domain`, char-offset anchor -> `@beep/provenance`
  `TextAnchor`, unit-interval -> `@beep/schema`. B's `Distinction.lifecycleState`
  is typed from the shared-kernel `ClaimLifecycle` (making `law-practice-domain`
  the genuine second consumer that the promotion was sequenced for); B composes
  A's gate/projection mechanism only at the use-cases/server tier as a bounded
  exception. B's P1+ wiring hard-blocks on A.
- **TBox = bespoke Effect-Schema** in `law-practice/domain`; `@source` JSDoc
  light only; the 7-source ontology grounding is DEFERRED (`51` confirms all
  7 defer; no published ontology models claim/OA/rejection semantics).
- **First vertical slice is deliberately shallow:** one §102 / one claim /
  one ref / one distinction. No engine-perfecting before the loop turns once.
- **Privilege wall:** fixture is synthetic/public; USPTO OA Rejection API is
  a schema `@source` only.
- **Federation invariant baked in:** projection is a pure function over a
  single-owner local authority; `OfficeAction.matterId` modeled now,
  enforcement deferrable.
- **Acceptance gates on no NEW failures** vs the `@beep/schema` Bun-runtime
  baseline, not full-green.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| Direct cross-slice composition of the epistemic gate/projection | `law-practice-use-cases` + `law-practice-server` import the epistemic mechanism's public surface: `@beep/epistemic-use-cases` (`ClaimGate`/`ClaimLifecycle`/`ClaimProjection`), the entailed mechanism types from `@beep/epistemic-domain` (`CandidateClaim`, `Evidence`, `ClaimProjectionView`), and `@beep/epistemic-server/layer` (`EpistemicServerLive`) to drive the loop | law-practice slice | Doctrine routes cross-slice integration through `shared/use-cases` or events (`01-hexagonal-vertical-slices.md:71-74`), but a full shared contract for a one-fixture spike is premature; the bounded exception is the deliberate, documented choice per `standards/architecture/DECISIONS.md` (2026-06-18). The domain tier stays clean (foundation + shared-kernel only). | Extract a `shared/use-cases` contract (or emitted event) when a third consumer of the epistemic boundary appears. |
