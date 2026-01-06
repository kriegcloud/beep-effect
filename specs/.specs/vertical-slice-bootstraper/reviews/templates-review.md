# Templates Review - create-slice CLI

## Summary

The CLI templates in `tooling/cli/src/commands/create-slice/templates/` are generally well-structured and follow the Effect patterns established in the codebase. However, there are several critical issues and inconsistencies when compared to the reference implementations in `packages/customization/`, `packages/documents/`, and `packages/iam/`.

**Key Findings:**
- 2 Critical Issues (missing templates, structural inconsistencies)
- 4 Major Issues (export pattern mismatches, missing files)
- 6 Minor Issues (JSDoc improvements, placeholder naming)
- Overall template quality: Good but needs refinement

---

## Critical Issues

### 1. Missing `schema.ts` Template for Tables Package

**Location:** `tooling/cli/src/commands/create-slice/templates/tables/src/`

**Issue:** The tables package template is missing the crucial `schema.ts` file that acts as the unified export point for all table schemas and relations.

**Reference implementations:**
- `packages/customization/tables/src/schema.ts`:
  ```typescript
  export * from "./relations";
  export * from "./tables";
  ```
- `packages/documents/tables/src/schema.ts`:
  ```typescript
  export * from "./relations";
  export * from "./tables";
  ```

**Current `index.ts.hbs`:**
```handlebars
export * from "./tables";
export * from "./relations";
```

**Problem:** The template exports directly from `index.ts` but reference implementations use `index.ts` to export a namespace (`{{SliceName}}DbSchema`) pointing to `schema.ts`. This breaks the expected import pattern `@beep/{{sliceName}}-tables/schema`.

**Fix Required:** Add `schema.ts.hbs` template and update `index.ts.hbs` to match reference pattern:
```handlebars
// index.ts.hbs should be:
export * as {{SliceName}}DbSchema from "./schema";

// schema.ts.hbs (new file):
export * from "./relations";
export * from "./tables";
```

### 2. Missing `_check.ts` Template for Tables Package

**Location:** `tooling/cli/src/commands/create-slice/templates/tables/src/`

**Issue:** Reference implementations include a `_check.ts` file for compile-time type verification between domain models and Drizzle table schemas.

**Reference:** `packages/customization/tables/src/_check.ts`:
```typescript
import type { UserHotkey } from "@beep/customization-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelectUserHotkey: typeof UserHotkey.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.userHotkey
>;

export const _checkInsertUserHotkey: typeof UserHotkey.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.userHotkey
>;
```

**Fix Required:** Add `_check.ts.hbs` template:
```handlebars
import type { Placeholder } from "@beep/{{sliceName}}-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelectPlaceholder: typeof Placeholder.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.placeholder
>;

export const _checkInsertPlaceholder: typeof Placeholder.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.placeholder
>;
```

---

## Major Issues

### 3. Domain `index.ts` Missing Value Objects Export

**Location:** `tooling/cli/src/commands/create-slice/templates/domain/src/index.ts.hbs`

**Current:**
```handlebars
export * as Entities from "./entities";
```

**Reference (documents):**
```typescript
export * as Entities from "./entities";
export * from "./value-objects";
```

**Issue:** Documents slice exports value-objects with `export *` pattern while the template only exports Entities namespace. Template should include value-objects export when the slice has value objects.

### 4. Server Package Missing @effect/sql Dependency in Dependencies Import

**Location:** `tooling/cli/src/commands/create-slice/templates/server/src/db/Db/Db.ts.hbs`

**Issue:** The template uses `@effect/sql/Model` import in `Placeholder.model.ts.hbs` but the server package.json includes it. However, the domain package.json is missing `@effect/sql` as a dependency even though models use `M.Class` from `@effect/sql/Model`.

**Current domain package.json.hbs:**
```json
{
  "dependencies": {
    "@beep/identity": "workspace:*",
    "@beep/schema": "workspace:*",
    "@beep/shared-domain": "workspace:*",
    "effect": "catalog:"
  }
}
```

