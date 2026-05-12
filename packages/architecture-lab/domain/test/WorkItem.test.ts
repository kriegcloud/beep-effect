import * as WorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import type * as Worker from "@beep/architecture-lab-domain/entities/Worker";
import * as WorkPriority from "@beep/architecture-lab-domain/values/WorkPriority";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";

const workerId = 1 as Worker.WorkerId;

const makeWorkItem = () =>
  WorkItem.create(
    new WorkItem.CreateWorkItemInput({
      id: "work-item-1" as WorkItem.WorkItemId,
      title: "Document topology",
      priority: O.some(WorkPriority.WorkPriority.Enum.high),
    })
  );

describe("WorkItem aggregate", () => {
  it.effect("moves through assignment, completion, reopen, and archive", () =>
    Effect.gen(function* () {
      const assigned = yield* WorkItem.assign(makeWorkItem(), workerId);
      expect(assigned.status).toBe("assigned");
      expect(O.getOrThrow(assigned.assignee)).toBe(workerId);
      expect(O.getOrThrow(assigned.priority)).toBe("high");

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
