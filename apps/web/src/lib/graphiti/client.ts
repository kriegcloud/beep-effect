import { $WebId } from "@beep/identity/packages";
import {
  type GraphitiEntityNode,
  GraphitiEntityNodeSchema,
  type GraphitiFact,
  GraphitiFactSchema,
} from "@beep/web/lib/effect/mappers";
import { Effect, Layer, Match, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as S from "effect/Schema";
import * as String from "effect/String";

const $GraphitiId = $WebId.create("lib/graphiti/client");
const $GraphitiSchemaId = $GraphitiId.create("schema");
const $GraphitiErrorsId = $GraphitiId.create("errors");

const DefaultGraphitiApiUrl = "https://auth-proxy-production-91fe.up.railway.app/mcp";
const DefaultGraphitiGroupId = "effect-v4";

export type GraphitiFetch = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>;

export const GraphitiRuntimeConfigSchema = S.Struct({
  apiUrl: S.NonEmptyString,
  apiKey: S.String,
  groupId: S.NonEmptyString,
}).annotate(
  $GraphitiSchemaId.annotate("GraphitiRuntimeConfigSchema", {
    title: "Graphiti Runtime Config",
    description: "Runtime configuration for Graphiti MCP HTTP calls.",
  })
);

export type GraphitiRuntimeConfig = typeof GraphitiRuntimeConfigSchema.Type;

export const GraphitiSearchNodesParamsSchema = S.Struct({
  query: S.NonEmptyString,
  maxNodes: S.optionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).pipe(S.withDecodingDefault(() => 20)),
  groupIds: S.optionalKey(S.Array(S.NonEmptyString)).pipe(S.withDecodingDefault(() => [])),
  entityTypes: S.optionalKey(S.Array(S.NonEmptyString)).pipe(S.withDecodingDefault(() => [])),
}).annotate(
  $GraphitiSchemaId.annotate("GraphitiSearchNodesParamsSchema", {
    title: "Graphiti Search Nodes Params",
    description: "Input for Graphiti search_nodes tool calls.",
  })
);

export type GraphitiSearchNodesParams = typeof GraphitiSearchNodesParamsSchema.Type;

export const GraphitiSearchFactsParamsSchema = S.Struct({
  query: S.NonEmptyString,
  maxFacts: S.optionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).pipe(S.withDecodingDefault(() => 20)),
  groupIds: S.optionalKey(S.Array(S.NonEmptyString)).pipe(S.withDecodingDefault(() => [])),
  centerNodeUuid: S.optionalKey(S.NonEmptyString),
}).annotate(
  $GraphitiSchemaId.annotate("GraphitiSearchFactsParamsSchema", {
    title: "Graphiti Search Facts Params",
    description: "Input for Graphiti search_memory_facts tool calls.",
  })
);

export type GraphitiSearchFactsParams = typeof GraphitiSearchFactsParamsSchema.Type;

export const GraphitiGetNodeParamsSchema = S.Struct({
  nodeId: S.NonEmptyString,
  maxFacts: S.optionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).pipe(S.withDecodingDefault(() => 20)),
  maxNeighbors: S.optionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).pipe(S.withDecodingDefault(() => 20)),
  groupIds: S.optionalKey(S.Array(S.NonEmptyString)).pipe(S.withDecodingDefault(() => [])),
}).annotate(
  $GraphitiSchemaId.annotate("GraphitiGetNodeParamsSchema", {
    title: "Graphiti Get Node Params",
    description: "Input for node lookups backed by Graphiti search tools.",
  })
);

export type GraphitiGetNodeParams = typeof GraphitiGetNodeParamsSchema.Type;

export class GraphitiRequestError extends S.TaggedErrorClass<GraphitiRequestError>(
  $GraphitiErrorsId`GraphitiRequestError`
)(
  "GraphitiRequestError",
  {
    message: S.String,
  },
  {
    title: "Graphiti Request Error",
    description: "Graphiti HTTP request failed before a valid response was received.",
  }
) {}

