import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { fromWorkerRow, toWorkerInsert, workerTable } from "@beep/architecture-lab-tables/entities/Worker";
import { describe, expect, it } from "@effect/vitest";
import { getTableColumns, getTableName } from "drizzle-orm";

describe("Worker table", () => {
  it("projects the Worker entity through EntityTable", () => {
    const worker = DomainWorker.create(
      new DomainWorker.CreateWorkerInput({
        id: 1 as DomainWorker.WorkerId,
        organizationId: 1 as DomainWorker.WorkerOrganizationId,
        displayName: "Ada Lovelace",
      })
    );
    const row = toWorkerInsert(worker);
    const columns = getTableColumns(workerTable);

    expect(getTableName(workerTable)).toBe("architecture_lab_worker");
    expect(workerTable.definition).toBe(DomainWorker.Worker.definition);
    expect(columns.id.primary).toBe(true);
    expect(columns.displayName.name).toBe("display_name");
    expect(fromWorkerRow(row).displayName).toBe("Ada Lovelace");
  });
});
