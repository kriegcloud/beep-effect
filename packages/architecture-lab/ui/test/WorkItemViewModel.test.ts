import { defaultWorkItemPublicConfig } from "@beep/architecture-lab-config/public";
import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { toWorkItemSummaryViewModel } from "@beep/architecture-lab-ui/aggregates/WorkItem";
import { describe, expect, it } from "@effect/vitest";

describe("WorkItem UI view model", () => {
  it("derives status labels from the canonical status value", () => {
    const workItem = DomainWorkItem.create(
      new DomainWorkItem.CreateWorkItemInput({
        id: "work-item-1" as DomainWorkItem.WorkItemId,
        title: "Document topology",
      })
    );

    expect(toWorkItemSummaryViewModel(workItem, defaultWorkItemPublicConfig).statusLabel).toBe("OPEN");
  });

  it("exposes archive as terminal", () => {
    const workItem = DomainWorkItem.create(
      new DomainWorkItem.CreateWorkItemInput({
        id: "work-item-1" as DomainWorkItem.WorkItemId,
        title: "Document topology",
      })
    );
    const archived = new DomainWorkItem.WorkItem({ ...workItem, status: "archived" });

    expect(toWorkItemSummaryViewModel(archived, defaultWorkItemPublicConfig).visibleActions).toEqual([]);
  });
});
