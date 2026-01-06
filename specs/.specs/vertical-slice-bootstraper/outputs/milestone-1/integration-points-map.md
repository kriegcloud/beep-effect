# Integration Points Map

> Comprehensive guide to all integration points required when adding a new vertical slice to the `beep-effect` monorepo.

---

## 1. Summary Table

| # | Integration Point | File | Phase | Purpose |
|---|-------------------|------|-------|---------|
| 1 | Identity Composers | `packages/common/identity/src/packages.ts` | Foundation | Register package identity composers |
| 2 | Entity IDs | `packages/shared/domain/src/entity-ids/{slice}/` | Foundation | Define and export entity identifiers |
| 3 | Persistence Layer | `packages/runtime/server/src/Persistence.layer.ts` | Wiring | Wire slice DB client to runtime |
| 4 | DataAccess Layer | `packages/runtime/server/src/DataAccess.layer.ts` | Wiring | Wire slice repos to runtime |
| 5 | DB Admin Tables | `packages/_internal/db-admin/src/tables.ts` | Link | Re-export tables for Drizzle CLI |
| 6 | DB Admin Relations | `packages/_internal/db-admin/src/slice-relations.ts` | Link | Re-export relations for Drizzle CLI |
| 7 | Path Aliases | `tsconfig.base.jsonc` | Registration | Register @beep/* path mappings |
| 8 | TSConfig Slices | `tsconfig.slices/{slice}.json` | Registration | Group slice package builds |
| 9 | Root TSConfig | `tsconfig.json` | Integration | Reference the slice group |

---

## 2. Detailed Integration Points

### 2.1 Identity Composers

**File:** `packages/common/identity/src/packages.ts`

**Purpose:** Register identity composers for each package namespace. These are used throughout the codebase for tagged identifiers.

**Before (without customization):**

```typescript
const composers = $I.compose(
  "shared-ui",
  "shared-client",
  "repo-scripts",
  // ... many others ...
  "iam-tables",
  "lexical-schemas"
);
```

**After (with customization added):**

```typescript
const composers = $I.compose(
  "shared-ui",
  "shared-client",
  "repo-scripts",
  // ... many others ...
  "iam-tables",
  "lexical-schemas",
  "customization-domain",    // NEW
  "customization-tables",    // NEW
  "customization-server",    // NEW
  "customization-client",    // NEW
  "customization-ui"         // NEW
);
```

**Then export each composer:**

```typescript
/**
 * Identity composer for the `@beep/customization-domain` namespace.
 */
export const $CustomizationDomainId = composers.$CustomizationDomainId;

/**
 * Identity composer for the `@beep/customization-tables` namespace.
 */
export const $CustomizationTablesId = composers.$CustomizationTablesId;

/**
 * Identity composer for the `@beep/customization-server` namespace.
 */
export const $CustomizationServerId = composers.$CustomizationServerId;

/**
 * Identity composer for the `@beep/customization-client` namespace.
 */
export const $CustomizationClientId = composers.$CustomizationClientId;

/**
 * Identity composer for the `@beep/customization-ui` namespace.
 */
export const $CustomizationUiId = composers.$CustomizationUiId;
```

---

### 2.2 Entity IDs

**Directory:** `packages/shared/domain/src/entity-ids/{slice}/`

**Files to create:**

1. `ids.ts` - Entity ID definitions
2. `any-id.ts` - Union of all slice IDs
3. `table-name.ts` - Table name literal kit
4. `index.ts` - Re-exports

**ids.ts:**

```typescript
// packages/shared/domain/src/entity-ids/customization/ids.ts
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/customization/ids");

export const UserHotkeyId = EntityId.make("user_hotkey", {
  brand: "UserHotkeyId",
}).annotations(
  $I.annotations("UserHotkeyId", {
    description: "A unique identifier for an UserHotkey",
  })
);

export declare namespace UserHotkeyId {
  export type Type = S.Schema.Type<typeof UserHotkeyId>;
  export type Encoded = S.Schema.Encoded<typeof UserHotkeyId>;
}
```

**any-id.ts:**

```typescript
// packages/shared/domain/src/entity-ids/customization/any-id.ts
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/customization/any-id");

