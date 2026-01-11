# AGENTS.md — `@beep/documents-ui`

## Purpose & Fit
- House reusable React components for the documents slice so apps do not reimplement UI flows.
- Build atop `@beep/ui` components and `@beep/ui-core` design tokens while consuming `@beep/documents-domain` entities and future `@beep/documents-client` clients.
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
- Follow the design system guidance in `@beep/ui` (`packages/ui/ui/AGENTS.md`) and `@beep/ui-core` (`packages/ui/core/AGENTS.md`) for theme pipeline, settings, CSS variables, and shadcn/MUI usage.
- Respect repository-wide Effect guardrails: namespace imports (`A`, `F`, `Str`, `Effect`) and no new native array/string/object helpers in utilities or examples.
- NEVER use native Date; use `effect/DateTime` for all date/time operations (immutable, timezone-safe).
- NEVER use switch statements or long if-else chains; use `effect/Match` for pattern matching and `effect/Predicate` for type guards.
- Keep components client-boundary aware (`"use client"` where required) and favor hooks/providers for stateful flows rather than ad-hoc context.
- ALWAYS validate data with `@beep/documents-domain` schemas; NEVER trust external data blindly.
- Separate data fetching from presentation: inject `@beep/documents-client` clients or handlers via props instead of hardcoding fetch calls.
- ALWAYS use Effect-based data fetching integrated with TanStack Query for optimal caching and invalidation.

## Suggested Building Blocks (future)
- **Hooks**: `useDocument`, `useKnowledgePage`, `useDiscussion` for data fetching with Effect + TanStack Query.
- **Editor Components**: Block editor with support for text, images, links, etc.
- **Display Components**: Document viewer, knowledge page renderer, comment threads.
- **Form Components**: Document creation/editing forms, comment submission forms.
- **Navigation Components**: Knowledge space browser, page tree navigation.

## Verifications
- `bun run check --filter=@beep/documents-ui`
- `bun run lint --filter=@beep/documents-ui`
- `bun run test --filter=@beep/documents-ui` (add component tests as features land).

## Gotchas

### React 19 / Next.js 16 App Router
- The `"use client"` directive MUST be the first line of a file, BEFORE any imports. Placing it elsewhere causes the component to silently run on the server.
- Document editor components are inherently client-side (require DOM access). They cannot be Server Components.
- `useSearchParams()` and `useParams()` suspend in App Router. Always wrap document route components using these hooks with `<Suspense>`.

### TanStack Query Invalidation
- After document CRUD operations, ALWAYS call `queryClient.invalidateQueries({ queryKey: ["documents", ...] })`. Forgetting this leaves lists showing stale data.
- Optimistic updates for document edits require careful rollback handling. Use `onMutate`/`onError`/`onSettled` callbacks in `useMutation`.
- Real-time collaboration features may conflict with TanStack Query caching. Consider disabling caching for actively edited documents or use shorter `staleTime`.

### Server vs Client Component Boundaries
- Document list views can be Server Components if they only fetch and display data. Add `"use client"` only when using hooks or browser APIs.
- Rich text editors (Plate.js, Lexical) are exclusively client-side. NEVER attempt to render editor components on the server.
- File upload components need `"use client"` due to `File` API and drag-drop event handling.

### Effect Integration in React
- Document fetching with Effect should be wrapped in TanStack Query's `queryFn`. Use `Effect.runPromise` to bridge Effect to Promise.
- NEVER construct Effects inside render. Create them in event handlers, `useEffect`, or query functions.
- Effect schemas for document validation run synchronously. Use `S.decodeUnknownSync` for immediate form validation.
- DateTime fields from documents use `effect/DateTime`. NEVER convert to native `Date` — use `DateTime.format` for display.

### Document-Specific Pitfalls
- Block-based editors maintain internal state. Unmounting and remounting loses unsaved changes. Use controlled state or auto-save patterns.
- Large documents may cause performance issues. Consider virtualization for long document lists and pagination for content.
- File attachments require separate upload handling. Do not embed large file data in document schemas directly.

## Contributor Checklist
- [ ] Components rely on `@beep/ui/ui` primitives and respect theme/settings invariants.
- [ ] Validation uses `@beep/documents-domain`; networking is injected (or uses `@beep/documents-client` when available).
- [ ] NEVER introduce new native array/string/object helpers.
- [ ] No native Date; use `effect/DateTime` for all date/time operations.
- [ ] Pattern matching uses `effect/Match` instead of switch statements.
- [ ] Appropriate `"use client"` markers added for React 19 compliance.
- [ ] Tests and examples added under `packages/documents/ui/test/` (or in apps) for new surfaces.
- [ ] Data fetching MUST use Effect integration with TanStack Query.
