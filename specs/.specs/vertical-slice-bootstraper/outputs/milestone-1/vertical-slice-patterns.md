# Vertical Slice Patterns

> Comprehensive guide to creating vertical slices in the `beep-effect` monorepo following the 5-sub-package pattern.

---

## 1. Overview

Each vertical slice follows the `domain -> tables -> server -> client -> ui` layering pattern:

| Layer | Purpose | Dependencies |
|-------|---------|--------------|
| **domain** | Pure business logic, entities, value objects | `@beep/shared-domain`, `@beep/schema`, `@effect/sql` |
| **tables** | Drizzle schema definitions | `@beep/shared-tables`, `@beep/{slice}-domain`, `drizzle-orm` |
| **server** | Database clients, repos, infrastructure | `@beep/{slice}-tables`, `@beep/{slice}-domain`, `@beep/shared-server` |
| **client** | SDK contracts for client-side | `@beep/{slice}-domain`, `@beep/contract` |
| **ui** | React components | `@beep/{slice}-client`, `@beep/ui` |

### Package Naming Convention

```
@beep/{slice}-domain
@beep/{slice}-tables
@beep/{slice}-server
@beep/{slice}-client
@beep/{slice}-ui
```

### Directory Structure

```
packages/{slice}/
├── domain/
│   ├── src/
│   │   ├── index.ts
│   │   ├── entities.ts
│   │   └── entities/
│   │       └── {Entity}/
│   │           ├── index.ts
│   │           └── {Entity}.model.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.src.json
│   ├── tsconfig.build.json
│   └── tsconfig.test.json
├── tables/
│   ├── src/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── relations.ts
│   │   ├── _check.ts
│   │   └── tables/
│   │       ├── index.ts
│   │       └── {entity}.table.ts
│   ├── package.json
│   └── tsconfig.*.json
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── db.ts
│   │   └── db/
│   │       ├── index.ts
│   │       ├── Db/
│   │       │   ├── index.ts
│   │       │   └── Db.ts
│   │       ├── repos/
│   │       │   ├── index.ts
│   │       │   ├── _common.ts
│   │       │   └── {Entity}.repo.ts
│   │       └── repositories.ts
│   ├── package.json
│   └── tsconfig.*.json
├── client/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.*.json
└── ui/
    ├── src/
    │   └── index.ts
    ├── package.json
    └── tsconfig.*.json
```

---

## 2. Domain Layer

The domain layer contains pure business logic with no side effects.

### 2.1 Model Definition Pattern

```typescript
// packages/{slice}/domain/src/entities/{Entity}/{Entity}.model.ts
import { ${I} from "@beep/identity/packages";
import { {Slice}EntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = ${SlicePascal}DomainId.create("entities/{Entity}");

/**
 * {Entity}Model model representing {description}.
 */
export class Model extends M.Class<Model>($I`{Entity}Model`)(
  makeFields({Slice}EntityIds.{Entity}Id, {
    // Add entity-specific fields here
    userId: SharedEntityIds.UserId,
    // For JSON fields:
    data: M.JsonFromString(S.Record({ key: S.String, value: S.String })),
  }),
  $I.annotations("{Entity}Model", {
    description: "{Entity}Model model representing {description}.",
  })
) {
  static readonly utils = modelKit(Model);
}
```

### 2.2 Entity Index

```typescript
// packages/{slice}/domain/src/entities/{Entity}/index.ts
export * from "./{Entity}.model";
```

```typescript
// packages/{slice}/domain/src/entities/index.ts
export * as {Entity} from "./{Entity}";
```

### 2.3 Domain Entry Point

```typescript
// packages/{slice}/domain/src/entities.ts
export * from "./entities";
```

```typescript
// packages/{slice}/domain/src/index.ts
export * as Entities from "./entities";
```

### 2.4 Domain Package.json

