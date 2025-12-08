# @beep/shared-domain — AGENTS Guide

## Purpose & Fit
- Defines the shared kernel for IAM, Documents, and Files slices: branded entity ids, relational models, path/value objects, cache/policy primitives, retry utilities, encryption services, and cross-slice constants consumed by `apps/*`, `packages/iam/*`, and `packages/documents/*`.
- Builds on the schema utilities in `@beep/schema` (`BS` helpers, `EntityId.make`) and provides reusable domain infrastructure. Consumers should import from this package instead of duplicating schema logic.
- Provides a central contract other slices rely on for data access (Effect models via `@effect/sql/Model`), routing (`paths` collection), authorization (`Policy`), caching (`ManualCache`), retry strategies (`Retry`), and encryption (`EncryptionService`). Keep exports stable and align changes with downstream expectations.

## Surface Map
- **`src/common.ts`** — Audit/user tracking column sets (`auditColumns`, `userTrackingColumns`, `globalColumns`) and `makeFields` helper that merges id, audit metadata, and custom columns when creating `M.Class` entity models.
- **`src/entity-ids/*`**
  - `shared.ts`, `iam.ts`, `documents.ts` house branded id schemas built with `EntityId.make`.
  - `table-names.ts` provides literal kits (`SharedTableNames`, `IamTableNames`, `DocumentsTableNames`, `AnyTableName`).
  - `entity-kind.ts` emits `EntityKind` union aligned with table names.
  - `any-entity-id.ts` aggregates every id (note: `SubscriptionId` appears twice on lines 17-18; flag for cleanup).
  - `index.ts` re-exports kits (`SharedEntityIds`, `IamEntityIds`, `DocumentsEntityIds`).
- **`src/entities/*`** — Effect `M.Class` schemas for `AuditLog`, `File`, `Organization`, `Session`, `Team`, `User` plus nested schema enums (e.g. `OrganizationType`, `SubscriptionStatus`, `UserRole`). `File/schemas/UploadPath.ts` encodes S3 path transforms. `File.Contract` provides HTTP API contracts.
- **`src/value-objects/`**
  - `paths.ts` — Safe `PathBuilder.collection` of all public routes, combining static strings and dynamic helpers (auth flows, dashboard, API endpoints).
  - `EntitySource.ts` — Source metadata for entity tracking.
- **`src/Policy.ts`** — Current user context tags (`AuthContext`, `CurrentUser`), `AuthContextHttpMiddleware`, `PolicyRecord` schema, permission literals, combinators `policy`, `withPolicy`, `all`, `any`, `permission`.
- **`src/ManualCache.ts`** — Public façade over `_internal/manual-cache.ts`, exposing scoped cache creation with TTL+LRU semantics.
- **`src/Retry.ts`** — Exponential backoff retry policy factory with configurable delay, growth factor, jitter, and max retries.
- **`src/services/EncryptionService/`** — Encryption service for cryptographic operations with schema-based validation.
- **`src/DomainApi.ts`** — Top-level HTTP API definition combining domain contracts.
- **`src/factories/`** — Utilities for error codes, model kits, and path builders.
- **`src/_internal/*`** — Implementation details (`manual-cache` data structures, `path-builder` recursion, `policy.makePermissions`, `policy-builder`). Do not import these directly from downstream slices; they are subject to churn.

## Usage Snapshots
- `apps/web/src/middleware.ts:3` — imports `paths` to drive auth/public route logic and string guards.  
- `apps/web/src/middleware.ts:10` — leverages `paths.auth.signIn` / `paths.auth.signUp` to normalize protected route redirects.  
- `apps/web/src/providers/AuthGuard.tsx:37` — redirects anonymous users with `paths.auth.signIn` inside router effects.  
- `packages/iam/infra/src/adapters/better-auth/Auth.service.ts:7` — consumes `IamEntityIds`, `SharedEntityIds`, and `paths` when configuring Better Auth hooks and email URLs.  
- `packages/shared/domain/test/entities/File/schemas/UploadPath.test.ts:11` — exercises `File.UploadPath` encode/decode round-trips and shard prefix guarantees.  
- `packages/shared/domain/test/policy.test.ts:70` — demonstrates `Policy.permission`, `Policy.all`, and `Policy.any` behavior with layered fallbacks.


