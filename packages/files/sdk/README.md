# @beep/files-sdk

Client-facing SDK entry point for the files slice. Intended to expose typed Effect wrappers for upload, signed URL, and metadata flows that can be consumed by web/apps/CLI clients.

## Status
- Currently a placeholder export (`beep`) while infra APIs stabilize. Use this package as the home for shared client utilities instead of duplicating per app.

## When extending
- Mirror infra contracts so SDK consumers never depend on raw fetch/post bodies.
- Keep APIs Effect-first (no async/await), mirroring array/string guardrails used across the repo.
- Add tests under `packages/files/sdk/test/` that hit either fakes or contract-level mocks.

## Development
- `bun run check --filter=@beep/files-sdk`
- `bun run lint --filter=@beep/files-sdk`
- `bun run test --filter=@beep/files-sdk`

## See also
- `packages/files/sdk/AGENTS.md` for authoring guardrails and integration notes.
