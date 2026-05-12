import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import type * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import * as WorkPriority from "@beep/architecture-lab-domain/values/WorkPriority";
import { fromWorkItemRow, toWorkItemInsert, workItemTable } from "@beep/architecture-lab-tables/aggregates/WorkItem";
import { describe, expect, it } from "@effect/vitest";
import { getTableName } from "drizzle-orm";
import { Option as O } from "effect";

describe("WorkItem table", () => {
  it("projects the WorkItem aggregate into the architecture lab table", () => {
    const workerId = 1 as DomainWorker.WorkerId;
    const workItem = DomainWorkItem.create(
      new DomainWorkItem.CreateWorkItemInput({
        id: "work-item-1" as DomainWorkItem.WorkItemId,
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
  });
});
