import { UsageRecord as UsageRecordModel } from "@beep/epistemic-domain/entities/UsageRecord";
import { DbSchema, Entities } from "@beep/epistemic-tables";
import * as UsageRecord from "@beep/epistemic-tables/entities/UsageRecord";
import { describe, expect, it } from "@effect/vitest";
import { getColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const systemPrincipal = { component: "Runtime", kind: "System" };
const baseEntityInput = (entityType: string, id: number) => ({
  createdAt: id,
  createdByPrincipal: systemPrincipal,
  entityType,
  id,
  orgId: 1,
  rowVersion: 1,
  schemaVersion: "0.0.0",
  source: "System",
  updatedAt: id + 1,
  updatedByPrincipal: systemPrincipal,
});

const usageRecordInput = (id: number) => ({
  ...baseEntityInput("EpistemicUsageRecord", id),
  activityId: 7,
  actor: systemPrincipal,
  costUsdApproxMicros: null,
  credentialReference: null,
  inputTokens: 12,
  latencyMillis: null,
  metadata: { trace: "fixture" },
  model: "fixture-model",
  outputTokens: 34,
  provider: "fixture",
  totalTokens: 46,
  unitCount: null,
});

describe("EpistemicTables", () => {
  it("materializes UsageRecord metadata without executing a live database", () => {
    const config = getTableConfig(UsageRecord.Table);

    expect(UsageRecord.Table.definition.tableName).toBe("epistemic_usage_record");
    expect(UsageRecord.Table.definition.entityId.entityType).toBe("EpistemicUsageRecord");
    expect(UsageRecord.Table.entitySchema).toBe(UsageRecordModel);
    expect(config.name).toBe("epistemic_usage_record");

    const columns = getColumns(UsageRecord.Table);
    expect(columns.id.name).toBe("id");
    expect(columns.id.primary).toBe(true);
    expect(columns.id.columnType).toBe("PgSerial");
    expect(columns.entityType.name).toBe("entity_type");
    expect(columns.activityId.name).toBe("activity_id");
    expect(columns.activityId.columnType).toBe("PgInteger");
    expect(columns.actor.columnType).toBe("PgJsonb");
    expect(columns.metadata.columnType).toBe("PgJsonb");
    expect(columns.model.columnType).toBe("PgText");
    expect(columns.provider.columnType).toBe("PgText");
    expect(columns.costUsdApproxMicros.name).toBe("cost_usd_approx_micros");
    expect(columns.costUsdApproxMicros.notNull).toBe(false);
  });

  it("exports the metadata aggregate and entity namespaces", () => {
    expect(DbSchema.usageRecord).toBe(UsageRecord.Table);
    expect(Entities.UsageRecord.Table).toBe(UsageRecord.Table);
  });

  it("round-trips a UsageRecord row through the converters", () => {
    const record = S.decodeUnknownSync(UsageRecordModel)(usageRecordInput(10));

    const insert = UsageRecord.toUsageRecordInsert(record);
    expect("id" in insert).toBe(false);
    expect(insert.provider).toBe("fixture");
    expect(insert.model).toBe("fixture-model");
    expect(insert.entityType).toBe("EpistemicUsageRecord");
    expect(insert.activityId).toBe(7);
    expect(insert.inputTokens).toBe(12);
    expect(insert.outputTokens).toBe(34);
    expect(insert.totalTokens).toBe(46);
    expect(insert.costUsdApproxMicros).toBeNull();
    expect(insert.credentialReference).toBeNull();
    expect(insert.unitCount).toBeNull();

    const decoded = UsageRecord.fromUsageRecordRow({
      ...insert,
      id: 10,
      // $inferInsert types the nullable columns as optional (number | null |
      // undefined); the select-row converter expects number | null, so resolve
      // each absent optional to its concrete null before round-tripping.
      costUsdApproxMicros: insert.costUsdApproxMicros ?? null,
      credentialReference: insert.credentialReference ?? null,
      inputTokens: insert.inputTokens ?? null,
      latencyMillis: insert.latencyMillis ?? null,
      outputTokens: insert.outputTokens ?? null,
      totalTokens: insert.totalTokens ?? null,
      unitCount: insert.unitCount ?? null,
    });
    expect(decoded.provider).toBe("fixture");
    expect(decoded.model).toBe("fixture-model");
    expect(O.getOrNull(decoded.inputTokens)).toBe(12);
    expect(O.getOrNull(decoded.costUsdApproxMicros)).toBeNull();
    expect(O.isNone(decoded.unitCount)).toBe(true);
  });
});
