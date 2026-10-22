# Epistemics Foundation Extraction Spec

## Objective

Move the tenant-free epistemic vocabulary out of the `@beep/epistemic-domain`
slice package into a new `foundation/modeling` package, `@beep/epistemics`, so
the party slice and other slices can build claims on shared vocabulary without
depending on epistemic product code. Governing decision:
`standards/architecture/DECISIONS.md`, "2026-10-21: Epistemic Vocabulary Is
Foundation; Party Is A Product Slice; Propositions Are Slice-Owned".

## Non-Goals

- Creating the party slice (`packages/party/*`). That is a follow-on goal that
  consumes this package.
- Moving the misfiled agent-authority values (`ExecutionGrant`, `GrantSet`,
  `ExecutionRecord`, `ExecutionVerdict`). They stay in `@beep/epistemic-domain`
  here and get their own home in a separate change. They must not move into
  `@beep/epistemics`.
- Changing any entity, table, migration, repository, or server Layer behavior.
  Persistence shapes and SQL are byte-identical after the extraction.
- Changing law-practice, professional-desktop, or semantica behavior beyond
  import paths.

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards, including the 2026-10-21
   decision above and `07-non-slice-families.md`.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files, plus
   `scratchpad/party/PARTY-DATA-MODEL.md` (design evidence).

Higher sources outrank lower sources when they conflict.

## Inventory (P0, 2026-10-21)

Every value module in `packages/epistemic/domain/src/values` is tenant-free
(no `ProductEntity`, no organization scope) and none imports an entity.
`ClaimLifecycle` is the exception to the move: it is shared-kernel vocabulary.

| Module | Moves to `@beep/epistemics` | Notes |
| --- | --- | --- |
| `ClaimGate` | yes (moved P1) | structural verdict; `admitted` is shape conformance, not truth |
| `ClaimLifecycle` | **no** | already promoted to `shared/domain` (promotion record; 2026-06-18 decision); the slice only re-exports it |
| `ClaimDispositionStatus` | yes (moved P1) | |
| `ClaimEvidenceReview` | **blocked: shared-kernel ids** (P1b) | imports `UserPrincipal` from `@beep/shared-domain/entity/Principal` and slice-local `EpistemicFixtureKey` |
| `ClaimProjection` | **blocked: shared-kernel ids** (P1b) | imports slice-local `EpistemicFixtureKey` |
| `EvidenceSpan` | yes (moved P1) | most imported subpath outside the slice (56 import sites) |
| `EvidenceVerification` (value) | **blocked: shared-kernel ids** (P1b) | imports `EvidenceId` from `@beep/shared-domain/identity/Epistemic`; the entity of the same name stays |
| `EdgeRelation` | yes (moved P1) | |
| `EdgeEndpoint` | **blocked: shared-kernel ids** (P1b) | imports `CandidateClaimId`, `EvidenceId` from `@beep/shared-domain/identity/Epistemic` |
| `LogicalEdgeIdentity` | **blocked: shared-kernel ids** (P1b) | imports `EdgeEndpoint` (transitive shared-kernel ids) |
| `Contradiction` (value) | **blocked: shared-kernel ids** (P1b) | imports `EvidenceId`, `EdgeVersionId` from `@beep/shared-domain/identity/Epistemic` (and slice `internal/PosInt`) |
| `ContradictionDetection` | **blocked: shared-kernel ids** (P1b) | imports `Contradiction` (transitive shared-kernel ids) |
| `EpistemicFixtureKey` | **no** (decided P1) | test/fixture vocabulary; stays slice-local |
| `ExecutionGrant`, `GrantSet`, `ExecutionRecord`, `ExecutionVerdict` | **no** | misfiled agent-authority values; separate change |

New in `@beep/epistemics` (not moves):

- `ValidInterval` `[validFrom, validTo)` and `KnowledgeInterval`
  `[recordedAt, expiredAt)`, extracted from the inline fields of the
  `EdgeVersion` entity, which then composes them with identical encoding
  (`DateTimeUtcFromMillis`, nullable ends).
