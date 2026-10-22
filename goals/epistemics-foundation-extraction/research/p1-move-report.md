# P1 Value Move Report (2026-10-21)

Scope: P1 steps 1, 2, 3 and 5 (the `Claim<P>` / evidence-signal envelopes,
step 4, belong to another lane). The tree is left dirty and uncommitted.

## Blocker: seven modules cannot move

Seven of the eleven listed value modules import the shared kernel, directly or
transitively. `standards/ARCHITECTURE.md` ("Slice Consumption Rules") says
foundation does not depend on product slices or the shared kernel, and no
foundation package depends on `@beep/shared-*`.

| Module | Blocking import |
| --- | --- |
| `EdgeEndpoint` | `@beep/shared-domain/identity/Epistemic` (`CandidateClaimId`, `EvidenceId`) |
| `LogicalEdgeIdentity` | `EdgeEndpoint` (transitive) |
| `EvidenceVerification` (value) | `@beep/shared-domain/identity/Epistemic` (`EvidenceId`) |
| `Contradiction` (value) | `@beep/shared-domain/identity/Epistemic` (`EvidenceId`, `EdgeVersionId`), slice `internal/PosInt` |
| `ContradictionDetection` | `Contradiction` (transitive) |
| `ClaimEvidenceReview` | `@beep/shared-domain/entity/Principal` (`UserPrincipal`), slice `EpistemicFixtureKey` |
| `ClaimProjection` | slice `EpistemicFixtureKey` |

These modules stayed in `@beep/epistemic-domain` unchanged, apart from their
relative imports of moved modules (now `@beep/epistemics/<M>`). A move would
need either a foundation exception to the shared-kernel rule or a redesign that
parameterizes the ids. The redesign changes behavior, so it is not a move. This
is recorded in the SPEC Decision Log and Exception Ledger.

## Moved (`git mv`, history preserved)

`packages/epistemic/domain/src/values/<M>/` to
`packages/foundation/modeling/epistemics/src/<M>/`:

- `ClaimGate/` (`ClaimGateResult.model.ts`, `index.ts`)
- `ClaimDispositionStatus/` (`ClaimDispositionStatus.model.ts`, `index.ts`)
- `EvidenceSpan/` (`EvidenceSpan.model.ts`, `index.ts`)
- `EdgeRelation/` (`EdgeRelation.model.ts`, `index.ts`)

Only three things changed in the moved files:

- `$EpistemicDomainId` became `$EpistemicsId`.
- The identity path lost its `values/` prefix.
- JSDoc example imports now use `@beep/epistemics/<M>`.

No module-level tests were moved, because the slice has no dedicated test
files for these four modules. Their assertions live in the mixed
`EpistemicDomain.test.ts`, which stays in the slice and now imports through
`@beep/epistemics/*`.

## Created

- `src/ValidInterval/{ValidInterval.model.ts, ValidInterval.behavior.ts, index.ts}`:
  `ValidIntervalFields`, `ValidInterval`, and dual `holdsAt(interval, at)`
  over `[validFrom, validTo)`.
- `src/KnowledgeInterval/{KnowledgeInterval.model.ts, KnowledgeInterval.behavior.ts, index.ts}`:
  `KnowledgeIntervalFields`, `KnowledgeInterval`, and dual `knownAt(interval, asOf)`
  over `[recordedAt, expiredAt)`.
- The fields are `S.DateTimeUtcFromMillis` for lower bounds and
  `S.DateTimeUtcFromMillis.pipe(S.OptionFromNullOr)` for upper bounds. Each
  carries the exact `annotateKey` description from `EdgeVersion`.
- `src/index.ts`: the root barrel, with all six modules.
- `test/Interval.test.ts`: boundary and open-end cases, data-last form,
  spread-into-row round-trip.
- `packages/epistemic/domain/test/EdgeVersionRowCompat.test.ts`: two encoded
  `EdgeVersion` rows (open and closed intervals) that decode and re-encode to
  `toStrictEqual` the input. The test passes against the new model. It also
  passes against the HEAD model, with only its `EdgeRelation` import swapped,
  run temporarily and then restored.
