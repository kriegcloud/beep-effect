# P4 Options Arbitrary Pilot

Date: 2026-06-08

## Summary

Second Wave 3 remediation pilot against the synchronous-codec backlog
re-surfaced by the `SFV4-arbitrary-tests` hardening (see
`reviews/p2-arbitrary-tests-sync-codec-expansion.md`).
`packages/foundation/modeling/schema/test/Options.test.ts` held only static
`S.decodeUnknownSync` / `S.encodeSync` fixtures for the
`OptionFromOptionalNullishKey` codec, so the hardened rule flagged it. The
pilot adds a schema-derived round-trip property beside the existing
exact-value fixtures.

This pilot covers a different schema shape than the HttpStatus literal
bijection: an optional/nullish `Option` codec built from the source combinator.

## Change

```ts
const Payload = S.Struct({
  nickname: OptionFromOptionalNullishKey(S.String),
});

const decode = S.decodeUnknownSync(Payload);
const encode = S.encodeSync(Payload);
const arbitrary = S.toArbitrary(Payload);

fc.assert(
  fc.property(arbitrary, (payload) => {
    expect(decode(encode(payload))).toEqual(payload);
  }),
  { numRuns: 50 }
);
```

`OptionFromOptionalNullishKey(S.String)` decodes omitted / `null` / `undefined`
keys to `None` and present values to `Some`, and encodes `None` by omitting the
key. The property proves `decode(encode(value))` round-trips for every derived
`{ nickname: Option<string> }` — both the `Some(...)` and the omitted-`None`
canonical forms. The `Struct` is composed from the existing source combinator
(the unit under test), and `Option` plus `String` arbitraries are structural,
so generation is reliable and the property is non-flaky.

## Effect v4 grounding

- `effect/testing` exposes `FastCheck` (re-exported `fc`).
- `.repos/effect-v4/packages/effect/src/Schema.ts` exports `toArbitrary`.

## Verification

```sh
bunx vitest run --config vitest.config.ts test/Options.test.ts   # 5 passed
bun run beep lint schema-first --write                           # arbitrary-tests 33 -> 32
bun run beep lint schema-first                                   # exit 0, missing/stale 0
```

The live `SFV4-arbitrary-tests` advisory count dropped from 33 to 32 and the
Options advisory entry was removed from the inventory as resolved.
