import { KnowledgeGraphToolsLayer } from "@beep/web/lib/effect/tool-handlers";
import { KnowledgeGraphToolkit } from "@beep/web/lib/effect/tools";
import { GraphitiService } from "@beep/web/lib/graphiti/client";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

const graphitiMock = GraphitiService.of({
  searchNodes: () =>
    Effect.succeed([
      {
        uuid: "node-1",
        name: "effect/ServiceMap",
        labels: ["Entity", "Location"],
        createdAt: "2026-02-23T14:00:00.000Z",
        summary: "ServiceMap module",
        groupId: "effect-v4",
        attributes: {},
      },
      {
        uuid: "node-2",
        name: "effect/Layer",
        labels: ["Entity", "Location"],
        createdAt: "2026-02-23T14:01:00.000Z",
        summary: "Layer module",
        groupId: "effect-v4",
        attributes: {},
      },
    ]),
  searchFacts: () =>
    Effect.succeed([
      {
        uuid: "fact-1",
        groupId: "effect-v4",
        sourceNodeUuid: "node-1",
        targetNodeUuid: "node-2",
        name: "DEPENDS_ON",
        fact: "ServiceMap usage depends on Layer composition",
        createdAt: "2026-02-23T14:02:00.000Z",
        attributes: {},
      },
    ]),
  getNode: () =>
    Effect.succeed({
      node: O.some({
        uuid: "node-1",
        name: "effect/ServiceMap",
        labels: ["Entity", "Location"],
        createdAt: "2026-02-23T14:00:00.000Z",
        summary: "ServiceMap module",
        groupId: "effect-v4",
        attributes: {},
      }),
      neighbors: [
        {
          uuid: "node-2",
          name: "effect/Layer",
          labels: ["Entity", "Location"],
          createdAt: "2026-02-23T14:01:00.000Z",
          summary: "Layer module",
          groupId: "effect-v4",
          attributes: {},
        },
      ],
      facts: [
        {
          uuid: "fact-1",
          groupId: "effect-v4",
          sourceNodeUuid: "node-1",
          targetNodeUuid: "node-2",
          name: "DEPENDS_ON",
          fact: "ServiceMap usage depends on Layer composition",
          createdAt: "2026-02-23T14:02:00.000Z",
          attributes: {},
        },
      ],
    }),
});

describe("KnowledgeGraphToolkit", () => {
  it.effect("executes SearchGraph handler and maps nodes/links", () =>
    Effect.gen(function* () {
      const events = yield* Effect.gen(function* () {
        const toolkit = yield* KnowledgeGraphToolkit;
        const stream = yield* toolkit.handle("SearchGraph", {
          query: "ServiceMap",
          scope: "both",
          limit: 20,
        });

        return yield* Stream.runCollect(stream);
      }).pipe(Effect.provide(KnowledgeGraphToolsLayer), Effect.provideService(GraphitiService, graphitiMock));

      const lastEvent = O.getOrUndefined(A.last(events));

      expect(lastEvent).toBeDefined();
      expect(lastEvent?.isFailure).toBe(false);
      expect(lastEvent?.result.nodes).toHaveLength(2);
      expect(lastEvent?.result.links).toHaveLength(1);
      expect(lastEvent?.result.links[0]?.source).toBe("node-1");
      expect(lastEvent?.result.links[0]?.target).toBe("node-2");
    })
  );

  it.effect("executes GetNode handler and returns node details + neighbors", () =>
    Effect.gen(function* () {
      const events = yield* Effect.gen(function* () {
        const toolkit = yield* KnowledgeGraphToolkit;
        const stream = yield* toolkit.handle("GetNode", {
          nodeId: "node-1",
        });

        return yield* Stream.runCollect(stream);
      }).pipe(Effect.provide(KnowledgeGraphToolsLayer), Effect.provideService(GraphitiService, graphitiMock));

      const lastEvent = O.getOrUndefined(A.last(events));

      expect(lastEvent).toBeDefined();
      expect(lastEvent?.isFailure).toBe(false);
      expect(lastEvent?.result.node?.id).toBe("node-1");
      expect(lastEvent?.result.neighbors).toHaveLength(1);
      expect(lastEvent?.result.links).toHaveLength(1);
      expect(lastEvent?.result.facts).toHaveLength(1);
    })
  );
});