- `package.json`: explicit `./<M>` subpaths for the six modules (src and
  publishConfig). Dependencies are `@beep/identity`, `@beep/provenance`,
  `@beep/schema`, `effect`. Dev dependency `@beep/test-runner`.

`EdgeVersion.model.ts` now composes the interval fields one key at a time, for
example `ValidIntervalFields.validFrom.pipe(pg.bigint("number"), pg.columnName("valid_from"))`.
It does not use an object spread. The entity has to keep its pg column
metadata, and that metadata may not live in foundation.

## Importers repointed (files)

| Workspace | Files |
| --- | ---: |
| `scratchpad/effect-ontology` | 35 |
| `apps/labs/semantica` | 6 |
| `apps/professional-desktop` | 1 |
| `packages/law-practice/use-cases` | 1 |
| `packages/epistemic/domain` | 8 + 4 relative-import fixes |
| `packages/epistemic/use-cases` | 7 |
| `packages/epistemic/server` | 5 |
| `packages/epistemic/tables` | 4 |
| `packages/epistemic/ui` | 2 |

Imports came from two places, and both were repointed:

- The `@beep/epistemic-domain/values/<M>` subpaths.
- Moved symbols imported through the `@beep/epistemic-domain` and
  `@beep/epistemic-domain/values` barrels. Those import clauses were split.

The SPEC's other counts concern the seven modules that did not move. These
workspaces still import those modules from the slice, in files:

| Workspace | Files |
| --- | ---: |
| `apps/professional-desktop` | 1 |
| `packages/_internal/db-admin` | 1 |
| `packages/epistemic/*` | 39 |

## Deleted from `@beep/epistemic-domain`

- The `./values/{ClaimGate,ClaimDispositionStatus,EvidenceSpan,EdgeRelation}`
  export subpaths.
- Their `export *` blocks in `src/values/index.ts`, so neither the root barrel
  nor the values barrel re-exports them.
- The root barrel's JSDoc example now uses `ClaimLifecycle`.

No transitional re-exports were added at any point.

`@beep/epistemics` was added as a dependency to these workspaces:

- `packages/epistemic/{domain,use-cases,server,tables}`
- `packages/epistemic/ui` (devDependencies only, because it is imported only
  from tests and stories)
- `packages/law-practice/use-cases`, `apps/labs/semantica`,
  `apps/professional-desktop`, `scratchpad`

## Decisions

All are recorded in the SPEC Decision Log:

- Only four modules moved.
- `EpistemicFixtureKey` stays in the slice.
- `@beep/epistemics` has no `CanonicalJson` copy, because none of the moved
  modules uses it. No duplication and no Exception Ledger row were needed.
- Identity strings changed. They are annotations only, and nothing persists or
  snapshots them.
- Each module directory gets an explicit export subpath.
- `EdgeVersion` composes the interval fields one key at a time.
- Historical records were left unedited.

## Verification

- `bun run beep quality package-verify @beep/epistemics`: rc=0, `ok audit 14.2s ok docgen 2.4s`.
- `bun run beep quality package-verify @beep/epistemic-domain`: rc=0, `ok audit 8.9s ok docgen 3.6s`.
- `package-verify` (full) on the other repointed workspaces, all `ok audit` and
  `ok docgen` except where noted:
  - `@beep/epistemic-use-cases`
  - `@beep/epistemic-tables`
  - `@beep/epistemic-server`
  - `@beep/epistemic-ui`
  - `@beep/law-practice-use-cases`
  - `@beep/semantica` (docgen skipped)
  - `@beep/professional-desktop`
