# @beep/documents-domain

Domain primitives for the documents slice. Ships value objects, schema kits, and utilities that stay platform-agnostic so infra, SDK, and app layers can validate and interpret uploads without touching storage concerns.

## Contents
- Value objects: `FileAttributes`, `FileInstance`, `FileSize`, EXIF metadata helpers, and file type signature registry/detectors.
- Utilities: `formatSize`, `readFileArrayBuffer`, legacy helpers kept for backwards compatibility.
- Errors: tagged parsing/IO errors consumed by upload pipelines.

## Usage
- Import via workspace alias: `import { fileTypeChecker, formatSize } from "@beep/documents-domain"`.
- See `packages/documents/domain/AGENTS.md` for surface map, guardrails, and usage snapshots.

## Development
- `bun run check --filter=@beep/documents-domain`
- `bun run lint --filter=@beep/documents-domain`
- `bun run test --filter=@beep/documents-domain`

## Notes
- Keep new work Effect-first (namespace imports, no new native array/string helpers).
- Add value-object or signature changes with matching tests under `packages/documents/domain/test/`.
