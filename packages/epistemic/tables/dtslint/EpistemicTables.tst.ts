import { describe, expect, it } from "tstyche";
import type { EntityTable } from "@beep/drizzle";
import type * as UsageRecord from "@beep/epistemic-domain/entities/UsageRecord";
import type { DbSchema } from "@beep/epistemic-tables";
import type * as UsageRecordTables from "@beep/epistemic-tables/entities/UsageRecord";

describe("EpistemicTables types", () => {
  it("exports the DbSchema type from the package entrypoint", () => {
    expect<DbSchema>().type.toBe<{
      readonly usageRecord: typeof UsageRecordTables.Table;
    }>();
  });

  it("preserves UsageRecord table and descriptor metadata literals", () => {
    expect<typeof UsageRecordTables.Table>().type.toBeAssignableTo<
      EntityTable.TableFor<typeof UsageRecord.UsageRecord>
    >();
    expect<typeof UsageRecordTables.Table.definition.tableName>().type.toBe<"epistemic_usage_record">();
    expect<typeof UsageRecordTables.Table.definition.entityId.entityType>().type.toBe<"EpistemicUsageRecord">();
    expect<typeof UsageRecordTables.Table.definition.persisted.actor.storageKind>().type.toBe<"jsonb">();
    expect<typeof UsageRecordTables.Table.definition.persisted.metadata.storageKind>().type.toBe<"jsonb">();
    expect<typeof UsageRecordTables.Table.definition.persisted.model.storageKind>().type.toBe<"text">();
    expect<typeof UsageRecordTables.Table.definition.persisted.provider.storageKind>().type.toBe<"text">();
  });
});
