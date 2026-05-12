import * as WorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import * as WorkPriority from "@beep/architecture-lab-domain/values/WorkPriority";
import * as O from "effect/Option";
import { expect } from "tstyche";

declare const workItemId: WorkItem.WorkItemId;

const workItem = WorkItem.create(
  new WorkItem.CreateWorkItemInput({
    id: workItemId,
    title: "Document topology",
    priority: O.some(WorkPriority.WorkPriority.Enum.normal),
  })
);

expect(workItem.status).type.toBe<WorkItem.WorkItemStatus>();
expect(workItem).type.toBe<WorkItem.WorkItem>();