export class AnyId extends S.Union(Ids.UserHotkeyId).annotations(
  $I.annotations("AnyCustomizationId", {
    description: "Any entity id within the customization domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
```

**table-name.ts:**

```typescript
// packages/shared/domain/src/entity-ids/customization/table-name.ts
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/customization/table-names");

export class TableName extends BS.StringLiteralKit(Ids.UserHotkeyId.tableName).annotations(
  $I.annotations("CustomizationTableName", {
    description: "A sql table name for an entity within the customization domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
```

**index.ts:**

```typescript
// packages/shared/domain/src/entity-ids/customization/index.ts
export * from "./any-id";
export * from "./ids";
export * from "./table-name";
```

**Also update:**

`packages/shared/domain/src/entity-ids/entity-ids.ts`:

```typescript
export * as CustomizationEntityIds from "./customization";  // NEW
export * as DocumentsEntityIds from "./documents";
export * as IamEntityIds from "./iam";
export * as SharedEntityIds from "./shared";
```

`packages/shared/domain/src/entity-ids/any-entity-id.ts`:

```typescript
import * as Customization from "./customization";  // NEW
import * as Documents from "./documents";
import * as Iam from "./iam";
import * as Shared from "./shared";

export class AnyEntityId extends S.Union(
  Shared.AnyId,
  Iam.AnyId,
  Documents.AnyId,
  Customization.AnyId  // NEW
).annotations(/* ... */) {}
```

---

### 2.3 Persistence Layer

**File:** `packages/runtime/server/src/Persistence.layer.ts`

**Purpose:** Wire the slice's database client into the server runtime.

**Before:**

```typescript
import { DocumentsDb } from "@beep/documents-server/db";
import { IamDb } from "@beep/iam-server/db";
import { DbClient } from "@beep/shared-server";
import { SharedDb } from "@beep/shared-server/Db";
import { Upload } from "@beep/shared-server/services";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import * as Layer from "effect/Layer";

export type DbClients = SharedDb.Db | IamDb.Db | DocumentsDb.Db;

const sliceClientsLayer: Layer.Layer<DbClients | Upload.Service, never, DbClient.SliceDbRequirements | S3Service> =
  Layer.mergeAll(SharedDb.layer, IamDb.layer, DocumentsDb.layer, Upload.layer);
```

**After:**

```typescript
import { CustomizationDb } from "@beep/customization-server/db";  // NEW
import { DocumentsDb } from "@beep/documents-server/db";
import { IamDb } from "@beep/iam-server/db";
import { DbClient } from "@beep/shared-server";
import { SharedDb } from "@beep/shared-server/Db";
import { Upload } from "@beep/shared-server/services";
import { S3Service } from "@effect-aws/client-s3/S3Service";
import * as Layer from "effect/Layer";

export type DbClients = SharedDb.Db | IamDb.Db | DocumentsDb.Db | CustomizationDb.Db;  // UPDATED

const sliceClientsLayer: Layer.Layer<DbClients | Upload.Service, never, DbClient.SliceDbRequirements | S3Service> =
  Layer.mergeAll(
    SharedDb.layer,
    IamDb.layer,
    DocumentsDb.layer,
    Upload.layer,
    CustomizationDb.layer  // NEW
  );
```

---

### 2.4 DataAccess Layer

**File:** `packages/runtime/server/src/DataAccess.layer.ts`

**Purpose:** Wire the slice's repositories into the server runtime.

**Before:**

```typescript
import { DocumentsRepos } from "@beep/documents-server";
import { IamRepos } from "@beep/iam-server";
import { SharedRepos } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Persistence from "./Persistence.layer";

type SliceRepos = IamRepos.Repos | DocumentsRepos.Repos | SharedRepos.Repos;

const sliceReposLayer: Layer.Layer<SliceRepos, never, Persistence.Services> = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  SharedRepos.layer
);
```

**After:**

```typescript
import { CustomizationRepos } from "@beep/customization-server";  // NEW
import { DocumentsRepos } from "@beep/documents-server";
import { IamRepos } from "@beep/iam-server";
import { SharedRepos } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Persistence from "./Persistence.layer";

type SliceRepos = IamRepos.Repos | DocumentsRepos.Repos | SharedRepos.Repos | CustomizationRepos.Repos;  // UPDATED

const sliceReposLayer: Layer.Layer<SliceRepos, never, Persistence.Services> = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  SharedRepos.layer,
  CustomizationRepos.layer  // NEW
);
```

---

### 2.5 DB Admin Tables

**File:** `packages/_internal/db-admin/src/tables.ts`

**Purpose:** Re-export all slice tables so Drizzle CLI can access them for migrations.

**Before:**

```typescript
export * from "@beep/documents-tables/tables";
export * from "@beep/iam-tables/tables";
export * from "@beep/shared-tables/tables";
```

**After:**

```typescript
export * from "@beep/customization-tables/tables";  // NEW
export * from "@beep/documents-tables/tables";
export * from "@beep/iam-tables/tables";
export * from "@beep/shared-tables/tables";
```

---

### 2.6 DB Admin Relations

**File:** `packages/_internal/db-admin/src/slice-relations.ts`

**Purpose:** Re-export all slice relations for Drizzle CLI.

**Before:**

```typescript
/* Documents */
export {
  commentRelations,
  discussionRelations,
  documentFileRelations,
  documentRelations,
  documentVersionRelations,
} from "@beep/documents-tables/relations";

/* Iam */
export {
  accountRelations,
  // ... many relations ...
} from "@beep/iam-tables/relations";
```

**After:**

```typescript
/* Customization */
export { userHotkeyRelations } from "@beep/customization-tables/relations";  // NEW

/* Documents */
export {
  commentRelations,
  discussionRelations,
  documentFileRelations,
  documentRelations,
  documentVersionRelations,
} from "@beep/documents-tables/relations";

/* Iam */
export {
  accountRelations,
  // ... many relations ...
} from "@beep/iam-tables/relations";
```

---

### 2.7 Path Aliases

**File:** `tsconfig.base.jsonc`

**Purpose:** Register TypeScript path mappings for the new slice packages.

**Pattern:** Each layer needs 3 path aliases:

```json
"@beep/{slice}-{layer}": ["./packages/{slice}/{layer}/src/index"],
"@beep/{slice}-{layer}/*": ["./packages/{slice}/{layer}/src/*"],
"@beep/{slice}-{layer}/test/*": ["./packages/{slice}/{layer}/test/*"]
```

**Example for customization:**

```jsonc
{
  "compilerOptions": {
    "paths": {
      // ... existing paths ...

      // Customization slice - domain
      "@beep/customization-domain": [
        "./packages/customization/domain/src/index"
      ],
      "@beep/customization-domain/*": [
        "./packages/customization/domain/src/*"
      ],
      "@beep/customization-domain/test/*": [
        "./packages/customization/domain/test/*"
      ],

      // Customization slice - tables
      "@beep/customization-tables": [
        "./packages/customization/tables/src/index"
      ],
      "@beep/customization-tables/*": [
        "./packages/customization/tables/src/*"
      ],
      "@beep/customization-tables/test/*": [
        "./packages/customization/tables/test/*"
      ],

      // Customization slice - server
      "@beep/customization-server": [
        "./packages/customization/server/src/index"
      ],
      "@beep/customization-server/*": [
        "./packages/customization/server/src/*"
      ],
      "@beep/customization-server/test/*": [
        "./packages/customization/server/test/*"
      ],

      // Customization slice - client
      "@beep/customization-client": [
        "./packages/customization/client/src/index"
      ],
      "@beep/customization-client/*": [
        "./packages/customization/client/src/*"
      ],
      "@beep/customization-client/test/*": [
        "./packages/customization/client/test/*"
      ],

      // Customization slice - ui
      "@beep/customization-ui": [
        "./packages/customization/ui/src/index"
      ],
      "@beep/customization-ui/*": [
        "./packages/customization/ui/src/*"
      ],
      "@beep/customization-ui/test/*": [
        "./packages/customization/ui/test/*"
      ]
    }
  }
}
```

---

### 2.8 TSConfig Slices

**File:** `tsconfig.slices/{slice}.json`

**Purpose:** Group all slice package build configs for project references.

**Template:**

```json
{
  "files": [],
  "references": [
    { "path": "../packages/{slice}/domain/tsconfig.build.json" },
    { "path": "../packages/{slice}/tables/tsconfig.build.json" },
    { "path": "../packages/{slice}/server/tsconfig.build.json" },
    { "path": "../packages/{slice}/client/tsconfig.build.json" },
    { "path": "../packages/{slice}/ui/tsconfig.build.json" }
  ]
}
```

**Example (customization.json):**

```json
{
  "files": [],
  "references": [
    { "path": "../packages/customization/domain/tsconfig.build.json" },
    { "path": "../packages/customization/tables/tsconfig.build.json" },
    { "path": "../packages/customization/server/tsconfig.build.json" },
    { "path": "../packages/customization/client/tsconfig.build.json" },
    { "path": "../packages/customization/ui/tsconfig.build.json" }
  ]
}
```

---

### 2.9 Root TSConfig

**File:** `tsconfig.json`

**Purpose:** Reference the new slice group from the root config.

**Before:**

```json
{
  "references": [
    { "path": "tsconfig.slices/common.json" },
    { "path": "tsconfig.slices/shared.json" },
    { "path": "tsconfig.slices/core.json" },
    { "path": "tsconfig.slices/ui.json" },
    { "path": "tsconfig.slices/iam.json" },
    { "path": "tsconfig.slices/documents.json"},
    { "path": "tsconfig.slices/runtime.json" },
    { "path": "tsconfig.slices/apps.json" },
    { "path": "tsconfig.slices/internal.json" },
    { "path": "tsconfig.slices/tooling.json" }
  ]
}
```

**After:**

```json
{
  "references": [
    { "path": "tsconfig.slices/common.json" },
    { "path": "tsconfig.slices/shared.json" },
    { "path": "tsconfig.slices/core.json" },
    { "path": "tsconfig.slices/ui.json" },
    { "path": "tsconfig.slices/iam.json" },
    { "path": "tsconfig.slices/documents.json"},
    { "path": "tsconfig.slices/runtime.json" },
    { "path": "tsconfig.slices/apps.json" },
    { "path": "tsconfig.slices/internal.json" },
    { "path": "tsconfig.slices/tooling.json" },
    { "path": "tsconfig.slices/customization.json" }
  ]
}
```

---

## 3. Modification Phases

### Phase 1: Foundation (Entity IDs + Identity)

1. **Identity Composers** - Register all 5 package identity composers
2. **Entity IDs** - Create the `entity-ids/{slice}/` directory with all files

### Phase 2: Registration (Path Aliases + TSConfig)

3. **Path Aliases** - Add 15 path aliases (3 per layer x 5 layers)
4. **TSConfig Slices** - Create `tsconfig.slices/{slice}.json`
5. **Root TSConfig** - Add reference to the slice group

### Phase 3: Link (DB Admin)

6. **DB Admin Tables** - Export tables from slice
7. **DB Admin Relations** - Export relations from slice

### Phase 4: Wiring (Runtime Layers)

8. **Persistence Layer** - Import and wire DB client
9. **DataAccess Layer** - Import and wire repos layer

---

## 4. Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{slice}` | Lowercase slice name | `customization` |
| `{Slice}` | PascalCase slice name | `Customization` |
| `{SlicePascal}` | PascalCase for identity | `Customization` |
| `{Entity}` | PascalCase entity name | `UserHotkey` |
| `{entity}` | camelCase entity name | `userHotkey` |
| `{table_name}` | Snake_case table name | `user_hotkey` |
| `{description}` | Entity description | `user configured hotkeys` |

---

## 5. Dependency Graph

```
tsconfig.base.jsonc (path aliases)
         |
         v
packages/common/identity/src/packages.ts (composers)
         |
         v
packages/shared/domain/src/entity-ids/{slice}/ (entity IDs)
         |
         v
packages/{slice}/domain/ (models using entity IDs)
         |
         v
packages/{slice}/tables/ (tables using entity IDs)
         |
         v
packages/{slice}/server/ (db client + repos)
         |
         +--> packages/_internal/db-admin/src/tables.ts
         |
         +--> packages/_internal/db-admin/src/slice-relations.ts
         |
         v
packages/runtime/server/src/Persistence.layer.ts (wire db client)
         |
         v
packages/runtime/server/src/DataAccess.layer.ts (wire repos)
         |
         v
tsconfig.slices/{slice}.json (build references)
         |
         v
tsconfig.json (root reference)
```

---

## 6. Verification Commands

After completing all integration points, run:

```bash
# Check TypeScript compilation
bun run check

# Build all packages
bun run build

# Generate Drizzle types
bun run db:generate

# Apply migrations (if any)
bun run db:migrate

# Run tests
bun run test
```

---

## 7. Reference Files

| File | Purpose |
|------|---------|
| `packages/common/identity/src/packages.ts` | Identity composer registration |
| `packages/shared/domain/src/entity-ids/customization/` | Entity ID directory example |
| `packages/runtime/server/src/Persistence.layer.ts` | DB client wiring |
| `packages/runtime/server/src/DataAccess.layer.ts` | Repos wiring |
| `packages/_internal/db-admin/src/tables.ts` | Table re-exports |
| `packages/_internal/db-admin/src/slice-relations.ts` | Relations re-exports |
| `tsconfig.base.jsonc` | Path alias definitions |
| `tsconfig.slices/customization.json` | Slice build group |
| `tsconfig.json` | Root project config |
