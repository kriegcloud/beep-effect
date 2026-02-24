import { type GraphitiFetch, GraphitiService } from "@beep/web/lib/graphiti/client";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Match } from "effect";

const toSse = (payload: unknown): string => `event: message\ndata: ${JSON.stringify(payload)}\n\n`;

const initializeResponse =
  '{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{},"serverInfo":{"name":"graphiti","version":"1.0.0"}}}';

describe("GraphitiService", () => {
  it.effect("searchNodes performs MCP handshake and decodes node results", () =>
    Effect.gen(function* () {
      let callCount = 0;

      const fetchMock: GraphitiFetch = async () => {
        callCount += 1;

        return Match.value(callCount).pipe(
          Match.when(
            1,
            () =>
              new Response(initializeResponse, {
                status: 200,
                headers: {
                  "mcp-session-id": "session-1",
                },
              })
          ),
          Match.when(2, () => new Response("", { status: 200 })),
          Match.orElse(
            () =>
              new Response(
                toSse({
                  jsonrpc: "2.0",
                  id: 2,
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify({
                          message: "Nodes retrieved successfully",
                          nodes: [
                            {
                              uuid: "node-1",
                              name: "effect/ServiceMap",
                              labels: ["Entity", "Location"],
                              created_at: "2026-02-23T14:00:00.000Z",
                              summary: "ServiceMap module",
                              group_id: "effect-v4",
                              attributes: {},
                            },
                          ],
                        }),
                      },
                    ],
                    structuredContent: {
                      result: {
                        message: "Nodes retrieved successfully",
                        nodes: [
                          {
                            uuid: "node-1",
                            name: "effect/ServiceMap",
                            labels: ["Entity", "Location"],
                            created_at: "2026-02-23T14:00:00.000Z",
                            summary: "ServiceMap module",
                            group_id: "effect-v4",
                            attributes: {},
                          },
                        ],
                      },
                    },
                    isError: false,
                  },
                }),
                {
                  status: 200,
                  headers: {
                    "content-type": "text/event-stream",
                  },
                }
              )
          )
        );
      };

      const nodes = yield* Effect.gen(function* () {
        const graphiti = yield* GraphitiService;
        return yield* graphiti.searchNodes({
          query: "ServiceMap",
          maxNodes: 1,
        });
      }).pipe(
        Effect.provide(
          GraphitiService.layerWith({
            apiUrl: "https://graphiti.test/mcp",
            apiKey: "test-key",
            groupId: "effect-v4",
            fetch: fetchMock,
          })
        )
      );

      expect(callCount).toBe(3);
      expect(nodes).toHaveLength(1);
      expect(nodes[0]?.uuid).toBe("node-1");
      expect(nodes[0]?.name).toBe("effect/ServiceMap");
      expect(nodes[0]?.groupId).toBe("effect-v4");
    })
  );

  it.effect("searchFacts fails with GraphitiToolError when tool payload includes error", () =>
    Effect.gen(function* () {
      let callCount = 0;

      const fetchMock: GraphitiFetch = async () => {
        callCount += 1;

        return Match.value(callCount).pipe(
          Match.when(
            1,
            () =>
              new Response(initializeResponse, {
                status: 200,
                headers: {
                  "mcp-session-id": "session-2",
                },
              })
          ),
          Match.when(2, () => new Response("", { status: 200 })),
          Match.orElse(
            () =>
              new Response(
                toSse({
                  jsonrpc: "2.0",
                  id: 2,
                  result: {
                    content: [
                      {
                        type: "text",
                        text: JSON.stringify({
                          error: "Graphiti backend unavailable",
                        }),
                      },
                    ],
                    structuredContent: {
                      result: {
                        error: "Graphiti backend unavailable",
                      },
                    },
                    isError: false,
                  },
                }),
                {
                  status: 200,
                  headers: {
                    "content-type": "text/event-stream",
                  },
                }
              )
          )
        );
      };

      const failure = yield* Effect.gen(function* () {
        const graphiti = yield* GraphitiService;
        return yield* graphiti.searchFacts({
          query: "ServiceMap",
          maxFacts: 2,
        });
      }).pipe(
        Effect.provide(
          GraphitiService.layerWith({
            apiUrl: "https://graphiti.test/mcp",
            apiKey: "test-key",
            groupId: "effect-v4",
            fetch: fetchMock,
          })
        ),
        Effect.flip
      );

      expect(callCount).toBe(3);
      expect(failure._tag).toBe("GraphitiToolError");
    })
  );
});
