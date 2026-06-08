# P4 Secure Header Options Defaults Pilot

Date: 2026-06-08

## Completed

- Moved the omitted-options fallback for secure-header aggregate helpers into
  an internal schema argument object using `S.withConstructorDefault(...)`.
- Preserved the public helper shape for:
  - `createHeadersObject()`;
  - `createHeadersObject(options)`;
  - `createSecureHeaders()`;
  - `createSecureHeaders(options)`.
- Added a regression test proving omitted, explicit `undefined`, and
  schema-constructed empty options resolve to the same secure default headers.

## Why This Matters

This is the second Wave 4 defaults pilot and covers a reusable `@beep/schema`
helper rather than an ontology projection. The important nuance is that Effect
v4 constructor defaults apply when an object field is missing or `undefined`,
not when a root schema is constructed from bare `undefined`. Wrapping the
function argument in a small schema-owned object lets the default live in the
schema while keeping the ergonomic helper call shape.

This pattern is a useful migration target for other helpers that currently use
`options = {}` but already have a schema-modeled options object.

## Verification

```sh
cd packages/foundation/modeling/schema && bun run check
cd packages/foundation/modeling/schema && bunx --bun vitest run test/HttpHeaders.test.ts
cd packages/foundation/modeling/schema && bun run lint
bun run beep yeet verify --plan --json
```
