import type * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { WorkerServer } from "@beep/architecture-lab-server/entities/Worker";
import { ArchitectureLabServerTest } from "@beep/architecture-lab-server/test";
import { Worker as WorkerUseCases } from "@beep/architecture-lab-use-cases/public";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("Worker server", () => {
  it.effect("provides a configured Worker use-case facade", () =>
    Effect.gen(function* () {
      const server = yield* WorkerServer;
      const worker = yield* server.create(
        new WorkerUseCases.CreateWorkerCommand({
          id: 1 as DomainWorker.WorkerId,
          organizationId: 1 as DomainWorker.WorkerOrganizationId,
          displayName: "Ada Lovelace",
        })
      );

      expect(worker.status).toBe("active");
    }).pipe(Effect.provide(ArchitectureLabServerTest))
  );
});
