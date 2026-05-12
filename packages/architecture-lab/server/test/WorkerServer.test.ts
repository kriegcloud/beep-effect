import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { WorkerServer } from "@beep/architecture-lab-server/entities/Worker";
import { ArchitectureLabServerTest } from "@beep/architecture-lab-server/test";
import { Worker as WorkerUseCases } from "@beep/architecture-lab-use-cases/public";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const decodeWorkerId = S.decodeUnknownEffect(DomainWorker.WorkerId);
const decodeOrganizationId = S.decodeUnknownEffect(DomainWorker.WorkerOrganizationId);

describe("Worker server", () => {
  it.effect("provides a configured Worker use-case facade", () =>
    Effect.gen(function* () {
      const server = yield* WorkerServer;
      const id = yield* decodeWorkerId(1);
      const organizationId = yield* decodeOrganizationId(1);
      const worker = yield* server.create(
        new WorkerUseCases.CreateWorkerCommand({
          id,
          organizationId,
          displayName: "Ada Lovelace",
        })
      );

      expect(worker.status).toBe("active");
    }).pipe(Effect.provide(ArchitectureLabServerTest))
  );
});
