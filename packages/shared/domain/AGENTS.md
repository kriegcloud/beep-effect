# @beep/shared-domain — AGENTS Guide

## Purpose & Fit
- Defines the shared kernel for all vertical slices (IAM, Documents, Calendar, Knowledge, Comms, Customization): branded entity ids, relational models, path/value objects, cache/policy primitives, retry utilities, encryption services, and cross-slice constants consumed by `apps/*` and `packages/{iam,documents,calendar,knowledge,comms,customization}/*`.
- Builds on the schema utilities in `@beep/schema` (`BS` helpers, `EntityId.make`) and provides reusable domain infrastructure. Consumers should import from this package instead of duplicating schema logic.
- Provides a central contract other slices rely on for data access (Effect models via `@effect/sql/Model`), routing (`paths` collection), authorization (`Policy`), caching (`ManualCache`), retry strategies (`Retry`), and encryption (`EncryptionService`). Keep exports stable and align changes with downstream expectations.

## Surface Map
- **`src/common.ts`** — Audit/user tracking column sets (`auditColumns`, `userTrackingColumns`, `globalColumns`) and `makeFields` helper that merges id, audit metadata, and custom columns when creating `M.Class` entity models.
- **`src/entity-ids/*`**
  - `shared/ids.ts`, `iam/ids.ts`, `documents/ids.ts`, `customization/ids.ts`, `comms/ids.ts` house branded id schemas built with `EntityId.make`.
  - `*/table-name.ts` provides literal kits (`SharedTableNames`, `IamTableNames`, `DocumentsTableNames`, etc.).
  - `entity-kind.ts` emits `EntityKind` union aligned with table names.
  - `any-entity-id.ts` aggregates every id. **Known Issue**: `SubscriptionId` is duplicated (included from both `SharedEntityIds` and `IamEntityIds`); exhaustive pattern matching will have redundant cases until deduplicated.
  - `entity-ids.ts` re-exports kits as namespaces (`SharedEntityIds`, `IamEntityIds`, `DocumentsEntityIds`, `CustomizationEntityIds`, `CommsEntityIds`).
- **`src/entities/*`** — Effect `M.Class` schemas for `AuditLog`, `File`, `Folder`, `Organization`, `Session`, `Team`, `UploadSession`, `User` plus nested schema enums (e.g. `OrganizationType`, `SubscriptionStatus`, `SubscriptionTier`, `UserRole`). `File/schemas/UploadKey.ts` encodes S3 path transforms.
- **`src/value-objects/`**
  - `paths.ts` — Safe `PathBuilder.collection` of all public routes, combining static strings and dynamic helpers (auth flows, dashboard, API endpoints).
  - `EntitySource.ts` — Source metadata for entity tracking.
- **`src/Policy.ts`** — Current user context tags (`AuthContext`, `CurrentUser`), `AuthContextHttpMiddleware`, `PolicyRecord` schema, permission literals, combinators `policy`, `withPolicy`, `all`, `any`, `permission`.
- **`src/ManualCache.ts`** — Public façade over `_internal/manual-cache.ts`, exposing scoped cache creation with TTL+LRU semantics.
- **`src/Retry.ts`** — Exponential backoff retry policy factory with configurable delay, growth factor, jitter, and max retries.
- **`src/services/EncryptionService/`** — Encryption service for cryptographic operations with schema-based validation.
- **`src/api/`** — HTTP API definition (`SharedApi`) combining domain contracts via `@effect/platform/HttpApi`.
- **`src/rpc/`** — RPC definitions for file operations, health checks, and event streaming.
- **`src/factories/`** — Utilities for error codes, model kits, and path builders.
- **`src/_internal/*`** — Implementation details (`manual-cache` data structures, `path-builder` recursion, `policy.makePermissions`, `policy-builder`). Do not import these directly from downstream slices; they are subject to churn.

