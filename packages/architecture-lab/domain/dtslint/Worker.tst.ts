import * as Worker from "@beep/architecture-lab-domain/entities/Worker";
import { expect } from "tstyche";

declare const workerId: Worker.WorkerId;
declare const organizationId: Worker.WorkerOrganizationId;

const worker = Worker.create(
  new Worker.CreateWorkerInput({
    id: workerId,
    organizationId,
    displayName: "Ada Lovelace",
  })
);

expect(worker.status).type.toBe<Worker.WorkerStatus>();
expect(worker).type.toBe<Worker.Worker>();