export class GraphitiHttpStatusError extends S.TaggedErrorClass<GraphitiHttpStatusError>(
  $GraphitiErrorsId`GraphitiHttpStatusError`
)(
  "GraphitiHttpStatusError",
  {
    status: S.Int,
    body: S.String,
  },
  {
    title: "Graphiti HTTP Status Error",
    description: "Graphiti returned a non-success HTTP status.",
  }
) {}

export class GraphitiProtocolError extends S.TaggedErrorClass<GraphitiProtocolError>(
  $GraphitiErrorsId`GraphitiProtocolError`
)(
  "GraphitiProtocolError",
  {
    message: S.String,
  },
  {
    title: "Graphiti Protocol Error",
    description: "Graphiti response did not match the expected MCP protocol shape.",
  }
) {}

export class GraphitiToolError extends S.TaggedErrorClass<GraphitiToolError>($GraphitiErrorsId`GraphitiToolError`)(
  "GraphitiToolError",
  {
    toolName: S.NonEmptyString,
    message: S.String,
  },
  {
    title: "Graphiti Tool Error",
    description: "Graphiti returned a tool-level error payload.",
  }
) {}

export class GraphitiResponseDecodeError extends S.TaggedErrorClass<GraphitiResponseDecodeError>(
  $GraphitiErrorsId`GraphitiResponseDecodeError`
)(
  "GraphitiResponseDecodeError",
  {
    message: S.String,
  },
  {
    title: "Graphiti Response Decode Error",
    description: "Graphiti payload could not be decoded with the expected schema.",
  }
) {}

export type GraphitiServiceError =
  | GraphitiRequestError
  | GraphitiHttpStatusError
  | GraphitiProtocolError
  | GraphitiToolError
  | GraphitiResponseDecodeError;

export interface GraphitiNodeLookup {
  readonly node: Option.Option<GraphitiEntityNode>;
  readonly neighbors: ReadonlyArray<GraphitiEntityNode>;
  readonly facts: ReadonlyArray<GraphitiFact>;
}

const RawGraphitiNodeSchema = S.Struct({
  uuid: S.NonEmptyString,
  name: S.NonEmptyString,
  labels: S.Array(S.String),
  created_at: S.NullOr(S.String),
  summary: S.NullOr(S.String),
  group_id: S.NonEmptyString,
  attributes: S.Record(S.String, S.Unknown),
}).annotate(
  $GraphitiSchemaId.annotate("RawGraphitiNodeSchema", {
    title: "Raw Graphiti Node",
    description: "Raw search_nodes node payload returned by Graphiti.",
  })
);

type RawGraphitiNode = typeof RawGraphitiNodeSchema.Type;

const RawGraphitiFactSchema = S.Struct({
  uuid: S.NonEmptyString,
  group_id: S.NonEmptyString,
  source_node_uuid: S.NonEmptyString,
  target_node_uuid: S.NonEmptyString,
  name: S.NonEmptyString,
  fact: S.String,
  created_at: S.NullOr(S.String),
  attributes: S.Record(S.String, S.Unknown),
}).annotate(
  $GraphitiSchemaId.annotate("RawGraphitiFactSchema", {
    title: "Raw Graphiti Fact",
    description: "Raw search_memory_facts relationship payload returned by Graphiti.",
  })
);

type RawGraphitiFact = typeof RawGraphitiFactSchema.Type;

const RawNodeSearchResultSchema = S.Struct({
  message: S.String,
  nodes: S.Array(RawGraphitiNodeSchema),
}).annotate(
  $GraphitiSchemaId.annotate("RawNodeSearchResultSchema", {
    title: "Raw Node Search Result",
    description: "Decoded structuredContent result for Graphiti search_nodes.",
  })
);

const RawFactSearchResultSchema = S.Struct({
  message: S.String,
  facts: S.Array(RawGraphitiFactSchema),
}).annotate(
  $GraphitiSchemaId.annotate("RawFactSearchResultSchema", {
    title: "Raw Fact Search Result",
    description: "Decoded structuredContent result for Graphiti search_memory_facts.",
  })
);

const GraphitiToolResponseErrorSchema = S.Struct({
  error: S.String,
}).annotate(
  $GraphitiSchemaId.annotate("GraphitiToolResponseErrorSchema", {
    title: "Graphiti Tool Response Error",
    description: "Error payload returned in Graphiti tool results.",
  })
);