- `bun run beep tsconfig-sync --check`: `no drift detected`.
- `bun run beep lint package-scripts`: `178 manifests, 0 drifting`.
- `rg '@beep/epistemic-domain/values/(ClaimGate|ClaimDispositionStatus|EvidenceSpan|EdgeRelation)\b'`:
  the only remaining matches are the two historical records named above. The
  full 11-module pattern still matches 207 lines, all of them imports of the
  seven modules that stayed.
- `scratchpad` typecheck (`tsc -p scratchpad/tsconfig.json`) shows 354
  pre-existing errors. None is on a changed line, and none is a
  module-resolution or missing-export error (TS2305/2307/2614/2724).
- Seven touched `scratchpad/effect-ontology` test files: 35/36 pass.
  `GroundingProvenance.test.ts` "satisfies identity, commutativity, and
  associativity" fails with `Exhausted`. It fails identically on a HEAD
  checkout (temporary sibling worktree, since removed), so the failure is
  inherited.
- Dependency dists were built first with `turbo run build --filter=<pkg>^...`
  (121 tasks), because the fresh lane gave TS6305 errors.

## Not done / for the lead

- The seven blocked modules (above).
- `standards/jsdoc-documentation.inventory.{md,jsonc}` still lists
  `src/values/EvidenceSpan/EvidenceSpan.model.ts` under `@beep/epistemic-domain`.
  Running `bun run jsdoc:inventory` regenerated about 285k lines of unrelated
  drift, so I reverted that and left the regeneration to `yeet repair`.
- `packages/foundation/modeling/identity/src/packages.ts`: the scaffold's
  `"runtime-env", "epistemics"` line was biome-formatted onto two lines.

## Addendum (lead rulings, 2026-10-22)

- Option (a) confirmed: the four-module scope stands; the seven id-bearing
  modules and `EpistemicFixtureKey` stay in `@beep/epistemic-domain` untouched.
- SPEC updated: the Inventory marks the seven "blocked: shared-kernel ids"
  with the exact import; acceptance criterion 1 is narrowed to the four
  modules; a P1b criterion and the operator's P1b Decision Log row
  (factories over caller-supplied id schemas, e.g. `makeEdgeEndpoint`) are
  added; the stale-import regex covers the four moved modules only. P1b is not
  implemented.
- The narrowed regex (`--glob '!packages/epistemic/**'`, TypeScript sources)
  returns 0 matches.

## P1b

All seven id-bearing values are now factories in `@beep/epistemics`. Each
slice module under `packages/epistemic/domain/src/values/<M>/` is a binding
over the shared-domain ids. Every export name and subpath is unchanged, so no
importer was edited.

### Shape (operator ruling (a), 2026-10-22)

- **Builders and behavior factories.** Foundation exports generic schema
  builders and behavior factories that are generic over the bound classes.
  Each binding module declares its own `S.Opaque` classes from the builders,
  in dependency order: EdgeEndpoint → LogicalEdgeIdentity, and Contradiction →
  ContradictionDetection. A class over a generic base fails with TS2509, so no
  factory declares one.
- **`@beep/epistemics/Factory`** exports:
  - `IdCodec`: `S.Top & { readonly Type: string | number }`.
  - `SchemaIdentity`: `IdentityComposer<string>`.
  - `FieldSchema<T, E, MakeIn, Rebuilt>` and `KeyedFieldSchema<T, E, MakeIn>`.
    A builder types a parameter this way when its own checks or behavior read
    the parameter's values. All four types are inferred from the bound schema.
    This keeps the struct's `Type` resolvable inside the generic factory.
- **Exported directly (no identity):** constants, `makeValidIntervalCheck`,
  `encodeEdgeEndpointKey`, `canonicalDetectionJson`,
  `ExactNegationConfidence` and `ValueConflictConfidence`.
