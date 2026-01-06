/**
 * Unified schema for db-admin that exports all tables and merged relations.
 *
 * This is used for:
 * - Drizzle migrations (drizzle-kit)
 * - Database admin tools
 * - Seeding scripts
 *
 * Individual slices should NOT import from here - they should use their own
 * slice-scoped schemas for proper type inference and vertical slice isolation.
 */

export * from "@beep/shared-tables/columns/bytea";
export * from "@beep/shared-tables/columns/custom-datetime";
export * from "./relations";
export * from "./slice-relations";
export * from "./tables";