## Usage Snapshots
- `apps/web/src/providers/AuthGuard.tsx` — redirects anonymous users with `paths.auth.signIn` inside router effects.
- `packages/iam/server/src/adapters/better-auth/BetterAuthBridge.ts` — consumes `IamEntityIds`, `SharedEntityIds`, and `paths` when configuring Better Auth hooks and email URLs.
- See `EntityIds` for branded ID types.
- See `test/entities/File/schemas/UploadPath.test.ts` for `File.UploadKey` encode/decode round-trips and shard prefix guarantees.
- See `test/internal/policy.test.ts` for `Policy.permission`, `Policy.all`, and `Policy.any` behavior with layered fallbacks.


## Authoring Guardrails
- Preserve Effect namespacing rules (import modules as `import * as Effect from "effect/Effect";`, `import * as A from "effect/Array";`, etc.) and NEVER introduce native array/string helpers in new code. `Effect.all` and `Effect.firstSuccessOf` give structured sequencing/fallback.
- When defining new models, ALWAYS route through `makeFields` so ids + audit and optimistic locking columns remain consistent. Align `EntityId` selection with the appropriate kit (Shared vs IAM vs WMS) to keep table metadata coherent.
- Extending permissions? Update the literal map inside `Policy.ts` (uses `_internal/policy.makePermissions`) and backfill tests; new keys MUST follow the `{tableName}:{action}` pattern to stay compatible with `Policy.permission`.
- IMPORTANT: Treat `_internal` as a closed namespace. Any enhancement (e.g., manual cache behavior) should surface via the public wrapper (`ManualCache.make`) unless there is consensus to promote utilities.
- `AnyEntityId` currently duplicates `IamEntityIds.SubscriptionId`; document and resolve before relying on exhaustive unions in new code.
- IMPORTANT: Only mutate `paths` with `PathBuilder.createRoot`/`collection`. Adding raw strings loosens validation and bypasses `BS.URLPath` branding enforced by `_internal/path-builder`.

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

