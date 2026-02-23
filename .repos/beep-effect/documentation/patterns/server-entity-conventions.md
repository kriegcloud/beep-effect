# Server Entity Conventions

Canonical conventions for implementing entity infrastructure in slice server packages. These conventions mirror the domain entity directory structure to maintain intuitive navigation across the vertical slice boundary.

## Motivation

- `Effect.Service` is deprecated and will be removed in Effect v4
- Server packages should mirror domain package directory structure for navigability
- Someone familiar with `packages/{slice}/domain/src/entities/{Entity}/` should intuitively know where to find the server implementation
- Each repo should be self-contained with its own Layer provision (Layer memoization ensures no duplication)

## Directory Structure

### Domain (existing canonical pattern — for reference)

```
packages/{slice}/domain/src/entities/{EntityName}/
├── {EntityName}.model.ts       # M.Class definition
├── {EntityName}.errors.ts      # TaggedError classes
├── {EntityName}.entity.ts      # ClusterEntity definition
├── {EntityName}.repo.ts        # Context.Tag + RepoShape TYPE only
├── {EntityName}.http.ts        # HttpApiGroup
├── {EntityName}.rpc.ts         # RpcGroup
├── {EntityName}.tool.ts        # AI toolkit
├── contracts/                  # Contract schemas
│   ├── index.ts
│   ├── Get.contract.ts
│   ├── Delete.contract.ts
│   └── FindBy{X}.contract.ts
└── index.ts                    # Barrel
```

### Server (new canonical pattern)

```
packages/{slice}/server/src/entities/{EntityName}/
├── {EntityName}.repo.ts        # Repository implementation (always present)
└── index.ts                    # Barrel: export * from "./{EntityName}.repo"
```

The `entities/` directory replaces `db/repos/` for new repositories. The `db/` directory continues to hold `Db.ts` (the slice database factory) and `repositories.ts` (the Layer aggregator).

### Full server package layout

```
packages/{slice}/server/src/
├── db/
│   ├── Db.ts                   # Slice database factory ({Slice}Db)
│   ├── Db/                     # (or Db/ directory variant)
│   └── repositories.ts         # Layer aggregator merging all repo Layers
├── entities/
│   ├── index.ts                # Namespace barrel: export * as {Entity}Live from "./{Entity}"
│   ├── Account/
│   │   ├── Account.repo.ts
│   │   └── index.ts
│   ├── Member/
│   │   ├── Member.repo.ts
│   │   └── index.ts
│   └── ...
└── index.ts                    # Package barrel
```

## Repository Implementation

### Simple repository (base CRUD only)

When the domain `RepoShape` is just `DbRepoSuccess<typeof Model>` with no custom methods:

```ts
import { Entities } from "@beep/{slice}-domain";
import { {Slice}EntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
import type { DbClient } from "@beep/shared-server";
import { {Slice}Db } from "@beep/{slice}-server/db";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(
  {Slice}EntityIds.{Entity}Id,
  Entities.{Entity}.Model
);

export const RepoLive: Layer.Layer<
  Entities.{Entity}.Repo,
  never,
  DbClient.SliceDbRequirements
> = Layer.effect(Entities.{Entity}.Repo, serviceEffect)
      .pipe(Layer.provide({Slice}Db.layer));
```

### Extended repository (custom queries)

When the domain `RepoShape` declares additional methods beyond base CRUD:

```ts
import { $_{Slice}ServerId } from "@beep/identity/packages";
import { Entities } from "@beep/{slice}-domain";
import { {Slice}EntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-server/factories";
import type { DbClient } from "@beep/shared-server";
import { {Slice}Db } from "@beep/{slice}-server/db";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

const $I = $_{Slice}ServerId.create("entities/{Entity}/{Entity}.repo");

// --- Request/Result schemas for SqlSchema queries ---

class FindByOwnerRequest extends S.Class<FindByOwnerRequest>($I`FindByOwnerRequest`)({
  ownerId: SharedEntityIds.UserId,
}) {}

// --- Extension factory ---

const make{Entity}Extensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findByOwnerSchema = SqlSchema.findAll({
    Request: FindByOwnerRequest,
    Result: Entities.{Entity}.Model,
    execute: (req) => sql`
      SELECT * FROM {table_name}
      WHERE owner_id = ${req.ownerId}
      ORDER BY created_at DESC
    `,
  });

  const findByOwner = (
    ownerId: SharedEntityIds.UserId.Type
  ): Effect.Effect<ReadonlyArray<Entities.{Entity}.Model>, DatabaseError> =>
    findByOwnerSchema({ ownerId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("{Entity}Repo.findByOwner", {
        captureStackTrace: false,
        attributes: { ownerId },
      })
    );

  return { findByOwner };
});

// --- Service effect & Layer ---

const serviceEffect = DbRepo.make(
  {Slice}EntityIds.{Entity}Id,
  Entities.{Entity}.Model,
  make{Entity}Extensions
);

export const RepoLive: Layer.Layer<
  Entities.{Entity}.Repo,
  never,
  DbClient.SliceDbRequirements
> = Layer.effect(Entities.{Entity}.Repo, serviceEffect)
      .pipe(Layer.provide({Slice}Db.layer));
```

