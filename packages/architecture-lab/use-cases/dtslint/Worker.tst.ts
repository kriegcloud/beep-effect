import type * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { Worker } from "@beep/architecture-lab-use-cases/public";
import { expect } from "tstyche";

declare const workerId: DomainWorker.WorkerId;
declare const organizationId: DomainWorker.WorkerOrganizationId;

expect(
  new Worker.CreateWorkerCommand({
    id: workerId,
    organizationId,
    displayName: "Ada Lovelace",
  })
).type.toBe<Worker.CreateWorkerCommand>();

expect<"WorkerRepository">().type.not.toBeAssignableTo<keyof typeof Worker>();
expect<"makeWorkerUseCases">().type.not.toBeAssignableTo<keyof typeof Worker>();
expect<"toWorkerActionError">().type.not.toBeAssignableTo<keyof typeof Worker>();
