# BeepId tagged-template exploration

Context: request to mirror `drizzle-orm`'s ``sql`...` `` ergonomics for `BeepId`, allowing a template literal entrypoint that yields named composers.

## Proposed shape
- Add a tagged wrapper around the existing `BeepId` composer: `const { $BeepId } = Identifier.make("beep");`.
- Tag usage: `const { $DomainId } = $BeepId`domain`; const { $ApplicationId, $InfraId } = $BeepId.compose("application", "infra"); const { $DomainEntityId } = $DomainId`entities`;`.
- Returned keys use `$${PascalCase}Id` to align with `.module(...)` accessor naming and keep the "this is an identity" visual signal.
- The tag returns a composer enriched with the tag function (so chaining and existing `.compose/.make/.annotations/.symbol()` remain available).

## Guardrails to keep
- Interpolations should be rejected up front (`values.length > 0`) to avoid ambiguous identifiers; only literal segments are accepted.
- Single-segment tags keep behavior predictable; no implicit splitting on `/`—users should call `.compose` for multi-part paths.
- Reuse existing validation (`ensureSegment`, `toPascalIdentifier`) so runtime checks and casing rules stay consistent.
- Type surface: extend `IdentityComposer` with a `TaggedComposer` type that merges the tag callable + all existing methods/fields.

## Implementation sketch
- Helper `toTagged(composer)` that returns a callable tag; inside the tag, guard against interpolations, validate the segment, compose, and return `{ [$${PascalCase(segment)}Id]: toTagged(child) } as const`.
- Export `$BeepId = toTagged(BeepId.from("@beep"));` alongside the existing `BeepId` export; keep current API intact.
- Tests: add Vitest coverage for the tag (happy path, interpolation rejection, chaining, `.symbol()` preservation) and a README snippet.

## Open decisions
- If interpolations are desired later, they need a deterministic join/validation strategy; current recommendation is to forbid them for clarity.
- If users prefer no `$` prefix, the same wrapper can emit `PascalCaseId` keys, but the `$` marker helps distinguish identifier objects from plain strings.
