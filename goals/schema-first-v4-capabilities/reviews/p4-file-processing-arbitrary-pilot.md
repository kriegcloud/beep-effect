# P4 File Processing Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/foundation/capability/file-processing/test/FileProcessing.test.ts`
  from the `SFV4-arbitrary-tests` advisory inventory.
- Added source-schema `toArbitrary` annotations for `ArtifactId`,
  `OperationId`, and `ContentDigest` so generated values preserve the
  `artifact:`, `operation:`, and `sha256:` SHA-256 digest formats.
- Added valid-subset `toArbitrary` annotations for local `ArtifactExtension`
  and `ArtifactName`, avoiding generated path separators that the decoder
  correctly rejects.
- Added a property test deriving artifact identifiers, `SourceArtifact`,
  `ExtractFileOperation`, and `ProcessFileOperation` from the existing source
  schemas.
- Kept service-contract fixtures for engine behavior, child export, extraction,
  and skipped-processing cases.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 14 tracked files.

## Review Notes

This pilot found a real schema-derived generation gap: Effect v4 can derive a
template-literal arbitrary, but the local prefixed digest schemas needed
explicit source annotations to generate values that satisfy the embedded
`Sha256Hex` semantics. The fix is metadata-only and does not change accepted
wire values.

The test intentionally uses existing source schemas instead of test-only shapes.
It proves the schema law for file-processing payloads while leaving exact
service fixtures to cover the fake engine behavior.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, custom `toArbitrary` annotations, template
literal generation, and check filtering.

## Verification

```sh
cd packages/foundation/capability/file-processing && bun run beep:test -- FileProcessing.test.ts
cd packages/foundation/capability/file-processing && bun run check
cd packages/foundation/capability/file-processing && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```

