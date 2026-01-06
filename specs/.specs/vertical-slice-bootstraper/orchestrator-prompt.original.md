# Vertical Slice Bootstrapper CLI Command - Orchestrator Prompt

## Role & Context

You are the **Orchestrator Agent** responsible for coordinating the research and implementation of a new CLI command called `create-slice` in the `@beep/repo-cli` package (`tooling/cli/*`). This command will automate the creation of new vertical slices in the `beep-effect` monorepo.

**CRITICAL**: You are an orchestrator. You must delegate ALL research and implementation tasks to sub-agents to preserve your context window. You should only:
1. Read synthesized research reports
2. Run build/typecheck/test commands
3. Coordinate sub-agent work via todo lists
4. Make high-level decisions based on agent reports

---

## Project Context

### Vertical Slice Architecture

The `beep-effect` monorepo uses a **vertical slice architecture** where each feature domain is contained in its own folder under `packages/`. Each slice contains 5 sub-packages:

| Sub-Package | NPM Name Pattern | Purpose |
|-------------|-----------------|---------|
| `client/` | `@beep/<slice>-client` | Frontend glue layer (data-fetching, state management) |
| `domain/` | `@beep/<slice>-domain` | Domain logic (entities, value objects) |
| `server/` | `@beep/<slice>-server` | Backend infrastructure (repos, services) |
| `tables/` | `@beep/<slice>-tables` | Drizzle ORM table definitions |
| `ui/` | `@beep/<slice>-ui` | React UI components |

### Existing Slices (Use as Templates)
- `packages/iam/` - Identity & Access Management
- `packages/documents/` - Document management
- `packages/customization/` - User customization (**primary template**)

---

## CLI Command Specification

### Command Interface
```bash
beep create-slice --name <slice-name> --description "<description>" [--dry-run]
```

### Inputs
1. **name** (required): Lowercase kebab-case slice name (e.g., `notifications`, `billing`)
2. **description** (required): Short description of the vertical slice
3. **dry-run** (optional): Preview changes without writing files

### Template Variables
The following variables should be available in all Handlebars templates:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `{{sliceName}}` | `notifications` | Kebab-case slice name |
| `{{SliceName}}` | `Notifications` | PascalCase slice name |
| `{{SLICE_NAME}}` | `NOTIFICATIONS` | UPPER_SNAKE_CASE slice name |
| `{{sliceDescription}}` | `Push notifications` | User-provided description |

---

## Files to Create

### Directory Structure
```
packages/{{sliceName}}/
├── client/
│   ├── src/
│   │   └── index.ts
│   ├── test/
│   │   └── Dummy.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.src.json
│   ├── tsconfig.build.json
│   ├── tsconfig.test.json
│   ├── reset.d.ts
│   └── index.ts
├── domain/
│   ├── src/
│   │   ├── index.ts
│   │   └── entities/
│   │       ├── index.ts
│   │       └── Placeholder/
│   │           ├── index.ts
│   │           └── Placeholder.model.ts
│   ├── test/
│   │   └── Dummy.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.src.json
│   ├── tsconfig.build.json
│   ├── tsconfig.test.json
│   ├── reset.d.ts
│   └── index.ts
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── db.ts
│   │   └── db/
│   │       ├── index.ts
│   │       ├── repositories.ts
│   │       ├── Db/
│   │       │   ├── index.ts
│   │       │   └── Db.ts
│   │       └── repos/
│   │           ├── index.ts
│   │           ├── _common.ts
│   │           └── Placeholder.repo.ts
│   ├── test/
│   │   └── Dummy.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.src.json
│   ├── tsconfig.build.json
│   ├── tsconfig.test.json
│   ├── reset.d.ts
│   └── index.ts
├── tables/
│   ├── src/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── relations.ts
│   │   ├── _check.ts
│   │   └── tables/
│   │       ├── index.ts
│   │       └── placeholder.table.ts
│   ├── test/
│   │   └── Dummy.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.src.json
│   ├── tsconfig.build.json
│   ├── tsconfig.test.json
│   ├── reset.d.ts
│   └── index.ts
└── ui/
    ├── src/
    │   └── index.ts
    ├── test/
    │   └── Dummy.test.ts
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.src.json
    ├── tsconfig.build.json
    ├── tsconfig.test.json
    ├── reset.d.ts
    └── index.ts
```

---

## Complete Handlebars Templates

### Entity IDs Templates

