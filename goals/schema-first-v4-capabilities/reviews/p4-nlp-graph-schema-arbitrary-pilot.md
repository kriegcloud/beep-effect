# P4 NLP Graph Schema Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/foundation/capability/nlp/test/Graph/Schema.test.ts`
  from the `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving `TextNode`, `TextEdge`, `EntityNode`,
  `POSNode`, `LemmaNode`, `DependencyNode`, `RelationNode`, and `NLPAnalysis`
  from the existing `@beep/nlp/Graph/Schema` source schemas.
- Kept exact decode fixtures for representative graph payloads and invalid
  discriminant rejection.
- Proved generated graph payloads encode and decode through the source schemas
  without defining weaker test-only schemas.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 13 tracked files.

## Review Notes

The generated property intentionally proves codec stability only. Several NLP
fields are still broad (`S.String`, `S.Finite`) because the current domain
schema accepts broad graph labels, timestamps, positions, counts, and metadata.
Future precision waves can tighten those source schemas if the product domain
requires non-empty labels, integral positions, bounded confidence, or
non-negative counts.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, tagged-union arbitrary generation, and check
filtering.

## Verification

```sh
cd packages/foundation/capability/nlp && bun run beep:test -- Graph/Schema.test.ts
cd packages/foundation/capability/nlp && bun run check
cd packages/foundation/capability/nlp && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```

