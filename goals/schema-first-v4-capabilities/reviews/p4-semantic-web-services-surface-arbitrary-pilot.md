# P4 Semantic-Web Services Surface Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated
  `packages/foundation/capability/semantic-web/test/ServicesAndSurface.test.ts`
  from the `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving `Dataset` and
  `CanonicalizeDatasetRequest` values from the existing semantic-web/RDF source
  schemas.
- Bounded generated datasets with the production `Dataset.make(...)`
  constructor after derivation so the property stays unit-test sized while
  still using schema-generated RDF values.
- Proved generated datasets and canonicalization requests encode, decode, and
  re-encode to the same boundary representation.
- Kept exact canonicalization, fingerprint, SHACL, SPARQL fallback, and
  WebAnnotation fixtures for hand-picked service behavior.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 11 tracked files.

## Review Notes

The first draft tried to derive every nested service request in the file and
found a practical property-test sizing issue: fully generated RDF/SHACL request
graphs were valid but too slow for Vitest's default per-test budget. The final
law stays focused on the dominant dataset/canonicalization boundary and keeps
the broader service behavior under exact fixtures.

This is a useful migration pattern for integration-adjacent tests: derive from
source schemas, bound generated collections with production constructors, and
prove codec laws beside exact fixtures instead of replacing fixtures wholesale.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, custom `toArbitrary` annotations, template
literal generation, and check filtering.

## Verification

```sh
cd packages/foundation/capability/semantic-web && bun run beep:test -- ServicesAndSurface.test.ts
cd packages/foundation/capability/semantic-web && bun run check
cd packages/foundation/capability/semantic-web && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
