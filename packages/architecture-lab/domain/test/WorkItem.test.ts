import * as WorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

const makeWorkItem = () =>
  WorkItem.create(
    new WorkItem.CreateWorkItemInput({
      id: "work-item-1" as WorkItem.WorkItemId,
      title: "Document topology",
    })
  );

describe("WorkItem aggregate", () => {
  it.effect("moves through assignment, completion, reopen, and archive", () =>
    Effect.gen(function* () {
      const assigned = yield* WorkItem.assign(makeWorkItem(), "ada");
      expect(assigned.status).toBe("assigned");

      const completed = yield* WorkItem.complete(assigned);
      expect(completed.status).toBe("completed");

      const reopened = yield* WorkItem.reopen(completed);
      expect(reopened.status).toBe("open");

      const archived = yield* WorkItem.archive(reopened);
      expect(archived.status).toBe("archived");
    })
  );

  it.effect("rejects reopening an archived WorkItem", () =>
    Effect.gen(function* () {
      const archived = yield* WorkItem.archive(makeWorkItem());
      const exit = yield* WorkItem.reopen(archived).pipe(Effect.exit);
      expect(exit._tag).toBe("Failure");
    })
  );
});
