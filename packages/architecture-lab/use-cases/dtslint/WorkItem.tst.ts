import { WorkItem } from "@beep/architecture-lab-use-cases/public";
import { expect } from "tstyche";
import type * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";

declare const workItemId: DomainWorkItem.WorkItemId;

expect(
  WorkItem.CreateWorkItemCommand.make({
    id: workItemId,
    title: "Document topology",
  })
).type.toBe<WorkItem.CreateWorkItemCommand>();

expect<"WorkItemRepository">().type.not.toBeAssignableTo<keyof typeof WorkItem>();
expect<"makeWorkItemUseCases">().type.not.toBeAssignableTo<keyof typeof WorkItem>();
expect<"toWorkItemActionError">().type.not.toBeAssignableTo<keyof typeof WorkItem>();
