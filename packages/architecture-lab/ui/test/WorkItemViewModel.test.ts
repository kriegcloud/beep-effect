import { defaultWorkItemPublicConfig } from "@beep/architecture-lab-config/public";
import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { toWorkItemSummaryViewModel } from "@beep/architecture-lab-ui/aggregates/WorkItem";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const decodeWorkItemId = S.decodeUnknownEffect(DomainWorkItem.WorkItemId);

describe("WorkItem UI view model", () => {
  it.effect(
    "derives status labels from the canonical status value",
    Effect.fnUntraced(function* () {
      const id = yield* decodeWorkItemId("work-item-1");
      const workItem = DomainWorkItem.create(
        new DomainWorkItem.CreateWorkItemInput({
          id,
          title: "Document topology",
        })
      );

      expect(toWorkItemSummaryViewModel(workItem, defaultWorkItemPublicConfig).statusLabel).toBe("OPEN");
    })
  );

  it.effect(
    "exposes archive as terminal",
    Effect.fnUntraced(function* () {
      const id = yield* decodeWorkItemId("work-item-1");
      const workItem = DomainWorkItem.create(
        new DomainWorkItem.CreateWorkItemInput({
          id,
          title: "Document topology",
        })
      );
      const archived = new DomainWorkItem.WorkItem({
        ...workItem,
        status: "archived",
      });

      expect(toWorkItemSummaryViewModel(archived, defaultWorkItemPublicConfig).visibleActions).toEqual([]);
    })
  );
});
