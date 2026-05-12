import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { WorkItem } from "@beep/architecture-lab-use-cases/public";
import * as WorkItemServer from "@beep/architecture-lab-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const decodeWorkItemId = S.decodeUnknownEffect(DomainWorkItem.WorkItemId);

const makeRepository = (workItemId: DomainWorkItem.WorkItemId): WorkItemServer.WorkItem.WorkItemRepositoryShape => {
  const initial = DomainWorkItem.create(
    new DomainWorkItem.CreateWorkItemInput({
      id: workItemId,
      title: "Document topology",
    })
  );
  let current = initial;
  return {
    create: (workItem) => Effect.succeed(workItem),
    save: (workItem) =>
      workItem.id === current.id
        ? Effect.sync(() => {
            current = workItem;
            return workItem;
          })
        : Effect.fail(new WorkItemServer.WorkItem.WorkItemRepositoryNotFound({ workItemId: workItem.id })),
    get: (id) =>
      id === current.id
        ? Effect.succeed(current)
        : Effect.fail(new WorkItemServer.WorkItem.WorkItemRepositoryNotFound({ workItemId: id })),
    list: () => Effect.succeed([current]),
  };
};

describe("WorkItem use-cases", () => {
  it.effect("translates repository not-found failures to public failures", () =>
    Effect.gen(function* () {
      const workItemId = yield* decodeWorkItemId("work-item-1");
      const missingWorkItemId = yield* decodeWorkItemId("missing");
      const useCases = WorkItemServer.WorkItem.makeWorkItemUseCases(makeRepository(workItemId));
      const error = yield* useCases
        .get(
          new WorkItem.GetWorkItemQuery({
            id: missingWorkItemId,
          })
        )
        .pipe(Effect.flip);

      expect(error._tag).toBe("WorkItemNotFound");
    })
  );

  it.effect("keeps archive terminal at the use-case boundary", () =>
    Effect.gen(function* () {
      const workItemId = yield* decodeWorkItemId("work-item-1");
      const useCases = WorkItemServer.WorkItem.makeWorkItemUseCases(makeRepository(workItemId));
      yield* useCases.archive(new WorkItem.ArchiveWorkItemCommand({ id: workItemId }));

      const error = yield* useCases.reopen(new WorkItem.ReopenWorkItemCommand({ id: workItemId })).pipe(Effect.flip);
      expect(error._tag).toBe("WorkItemActionRejected");
    })
  );
});
