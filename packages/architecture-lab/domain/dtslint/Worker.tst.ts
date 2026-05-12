import * as Worker from "@beep/architecture-lab-domain/entities/Worker";
import { expect } from "tstyche";

const worker = Worker.create(
  new Worker.CreateWorkerInput({
    id: 1 as Worker.WorkerId,
    organizationId: 1 as Worker.WorkerOrganizationId,
    displayName: "Ada Lovelace",
  })
);

expect(worker.status).type.toBe<Worker.WorkerStatus>();
expect(worker).type.toBe<Worker.Worker>();
