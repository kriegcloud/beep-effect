# P4 Wave 3 Source `toArbitrary` Annotations (orchestrated)

Date: 2026-06-08

## Summary

Second orchestrated batch over the deferred `SFV4-arbitrary-tests` candidates
whose source schemas needed a `toArbitrary` annotation before a property test
could derive valid data. A workflow attempted 8 regex string-brand candidates;
each agent added a source-schema `toArbitrary` annotation (matching the repo
idiom in `Sha256.ts`), a property test, then verified and reverted if the
source was not a clean pure-regex brand.

Outcome: **3 remediated**, **5 correctly reverted** (left deferred).

## Remediated (3)

Each adds `.annotate({ toArbitrary: () => (fc) => fc.stringMatching(/.../) })` to
the source brand using a regex identical to the brand's own `isPattern` /
pattern check, plus a property test asserting `decode(value) === value` and a
format match. No Type/Encoded/brand/check/decode/encode change.

| Test | Source schema(s) | Annotation regex |
| --- | --- | --- |
| `schema/test/CaseStr.test.ts` | `KebabStr.ts`, `PascalStr.ts`, `SnakeStr.ts` | the three case-format patterns |
| `schema/test/FilePath.test.ts` | `FilePath/FilePath.roots.ts` (`WindowsDriveRoot`) | `/^[A-Za-z]:[\\/]?$/` |
| `schema/test/BlockchainRedacted.test.ts` | `EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts` | `/^0x[0-9a-f]{96}$/` |

### Type-error catch and cast fix

The workflow agents verified with vitest (esbuild), which strips types. A direct
`bunx tsc --noEmit -p .../schema/tsconfig.json` then caught a real type error in
the three CaseStr brands: they build on `NonEmptyTrimmedStr` (already branded),
so the annotation point expects `Arbitrary<string & Brand<"NonEmptyTrimmedStr">>`
but `fc.stringMatching(...)` yields `Arbitrary<string>`. Fixed by coercing the
generated value to the branded type, following the file-processing `.map((v) =>
...)` idiom:

```ts
toArbitrary: () => (fc) =>
  fc.stringMatching(/.../).map((value) => value as typeof NonEmptyTrimmedStr.Type),
```

The two plain-`S.String` brands (`WindowsDriveRoot`, `EthereumValidatorPublicKey`)
annotate at the unbranded `string` level and needed no cast. After the fix,
`tsc -p schema/tsconfig.json` is clean (exit 0).

## Reverted (5, left deferred)

The agents correctly reverted these because their source schemas are not pure
anchored-regex string brands, so `fc.stringMatching` cannot produce only valid
values without a custom generator:

- `FileName.test.ts` — `FileName` is a `S.TemplateLiteral` with opaque
  separator/NUL predicate filters not reflected in the template regex.
- `Glob.test.ts` — `Glob` carries a Bun-glob-parser refinement.
- `DateTimeUtcFromValid.test.ts` — transform, not a string brand.
- `IRI.test.ts`, `URI.test.ts` — predicate-based, not anchored-regex brands.

These remain advisory candidates pending bespoke arbitrary generators.

## Pre-existing unrelated blocker recorded

The `@beep/schema` package suite has **15 pre-existing failures in this runtime**,
unrelated to this work — they require Bun globals unavailable under the
Node/vitest runner. Proven by baseline comparison (stash all changes, re-run):

```text
baseline:         Test Files 6 failed | 51 passed; Tests 15 failed | 496 passed
with remediation: Test Files 6 failed | 51 passed; Tests 15 failed | 501 passed
```

Same 6 failing files in both (`Glob`, `Json`, `Jsonl`, `Markdown`, `Toml`,
`TypedArrays`); the only delta is **+5 passing** (the new property tests). Zero
new failures. The failures are environmental (e.g. `Bun.TOML.parse is
unavailable`, `Float16Array is not available in this runtime. Use Node >=24.0.0
or Bun >=1.1.23`, Bun glob/Markdown/JSONL) and out of scope for this packet.

## Verification

```sh
bunx tsc --noEmit -p packages/foundation/modeling/schema/tsconfig.json   # exit 0
bunx vitest run --config vitest.config.ts test/{CaseStr,FilePath,BlockchainRedacted}.test.ts  # 38 passed
# baseline vs with-changes full @beep/schema suite: +5 passing, identical 15 pre-existing failures
bun run beep lint schema-first --write   # arbitrary-tests 18 -> 15
bun run beep lint schema-first           # exit 0, missing/stale 0
```
