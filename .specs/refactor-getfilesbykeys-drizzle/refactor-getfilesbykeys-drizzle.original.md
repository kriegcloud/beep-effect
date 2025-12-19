---
name: refactor-getfilesbykeys-drizzle
version: 1
created: 2025-01-10T15:00:00Z
iterations: 0
---

# Refactor getFilesByKeys Query to Drizzle

## Context

You are working in the `beep-effect` monorepo, an Effect-first full-stack application. The codebase uses:
- **Effect 3** with `@effect/sql` for database operations
- **Drizzle ORM** with PostgreSQL via `drizzle-orm/node-postgres`
- **Effect Schema** (`effect/Schema`) for runtime validation

### Current State

The `FileRepo` in `packages/shared/server/src/repos/File.repo.ts` has a `getFilesByKeys` implementation using raw SQL that needs to be converted to Drizzle ORM.

**Current Implementation** (lines 146-185):
```typescript
const getFilesByKeys = (req: {
    readonly keys: ReadonlyArray<File.UploadKey.Type>;
    readonly userId: SharedEntityIds.UserId.Type;
  }) =>
    Effect.gen(function* () {
      if (A.isEmptyReadonlyArray(req.keys)) {
        return A.empty<File.Model | null>();
      }

      const results = yield* SqlSchema.findAll({
        Request: S.Struct({
          keys: S.Array(File.UploadKey),
          userId: SharedEntityIds.UserId,
        }),
        Result: File.Model,
        execute: (req) => sql`
          SELECT
            f.id,
            f.name,
            f.mime_type AS "mimeType",
            f.size::text,
            f.folder_id AS "folderId",
            f.key AS "key",
            f.url AS "url",
            f.created_at AS "createdAt",
            f.updated_at AS "updatedAt"
          FROM
            public.files f
          WHERE
            ${sql.in("f.key", req.keys)}
            AND f.user_id = ${req.userId}
        `,
      })(req);

      const resultsByKey = new Map(
        A.map(results, (file) => [file.key, file] as const),
      );

      return A.map(req.keys, (key) => resultsByKey.get(key) ?? null);
    }).pipe(Effect.orDie, Effect.withSpan("FilesRepo.getFilesByKeys"));
```

### Critical Issues in Current Implementation

1. **Missing columns in SQL**: The SELECT statement is missing required `File.Model` fields:
   - `organization_id AS "organizationId"` - REQUIRED
   - `user_id AS "userId"` - REQUIRED
   - `uploaded_by_user_id AS "uploadedByUserId"` - REQUIRED
   - `metadata` - REQUIRED

2. **Order preservation**: The function must return results in the same order as input keys, with `null` for keys not found.

3. **Not using `makeQueryWithSchema`**: Should align with other refactored queries in the file.

4. **Not exported**: The function is defined but not included in the service return object.

### RPC Definition

From `packages/shared/domain/src/api/files-rpc.ts`:
```typescript
export class GetFilesByKeysPayload extends S.Class<GetFilesByKeysPayload>("GetFilesByKeysPayload")({
  uploadKeys: S.Array(File.UploadKey).pipe(
    S.maxItems(100, {description: "Maximum of 100 files can be retrieved at once."})
  ),
}) {}

export class GetFilesByKeysSuccess extends S.Array(S.NullOr(File.Model)) {}

export class GetFilesByKeyRpc extends Rpc.make("getFilesByKeys", {
  payload: GetFilesByKeysPayload,
  success: GetFilesByKeysSuccess,  // Array<File.Model | null>
}) {}
```

**Key Insight**: The RPC expects `uploadKeys` but the repo uses `keys`. The RPC handler transforms this.

### File.Model Schema

From `packages/shared/domain/src/entities/File/File.model.ts`:
```typescript
export class Model extends M.Class<Model>($I`FileModel`)(
  {
    ...makeFields(SharedEntityIds.FileId, {
      organizationId: SharedEntityIds.OrganizationId,
      key: UploadKey.to,
      url: BS.URLString,
    }),
    name: S.NonEmptyTrimmedString,
    size: S.Int,
    mimeType: BS.MimeType,
    uploadedByUserId: SharedEntityIds.UserId,
    userId: SharedEntityIds.UserId,
    folderId: BS.FieldOptionOmittable(SharedEntityIds.FolderId),
    metadata: M.JsonFromString(BS.NormalizedFile.pipe(S.pick(...))),
  }
) {}
```

