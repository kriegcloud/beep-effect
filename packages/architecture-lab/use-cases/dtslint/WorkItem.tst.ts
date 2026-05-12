import { WorkItem } from "@beep/architecture-lab-use-cases/public";
import { expect } from "tstyche";

expect(
  new WorkItem.CreateWorkItemCommand({
    id: "work-item-1" as never,
    title: "Document topology",
  })
).type.toBe<WorkItem.CreateWorkItemCommand>();