- **Built by vocabulary factories (carry the caller's `$I`):** the id-free
  schemas that carry an identity, from `makeContradictionVocabulary` and
  `makeContradictionDetectionVocabulary`.
- **`PosInt`:** passed in by the binding, because its identifier is part of
  the listing.
- **Evidence ids:** behavior takes `evidenceIdOrder` and arbitraries take
  `makeEvidenceId` from the binding. The epistemic binding keeps the
  `${id}`-string order, because its digests depend on it. Foundation never
  assumes an id encoding.
- **CanonicalJson:** copied to `@beep/epistemics/src/internal/CanonicalJson.ts`.
  The slice copy stays for `GrantSet` and `ExecutionRecord`; this is recorded
  in the Exception Ledger.

### Files

Foundation (`packages/foundation/modeling/epistemics`):

- `src/Factory/`
- `src/EdgeEndpoint/`
- `src/LogicalEdgeIdentity/`
- `src/EvidenceVerification/`
- `src/ClaimProjection/`
- `src/ClaimEvidenceReview/`
- `src/Contradiction/`
- `src/ContradictionDetection/`
- `src/internal/CanonicalJson.ts`
- Root barrel entries and `./<M>` export subpaths.
- Dependencies `@beep/utils` and `@noble/hashes`.

Slice (`packages/epistemic/domain`):

- Seven binding modules.
- `ClaimEvidenceReview.behavior.ts` merged into the model binding. The
  subpath and export names are unchanged.

### Proof

- **Tests.** The existing tests in `packages/epistemic/**` were not edited.
  - `@beep/epistemic-domain`: 12 files, 103 tests, pass.
  - The use-cases, tables, server and ui packages pass in package-verify.
- **Types.** `packages/epistemic/domain/test/FactoryBinding.types.test.ts`
  asserts that the bound `EdgeEndpoint` type equals the pre-factory
  definition, for both `Type` and `Encoded`. It does the same for
  `BeliefVersionRef`'s fields and `Encoded`. A negative probe confirmed that
  the `Equals` assertion rejects a mismatch.
- **Second binding.** `packages/foundation/modeling/epistemics/test/Factories.test.ts`
  binds every factory to local branded string ids under `$EpistemicsId`
  `test/party/*`. It checks that the bound schemas decode, check, seal,
  canonicalize and generate valid arbitraries, and that identifiers differ
  between two bindings. `@beep/epistemics` runs 5 test files, 26 tests, all
  passing.
- **Identifiers.**
  - `packages/epistemic/domain/test/ValueSchemaIdentifiers.test.ts` lists
    every schema identifier reachable from the seven bound modules' exports,
    258 lines. It compares them to `test/fixtures/value-schema-identifiers.txt`.
  - I regenerated the listing on a temporary d0d3ddb225 checkout, since
    removed. `cmp` against the fixture is byte-identical, with a diff count
    of 0.
  - The current tree matches the same fixture.

### Verification

- `package-verify` (full):
  - `@beep/epistemic-domain`: ok audit, ok docgen.
  - `@beep/epistemic-use-cases`, `@beep/epistemic-tables`,
    `@beep/epistemic-server`, `@beep/epistemic-ui`: ok audit, ok docgen.
  - `@beep/epistemics`: build, check, tests, laws and docgen pass. `beep:lint`
    fails on 7 biome formatting diagnostics, all in the lead's
    `src/Claim/Claim.behavior.ts`, `src/Claim/Claim.model.ts` and
    `test/Claim.test.ts`, which I did not touch.
- `package-verify --quick` on the other importers of these modules:
  `@beep/professional-desktop`, `@beep/law-practice-server`, `@beep/db-admin`.
  All report ok lint and ok check.
- `bun run beep tsconfig-sync --check`: `no drift detected`.
- `bun run beep lint package-scripts`: `178 manifests, 0 drifting`.

### Notes

- **Inherited P0.** The checkout's Yeet inbox carries a
  `package:@beep/repo-cli:lint` row (`local-shard-8e1c96d7ce02`) that this
  lane did not cause. I left it unacknowledged for the orchestrator.
- **beep-heavy.** In these `zsh -ic` shells, `beep-heavy` resolved to a bash
  without `compgen`. I ran it as `/usr/bin/bash ~/.local/bin/beep-heavy`.