- A generic `Claim<P>` / edge-version payload envelope parameterized by a
  slice-owned proposition schema and its logical-key function, and the
  `evidence-signals/v1` value envelopes (five signals, explicit absence,
  source dependence), matching the shapes proven in `scratchpad/party/Claim.ts`.

Stays in the epistemic slice: all eight entities (`Activity`, `CandidateClaim`,
`ClaimDisposition`, `Contradiction`, `EdgeVersion`, `Evidence`,
`EvidenceVerification`, `UsageRecord`), `@beep/epistemic-tables`,
`@beep/epistemic-use-cases`, `@beep/epistemic-server` and the client/ui/config
packages.

External importers to repoint (files): `scratchpad/effect-ontology` 35,
`apps/labs/semantica` 6, `apps/professional-desktop` 10,
`packages/law-practice/use-cases` 5, `packages/law-practice/server` 1,
`packages/_internal/db-admin` 2, `scratchpad/party` 1. `@beep/identity`
(`packages.ts`) and the repo CLI reference the package name only as a string;
they gain an entry for `@beep/epistemics`.

## Target Surfaces

- New `packages/foundation/modeling/epistemics`, created only with
  `bun run beep create-package`.
- `packages/epistemic/domain` (value modules removed or re-exported, entities
  repointed).
- Import sites listed in the inventory.
- `@beep/identity` package registry entry; architecture/package READMEs.

## Constraints

- `@beep/epistemics` passes the foundation gate in `07-non-slice-families.md`:
  no product semantics, no tenancy, no persistence, runtime-neutral root.
- The epistemic slice depends on `@beep/epistemics`, never the reverse.
- Schema-first and Effect v4 laws apply (`S.TaggedUnion` for inline tagged
  unions, `$I.annote` on checks, no `as`/`!`, effect collections).
- Encoded forms are unchanged: an `EdgeVersion` row written before the
  extraction decodes after it, proven by a round-trip test on fixtures.
- During migration, `@beep/epistemic-domain` may re-export moved values for
  one release; the re-exports are removed once all importers are repointed in
  this goal.

## Acceptance Criteria

- [ ] `@beep/epistemics` exists under `foundation/modeling`, created by
  `beep create-package`, with the four moved value modules (`ClaimGate`,
  `ClaimDispositionStatus`, `EvidenceSpan`, `EdgeRelation`), `ValidInterval`,
  `KnowledgeInterval`, `Claim<P>` envelope and evidence-signal envelopes.
- [ ] P1b: `EdgeEndpoint`, `LogicalEdgeIdentity`, `EvidenceVerification`,
  `Contradiction`, `ContradictionDetection`, `ClaimEvidenceReview` and
  `ClaimProjection` live in `@beep/epistemics` as factories over
  caller-supplied id schemas; `@beep/epistemic-domain` binds them to the
  shared-domain ids and their importers are repointed.
- [x] `EdgeVersion` composes `ValidInterval` and `KnowledgeInterval`; encoded
  rows are identical before and after (round-trip test).
- [x] No file outside `packages/epistemic/**` imports a moved value from
  `@beep/epistemic-domain`; the transitional re-exports are deleted.
- [x] `ExecutionGrant`, `GrantSet`, `ExecutionRecord`, `ExecutionVerdict` are
  untouched and absent from `@beep/epistemics`.
- [x] `bun run beep quality package-verify @beep/epistemics` and
  `@beep/epistemic-domain` pass.