const McpToolTextContentSchema = S.Struct({
  type: S.String,
  text: S.optionalKey(S.String),
}).annotate(
  $GraphitiSchemaId.annotate("McpToolTextContentSchema", {
    title: "MCP Tool Text Content",
    description: "Text content item contained in Graphiti MCP tool responses.",
  })
);

const McpStructuredContentSchema = S.Struct({
  result: S.Unknown,
}).annotate(
  $GraphitiSchemaId.annotate("McpStructuredContentSchema", {
    title: "MCP Structured Content",
    description: "Structured content wrapper in Graphiti MCP tool responses.",
  })
);

const McpToolCallResultSchema = S.Struct({
  content: S.Array(McpToolTextContentSchema),
  structuredContent: S.optionalKey(McpStructuredContentSchema),
  isError: S.optionalKey(S.Boolean),
}).annotate(
  $GraphitiSchemaId.annotate("McpToolCallResultSchema", {
    title: "MCP Tool Call Result",
    description: "Successful Graphiti MCP tools/call result envelope.",
  })
);

const McpErrorSchema = S.Struct({
  message: S.String,
}).annotate(
  $GraphitiSchemaId.annotate("McpErrorSchema", {
    title: "MCP Error",
    description: "Error object returned by Graphiti MCP responses.",
  })
);

const McpEnvelopeSchema = S.Struct({
  result: S.optionalKey(McpToolCallResultSchema),
  error: S.optionalKey(McpErrorSchema),
}).annotate(
  $GraphitiSchemaId.annotate("McpEnvelopeSchema", {
    title: "MCP Envelope",
    description: "Top-level decoded Graphiti MCP response envelope.",
  })
);

type McpEnvelope = typeof McpEnvelopeSchema.Type;

type GraphitiToolName = "search_nodes" | "search_memory_facts";

const decodeSearchNodesParams = S.decodeUnknownEffect(GraphitiSearchNodesParamsSchema);
const decodeSearchFactsParams = S.decodeUnknownEffect(GraphitiSearchFactsParamsSchema);
const decodeGetNodeParams = S.decodeUnknownEffect(GraphitiGetNodeParamsSchema);
const decodeMcpEnvelope = S.decodeUnknownEffect(McpEnvelopeSchema);
const decodeNodeSearchResult = S.decodeUnknownEffect(RawNodeSearchResultSchema);
const decodeFactSearchResult = S.decodeUnknownEffect(RawFactSearchResultSchema);
const decodeToolError = S.decodeUnknownEffect(GraphitiToolResponseErrorSchema);

const parseJson = Effect.fn("Graphiti.parseJson")(function* (body: string) {
  return yield* Effect.try({
    try: () => JSON.parse(body),
    catch: () =>
      new GraphitiProtocolError({
        message: "Unable to parse JSON payload from Graphiti response.",
      }),
  });
});

const normalizeNullableString = (value: string | null): string =>
  Match.value(value).pipe(
    Match.when(Predicate.isNull, () => ""),
    Match.orElse((text) => text)
  );

const mapRawNode = (node: RawGraphitiNode): GraphitiEntityNode => ({
  uuid: node.uuid,
  name: node.name,
  labels: node.labels,
  createdAt: normalizeNullableString(node.created_at),
  summary: normalizeNullableString(node.summary),
  groupId: node.group_id,
  attributes: node.attributes,
});

const mapRawFact = (fact: RawGraphitiFact): GraphitiFact => ({
  uuid: fact.uuid,
  groupId: fact.group_id,
  sourceNodeUuid: fact.source_node_uuid,
  targetNodeUuid: fact.target_node_uuid,
  name: fact.name,
  fact: fact.fact,
  createdAt: normalizeNullableString(fact.created_at),
  attributes: fact.attributes,
});

const resolveGroupIds = (
  groupIds: ReadonlyArray<string> | undefined,
  defaultGroupId: string
): ReadonlyArray<string> => {
  const resolved = groupIds ?? [];

  return Match.value(A.isReadonlyArrayNonEmpty(resolved)).pipe(
    Match.when(true, () => resolved),
    Match.orElse(() => [defaultGroupId])
  );
};

