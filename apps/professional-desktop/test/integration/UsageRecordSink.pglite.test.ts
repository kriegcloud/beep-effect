import { fileURLToPath } from "node:url";
import { appendTurnFinalizationUsageRecord, TurnFinalizationUsageAppend } from "@beep/epistemic-domain";
import * as UsageRecordTable from "@beep/epistemic-tables/entities/UsageRecord";
import { makeDrizzle, makeDrizzleLayer, migrate } from "@beep/postgres";
import { makePgliteSqlTestLayer, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { UsageRecordSink, UsageRecordSinkDrizzle } from "@/chat/UsageRecordSink";

const sharedConnectionUri = pipe(Bun.env.BEEP_TEST_DATABASE_URL, (value) =>
  value !== undefined && value.length > 0 ? O.some(value) : O.none()
);
const migrationsFolder = fileURLToPath(new URL("../../../../packages/_internal/db-admin/drizzle", import.meta.url));
const shouldUseTestcontainers = Bun.env.BEEP_TEST_DATABASE_DRIVER === "pglite-testcontainers";
const shouldRunPgliteIntegration = O.isSome(sharedConnectionUri) || shouldUseTestcontainers;
const PgliteIntegrationTimeout = 300_000;

const decodeUsageAppend = S.decodeUnknownSync(TurnFinalizationUsageAppend);

const usageAppendInput = {
  activityId: 7,
  actor: { kind: "System", component: "Runtime" },
  costUsdApproxMicros: null,
  createdAt: 100,
  createdByPrincipal: { kind: "System", component: "Runtime" },
  credentialReference: null,
  entityType: "EpistemicUsageRecord",
  id: 1,
  inputTokens: 12,
  latencyMillis: null,
  metadata: { trace: "fixture" },
  model: "fixture-model",
  orgId: 1,
  outputTokens: 34,
  provider: "fixture",
  rowVersion: 1,
  schemaVersion: "0.0.0",
  source: "System",
  totalTokens: 46,
  unitCount: null,
  updatedAt: 101,
  updatedByPrincipal: { kind: "System", component: "Runtime" },
};

const makePgliteLayer = () =>
  pipe(
    sharedConnectionUri,
    O.match({
      onNone: () => Layer.fresh(makePgliteSqlTestLayer({ mode: "testcontainers" })),
      onSome: (connectionUri) => Layer.fresh(makePgliteSqlTestLayer({ external: { connectionUri }, mode: "external" })),
    })
  );

const migrateEpistemicUsage = Effect.fnUntraced(function* () {
  const info = yield* TestDatabaseInfo;
  const db = yield* makeDrizzle();
  const migrationsSchema = pipe(
    info.schema,
    O.getOrElse(() => "drizzle")
  );

  yield* migrate(db, { migrationsFolder, migrationsSchema });
});

const UsageRecordSinkLayer = UsageRecordSinkDrizzle.pipe(
  Layer.provideMerge(makeDrizzleLayer()),
  Layer.provideMerge(makePgliteLayer())
);

if (!shouldRunPgliteIntegration) {
  describe.skip("Professional desktop UsageRecordSink Drizzle PgLite integration", () => {});
} else {
  describe("Professional desktop UsageRecordSink Drizzle PgLite integration", { concurrent: false }, () => {
    layer(UsageRecordSinkLayer, { timeout: "5 minutes" })((it) => {
      it.effect(
        "persists a finalized turn UsageRecord through the Drizzle sink",
        Effect.fnUntraced(function* () {
          yield* migrateEpistemicUsage();
          const sink = yield* UsageRecordSink;
          const db = yield* makeDrizzle();

          const record = appendTurnFinalizationUsageRecord(decodeUsageAppend(usageAppendInput));
          yield* sink.append(record);

          const rows = yield* db.select().from(UsageRecordTable.Table);
          expect(rows).toHaveLength(1);
          const row = rows[0];
          expect(row?.provider).toBe("fixture");
          expect(row?.model).toBe("fixture-model");

          const decoded = UsageRecordTable.fromUsageRecordRow(rows[0]!);
          expect(decoded.provider).toBe("fixture");
          expect(decoded.activityId).toBe(7);
          expect(O.getOrNull(decoded.inputTokens)).toBe(12);
          expect(O.isNone(decoded.unitCount)).toBe(true);
        }),
        PgliteIntegrationTimeout
      );
    });
  });
}