#### `packages/shared/domain/src/entity-ids/{{sliceName}}/ids.ts`
```handlebars
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/{{sliceName}}/ids");

export const PlaceholderId = EntityId.make("placeholder", {
  brand: "PlaceholderId",
}).annotations(
  $I.annotations("PlaceholderId", {
    description: "A unique identifier for a Placeholder",
  })
);

export declare namespace PlaceholderId {
  export type Type = S.Schema.Type<typeof PlaceholderId>;
  export type Encoded = S.Schema.Encoded<typeof PlaceholderId>;
}
```

#### `packages/shared/domain/src/entity-ids/{{sliceName}}/any-id.ts`
```handlebars
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/{{sliceName}}/any-id");

export class AnyId extends S.Union(Ids.PlaceholderId).annotations(
  $I.annotations("Any{{SliceName}}Id", {
    description: "Any entity id within the {{sliceName}} domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
```

#### `packages/shared/domain/src/entity-ids/{{sliceName}}/table-name.ts`
```handlebars
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/{{sliceName}}/table-names");

export class TableName extends BS.StringLiteralKit(Ids.PlaceholderId.tableName).annotations(
  $I.annotations("{{SliceName}}TableName", {
    description: "A sql table name for an entity within the {{sliceName}} domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
```

#### `packages/shared/domain/src/entity-ids/{{sliceName}}/index.ts`
```handlebars
export * from "./any-id";
export * from "./ids";
export * from "./table-name";
```

---

### Domain Package Templates