const toNullableArray = (values: ReadonlyArray<string> | undefined): ReadonlyArray<string> | null => {
  const resolved = values ?? [];

  return Match.value(A.isReadonlyArrayNonEmpty(resolved)).pipe(
    Match.when(true, () => resolved),
    Match.orElse(() => null)
  );
};

const parseMcpBody = Effect.fn("Graphiti.parseMcpBody")(function* (body: string) {
  const lines = A.fromIterable(String.linesIterator(body));
  const maybeDataLine = pipe(
    lines,
    A.findFirst((line) => pipe(line, String.startsWith("data: ")))
  );

  return yield* Option.match(maybeDataLine, {
    onNone: () => parseJson(body),
    onSome: (line) => parseJson(pipe(line, String.slice(6), String.trimStart)),
  });
});

const postMcp = Effect.fn("Graphiti.postMcp")(function* (options: {
  readonly config: GraphitiRuntimeConfig;
  readonly sessionId: Option.Option<string>;
  readonly payload: unknown;
  readonly fetchImpl: GraphitiFetch;
}) {
  const headers = new Headers({
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
  });

  headers.set("x-api-key", options.config.apiKey);

  yield* Option.match(options.sessionId, {
    onNone: () => Effect.void,
    onSome: (sessionId) =>
      Effect.sync(() => {
        headers.set("mcp-session-id", sessionId);
      }),
  });

  const response = yield* Effect.tryPromise({
    try: () =>
      options.fetchImpl(options.config.apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(options.payload),
      }),
    catch: (cause) =>
      new GraphitiRequestError({
        message: `Graphiti request failed: ${cause}`,
      }),
  });

  const body = yield* Effect.tryPromise({
    try: () => response.text(),
    catch: (cause) =>
      new GraphitiRequestError({
        message: `Unable to read Graphiti response body: ${cause}`,
      }),
  });

  yield* Match.value(response.ok).pipe(
    Match.when(true, () => Effect.void),
    Match.orElse(() =>
      Effect.fail(
        new GraphitiHttpStatusError({
          status: response.status,
          body,
        })
      )
    )
  );

  return { response, body };
});

const initializeSession = Effect.fn("Graphiti.initializeSession")(function* (options: {
  readonly config: GraphitiRuntimeConfig;
  readonly fetchImpl: GraphitiFetch;
}) {
  const initializePayload = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "@beep/web", version: "0.1.0" },
    },
  };

  const initializeResponse = yield* postMcp({
    config: options.config,
    sessionId: Option.none(),
    payload: initializePayload,
    fetchImpl: options.fetchImpl,
  });

  const maybeSessionId = Option.fromNullishOr(initializeResponse.response.headers.get("mcp-session-id"));

  const sessionId = yield* Option.match(maybeSessionId, {
    onNone: () =>
      Effect.fail(
        new GraphitiProtocolError({
          message: "Graphiti initialize response did not include mcp-session-id header.",
        })
      ),
    onSome: Effect.succeed,
  });

  const initializedNotification = {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  };

  yield* postMcp({
    config: options.config,
    sessionId: Option.some(sessionId),
    payload: initializedNotification,
    fetchImpl: options.fetchImpl,
  });

  return sessionId;
});

