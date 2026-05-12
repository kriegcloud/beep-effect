import * as Worker from "@beep/architecture-lab-domain/entities/Worker";
import { describe, expect, it } from "@effect/vitest";

describe("Worker entity", () => {
  it("creates a BaseEntity-backed active Worker", () => {
    const worker = Worker.create(
      new Worker.CreateWorkerInput({
        id: 1 as Worker.WorkerId,
        organizationId: 1 as Worker.WorkerOrganizationId,
        displayName: "Ada Lovelace",
      })
    );

    expect(worker.id).toBe(1);
    expect(worker.status).toBe("active");
    expect(Worker.Worker.definition.tableName).toBe("architecture_lab_worker");
  });
});
