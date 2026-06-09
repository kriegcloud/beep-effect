# P4 HttpStatus Arbitrary Pilot

Date: 2026-06-08

## Summary

First Wave 3 remediation pilot against the synchronous-codec backlog
re-surfaced by the `SFV4-arbitrary-tests` hardening (see
`reviews/p2-arbitrary-tests-sync-codec-expansion.md`).
`packages/foundation/modeling/schema/test/HttpStatus.test.ts` previously held
only static fixtures built on `S.decodeSync` / `S.encodeSync`, so the hardened
rule flagged it as a schema-heavy static-only test. The pilot adds a
schema-derived property law beside the existing fixtures.

## Change

`HttpStatus.Schema` is a bijective `MappedLiteralKit` mapping status names
(`Encoded`, e.g. `"NotFound"`) to status codes (`Type`, e.g. `404`).
`S.toArbitrary(HttpStatus.Schema)` therefore generates the finite status-code
domain deterministically — no filtering, no flake risk. The new test:

```ts
const decode = S.decodeSync(HttpStatus.Schema);
const encode = S.encodeSync(HttpStatus.Schema);
const arbitrary = S.toArbitrary(HttpStatus.Schema);

fc.assert(
  fc.property(arbitrary, (code) => {
    const name = encode(code);
    expect(typeof name).toBe("string");
    expect(decode(name)).toBe(code);
  }),
  { numRuns: 50 }
);
```

proves the name↔code mapping round-trips across every code derived from the
source schema, complementing the existing exact-value fixtures (which stay as
golden anchors for specific codes). The arbitrary is derived from the existing
source schema; no weaker test-only schema was introduced.

## Effect v4 grounding

- `effect/testing` exposes `FastCheck`, re-exported as `fc` (matching the
  repo's `Sha256` / `LocalDate` pilots).
- `.repos/effect-v4/packages/effect/src/Schema.ts` exports `toArbitrary`.

## Verification

```sh
bunx vitest run --config vitest.config.ts test/HttpStatus.test.ts   # 3 passed
bun run beep lint schema-first --write                              # arbitrary-tests 34 -> 33
bun run beep lint schema-first                                      # exit 0, missing/stale 0
```

The live `SFV4-arbitrary-tests` advisory count dropped from 34 to 33 and the
HttpStatus advisory entry was removed from the inventory as resolved.

## Notes for the remaining 33

Continue selecting structurally-clean schema-value tests first (literal /
`MappedLiteralKit` / branded-primitive domains decode reliably). Defer
filter-heavy refinement schemas (e.g. `Glob`, whose Bun-parser refinement makes
`S.toArbitrary` generation slow) until they get a source-schema `toArbitrary`
annotation. Reclassify CLI-behavior and external-compat decoders
(`tsconfig-sync`, `create-package`, `repo-utils` `PackageJson` / `TSMorph`) as
`exception` during their review rather than forcing property tests.