const extractToolResult = Effect.fn("Graphiti.extractToolResult")(function* (
  toolName: GraphitiToolName,
  envelope: McpEnvelope
) {
  const topLevelError = Option.fromNullishOr(envelope.error);

  yield* Option.match(topLevelError, {
    onNone: () => Effect.void,
    onSome: (error) =>
      Effect.fail(
        new GraphitiToolError({
          toolName,
          message: error.message,
        })
      ),
  });

  const callResult = yield* Option.match(Option.fromNullishOr(envelope.result), {
    onNone: () =>
      Effect.fail(
        new GraphitiProtocolError({
          message: `Graphiti response for ${toolName} did not include a result payload.`,
        })
      ),
    onSome: Effect.succeed,
  });

  const structuredResult = pipe(
    Option.fromNullishOr(callResult.structuredContent),
    Option.map((structuredContent) => structuredContent.result)
  );

  return yield* Option.match(structuredResult, {
    onSome: Effect.succeed,
    onNone: () =>
      Effect.gen(function* () {
        const maybeText = pipe(
          callResult.content,
          A.findFirst((content) => content.type === "text"),
          Option.flatMap((content) => Option.fromNullishOr(content.text))
        );

        const text = yield* Option.match(maybeText, {
          onNone: () =>
            Effect.fail(
              new GraphitiProtocolError({
                message: `Graphiti result for ${toolName} did not include structuredContent or text payload.`,
              })
            ),
          onSome: Effect.succeed,
        });

        return yield* parseJson(text);
      }),
  });
});

const decodeToolResult = <A>(options: {
  readonly toolName: GraphitiToolName;
  readonly payload: unknown;
  readonly decodeSuccess: (payload: unknown) => Effect.Effect<A, S.SchemaError>;
}): Effect.Effect<A, GraphitiToolError | GraphitiResponseDecodeError> =>
  options.decodeSuccess(options.payload).pipe(
    Effect.mapError(
      (cause) =>
        new GraphitiResponseDecodeError({
          message: cause.message,
        })
    ),
    Effect.matchEffect({
      onSuccess: Effect.succeed,
      onFailure: () =>
        decodeToolError(options.payload).pipe(
          Effect.mapError(
            (cause) =>
              new GraphitiResponseDecodeError({
                message: cause.message,
              })
          ),
          Effect.flatMap((toolError) =>
            Effect.fail(
              new GraphitiToolError({
                toolName: options.toolName,
                message: toolError.error,
              })
            )
          )
        ),
    })
  );

const callTool = Effect.fn("Graphiti.callTool")(function* (options: {
  readonly config: GraphitiRuntimeConfig;
  readonly fetchImpl: GraphitiFetch;
  readonly toolName: GraphitiToolName;
  readonly arguments: Record<string, unknown>;
}) {
  const sessionId = yield* initializeSession({
    config: options.config,
    fetchImpl: options.fetchImpl,
  });

  const payload = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: options.toolName,
      arguments: options.arguments,
    },
  };

  const response = yield* postMcp({
    config: options.config,
    sessionId: Option.some(sessionId),
    payload,
    fetchImpl: options.fetchImpl,
  });

  const parsedBody = yield* parseMcpBody(response.body);

  const envelope = yield* decodeMcpEnvelope(parsedBody).pipe(
    Effect.mapError(
      (cause) =>
        new GraphitiResponseDecodeError({
          message: cause.message,
        })
    )
  );

  return yield* extractToolResult(options.toolName, envelope);
});