```json
{
  "name": "@beep/{slice}-domain",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "The domain layer for the {slice} context",
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "directory": "dist",
    "linkDirectory": false
  },
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:kriegcloud/beep-effect.git",
    "directory": "packages/{slice}/domain"
  },
  "scripts": {
    "build": "bun run build-esm && bun run build-cjs && bun run build-annotate",
    "dev": "tsc -b tsconfig.build.json --watch",
    "build-esm": "tsc -b tsconfig.build.json",
    "build-cjs": "babel build/esm --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir build/cjs --source-maps",
    "build-annotate": "babel build/esm --plugins annotate-pure-calls --out-dir build/esm --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "bun test",
    "coverage": "bun test --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check . --write",
    "lint:circular": "bunx madge -c ."
  },
  "peerDependencies": {
    "@beep/shared-domain": "workspace:^",
    "@beep/schema": "workspace:^",
    "effect": "catalog:",
    "@effect/sql": "catalog:"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "@beep/shared-domain": "workspace:^",
    "@beep/schema": "workspace:^",
    "effect": "catalog:",
    "@effect/sql": "catalog:",
    "@total-typescript/ts-reset": "catalog:"
  },
  "effect": {
    "generateExports": {
      "include": ["**/*.ts"]
    },
    "generateIndex": {
      "include": ["**/*.ts"]
    }
  }
}
```

---

## 3. Tables Layer

The tables layer contains Drizzle schema definitions.

### 3.1 Table Definition Pattern

```typescript
// packages/{slice}/tables/src/tables/{entity}.table.ts
import type { SharedEntityIds } from "@beep/shared-domain";
import { {Slice}EntityIds } from "@beep/shared-domain";
import { Table, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const {entity} = Table.make({Slice}EntityIds.{Entity}Id)(
  {
    // Foreign key example
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    // JSON column example
    data: pg.jsonb("data").notNull(),
    // Text column example
    name: pg.text("name").notNull(),
    // Optional column example
    description: pg.text("description"),
  },
  (t) => [
    // Indexes
    pg.index("{entity}_user_id_idx").on(t.userId),
  ]
);
```

### 3.2 Relations Definition

```typescript
// packages/{slice}/tables/src/relations.ts
import * as d from "drizzle-orm";
import { user, {entity} } from "./tables";

export const {entity}Relations = d.relations({entity}, ({ one }) => ({
  user: one(user, {
    fields: [{entity}.userId],
    references: [user.id],
  }),
}));

// Inverse relation (if needed for the external table)
export const userRelations = d.relations(user, ({ many }) => ({
  {entities}: many({entity}, {
    relationName: "user{Entities}",
  }),
}));
```

### 3.3 Tables Index

```typescript
// packages/{slice}/tables/src/tables/index.ts
export * from "./{entity}.table";
```

### 3.4 Schema Export

```typescript
// packages/{slice}/tables/src/schema.ts
export * from "./relations";
export * from "./tables";
```

### 3.5 Tables Entry Point

```typescript
// packages/{slice}/tables/src/index.ts
export * as {Slice}DbSchema from "./schema";
```

### 3.6 Check File (Type Verification)

```typescript
// packages/{slice}/tables/src/_check.ts
import type * as _Main from "@beep/{slice}-domain";
import type * as _Schema from "@beep/schema";
import type * as _SharedDomain from "@beep/shared-domain";
```

### 3.7 Tables Package.json

```json
{
  "name": "@beep/{slice}-tables",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "The package which contains table definitions for the {slice} context",
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "directory": "dist",
    "linkDirectory": false
  },
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:kriegcloud/beep-effect.git",
    "directory": "packages/{slice}/tables"
  },
  "scripts": {
    "build": "bun run build-esm && bun run build-cjs && bun run build-annotate",
    "dev": "tsc -b tsconfig.build.json --watch",
    "build-esm": "tsc -b tsconfig.build.json",
    "build-cjs": "babel build/esm --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir build/cjs --source-maps",
    "build-annotate": "babel build/esm --plugins annotate-pure-calls --out-dir build/esm --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "bun test",
    "coverage": "bun test --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check . --write",
    "lint:circular": "bunx madge -c ."
  },
  "peerDependencies": {
    "@beep/shared-tables": "workspace:^",
    "@beep/schema": "workspace:^",
    "@beep/shared-domain": "workspace:^",
    "@beep/{slice}-domain": "workspace:^",
    "drizzle-orm": "catalog:"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "@beep/shared-tables": "workspace:^",
    "@beep/schema": "workspace:^",
    "@beep/shared-domain": "workspace:^",
    "@beep/{slice}-domain": "workspace:^",
    "drizzle-orm": "catalog:",
    "@total-typescript/ts-reset": "catalog:"
  },
  "effect": {
    "generateExports": {
      "include": ["**/*.ts"]
    },
    "generateIndex": {
      "include": ["**/*.ts"]
    }
  }
}
```

