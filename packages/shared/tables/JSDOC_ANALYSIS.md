# JSDoc Analysis Report: @beep/shared-tables

> **Generated**: 2025-12-06T16:38:37.809Z
> **Package**: packages/shared/tables
> **Status**: 119 exports need documentation

---

## Instructions for Agent

You are tasked with adding missing JSDoc documentation to this package. Follow these rules:

1. **Required Tags**: Every public export must have:
   - `@category` - Hierarchical category (e.g., "Constructors", "Models/User", "Utils/String")
   - `@example` - Working TypeScript code example with imports
   - `@since` - Version when added (use `0.1.0` for new items)

2. **Example Format**:
   ````typescript
   /**
    * Brief description of what this does.
    *
    * @example
    * ```typescript
    * import { MyThing } from "@beep/shared-tables"
    *
    * const result = MyThing.make({ field: "value" })
    * console.log(result)
    * // => { field: "value" }
    * ```
    *
    * @category Constructors
    * @since 0.1.0
    */
   ````

3. **Workflow**:
   - Work through the checklist below in order
   - Mark items complete by changing `[ ]` to `[x]`
   - After completing all items, delete this file

---

## Progress Checklist

### High Priority (Missing all required tags)

- [ ] `src/_check.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/_check.ts:5` — **_checkSelectOrganization** (const)
  - Missing: @category, @example, @since

- [ ] `src/_check.ts:8` — **_checkInsertOrganization** (const)
  - Missing: @category, @example, @since

- [ ] `src/_check.ts:12` — **_checkSelectTeam** (const)
  - Missing: @category, @example, @since

- [ ] `src/_check.ts:13` — **_checkInsertTeam** (const)
  - Missing: @category, @example, @since

- [ ] `src/_check.ts:14` — **_sessionSelect** (const)
  - Missing: @category, @example, @since

- [ ] `src/_check.ts:16` — **_checkInsertSession** (const)
  - Missing: @category, @example, @since

- [ ] `src/Columns.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/Columns.ts:6` — **DefaultColumns** (type)
  - Missing: @category, @example, @since

- [ ] `src/common.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/common.ts:6` — **utcNow** (const)
  - Missing: @category, @example, @since

- [ ] `src/common.ts:8` — **auditColumns** (const)
  - Missing: @category, @example, @since

- [ ] `src/common.ts:14` — **userTrackingColumns** (const)
  - Missing: @category, @example, @since

- [ ] `src/common.ts:20` — **globalColumns** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/index.ts:1` — **export * from "./Columns";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./Columns needs documentation

- [ ] `src/index.ts:2` — **export * from "./columns";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./columns needs documentation

- [ ] `src/index.ts:3` — **export * as Common from "./common";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./common needs documentation

- [ ] `src/index.ts:4` — **export * from "./OrgTable";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./OrgTable needs documentation

- [ ] `src/index.ts:5` — **export * from "./schema";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./schema needs documentation

- [ ] `src/index.ts:6` — **export * from "./Table";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./Table needs documentation

- [ ] `src/index.ts:7` — **export * as SharedDbSchemas from "./tables";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./tables needs documentation

- [ ] `src/index.ts:1` — **Common** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **SharedDbSchemas** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:6` — **DefaultColumns** (type)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **OrgTable** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:11` — **envValuePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:12` — **fileTypePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:13` — **fileStatusPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:14` — **extensionPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:15` — **entityKindPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:16` — **file** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:58` — **fileRelations** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:9` — **organizationTypePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:10` — **subscriptionTierPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:11` — **subscriptionStatusPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:13` — **organization** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:10` — **session** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:5` — **team** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:7` — **userRolePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:8` — **user** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **Table** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/schema.ts:1` — **export * from "./tables";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./tables needs documentation

- [ ] `src/schema.ts:11` — **envValuePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:12` — **fileTypePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:13` — **fileStatusPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:14` — **extensionPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:15` — **entityKindPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:16` — **file** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:58` — **fileRelations** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:9` — **organizationTypePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:10` — **subscriptionTierPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:11` — **subscriptionStatusPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:13` — **organization** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:10` — **session** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:5` — **team** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:7` — **userRolePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:8` — **user** (const)
  - Missing: @category, @example, @since

