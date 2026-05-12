import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import * as WorkPriority from "@beep/architecture-lab-domain/values/WorkPriority";
import { fromWorkItemRow, toWorkItemInsert, workItemTable } from "@beep/architecture-lab-tables/aggregates/WorkItem";
import { describe, expect, it } from "@effect/vitest";
import { getTableName } from "drizzle-orm";
import { Effect, Option as O } from "effect";
import * as S from "effect/Schema";

const decodeWorkItemId = S.decodeUnknownEffect(DomainWorkItem.WorkItemId);
const decodeWorkerId = S.decodeUnknownEffect(DomainWorker.WorkerId);

describe("WorkItem table", () => {
  it.effect("projects the WorkItem aggregate into the architecture lab table", () =>
    Effect.gen(function* () {
      const workerId = yield* decodeWorkerId(1);
      const id = yield* decodeWorkItemId("work-item-1");
      const workItem = DomainWorkItem.create(
        new DomainWorkItem.CreateWorkItemInput({
          id,
          title: "Document topology",
          priority: O.some(WorkPriority.WorkPriority.Enum.high),
        })
      );

      const row = toWorkItemInsert(new DomainWorkItem.WorkItem({ ...workItem, assignee: O.some(workerId) }));

      expect(getTableName(workItemTable)).toBe("architecture_lab_work_item");
      expect(row.assigneeId).toBe(workerId);
      expect(row.priority).toBe("high");
      expect(O.getOrThrow(fromWorkItemRow({ ...row, createdAt: new Date(0), updatedAt: new Date(0) }).assignee)).toBe(
        workerId
      );
    })
  );
});