## Barrel Exports

### Entity barrel (`entities/{EntityName}/index.ts`)

```ts
export * from "./{EntityName}.repo";
```

### Entities barrel (`entities/index.ts`)

Use namespace exports so consumers reference `Live.AccountLive.RepoLive`:

```ts
export * as AccountLive from "./Account";
export * as MemberLive from "./Member";
export * as InvitationLive from "./Invitation";
// ... one line per entity
```

### Aggregator (`db/repositories.ts`)

```ts
import type { DbClient } from "@beep/shared-server";
import type { Entities } from "@beep/{slice}-domain";
import * as Layer from "effect/Layer";
import * as Live from "../entities";

export type Repos =
  | Entities.Account.Repo
  | Entities.Member.Repo
  | Entities.Invitation.Repo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements>;

export const layer: ReposLayer = Layer.mergeAll(
  Live.AccountLive.RepoLive,
  Live.MemberLive.RepoLive,
  Live.InvitationLive.RepoLive
);
```

Key points:
- `Repos` union uses domain `Context.Tag` types (e.g. `Entities.Account.Repo`)
- `ReposLayer` requirements are `DbClient.SliceDbRequirements` (not `SliceDb.Db | SqlClient`) because each `RepoLive` already provides its own `SliceDb.layer`
- No `export * from "./repos"` — the old flat repos barrel is replaced by the entities barrel

## Naming Conventions

| Concept | Name | Rationale |
|---------|------|-----------|
| Repository Layer export | `RepoLive` | Short; entity name comes from the namespace (`AccountLive.RepoLive`) |
| Domain Context.Tag | `Entities.{Entity}.Repo` | Defined in domain; server references it, never redefines |
| Namespace export | `{Entity}Live` | Signals "this is the live implementation" |
| Extension factory | `make{Entity}Extensions` | Consistent with `DbRepo.make` third argument convention |
| Identity prefix | `$_{Slice}ServerId.create("entities/{Entity}/{Entity}.repo")` | Mirrors domain identity path style |
| Service effect | `serviceEffect` | Module-scoped const; no need for entity prefix (file provides scope) |

## What NOT to do

- **No `Effect.Service` class** — use `serviceEffect` + `Layer.effect` directly
- **No `_common.ts`** — each repo provides its own `SliceDb.layer` via `Layer.provide`; Layer memoization deduplicates
- **No duplicate `Context.Tag`** in server — reference `Entities.{Entity}.Repo` from domain
- **No `{Entity}RepoLive` naming** — use `RepoLive` (the namespace provides the entity name)
- **No `{Entity}RepoShape` type in server** — the shape type lives in domain's `{Entity}.repo.ts`
- **No `.Default` accessor** — `Effect.Service` is removed; use explicit `RepoLive` Layer

## Migration Checklist

When migrating an existing `db/repos/{Entity}.repo.ts` to the new convention:

1. Create `entities/{Entity}/` directory
2. Create `entities/{Entity}/{Entity}.repo.ts` with `serviceEffect` + `Layer.effect` pattern
3. Create `entities/{Entity}/index.ts` barrel
4. Add `export * as {Entity}Live from "./{Entity}"` to `entities/index.ts`
5. Update `db/repositories.ts`:
   - Change `Repos` union to use `Entities.{Entity}.Repo` (domain tag)
   - Change `layer` to use `Live.{Entity}Live.RepoLive`
   - Remove old `repos.*` references
6. Remove old `db/repos/{Entity}.repo.ts`
7. Update old `db/repos/index.ts` (remove the export line)
8. When all repos are migrated: remove `db/repos/` directory and `_common.ts`
9. Verify: `bun run check --filter @beep/{slice}-server`

## Layer Memoization

Each `RepoLive` calls `Layer.provide(SliceDb.layer)`. This is safe because Effect memoizes Layers:

```ts
// These three repos all provide KnowledgeDb.layer, but it's constructed ONCE
const layer = Layer.mergeAll(
  Live.EntityLive.RepoLive,      // provides KnowledgeDb.layer internally
  Live.OntologyLive.RepoLive,    // same — memoized, not duplicated
  Live.RelationLive.RepoLive     // same — memoized, not duplicated
);
```

This makes each repo self-contained without the overhead of shared `_common.ts` dependency arrays, and without constructing multiple database connections.