const targetUserId = SharedEntityIds.UserId.make("shared_user__abc123");

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
  const decoded: File.UploadKeyDecoded.Type = {
    env: "dev" as EnvValue.Type,
    fileId: SharedEntityIds.FileId.make("shared_file__12345678-1234-1234-1234-123456789012"),
    organizationType: "individual",
    organizationId: SharedEntityIds.OrganizationId.make(
      "shared_organization__87654321-4321-4321-4321-210987654321"
    ),
    entityKind: "shared_user",
    entityIdentifier: SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321"),
    entityAttribute: "avatar",
    extension: "jpg",
  };
  return yield* S.decode(File.UploadKey)(decoded);
});
```

## Verifications
- `bun run --filter @beep/shared-domain test` — executes Bun/Vitest suite (ManualCache, Policy, UploadPath coverage).
- `bun run --filter @beep/shared-domain lint` — Biome hygiene; ensures no forbidden native helpers slip in.
- `bun run --filter @beep/shared-domain check` — TypeScript project references for schema/model drift.
- For focused work on upload paths: `bun test packages/shared/domain/test/entities/File/schemas/UploadPath.test.ts`.

## Gotchas

### ManualCache Scoped Lifecycle
- `ManualCache.make` returns an `Effect.Effect<Cache, never, Scope>`, meaning the cache is scoped and will be finalized when the scope closes. If you create a cache inside an API handler's `Effect.gen`, the cache is destroyed when the request completes. For persistent caches, create them at layer construction time.
- Cache `get` returns `Option<V>`, not the value directly. Forgetting to handle `Option.none()` leads to silent cache misses that appear as undefined values downstream.

### Policy Combinator Short-Circuiting
- `Policy.all` fails fast on the first policy failure; subsequent policies are not evaluated. If you need to collect all failure reasons (e.g., for detailed error messages), use `Effect.validate` or manual sequencing instead.
- `Policy.any` succeeds on the first passing policy, but if all policies fail, only the last failure is surfaced. This can mask the "real" reason access was denied when debugging authorization issues.
- `Policy.permission("table:action")` returns `Effect.succeed(false)` if the permission is missing from the user's permissions array, not an error. Distinguishing "no permission" from "permission check failed" requires explicit handling.

### Entity ID Brand Confusion
- All entity IDs are branded strings (e.g., `UserId`, `OrganizationId`), but TypeScript's structural typing means a raw `string` can accidentally be passed where a branded ID is expected if not using strict schema decoding. ALWAYS decode IDs through their respective schema (`SharedEntityIds.UserId`) at API boundaries.
- `AnyEntityId` includes duplicate `SubscriptionId` entries; exhaustive pattern matching against `AnyEntityId` will have redundant cases. This is a known issue flagged for cleanup.

### PathBuilder URL Encoding
- `paths` collection builds typed URL paths, but does not automatically encode path parameters. If an entity ID contains special characters (unlikely but possible with custom IDs), the resulting URL may be malformed. ALWAYS use `encodeURIComponent` for user-provided path segments.
- Adding raw string paths to `paths` bypasses `BS.URLPath` branding and validation. ALWAYS use `PathBuilder.createRoot`/`collection` methods to maintain type safety.

### Retry Policy Jitter
- `Retry` factory adds jitter by default to prevent thundering herd. However, the jitter is pseudo-random and not cryptographically secure. For security-sensitive retries (e.g., authentication), this is acceptable, but do not use the retry delay as an entropy source.
- Maximum retry count is configured at policy creation. Once exhausted, the effect fails with the last error. There is no built-in circuit breaker; implement one separately if needed for external service calls.

### EncryptionService IV Reuse
- The `EncryptionService` generates a fresh IV for each encryption call. NEVER reuse IVs from previous encryptions; AES-GCM security guarantees are void with IV reuse. The service handles this correctly, but manual crypto code must not bypass it.

### Model Schema Evolution
- `makeFields` includes `version` for optimistic locking. Changing the schema (adding/removing fields) does not automatically increment the version; this must be done explicitly in migration code. Stale clients may overwrite newer data if version checks are not enforced.

## Security

### EncryptionService Key Management
- ALWAYS use `Redacted.Redacted<T>` for encryption keys and secrets to prevent accidental exposure in logs or error messages.
- NEVER log raw key material, decrypted data, or plaintext secrets—Effect's `Redacted` module prevents `.toString()` leakage but vigilance is required in custom logging.
- ALWAYS use the `EncryptionService` context tag for cryptographic operations; NEVER instantiate `crypto.subtle` directly in application code.
- ALWAYS use `crypto.getRandomValues()` (via `generateKey` or `generateIV`) for secure random number generation; NEVER use `Math.random()` for security-sensitive values.

### Key Rotation Patterns
- When rotating encryption keys, retain old keys in a key ring to decrypt existing data, then re-encrypt with the new key.
- ALWAYS derive space-specific keys using `deriveKey` (HKDF) from a master key rather than storing multiple independent keys.
- NEVER hardcode encryption keys in source code; load from environment via `@beep/env` and wrap in `Redacted`.

### Sensitive Data Handling
- NEVER log decrypted payloads, plaintext passwords, or any PII in `Effect.log*` calls.
- ALWAYS validate encrypted payload schemas (`EncryptedPayload`, `EncryptedPayloadBinary`) before attempting decryption to fail fast on malformed input.
- ALWAYS use constant-time comparison (via HMAC verification) when validating signatures to prevent timing attacks.

## Contributor Checklist
- Align new ids with the correct kit (`SharedEntityIds`, `IamEntityIds`, `DocumentsEntityIds`) and update `EntityKind` / `AnyEntityId` unions in tandem. Document pending anomalies (e.g., duplicate `SubscriptionId`).
- When adding columns to models, stitch them through `makeFields` and review downstream table definitions (`packages/_internal/db-admin`).
- Extending permissions? Update `Policy` map, regenerate derived literals, and add coverage in `packages/shared/domain/test/policy.test.ts`.
- Route additions must go through `value-objects/paths.ts` using `PathBuilder.collection`; update UI/CLIENT references if structure changes.
- Touching `ManualCache` internals requires reviewing concurrency semantics and `ManualCache.test.ts`.
- Sync with sibling guides: reference `packages/common/schema/AGENTS.md` for schema patterns and `packages/common/constants/AGENTS.md` for path builder conventions; cross-link any new patterns.
- After documentation or API updates, refresh this guide and append a blurb in the root `AGENTS.md` package list.
