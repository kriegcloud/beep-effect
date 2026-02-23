# Drizzle Typed Columns Feature

Read `.specs/dsl-drizzle-typed-columns/DRIZZLE-TYPED-COLUMNS-HANDOFF.md` and implement the feature described there.

## Summary

You need to enhance the DSL.Model → Drizzle adapter with two capabilities:

1. **Typed Columns**: Add `.$type<T>()` calls to generated Drizzle columns where `T` is `S.Schema.Encoded<field>`, giving proper TypeScript types to the resulting table.

2. **Type Compatibility Validation**: Add compile-time validation that ensures column config types (e.g., `"uuid"`, `"integer"`) are compatible with the schema's encoded type (e.g., `string`, `number`).

## Starting Point

Begin by reading these files to understand the current implementation:
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` - Current Drizzle adapter
- `packages/common/schema/src/integrations/sql/dsl/types.ts` - Type definitions
- `packages/common/schema/src/integrations/sql/dsl/Field.ts` - Field factory

Then research Drizzle's `.$type<T>()` API to understand how it works and what types it accepts.

## Deliverables

1. Updated `toDrizzle()` that produces typed columns
2. Type-level validation for schema/column compatibility
3. Tests demonstrating both features
4. Update any type definitions as needed
