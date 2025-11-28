# @beep/invariant — Consistent runtime assertions for every slice

A tiny, environment‑agnostic assertion library used across the monorepo. It provides a single `invariant(...)` function plus helpers that throw a schema‑backed `InvariantViolation` when conditions do not hold.

This keeps assertion style consistent, makes failures easy to parse/serialize, and avoids leaking platform/framework concerns into core code.


## Why this package exists

- **Consistency** — one way to assert pre/post‑conditions and impossible branches.
- **Observability‑friendly** — failures are instances of `InvariantViolation` (an `effect/Schema` tagged error) that can be parsed, logged, or mapped to HTTP errors elsewhere.
- **Architecture‑safe** — no I/O, no platform/framework dependencies; can be used in any layer (domain, application, api, db, ui).


## What’s included

- **`invariant(condition, message, meta)`** — asserts that `condition` is truthy.
  - `message`: `string | () => string` (lazy messages avoid work on the fast path).
  - `meta`: `{ file: string; line: number; args: unknown[] }` used to enrich the error. Keep values PII‑free and JSON‑safe.
- **`invariant.nonNull(value, message, meta)`** — narrows to `NonNullable<T>`.
- **`invariant.unreachable(value, message, meta)`** — marks impossible code paths (exhaustiveness guard).
- **`InvariantViolation`** — a tagged, schema‑backed error class for failed invariants (`effect/Schema`).
- Lightweight path trimming and safe argument formatting utilities.

Implementation uses small Effect core modules: `effect/Function`, `effect/Option`, `effect/String`, and `effect/Schema`.


## What must NOT go here

- **No I/O or side effects**: no network, DB, file system, timers, logging, or environment mutation.
- **No platform/framework dependencies**: avoid Node APIs (fs/path/process), DOM/React/Next, `@effect/platform-*`, `@effect/sql-*`, etc.
  - Note: the implementation detects dev mode with a non‑fatal `typeof process !== 'undefined'` check and never depends on Node.
- **No domain/business logic**: keep domain rules in your slice’s `domain` or `application` code.
- **No cross‑slice imports**: do not depend on `@beep/iam-*`, `@beep/documents-*`, etc.


## How it fits the architecture

- **Vertical Slice + Hexagonal**: Safe for all layers. Throwing `InvariantViolation` does not couple to infrastructure.
- **Effects‑first**: `InvariantViolation` is schema‑backed, so application layers can pattern‑match or map it to HTTP errors cleanly.
- **Production posture**: Pair with your logging strategy from `docs/PRODUCTION_CHECKLIST.md`. This package itself does not log.


## API

```ts
import { invariant, InvariantViolation } from '@beep/invariant';

invariant(
  user != null,
  () => 'BUG: user missing',
  { file: 'packages/iam/domain/User.ts', line: 42, args: [ctx] }
);

invariant.nonNull(
  maybeId,
  'id should be present',
  { file: __FILE__, line: __LINE__, args: [] }
);

invariant.unreachable(
  neverCase,
  'exhaustiveness check failed',
  { file: __FILE__, line: __LINE__, args: [neverCase] }
);
```

- **Message semantics**
  - Use the `BUG:` prefix in dev‑only programmer errors. In dev builds, this triggers a `debugger` break at the failure site.
  - Avoid PII/secrets in messages or `meta.args`, especially if errors are surfaced to clients.
- **Meta**
  - `file` should be a readable project path (we trim noisy prefixes for clarity).
  - `line` is best‑effort context and may differ by bundler/transform; treat as a hint.
  - `args` should be JSON‑serializable; non‑serializable inputs are shown via best‑effort labels.


## Examples

- **Domain precondition**
  ```ts
  // packages/iam/domain/User/Register.ts
  invariant(
    emailRegex.test(input.email),
    'invalid email',
    { file: 'packages/iam/domain/User/Register.ts', line: 19, args: [input.email] }
  );
  ```

- **Exhaustiveness in a reducer**
  ```ts
  type Ev = { type: 'A' } | { type: 'B' };
  function reduce(ev: Ev) {
    switch (ev.type) {
      case 'A': return 1;
      case 'B': return 2;
      default:  return invariant.unreachable(ev, 'unhandled event', { file: __FILE__, line: __LINE__, args: [ev] });
    }
  }
  ```

- **Effectful mapping**
  ```ts
  import * as Effect from 'effect/Effect';
  import { InvariantViolation } from '@beep/invariant';

  const program = Effect.try({
    try: () => mightThrow(),
    catch: (e) => (e instanceof InvariantViolation ? e : new Error('unknown')),
  });
  ```


## Usage guidance

- Prefer **lazy messages**: `() => string` keeps fast paths cheap.
- Keep `meta.args` **small and serializable**; avoid large objects or cyclic structures.
- For public/edge errors, map `InvariantViolation` to your HTTP error model in `api` handlers; do not leak internals.


## Testing

- Unit test with Vitest. Assert thrown instances are `InvariantViolation` and validate message/meta fields.
- Avoid relying on exact `line` values across toolchains; prefer partial matches.


## Versioning and changes

- Broadly used package — prefer **additive** changes.
- For breaking changes to the error shape/API, update consumers in the same PR and provide migration notes.


## Relationship to other packages

- **`@beep/types`** — compile‑time helpers; no runtime. Use there for types only.
- **`@beep/utils`** — pure, environment‑agnostic runtime helpers; no assertions or error types.
- **`@beep/errors/*`** — error facades for server/client/shared concerns in application/adapters. `InvariantViolation` remains generic and infrastructure‑free here.
