# beep-effect
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kriegcloud/beep-effect)

**TL;DR:** This repo is my spite-powered starter kit for every future startup idea. It contains:

- Contracts that floss third-party SDKs before they talk to the rest of the codebase.
- A theming stack where MUI, Tailwind, and shadcn high-five instead of fistfighting.
- Upload flows that treat S3 keys like sacred geometry, not `/misc/bucket-of-tears`.
- Slice-scoped DB/API clients so IntelliSense doesn’t enter a fugue state.

Sup, beeps. Welcome to the Beep Cathedral, where I cope with monorepo PTSD by over-engineering on purpose. Imagine spending two years in a repo where IntelliSense plays dead and tech debt compounds faster than BNPL fees. This project is the opposite: a vertical-slice Effect playground meant to keep me shipping fast *without* sacrificing dignity.

What follows is equal parts therapy session, deeply technical roast, and launchpad docs for future ideas. Grab a snack.

---

“Well if you hate every codebase you touch, why build another one?” Because my brain spawns SaaS ideas like a broken soda fountain, and every time I start fresh I spend three weeks rewiring auth, uploads, and settings before writing the first feature. I get impatient, I cut corners, and I end up polluting my own dreams with duct tape. Not this time.

Every idea, no matter how cursed, needs the same checklist:

- **Access control** — There is *always* some nosy user trying to see someone else’s data.
- **Authentication** — Even Web3 ponzis need login screens.
- **Library churn** — Today’s hype SDK is tomorrow’s “we shipped a breaking change lol good luck.”
- **File uploads** — If humans are involved, someone is uploading a PDF.
- **Debug/test/observe** — Eventually you have to answer “why did prod catch fire?”
- **Tech debt management** — Ignoring it doesn’t make it disappear; it sends invoices with interest.
- **Coping with TypeScript** — “tsserver has crashed due to running out of memory.” Same, tsserver. Same.
- **More** - There is more here but it's a readme so shove it.

Therefore, I proclaim—nay, I yell into the abyss—I’m making a codebase I can be happy in for the rest of my LIFE. If anyone even coughs the phrase “over-engineered,” I will annotate their existence with Contract.Domain = "Clownery" and raise a ContractError enriched with telemetry, logs, and a PDF of their crimes. This repo is my temple. Future me will launch ridiculous ideas from here without crying, and if that means another 500 schemas, so be it.


---

## Problem #1 — Slow Clients & God Objects

**Symptoms**

- Type inference files a union grievance when one TRPC client knows every endpoint.
- IntelliSense responds between “now” and “heat death of the sun.”
- Changing IAM sets `apps/files` on fire because “shared client” meant “global mutable state.”

**Fix: slice-scoped clients**

