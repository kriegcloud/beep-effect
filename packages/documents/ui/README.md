# @beep/documents-ui

UI components for the documents slice. Intended to bundle upload/preview widgets, signed URL flows, and management surfaces built on top of `@beep/ui`, `@beep/ui-core`, and `@beep/documents-domain`.

## Status
- Currently a placeholder export (`beep`). Use this package as the home for reusable files UI instead of embedding components inside apps.

## Principles
- Compose styling through `@beep/ui` primitives and settings pipeline; avoid bespoke theme objects.
- Keep client/server boundaries explicit (`"use client"` when needed) for App Router compatibility.
- Rely on `@beep/documents-domain` value objects for validation and `@beep/documents-sdk` for client interactions once available.

## Development
- `bun run check --filter=@beep/documents-ui`
- `bun run lint --filter=@beep/documents-ui`
- `bun run test --filter=@beep/documents-ui`

## See also
- `packages/documents/ui/AGENTS.md` for guardrails and integration notes.
- `packages/ui/ui/AGENTS.md` and `packages/ui/core/AGENTS.md` for shared design system guidance.
