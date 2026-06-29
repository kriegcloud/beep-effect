# Phase 1 Audit — `law-practice` slice (11)

Highest-value, least-hardened slice. Headline: **it is a fixture-seed proof
slice, not a real domain yet** — graduated from `law-practice-office-action-spike`.
It splits in two: a **rich office-action core** (`Rejection`, `Distinction`) that
exemplifies the hardening targets, and **thin placeholder scaffolding**
(everything else). Citations `file:line` under
`packages/law-practice/domain/src/entities/`.

## 1. The fixture-seed smell (the biggest single gap)

Every entity carries `fixtureKey: S.String` and references siblings by
`<sibling>FixtureKey: S.String` — **string keys, not typed references**:

| Entity | Relationship fields (all `S.String`) |
|---|---|
| `Matter` | `legalClientFixtureKey` |
| `OfficeAction` | `matterFixtureKey`, `patentAssetFixtureKey`, `applicationNumber` |
| `PatentAsset` | `matterFixtureKey` |
| `Claim` | `patentAssetFixtureKey` |
| `Rejection` | `claimFixtureKey`, `officeActionFixtureKey` |
| `Distinction` | `claimFixtureKey`, `rejectionFixtureKey` |
| `PriorArtReference` | `officeActionFixtureKey` |
| `LegalContact` | `legalClientFixtureKey` |

**Recommendation (rubric 1✔ 2✔✔ 3✔ 4✔):** replace `*FixtureKey: S.String` with
typed `EntityRef`/branded `EntityId` foreign keys (`EntityRef` already exists in
`@beep/shared-domain`). Regret-if-omitted is the highest in the whole initiative:
every join, integrity check, and query today rides on untyped strings; retrofitting
referential typing after data exists is a migration, not an edit. Keep a separate
`fixtureKey` only as a *seed-import* concern (or move it to a fixtures/test layer),
not as the domain relationship.

## 2. Per-entity matrix

| Entity | Domain fields (non-base) | Refinements | Strengths | Gaps / proposed |
|---|---|---|---|---|
| `Matter` `Matter.model.ts:32-37` | `displayName:String`, `matterType:MatterType`, `fixtureKey`, `legalClientFixtureKey` | none | the "matter wall" anchor | **aggregate-root candidate (Q6)**; `displayName`→`NonEmptyString`; `MatterType` is 1-value placeholder; no `status`/lifecycle, no `docketNumber`, no `jurisdiction`, no `responsibleAttorney` (Principal/party), no `openedAt/closedAt` |
| `OfficeAction` `OfficeAction.model.ts:33-38` | `applicationNumber:String`, 3× fixtureKeys | none | matter-wall pinning | **no `mailingDate`, no `responseDueDate`, no `examiner`, no `artUnit`, no `actionType` (non-final/final/advisory)** — critical for the docketing-adjacent vertical; `applicationNumber`→VO with format |
| `Claim` `Claim.model.ts:33-38` | `claimNumber:NonNegativeInt`, `text:String`, `independent:Boolean`, `patentAssetFixtureKey` | NonNegativeInt | claimNumber typed; independent flag | `text`→`NonEmptyString`; no `dependsOnClaimId` (claim dependency graph — currently only a boolean); no `status` (pending/allowed/rejected/cancelled) |
| `Rejection` `Rejection.model.ts:35-39` | `ground:RejectionGround`(jsonb), 2× fixtureKeys | tagged union | **EXEMPLARY: `RejectionGround` encodes prior-art cardinality per statute (§102=1 ref, §103=≥1+rationale, §101/§112=0)** `Rejection.values.ts:39-49` | references prior art by string; could carry `examinerRemarks` anchor; otherwise the model to emulate |
| `Distinction` `Distinction.model.ts:39-46` | `anchor:TextAnchor`, `detail:DistinctionDetail`, `lifecycleState:ClaimLifecycle`, 2× fixtureKeys | tagged union | **EXEMPLARY: uses `TextAnchor` provenance + `ClaimLifecycle` + extensible `DistinctionDetail` union** | the only entity wired to the hardening precedents; `DistinctionKind` is 1-value placeholder |
| `PatentAsset` `PatentAsset.model.ts:32-36` | `title:String`, `status:PatentAssetStatus`, `matterFixtureKey` | none | status literal present | `title`→`NonEmptyString`; `PatentAssetStatus` 1-value placeholder; **no `applicationNumber`/`patentNumber`/`publicationNumber` VOs, no `filingDate`/`grantDate`, no `inventors`/`assignee` (party), no `kind` (utility/design/plant/provisional/PCT)** |
| `PriorArtReference` `PriorArtReference.model.ts:32-37` | `documentNumber:String`, `title:String`, `officeActionFixtureKey` | none | — | `documentNumber`→VO (patent-pub vs NPL); no `kind` (patent/NPL), no `publicationDate`, no `inventors`/`assignee`, no `uri` |
| `LegalClient` `LegalClient.model.ts:32-35` | `displayName:String`, `status:LegalClientStatus`, `fixtureKey` | none | status literal present | **party-model candidate** (person vs org); `displayName`→`NonEmptyString`; `LegalClientStatus` 1-value placeholder; no contact info, no `clientType`, no conflict-check metadata |
| `LegalContact` `LegalContact.model.ts:32-36` | `displayName:String`, `role:LegalContactRole`, `legalClientFixtureKey` | none | role literal present | **party-model candidate**; `LegalContactRole` 1-value placeholder (`founder` only); no email/phone VOs, no `isPrimary` |