- [`Db.make`](https://github.com/kriegcloud/beep-effect/blob/main/packages/core/db/src/Db/Db.ts) builds per-slice Drizzle clients so TS only reasons about relevant tables. Examples: [IamDb](https://github.com/kriegcloud/beep-effect/blob/main/packages/iam/server/src/db/Db/Db.ts), [DocumentsDb](https://github.com/kriegcloud/beep-effect/blob/main/packages/documents/server/src/db/Db/Db.ts), [TasksDb](https://github.com/kriegcloud/beep-effect/blob/main/packages/tasks/server/src/db/Db/Db.ts).
- API surfaces (TRPC or `@effect/platform`) will be generated per slice too. God clients are cancelled.

---

## Problem #2 — String Mayhem (paths, enums, constants)

If you let URL fragments and enums spawn wherever someone shouts `router.push("/stuff")`, you eventually become a meat-based `grep`. Hard pass.

### PathBuilder: typed router paths without sadness

[`PathBuilder`](https://github.com/kriegcloud/beep-effect/blob/main/packages/shared/domain/src/factories/path-builder/PathBuilder/PathBuilder.ts) lives in `@beep/shared-domain` so every slice composes literal-safe routes and keeps autocompletion happy.

```ts
import { PathBuilder } from "@beep/shared-domain/factories";

const dashboard = PathBuilder.createRoot("/dashboard");
const user = dashboard.child("user");
const userProfile = user.child("profile");

const paths = PathBuilder.collection({
  user: {
    root: user.root,
    profile: {
      root: userProfile.root,
      socialConnections: userProfile("social-connections"),
    },
    accountSettings: PathBuilder.dynamicQueries(user.root),
  },
});

export const rootPath = paths.user.root;
export const childPath = paths.user.profile.socialConnections;
export const dynamicPath = paths.user.accountSettings({ settingsTab: "beep" });
```

### Asset paths that never rot (or make Lighthouse cry)

- [`assetPaths`](https://github.com/kriegcloud/beep-effect/blob/main/packages/common/constants/src/paths/asset-paths.ts) + `bun run gen:beep-paths` converts `apps/web/public` assets to `.avif` and emits typed accessors (`assetPaths.logos.windows` etc.).
- Implementation receipts: [public-paths-to-record.ts](https://github.com/kriegcloud/beep-effect/blob/main/packages/common/constants/src/paths/utils/public-paths-to-record.ts) + [generate-asset-paths.ts](https://github.com/kriegcloud/beep-effect/blob/main/tooling/repo-scripts/src/generate-asset-paths.ts).

### Literal kits instead of feral enums

[`stringLiteralKit`](https://github.com/kriegcloud/beep-effect/blob/main/packages/common/schema/src/kits/stringLiteralKit.ts) builds Schema + Enum + Options + tagged unions in one go so dropdowns, DTOs, and invariants stay in sync.

---

## Problem #3 — “DB-first domain models” collapse at scale

Letting table schemas define your business sounds efficient until the business changes. Then it’s chaos: every column rename ripples through domain, controllers, UI, and you end up shipping accidental PII because generated types leaked `hashed_password`.

Solution: keep domain + persistence in sync without fusing them.

### EntityId / makeFields / Table.make / OrgTable.make

- [`EntityId`](https://github.com/kriegcloud/beep-effect/blob/main/packages/common/schema/src/EntityId/EntityId.ts) emits branded schemas + Drizzle column builders for every ID so domain + DB speak the same language.
- [`makeFields`](https://github.com/kriegcloud/beep-effect/blob/main/packages/shared/domain/src/common.ts) composes audit columns (`createdBy`, `version`, etc.) into every domain model.
- [`Table.make`](https://github.com/kriegcloud/beep-effect/blob/main/packages/shared/tables/src/Table/Table.ts) mirrors those defaults in Drizzle so persistence never drifts.
- [`OrgTable.make`](https://github.com/kriegcloud/beep-effect/blob/main/packages/shared/tables/src/OrgTable/OrgTable.ts) bakes tenancy rules into every org-scoped table.

Result: extend a factory once, both layers inherit it instantly.

---

## Problem #5 — “Please don’t put uploads in `misc/`”

[`UploadKey`](https://github.com/kriegcloud/beep-effect/blob/main/packages/shared/domain/src/entities/File/schemas/UploadKey.ts) treats file keys like sacred geometry:

- `/env/tenants/{shard}/{orgType}/{orgId}/{entityKind}/{entityId}/{attribute}/{year}/{month}/{fileId}.{ext}`
- `ShardPrefix` hashes `FileId` into a 2-char hex to avoid S3 hotspotting.
- Bidirectional transforms: encode structured payloads → keys (injecting shard + timestamps) and decode keys → payloads.
- Tests live in [`UploadKey.test.ts`](https://github.com/kriegcloud/beep-effect/blob/main/packages/shared/domain/test/entities/File/schemas/UploadKey.test.ts).

Quick taste:

```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { File } from "@beep/shared-domain/entities";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";

const payload: File.UploadKeyDecoded.Type = {
  env: "dev",
  fileId: SharedEntityIds.FileId.make("file__12345678-1234-1234-1234-123456789012"),
  organizationType: "individual",
  organizationId: SharedEntityIds.OrganizationId.make("organization__..."),
  entityKind: "user",
  entityIdentifier: SharedEntityIds.UserId.make("user__..."),
  entityAttribute: "avatar",
  extension: "jpg",
};

const program = Effect.gen(function* () {
  const encoded = yield* S.decode(File.UploadKey)(payload);
  const decoded = yield* S.encode(File.UploadKey)(encoded);
  return { encoded, decoded };
});

Effect.runPromise(program);
```

ASCII cheat sheet:

```
/env/tenants/aa/orgType/orgId/entityKind/entityId/attribute/YYYY/MM/fileId.ext
```

---

## Problem #6 — Theme chaos and remembering 47 Tailwind classes

- `@beep/ui-core`: exports `createTheme`, settings pipelines, CSS vars, and component overrides (see [`packages/ui/core/src/theme/create-theme.ts`](https://github.com/kriegcloud/beep-effect/blob/main/packages/ui/core/src/theme/create-theme.ts)).
- `@beep/ui`: wires those tokens into Next.js via [`theme-provider.tsx`](https://github.com/kriegcloud/beep-effect/blob/main/packages/ui/ui/src/theme/theme-provider.tsx), uses Atomic Design-ish directories (`atoms` → `sections`), and keeps shadcn + Tailwind pointed at the same globals ([`components.json`](https://github.com/kriegcloud/beep-effect/blob/main/packages/ui/ui/components.json)).
- Copy/paste a component, flip a settings toggle, never memorize `text-muted-foreground` again.

---

## Problem #7 — Wrangling third-party auth clients

[`packages/common/contract`](https://github.com/kriegcloud/beep-effect/tree/main/packages/common/contract) exists because I refuse to trust third-party SDKs blindly again. Highlights:

- `Contract.make` wraps payload/success/failure schemas, annotations, and telemetry continuations.
- `ContractKit.make` bundles contracts, converts them to Layers, and `.liftService()` turns them into DI-friendly services.
- Passkey example: [`contracts`](https://github.com/kriegcloud/beep-effect/blob/main/packages/iam/client/src/clients/passkey/passkey.contracts.ts) → [`implementations`](https://github.com/kriegcloud/beep-effect/blob/main/packages/iam/client/src/clients/passkey/passkey.implementations.ts) → [`service`](https://github.com/kriegcloud/beep-effect/blob/main/packages/iam/client/src/clients/passkey/passkey.service.ts) → [`atoms/ui`](https://github.com/kriegcloud/beep-effect/tree/main/packages/iam/client/src/clients/passkey).
- Continuations normalize HTTP failures, decode unknown successes, and attach telemetry. `.liftService()` gives UI code typed `Effect`s without touching raw fetch responses.

---

## Problem #8 — Existential dread and the “forever repo”

Every idea inevitably needs:

- Access control (“can user X see Y?”)
- Authentication (even Web3 rugs need logins)
- Library churn coping (“breaking change lol good luck”)
- File uploads (humans cannot resist PDFs)
- Debug/test/observe surfaces (prod fire drills happen)
- Tech debt management (entropy invoices daily)
- TypeScript therapy (“tsserver ran out of memory.” Same, tsserver.)

So I weaponized the neuroses: deterministic uploads, slice-scoped clients, contract kits, theme pipelines. Idea #37 should start with “ship,” not “rebuild auth again.”

If anyone whispers “over-engineered,” I will annotate their existence with `Contract.Domain = "Clownery"` and raise a `ContractError` enriched with telemetry + PDF evidence.

### Roadmap-ish promises

1. **Ship IAM to prod** — finish passkey flows, wire contract kits to live runtimes.
2. **Documents slice** — run `UploadKey` against real S3/R2 with quotas + lifecycle rules.
3. **Debug surfaces** — land Effect-powered observability (logs/traces/metrics) by default.
4. **Starter kit mode** — turn this repo into a “press play” template for new ideas.
5. **More trolling** — every new pattern gets documented with equal parts rigor and sarcasm.

---

## Architecture (serious bits)

- Vertical-slice architecture with hexagonal flavor: domain → application → infra.
- Cross-slice sharing only via `packages/shared/*`, `packages/common/*`, `packages/core/*`.
- Path aliases in [`tsconfig.base.json`](tsconfig.base.jsonc) are the law (`@beep/iam-domain`, `@beep/documents-services`, `@/*` for `apps/web`).
- Task graph orchestrated via [`turbo.json`](turbo.json).
- Effect-first, dependency injection via Layers. No sneaky IO in domain code.

## Monorepo layout

- `apps/` — Next.js app (`web`), Effect server (`server`), MCP tooling (`mcp`).
- `packages/` — slices (`iam/*`, `files/*`), shared foundations (`shared/*`, `common/*`, `core/*`), UI libraries (`ui/*`).
- `tooling/` — repo scripts, testkit, automation.

## Tech stack

- Language: TypeScript (strict), runtime: Bun + Node 22 for leftovers.
- Core: Effect 3 + `@effect/platform`.
- DB: Postgres + Drizzle + `@effect/sql*`.
- Auth: better-auth (wrapped via contract kits).
- UI: React 19 + Next.js 15 App Router + MUI + Tailwind + shadcn + TanStack Query.
- State machines: XState 5.
- Quality: Biome, Vitest.
- Infra: Docker + dotenvx.

## Quick start

Prereqs: Bun ≥ 1.2.4 (see [`.bun-version`](.bun-version)), Node 22 LTS, Docker, optional `direnv`.

```bash
bun install            # deps
bun run bootstrap      # spins up Docker + applies migrations
bun run dev            # orchestrated Turbo dev

# or targeted
bunx turbo run dev --filter=@beep/web
```

Scripts live in root `package.json` and already pipe through dotenvx. Prefer them over ad-hoc commands.

## Tasks & pipelines

- Lint/format: `bun run lint`, `bun run lint:fix`
- Typecheck: `bun run check`
- Circular deps: `bun run lint:circular`
- Build: `bun run build`
- Dev: `bun run dev`
- Bootstrap infra: `bun run bootstrap`
- DB lifecycle: `bun run db:generate`, `db:migrate`, `db:push`, `db:studio`

See [`turbo.json`](turbo.json) for the canonical task graph.

## Local services

[`docker-compose.yml`](docker-compose.yml) spins up Postgres, Redis, and Jaeger:

- `bun run db:up` — start services
- Ports default to `DB_PG_PORT=5432`, `REDIS_PORT=6379`, `JAEGER_PORT=16686`, `OTLP_TRACE_EXPORTER_PORT=4318`

## Layering refresher

- `S/domain` → entities, value objects, pure logic.
- `S/application` → use cases, ports (depends on domain only).
- `S/server` → adapters (DB, auth, email, storage).
- `S/tables` → Drizzle schema definitions.
- `S/ui` / `apps/*` → React/Next surfaces.

Imports must respect path aliases enforced in `tsconfig.base.json`.

## Current slices

- **IAM (`packages/iam/*`)** — domain, application/services, infra, tables, UI, SDK.
- **Documents (`packages/documents/*`)** — same layering, plus upload schemas/test harness.
- **Shared foundations** — `packages/shared/*`, `packages/common/*`, `packages/core/*`.

## Applications

- `apps/web` — Next.js 15 App Router surface (uses `@/*` alias).
- `apps/server` — Effect runtime host.
- `apps/mcp` — Model Context Protocol tooling.

CI: see [.github/workflows/check.yml](.github/workflows/check.yml) for lint + typecheck + tests.

## Production defaults

Reference [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md). Highlights:

- `APP_LOG_FORMAT=json`
- `APP_LOG_LEVEL=error`
- `NODE_ENV=production`

---

If any of this feels extra, remember the alternative: arguing with IntelliSense while your boss ships bugs at Mach 3. I’ll take sarcastic documentation and typed contracts any day.
