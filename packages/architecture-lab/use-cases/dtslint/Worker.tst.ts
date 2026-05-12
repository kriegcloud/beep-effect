import { Worker } from "@beep/architecture-lab-use-cases/public";
import { expect } from "tstyche";

expect(
  new Worker.CreateWorkerCommand({
    id: 1 as never,
    organizationId: 1 as never,
    displayName: "Ada Lovelace",
  })
).type.toBe<Worker.CreateWorkerCommand>();