## Authoring Guardrails
- Preserve Effect namespacing rules (import modules as `import * as Effect from "effect/Effect";`, `import * as A from "effect/Array";`, etc.) and never introduce native array/string helpers in new code. `Effect.all` and `Effect.firstSuccessOf` give structured sequencing/fallback (`effect_docs` above).
- When defining new models, always route through `makeFields` so ids + audit and optimistic locking columns remain consistent. Align `EntityId` selection with the appropriate kit (Shared vs IAM vs WMS) to keep table metadata coherent.
- Extending permissions? Update the literal map inside `Policy.ts` (uses `_internal/policy.makePermissions`) and backfill tests; new keys must follow the `{tableName}:{action}` pattern to stay compatible with `Policy.permission`.
- Treat `_internal` as a closed namespace. Any enhancement (e.g., manual cache behavior) should surface via the public wrapper (`ManualCache.make`) unless there is consensus to promote utilities.
- `AnyEntityId` currently duplicates `IamEntityIds.SubscriptionId`; document and resolve before relying on exhaustive unions in new code.
- Only mutate `paths` with `PathBuilder.createRoot`/`collection`. Adding raw strings loosens validation and bypasses `BS.URLPath` branding enforced by `_internal/path-builder`.

## Quick Recipes
```ts
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain";

// Define a new shared model with reusable audit columns.
export class DocumentModel extends M.Class<DocumentModel>("DocumentModel")(
  makeFields(SharedEntityIds.FileId, {
    title: S.NonEmptyString,
    organizationId: SharedEntityIds.OrganizationId,
  })
) {}
```

```ts
import { paths } from "@beep/shared-domain";

// Build a typed invite URL without manual string joins.
const inviteUrl = paths.auth.routes.signIn.withCallbackAndMethod(
  "https://app.example.com/callback",
  "email"
);
```

```ts
import * as Effect from "effect/Effect";
import * as Policy from "@beep/shared-domain/Policy";
import { SharedEntityIds } from "@beep/shared-domain";

const targetUserId = SharedEntityIds.UserId.make("user__abc123");

const canManage = Policy.permission("__test:manage");
const isSelf = Policy.policy((user) => Effect.succeed(user.userId === targetUserId));
const accessPolicy = Policy.any(Policy.all(canManage, Policy.permission("__test:read")), isSelf);

const guardedEffect = Policy.withPolicy(accessPolicy)(
  Effect.gen(function* () {
    return yield* Effect.succeed("saved");
  })
);
```

```ts
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import * as ManualCache from "@beep/shared-domain/ManualCache";

const program = Effect.scoped(
  Effect.gen(function* () {
    const cache = yield* ManualCache.make<string, number>({
      capacity: 100,
      timeToLive: Duration.minutes(5),
    });
    yield* cache.set("key", 42);
    return yield* cache.get("key");
  })
);
```

```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { File, SharedEntityIds } from "@beep/shared-domain";
import type { EnvValue } from "@beep/constants";

const uploadPath = Effect.gen(function* () {
  const decoded: File.UploadPathDecoded.Type = {
    env: "dev" as EnvValue.Type,
    fileId: SharedEntityIds.FileId.make("file__12345678-1234-1234-1234-123456789012"),
    organizationType: "individual",
    organizationId: SharedEntityIds.OrganizationId.make(
      "organization__87654321-4321-4321-4321-210987654321"
    ),
    entityKind: "user",
    entityIdentifier: SharedEntityIds.UserId.make("user__87654321-4321-4321-4321-210987654321"),
    entityAttribute: "avatar",
    fileItemExtension: "jpg",
  };
  return yield* S.decode(File.UploadPath)(decoded);
});
```

## Verifications
- `bun run --filter @beep/shared-domain test` — executes Bun/Vitest suite (ManualCache, Policy, UploadPath coverage).
- `bun run --filter @beep/shared-domain lint` — Biome hygiene; ensures no forbidden native helpers slip in.
- `bun run --filter @beep/shared-domain check` — TypeScript project references for schema/model drift.
- For focused work on upload paths: `bun test packages/shared/domain/test/entities/File/schemas/UploadPath.test.ts`.

## Contributor Checklist
- Align new ids with the correct kit (`SharedEntityIds`, `IamEntityIds`, `DocumentsEntityIds`) and update `EntityKind` / `AnyEntityId` unions in tandem. Document pending anomalies (e.g., duplicate `SubscriptionId`).
- When adding columns to models, stitch them through `makeFields` and review downstream table definitions (`packages/_internal/db-admin`).
- Extending permissions? Update `Policy` map, regenerate derived literals, and add coverage in `packages/shared/domain/test/policy.test.ts`.
- Route additions must go through `value-objects/paths.ts` using `PathBuilder.collection`; update UI/SDK references if structure changes.
- Touching `ManualCache` internals requires reviewing concurrency semantics and `ManualCache.test.ts`.
- Sync with sibling guides: reference `packages/common/schema/AGENTS.md` for schema patterns and `packages/common/constants/AGENTS.md` for path builder conventions; cross-link any new patterns.
- After documentation or API updates, refresh this guide and append a blurb in the root `AGENTS.md` package list.
