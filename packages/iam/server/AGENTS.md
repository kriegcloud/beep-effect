# `@beep/iam-server` Agent Guide

## Purpose & Fit
- Binds IAM domain models to real infrastructure: Drizzle-backed repositories, Better Auth service adapters, and env-backed configuration layers.
- Provides Layer factories consumed by runtime compositions (`packages/runtime/server`) so slices outside IAM never touch raw database clients or email providers directly.
- Centralizes Better Auth plugin wiring plus opinionated hooks (personal org seeding, org invitation emails) to keep auth flows in one slice.

## Surface Map
- **Database**
  - `IamDb.Db` (`src/db/Db/Db.ts`): scoped Layer wrapping `@beep/shared-server/DbClient` factory with IAM schema.
- **Repositories**
  - Individual repos (`src/db/repos/*.repo.ts`): `Effect.Service` wrappers around `DbRepo.make` (from `@beep/shared-domain/factories`) for each IAM table, auto-registered in `IamRepos.layer`.
  - `IamRepos.layer` (`src/db/repositories.ts`): merges all repo Layers; expected to be provided alongside `IamDb.Db`.
- **Auth Services**
  - `Auth.Emails` (`src/adapters/better-auth/Emails.ts`): email send helpers (verification, reset, invitations, OTP) via `@beep/shared-server/Email`.
  - `Auth.Service` (`src/adapters/better-auth/Service.ts`): Better Auth integration + plugin aggregation, session helpers, database hooks.
  - `Auth.Options` (`src/adapters/better-auth/Options.ts`): Better Auth configuration effect with all plugins and IAM-specific schemas.
  - `Auth.BetterAuthBridge` (`src/adapters/better-auth/BetterAuthBridge.ts`): type bridge for Better Auth organization plugin operations.
- **API**
  - `IamApiV1` (`src/api/v1/`): Effect RPC handlers for IAM operations (admin, api-key, core, oauth2, organization, passkey, sign-in, sign-up, sso, two-factor).
- **Exports** (`src/index.ts`): re-export adapters, `IamRepos`, and DB layer for consumers.

## Usage Snapshots
- `packages/runtime/server` — composes `IamRepos.layer` with shared repos, then wires Better Auth services into the server runtime Layer stack.
- `packages/_internal/db-admin/test/AccountRepo.test.ts` — exercises IAM repos against a Docker Postgres container for regression coverage.
- Better Auth configuration consumed by web application runtime for authentication flows.

## Authoring Guardrails
- **Effect-first services**: ALWAYS extend `Effect.Service` with `dependencies` defined as Layers. NEVER bypass `IamRepos.layer` or `IamDb.layer`; provide additional dependencies via `Layer.provideMerge`.
- **Layer hygiene**: keep `Layer.mergeAll` inputs free of side effects. When adding a repo, append its `.Default` Layer to `IamRepos.layer` and update `export *` lists.
- **Env coupling**: Use `serverEnv` from `@beep/shared-env/ServerEnv` for configuration. NEVER read `process.env` directly in service implementations.
- **Collections & strings**: follow repo-wide rule — use `A.*`, `Str.*`, `F.pipe` instead of native array/string helpers when authoring new code. Legacy usages in `Options.ts` are scheduled for cleanup; do not replicate them.
- **Schema alignment**: ensure repo models, Better Auth plugin schemas, and `@beep/iam-tables` stay synchronized. Prefer reusing `IamEntityIds` factories for IDs.
- **Telemetry**: wrap side-effecting flows with `Effect.withSpan`/`Effect.annotateLogs` like existing email + auth hooks; keep tagged errors via `Data.TaggedError`.
- **Plugins**: register new Better Auth plugins inside `Options.ts` to keep the configuration effect stable.

## Quick Recipes
```ts
import { IamRepos } from "@beep/iam-server";
import { IamDb } from "@beep/iam-server/db";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

// Compose IAM persistence for tests
const TestIamLayer = Layer.mergeAll(
  IamDb.layer,
  IamRepos.layer
);

const TestIamRuntime = ManagedRuntime.make(TestIamLayer);

// Use a repo service
const program = Effect.gen(function* () {
  const accountRepo = yield* AccountRepo;
  return yield* accountRepo.findById(accountId);
});

const account = await TestIamRuntime.runPromise(program);
```

