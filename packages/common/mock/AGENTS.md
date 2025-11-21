# AGENTS.md — `@beep/mock`

## Purpose & Scope
- Deterministic, client-safe fixtures for UI demos and dashboards across `apps/web`, `apps/start-client`, and slice UI packages.
- Pure data only: no I/O, env access, randomness, or domain/business logic. Keep consumable in browser and server runtimes.

## Surface Map (src/)
- `assets.ts` — canonical arrays for ids, names, locations, numeric templates, sentences, and image-backed paths.
- `_mock.ts` — indexed pickers built on `assets.ts` plus image path helpers (cover/avatar/product/travel/etc).
- `_time.ts` — stable ISO timestamps generated via `A.makeBy`.
- Scenario bundles: `_overview` (analytics/ecommerce/banking/booking), `_user` (profiles, billing, feeds), `_product`, `_blog`, `_files`, `_order`, `_invoice`, `_job`, `_tour`, `_others` (contacts, notifications, pricing, testimonials).
- `index.ts` — re-export barrel for `@beep/mock` consumers.

## Usage Snapshots
- `apps/web/src/app/dashboard/_layout-client.tsx` renders layout chrome from `_contacts`, `_notifications`.
- `apps/web/src/features/account/view/account-billing-view.tsx` pulls `_userAddressBook`, `_userInvoices`, `_userPayment`, `_userPlans`.
- `apps/web/src/features/account/view/account-socials-view.tsx` uses `_userAbout` profile data.

## Authoring Guardrails
- **Effect collections only**: when adding or refactoring data, use `F.pipe` + `A.*`/`Str.*`; avoid native `.map/.filter/.split` and loops. Namespace imports (`import * as A from "effect/Array"; import * as Str from "effect/String";`).
- **Deterministic**: never introduce `Date.now`, random generators, or per-request mutations. Extend `_time` or base arrays instead.
- **Client-safe**: keep data neutral (no secrets, no real PII, no internal URLs). Content should be safe for screenshots and seeded previews.
- **Stable shapes**: many dashboard widgets rely on existing keys; coordinate shape changes with the consuming views in the same PR.
- **No cross-slice coupling**: avoid pulling slice-specific models or services; fixtures must remain generic and side-effect free.
- **Asset alignment**: if adding new image indices, ensure corresponding files exist under `/assets/images/mock/...` in the host app.

## Adding New Fixtures
- Extend `assets.ts` with base values, then expose pickers in `_mock.ts` to keep index math centralized.
- Build scenario arrays with `Effect` utilities, composing `_mock` pickers to avoid duplicating literals.
- If you need more timestamps, adjust `_time.ts` to cover the required length instead of hardcoding strings.
- Add concise comments only when structure is non-obvious (e.g., explaining index/category coupling); keep prose in README.

## Verification
- `bun run lint --filter=@beep/mock`
- `bun run test --filter=@beep/mock`
- `bun run build --filter=@beep/mock`

## Contributor Checklist
- [ ] Used `Effect` collection/string helpers; no new native array/string or loop constructs.
- [ ] Data remains deterministic and side-effect free; no randomness or `Date.now`.
- [ ] Asset counts and indexes line up with available mock images.
- [ ] Existing consumers keep working or were updated alongside shape changes.
- [ ] Lint/test/build commands pass for `@beep/mock`.
