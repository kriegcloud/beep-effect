import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { WorkItemServer } from "@beep/architecture-lab-server/aggregates/WorkItem";
import { ArchitectureLabServerTest } from "@beep/architecture-lab-server/test";
import { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option as O } from "effect";
import * as S from "effect/Schema";

const decodeWorkItemId = S.decodeUnknownEffect(DomainWorkItem.WorkItemId);

describe("WorkItem server", () => {
  it.effect("provides a configured WorkItem use-case facade", () =>
    Effect.gen(function* () {
      const server = yield* WorkItemServer;
      const id = yield* decodeWorkItemId("work-item-1");
      const workItem = yield* server.create(
        new WorkItemUseCases.CreateWorkItemCommand({
          id,
          title: "Document topology",
        })
      );

      expect(workItem.status).toBe("open");
      expect(O.isNone(workItem.assignee)).toBe(true);
    }).pipe(Effect.provide(ArchitectureLabServerTest))
  );
});