**Missing:** `"@effect/sql": "catalog:"` should be added since `Placeholder.model.ts.hbs` imports from `@effect/sql/Model`.

### 5. Entity Export Pattern Inconsistency

**Location:** `tooling/cli/src/commands/create-slice/templates/domain/src/entities/Placeholder/index.ts.hbs`

**Current:**
```handlebars
export * from "./Placeholder.model";
```

**Reference (documents):**
```typescript
export * as DocumentErrors from "./Document.errors";
export * from "./Document.model";
export * as DocumentRpcs from "./Document.rpc";
```

**Issue:** Reference implementations export errors and RPCs as namespaces alongside the model. The template should include commented examples or stub files for `.errors.ts` and `.rpc.ts` to guide developers.

### 6. Server Index Missing JSDoc Documentation

**Location:** `tooling/cli/src/commands/create-slice/templates/server/src/index.ts.hbs`

**Current:**
```handlebars
/**
 * @beep/{{sliceName}}-server
 * {{sliceDescription}} - Server-side infrastructure
 * ...
 */
export * from "./db";
```

**Reference (documents):**
```typescript
export * from "./db";
export { ExifToolService, PdfMetadataService, pdfMetadataServiceEffect } from "./files";
```

**Issue:** Reference implementations may export additional services. The template should include a comment indicating where additional service exports would go.

---

## Minor Issues

### 7. Placeholder Entity Model Uses `new Date()` in Example

**Location:** `tooling/cli/src/commands/create-slice/templates/domain/src/entities/Placeholder/Placeholder.model.ts.hbs`

**Current JSDoc example:**
```typescript
 * const placeholder = Entities.Placeholder.Model.make({
 *   id: {{SliceName}}EntityIds.PlaceholderId.make("placeholder__123"),
 *   name: "Example",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
```

**Issue:** Per CLAUDE.md rules, `new Date()` is forbidden. Should use `DateTime.unsafeNow()`:
```typescript
 * const placeholder = Entities.Placeholder.Model.make({
 *   id: {{SliceName}}EntityIds.PlaceholderId.make("placeholder__123"),
 *   name: "Example",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
```

### 8. Relations Template Uses Destructured Parameter

**Location:** `tooling/cli/src/commands/create-slice/templates/tables/src/relations.ts.hbs`

**Current:**
```handlebars
export const placeholderRelations = d.relations(placeholder, (_) => ({
```

**Reference:**
```typescript
export const userHotkeyRelations = d.relations(userHotkey, ({ one }) => ({
```

**Issue:** Using `_` instead of destructured `{ one, many }` makes it less clear what's available. Consider:
```handlebars
export const placeholderRelations = d.relations(placeholder, ({ one, many }) => ({
```

### 9. Missing @category Tags in Some Templates

**Locations:**
- `domain/src/value-objects/index.ts.hbs` - No @category tag
- `server/src/db/index.ts.hbs` - No JSDoc at all

**Fix:** Add consistent JSDoc with @category tags matching the reference implementations.

### 10. Table Template Index Name Uses `slice_name` Variable

**Location:** `tooling/cli/src/commands/create-slice/templates/tables/src/tables/placeholder.table.ts.hbs`

**Current:**
```handlebars
(t) => [pg.index("{{slice_name}}_placeholder_name_idx").on(t.name)]
```

**Issue:** The `{{slice_name}}` variable should be snake_case. Verify this is being passed correctly (appears correct based on context, but worth confirming the variable naming).

### 11. Client Package Missing Stub Export

**Location:** `tooling/cli/src/commands/create-slice/templates/client/src/index.ts.hbs`

**Current:**
```handlebars
// Export client contracts here
// Example: export * from "./contracts";
```

**Reference (customization):**
```typescript
export const beep = "beep";
```

**Issue:** Reference has a placeholder export to prevent empty module errors. Template should include similar:
```handlebars
// Placeholder export to prevent empty module
export {};
```

Or better, a commented client stub.