#### `packages/{{sliceName}}/domain/package.json`
```handlebars
{
  "name": "@beep/{{sliceName}}-domain",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - domain layer",
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
    "directory": "packages/{{sliceName}}/domain"
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

#### `packages/{{sliceName}}/domain/tsconfig.json`
```handlebars
{
  "extends": "./tsconfig.src.json",
  "include": [],
  "references": [
    { "path": "tsconfig.src.json" },
    { "path": "tsconfig.test.json" }
  ]
}
```

#### `packages/{{sliceName}}/domain/tsconfig.src.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["src"],
  "references": [
    { "path": "../../shared/domain" },
    { "path": "../../common/schema/tsconfig.src.json" }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/src",
    "rootDir": "src",
    "moduleResolution": "bundler",
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

#### `packages/{{sliceName}}/domain/tsconfig.build.json`
```handlebars
{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/esm",
    "declarationDir": "build/dts",
    "stripInternal": false,
    "composite": true,
    "declaration": true,
    "sourceMap": true
  },
  "references": [
    { "path": "../../shared/domain/tsconfig.build.json" },
    { "path": "../../common/schema/tsconfig.build.json" }
  ]
}
```

#### `packages/{{sliceName}}/domain/tsconfig.test.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["test"],
  "references": [
    { "path": "tsconfig.src.json" },
    { "path": "../../shared/domain" },
    { "path": "../../common/schema/tsconfig.src.json" }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "tsBuildInfoFile": "./build/tsconfig.test.tsbuildinfo",
    "rootDir": "test",
    "noEmit": true,
    "outDir": "build/test"
  }
}
```

#### `packages/{{sliceName}}/domain/src/index.ts`
```handlebars
export * as Entities from "./entities";
```

#### `packages/{{sliceName}}/domain/src/entities/index.ts`
```handlebars
export * as Placeholder from "./Placeholder";
```

#### `packages/{{sliceName}}/domain/src/entities/Placeholder/index.ts`
```handlebars
export * from "./Placeholder.model";
```

#### `packages/{{sliceName}}/domain/src/entities/Placeholder/Placeholder.model.ts`
```handlebars
import { ${{SliceName}}DomainId } from "@beep/identity/packages";
import { {{SliceName}}EntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = ${{SliceName}}DomainId.create("entities/Placeholder");

/**
 * PlaceholderModel model representing a placeholder entity.
 */
export class Model extends M.Class<Model>($I`PlaceholderModel`)(
  makeFields({{SliceName}}EntityIds.PlaceholderId, {
    placeholder: S.String,
  }),
  $I.annotations("PlaceholderModel", {
    description: "PlaceholderModel model representing a placeholder."
  })
) {
  static readonly utils = modelKit(Model);
}
```

---

### Tables Package Templates

#### `packages/{{sliceName}}/tables/package.json`
```handlebars
{
  "name": "@beep/{{sliceName}}-tables",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - table definitions",
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
    "directory": "packages/{{sliceName}}/tables"
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
    "@beep/{{sliceName}}-domain": "workspace:^",
    "drizzle-orm": "catalog:"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "@beep/shared-tables": "workspace:^",
    "@beep/schema": "workspace:^",
    "@beep/shared-domain": "workspace:^",
    "@beep/{{sliceName}}-domain": "workspace:^",
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

#### `packages/{{sliceName}}/tables/tsconfig.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": [],
  "references": [
    { "path": "tsconfig.src.json" },
    { "path": "tsconfig.test.json" }
  ]
}
```

#### `packages/{{sliceName}}/tables/tsconfig.src.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["src"],
  "references": [
    { "path": "../../shared/tables" },
    { "path": "../../shared/domain" },
    { "path": "../../common/schema/tsconfig.src.json" },
    { "path": "../domain" }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/src",
    "rootDir": "src",
    "moduleResolution": "bundler",
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

#### `packages/{{sliceName}}/tables/tsconfig.build.json`
```handlebars
{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/esm",
    "declarationDir": "build/dts",
    "stripInternal": false,
    "composite": true,
    "declaration": true,
    "sourceMap": true
  },
  "references": [
    { "path": "../../shared/tables/tsconfig.build.json" },
    { "path": "../../shared/domain/tsconfig.build.json" },
    { "path": "../../common/schema/tsconfig.build.json" },
    { "path": "../domain/tsconfig.build.json" }
  ]
}
```

#### `packages/{{sliceName}}/tables/tsconfig.test.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["test"],
  "references": [
    { "path": "tsconfig.src.json" },
    { "path": "../../shared/tables" },
    { "path": "../../shared/domain" },
    { "path": "../../common/schema/tsconfig.src.json" },
    { "path": "../domain" }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "tsBuildInfoFile": "./build/tsconfig.test.tsbuildinfo",
    "rootDir": "test",
    "noEmit": true,
    "outDir": "build/test"
  }
}
```

#### `packages/{{sliceName}}/tables/src/index.ts`
```handlebars
export * as {{SliceName}}DbSchema from "./schema";
```

#### `packages/{{sliceName}}/tables/src/schema.ts`
```handlebars
export * from "./relations";
export * from "./tables";
```

#### `packages/{{sliceName}}/tables/src/relations.ts`
```handlebars
import * as d from "drizzle-orm";
import { placeholder } from "./tables";

export const placeholderRelations = d.relations(placeholder, () => ({}));
```

#### `packages/{{sliceName}}/tables/src/_check.ts`
```handlebars
// Type checking file for {{sliceName}} tables
```

#### `packages/{{sliceName}}/tables/src/tables/index.ts`
```handlebars
export * from "@beep/shared-tables/tables/organization.table";
export * from "@beep/shared-tables/tables/team.table";
export * from "@beep/shared-tables/tables/user.table";
export * from "./placeholder.table";
```

#### `packages/{{sliceName}}/tables/src/tables/placeholder.table.ts`
```handlebars
import { {{SliceName}}EntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const placeholder = Table.make({{SliceName}}EntityIds.PlaceholderId)(
  {
    placeholder: pg.text("placeholder").notNull(),
  },
);
```

---

### Server Package Templates

#### `packages/{{sliceName}}/server/package.json`
```handlebars
{
  "name": "@beep/{{sliceName}}-server",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - server infrastructure",
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
    "directory": "packages/{{sliceName}}/server"
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
    "@effect/experimental": "catalog:",
    "@beep/{{sliceName}}-tables": "workspace:^",
    "@effect/platform-bun": "catalog:",
    "@beep/{{sliceName}}-domain": "workspace:^",
    "@beep/schema": "workspace:^",
    "@effect-aws/s3": "catalog:",
    "@effect-aws/client-s3": "catalog:",
    "postgres": "catalog:",
    "@effect/platform": "catalog:",
    "@effect/cluster": "catalog:",
    "@effect/workflow": "catalog:",
    "drizzle-orm": "catalog:",
    "effect": "catalog:",
    "@beep/shared-domain": "workspace:^"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "@effect/sql": "catalog:",
    "@effect/sql-drizzle": "catalog:",
    "@effect/sql-pg": "catalog:",
    "@effect/experimental": "catalog:",
    "@beep/{{sliceName}}-domain": "workspace:^",
    "@beep/{{sliceName}}-tables": "workspace:^",
    "@effect/platform-bun": "catalog:",
    "@beep/schema": "workspace:^",
    "@effect-aws/s3": "catalog:",
    "@effect-aws/client-s3": "catalog:",
    "postgres": "catalog:",
    "@effect/platform": "catalog:",
    "@effect/cluster": "catalog:",
    "@beep/shared-server": "workspace:^",
    "@beep/shared-env": "workspace:^",
    "@effect/workflow": "catalog:",
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

#### `packages/{{sliceName}}/server/tsconfig.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": [],
  "references": [
    { "path": "tsconfig.src.json" },
    { "path": "tsconfig.test.json" }
  ]
}
```

#### `packages/{{sliceName}}/server/tsconfig.src.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["src"],
  "references": [
    { "path": "../../shared/domain" },
    { "path": "../../shared/server" },
    { "path": "../../shared/env" },
    { "path": "../../common/schema/tsconfig.src.json" },
    { "path": "../domain" },
    { "path": "../tables" }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/src",
    "rootDir": "src",
    "moduleResolution": "bundler",
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

#### `packages/{{sliceName}}/server/tsconfig.build.json`
```handlebars
{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/esm",
    "declarationDir": "build/dts",
    "stripInternal": false,
    "composite": true,
    "declaration": true,
    "sourceMap": true
  },
  "references": [
    { "path": "../../shared/server/tsconfig.build.json" },
    { "path": "../../shared/domain/tsconfig.build.json" },
    { "path": "../../shared/env/tsconfig.build.json" },
    { "path": "../../common/schema/tsconfig.build.json" },
    { "path": "../domain/tsconfig.build.json" },
    { "path": "../tables/tsconfig.build.json" }
  ]
}
```

#### `packages/{{sliceName}}/server/tsconfig.test.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["test"],
  "references": [
    { "path": "../../shared/domain" },
    { "path": "../../shared/env" },
    { "path": "../../shared/server" },
    { "path": "../../common/schema/tsconfig.src.json" },
    { "path": "../domain" },
    { "path": "../tables" }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "tsBuildInfoFile": "./build/tsconfig.test.tsbuildinfo",
    "rootDir": "test",
    "noEmit": true,
    "outDir": "build/test"
  }
}
```

#### `packages/{{sliceName}}/server/src/index.ts`
```handlebars
export * from "./db";
```

#### `packages/{{sliceName}}/server/src/db.ts`
```handlebars
export * from "./db/index";
```

#### `packages/{{sliceName}}/server/src/db/index.ts`
```handlebars
export * from "./Db";
export * from "./repos";
export * as {{SliceName}}Repos from "./repositories";
```

#### `packages/{{sliceName}}/server/src/db/Db/index.ts`
```handlebars
export * as {{SliceName}}Db from "./Db";
```

#### `packages/{{sliceName}}/server/src/db/Db/Db.ts`
```handlebars
import * as DbSchema from "@beep/{{sliceName}}-tables/schema";
import { ${{SliceName}}ServerId } from "@beep/identity/packages";
import { DbClient } from "@beep/shared-server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const $I = ${{SliceName}}ServerId.create("db/Db");

const serviceEffect: DbClient.PgClientServiceEffect<typeof DbSchema> = DbClient.make({
  schema: DbSchema,
});

export type Shape = DbClient.Shape<typeof DbSchema>;

export class Db extends Context.Tag($I`Db`)<Db, Shape>() {}

export const layer: Layer.Layer<Db, never, DbClient.SliceDbRequirements> = Layer.scoped(Db, serviceEffect);
```

#### `packages/{{sliceName}}/server/src/db/repos/index.ts`
```handlebars
export * from "./Placeholder.repo";
```

#### `packages/{{sliceName}}/server/src/db/repos/_common.ts`
```handlebars
import { {{SliceName}}Db } from "@beep/{{sliceName}}-server/db";

export const dependencies = [{{SliceName}}Db.layer] as const;
```

#### `packages/{{sliceName}}/server/src/db/repos/Placeholder.repo.ts`
```handlebars
import { Entities } from "@beep/{{sliceName}}-domain";
import { {{SliceName}}Db } from "@beep/{{sliceName}}-server/db";
import { ${{SliceName}}ServerId } from "@beep/identity/packages";
import { {{SliceName}}EntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = ${{SliceName}}ServerId.create("db/repos/PlaceholderRepo");

export class PlaceholderRepo extends Effect.Service<PlaceholderRepo>()($I`PlaceholderRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* {{SliceName}}Db.Db;

    return yield* DbRepo.make({{SliceName}}EntityIds.PlaceholderId, Entities.Placeholder.Model, Effect.succeed({}));
  }),
}) {}
```

#### `packages/{{sliceName}}/server/src/db/repositories.ts`
```handlebars
import type { {{SliceName}}Db } from "@beep/{{sliceName}}-server/db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos = repos.PlaceholderRepo;

export type ReposLayer = Layer.Layer<
  Repos,
  never,
  DbClient.SliceDbRequirements | {{SliceName}}Db.Db
>;

export const layer: ReposLayer = Layer.mergeAll(
  repos.PlaceholderRepo.Default
);

export * from "./repos";
```

---

### Client Package Templates

#### `packages/{{sliceName}}/client/package.json`
```handlebars
{
  "name": "@beep/{{sliceName}}-client",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - client SDK",
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
    "directory": "packages/{{sliceName}}/client"
  },
  "scripts": {
    "dev": "bun run dotenvx -- bunx tsc -b tsconfig.build.json --watch",
    "build": "bun run build-esm && bun run build-cjs && bun run build-annotate",
    "build-esm": "tsc -b tsconfig.build.json",
    "build-cjs": "babel build/esm --plugins babel-plugin-transform-next-use-client --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --presets @babel/preset-react --out-dir build/cjs --source-maps ",
    "build-annotate": "babel build/esm --plugins babel-plugin-transform-next-use-client --plugins annotate-pure-calls --presets @babel/preset-react --out-dir build/esm --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "bun test",
    "coverage": "bun test --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check . --write",
    "lint:circular": "bunx madge -c ."
  },
  "peerDependencies": {
    "effect": "catalog:"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "babel-plugin-transform-next-use-client": "catalog:",
    "@babel/preset-react": "catalog:",
    "effect": "catalog:",
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

#### `packages/{{sliceName}}/client/tsconfig.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": [],
  "exclude": ["src/**/*.test.ts"],
  "references": [
    { "path": "tsconfig.src.json" }
  ]
}
```

#### `packages/{{sliceName}}/client/tsconfig.src.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["src"],
  "exclude": [],
  "references": [],
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/src",
    "rootDir": "src",
    "jsx": "react-jsx",
    "module": "ESNext",
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

#### `packages/{{sliceName}}/client/tsconfig.build.json`
```handlebars
{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/esm",
    "declarationDir": "build/dts",
    "jsx": "react-jsx",
    "module": "ESNext",
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "composite": true,
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "stripInternal": false
  },
  "references": [],
  "include": ["src"]
}
```

#### `packages/{{sliceName}}/client/tsconfig.test.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["test"],
  "references": [
    { "path": "tsconfig.src.json" }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "tsBuildInfoFile": "./build/tsconfig.test.tsbuildinfo",
    "rootDir": "test",
    "noEmit": true,
    "outDir": "build/test"
  }
}
```

#### `packages/{{sliceName}}/client/src/index.ts`
```handlebars
export const beep = "beep";
```

---

### UI Package Templates

#### `packages/{{sliceName}}/ui/package.json`
```handlebars
{
  "name": "@beep/{{sliceName}}-ui",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - UI components",
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
    "directory": "packages/{{sliceName}}/ui"
  },
  "scripts": {
    "dev": "bun run dotenvx -- bunx tsc -b tsconfig.build.json --watch",
    "build": "bun run build-esm && bun run build-cjs && bun run build-annotate",
    "build-esm": "tsc -b tsconfig.build.json",
    "build-cjs": "babel build/esm --plugins babel-plugin-transform-next-use-client --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --presets @babel/preset-react --out-dir build/cjs --source-maps ",
    "build-annotate": "babel build/esm --plugins babel-plugin-transform-next-use-client --plugins annotate-pure-calls --presets @babel/preset-react --out-dir build/esm --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "bun test",
    "coverage": "bun test --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check . --write",
    "lint:circular": "bunx madge -c ."
  },
  "peerDependencies": {
    "effect": "catalog:"
  },
  "devDependencies": {
    "@effect/docgen": "catalog:",
    "babel-plugin-transform-next-use-client": "catalog:",
    "@babel/preset-react": "catalog:",
    "effect": "catalog:",
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

#### `packages/{{sliceName}}/ui/tsconfig.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": [],
  "exclude": ["src/**/*.test.ts"],
  "references": [
    { "path": "tsconfig.src.json" }
  ]
}
```

#### `packages/{{sliceName}}/ui/tsconfig.src.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["src"],
  "exclude": [],
  "references": [],
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/src",
    "rootDir": "src",
    "jsx": "react-jsx",
    "module": "ESNext",
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

#### `packages/{{sliceName}}/ui/tsconfig.build.json`
```handlebars
{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "build/esm",
    "declarationDir": "build/dts",
    "jsx": "react-jsx",
    "module": "ESNext",
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "composite": true,
    "incremental": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "stripInternal": false
  },
  "references": [],
  "include": ["src"]
}
```

#### `packages/{{sliceName}}/ui/tsconfig.test.json`
```handlebars
{
  "extends": "../../../tsconfig.base.jsonc",
  "include": ["test"],
  "references": [
    { "path": "tsconfig.src.json" }
  ],
  "compilerOptions": {
    "types": ["node", "bun"],
    "tsBuildInfoFile": "./build/tsconfig.test.tsbuildinfo",
    "rootDir": "test",
    "noEmit": true,
    "outDir": "build/test"
  }
}
```

#### `packages/{{sliceName}}/ui/src/index.ts`
```handlebars
export const beep = "beep";
```

---

### Shared Templates (All Packages)

#### `reset.d.ts` (all packages)
```handlebars
import "@total-typescript/ts-reset";
```

#### `test/Dummy.test.ts` (all packages)
```handlebars
import { describe, expect, it } from "bun:test";

describe("Dummy", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});
```

#### `index.ts` (root of each package - empty)
```handlebars
// Entry point for @beep/{{sliceName}}-{{layer}}
```

---

### Root Config Templates

#### `tsconfig.slices/{{sliceName}}.json`
```handlebars
{
  "files": [],
  "references": [
    { "path": "../packages/{{sliceName}}/domain/tsconfig.build.json" },
    { "path": "../packages/{{sliceName}}/tables/tsconfig.build.json" },
    { "path": "../packages/{{sliceName}}/server/tsconfig.build.json" },
    { "path": "../packages/{{sliceName}}/client/tsconfig.build.json" },
    { "path": "../packages/{{sliceName}}/ui/tsconfig.build.json" }
  ]
}
```

---

## Files to Modify (Using ts-morph)

### 1. Identity Package
**File**: `packages/common/identity/src/packages.ts`

**Modifications**:
1. Add 5 new entries to the `composers` object:
   - `"{{sliceName}}-domain"`
   - `"{{sliceName}}-tables"`
   - `"{{sliceName}}-server"`
   - `"{{sliceName}}-client"`
   - `"{{sliceName}}-ui"`

2. Export 5 new identity composers with JSDoc:
```typescript
export const ${{SliceName}}DomainId = composers.${{SliceName}}DomainId;
export const ${{SliceName}}TablesId = composers.${{SliceName}}TablesId;
export const ${{SliceName}}ServerId = composers.${{SliceName}}ServerId;
export const ${{SliceName}}ClientId = composers.${{SliceName}}ClientId;
export const ${{SliceName}}UiId = composers.${{SliceName}}UiId;
```

### 2. Entity IDs Integration
**File**: `packages/shared/domain/src/entity-ids/any-entity-id.ts`

**Current state**:
```typescript
import * as Customization from "./customization";
import * as Documents from "./documents";
import * as Iam from "./iam";
import * as Shared from "./shared";

export class AnyEntityId extends S.Union(Shared.AnyId, Iam.AnyId, Documents.AnyId, Customization.AnyId)
```

**Modifications**:
1. Add import: `import * as {{SliceName}} from "./{{sliceName}}";`
2. Add to Union: `{{SliceName}}.AnyId`

---

**File**: `packages/shared/domain/src/entity-ids/entity-ids.ts`

**Current state**:
```typescript
export * as CustomizationEntityIds from "./customization";
export * as DocumentsEntityIds from "./documents";
export * as IamEntityIds from "./iam";
export * as SharedEntityIds from "./shared";
```

**Modification**: Add export:
```typescript
export * as {{SliceName}}EntityIds from "./{{sliceName}}";
```

---

**File**: `packages/shared/domain/src/entity-ids/entity-kind.ts`

**Current state**:
```typescript
import * as Customization from "./customization";
import * as Documents from "./documents";
import * as Iam from "./iam";
import * as Shared from "./shared";

export class EntityKind extends BS.StringLiteralKit(
  ...Iam.TableName.Options,
  ...Shared.TableName.Options,
  ...Documents.TableName.Options,
  ...Customization.TableName.Options
)
```

**Modifications**:
1. Add import: `import * as {{SliceName}} from "./{{sliceName}}";`
2. Add to StringLiteralKit: `...{{SliceName}}.TableName.Options`

### 3. Runtime Server
**File**: `packages/runtime/server/src/DataAccess.layer.ts`

**Current state**:
```typescript
import { CustomizationRepos } from "@beep/customization-server";
import { DocumentsRepos } from "@beep/documents-server";
import { IamRepos } from "@beep/iam-server";
import { SharedRepos } from "@beep/shared-server";

type SliceRepos =
  | IamRepos.Repos
  | DocumentsRepos.Repos
  | SharedRepos.Repos
  | CustomizationRepos.Repos;

const sliceReposLayer = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  SharedRepos.layer,
  CustomizationRepos.layer
);
```

**Modifications**:
1. Add import: `import { {{SliceName}}Repos } from "@beep/{{sliceName}}-server";`
2. Add to SliceRepos union: `| {{SliceName}}Repos.Repos`
3. Add to Layer.mergeAll: `{{SliceName}}Repos.layer`

---

**File**: `packages/runtime/server/src/Persistence.layer.ts`

**Current state**:
```typescript
import { CustomizationDb } from "@beep/customization-server/db";
import { DocumentsDb } from "@beep/documents-server/db";
import { IamDb } from "@beep/iam-server/db";
import { SharedDb } from "@beep/shared-server/db";

export type DbClients = SharedDb.Db | IamDb.Db | DocumentsDb.Db | CustomizationDb.Db;

const sliceClientsLayer = Layer.mergeAll(SharedDb.layer, IamDb.layer, DocumentsDb.layer, Upload.layer, CustomizationDb.layer);
```

**Modifications**:
1. Add import: `import { {{SliceName}}Db } from "@beep/{{sliceName}}-server/db";`
2. Add to DbClients union: `| {{SliceName}}Db.Db`
3. Add to Layer.mergeAll: `{{SliceName}}Db.layer`

### 4. DB Admin
**File**: `packages/_internal/db-admin/src/slice-relations.ts`

**Current state**:
```typescript
/* Customization */
export { userHotkeyRelations } from "@beep/customization-tables/relations";
/* Documents */
export { ... } from "@beep/documents-tables/relations";
/* Iam */
export { ... } from "@beep/iam-tables/relations";
```

**Modification**: Add export block:
```typescript
/* {{SliceName}} */
export { placeholderRelations } from "@beep/{{sliceName}}-tables/relations";
```

---

**File**: `packages/_internal/db-admin/src/tables.ts`

**Current state**:
```typescript
export * from "@beep/customization-tables/tables";
export * from "@beep/documents-tables/tables";
export * from "@beep/iam-tables/tables";
export * from "@beep/shared-tables/tables";
```

**Modification**: Add export:
```typescript
export * from "@beep/{{sliceName}}-tables/tables";
```

### 5. Root TSConfig Files
**File**: `tsconfig.json`

**Modification**: Add reference:
```json
{ "path": "tsconfig.slices/{{sliceName}}.json" }
```

---

**File**: `tsconfig.build.json`

**Modification**: Add 5 references:
```json
{ "path": "packages/{{sliceName}}/client/tsconfig.build.json" },
{ "path": "packages/{{sliceName}}/ui/tsconfig.build.json" },
{ "path": "packages/{{sliceName}}/domain/tsconfig.build.json" },
{ "path": "packages/{{sliceName}}/tables/tsconfig.build.json" },
{ "path": "packages/{{sliceName}}/server/tsconfig.build.json" }
```

---

**File**: `tsconfig.base.jsonc`

**Modification**: Add path aliases to `compilerOptions.paths`:
```json
"@beep/{{sliceName}}-domain": ["./packages/{{sliceName}}/domain/src/index"],
"@beep/{{sliceName}}-domain/*": ["./packages/{{sliceName}}/domain/src/*"],
"@beep/{{sliceName}}-domain/test/*": ["./packages/{{sliceName}}/domain/test/*"],
"@beep/{{sliceName}}-tables": ["./packages/{{sliceName}}/tables/src/index"],
"@beep/{{sliceName}}-tables/*": ["./packages/{{sliceName}}/tables/src/*"],
"@beep/{{sliceName}}-tables/test/*": ["./packages/{{sliceName}}/tables/test/*"],
"@beep/{{sliceName}}-server": ["./packages/{{sliceName}}/server/src/index"],
"@beep/{{sliceName}}-server/*": ["./packages/{{sliceName}}/server/src/*"],
"@beep/{{sliceName}}-server/test/*": ["./packages/{{sliceName}}/server/test/*"],
"@beep/{{sliceName}}-client": ["./packages/{{sliceName}}/client/src/index"],
"@beep/{{sliceName}}-client/*": ["./packages/{{sliceName}}/client/src/*"],
"@beep/{{sliceName}}-client/test/*": ["./packages/{{sliceName}}/client/test/*"],
"@beep/{{sliceName}}-ui": ["./packages/{{sliceName}}/ui/src/index"],
"@beep/{{sliceName}}-ui/*": ["./packages/{{sliceName}}/ui/src/*"],
"@beep/{{sliceName}}-ui/test/*": ["./packages/{{sliceName}}/ui/test/*"]
```

---

## Milestone-Based Implementation Plan

### Milestone 1: Context Gathering & Todo Creation

**Objective**: Deploy parallel agents to gather comprehensive context and create a master todo list.

**Agent Tasks (run in parallel)**:
1. **CLI Architecture Agent**: Research `tooling/cli/` structure, existing commands, patterns
2. **Template Files Agent**: Verify all templates above are complete and accurate
3. **Integration Points Agent**: Document all files that need modification with exact line numbers
4. **TSConfig Agent**: Map all tsconfig files that need updates with exact patterns
5. **Package.json Agent**: Document all package.json structures and dependencies

**Output**: Each agent writes findings to `specs/.specs/vertical-slice-bootstraper/research/<agent-name>.md`

**Orchestrator Action**: After all agents complete, deploy a **Synthesis Agent** to combine all reports into `specs/.specs/vertical-slice-bootstraper/research-master.md`

---

### Milestone 2: Technical Research

**Objective**: Deploy parallel agents to research implementation details.

**Agent Tasks (run in parallel)**:
1. **ts-morph Research Agent**: Document ts-morph API for modifying TypeScript files
2. **Handlebars Research Agent**: Document Handlebars API and template helpers
3. **Effect CLI Research Agent**: Document @effect/cli Command patterns
4. **Existing Utils Research Agent**: Document all utilities in `@beep/tooling-utils`

**Output**: Each agent writes findings to `specs/.specs/vertical-slice-bootstraper/research/<agent-name>.md`

**Orchestrator Action**: Deploy **Synthesis Agent** to update `research-master.md`

---

### Milestone 3: Boilerplate & Stubs Creation

**Objective**: Create the command structure with types, schemas, and commented-out stubs.

**Agent Tasks**:
1. Create `tooling/cli/src/commands/create-slice/` directory structure
2. Create types, schemas, errors files
3. Create Handlebars template files
4. Create utility stub files (commented out implementation)
5. Register command in `tooling/cli/src/index.ts`

**Orchestrator Action**:
```bash
bun run check --filter=@beep/repo-cli
bun run build --filter=@beep/repo-cli
```

---

### Milestone 4: Full Implementation

**Objective**: Implement all functionality.

**Agent Tasks (parallel)**:
1. **Template Implementation Agent**: Complete all Handlebars templates
2. **ts-morph Implementation Agent**: Implement AST modifications
3. **File Generation Agent**: Implement directory/file creation
4. **CLI Handler Agent**: Wire up main command handler
5. **Validation Agent**: Implement input validation and conflict detection

**Orchestrator Action**:
```bash
bun run check --filter=@beep/repo-cli
bun run build --filter=@beep/repo-cli
bun run lint:fix --filter=@beep/repo-cli
```

---

### Milestone 5: Testing

**Objective**: Create comprehensive unit tests.

**Agent Tasks**:
1. **Unit Test Agent**: Tests for utilities and helpers
2. **Integration Test Agent**: Tests for full command execution
3. **E2E Test Agent**: Test creating an actual slice (with cleanup)

**Orchestrator Action**:
```bash
bun run test --filter=@beep/repo-cli
```

---

## Research Documentation Requirements

All research agents MUST output findings to markdown files:

```markdown
# [Agent Name] Research Report

## Summary
[2-3 sentence overview]

## Key Findings
- [Bullet points]

## Code Examples
[Code snippets]

## Files Analyzed
| File Path | Purpose |
|-----------|---------|

## Recommendations
[Implementation recommendations]

## Open Questions
[Unresolved questions]
```

---

## Success Criteria

1. **Functionality**: `beep create-slice --name notifications --description "Push notifications"` creates complete slice
2. **Type Safety**: `bun run check` passes after slice creation
3. **Build Success**: `bun run build` passes after slice creation
4. **Tests**: All tests pass
5. **Dry Run**: `--dry-run` previews without execution
6. **Idempotency**: Re-running with same inputs produces helpful error

---

## Important Constraints

1. **Effect Patterns Only**: No `async/await`, no native array methods, no `switch` statements
2. **ts-morph for Modifications**: Never string manipulation for TypeScript files
3. **Handlebars for Templates**: All file generation via Handlebars
4. **Preserve Context**: Delegate all work to sub-agents
5. **Document Everything**: All agents produce markdown reports
6. **Incremental Verification**: Run typecheck/build after each milestone