---

## 4. Server Layer

The server layer contains database clients, repositories, and infrastructure.

### 4.1 Database Client Pattern

```typescript
// packages/{slice}/server/src/db/Db/Db.ts
import * as DbSchema from "@beep/{slice}-tables/schema";
import { ${SlicePascal}ServerId } from "@beep/identity/packages";
import { DbClient } from "@beep/shared-server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const $I = ${SlicePascal}ServerId.create("db/Db");

const serviceEffect: DbClient.PgClientServiceEffect<typeof DbSchema> = DbClient.make({
  schema: DbSchema,
});

export type Shape = DbClient.Shape<typeof DbSchema>;

export class Db extends Context.Tag($I`Db`)<Db, Shape>() {}

export const layer: Layer.Layer<Db, never, DbClient.SliceDbRequirements> = Layer.scoped(Db, serviceEffect);
```

```typescript
// packages/{slice}/server/src/db/Db/index.ts
export * as {Slice}Db from "./Db";
```

### 4.2 Repository Pattern

```typescript
// packages/{slice}/server/src/db/repos/_common.ts
import { {Slice}Db } from "@beep/{slice}-server/db";
export const dependencies = [{Slice}Db.layer] as const;
```

```typescript
// packages/{slice}/server/src/db/repos/{Entity}.repo.ts
import { Entities } from "@beep/{slice}-domain";
import { {Slice}Db } from "@beep/{slice}-server/db";
import { ${SlicePascal}ServerId } from "@beep/identity/packages";
import { {Slice}EntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = ${SlicePascal}ServerId.create("db/repos/{Entity}Repo");

export class {Entity}Repo extends Effect.Service<{Entity}Repo>()($I`{Entity}Repo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* {Slice}Db.Db;

    return yield* DbRepo.make({Slice}EntityIds.{Entity}Id, Entities.{Entity}.Model, Effect.succeed({}));
  }),
}) {}
```

```typescript
// packages/{slice}/server/src/db/repos/index.ts
export * from "./{Entity}.repo";
```

### 4.3 Repositories Layer

```typescript
// packages/{slice}/server/src/db/repositories.ts
import type { {Slice}Db } from "@beep/{slice}-server/db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos = repos.{Entity}Repo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | {Slice}Db.Db>;

export const layer: ReposLayer = Layer.mergeAll(repos.{Entity}Repo.Default);