- [x] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/epistemics-foundation-extraction/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/epistemics-foundation-extraction/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/epistemics-foundation-extraction` | Passes |
| Foundation package | `bun run beep quality package-verify @beep/epistemics` | Passes |
| Slice package | `bun run beep quality package-verify @beep/epistemic-domain` | Passes |
| No stale imports | `rg -n '@beep/epistemic-domain/values/(ClaimGate\|ClaimDispositionStatus\|EvidenceSpan\|EdgeRelation)\b' --glob '!packages/epistemic/**'` | No matches |
| Row compatibility | `EdgeVersion` encode/decode round-trip test on pre-extraction fixtures | Passes |

## Stop Conditions

- Required source files are missing or materially contradictory.
- Any spend: purchases, paid services, quota top-ups or plan changes need the
  operator.
- The same blocker repeats after reasonable investigation.

Scope growth, destructive side effects and policy calls are not stops: decide
them and record each in the Decision Log.

## Decision Log

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-21 | Package name `@beep/epistemics` under `foundation/modeling` | Vocabulary, not a capability service; modeling is the schema substrate family | Rename via `create-package` before first release |
| 2026-10-21 | Agent-authority values excluded from the move | Not epistemics; moving them would bake a misfiling into foundation | Include them in a later goal if a review decides otherwise |
| 2026-10-21 | Intervals extracted as new values rather than left inline | Party and other slices need the same `[from, to)` semantics; inline fields can't be shared | Inline the fields back into `EdgeVersion` |
| 2026-10-21 | P1 moves only `ClaimGate`, `ClaimDispositionStatus`, `EvidenceSpan`, `EdgeRelation` | The other seven import shared-kernel ids directly or transitively (see Inventory); a byte-for-byte move cannot drop them | Superseded for the seven by the P1b row below |
| 2026-10-22 | P1b: id-bearing values (`EdgeEndpoint`, `LogicalEdgeIdentity`, `EvidenceVerification`, `Contradiction`, `ContradictionDetection`, `ClaimEvidenceReview`, `ClaimProjection`) become factories over caller-supplied id schemas in `@beep/epistemics`, e.g. `makeEdgeEndpoint({ evidence, candidate })`. `@beep/epistemic-domain` binds them to the shared-domain ids; the party slice binds its own. Operator ruling 2026-10-22 | Foundation may not depend on the shared kernel (`standards/ARCHITECTURE.md:692`); parameterizing keeps product identity out of foundation | Move the shared-domain id brands into foundation instead |
| 2026-10-21 | `EpistemicFixtureKey` stays slice-local | Test/projection fixture vocabulary for slice read models, not cross-slice epistemics; no moved module needs it once `ClaimProjection`/`ClaimEvidenceReview` stay | `git mv` it to `@beep/epistemics` together with `ClaimProjection` |
| 2026-10-21 | No `CanonicalJson` copy in `@beep/epistemics` | None of the four moved modules uses `values/internal/CanonicalJson.ts`; it stays in the slice for `Contradiction`, `ContradictionDetection`, `EvidenceVerification`, `GrantSet`, `ExecutionRecord` | Add an internal copy (or a foundation helper) when a module that needs it moves |
| 2026-10-21 | Moved schema identities change from `@beep/epistemic-domain/values/<M>/...` to `@beep/epistemics/<M>/...` | Identities are annotations only: no persisted row, snapshot, table or fixture carries them (rg over the repo, `*.snap` none) | Re-annotate with `$EpistemicDomainId` |
| 2026-10-21 | Explicit `./<M>` export subpaths per module directory | The scaffold's `./*` maps to `src/*.ts`; moved modules keep their `src/<M>/index.ts` layout | Flatten modules to `src/<M>.ts` and drop the explicit entries |
| 2026-10-21 | `EdgeVersion` composes the interval fields per key (`ValidIntervalFields.validFrom.pipe(pg...)`) rather than an object spread | The entity must keep its `pg.bigint`/`pg.columnName` column metadata, which foundation may not carry; piping onto the shared field keeps one definition of schema and description. Round-trip test passes against both the pre-change and the new model | Inline the four field schemas back into `EdgeVersion` |
| 2026-10-21 | Historical records left unedited: `explorations/semantica-lab/research/effect-ontology-map.md`, `goals/jsdoc-carrier-migration/data/extract.jsonl` | They record past state, not live imports | None needed |

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| Transitional re-exports from `@beep/epistemic-domain` | moved value modules | this goal | keeps importers compiling while they are repointed | all importers repointed (acceptance criterion 3); P1 never added any: the four moved modules were repointed in place |
| Seven id-bearing value modules stay in `@beep/epistemic-domain` until P1b | `EdgeEndpoint`, `LogicalEdgeIdentity`, `EvidenceVerification`, `Contradiction`, `ContradictionDetection`, `ClaimEvidenceReview`, `ClaimProjection` | this goal | foundation may not import `@beep/shared-domain` | P1b factories land and the slice binds them (P1b acceptance criterion) |
