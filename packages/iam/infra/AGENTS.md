# `@beep/iam-infra` Agent Guide

## Purpose & Fit
- Binds IAM domain models to real infrastructure: Drizzle-backed repositories, Better Auth service adapters, and env-backed configuration layers.
- Provides Layer factories consumed by runtime compositions (`packages/runtime/server`) so slices outside IAM never touch raw database clients or email providers directly.
- Centralizes Better Auth plugin wiring plus opinionated hooks (personal org seeding, org invitation emails) to keep auth flows in one slice.

## Surface Map
- **Configuration**
  - `IamConfig` (`src/config.ts`): `Context.Tag` + `Layer` sourcing from `@beep/shared-infra`, with `.layerFrom` for overrides.
- **Database**
  - `IamDb.IamDb` (`src/db/Db.ts`): scoped Layer wrapping `@beep/shared-infra/Db` factory with IAM schema.
- **Repositories**
  - Individual repos (`src/adapters/repos/*.repo.ts`): `Effect.Service` wrappers around `Repo.make` for each IAM table, auto-registered in `IamRepos.layer`.
  - `IamRepos.layer` (`src/adapters/repositories.ts`): merges all repo Layers; expected to be provided alongside `IamDb.IamDb.Live`.
- **Auth Services**
  - `AuthEmailService` (`src/adapters/better-auth/AuthEmail.service.ts`): email send helpers (verification, reset, invitations, OTP) via `@beep/shared-infra/Email`.
  - `AuthService` (`src/adapters/better-auth/Auth.service.ts`): Better Auth integration + plugin aggregation, session helpers, database hooks.
  - `AllPlugins` (`src/adapters/better-auth/plugins/plugins.ts`): effect producing every registered Better Auth plugin with IAM-specific schemas.
- **Exports** (`src/index.ts`): re-export adapters, `IamRepos`, configuration, and DB layer for consumers.

## Usage Snapshots
- `apps/web/src/app/api/auth/[...all]/route.ts:1` — pulls `AuthService` to expose Better Auth handlers inside the Next.js route layer.
- `packages/runtime/server/src/server-runtime.ts:74` — composes `IamRepos.layer` with Files repos, then wires `AuthEmailService` + `AuthService` into the server runtime Layer stack.
- `packages/_internal/db-admin/test/iam-infra/repos/AccountRepo.test.ts:33` — exercises `IamRepos.AccountRepo` against a Docker Postgres container for regression coverage.
- `packages/_internal/db-admin/test/pg-container.ts:251` — bootstraps IAM repos + DB Layer inside the testing container alongside Files infra.

## Authoring Guardrails
- **Effect-first services**: always extend `Effect.Service` with `dependencies` defined as Layers. Never bypass `IamRepos.layer` or `IamDb.IamDb.Live`; provide additional dependencies via `Layer.provideMerge`.
- **Layer hygiene**: keep `Layer.mergeAll` inputs free of side effects. When adding a repo, append its `.Default` Layer to `IamRepos.layer` and update `export *` lists.
- **Env coupling**: `IamConfig` is the single source of secrets/config. Use `.layerFrom` in tests to override; avoid reading `serverEnv` elsewhere in infra.
- **Collections & strings**: follow repo-wide rule — use `A.*`, `Str.*`, `F.pipe` instead of native array/string helpers when authoring new code. Legacy usages in `Auth.service.ts` are scheduled for cleanup; do not replicate them.
- **Schema alignment**: ensure repo models, Better Auth plugin schemas, and `@beep/iam-tables` stay synchronized. Prefer reusing `IamEntityIds` factories for IDs.
- **Telemetry**: wrap side-effecting flows with `Effect.withSpan`/`Effect.annotateLogs` like existing email + auth hooks; keep tagged errors via `Data.TaggedError`.
- **Plugins**: register new Better Auth plugins inside `plugins.ts` array to keep `AllPlugins` returning a stable Effect.

## Quick Recipes
```ts
import { serverEnv } from "@beep/shared-infra";
import { AuthService, IamConfig, IamRepos } from "@beep/iam-infra";
import { IamDb } from "@beep/iam-infra/db";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

// Compose IAM persistence + config overrides for tests
const TestIamLayer = Layer.mergeAll(
  IamDb.IamDb.Live,
  IamRepos.layer,
  IamConfig.layerFrom({
    ...serverEnv,
    app: { ...serverEnv.app, env: "test" },
  })
);

const TestIamRuntime = ManagedRuntime.make(TestIamLayer);

const fetchSession = Effect.flatMap(AuthService, ({ getSession }) => getSession());

const session = await TestIamRuntime.runPromise(fetchSession);
```

```ts
import { Repo } from "@beep/shared-infra/Repo";
import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

// Skeleton for a new repository
export class AuditLogRepo extends Effect.Service<AuditLogRepo>()(
  "@beep/iam-infra/adapters/repos/AuditLogRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.AuditLogId,
      Entities.AuditLog.Model,
      Effect.gen(function* () {
        yield* IamDb.IamDb; // ensure Db injected
        return {};
      })
    ),
  }
) {}

// After defining, export via src/adapters/repos/index.ts and append
// AuditLogRepo.Default to IamRepos.layer so downstream Layers pick it up.
```

## Verifications
- `bun run check --filter @beep/iam-infra`
- `bun run lint --filter @beep/iam-infra`
- `bun run test --filter @beep/iam-infra`
- For Docker-backed repo tests: `bun run test --filter @beep/db-admin -- --grep "@beep/iam-infra AccountRepo"` (requires Postgres container support).

## Contributor Checklist
- [ ] New repos: use `Repo.make`, register dependencies in `_common.ts`, export via `repos/index.ts`, and append `.Default` to `IamRepos.layer`.
- [ ] Better Auth plugin changes: update corresponding schema additions plus invitation/email hooks; ensure `AllPlugins` effect stays exhaustive.
- [ ] Configuration tweaks: expose via `IamConfig` only; document required env keys in `docs/patterns/` if new secrets arise.
- [ ] Layer graphs: validate wiring by running `bun run check --filter @beep/iam-infra` and inspecting for missing service requirements.
- [ ] Emails: prefer `renderEmail` templates from `@beep/shared-infra/Email`; pass redacted values for secrets and recipients.
- [ ] Tests: add or extend `_internal/db-admin` suites when touching repo behavior; confirm Docker availability before relying on them.
