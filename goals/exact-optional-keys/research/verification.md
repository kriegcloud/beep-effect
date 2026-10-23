# Verification — detection exhaustiveness and law enforcement

## Triangulated census

| Leg | Before (origin/main c9035c45e7) | After (branch) |
| --- | --- | --- |
| Codemod type-resolved census (`beep lint schema-parity-codemod --rule exact-optional-keys`) | 440 sites in 106 files (200 `optional`, 226 `withDecodingDefault`, 14 `OptionFromOptional`); 0 residue, 0 quarantined | 0 rewrites, 0 residue (`codemod-dry-run.jsonc` before, dry run on the branch after) |
| rg census (`\b(S\|Schema)\.(optional\|withDecodingDefault\|OptionFromOptional)` without the Key siblings) | 446 references | Only fixture strings, rule docs and prose remain (the codemod tests, `lint-rules/test/sources.ts`, the rule's JSDoc, the Lexical exception note, a port note in `nlp`, the `AnthropicTurnCodec` comment, a `schema-tag-idioms` law fixture) |
| Biome rule `prefer-exact-optional-key` over the whole tree (`biome lint .`) | n/a (rule new) | 0 diagnostics; the 110 Biome errors in that run are inherited and touch no branch file |

Line-level reconciliation of legs 1 and 2 before the migration: every line the
codemod reported matched an rg line with the same count. The rg-only lines were
comments, JSDoc prose and test fixture strings.

## Rule recall and precision

`packages/tooling/policy-pack/lint-rules/test/sources.ts` `prefer-exact-optional-key`:
16 violations flagged (named import, aliased import, type-only import, call,
pipe argument, hoisted field object, `Schema` alias, `withDecodingDefault`,
`OptionFromOptional`, `Struct.map` argument, stored alias, generic type
reference, `typeof` query, tuple element, computed access, re-export). No hits
on `optionalKey` (incl. aliased import and re-export), another module's
`optional`, `optionalKey(UndefinedOr(X))`, the Key siblings, `Flag.optional`,
local objects, comments or strings.

## CI enforcement

The hosted `ci lane lint` runs each package's `lint` task, which is
`biome check .` under the root `biome.jsonc` plugins. Locally, planting
`S.Struct({ a: S.optional(S.String) })` in `packages/drivers/github/src` made
`bun run lint` exit 1 with the EF-40 diagnostic; removing it restored exit 0.