export * from "./repos";
```

### 4.4 DB Index

```typescript
// packages/{slice}/server/src/db/index.ts
export * from "./Db";
export * from "./repos";
export * as {Slice}Repos from "./repositories";
```

### 4.5 Server Entry Point

```typescript
// packages/{slice}/server/src/db.ts
export * from "./db";
```

```typescript
// packages/{slice}/server/src/index.ts
export * from "./db";
```

### 4.6 Server Package.json

```json
{
  "name": "@beep/{slice}-server",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "The package which contains the infra layer for the {slice} slice",
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "directory": "dist",
    "linkDirectory": false
  },
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:kriegcloud/beep-effect.git",
    "directory": "packages/{slice}/server"
  },
  "scripts": {
    "build": "bun run build-esm && bun run build-cjs && bun run build-annotate",
    "dev": "tsc -b tsconfig.build.json --watch",
    "build-esm": "tsc -b tsconfig.build.json",
    "build-cjs": "babel build/esm --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir build/cjs --source-maps",
    "build-annotate": "babel build/esm --plugins annotate-pure-calls --out-dir build/esm --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "bun test",
    "coverage": "bun test --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check . --write",
    "lint:circular": "bunx madge -c ."
  },
  "peerDependencies": {
    "@effect/sql": "catalog:",
    "@effect/sql-drizzle": "catalog:",
    "@effect/sql-pg": "catalog:",
    "@beep/shared-server": "workspace:^",
    "@beep/shared-env": "workspace:^",
    "@beep/{slice}-tables": "workspace:^",
    "@effect/platform": "catalog:",
    "@beep/{slice}-domain": "workspace:^",
    "@beep/schema": "workspace:^",
    "drizzle-orm": "catalog:",
    "effect": "catalog:",
    "@beep/shared-domain": "workspace:^"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "@effect/sql": "catalog:",
    "@effect/sql-drizzle": "catalog:",
    "@effect/sql-pg": "catalog:",
    "@beep/{slice}-domain": "workspace:^",
    "@beep/{slice}-tables": "workspace:^",
    "@beep/schema": "workspace:^",
    "@effect/platform": "catalog:",
    "@beep/shared-server": "workspace:^",
    "@beep/shared-env": "workspace:^",
    "drizzle-orm": "catalog:",
    "effect": "catalog:",
    "@beep/shared-domain": "workspace:^",
    "@total-typescript/ts-reset": "catalog:"
  },
  "effect": {
    "generateExports": {
      "include": ["**/*.ts"]
    },
    "generateIndex": {
      "include": ["**/*.ts"]
    }
  }
}
```

---

## 5. Client Layer (Minimal)

```typescript
// packages/{slice}/client/src/index.ts
// Export client contracts when implemented
export {};
```

### Client Package.json

```json
{
  "name": "@beep/{slice}-client",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "Client SDK for the {slice} context",
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "directory": "dist",
    "linkDirectory": false
  },
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:kriegcloud/beep-effect.git",
    "directory": "packages/{slice}/client"
  },
  "scripts": {
    "build": "bun run build-esm && bun run build-cjs && bun run build-annotate",
    "dev": "tsc -b tsconfig.build.json --watch",
    "build-esm": "tsc -b tsconfig.build.json",
    "build-cjs": "babel build/esm --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir build/cjs --source-maps",
    "build-annotate": "babel build/esm --plugins annotate-pure-calls --out-dir build/esm --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "bun test",
    "coverage": "bun test --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check . --write"
  },
  "peerDependencies": {
    "@beep/{slice}-domain": "workspace:^",
    "@beep/contract": "workspace:^",
    "@beep/schema": "workspace:^",
    "effect": "catalog:"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "@beep/{slice}-domain": "workspace:^",
    "@beep/contract": "workspace:^",
    "@beep/schema": "workspace:^",
    "effect": "catalog:",
    "@total-typescript/ts-reset": "catalog:"
  }
}
```

---

## 6. UI Layer (Minimal)

```typescript
// packages/{slice}/ui/src/index.ts
// Export UI components when implemented
export {};
```

### UI Package.json

```json
{
  "name": "@beep/{slice}-ui",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "UI components for the {slice} context",
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "directory": "dist",
    "linkDirectory": false
  },
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"
  },
  "repository": {
    "type": "git",
    "url": "git@github.com:kriegcloud/beep-effect.git",
    "directory": "packages/{slice}/ui"
  },
  "scripts": {
    "build": "bun run build-esm && bun run build-cjs && bun run build-annotate",
    "dev": "tsc -b tsconfig.build.json --watch",
    "build-esm": "tsc -b tsconfig.build.json",
    "build-cjs": "babel build/esm --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --out-dir build/cjs --source-maps",
    "build-annotate": "babel build/esm --plugins annotate-pure-calls --out-dir build/esm --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "bun test",
    "coverage": "bun test --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check . --write"
  },
  "peerDependencies": {
    "@beep/{slice}-client": "workspace:^",
    "@beep/ui": "workspace:^",
    "react": "catalog:",
    "react-dom": "catalog:"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "@beep/{slice}-client": "workspace:^",
    "@beep/ui": "workspace:^",
    "react": "catalog:",
    "react-dom": "catalog:",
    "@total-typescript/ts-reset": "catalog:"
  }
}
```

---

## 7. Entity ID Registration Flow

Entity IDs must be registered in 4 places within `packages/shared/domain/src/entity-ids/`:

### Step 1: Create ID in `{slice}/ids.ts`

```typescript
// packages/shared/domain/src/entity-ids/{slice}/ids.ts
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/{slice}/ids");

export const {Entity}Id = EntityId.make("{table_name}", {
  brand: "{Entity}Id",
}).annotations(
  $I.annotations("{Entity}Id", {
    description: "A unique identifier for an {Entity}",
  })
);

export declare namespace {Entity}Id {
  export type Type = S.Schema.Type<typeof {Entity}Id>;
  export type Encoded = S.Schema.Encoded<typeof {Entity}Id>;
}
```

### Step 2: Add to `{slice}/any-id.ts`

```typescript
// packages/shared/domain/src/entity-ids/{slice}/any-id.ts
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/{slice}/any-id");

