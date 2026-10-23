# `S.optional` vs `S.optionalKey` — grounding (2026-10-23)

## Source

Effect v4 reference checkout, `packages/effect/src/Schema.ts`:

- `optionalKey(X)`: exact optional key. Type `{ a?: X }`.
- `optional(X)` is declared as `interface optional<S> extends optionalKey<UndefinedOr<S>>`
  and documented as "Equivalent to `optionalKey(UndefinedOr(S))`". Type
  `{ a?: X | undefined }`.
- `withDecodingDefault(d)` is built on `optional(toEncoded(self))`: the default
  fires on an absent key **or** an `undefined` value. `withDecodingDefaultKey(d)`
  is built on `optionalKey` and fires on an absent key only.
- `OptionFromOptional` vs `OptionFromOptionalKey`: same split.
- Migration guide (`migration/schema.md`): v3 `optionalWith({ exact: true })` maps
  to `optionalKey`; `partialWith({ exact: true })` to `mapFields(Struct.map(Schema.optionalKey))`.

The repo compiles with `exactOptionalPropertyTypes: true` (`tsconfig.base.json`), so
the two forms differ at the type level: `a?: X` forbids writing `a: undefined`, and
`a?: X | undefined` allows it.

## Runtime probe (installed `effect`, Bun 1.4.4)

| Probe | `S.optional(S.Number)` | `S.optionalKey(S.Number)` |
| --- | --- | --- |
| decode `{}` | `{}` | `{}` |
| decode `{ a: undefined }` | `{ a: undefined }`, key kept | rejected: `Expected number` |
| encode `{ a: undefined }` | key `a` present in output | n/a (not constructible) |
| `toJsonSchemaDocument` field | `anyOf: [number…, { type: "null" }]` | `anyOf: [number…]` |
| `new Class({ a: undefined })` | accepted | rejected: `Schema validation failed` |

## Conclusion

The operator's assumption holds. In a codebase using `exactOptionalPropertyTypes`,
`S.optional` is the anti-pattern by default:

1. It puts `| undefined` back into every consumer's decoded type, which is the very
   thing the compiler flag exists to remove.
2. It admits a third state, "key present with value `undefined`", that domain
   code then has to handle, while `optionalKey` makes that state impossible.
3. Its generated JSON Schema advertises `null`, and the decoder rejects `null`.
   The generated document contradicts the schema it describes (provider tool
   schemas, OpenAPI). `packages/agents/server/src/AssistantTurn/AnthropicTurnCodec.ts`
   already refuses `S.optional` for this reason.

Legitimate exception: a schema that decodes objects third-party code builds with
undefined-valued keys. There the explicit `S.optionalKey(S.UndefinedOr(X))` spelling
is used, with the evidence recorded in `research/classification-ledger.md`.

## Census at bootstrap (origin/main c9035c45e7, rg, excluding `.repos`, `dist`)

- `S.optional` / `Schema.optional` member references: ~192 in ~57 files (some under `scratchpad/`).
- `S.withDecodingDefault` (non-Key): 226.
- `S.OptionFromOptional` (non-Key): 14 in 2 files.
- `S.optionalKey`: 6,454 in 671 files. The repo is already mostly on the exact form.
- No aliases (`const o = S.optional`), named imports, `Struct.map(S.optional)` or
  `S.optional<…>` type-position references found by rg. The codemod's type-resolved
  census is the authoritative count.