## 3. Vocabulary thinness — every literal is a 1-value placeholder

| Literal | Current | Needs (Phase-2 grounded) |
|---|---|---|
| `MatterType` `Matter.values.ts:26` | `["patent_application"]` | utility / design / plant / provisional / PCT-national-phase / continuation / divisional / trademark / litigation … |
| `PatentAssetStatus` `PatentAsset.values.ts:26` | `["pre_filing"]` | pre_filing / filed / published / under_examination / allowed / granted / abandoned / expired / maintenance_due |
| `LegalClientStatus` `LegalClient.values.ts:26` | `["active_client"]` | prospect / active / inactive / former / conflicted |
| `LegalContactRole` `LegalContact.values.ts:26` | `["founder"]` | founder / inventor / in_house_counsel / billing / signatory / assignee_rep … |
| `DistinctionKind` `Distinction.values.ts:14` | `["missing_limitation"]` | missing_limitation / teaching_away / non_analogous_art / unexpected_results / no_motivation_to_combine … |

These were sized for the spike's proof seeds; real vocabularies are a Phase-2
deliverable. **Strategy:** keep `LiteralKit`; many of these should become
`LiteralKit.toTaggedUnion` where payload differs per case (e.g. PCT carries a
national-phase deadline; granted carries a patent number).

## 4. Cross-cutting law-practice gaps (rubric-scored)

| # | Proposal | Strategy | Rubric (1/2/3/4) | Recommend |
|---|---|---|---|---|
| L1 | `*FixtureKey:String` → `EntityRef`/`EntityId` typed references | identity composition | ✔/✔✔/✔/✔ | **Adopt — top priority** |
| L2 | Patent identifier VOs: `ApplicationNumber`, `PatentNumber`, `PublicationNumber` (format-refined) | value objects | ✔/✔/✔/✔ | **Adopt** |
| L3 | `OfficeAction` dates+meta: `mailingDate`, `responseDueDate`, `examiner`, `artUnit`, `actionType` | temporal + narrowing | ✔/✔✔/✔/✔ | **Adopt** (ties to `solo-firm-docketing`) |
| L4 | Real vocabularies for the 5 placeholder literals | matchable variants | ✔/✔/✔(Phase2)/✔ | **Adopt** |
| L5 | `Matter` as **aggregate root** (matter wall = consistency boundary) | aggregate | ✔/✔/✔/✔ | **Adopt** (Q6) |
| L6 | Party data model for `LegalClient`/`LegalContact` (person vs org, roles, relationships) | party model | ✔/✔/✔(Phase2)/✔ | **Adopt — needs Phase-2 grounding** |
| L7 | `.errors.ts` typed failures (e.g. `RejectionWithoutGround`, `DistinctionOutOfLifecycle`, `MatterWallViolation`) | tagged errors | ✔/✔/✔/✔ | **Adopt** |
| L8 | Narrow bare `S.String` → `NonEmptyString`/VO across `displayName`/`title`/`text` | refinement | ✔/✔/✔/✔ | **Adopt (cheap, high signal)** |
| L9 | `Claim.dependsOnClaimId` (claim dependency graph) beyond the `independent` boolean | identity composition | ✔/△/✔/✔ | **Adopt** |
| L10 | Soft-delete inherited from `BaseEntity` R1 (matters/clients are retained, never hard-deleted — retention/privilege) | soft-delete | ✔/✔/✔/✔ | **Adopt via kernel R1** |

## 5. What to emulate (already-hardened exemplars in this slice)
- `RejectionGround` — discriminator carrying case-specific payload + cardinality.
  This is the template for L4's tagged-union vocabularies.
- `Distinction` — `TextAnchor` provenance + `ClaimLifecycle` state + extensible
  `DistinctionDetail`. The template for wiring provenance + lifecycle into entities.

## 6. Open questions surfaced (→ `DECISIONS.md`)
- Q6 aggregate roots → **Matter is an aggregate root** (matter wall); OfficeAction
  may be a sub-aggregate. Confirm boundary (does Claim belong to PatentAsset or Matter?).
- NEW: is `fixtureKey` a domain field or a seed-import concern? **Recommend: move
  it out of the domain model** (fixtures/test layer), replace relationships with L1.
- NEW: where does patent-bibliographic data (inventors/assignee/dates) live —
  expand `PatentAsset`, or a new `PatentPublication`/party model? (Phase-2.)
- NEW: should `OfficeAction.responseDueDate` reuse the `solo-firm-docketing`
  deadline modeling rather than a bare date? (cross-packet.)
