# P4 Tooling Files Command Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/tooling/tool/cli/test/files-command.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving values from existing source schemas:
  - `DetectBordersReport`;
  - `ChildArtifactRecord`;
  - `FileProcessingCoverageSummary`;
  - `FileProcessingFailureRecord`;
  - `NormalizeManifest`;
  - `ProcessRunManifest`;
  - `SourceProcessingRecord`.
- Proved generated values encode through `S.fromJsonString(...)`, decode back
  through the command-test decoders, and re-encode to the same JSON boundary.
- Kept exact filesystem, media, archive, border, face-detection, rename, and
  process-command fixtures.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 6 tracked files.

## Review Notes

This pilot covers both CLI-owned report schemas and file-processing JSONL/run
manifest schemas already used by the command tests. It reuses production source
schemas from `@beep/repo-cli/commands/Files` and
`@beep/file-processing/Extraction`, not parallel test schemas.

The generated law intentionally avoids the larger `DetectFacesReport` and
`ArchivePoorCandidatesManifest` schemas for this first files-command slice. They
are valid future candidates, but their derived arbitraries produce larger nested
media payloads and should be bounded with source-schema arbitrary annotations
before being added to the routine command test.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, schema arbitrary annotations, and using generated
data to exercise schema encode/decode laws.

## Verification

```sh
cd packages/tooling/tool/cli && bun run beep:test -- files-command.test.ts
cd packages/tooling/tool/cli && bun run check
cd packages/tooling/tool/cli && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
