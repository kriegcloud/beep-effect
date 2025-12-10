---
name: refactor-movefiles-drizzle
version: 1
created: 2025-01-10T14:00:00Z
iterations: 0
---

# Refactor moveFiles Mutation to Drizzle

## Context

You are working in the `beep-effect` monorepo, an Effect-first full-stack application. The codebase uses:
- **Effect 3** with `@effect/sql` for database operations
- **Drizzle ORM** with PostgreSQL via `drizzle-orm/node-postgres`
- **Effect Schema** (`effect/Schema`) for runtime validation

### Current State

The `FileRepo` in `packages/shared/infra/src/repos/File.repo.ts` has two implementations for moving files:

1. **`_moveFiles`** (lines 92-100) - A stub using `makeQueryWithSchema` that needs completion:
```typescript
const _moveFiles = makeQueryWithSchema({
  inputSchema: S.Struct({
    fileIds: S.Array(SharedEntityIds.FileId),
    folderId: SharedEntityIds.FolderId,
    userId: SharedEntityIds.UserId,
  }),
  outputSchema: S.Void,
  queryFn: (execute, {fileIds, folderId, userId}) => execute((client) => {})
});
```

2. **`moveFiles`** (lines 102-141) - A working implementation using `@effect/sql`'s `SqlSchema.void` with raw PostgreSQL SQL:
```typescript
const moveFiles = flow(
    SqlSchema.void({
      Request: Schema.Struct({
        fileIds: Schema.Array(UploadedFileId),
        folderId: Schema.NullOr(FolderId),
        userId: UserId,
      }),
      execute: (req) =>
        req.folderId === null
          ? sql`
              UPDATE public.files f
              SET
                folder_id = NULL,
                updated_at = now()
              WHERE
                ${sql.in("f.id", req.fileIds)}
                AND f.user_id = ${req.userId}
            `
          : sql`
              UPDATE public.files f
              SET
                folder_id = ${req.folderId},
                updated_at = now()
              WHERE
                ${sql.in("f.id", req.fileIds)}
                AND f.user_id = ${req.userId}
                AND EXISTS (
                  SELECT
                    1
                  FROM
                    public.file_folders folder
                  WHERE
                    folder.id = ${req.folderId}
                    AND folder.user_id = ${req.userId}
                )
            `,
    }),
    Effect.orDie,
    Effect.withSpan("FilesRepo.moveFiles"),
  );
```

### Critical Business Logic

The current SQL implementation has important authorization logic:

1. **Move to root (folderId = null)**: Simply sets `folder_id = NULL` for files owned by the user
2. **Move to folder**: Only moves files if:
   - The files belong to the user (`f.user_id = ${req.userId}`)
   - The target folder exists AND belongs to the user (`folder.user_id = ${req.userId}`)

**Security Note**: The `EXISTS` subquery prevents moving files to folders the user doesn't own. This authorization check MUST be preserved in the Drizzle implementation.

### Database Schema

**Tables** (from `packages/shared/tables/src/tables/`):

`file.table.ts`:
```typescript
export const file = OrgTable.make(SharedEntityIds.FileId)({
  // OrgTable.make automatically adds: id, organizationId, createdAt, updatedAt
  key: pg.text("key").$type<typeof File.Model.Type["key"]>().notNull(),
  url: pg.text("url").$type<BS.URLString.Type>().notNull(),
  name: pg.text("name").notNull(),
  size: pg.integer("size").notNull(),
  mimeType: pg.text("mime_type").notNull().$type<BS.MimeType.Type>(),
  userId: pg.text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }).$type<SharedEntityIds.UserId.Type>(),
  folderId: pg.text("folder_id").references(() => folder.id, { onDelete: "cascade" }).$type<SharedEntityIds.FolderId.Type>(),
  uploadedByUserId: pg.text("uploaded_by_user_id").notNull().references(() => user.id, { onDelete: "cascade" }).$type<SharedEntityIds.UserId.Type>(),
  metadata: pg.text("metadata").notNull().$type<typeof File.Model.Encoded["metadata"]>(),
});
```

`folder.table.ts`:
```typescript
export const folder = OrgTable.make(SharedEntityIds.FolderId)(
  {
    // OrgTable.make automatically adds: id, organizationId, createdAt, updatedAt
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    name: pg.text("name").notNull(),
  },
  (t) => [
    pg.index("folder_user_idx").on(t.userId)
  ]
);
```

**Note**: The table name in the existing SQL is `public.file_folders` but the actual Drizzle table is `folder`. Verify the correct table name.

## Objective

Refactor the `_moveFiles` stub to use Drizzle ORM queries via the `makeQueryWithSchema` pattern, replacing the raw SQL implementation. The refactored mutation must:

1. **Use Drizzle query builder** - Use `client.update().set().where()` syntax
2. **Handle null folderId** - Move files to root when `folderId` is null
3. **Preserve authorization logic** - Only move to folders owned by the user
4. **Update timestamps** - Set `updatedAt` to current time
5. **Support batch operations** - Handle multiple file IDs in a single operation
6. **Be transaction-aware** - Work within `TransactionContext` automatically

### Success Criteria

- [ ] Mutation executes without SQL errors
- [ ] Files are moved to the specified folder (or root if null)
- [ ] Authorization check prevents moving to unauthorized folders
- [ ] `updatedAt` is set to current timestamp on move
- [ ] Batch file IDs are handled correctly
- [ ] No native array/string methods used (Effect utilities only)
- [ ] Type-safe with full TypeScript inference
- [ ] Transaction-aware via `makeQueryWithSchema`

## Role

You are an Effect-TS expert specializing in database layer implementations. You understand:
- Effect's service pattern and dependency injection via Layers
- Drizzle ORM's query builder API for UPDATE operations
- Effect Schema for runtime validation and transformation
- The beep-effect monorepo's conventions and patterns

## Constraints

### Required Patterns (from AGENTS.md)

```typescript
// Import conventions
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as d from "drizzle-orm";           // For eq, and, inArray, isNull, sql, etc.

// Mutation pattern
const mutation = makeQueryWithSchema({
  inputSchema: S.Struct({ /* ... */ }),
  outputSchema: S.Void,  // For mutations that don't return data
  queryFn: (execute, encodedInput) =>
    execute((client) => /* Drizzle update here */)
});
```

### Forbidden Patterns

```typescript
// NEVER use native array methods
items.map(x => x.name)        // ❌
F.pipe(items, A.map(x => x.name))  // ✅

// NEVER use async/await
async () => { await query() } // ❌
Effect.gen(function* () { yield* query })  // ✅
```

### Drizzle UPDATE Patterns

```typescript
// Basic update
client.update(table).set({ column: value }).where(condition)

// Update with multiple conditions
client.update(file)
  .set({ folderId: newFolderId, updatedAt: new Date() })
  .where(d.and(
    d.inArray(file.id, fileIds),
    d.eq(file.userId, userId)
  ))

// Update with subquery (for authorization)
client.update(file)
  .set({ folderId: newFolderId, updatedAt: new Date() })
  .where(d.and(
    d.inArray(file.id, fileIds),
    d.eq(file.userId, userId),
    d.exists(
      client.select({ one: d.sql`1` })
        .from(folder)
        .where(d.and(
          d.eq(folder.id, newFolderId),
          d.eq(folder.userId, userId)
        ))
    )
  ))

// Set to null
client.update(file)
  .set({ folderId: null, updatedAt: new Date() })
  .where(condition)
```

### Handling Nullable folderId

The input schema uses `Schema.NullOr(FolderId)` which means `folderId` can be `null`. The Drizzle implementation must handle both cases:

```typescript
// Option 1: Conditional logic in queryFn
queryFn: (execute, { fileIds, folderId, userId }) =>
  folderId === null
    ? execute((client) => /* move to root */)
    : execute((client) => /* move to folder with auth check */)

// Option 2: Single query with conditional where clause
// (more complex, may not preserve exact authorization behavior)
```

**Recommended**: Use Option 1 (conditional logic) to clearly separate the two cases and preserve the authorization check for non-null folder moves.

## Resources

### Files to Read
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/infra/src/repos/File.repo.ts` - Target file
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/infra/src/internal/db/pg/PgClient.ts` - `makeQueryWithSchema` implementation
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/tables/src/tables/file.table.ts` - File table
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/tables/src/tables/folder.table.ts` - Folder table
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/entity-ids/shared.ts` - Entity IDs

### Documentation
- Drizzle UPDATE: `client.update(table).set({...}).where(...)`
- Drizzle operators: `d.eq`, `d.and`, `d.or`, `d.inArray`, `d.isNull`, `d.exists`
- Drizzle SQL template: `d.sql` for raw SQL fragments

## Output Specification

### Deliverable

A complete implementation of `moveFiles` (rename from `_moveFiles`) in `packages/shared/infra/src/repos/File.repo.ts` that:

1. Replaces the raw SQL implementation
2. Uses `makeQueryWithSchema` with proper input/output schemas
3. Uses Drizzle ORM for update operations
4. Handles both null and non-null folderId cases
5. Preserves the authorization check (user must own target folder)
6. Updates the `updatedAt` timestamp

### Implementation Approach

```typescript
import { file, folder } from "@beep/shared-tables";
import * as d from "drizzle-orm";

