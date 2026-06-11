# P4 Tika Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/drivers/tika/test/Tika.service.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving values from existing file-processing source
  schemas:
  - `SourceArtifact`;
  - `ExtractFileOperation`.
- Proved generated values encode, decode, and re-encode through their direct
  file-processing schemas.
- Kept exact runtime fixtures for P1 text extraction and DOCX deferral behavior.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 4 tracked files after the paired Libpff pilot.

## Review Notes

This pilot uses direct schema codecs instead of `S.fromJsonString(...)` because
generated `SourceArtifact` values may include `Uint8Array` bytes. The direct
schema law is the correct source-schema proof for runtime operation data, while
JSON-safe manifest/report schemas remain better suited for JSON-boundary laws.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, schema arbitrary annotations, and using generated
data to exercise schema encode/decode laws.

## Verification

```sh
cd packages/drivers/tika && bun run beep:test -- Tika.service.test.ts
cd packages/drivers/tika && bun run check
cd packages/drivers/tika && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
