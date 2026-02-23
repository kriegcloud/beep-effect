# AGENTS.md — `@beep/semantic-web`

## Purpose & Scope
- Semantic web utilities shared across the `beep-effect` monorepo (URI/IRI handling, IDNA/punycode, and RDF-adjacent helpers).
- Prefer **Effect-first** APIs and **Schema-first** models for anything that crosses a boundary.
- Keep this package **pure**: no network / DB / filesystem / timers; normalize and validate data only.

## Module Map (see `src/`)
- `idna/` — Effect + Schema-first IDNA / punycode port (`IDNA`, `IDNAFromString`, `toASCII*`, `toUnicode*`).
- `uri/` — Effect + Schema-first `uri-js` port:
  - `uri/uri.ts` — core parsing / serializing / resolving / normalizing / equality
  - `uri/schemes/*` — scheme handlers (registered via `uri/schemes/index.ts`)
  - `uri/regex-*.ts`, `uri/model.ts` — regex protocol + type helpers
- `jsonld/`, `turtle/`, `sparql/`, `shacl/`, `rdfs/`, `owl2/`, `prov0/`, `shexj/` — semantic-web modules; keep additions deterministic and dependency-light.

## URI / IRI Authoring Guardrails
- **Do not use `throw` / `try/catch` for invalid-input flows.** Represent invalid inputs as typed failures.
- Prefer a single error surface: `effect/ParseResult`.
  - Internals: `ParseResult.ParseIssue`
  - Public Effect APIs: `ParseResult.ParseError` (wrap issues via `ParseResult.parseError(issue)`)
- `URI` and `IRI` must remain `effect/Schema` `S.Class` models with canonical `.value`.
- `URIFromString` / `IRIFromString` must remain strict `S.transformOrFail(S.String, ..., ...)` transforms:
  - Failures must be `ParseResult.ParseIssue` and should use the passed `ast` (e.g. `new ParseResult.Type(ast, actual, message)`).
  - Keep decoding deterministic: do not make schema decoding depend on runtime `URIOptions`.
- Preserve the upstream `uri-js` BSD header in `uri/uri.ts` if derived logic remains substantial.

## Scheme Handlers
- Scheme handlers under `src/uri/schemes/*` must:
  - return `Either<Success, ParseResult.ParseIssue>` (no ad-hoc `components.error?: string`)
  - avoid exceptions for invalid input; map failures into `ParseIssue` (anchored to `ast` when provided)
- Default scheme handlers are registered by importing `@beep/semantic-web/uri/schemes` once at app startup or in tests.

## Testing
- Use `@beep/testkit` for Effect-based tests (`effect(...)`, `scoped(...)`, `layer(...)`).
- Do not manually run Effects inside tests (`Effect.runPromise`, `Effect.runSync`) for assertions.
- References:
  - `packages/common/semantic-web/test/idna/idna.test.ts`
  - `packages/common/semantic-web/test/uri/uri.test.ts`

## Verifications
- `bunx turbo run lint:fix --filter=@beep/semantic-web`
- `bunx turbo run lint --filter=@beep/semantic-web`
- `bunx turbo run check --filter=@beep/semantic-web`
- `bunx turbo run test --filter=@beep/semantic-web`

