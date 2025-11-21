# AGENTS — `@beep/files-ui`

## Purpose & Fit
- House reusable React components for the files slice (uploaders, previews, metadata panels, signed URL triggers) so apps do not reimplement UI flows.
- Build atop `@beep/ui` / `@beep/ui-core` tokens and primitives while consuming `@beep/files-domain` value objects and future `@beep/files-sdk` clients.

## Design & Implementation Guardrails
- Follow the design system guidance in `packages/ui/ui/AGENTS.md` and `packages/ui/core/AGENTS.md` (theme pipeline, settings, CSS variables, shadcn/MUI usage).
- Respect repository-wide Effect guardrails: namespace imports (`A`, `F`, `Str`, `Effect`) and no new native array/string/object helpers in utilities or examples.
- Keep components client-boundary aware (`"use client"` where required) and favor hooks/providers for stateful flows rather than ad-hoc context.
- Validate file inputs with `@beep/files-domain` schemas/value objects; do not trust browser `File` metadata blindly.
- Separate data fetching from presentation: inject `@beep/files-sdk` clients or handlers via props instead of hardcoding fetch calls.

## Suggested Building Blocks
- Hooks for drag/drop + file validation, progress, and error tagging.
- UI primitives: upload dropzone, inline file card, gallery grid, detail drawer with EXIF display, and signed URL action buttons.
- Providers to share upload queues across routes (Option/Outcome-aware).

## Verifications
- `bun run check --filter=@beep/files-ui`
- `bun run lint --filter=@beep/files-ui`
- `bun run test --filter=@beep/files-ui` (add component tests as features land).

## Contributor Checklist
- [ ] Components rely on `@beep/ui` primitives and respect theme/settings invariants.
- [ ] Validation uses `@beep/files-domain`; networking is injected (or uses `@beep/files-sdk` when available).
- [ ] No new native array/string/object helpers introduced.
- [ ] Appropriate `"use client"` markers added for React 19 compliance.
- [ ] Tests and Story-like examples added under `packages/files/ui/test/` (or in apps) for new surfaces.
