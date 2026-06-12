# P4 Markdown AST Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/foundation/modeling/md/test/Md.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added a property test deriving `Inline`, `Block`, and `Document` values from
  the existing `@beep/md/Md.model` source schemas with `S.toArbitrary(...)`.
- Kept exact Markdown and HTML renderer fixtures for compatibility and escaping
  behavior.
- Proved generated AST nodes encode, decode, and compare back to the generated
  value through the source schemas.
- Proved decoded generated nodes can be handed to the Markdown inline/block
  renderers and full document renderer without defining a test-only schema.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 15 tracked files.

## Review Notes

This pilot deliberately avoids replacing renderer golden fixtures. The exact
fixtures still own escaping, URL sanitization, HTML output, and adapter failure
contracts. The generated property covers the broader schema law: if the source
AST schemas say a value is valid, the codec and renderer handoff path should
accept it.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary` and explains that checks are applied to generated
values. A local sample of `S.toArbitrary(Document)` confirmed the recursive
Markdown AST can generate valid documents for this focused law.

## Verification

```sh
cd packages/foundation/modeling/md && bun run test -- Md.test.ts
cd packages/foundation/modeling/md && bun run check
cd packages/foundation/modeling/md && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```

