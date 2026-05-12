import * as WorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { expect } from "tstyche";

const workItem = WorkItem.create(
  new WorkItem.CreateWorkItemInput({
    id: "work-item-1" as WorkItem.WorkItemId,
    title: "Document topology",
  })
);

expect(workItem.status).type.toBe<WorkItem.WorkItemStatus>();
expect(workItem).type.toBe<WorkItem.WorkItem>();
