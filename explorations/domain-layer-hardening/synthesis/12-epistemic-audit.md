# Phase 1 Audit — `epistemic` slice (12)

The worked hardening precedent — and the home of the authoritative memory
primitive (`claim + evidence + provenance + lifecycle`). Verdict: **best-in-repo
value objects, but the entities that carry the actual knowledge lean on
`UnknownRecord` snapshots and `fixtureKey` strings.** Citations `file:line` under
`packages/epistemic/domain/src/`.

## 1. Exemplars to propagate repo-wide (the gold standard)

| Artifact | Why it's the template | Cite |
|---|---|---|
| `ClaimLifecycle` (shared-promoted) | vocabulary in `@beep/shared-domain/values/ClaimLifecycle`, mechanism in epistemic; the promotion-record precedent | `values/ClaimLifecycle/ClaimLifecycle.model.ts:1-30` |
| `ClaimInvalidTransition` + `ClaimLifecycleError` union + `.between()` ctor | **THE typed-domain-error template** (`from`/`to` typed states, union, smart ctor) — this is the "1 typed error" the other slices lack | `values/ClaimLifecycle/ClaimLifecycle.errors.ts:30-77` |
| `EvidenceSpan` = `...TextAnchorFields` + `confidence: Confidence(UnitInterval)` | provenance substrate + epistemic judgment layered cleanly | `values/EvidenceSpan/EvidenceSpan.model.ts:76-84` |
| `ClaimGateResult` = `toTaggedUnion("verdict")(admitted{} \| rejected{violations})` | verdict-with-payload tagged union; engine-agnostic projection | `values/ClaimGate/ClaimGateResult.model.ts:99-106` |
| `UsageRecord` | **richest entity in the repo**: typed `activityId: ActivityId` ref, `actor: Principal`, cost/token/latency (`NonNegativeInt` + `OptionFromNullOr`), `credentialReference: OnePasswordReference`, `+ TurnFinalizationUsageAppend` boundary command | `entities/UsageRecord/UsageRecord.model.ts:32-132` |

## 2. Per-entity matrix

| Entity | Domain fields | Strengths | Gaps / proposed |
|---|---|---|---|
| `CandidateClaim` `entities/CandidateClaim/CandidateClaim.model.ts:34-38` | `lifecycle: ClaimLifecycle`, `snapshot: UnknownRecord`, `fixtureKey:String` | lifecycle typed | **the claim body is `UnknownRecord`** — the authoritative memory primitive is an opaque blob: no typed `subject`/`predicate`/`object` or assertion shape, no typed link to its `Evidence`, no `confidence`/`provenance` on the claim itself; `fixtureKey`→typed refs |
| `Evidence` `entities/Evidence/Evidence.model.ts:35-39` | `span: EvidenceSpan`, `artifactFixtureKey:String`, `spanFixtureKey:String` | `EvidenceSpan` provenance | relationships are `fixtureKey` strings → typed `EntityRef` to artifact + to the claim it supports; no `evidenceKind` (quote/paraphrase/citation/derived) |
| `Activity` `entities/Activity/Activity.model.ts:32-34` | `snapshot: UnknownRecord`, `fixtureKey:String` | provenance concept exists | **`snapshot: UnknownRecord`** — "provenance activity" modeled as an opaque blob; **prime PROV-O grounding target** (Activity/Entity/Agent, used/generated/wasAssociatedWith); no `activityKind`, no typed inputs/outputs, no `startedAt`/`endedAt`, no agent link |
| `UsageRecord` `entities/UsageRecord/UsageRecord.model.ts:34-48` | `activityId:ActivityId`(typed!), `actor:Principal`, cost/tokens/latency `NonNegativeInt?`, `credentialReference:OnePasswordReference?`, `model:String`, `provider:String`, `metadata:UnknownRecord` | **typed ref + Principal + observability** — the model to emulate | `model`/`provider`→literals or VOs; `metadata: UnknownRecord` could be tightened; otherwise exemplary |

## 3. The core epistemic gap — the claim is untyped

The product's authoritative primitive is `claim + evidence + provenance +
lifecycle`. Today the *lifecycle* and *provenance* are beautifully typed, but the
*claim* and the *activity* carry their substance in `UnknownRecord` snapshots
(`CandidateClaim.snapshot`, `Activity.snapshot`). This is the single highest-value
schema-first opportunity in the slice — and directly contradicts the
"schema is the source of truth" binding rule for the most important payload.

**Proposal (rubric 1✔ 2✔✔ 3✔ 4✔):** model a typed `ClaimBody`/`Assertion` value
object (subject–predicate–object or claim-text + typed structured fields), and a
typed `ActivityKind`/PROV-shaped `Activity` (inputs/outputs/agent/time). Regret if
omitted: every projection, gate, and query over claims rides on an opaque blob;
retyping after admitted claims exist is a data migration.

## 4. Cross-cutting epistemic gaps (rubric-scored)

| # | Proposal | Strategy | Rubric (1/2/3/4) | Recommend |
|---|---|---|---|---|
| E1 | Typed `ClaimBody`/`Assertion` VO to replace `CandidateClaim.snapshot: UnknownRecord` | schema-first / ontology | ✔/✔✔/✔/✔ | **Adopt — top priority; needs Phase-2 ontology grounding** |
| E2 | PROV-O-grounded `Activity` (kind, inputs/outputs, agent, start/end) replacing `snapshot` | provenance / event-sourcing | ✔/✔/✔(Phase2)/✔ | **Adopt — Phase-2 grounded** |
| E3 | `*FixtureKey:String` → typed `EntityRef` across `CandidateClaim`/`Evidence`/`Activity` (UsageRecord already does this right) | identity composition | ✔/✔✔/✔/✔ | **Adopt** |
| E4 | `EvidenceKind` literal (quote/paraphrase/citation/derived) on `Evidence` | matchable variants | ✔/✔/✔/✔ | **Adopt** |
| E5 | Promote `ClaimInvalidTransition` error *pattern* (smart ctor + union) as the repo-wide `.errors.ts` template | tagged errors | ✔/✔/✔/✔ | **Adopt as convention** |
| E6 | Attestation VO (kernel R6) on `CandidateClaim`/`Evidence` for tamper-evidence at admission | provenance | ✔/△/✔/✔ | **Adopt selectively** |
| E7 | `model`/`provider` on `UsageRecord` → literals/VOs (queryable cost analytics) | refinement | ✔/△/✔/✔ | **Adopt (cheap)** |

## 5. Open questions surfaced (→ `DECISIONS.md`)
- NEW (epistemic-critical): what is the typed shape of a **claim body**? SPO triple,
  claim-text + structured fields, or a tagged union of claim kinds? → **Phase-2
  ontology grounding is a hard dependency** (this is the product's core primitive).
- NEW: should `Activity` align to **PROV-O** (Entity/Activity/Agent + used/generated/
  wasAssociatedWith)? The ontology corpus + the `ontology-*` skills are the grounding.
- NEW: does `CandidateClaim` carry its own `confidence`/`provenance`, or only via
  linked `Evidence`? (affects the claim/evidence cardinality model.)
- Reuse: `UsageRecord`'s typed-`activityId` + `Principal` + `OptionFromNullOr`
  pattern is the entity template; law-practice/workspace should match it.
