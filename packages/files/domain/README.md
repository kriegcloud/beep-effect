# @beep/files-domain

Domain primitives for the files slice. Ships value objects, schema kits, and utilities that stay platform-agnostic so infra, SDK, and app layers can validate and interpret uploads without touching storage concerns.

## Contents
- Value objects: `FileAttributes`, `FileInstance`, `FileSize`, EXIF metadata helpers, and file type signature registry/detectors.
- Utilities: `formatSize`, `readFileArrayBuffer`, legacy helpers kept for backwards compatibility.
- Errors: tagged parsing/IO errors consumed by upload pipelines.

## Usage
- Import via workspace alias: `import { fileTypeChecker, formatSize } from "@beep/files-domain"`.
- See `packages/files/domain/AGENTS.md` for surface map, guardrails, and usage snapshots.

## Development
- `bun run check --filter=@beep/files-domain`
- `bun run lint --filter=@beep/files-domain`
- `bun run test --filter=@beep/files-domain`

## Notes
- Keep new work Effect-first (namespace imports, no new native array/string helpers).
- Add value-object or signature changes with matching tests under `packages/files/domain/test/`.
