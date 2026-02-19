# AGENTS.md — `@beep/documents-ui`

## Purpose & Fit
- House reusable React components for the documents slice so apps do not reimplement UI flows.
- Build atop `@beep/ui/ui` components and `@beep/ui/core` design tokens while consuming `@beep/documents-domain` entities and future `@beep/documents-client` clients.
- Provide document editor, knowledge page, discussion, and comment UI components.

## Current State
- Package is a stub; only `beep` is exported (`src/index.ts`).
- This is the staging area for document-related React components once the domain and SDK are more complete.

## Planned Components
When implemented, this package should include:
- Document editor components with block-based editing.
- Knowledge page display and editing components.
- Discussion thread and comment components.
- File attachment upload and preview components.
- Document version history viewers.
- Knowledge space navigation components.

## Design & Implementation Guardrails
- Follow the design system guidance in `packages/ui/ui/AGENTS.md` and `packages/ui/core/AGENTS.md` (theme pipeline, settings, CSS variables, shadcn/MUI usage).
- Respect repository-wide Effect guardrails: namespace imports (`A`, `F`, `Str`, `Effect`) and no new native array/string/object helpers in utilities or examples.
- NEVER use native Date; use `effect/DateTime` for all date/time operations (immutable, timezone-safe).
- NEVER use switch statements or long if-else chains; use `effect/Match` for pattern matching and `effect/Predicate` for type guards.
- Keep components client-boundary aware (`"use client"` where required) and favor hooks/providers for stateful flows rather than ad-hoc context.
- Validate data with `@beep/documents-domain` schemas; do not trust external data blindly.
- Separate data fetching from presentation: inject `@beep/documents-client` clients or handlers via props instead of hardcoding fetch calls.
- Use Effect-based data fetching integrated with TanStack Query for optimal caching and invalidation.

## Suggested Building Blocks (future)
- **Hooks**: `useDocument`, `useKnowledgePage`, `useDiscussion` for data fetching with Effect + TanStack Query.
- **Editor Components**: Block editor with support for text, images, links, etc.
- **Display Components**: Document viewer, knowledge page renderer, comment threads.
- **Form Components**: Document creation/editing forms, comment submission forms.
- **Navigation Components**: Knowledge space browser, page tree navigation.

## Verifications
- `bun run --filter @beep/documents-ui check`
- `bun run --filter @beep/documents-ui lint`
- `bun run --filter @beep/documents-ui test` (add component tests as features land).

## Contributor Checklist
- [ ] Components rely on `@beep/ui/ui` primitives and respect theme/settings invariants.
- [ ] Validation uses `@beep/documents-domain`; networking is injected (or uses `@beep/documents-client` when available).
- [ ] No new native array/string/object helpers introduced.
- [ ] No native Date; use `effect/DateTime` for all date/time operations.
- [ ] Pattern matching uses `effect/Match` instead of switch statements.
- [ ] Appropriate `"use client"` markers added for React 19 compliance.
- [ ] Tests and examples added under `packages/documents/ui/test/` (or in apps) for new surfaces.
- [ ] Data fetching uses Effect integration with TanStack Query.
