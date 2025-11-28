# @beep/utils — Common runtime utilities

A small, architecture‑safe library of reusable, side‑effect‑free runtime helpers shared across the monorepo. Unlike `@beep/types`, this package exports functions (runtime values), but they are intentionally pure and environment‑agnostic.

Contents today include string helpers, record/struct helpers, small guards/getters, simple transformations, and lightweight factories (e.g., URN).


## What belongs here

- **Pure, deterministic functions** that operate on inputs and return outputs with no hidden I/O.
- **Environment‑agnostic utilities** that run the same in Node and the browser.
- **Small, composable data helpers** (e.g., string normalization, dictionary transforms, non‑throwing getters, type‑narrowing guards).
- **Lightweight factories** that are still pure (e.g., `URN.factory.ts`).
- **Effect core modules are OK** to use for implementation convenience (`effect/Array`, `effect/String`, `effect/Option`, etc.).


## What must NOT go here

- **No I/O or side effects**: no network, DB, file system, timers, or global mutation.
- **No platform‑specific code**: avoid Node APIs (fs, path, process), DOM/React/Next, Web APIs, or `@effect/platform-*`/`@effect/sql-*`/`@effect/opentelemetry`.
- **No logging** and no `process.env` reads; logging belongs in app/runtime wiring per `docs/PRODUCTION_CHECKLIST.md`.
- **No domain‑specific logic**: keep business logic in the owning slice (`S/domain` or `S/application`).
- **No cross‑slice imports**: do not depend on `@beep/iam-*`, `@beep/documents-*`, etc.
- **No error definitions**: use `@beep/errors/*` once the split is complete (see `ERRORS_CLEANUP_PLAN.md`).

If a helper requires an environment or service, it belongs in an adapter or a slice, not here.


## How it fits the architecture

- **Vertical Slice + Hexagonal**: Safe to import from any layer (`domain`, `application`, `api`, `db`, `ui`) because utilities here are pure and environment‑agnostic.
- **No upward dependencies**: This package must never pull in infrastructure concerns; it should be reusable by the most constrained layers (domain/tests).
- **Path alias**: Import as `@beep/utils` (see `tsconfig.base.json`).

Related packages:
- **`@beep/types`** — compile‑time only helpers (no runtime). Prefer placing type aliases there.
- **`@beep/errors/*`** — for error types and helpers (server/client/shared), not here.


## Module map (current)

- **`src/data/`**
  - `string.utils.ts` — e.g., `getNameInitials`, `normalizeString`, `interpolateTemplate`, `getNestedValue`
  - `record.utils.ts` — immutable record helpers
  - `struct.utils.ts` — safe struct manipulation helpers
  - `index.ts` — `RecordUtils`, `StrUtils`, `StructUtils`
- **`src/factories/`**
  - `URN.factory.ts` — utilities for building/validating URNs (pure)
- **`src/getters/`** — safe data accessors
- **`src/guards/`** — type‑narrowing predicates
- **`src/transformations/`** — small, pure transforms
- **`src/index.ts`** — re‑exports public surface


## Allowed dependencies

- **Effect core modules** (type‑level or pure utilities): `effect/Array`, `effect/String`, `effect/Option`, `effect/Function`, etc.
- **Internal type/runtime helpers**: `@beep/types`, `@beep/invariant`.

Avoid importing any package that introduces platform coupling or I/O. If in doubt, keep it out.


## Import guidelines

- **Value imports are expected** (these are runtime functions):
  ```ts
  import { RecordUtils, StrUtils } from '@beep/utils';
  ```
- **Keep usage pure** (these helpers should not hide side effects).
- **Don’t re‑export runtime code** from here to other common packages unless it remains environment‑agnostic.


## Examples

- **Generate initials from a name**
  ```ts
  import { StrUtils } from '@beep/utils';

  const initials = StrUtils.getNameInitials('John Doe'); // "JD"
  ```

- **Normalize a string for search**
  ```ts
  import { StrUtils } from '@beep/utils';

  const normalized = StrUtils.normalizeString('Café'); // "cafe"
  ```

- **Interpolate a template safely**
  ```ts
  import { StrUtils } from '@beep/utils';

  const out = StrUtils.interpolateTemplate(
    'Hello {{user.name}}, your {{items.[0].product.name}} costs ${{total}}',
    { user: { name: 'John' }, items: [{ product: { name: 'Widget' } }], total: 99.99 }
  );
  // "Hello John, your Widget costs $99.99"
  ```

- **Build a URN**
  ```ts
  import { makeUrn } from '@beep/utils/factories/URN.factory';
  const id = makeUrn({ namespace: 'beep', kind: 'organization', id: 'org_123' });
  ```


## Testing

- Keep tests deterministic and type‑safe; no I/O or environment reliance.
- Prefer property‑based or table‑driven tests for string/record utilities.


## Versioning and changes

- This package is widely consumed; prefer **additive** changes.
- For breaking changes, update all consumers in the same PR or provide a migration path.


## Notes on local scripts

- Some packages historically included `src/execute.ts` for ad‑hoc examples. Treat these as **local dev only**, never part of production. The production checklist recommends removing `execute.ts` scripts across packages.


## Checklist for contributors (review gate)

- **Pure**: no side effects, no I/O, no globals.
- **Portable**: no Node/DOM/Next/platform APIs; no `@effect/platform-*`.
- **Generic**: no business/domain logic; no cross‑slice imports.
- **Minimal**: small, composable helpers; avoid multipurpose “utils” that hide complexity.
- **Documented**: add JSDoc and examples for exported helpers.
