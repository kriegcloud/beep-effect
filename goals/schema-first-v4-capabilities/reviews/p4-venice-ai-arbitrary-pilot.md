# P4 Venice AI Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/drivers/venice-ai/test/VeniceAI.service.test.ts` from
  the `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving values from local source schemas used by the
  test's OpenAPI fixture parser and prompt body decoder:
  - `OpenApiOperation`;
  - `PromptBody`.
- Proved generated values encode, decode, and re-encode through the local
  schemas.
- Kept exact swagger alignment, request-shaping, response-decoding, and chat
  integration fixtures.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 3 tracked files.

## Review Notes

This pilot intentionally keeps `OpenApiSpec` out of the generated law. Its
`paths` payload contains broad `S.Unknown` values because the test parses a real
OpenAPI document before narrowing each operation. `OpenApiOperation` and
`PromptBody` are the useful local schemas here: they cover the fixture parser
and request-body decoder without turning the property into a huge arbitrary
OpenAPI document generator.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, schema arbitrary annotations, and using generated
data to exercise schema encode/decode laws.

## Verification

```sh
cd packages/drivers/venice-ai && bun run beep:test -- VeniceAI.service.test.ts
cd packages/drivers/venice-ai && bun run check
cd packages/drivers/venice-ai && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
