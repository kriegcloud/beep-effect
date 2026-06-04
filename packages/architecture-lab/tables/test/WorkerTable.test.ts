import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { fromWorkerRow, toWorkerInsert, workerTable } from "@beep/architecture-lab-tables/entities/Worker";
import { describe, expect, it } from "@effect/vitest";
import { getColumns, getTableName } from "drizzle-orm";
import { Effect } from "effect";
import * as S from "effect/Schema";

const decodeWorkerId = S.decodeUnknownEffect(DomainWorker.WorkerId);
const decodeOrganizationId = S.decodeUnknownEffect(DomainWorker.WorkerOrganizationId);

describe("Worker table", () => {
  it.effect(
    "projects the Worker entity through EntityTable",
    Effect.fnUntraced(function* () {
      const id = yield* decodeWorkerId(1);
      const organizationId = yield* decodeOrganizationId(1);
      const worker = DomainWorker.create(
        DomainWorker.CreateWorkerInput.make({
          id,
          organizationId,
          displayName: "Ada Lovelace",
        })
      );
      const row = toWorkerInsert(worker);
      const columns = getColumns(workerTable);

      expect(getTableName(workerTable)).toBe("architecture_lab_worker");
      expect(workerTable.definition).toBe(DomainWorker.Worker.definition);
      expect(columns.id.primary).toBe(true);
      expect(columns.displayName.name).toBe("display_name");
      expect(fromWorkerRow({ ...row, id }).displayName).toBe("Ada Lovelace");
    })
  );
});
