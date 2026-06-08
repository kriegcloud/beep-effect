# P4 Form Core Builder Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/foundation/ui-system/form/test/core/Form.test.ts` from
  the `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving values from a schema produced by the existing
  `FormBuilder.buildSchema(...)` API.
- Proved generated form values encode, decode, and re-encode to the same
  boundary representation.
- Kept exact fixtures for builder field insertion, array fields, merge
  behavior, sync refinements, async refinements, and type guards.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 9 tracked files.

## Review Notes

This pilot exercises the form builder itself as the schema source of truth:
the generated arbitrary comes from the schema returned by
`FormBuilder.buildSchema(...)`, not from a parallel test fixture type.

The generated law intentionally stays on simple scalar fields. Existing exact
tests already cover arrays and refinements, while generated arrays can make form
tests noisy without adding much signal to this first migration slice. Future
form-specific arbitrary helpers can add bounded generated array coverage if that
pattern repeats.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, custom `toArbitrary` annotations, template
literal generation, and check filtering.

## Verification

```sh
cd packages/foundation/ui-system/form && bun run beep:test -- test/core/Form.test.ts
cd packages/foundation/ui-system/form && bun run check
cd packages/foundation/ui-system/form && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
