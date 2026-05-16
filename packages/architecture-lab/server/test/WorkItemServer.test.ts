import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { makeWorkItemHttpHandlers, WorkItemServer } from "@beep/architecture-lab-server/aggregates/WorkItem";
import { ArchitectureLabServerTest } from "@beep/architecture-lab-server/test";
import { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Option as O } from "effect";
import * as S from "effect/Schema";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const decodeWorkItemId = S.decodeUnknownEffect(DomainWorkItem.WorkItemId);

describe("WorkItem server", () => {
  it.effect("redacts unavailable details from HTTP failure bodies", () =>
    Effect.gen(function* () {
      const id = yield* decodeWorkItemId("work-item-1");
      const unavailable = new WorkItemUseCases.WorkItemActionFailed({
        reason: "select WorkItem failed against architecture_lab_work_item",
      });
      const failUnavailable = () => Effect.fail(unavailable);
      const handlers = makeWorkItemHttpHandlers({
        archive: failUnavailable,
        assign: failUnavailable,
        complete: failUnavailable,
        create: failUnavailable,
        get: failUnavailable,
        list: failUnavailable,
        reopen: failUnavailable,
      });

      const response = yield* handlers.get(new WorkItemUseCases.GetWorkItemQuery({ id }));
      const body = response.body as WorkItemUseCases.WorkItemActionFailed;

      expect(response.status).toBe(503);
      expect(body._tag).toBe("WorkItemActionFailed");
      expect(body.reason).toBe(WorkItemUseCases.WORK_ITEM_ACTION_UNAVAILABLE_REASON);
      expect(body.reason).not.toContain("architecture_lab_work_item");
    })
  );

  it.effect("provides a configured WorkItem use-case facade", () =>
    Effect.gen(function* () {
      const server = yield* WorkItemServer;
      const id = yield* decodeWorkItemId("work-item-1");
      const workItem = yield* server.create(
        new WorkItemUseCases.CreateWorkItemCommand({
          id,
          title: "Document topology",
        })
      );

      expect(workItem.status).toBe("open");
      expect(O.isNone(workItem.assignee)).toBe(true);
    }).pipe(provideScopedLayer(ArchitectureLabServerTest))
  );
});
