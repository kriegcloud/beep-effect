import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { fromWorkItemRow, toWorkItemInsert, workItemTable } from "@beep/architecture-lab-tables/aggregates/WorkItem";
import { describe, expect, it } from "@effect/vitest";
import { getTableName } from "drizzle-orm";
import { Option as O } from "effect";

describe("WorkItem table", () => {
  it("projects the WorkItem aggregate into the architecture lab table", () => {
    const workItem = DomainWorkItem.create(
      new DomainWorkItem.CreateWorkItemInput({
        id: "work-item-1" as DomainWorkItem.WorkItemId,
        title: "Document topology",
      })
    );

    const row = toWorkItemInsert(workItem);

    expect(getTableName(workItemTable)).toBe("architecture_lab_work_item");
    expect(
      fromWorkItemRow({
        ...row,
        assignee: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      }).assignee
    ).toStrictEqual(O.none());
  });
});