**Required fields**: `id`, `organizationId`, `key`, `url`, `name`, `size`, `mimeType`, `uploadedByUserId`, `userId`, `folderId`, `metadata`, `createdAt`, `updatedAt`

### File.UploadKey Schema

`File.UploadKey.Type` is a template literal string representing an S3 path:
```
/{env}/tenants/{shard}/{orgType}/{orgId}/{entityKind}/{entityId}/{attribute}/{year}/{month}/{fileId}.{ext}
```

Example: `/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_789.jpg`

The `key` column in the database stores this exact string.

### Database Schema

`file.table.ts`:
```typescript
export const file = OrgTable.make(SharedEntityIds.FileId)({
  key: pg.text("key").$type<typeof File.Model.Type["key"]>().notNull(),
  url: pg.text("url").$type<BS.URLString.Type>().notNull(),
  name: pg.text("name").notNull(),
  size: pg.integer("size").notNull(),
  mimeType: pg.text("mime_type").notNull().$type<BS.MimeType.Type>(),
  userId: pg.text("user_id").notNull().references(() => user.id).$type<SharedEntityIds.UserId.Type>(),
  folderId: pg.text("folder_id").references(() => folder.id).$type<SharedEntityIds.FolderId.Type>(),
  uploadedByUserId: pg.text("uploaded_by_user_id").notNull().references(() => user.id).$type<SharedEntityIds.UserId.Type>(),
  metadata: pg.text("metadata").notNull().$type<typeof File.Model.Encoded["metadata"]>(),
});
// OrgTable.make adds: id, organizationId, createdAt, updatedAt
```

### Current Imports in File.repo.ts

```typescript
import { $SharedInfraId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { File, Folder } from "@beep/shared-domain/entities";
import { SharedDb } from "@beep/shared-server/db";
import { Repo } from "@beep/shared-server/Repo";
import { folder } from "@beep/shared-tables";  // NOTE: 'file' table NOT imported
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
```

**Action Required**: Add `file` to the imports from `@beep/shared-tables`.

## Objective

Refactor `getFilesByKeys` to use Drizzle ORM via `makeQueryWithSchema`, ensuring:

1. **Use Drizzle relational query** - `client.query.file.findMany()` with `inArray` on `key`
2. **Return all File.Model fields** - Drizzle returns complete objects
3. **Preserve input order** - Return results in same order as input keys
4. **Handle missing keys** - Return `null` for keys not found
5. **Handle empty input** - Return empty array for empty keys
6. **Be transaction-aware** - Work within `TransactionContext` automatically
7. **Export the function** - Include in service return object

### Success Criteria

- [ ] Uses `makeQueryWithSchema` pattern
- [ ] All `File.Model` fields returned (Drizzle handles this automatically)
- [ ] Results ordered to match input keys array
- [ ] Missing keys return `null` at correct position
- [ ] Empty keys array returns empty array
- [ ] `file` table imported from `@beep/shared-tables`
- [ ] Function exported in service return object
- [ ] No native array/string methods (Effect utilities only)
- [ ] Type-safe with full TypeScript inference
- [ ] Transaction-aware via `makeQueryWithSchema`

## Role

You are an Effect-TS expert specializing in database layer implementations.

## Constraints

### Required Patterns (from AGENTS.md)

```typescript
// Import conventions
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as d from "drizzle-orm";

// Query pattern with makeQueryWithSchema
const query = makeQueryWithSchema({
  inputSchema: S.Struct({ /* ... */ }),
  outputSchema: S.Array(S.NullOr(File.Model)),
  queryFn: (execute, encodedInput) =>
    Effect.gen(function* () {
      // Query and transform
    })
});
```

### Forbidden Patterns

