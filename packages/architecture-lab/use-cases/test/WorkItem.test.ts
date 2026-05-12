import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { WorkItem } from "@beep/architecture-lab-use-cases/public";
import * as WorkItemServer from "@beep/architecture-lab-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

const workItemId = "work-item-1" as DomainWorkItem.WorkItemId;

const makeRepository = (): WorkItemServer.WorkItem.WorkItemRepositoryShape => {
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
      const useCases = WorkItemServer.WorkItem.makeWorkItemUseCases(makeRepository());
      const error = yield* useCases
        .get(
          new WorkItem.GetWorkItemQuery({
            id: "missing" as DomainWorkItem.WorkItemId,
          })
        )
        .pipe(Effect.flip);

      expect(error._tag).toBe("WorkItemNotFound");
    })
  );

  it.effect("keeps archive terminal at the use-case boundary", () =>
    Effect.gen(function* () {
      const useCases = WorkItemServer.WorkItem.makeWorkItemUseCases(makeRepository());
      yield* useCases.archive(new WorkItem.ArchiveWorkItemCommand({ id: workItemId }));

      const error = yield* useCases.reopen(new WorkItem.ReopenWorkItemCommand({ id: workItemId })).pipe(Effect.flip);
      expect(error._tag).toBe("WorkItemActionRejected");
    })
  );
});
