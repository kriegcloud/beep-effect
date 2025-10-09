import { schema, type Schema as ZSchema } from "./zero-schema.gen";
export { schema, type ZSchema };

import type { UnsafeTypes } from "@beep/types";
// Type helper to filter tables that have a specific field
export type TablesWithField<Schema extends { tables: Record<string, UnsafeTypes.UnsafeAny> }, Field extends string> = {
  [K in keyof Schema["tables"]]: Field extends keyof Schema["tables"][K]["columns"] ? K : never;
}[keyof Schema["tables"]];

// Create a union type of all tables that have orgId
// type TablesWithOrgId = TablesWithField<ZSchema, "organizationId">;