```typescript
// NEVER use native array methods
items.map(x => x.name)              // FORBIDDEN
F.pipe(items, A.map(x => x.name))   // REQUIRED

results.forEach(...)                // FORBIDDEN
F.pipe(results, A.forEach(...))     // REQUIRED

// NEVER use native Map constructor iteration
new Map(items.map(...))             // FORBIDDEN - uses native .map()

// NEVER use async/await
async () => { await query() }       // FORBIDDEN
Effect.gen(function* () { yield* query })  // REQUIRED
```

### Effect HashMap for Key Lookups

Use `effect/HashMap` instead of native `Map` for type-safe key lookups:

```typescript
import * as HashMap from "effect/HashMap";

// Build HashMap from results
const resultsByKey = F.pipe(
  results,
  A.map((file) => [file.key, file] as const),
  HashMap.fromIterable
);

// Lookup with Option
const lookup = (key: string) => HashMap.get(resultsByKey, key);

// Map input keys to results (with null for missing)
const ordered = F.pipe(
  inputKeys,
  A.map((key) => F.pipe(
    HashMap.get(resultsByKey, key),
    O.getOrNull
  ))
);
```

### Drizzle Query Patterns

```typescript
// Find many with inArray
client.query.file.findMany({
  where: (t, { inArray, eq, and }) =>
    and(
      inArray(t.key, keys),
      eq(t.userId, userId)
    )
})

// Alternative using select builder
client
  .select()
  .from(file)
  .where(d.and(
    d.inArray(file.key, keys),
    d.eq(file.userId, userId)
  ))
```

## Resources

### Files to Modify
- `packages/shared/server/src/repos/File.repo.ts` - Target file

### Files to Reference
- `packages/shared/server/src/internal/db/pg/PgClient.ts` - `makeQueryWithSchema` implementation
- `packages/shared/tables/src/tables/file.table.ts` - File table schema
- `packages/shared/domain/src/entities/File/File.model.ts` - File.Model schema
- `packages/shared/domain/src/entities/File/schemas/UploadKey.ts` - UploadKey schema
- `packages/shared/domain/src/api/files-rpc.ts` - RPC definitions

## Output Specification

### Required Changes

1. **Add `file` import** (update line ~6):
```typescript
import { file, folder } from "@beep/shared-tables";
```

2. **Add HashMap and Option imports**:
```typescript
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
```

3. **Replace `getFilesByKeys` with Drizzle implementation**:
```typescript
const getFilesByKeys = makeQueryWithSchema({
  inputSchema: S.Struct({
    keys: S.Array(File.UploadKey),
    userId: SharedEntityIds.UserId,
  }),
  outputSchema: S.Array(S.NullOr(File.Model)),
  queryFn: (execute, { keys, userId }) =>
    Effect.gen(function* () {
      // Handle empty input
      if (A.isEmptyArray(keys)) {
        return A.empty<File.Model.Type | null>();
      }

      // Fetch files matching any of the keys
      const results = yield* execute((client) =>
        client.query.file.findMany({
          where: (t, { inArray, eq, and }) =>
            and(inArray(t.key, keys), eq(t.userId, userId)),
        })
      );

      // Build lookup HashMap: key -> file
      const resultsByKey = F.pipe(
        results,
        A.map((f) => [f.key, f] as const),
        HashMap.fromIterable
      );

      // Return results in input order, null for missing keys
      return F.pipe(
        keys,
        A.map((key) =>
          F.pipe(HashMap.get(resultsByKey, key), O.getOrNull)
        )
      );
    }),
});
```

4. **Update service return object** - Add `getFilesByKeys`:
```typescript
return {
  moveFiles,
  listPaginated,
  getFilesByKeys,  // ADD THIS
  ...baseRepo,
};
```

5. **Remove unused imports** - After refactoring, `SqlSchema` may be unused if `moveFiles` is also refactored.

### Code Quality Requirements

- Full type safety (no `any`, no `@ts-ignore`)
- Effect utilities for collections (`A.map`, `A.isEmptyArray`, `HashMap.fromIterable`, `HashMap.get`, `O.getOrNull`)
- Proper error handling via Effect patterns
- Transaction-aware (works within `TransactionContext`)
- camelCase for all Drizzle column references

## Examples

