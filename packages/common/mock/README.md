# @beep/mock — Deterministic fixture data

Static UI-friendly mock data for demos, dashboards, and Storybook-style surfaces. Everything here is deterministic (no randomness or runtime I/O) so consumers get stable rendering without touching real services.

## What it provides
- `_mock.ts` picker helpers backed by `assets.ts` lists (ids, names, emails, phone numbers, locations, numeric samples, image paths).
- `_time.ts` deterministic ISO timestamps for activity-style feeds.
- Scenario data grouped by surface: `_overview` (analytics/ecommerce/banking/booking), `_user`, `_product`, `_blog`, `_files`, `_order`, `_invoice`, `_job`, `_tour`, `_others`.
- Root re-exports in `src/index.ts` so consumers can `import { _contacts } from "@beep/mock";`.

## Usage
- Keep array/string handling inside `Effect` helpers: `import * as A from "effect/Array"; import * as F from "effect/Function";`.
- Example:
  ```ts
  import * as A from "effect/Array";
  import * as F from "effect/Function";
  import { _userList } from "@beep/mock/_user";

  const emails = F.pipe(_userList, A.map((user) => user.email));
  ```
- Asset paths assume a public `/assets/images/mock/...` folder served by the host app (e.g., `apps/web/public/assets/images/mock`).

## Boundaries
- Dev/demo only; not a source of truth for domain entities or database seeding.
- Keep data deterministic: do not introduce `Date.now`, randomness, or request-scoped values; rely on `_time`/`_mock`.
- No platform APIs, network, or env reads—this package must stay side-effect free and browser-safe.
- Avoid real PII; use neutral placeholder text only.

## Extending
- Add new base values in `src/assets.ts` and expose them through `_mock.ts` before building higher-level fixtures.
- Prefer `Effect` collection/string utilities (`A.*`, `Str.*`, `F.pipe`) over native array/string methods when shaping new datasets.
- Maintain shape compatibility with existing consumers (apps/web dashboards, IAM UI). If keys change, update the consuming views in the same PR.
- When adding assets, keep counts aligned with the index ranges used in pickers (cover/avatar/product/travel folders).

## Verification
- `bun run lint --filter=@beep/mock`
- `bun run test --filter=@beep/mock`
- `bun run build --filter=@beep/mock`