const moveFiles = makeQueryWithSchema({
  inputSchema: S.Struct({
    fileIds: S.Array(SharedEntityIds.FileId),
    folderId: S.NullOr(SharedEntityIds.FolderId),
    userId: SharedEntityIds.UserId,
  }),
  outputSchema: S.Void,
  queryFn: (execute, { fileIds, folderId, userId }) => {
    // Handle empty fileIds array
    if (A.isEmptyArray(fileIds)) {
      return Effect.void;
    }

    // Move to root (no authorization check needed)
    if (folderId === null) {
      return execute((client) =>
        client
          .update(file)
          .set({
            folderId: null,
            updatedAt: new Date(),
          })
          .where(
            d.and(
              d.inArray(file.id, fileIds),
              d.eq(file.userId, userId)
            )
          )
      );
    }

    // Move to folder (with authorization check)
    return execute((client) =>
      client
        .update(file)
        .set({
          folderId,
          updatedAt: new Date(),
        })
        .where(
          d.and(
            d.inArray(file.id, fileIds),
            d.eq(file.userId, userId),
            d.exists(
              client
                .select({ one: d.sql`1` })
                .from(folder)
                .where(
                  d.and(
                    d.eq(folder.id, folderId),
                    d.eq(folder.userId, userId)
                  )
                )
            )
          )
        )
    );
  },
});
```

### Code Quality Requirements

- Full type safety (no `any`, no `@ts-ignore`)
- Effect utilities for collections (`A.map`, `A.filter`, `A.isEmptyArray`, etc.)
- Proper error handling via Effect patterns
- Transaction-aware (works within `TransactionContext`)

## Examples

### Example Input - Move to Folder
```typescript
moveFiles({
  fileIds: ["file_abc123", "file_def456"] as FileId[],
  folderId: "folder_xyz789" as FolderId,
  userId: "user_123" as UserId
})
```

### Example Input - Move to Root
```typescript
moveFiles({
  fileIds: ["file_abc123", "file_def456"] as FileId[],
  folderId: null,
  userId: "user_123" as UserId
})
```

### Edge Cases

| Scenario | Expected Behavior |
|----------|------------------|
| Empty fileIds array | No-op, return void |
| folderId = null | Move files to root (set folder_id = NULL) |
| folderId = valid, owned by user | Move files to that folder |
| folderId = valid, NOT owned by user | No files moved (EXISTS fails) |
| folderId = non-existent | No files moved (EXISTS fails) |
| Some fileIds not owned by user | Only user's files are moved |
| All fileIds not owned by user | No files moved |

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Forgetting authorization check for non-null folderId | Use `d.exists()` subquery |
| Not handling null folderId case | Use conditional logic in queryFn |
| Using native array methods | Use `A.isEmptyArray`, `A.map`, etc. |
| Forgetting to update `updatedAt` | Include in `.set({ updatedAt: new Date() })` |
| Using wrong table name | Use imported `file` and `folder` from `@beep/shared-tables` |

## Verification Checklist

- [ ] `bun run check --filter @beep/shared-infra` passes
- [ ] `bun run lint --filter @beep/shared-infra` passes
- [ ] Authorization check prevents moving to unauthorized folders
- [ ] Move to root (null folderId) works correctly
- [ ] Move to folder (non-null folderId) works correctly
- [ ] `updatedAt` is updated on move
- [ ] Empty fileIds array is handled gracefully
- [ ] No native Array/String methods used
- [ ] No `any` types or type assertions
- [ ] Works within transactions (TransactionContext aware)

## Implementation Steps

1. **Read current implementation** - Understand existing raw SQL logic
2. **Add necessary imports** - Ensure `file`, `folder` tables and Drizzle operators are imported
3. **Handle null folderId case** - Move to root with simple WHERE clause
4. **Handle non-null folderId case** - Move to folder with EXISTS authorization check
5. **Handle empty array edge case** - Return Effect.void for empty fileIds
6. **Remove old implementation** - Delete the raw SQL `moveFiles` and rename `_moveFiles` to `moveFiles`
7. **Update exports** - Ensure `moveFiles` is returned from the service
8. **Run type check** - `bun run check --filter @beep/shared-infra`
9. **Run lint** - `bun run lint --filter @beep/shared-infra`

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/shared/infra/src/repos/File.repo.ts`
- `packages/shared/infra/src/internal/db/pg/PgClient.ts`
- `packages/shared/tables/src/tables/file.table.ts`
- `packages/shared/tables/src/tables/folder.table.ts`
- `packages/shared/domain/src/entity-ids/shared.ts`

### Notes

The existing raw SQL references `public.file_folders` but the Drizzle table is named `folder`. The `listPaginated` query in the same file was successfully refactored using `client.query.folder.findMany()`, confirming the correct table reference.
