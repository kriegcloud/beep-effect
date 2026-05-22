import * as WorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import * as Worker from "@beep/architecture-lab-domain/entities/Worker";
import * as WorkPriority from "@beep/architecture-lab-domain/values/WorkPriority";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeWorkItemId = S.decodeUnknownEffect(WorkItem.WorkItemId);
const decodeWorkerId = S.decodeUnknownEffect(Worker.WorkerId);

const makeWorkItem = (id: WorkItem.WorkItemId) =>
  WorkItem.create(
    WorkItem.CreateWorkItemInput.make({
      id,
      title: "Document topology",
      priority: O.some(WorkPriority.WorkPriority.Enum.high),
    })
  );

describe("WorkItem aggregate", () => {
  it.effect(
    "moves through assignment, completion, reopen, and archive",
    Effect.fnUntraced(function* () {
      const workerId = yield* decodeWorkerId(1);
      const workItemId = yield* decodeWorkItemId("work-item-1");
      const assigned = yield* WorkItem.assign(makeWorkItem(workItemId), workerId);
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

  it.effect(
    "rejects reopening an archived WorkItem",
    Effect.fnUntraced(function* () {
      const workItemId = yield* decodeWorkItemId("work-item-1");
      const archived = yield* WorkItem.archive(makeWorkItem(workItemId));
      const exit = yield* WorkItem.reopen(archived).pipe(Effect.exit);
      expect(exit._tag).toBe("Failure");
    })
  );
});