export class AnyId extends S.Union(Ids.{Entity}Id /* add more IDs here */).annotations(
  $I.annotations("Any{Slice}Id", {
    description: "Any entity id within the {slice} domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
```

### Step 3: Create TableName in `{slice}/table-name.ts`

```typescript
// packages/shared/domain/src/entity-ids/{slice}/table-name.ts
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/{slice}/table-names");

export class TableName extends BS.StringLiteralKit(
  Ids.{Entity}Id.tableName /* add more table names here */
).annotations(
  $I.annotations("{Slice}TableName", {
    description: "A sql table name for an entity within the {slice} domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
```

### Step 4: Export from `{slice}/index.ts`

```typescript
// packages/shared/domain/src/entity-ids/{slice}/index.ts
export * from "./any-id";
export * from "./ids";
export * from "./table-name";
```

### Step 5: Register in `entity-ids.ts`

```typescript
// packages/shared/domain/src/entity-ids/entity-ids.ts
export * as {Slice}EntityIds from "./{slice}";
export * as DocumentsEntityIds from "./documents";
export * as IamEntityIds from "./iam";
export * as SharedEntityIds from "./shared";
```

### Step 6: Add to `any-entity-id.ts`

```typescript
// packages/shared/domain/src/entity-ids/any-entity-id.ts
import * as {Slice} from "./{slice}";
// ... other imports

export class AnyEntityId extends S.Union(
  Shared.AnyId,
  Iam.AnyId,
  Documents.AnyId,
  {Slice}.AnyId  // Add new slice
).annotations(/* ... */) {}
```

---

## 8. Minimal vs Complete Slice Comparison

| Aspect | Minimal (customization) | Complete (documents) |
|--------|-------------------------|----------------------|
| Entities | 1 (UserHotkey) | 5+ (Document, DocumentFile, etc.) |
| Tables | 1 table | 5+ tables with complex relations |
| Repos | 1 basic repo | Multiple repos with custom queries |
| Client | Empty exports | Full contract system |
| UI | Empty exports | File upload, preview components |

---

## 9. Scaffolding Checklist

### Core Layer Creation (3 packages)

- [ ] Create `packages/{slice}/domain/` with entity models
- [ ] Create `packages/{slice}/tables/` with Drizzle schemas
- [ ] Create `packages/{slice}/server/` with Db client and repos

### Extended Layer Creation (2 packages)

- [ ] Create `packages/{slice}/client/` with contracts
- [ ] Create `packages/{slice}/ui/` with React components

### Entity ID Registration

- [ ] Add entity IDs in `packages/shared/domain/src/entity-ids/{slice}/ids.ts`
- [ ] Add to AnyId union in `packages/shared/domain/src/entity-ids/{slice}/any-id.ts`
- [ ] Add to TableName in `packages/shared/domain/src/entity-ids/{slice}/table-name.ts`
- [ ] Export from `packages/shared/domain/src/entity-ids/{slice}/index.ts`
- [ ] Export namespace from `packages/shared/domain/src/entity-ids/entity-ids.ts`
- [ ] Add to AnyEntityId union in `packages/shared/domain/src/entity-ids/any-entity-id.ts`

### Integration Points (see integration-points-map.md)

- [ ] Register identity composers
- [ ] Add to Persistence layer
- [ ] Add to DataAccess layer
- [ ] Export tables in db-admin
- [ ] Export relations in db-admin
- [ ] Add path aliases to tsconfig.base.jsonc
- [ ] Create tsconfig.slices/{slice}.json
- [ ] Add reference to root tsconfig.json

### Verification

- [ ] Run `bun run check` - TypeScript passes
- [ ] Run `bun run build` - Build succeeds
- [ ] Run `bun run db:generate` - Drizzle types generated
- [ ] Run `bun run test` - Tests pass

---

## 10. Reference Files

| File | Purpose |
|------|---------|
| `packages/customization/domain/src/entities/UserHotkey/UserHotkey.model.ts` | Model definition example |
| `packages/customization/tables/src/tables/user-hotkey.table.ts` | Table definition example |
| `packages/customization/server/src/db/Db/Db.ts` | Database client example |
| `packages/customization/server/src/db/repos/UserHotkey.repo.ts` | Repository example |
| `packages/shared/domain/src/entity-ids/customization/` | Entity ID registration |
| `packages/shared/tables/src/Table/Table.ts` | Table.make factory |
| `packages/shared/domain/src/common.ts` | makeFields factory |