- [ ] `src/columns/bytea.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/columns/index.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/columns/index.ts:1` — **export { bytea, byteaBase64 } from "./bytea";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./bytea needs documentation

- [ ] `src/OrgTable/index.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/OrgTable/index.ts:1` — **export * as OrgTable from "./OrgTable";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./OrgTable needs documentation

- [ ] `src/OrgTable/index.ts:1` — **OrgTable** (const)
  - Missing: @category, @example, @since

- [ ] `src/OrgTable/OrgTable.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/OrgTable/OrgTable.ts:17` — **make** (const)
  - Missing: @category, @example, @since

- [ ] `src/Table/index.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/Table/index.ts:1` — **export * as Table from "./Table";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./Table needs documentation

- [ ] `src/Table/index.ts:1` — **Table** (const)
  - Missing: @category, @example, @since

- [ ] `src/Table/Table.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/Table/Table.ts:8` — **make** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/file.table.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tables/file.table.ts:11` — **envValuePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/file.table.ts:12` — **fileTypePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/file.table.ts:13` — **fileStatusPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/file.table.ts:14` — **extensionPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/file.table.ts:15` — **entityKindPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/file.table.ts:16` — **file** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/file.table.ts:58` — **fileRelations** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tables/index.ts:1` — **export * from "./file.table";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./file.table needs documentation

- [ ] `src/tables/index.ts:2` — **export * from "./organization.table";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./organization.table needs documentation

- [ ] `src/tables/index.ts:3` — **export * from "./session.table";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./session.table needs documentation

- [ ] `src/tables/index.ts:4` — **export * from "./team.table";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./team.table needs documentation

- [ ] `src/tables/index.ts:5` — **export * from "./user.table";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./user.table needs documentation

- [ ] `src/tables/index.ts:11` — **envValuePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:12` — **fileTypePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:13` — **fileStatusPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:14` — **extensionPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:15` — **entityKindPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:16` — **file** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:58` — **fileRelations** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:9` — **organizationTypePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:10` — **subscriptionTierPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:11` — **subscriptionStatusPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:13` — **organization** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:10` — **session** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:5` — **team** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:7` — **userRolePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/index.ts:8` — **user** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/organization.table.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tables/organization.table.ts:9` — **organizationTypePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/organization.table.ts:10` — **subscriptionTierPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/organization.table.ts:11` — **subscriptionStatusPgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/organization.table.ts:13` — **organization** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/session.table.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tables/session.table.ts:10` — **session** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/team.table.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tables/team.table.ts:5` — **team** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/user.table.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tables/user.table.ts:7` — **userRolePgEnum** (const)
  - Missing: @category, @example, @since

- [ ] `src/tables/user.table.ts:8` — **user** (const)
  - Missing: @category, @example, @since

### Medium Priority (Missing some tags)

- [ ] `src/index.ts:26` — **bytea** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Custom Drizzle column type for PostgreSQL's `bytea` (binary data).

- [ ] `src/index.ts:63` — **byteaBase64** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Custom Drizzle column type for PostgreSQL's `bytea` with Base64 string interface.

- [ ] `src/columns/bytea.ts:26` — **bytea** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Custom Drizzle column type for PostgreSQL's `bytea` (binary data).

- [ ] `src/columns/bytea.ts:63` — **byteaBase64** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Custom Drizzle column type for PostgreSQL's `bytea` with Base64 string interface.

- [ ] `src/columns/index.ts:26` — **bytea** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Custom Drizzle column type for PostgreSQL's `bytea` (binary data).

- [ ] `src/columns/index.ts:63` — **byteaBase64** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Custom Drizzle column type for PostgreSQL's `bytea` with Base64 string interface.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 119 |
| Fully Documented | 0 |
| Missing Documentation | 119 |
| Missing @category | 102 |
| Missing @example | 96 |
| Missing @since | 119 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/shared/tables
```

If successful, delete this file. If issues remain, the checklist will be regenerated.