```ts
import { DbRepo } from "@beep/shared-domain/factories";
import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-server/db/repos/_common";
import { IamDb } from "@beep/iam-server/db";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

// Skeleton for a new repository
export class AuditLogRepo extends Effect.Service<AuditLogRepo>()(
  "@beep/iam-server/db/repos/AuditLogRepo",
  {
    dependencies,
    accessors: true,
    effect: Effect.gen(function* () {
      yield* IamDb.Db; // ensure Db injected
      return yield* DbRepo.make(
        IamEntityIds.AuditLogId,
        Entities.AuditLog.Model,
        Effect.succeed({})
      );
    }),
  }
) {}

// After defining, export via src/db/repos/index.ts and append
// AuditLogRepo.Default to IamRepos.layer (in src/db/repositories.ts) so downstream Layers pick it up.
```

## Verifications
- `bun run check --filter @beep/iam-server`
- `bun run lint --filter @beep/iam-server`
- `bun run test --filter @beep/iam-server`
- For Docker-backed repo tests: `bun run test --filter @beep/db-admin -- --grep "@beep/iam-server AccountRepo"` (requires Postgres container support).

## Security

### Credential Handling
- NEVER log credentials, passwords, tokens, or API keys in any form—use `Effect.annotateLogs` with redacted placeholders only.
- NEVER store plaintext passwords; Better Auth handles hashing internally but verify plugin schemas do not expose raw secrets.
- ALWAYS use `Redacted` wrappers from `effect/Redacted` when passing sensitive values between layers.
- ALWAYS route secrets through `serverEnv` from `@beep/shared-env/ServerEnv`; NEVER read `process.env` directly in service implementations.

### Layer Isolation
- ALWAYS isolate auth context via Effect Layers—NEVER share mutable session state across Layer boundaries.
- ALWAYS scope database connections per-request via `IamDb.Db` to prevent session leakage.
- NEVER bypass `IamRepos.layer` or `IamDb.layer`; these enforce tenant isolation and audit trails.

### Session Token Security
- ALWAYS validate session tokens server-side before trusting session claims.
- ALWAYS configure token expiry via Better Auth options in `Options.ts` rather than hardcoding values.
- NEVER expose session tokens in logs, error messages, or HTTP responses beyond Set-Cookie headers.
- ALWAYS invalidate sessions on password change, email change, or security-sensitive operations.

### Rate Limiting
- ALWAYS implement rate limiting for authentication endpoints (sign-in, sign-up, password reset, OTP verification).
- Use the `rateLimit` table and Better Auth's built-in rate limiting plugins.
- NEVER allow unlimited authentication attempts—enforce exponential backoff for failed attempts.

### Email Security
- ALWAYS use `renderEmail` templates for auth emails; NEVER interpolate user-controlled content into email bodies.
- ALWAYS redact recipient addresses in logs; use structured logging with `Effect.annotateLogs`.
- NEVER include sensitive tokens directly in email body text—use secure, time-limited URLs.

## Contributor Checklist
- [ ] New repos: use `DbRepo.make` from `@beep/shared-domain/factories`, register dependencies in `_common.ts`, export via `repos/index.ts`, and append `.Default` to `IamRepos.layer` in `repositories.ts`.
- [ ] Better Auth plugin changes: update corresponding schema additions in `Options.ts` plus invitation/email hooks; ensure all plugins are registered.
- [ ] Configuration tweaks: use `serverEnv` from `@beep/shared-env/ServerEnv`; document required env keys in `documentation/patterns/` if new secrets arise.
- [ ] Layer graphs: validate wiring by running `bun run check --filter @beep/iam-server` and inspecting for missing service requirements.
- [ ] Emails: prefer email templates from `@beep/shared-server/Email`; pass redacted values for secrets and recipients.
- [ ] Tests: add or extend `_internal/db-admin` suites when touching repo behavior; confirm Docker availability before relying on them.