### 12. UI Package Missing Stub Export

**Location:** `tooling/cli/src/commands/create-slice/templates/ui/src/index.ts.hbs`

**Same issue as client package** - should include `export {};` or similar placeholder.

---

## Recommendations

### High Priority

1. **Add `schema.ts.hbs`** template to tables package and update `index.ts.hbs` to export namespace pattern
2. **Add `_check.ts.hbs`** template for compile-time model/table alignment verification
3. **Add `@effect/sql` dependency** to domain `package.json.hbs`
4. **Fix DateTime example** in model template JSDoc

### Medium Priority

5. **Add stub error and RPC templates** under `domain/src/entities/Placeholder/`:
   - `Placeholder.errors.ts.hbs`
   - `Placeholder.rpc.ts.hbs` (commented out or minimal)
6. **Update value-objects export** in domain `index.ts.hbs`
7. **Add empty exports** to client and ui index templates to prevent empty module issues

### Low Priority

8. **Enhance JSDoc** across all templates with consistent @category, @since, @module tags
9. **Update relations template** to use destructured parameters
10. **Add service export comments** to server index template

---

## Template-by-Template Analysis

### domain/src/index.ts.hbs

**Status:** Needs Update

**Current:**
```handlebars
/**
 * @beep/{{sliceName}}-domain
 * {{sliceDescription}} - Domain entities and value objects
 * ...
 */
export * as Entities from "./entities";
```

**Issues:**
- Missing `export * from "./value-objects"` (present in documents reference)
- JSDoc is good with @module and @since tags

**Recommendation:** Add value-objects export with conditional or always-include pattern.

---

### domain/src/entities.ts.hbs

**Status:** Good

**Current:**
```handlebars
export * from "./entities/index";
```

**Matches reference:** Yes (customization pattern)

---

### domain/src/entities/index.ts.hbs

**Status:** Good with Minor Issue

**Current:**
```handlebars
export * as Placeholder from "./Placeholder";
```

**Matches reference:** Yes

**Minor:** Comment lines at bottom are helpful for guidance.

---

### domain/src/entities/Placeholder/index.ts.hbs

**Status:** Needs Enhancement

**Current:**
```handlebars
export * from "./Placeholder.model";
```

**Issue:** Reference implementations also export errors and RPCs. Should include commented examples:
```handlebars
export * from "./Placeholder.model";
// export * as PlaceholderErrors from "./Placeholder.errors";
// export * as PlaceholderRpcs from "./Placeholder.rpc";
```

---

### domain/src/entities/Placeholder/Placeholder.model.ts.hbs

**Status:** Good with Minor Issue

**Current model pattern matches reference:**
- Uses `M.Class` from `@effect/sql/Model`
- Uses `makeFields` and `modelKit` factories
- Uses `$I` identifier pattern
- Proper annotations

**Issues:**
1. JSDoc example uses `new Date()` instead of `DateTime.unsafeNow()`
2. Missing `@effect/sql` in domain `package.json.hbs`

---

### domain/src/value-objects/index.ts.hbs

**Status:** Acceptable

**Current:**
```handlebars
export {};
```

**Issue:** Missing JSDoc header. Should have:
```handlebars
/**
 * Value objects for the {{sliceName}} domain.
 *
 * @module {{sliceName}}-domain/value-objects
 * @since 0.1.0
 */
export {};
```

---

### tables/src/index.ts.hbs

**Status:** Critical - Needs Restructuring

**Current:**
```handlebars
export * from "./tables";
export * from "./relations";
```

**Reference:**
```typescript
export * as CustomizationDbSchema from "./schema";
```

**Issue:** Does not match namespace export pattern. The server package imports `@beep/{{sliceName}}-tables/schema` which expects a schema.ts file.

---

### tables/src/tables/index.ts.hbs

**Status:** Good

**Current:**
```handlebars
export * from "./placeholder.table";
```

**Matches reference pattern.**

---

### tables/src/tables/placeholder.table.ts.hbs

