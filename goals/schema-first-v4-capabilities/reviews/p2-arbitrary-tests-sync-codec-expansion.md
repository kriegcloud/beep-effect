# P2 Arbitrary-Tests Sync Codec Expansion

Date: 2026-06-08

## Summary

Hardened the `SFV4-arbitrary-tests` matcher in
`packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts` from an
async-only codec helper list to the full Effect v4 Schema codec family. The
first P2 slice only counted `decode*Effect` / `encode*Effect`,
`decode*Result` / `encode*Result`, and `decode*Option` codec calls, so the
most common unit-test idiom — the synchronous throwing codecs
`S.decodeUnknownSync` / `S.decodeSync` / `S.encodeUnknownSync` /
`S.encodeSync` — was invisible to the rule. That false-negative gap meant
schema-heavy value tests built entirely on sync codecs reported zero
advisories even though they had no schema-derived property coverage.

This is the sanctioned "harden or expand only after reviewing false positives
and remediation pilots" step from `SPEC.md`: 24 async-only Wave 3 pilots have
already been reviewed and the async-only slice was driven to zero, so
completing the matcher is the next enforcement increment.

## Effect v4 source grounding

Confirmed the full codec export surface before expanding the matcher:

- `.repos/effect-v4/packages/effect/src/Schema.ts` exports the symmetric
  decode/encode families: `decodeEffect` / `decodeUnknownEffect`,
  `decodeExit` / `decodeUnknownExit`, `decodeOption` / `decodeUnknownOption`,
  `decodeResult` / `decodeUnknownResult`, `decodePromise` /
  `decodeUnknownPromise`, `decodeSync` / `decodeUnknownSync`, and the matching
  `encode*` variants.
- `.repos/effect-v4/packages/effect/SCHEMA.md` documents
  `Schema.toArbitrary` as the source-of-truth path for property data.

The matcher now lists all 24 codec helpers (grouped by return type), so a
test that decodes/encodes a schema through any supported strategy counts
toward the advisory threshold.

## Live impact

The expanded matcher re-surfaced the synchronous-codec backlog. Running
`bun run beep lint schema-first` (no write) reported exactly 34 new untracked
`SFV4-arbitrary-tests` findings and no findings for any other rule — the
change is surgical to this rule. Live entries moved 333 → 367.

```text
[schema-first] live_entries=367
[schema-first] sfv4_arbitrary_tests_advisories=34
```

All 34 were written to `standards/schema-first.inventory.jsonc` with
`status: advisory` — the documented "surfaced candidate, not yet reviewed"
state, exactly how the async-only slice first inventoried its 17 candidates
before grinding them down. A clean run is green afterward
(`missing_entries=0`, `stale_entries=0`, exit 0); advisory counts do not fail
the lint.

## Candidate vs exception guidance for Wave 3

The 34 split into two reviewable groups. Per-file reclassification happens
during each file's Wave 3 pilot, not in this enforcement commit.

- Genuine schema-law candidates (decode/encode the schema under test): the
  `packages/foundation/modeling/schema/test/*` value tests (e.g.
  `Color`, `Duration`, `FilePath`, `Graph`, `Model`, `TypedArrays`),
  `packages/foundation/modeling/rdf/test/Rdf.test.ts`, and the
  `packages/foundation/capability/semantic-web/test/{IRI,URI,CanonicalizationSecurity}.test.ts`
  schemas. These should gain a `fc.property(S.toArbitrary(sourceSchema), law)`
  beside their fixtures.
- Likely future exceptions (sync codecs used as JSON-boundary / fixture
  plumbing rather than as the unit under test): the tooling CLI command tests
  (`tsconfig-sync`, `create-package`, `docgen`, `reuse-command`) and
  external-compat decoders (`repo-utils` `PackageJson` / `TSMorph` fixtures).
  For example `tsconfig-sync.test.ts` opens with
  `const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString)` — a test
  helper, not a schema-law assertion. These will most likely be inventoried as
  `exception` with a reason during their review.

## Tests

Added a focused lint test in
`packages/tooling/tool/cli/test/lint-command.test.ts`:
"reports SFV4 arbitrary-tests advisories for synchronous schema codec helpers",
which proves a static-only file using `S.decodeUnknownSync` / `S.decodeSync` /
`S.encodeSync` now emits the structured `SFV4-arbitrary-tests` advisory. The
existing async-only flagged/accepted tests remain unchanged and passing.

## Verification

```sh
bunx vitest run packages/tooling/tool/cli/test/lint-command.test.ts   # 25 passed
bunx tsc --noEmit -p packages/tooling/tool/cli/tsconfig.json          # exit 0
bun run beep lint schema-first --write                                # inventories 34 advisories
bun run beep lint schema-first                                        # exit 0, advisories tracked
bunx tsc -p scratchpad/tsconfig.json --pretty false                  # exit 0
bunx vitest run --config scratchpad/vitest.config.ts                  # 9 passed
```

## Still pending

- Wave 3 pilots grind the 34 advisories down one file at a time, with the
  candidate/exception decision made per file. The first pilot
  (`reviews/p4-httpstatus-arbitrary-pilot.md`) landed a derived round-trip law
  for `HttpStatus`, dropping the live count to 33.
## PR #223 review precision hardening (2026-06-09)

Two PR-review nits hardened the rule's precision; both have focused lint tests:

- Coverage now requires a schema-derived arbitrary
  (`S.toArbitrary` / `Schema.toArbitrary`). A bare
  `fc.property(fc.string(), ...)` over a hand-rolled arbitrary no longer
  suppresses the advisory (previously any `fc.*` counted as coverage).
- `isSchemaCodecCallExpression` now counts class-local static codec calls
  (`Model.decodeUnknownResult(...)`), not just `S.`/`Schema.` namespace calls,
  so migrating a test to the class-static API promoted by this initiative cannot
  silently drop below the threshold.

These surfaced 2 additional honest findings
(`apps/oip-web/test/oip-web.test.tsx`, `@beep/nlp` `Handoff/Contract.test.ts`),
inventoried as advisory; the live count is now 7. A dead `column` field on the
Yeet `SchemaFirstPolicyOutput` parser was also removed, and a brittle
fixed-seed scratch assertion was made seed-independent.