### Example Input
```typescript
yield* FileRepo.getFilesByKeys({
  keys: [
    "/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_001.jpg",
    "/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_002.jpg",
    "/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_003.jpg",
  ] as File.UploadKey.Type[],
  userId: "user_456" as UserId
})
```

### Example Output (file_002 not found)
```typescript
[
  {
    id: "file_001",
    organizationId: "org_123",
    userId: "user_456",
    uploadedByUserId: "user_456",
    key: "/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_001.jpg",
    url: "https://s3.../file_001.jpg",
    name: "avatar.jpg",
    size: 1024,
    mimeType: "image/jpeg",
    folderId: null,
    metadata: {...},
    createdAt: "2024-03-15T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z"
  },
  null,  // file_002 not found - preserves position
  {
    id: "file_003",
    organizationId: "org_123",
    userId: "user_456",
    uploadedByUserId: "user_456",
    key: "/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_003.jpg",
    url: "https://s3.../file_003.jpg",
    name: "profile.jpg",
    size: 2048,
    mimeType: "image/jpeg",
    folderId: null,
    metadata: {...},
    createdAt: "2024-03-15T11:00:00Z",
    updatedAt: "2024-03-15T11:00:00Z"
  }
]
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Empty keys array | Return `[]` immediately |
| All keys found | Return all files in input order |
| No keys found | Return array of nulls matching input length |
| Some keys found | Return mix of files and nulls in input order |
| Duplicate keys in input | Return same file (or null) at each position |
| Key exists but wrong userId | Return null (authorization) |
| 100 keys (max) | Process all, return ordered results |

## Verification Checklist

- [ ] `file` table imported from `@beep/shared-tables`
- [ ] `HashMap` and `Option` imported from `effect`
- [ ] Uses `makeQueryWithSchema` pattern
- [ ] Empty array handled with `A.isEmptyArray()`
- [ ] Results ordered to match input keys
- [ ] Missing keys return `null` at correct position
- [ ] Uses `HashMap.fromIterable` (not native `Map`)
- [ ] Uses `HashMap.get` with `O.getOrNull` for lookups
- [ ] `getFilesByKeys` exported in service return object
- [ ] `bun run check --filter @beep/shared-server` passes
- [ ] `bun run lint --filter @beep/shared-server` passes
- [ ] No native Array methods used
- [ ] No `any` types or type assertions

## Implementation Steps

1. **Add imports** - `file` from `@beep/shared-tables`, `HashMap` and `Option` from `effect`
2. **Implement query** - Use `client.query.file.findMany()` with `inArray` and `eq`
3. **Build HashMap** - Use `HashMap.fromIterable` for key->file lookup
4. **Preserve order** - Map input keys to results using HashMap lookup
5. **Handle nulls** - Use `O.getOrNull` for missing keys
6. **Handle empty** - Return early for empty keys array
7. **Export function** - Add to service return object
8. **Clean imports** - Remove unused `SqlSchema` if applicable
9. **Run type check** - `bun run check --filter @beep/shared-server`
10. **Run lint** - `bun run lint --filter @beep/shared-server`

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/shared/server/src/repos/File.repo.ts` - Current implementation
- `packages/shared/server/src/internal/db/pg/PgClient.ts` - `makeQueryWithSchema`
- `packages/shared/domain/src/api/files-rpc.ts` - RPC definitions
- `packages/shared/domain/src/entities/File/File.model.ts` - File.Model schema
- `packages/shared/domain/src/entities/File/schemas/UploadKey.ts` - UploadKey type
- `packages/shared/tables/src/tables/file.table.ts` - File table schema

### Key Findings

| Issue | Resolution |
|-------|------------|
| Raw SQL missing required columns | Drizzle returns all columns automatically |
| Native `Map` used for lookups | Replace with `effect/HashMap` |
| Function not exported | Add to service return object |
| Order must be preserved | Map input keys through HashMap lookup |
| `file` table not imported | Add to imports |

### Related Queries Already Refactored

- `listPaginated` - Uses `client.query.folder.findMany()` with `with: { files: true }`
- Both demonstrate the Drizzle relational query pattern in this codebase