**Status:** Good

**Matches reference patterns:**
- Uses `Table.make` factory
- Proper entity ID usage
- Index definition pattern

**Note:** Reference implementation uses type imports for foreign key typing which could be shown as example.

---

### tables/src/relations.ts.hbs

**Status:** Good with Minor Issue

**Current uses `(_)` parameter, reference uses `({ one })` destructuring.**

---

### server/src/index.ts.hbs

**Status:** Good

**Current:**
```handlebars
export * from "./db";
```

**Matches reference (customization).** Documents has additional service exports.

---

### server/src/db.ts.hbs

**Status:** Good

**Current:**
```handlebars
export * from "./db/index";
```

**Matches reference.**

---

### server/src/db/index.ts.hbs

**Status:** Good

**Current:**
```handlebars
export * from "./Db";
export * from "./repos";
export * as {{SliceName}}Repos from "./repositories";
```

**Matches reference exactly.**

---

### server/src/db/Db/index.ts.hbs

**Status:** Good

**Current:**
```handlebars
export * as {{SliceName}}Db from "./Db";
```

**Matches reference.**

---

### server/src/db/Db/Db.ts.hbs

**Status:** Good

**Matches reference exactly:**
- Uses `DbClient.make` factory
- Proper Context.Tag pattern
- Layer.scoped pattern
- Type exports

---

### server/src/db/repos/index.ts.hbs

**Status:** Good

**Current:**
```handlebars
export * from "./Placeholder.repo";
```

**Matches reference pattern.**

---

### server/src/db/repos/_common.ts.hbs

**Status:** Good

**Current:**
```handlebars
import { {{SliceName}}Db } from "@beep/{{sliceName}}-server/db";
export const dependencies = [{{SliceName}}Db.layer] as const;
```

**Matches reference exactly.**

---

### server/src/db/repos/Placeholder.repo.ts.hbs

**Status:** Good

**Matches reference patterns:**
- Uses `Effect.Service` with dependencies
- Uses `DbRepo.make` factory
- Proper $I identifier pattern

---

### server/src/db/repositories.ts.hbs

**Status:** Good

**Current:**
```handlebars
export type Repos = repos.PlaceholderRepo;
export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | {{SliceName}}Db.Db>;
export const layer: ReposLayer = Layer.mergeAll(repos.PlaceholderRepo.Default);
export * from "./repos";
```

**Matches reference pattern.**

---

### client/src/index.ts.hbs

**Status:** Needs Empty Export

**Current has comments only, should include `export {};` to prevent empty module issues.**

---

### ui/src/index.ts.hbs

**Status:** Needs Empty Export

**Same issue as client.**

---

### package.json Templates

**domain/package.json.hbs:** Missing `@effect/sql` dependency
**tables/package.json.hbs:** Good
**server/package.json.hbs:** Good
**client/package.json.hbs:** Good
**ui/package.json.hbs:** Good

---

### tsconfig Templates

**All tsconfig templates (tsconfig.json.hbs, tsconfig.src.json.hbs, tsconfig.build.json.hbs, tsconfig.test.json.hbs):** Good - match expected patterns.

---

## Missing Templates

1. **`tables/src/schema.ts.hbs`** - Critical, needed for import pattern
2. **`tables/src/_check.ts.hbs`** - Important for type safety
3. **`domain/src/entities/Placeholder/Placeholder.errors.ts.hbs`** - Nice to have
4. **`domain/src/entities/Placeholder/Placeholder.rpc.ts.hbs`** - Nice to have

---

## Conclusion

The templates are fundamentally sound and follow the Effect patterns correctly. The main issues are:

1. **Structural:** The tables package export structure doesn't match reference implementations (missing schema.ts namespace pattern)
2. **Type Safety:** Missing _check.ts template for compile-time verification
3. **Dependencies:** Missing @effect/sql in domain package
4. **Polish:** Minor JSDoc and empty export issues

Addressing the critical and major issues will ensure generated slices are immediately functional without manual adjustment.
