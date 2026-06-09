# P4 Semantic-Web JSON-LD Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/foundation/capability/semantic-web/test/JsonLd.test.ts`
  from the `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving `JsonLdContext`, `JsonLdLiteralValue`, and
  `JsonLdFrame` values from the existing semantic-web/RDF JSON-LD source
  schemas.
- Proved generated JSON-LD DTOs encode, decode, and re-encode to the same
  boundary representation.
- Kept exact document, RDF bridge, blank-node, safe-mode, and streaming
  fixtures for hand-picked service behavior.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 10 tracked files.

## Review Notes

The full `JsonLdDocument` arbitrary can produce broad nested graphs and very
large property arrays. This pilot deliberately starts with the source schemas
that are cheap and still central to the JSON-LD boundary: context, literal
value, and frame DTOs. The document-level service laws remain covered by exact
fixtures until a future source-schema arbitrary annotation or bounded helper is
worth adding.

This continues the packet's preferred migration shape: add generated coverage
beside exact fixtures, keep the generated law focused, and let schema-derived
data reveal where source schemas need more precision.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, custom `toArbitrary` annotations, template
literal generation, and check filtering.

## Verification

```sh
cd packages/foundation/capability/semantic-web && bun run beep:test -- JsonLd.test.ts
cd packages/foundation/capability/semantic-web && bun run check
cd packages/foundation/capability/semantic-web && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