const makeService = (config: GraphitiRuntimeConfig, fetchImpl: GraphitiFetch): GraphitiService["Service"] => {
  const searchNodes = Effect.fn("GraphitiService.searchNodes")(function* (input: GraphitiSearchNodesParams) {
    const params = yield* decodeSearchNodesParams(input).pipe(
      Effect.mapError(
        (cause) =>
          new GraphitiResponseDecodeError({
            message: cause.message,
          })
      )
    );

    const payload = yield* callTool({
      config,
      fetchImpl,
      toolName: "search_nodes",
      arguments: {
        query: params.query,
        max_nodes: params.maxNodes,
        group_ids: resolveGroupIds(params.groupIds, config.groupId),
        entity_types: toNullableArray(params.entityTypes),
      },
    });

    const decoded = yield* decodeToolResult({
      toolName: "search_nodes",
      payload,
      decodeSuccess: decodeNodeSearchResult,
    });

    return pipe(decoded.nodes, A.map(mapRawNode));
  });

  const searchFacts = Effect.fn("GraphitiService.searchFacts")(function* (input: GraphitiSearchFactsParams) {
    const params = yield* decodeSearchFactsParams(input).pipe(
      Effect.mapError(
        (cause) =>
          new GraphitiResponseDecodeError({
            message: cause.message,
          })
      )
    );

    const payload = yield* callTool({
      config,
      fetchImpl,
      toolName: "search_memory_facts",
      arguments: {
        query: params.query,
        max_facts: params.maxFacts,
        group_ids: resolveGroupIds(params.groupIds, config.groupId),
        center_node_uuid: params.centerNodeUuid ?? null,
      },
    });

    const decoded = yield* decodeToolResult({
      toolName: "search_memory_facts",
      payload,
      decodeSuccess: decodeFactSearchResult,
    });

    return pipe(decoded.facts, A.map(mapRawFact));
  });

  const getNode = Effect.fn("GraphitiService.getNode")(function* (input: GraphitiGetNodeParams) {
    const params = yield* decodeGetNodeParams(input).pipe(
      Effect.mapError(
        (cause) =>
          new GraphitiResponseDecodeError({
            message: cause.message,
          })
      )
    );

    const nodes = yield* searchNodes({
      query: params.nodeId,
      maxNodes: 5,
      groupIds: params.groupIds,
    });

    const selectedNode = pipe(
      nodes,
      A.findFirst((node) => node.uuid === params.nodeId),
      Option.orElse(() => A.head(nodes))
    );

    const factQuery = pipe(
      selectedNode,
      Option.match({
        onNone: () => params.nodeId,
        onSome: (node) => node.name,
      })
    );

    const facts = yield* searchFacts({
      query: factQuery,
      maxFacts: params.maxFacts,
      groupIds: params.groupIds,
      centerNodeUuid: params.nodeId,
    });

    const neighborsQuery = pipe(
      selectedNode,
      Option.match({
        onNone: () => params.nodeId,
        onSome: (node) => node.name,
      })
    );

    const neighbors = yield* searchNodes({
      query: neighborsQuery,
      maxNodes: params.maxNeighbors,
      groupIds: params.groupIds,
    });

    return {
      node: selectedNode,
      neighbors,
      facts,
    };
  });

  return {
    searchNodes,
    searchFacts,
    getNode,
  };
};

export interface GraphitiLayerOptions extends GraphitiRuntimeConfig {
  readonly fetch: GraphitiFetch;
}

const makeFromEnv = Effect.fn("GraphitiService.makeFromEnv")(function* () {
  const config = yield* S.decodeUnknownEffect(GraphitiRuntimeConfigSchema)({
    apiUrl: process.env.GRAPHITI_API_URL ?? DefaultGraphitiApiUrl,
    apiKey: process.env.GRAPHITI_API_KEY ?? "",
    groupId: process.env.GRAPHITI_GROUP_ID ?? DefaultGraphitiGroupId,
  }).pipe(
    Effect.mapError(
      (cause) =>
        new GraphitiResponseDecodeError({
          message: cause.message,
        })
    )
  );

  return GraphitiService.of(makeService(config, globalThis.fetch));
});

export class GraphitiService extends ServiceMap.Service<
  GraphitiService,
  {
    readonly searchNodes: (
      params: GraphitiSearchNodesParams
    ) => Effect.Effect<ReadonlyArray<GraphitiEntityNode>, GraphitiServiceError>;
    readonly searchFacts: (
      params: GraphitiSearchFactsParams
    ) => Effect.Effect<ReadonlyArray<GraphitiFact>, GraphitiServiceError>;
    readonly getNode: (params: GraphitiGetNodeParams) => Effect.Effect<GraphitiNodeLookup, GraphitiServiceError>;
  }
>()($GraphitiId`GraphitiService`) {
  static readonly layer = Layer.effect(this, makeFromEnv());

  static layerWith(options: GraphitiLayerOptions): Layer.Layer<GraphitiService> {
    return Layer.succeed(
      GraphitiService,
      GraphitiService.of(
        makeService(
          {
            apiUrl: options.apiUrl,
            apiKey: options.apiKey,
            groupId: options.groupId,
          },
          options.fetch
        )
      )
    );
  }
}

export const validateGraphitiEntityNode = S.decodeUnknownEffect(GraphitiEntityNodeSchema);
export const validateGraphitiFact = S.decodeUnknownEffect(GraphitiFactSchema);
