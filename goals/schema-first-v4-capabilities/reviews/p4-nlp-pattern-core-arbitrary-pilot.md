# P4 NLP PatternCore Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/foundation/capability/nlp/test/PatternCore.test.ts`
  from the `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving `POSPatternOption`, `EntityPatternOption`,
  `LiteralPatternOption`, `Pattern.Element`, and `Pattern` values from the
  existing `@beep/nlp/Core/Pattern` source schemas.
- Kept exact parse, render, guard, and constructor fixtures for representative
  pattern strings and behavior.
- Proved generated options and pattern elements round-trip through the source
  schemas, and generated full patterns survive the existing `Pattern.encode` /
  `Pattern.decode` boundary.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 12 tracked files.

## Review Notes

This pilot is a good local example of the packet's preferred migration shape:
the existing fixtures stay in place for hand-picked behavior, while one
schema-derived property test adds coverage over the broader value space the
production schemas claim to accept.

The generated property intentionally avoids asserting a bracket-string parser
round-trip for arbitrary literal options. The literal schema accepts broad
strings, including characters that are meaningful to the compact bracket syntax,
so this pilot limits the law to schema codec stability and renderer handoff.
Future precision work can tighten the literal token schema if escaped or
restricted pattern text becomes a product requirement.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, custom `toArbitrary` annotations, template
literal generation, and check filtering.

## Verification

```sh
cd packages/foundation/capability/nlp && bun run beep:test -- PatternCore.test.ts
cd packages/foundation/capability/nlp && bun run check
cd packages/foundation/capability/nlp && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
