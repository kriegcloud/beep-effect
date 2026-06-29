/**
 * Builds Model Context Protocol (MCP) servers with Effect.
 *
 * The `McpServer` service stores the tools, resources, resource templates,
 * prompts, completions, initialized clients, and outgoing notifications exposed
 * by a server. This module also includes the server runner, custom protocol,
 * stdio, and HTTP layers, registration helpers, and APIs that let handlers ask
 * the connected client for structured input or read its advertised
 * capabilities.
 *
 * @since 0.0.0
 */
import { $AgentsDomainId } from "@beep/identity/packages";
import { A, O, P, Struct } from "@beep/utils";
import type { Types } from "effect";
import { Cause, Context, Effect, Exit, Fiber, Layer, Queue, Random, RcMap, SchemaAST, Sink, Stream } from "effect";
import { CurrentLogLevel } from "effect/References";
import * as S from "effect/Schema";
import type { Stdio } from "effect/Stdio";
import * as FindMyWay from "effect/unstable/http/FindMyWay";
import * as Headers from "effect/unstable/http/Headers";
import { appendPreResponseHandlerUnsafe } from "effect/unstable/http/HttpEffect";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as Rpc from "effect/unstable/rpc/Rpc";
import * as RpcClient from "effect/unstable/rpc/RpcClient";
import type * as RpcGroup from "effect/unstable/rpc/RpcGroup";
import * as RpcMessage from "effect/unstable/rpc/RpcMessage";
import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";
import * as RpcServer from "effect/unstable/rpc/RpcServer";
import type {
  CallTool,
  ClientCapabilities,
  Complete,
  GetPrompt,
  Initialize,
  Param,
  PromptArgument,
  PromptMessage,
  ReadResourceResult,
  ServerCapabilities,
} from "./McpSchema.ts";
import {
  CallToolResult,
  ClientNotificationRpcs,
  ClientRpcs,
  CompleteResult,
  Elicit,
  ElicitationDeclined,
  EnabledWhen,
  GetPromptResult,
  InternalError,
  InvalidParams,
  isParam,
  ListPromptsResult,
  ListResourcesResult,
  ListResourceTemplatesResult,
  ListToolsResult,
  McpServerClient,
  McpServerClientMiddleware,
  Tool as McpTool,
  Prompt,
  Resource,
  ResourceTemplate,
  ServerNotificationRpcs,
  ServerRequestRpcs,
  TextContent,
} from "./McpSchema.ts";
import * as Tool from "./Tool.ts";
import type * as Toolkit from "./Toolkit.ts";

const $I = $AgentsDomainId.create("McpServer");

/**
 * Service that stores and serves an MCP server's registered tools, resources,
 * prompts, completions, and outgoing notifications.
 *
 * **Details**
 *
 * Handlers use this service to register capabilities and resolve incoming MCP
 * requests.
 *
 * @category services
 * @since 0.0.0
 */
export class McpServer extends Context.Service<
  McpServer,
  {
    readonly notifications: RpcClient.RpcClient<RpcGroup.Rpcs<typeof ServerNotificationRpcs>>;
    readonly notificationsQueue: Queue.Dequeue<RpcMessage.Request<any>>;
    readonly initializedClients: Set<number>;

    readonly tools: ReadonlyArray<{
      readonly tool: McpTool;
      readonly annotations: Context.Context<never>;
    }>;
    readonly addTool: (options: {
      readonly tool: McpTool;
      readonly annotations: Context.Context<never>;
      readonly handle: (payload: any) => Effect.Effect<CallToolResult, never, McpServerClient>;
    }) => Effect.Effect<void>;
    readonly callTool: (
      requests: typeof CallTool.payloadSchema.Type
    ) => Effect.Effect<CallToolResult, InternalError | InvalidParams, McpServerClient>;

    readonly resources: ReadonlyArray<{
      readonly resource: Resource;
      readonly annotations: Context.Context<never>;
    }>;
    readonly addResource: (options: {
      readonly resource: Resource;
      readonly annotations: Context.Context<never>;
      readonly handle: Effect.Effect<ReadResourceResult, InternalError, McpServerClient>;
    }) => Effect.Effect<void>;

    readonly resourceTemplates: ReadonlyArray<{
      readonly template: ResourceTemplate;
      readonly annotations: Context.Context<never>;
    }>;
    readonly addResourceTemplate: (options: {
      readonly template: ResourceTemplate;
      readonly annotations: Context.Context<never>;
      readonly routerPath: string;
      readonly completions: Record<string, (input: string) => Effect.Effect<CompleteResult, InternalError>>;
      readonly handle: (
        uri: string,
        params: Array<string>
      ) => Effect.Effect<ReadResourceResult, InvalidParams | InternalError, McpServerClient>;
    }) => Effect.Effect<void>;

    readonly findResource: (
      uri: string
    ) => Effect.Effect<ReadResourceResult, InvalidParams | InternalError, McpServerClient>;

    readonly prompts: ReadonlyArray<{
      readonly prompt: Prompt;
      readonly annotations: Context.Context<never>;
    }>;
    readonly addPrompt: (options: {
      readonly prompt: Prompt;
      readonly annotations: Context.Context<never>;
      readonly completions: Record<
        string,
        (input: string) => Effect.Effect<CompleteResult, InternalError, McpServerClient>
      >;
      readonly handle: (
        params: Record<string, string>
      ) => Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient>;
    }) => Effect.Effect<void>;
    readonly getPromptResult: (
      request: typeof GetPrompt.payloadSchema.Type
    ) => Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient>;

    readonly completion: (
      complete: typeof Complete.payloadSchema.Type
    ) => Effect.Effect<CompleteResult, InternalError, McpServerClient>;
  }
>()($I`McpServer`) {
  /**
   * Builds an MCP server service from registered tools, prompts, resources, and completions.
   *
   * @since 0.0.0
   */
  static readonly make = Effect.gen(function* () {
    const matcher = makeUriMatcher<
      | {
          readonly _tag: "ResourceTemplate";
          readonly handle: (
            uri: string,
            params: Array<string>
          ) => Effect.Effect<ReadResourceResult, InternalError | InvalidParams, McpServerClient>;
        }
      | {
          readonly _tag: "Resource";
          readonly effect: Effect.Effect<ReadResourceResult, InternalError, McpServerClient>;
        }
    >();
    const tools = A.empty<{
      readonly tool: McpTool;
      readonly annotations: Context.Context<never>;
    }>();
    const toolMap = new Map<string, (payload: any) => Effect.Effect<CallToolResult, InternalError, McpServerClient>>();
    const resources: Array<{
      readonly resource: Resource;
      readonly annotations: Context.Context<never>;
    }> = [];
    const resourceTemplates: Array<{
      readonly template: ResourceTemplate;
      readonly annotations: Context.Context<never>;
    }> = [];
    const prompts: Array<{
      readonly prompt: Prompt;
      readonly annotations: Context.Context<never>;
    }> = [];
    const promptMap = new Map<
      string,
      (params: Record<string, string>) => Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient>
    >();
    const completionsMap = new Map<
      string,
      (input: string) => Effect.Effect<CompleteResult, InternalError, McpServerClient>
    >();
    const notificationsQueue = yield* Queue.make<RpcMessage.Request<any>>();
    const notifications = yield* RpcClient.makeNoSerialization(ServerNotificationRpcs, {
      spanPrefix: "McpServer/Notifications",
      onFromClient: (options) =>
        Effect.suspend((): Effect.Effect<void> => {
          const message = options.message;
          if (message._tag !== "Request") {
            return Effect.void;
          }
          if (message.tag.includes("list_changed")) {
            Queue.offerUnsafe(notificationsQueue, message);
          } else {
            Queue.offerUnsafe(notificationsQueue, message);
          }
          return notifications.write({
            clientId: 0,
            requestId: message.id,
            _tag: "Exit",
            exit: Exit.void as any,
          });
        }),
    });

    return McpServer.of({
      notifications: notifications.client,
      notificationsQueue,
      initializedClients: new Set(),
      get tools() {
        return tools;
      },
      addTool: Effect.fn("McpServer.addTool")(function* (options) {
        tools.push(options);
        toolMap.set(options.tool.name, options.handle);
        return yield* notifications.client["notifications/tools/list_changed"]({});
      }),
      callTool: Effect.fn("McpServer.callTool")(function* (request) {
        const handle = toolMap.get(request.name);
        if (P.isUndefined(handle)) {
          return yield* InvalidParams.make({ message: `Tool '${request.name}' not found` });
        }
        return yield* handle(request.arguments);
      }),
      get resources() {
        return resources;
      },
      get resourceTemplates() {
        return resourceTemplates;
      },
      addResource: Effect.fn("McpServer.addResource")(function* (options) {
        resources.push(options);
        matcher.add(options.resource.uri, { _tag: "Resource", effect: options.handle });
        return yield* notifications.client["notifications/resources/list_changed"]({});
      }),
      addResourceTemplate: Effect.fn("McpServer.addResourceTemplate")(function* ({
        annotations,
        completions,
        handle,
        routerPath,
        template,
      }) {
        resourceTemplates.push({ template, annotations });
        matcher.add(routerPath, { _tag: "ResourceTemplate", handle });
        for (const [param, handle] of Object.entries(completions)) {
          completionsMap.set(`ref/resource/${template.uriTemplate}/${param}`, handle);
        }
        return yield* notifications.client["notifications/resources/list_changed"]({});
      }),
      findResource: Effect.fn("McpServer.findResource")(function* (uri) {
        const match = matcher.find(uri);
        if (P.isUndefined(match)) {
          return { contents: [] };
        } else if (match.handler._tag === "Resource") {
          return yield* match.handler.effect;
        }
        const params = A.empty<string>();
        for (const key of Struct.keys(match.params)) {
          params[Number(key)] = match.params[key]!;
        }
        return yield* match.handler.handle(uri, params);
      }),
      get prompts() {
        return prompts;
      },
      addPrompt: Effect.fn("McpServer.addPrompt")(function* (options) {
        prompts.push(options);
        promptMap.set(options.prompt.name, options.handle);
        for (const [param, handle] of Object.entries(options.completions)) {
          completionsMap.set(`ref/prompt/${options.prompt.name}/${param}`, handle);
        }
        return yield* notifications.client["notifications/prompts/list_changed"]({});
      }),
      getPromptResult: Effect.fnUntraced(function* ({ arguments: params, name }) {
        const handler = promptMap.get(name);
        if (!P.isNotUndefined(handler)) {
          return yield* InvalidParams.make({ message: `Prompt '${name}' not found` });
        }
        return yield* handler(params ?? {});
      }),
      completion: Effect.fnUntraced(function* (complete) {
        const ref = complete.ref;
        const key =
          ref.type === "ref/resource"
            ? `ref/resource/${ref.uri}/${complete.argument.name}`
            : `ref/prompt/${ref.name}/${complete.argument.name}`;
        const handler = completionsMap.get(key);
        return P.isNotUndefined(handler) ? yield* handler(complete.argument.value) : CompleteResult.empty;
      }),
    });
  });

  /**
   * Layer that provides the MCP server and client services.
   *
   * @since 0.0.0
   */
  static readonly layer: Layer.Layer<McpServer | McpServerClient> = Layer.effect(McpServer)(McpServer.make) as any;
}

const LATEST_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_PROTOCOL_VERSIONS = [LATEST_PROTOCOL_VERSION, "2025-03-26", "2024-11-05", "2024-10-07"];
const mcpSessionIdHeader = "mcp-session-id";
const mcpProtocolVersionHeader = "mcp-protocol-version";

/**
 * Runs an MCP server over the current `RpcServer.Protocol`.
 *
 * **Details**
 *
 * The server performs initialization and session handling, serves registered
 * tools, resources, and prompts, and forwards queued server notifications to
 * initialized clients.
 *
 * @category constructors
 * @since 0.0.0
 */
export const run: (options: {
  readonly name: string;
  readonly version: string;
  readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
}) => Effect.Effect<never, never, McpServer | RpcServer.Protocol> = Effect.fnUntraced(function* (options: {
  readonly name: string;
  readonly version: string;
}) {
  const protocol = yield* RpcServer.Protocol;
  const server = yield* McpServer;
  const isHttp = O.isSome(yield* Effect.serviceOption(HttpRouter.HttpRouter));
  const clientSessions = new Map<string, typeof Initialize.payloadSchema.Type>();
  const handlers = yield* Layer.build(layerHandlers(options, { clientSessions }));

  const clients = yield* RcMap.make({
    lookup: Effect.fnUntraced(function* (clientId: number) {
      let write!: (message: RpcMessage.FromServerEncoded) => Effect.Effect<void>;
      const client = yield* RpcClient.make(ServerRequestRpcs, {
        spanPrefix: "McpServer/Client",
      }).pipe(
        Effect.provideServiceEffect(
          RpcClient.Protocol,
          RpcClient.Protocol.make(
            Effect.fnUntraced(function* (writeResponse) {
              let cid = 0;
              write = (message) => writeResponse(cid, message);
              return {
                send(id, request, _transferables) {
                  cid = id;
                  return protocol.send(clientId, {
                    ...request,
                    headers: undefined,
                    traceId: undefined,
                    spanId: undefined,
                    sampled: undefined,
                  } as any);
                },
                supportsAck: true,
                supportsTransferables: false,
                supportsStructuredClone: false,
              };
            })
          )
        )
      );

      return { client, write } as const;
    }),
    idleTimeToLive: 10000,
  });

  const clientMiddleware = McpServerClientMiddleware.of((effect, { client, headers, rpc }) => {
    const initializePayload = getInitializedClient(clientSessions, client.id, headers);
    const isInitialize = rpc._tag === "initialize";
    if (!isInitialize && !P.isNotUndefined(initializePayload)) {
      const fiber = Fiber.getCurrent()!;
      const httpRequest = Context.getOrUndefined(fiber.context, HttpServerRequest.HttpServerRequest);
      if (P.isNotUndefined(httpRequest)) {
        appendPreResponseHandlerUnsafe(httpRequest, () => Effect.succeed(HttpServerResponse.empty({ status: 404 })));
      }
      return Effect.die(new Error("Mcp-Session-Id does not exist"));
    }
    return Effect.provideService(
      effect,
      McpServerClient,
      McpServerClient.of({
        clientId: client.id,
        initializePayload: initializePayload!,
        getClient: RcMap.get(clients, client.id).pipe(Effect.map(({ client }) => client)),
      })
    );
  });

  const patchedProtocol = RpcServer.Protocol.of({
    ...protocol,
    run: Effect.fn("RpcServer.Protocol.run")(function* (f) {
      return yield* protocol.run((clientId, request_) => {
        const request = request_ as any as RpcMessage.FromServerEncoded | RpcMessage.FromClientEncoded;
        switch (request._tag) {
          case "Request": {
            if (isHttp) {
              const fiber = Fiber.getCurrent()!;
              const httpRequest = Context.getUnsafe(fiber.context, HttpServerRequest.HttpServerRequest);
              const client = getInitializedClient(clientSessions, clientId, httpRequest.headers);
              if (P.isNotUndefined(client)) {
                appendPreResponseHandlerUnsafe(
                  httpRequest,
                  (_req: HttpServerRequest.HttpServerRequest, res: HttpServerResponse.HttpServerResponse) =>
                    Effect.succeed(HttpServerResponse.setHeader(res, mcpProtocolVersionHeader, client.protocolVersion))
                );
              }
            }
            const rpc = ClientNotificationRpcs.requests.get(request.tag);
            if (P.isNotUndefined(rpc)) {
              if (request.tag === "notifications/cancelled") {
                return f(clientId, {
                  _tag: "Interrupt",
                  requestId: String((request.payload as any).requestId),
                });
              }
              const handler = handlers.mapUnsafe.get(request.tag) as Rpc.Handler<string>;
              return P.isNotUndefined(handler)
                ? (handler.handler(request.payload, {
                    rpc,
                    requestId: RpcMessage.RequestId(request.id),
                    client: new Rpc.ServerClient(clientId),
                    headers: Headers.fromInput(request.headers),
                  }) as any as Effect.Effect<void>)
                : Effect.void;
            }
            return f(clientId, request);
          }
          case "Ping":
          case "Ack":
          case "Interrupt":
          case "Eof":
            return f(clientId, request);
          case "Pong":
          case "Exit":
          case "Chunk":
          case "ClientProtocolError":
          case "Defect":
            return RcMap.get(clients, clientId).pipe(
              Effect.flatMap(({ write }) => write(request)),
              Effect.scoped
            );
        }
      });
    }),
  });

  const encodeNotification = S.encodeUnknownEffect(
    S.Union(Array.from(ServerNotificationRpcs.requests.values(), (rpc) => rpc.payloadSchema))
  );
  yield* Queue.take(server.notificationsQueue).pipe(
    Effect.flatMap(
      Effect.fnUntraced(function* (request) {
        const encoded = yield* encodeNotification(request.payload);
        const message: RpcMessage.RequestEncoded = {
          _tag: "Request",
          tag: request.tag,
          payload: encoded,
        } as any;
        const clientIds = yield* patchedProtocol.clientIds;
        for (const clientId of server.initializedClients.keys()) {
          if (!clientIds.has(clientId)) {
            server.initializedClients.delete(clientId);
            continue;
          }
          yield* patchedProtocol.send(clientId, message as any);
        }
      })
    ),
    Effect.catchCause(() => Effect.void),
    Effect.forever,
    Effect.forkScoped
  );

  return yield* RpcServer.make(ClientRpcs, {
    spanPrefix: "McpServer",
    disableFatalDefects: true,
  }).pipe(
    Effect.provideService(RpcServer.Protocol, patchedProtocol),
    Effect.provideService(McpServerClientMiddleware, clientMiddleware),
    Effect.provide(handlers)
  );
}, Effect.scoped);

/**
 * Creates a layer that starts an MCP server over an existing
 * `RpcServer.Protocol` and provides the `McpServer` and `McpServerClient`
 * services.
 *
 * **When to use**
 *
 * Use when you already have a custom or externally provided
 * `RpcServer.Protocol` and want to start an MCP server as part of a layer
 * graph.
 *
 * **Details**
 *
 * The returned layer forks `run(options)` in the layer scope and merges
 * `McpServer.layer`, so registration layers can use the `McpServer` service
 * while the server is running.
 *
 * **Gotchas**
 *
 * Unlike `layerStdio` and `layerHttp`, this layer does not install a concrete
 * transport. The surrounding layer graph must provide `RpcServer.Protocol`.
 *
 * @see {@link run} for the effect form used by this layer
 * @see {@link layerStdio} for a stdio-backed layer that installs the MCP protocol and NDJSON-RPC serialization
 * @see {@link layerHttp} for an HTTP-backed layer that registers with `HttpRouter` and installs JSON-RPC serialization
 *
 * @category layers
 * @since 0.0.0
 */
export const layer = (options: {
  readonly name: string;
  readonly version: string;
  readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
}): Layer.Layer<McpServer | McpServerClient, never, RpcServer.Protocol> =>
  Layer.effectDiscard(Effect.forkScoped(run(options))).pipe(Layer.provideMerge(McpServer.layer));

/**
 * Runs the McpServer, using stdio for input and output.
 *
 * @example Running an MCP server over stdio
 *
 * ```ts
 * import { Effect, Layer, Logger } from "effect"
 * import * as S from "effect/Schema"
 * import { NodeRuntime, NodeStdio } from "@effect/platform-node"
 * import { McpSchema, McpServer } from "effect/unstable/ai"
 *
 * const idParam = McpSchema.param("id", S.Finite)
 *
 * // Define a resource template for a README file
 * const ReadmeTemplate = McpServer.resource`file://readme/${idParam}`({
 *   name: "README Template",
 *   // You can add auto-completion for the ID parameter
 *   completion: {
 *     id: (_) => Effect.succeed([1, 2, 3, 4, 5])
 *   },
 *   content: Effect.fn(function*(_uri, id) {
 *     return `# MCP Server Demo - ID: ${id}`
 *   })
 * })
 *
 * // Define a test prompt with parameters
 * const TestPrompt = McpServer.prompt({
 *   name: "Test Prompt",
 *   description: "A test prompt to demonstrate MCP server capabilities",
 *   parameters: {
 *     flightNumber: S.String
 *   },
 *   completion: {
 *     flightNumber: () => Effect.succeed(["FL123", "FL456", "FL789"])
 *   },
 *   content: ({ flightNumber }) =>
 *     Effect.succeed(`Get the booking details for flight number: ${flightNumber}`)
 * })
 *
 * // Merge all the resources and prompts into a single server layer
 * const ServerLayer = Layer.mergeAll(
 *   ReadmeTemplate,
 *   TestPrompt
 * ).pipe(
 *   // Provide the MCP server implementation
 *   Layer.provide(McpServer.layerStdio({
 *     name: "Demo Server",
 *     version: "1.0.0",
 *   })),
 *   Layer.provide(NodeStdio.layer),
 *   Layer.provide(Layer.succeed(Logger.LogToStderr)(true))
 * )
 *
 * Layer.launch(ServerLayer).pipe(NodeRuntime.runMain)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerStdio = (options: {
  readonly name: string;
  readonly version: string;
  readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
}): Layer.Layer<McpServer | McpServerClient, never, Stdio> =>
  layer(options).pipe(Layer.provide(RpcServer.layerProtocolStdio), Layer.provide(RpcSerialization.layerNdJsonRpc()));

/**
 * Registers an HTTP POST JSON-RPC route at `options.path` on the current
 * `HttpRouter`.
 *
 * **When to use**
 *
 * Use to expose an MCP server through an existing `HttpRouter`.
 *
 * **Details**
 *
 * This layer composes `layer(options)`, `RpcServer.layerProtocolHttp(options)`,
 * and `RpcSerialization.layerJsonRpc()`.
 *
 * @see {@link layerStdio} for exposing the server over stdio
 * @see {@link layer} for the base MCP server layer without a transport protocol
 *
 * @category layers
 * @since 0.0.0
 */
export const layerHttp = (options: {
  readonly name: string;
  readonly version: string;
  readonly path: HttpRouter.PathInput;
  readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
}): Layer.Layer<McpServer | McpServerClient, never, HttpRouter.HttpRouter> =>
  layer(options).pipe(
    Layer.provide(RpcServer.layerProtocolHttp(options)),
    Layer.provide(RpcSerialization.layerJsonRpc())
  );

/**
 * Registers a `Toolkit` with the `McpServer`.
 *
 * @category tools
 * @since 0.0.0
 */
export const registerToolkit: <Tools extends Record<string, Tool.Any>>(
  toolkit: Toolkit.Toolkit<Tools>
) => Effect.Effect<
  void,
  never,
  McpServer | Tool.HandlersFor<Tools> | Exclude<Tool.HandlerServices<Tools>, McpServerClient>
> = Effect.fnUntraced(function* <Tools extends Record<string, Tool.Any>>(toolkit: Toolkit.Toolkit<Tools>) {
  const registry = yield* McpServer;
  const built = yield* toolkit as any as Effect.Effect<
    Toolkit.WithHandler<Tools>,
    never,
    Exclude<Tool.HandlersFor<Tools>, McpServerClient>
  >;
  const services = yield* Effect.context<never>();
  for (const tool of Object.values(built.tools)) {
    const annotations = tool.annotations;
    const toolMeta = Context.getOrUndefined(annotations, Tool.Meta);
    const mcpTool = McpTool.make({
      name: tool.name,
      description: Tool.getDescription(tool),
      inputSchema: Tool.getJsonSchema(tool),
      annotations: {
        ...Context.getOption(tool.annotations, Tool.Title).pipe(
          O.map((title) => ({ title })),
          O.getOrUndefined
        ),
        readOnlyHint: Context.get(tool.annotations, Tool.Readonly),
        destructiveHint: Context.get(tool.annotations, Tool.Destructive),
        idempotentHint: Context.get(tool.annotations, Tool.Idempotent),
        openWorldHint: Context.get(tool.annotations, Tool.OpenWorld),
      },
      _meta: toolMeta,
    });
    yield* registry.addTool({
      tool: mcpTool,
      annotations,
      handle(payload) {
        return built.handle(tool.name as any, payload).pipe(
          Stream.unwrap,
          Stream.run(Sink.last()),
          Effect.flatMap(Effect.fromOption),
          Effect.provideContext(services as Context.Context<any>),
          Effect.matchCause({
            onFailure: (cause) =>
              CallToolResult.make({
                isError: true,
                content: [
                  {
                    type: "text",
                    text: Cause.pretty(cause),
                  },
                ],
              }),
            onSuccess: (result: any) =>
              CallToolResult.make({
                isError: false,
                structuredContent: typeof result.encodedResult === "object" ? result.encodedResult : undefined,
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result.encodedResult),
                  },
                ],
              }),
          }),
          Effect.tapCause(Effect.log)
        ) as any;
      },
    });
  }
});

/**
 * Registers an `AiToolkit` with the `McpServer`.
 *
 * @category tools
 * @since 0.0.0
 */
export const toolkit = <Tools extends Record<string, Tool.Any>>(
  toolkit: Toolkit.Toolkit<Tools>
): Layer.Layer<never, never, Tool.HandlersFor<Tools> | Exclude<Tool.HandlerServices<Tools>, McpServerClient>> =>
  Layer.effectDiscard(registerToolkit(toolkit)).pipe(Layer.provide(McpServer.layer));

/**
 * Utility type that validates a completion-handler record against the allowed
 * parameter keys.
 *
 * @category type-level
 * @since 0.0.0
 */
export type ValidateCompletions<Completions, Keys extends string> = Completions & {
  readonly [K in keyof Completions]: K extends Keys ? (input: string) => any : never;
};

/**
 * Completion-handler map for a resource URI template.
 *
 * **Details**
 *
 * Each schema interpolation contributes a parameter key, using an explicit
 * `Param` name when present or `paramN` otherwise, and each handler returns
 * candidate values for that parameter.
 *
 * @category models
 * @since 0.0.0
 */
export type ResourceCompletions<Schemas extends ReadonlyArray<S.Constraint>> = {
  readonly [K in Extract<keyof Schemas, `${number}`> as Schemas[K] extends Param<infer Id, infer _S>
    ? Id
    : `param${K}`]: (input: string) => Effect.Effect<Array<Schemas[K]["Type"]>, any, any>;
};

/**
 * Registers an MCP resource or resource template from an Effect program.
 *
 * **When to use**
 *
 * Use when you are already inside an Effect program with an `McpServer`
 * service and need to add a concrete resource or URI-template resource
 * directly.
 *
 * @see {@link resource} for the layer-based resource registration wrapper
 *
 * @category resources
 * @since 0.0.0
 */
export const registerResource: {
  <E, R>(options: {
    readonly uri: string;
    readonly name: string;
    readonly description?: string | undefined;
    readonly mimeType?: string | undefined;
    readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
    readonly priority?: number | undefined;
    readonly content: Effect.Effect<ReadResourceResult | string | Uint8Array, E, R>;
    readonly annotations?: Context.Context<never> | undefined;
  }): Effect.Effect<void, never, Exclude<R, McpServerClient> | McpServer>;
  <const Schemas extends ReadonlyArray<S.Constraint>>(
    segments: TemplateStringsArray,
    ...schemas: Schemas
  ): <E, R, const Completions extends Partial<ResourceCompletions<Schemas>> = {}>(options: {
    readonly name: string;
    readonly description?: string | undefined;
    readonly mimeType?: string | undefined;
    readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
    readonly priority?: number | undefined;
    readonly completion?: ValidateCompletions<Completions, keyof ResourceCompletions<Schemas>> | undefined;
    readonly content: (
      uri: string,
      ...params: { readonly [K in keyof Schemas]: Schemas[K]["Type"] }
    ) => Effect.Effect<ReadResourceResult | string | Uint8Array, E, R>;
    readonly annotations?: Context.Context<never> | undefined;
  }) => Effect.Effect<
    void,
    never,
    | Exclude<
        | Schemas[number]["DecodingServices"]
        | Schemas[number]["EncodingServices"]
        | R
        | (Completions[keyof Completions] extends (input: string) => infer Ret
            ? Ret extends Effect.Effect<infer _A, infer _E, infer _R>
              ? _R
              : never
            : never),
        McpServerClient
      >
    | McpServer
  >;
} = function () {
  if (arguments.length === 1) {
    const options = arguments[0] as {
      readonly uri: string;
      readonly name: string;
      readonly description?: string | undefined;
      readonly mimeType?: string | undefined;
      readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
      readonly priority?: number | undefined;
      readonly content: Effect.Effect<ReadResourceResult | string | Uint8Array, any, any>;
      readonly annotations?: Context.Context<never> | undefined;
    };
    return Effect.gen(function* () {
      const services = yield* Effect.context<any>();
      const registry = yield* McpServer;
      yield* registry.addResource({
        resource: Resource.make({
          ...options,
          annotations: options,
        }),
        handle: options.content.pipe(
          Effect.provideContext(services),
          Effect.map((content) => resolveResourceContent(options.uri, content)),
          Effect.catchCause((cause) => {
            const prettyError = Cause.prettyErrors(cause)[0];
            return Effect.fail(InternalError.make({ message: prettyError.message }));
          })
        ),
        annotations: options.annotations ?? Context.empty(),
      });
    });
  }
  const { params, routerPath, schema, uriPath } = compileUriTemplate(...(arguments as any as [any, any]));
  return Effect.fnUntraced(function* <E, R>(options: {
    readonly name: string;
    readonly description?: string | undefined;
    readonly mimeType?: string | undefined;
    readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
    readonly priority?: number | undefined;
    readonly completion?: Record<string, (input: string) => Effect.Effect<any>> | undefined;
    readonly content: (
      uri: string,
      ...params: Array<any>
    ) => Effect.Effect<ReadResourceResult | string | Uint8Array, E, R>;
    readonly annotations?: Context.Context<never> | undefined;
  }) {
    const services = yield* Effect.context<any>();
    const registry = yield* McpServer;
    const decode = S.decodeUnknownEffect(schema);
    const template = ResourceTemplate.make({
      ...options,
      uriTemplate: uriPath,
      annotations: options!,
    });
    const completions: Record<string, (input: string) => Effect.Effect<CompleteResult, InternalError>> = {};
    for (const [param, handle] of Object.entries(options.completion ?? {})) {
      const encodeArray = S.encodeUnknownEffect(S.Array(params[param]));

      completions[param] = (input: string) =>
        handle(input).pipe(
          Effect.flatMap(encodeArray),
          Effect.map((values) => ({
            completion: {
              values: values as Array<string>,
              total: values.length,
              hasMore: false,
            },
          })),
          Effect.catchCause((cause) => {
            const prettyError = Cause.prettyErrors(cause)[0];
            return Effect.fail(InternalError.make({ message: prettyError.message }));
          }),
          Effect.provideContext(services)
        );
    }
    yield* registry.addResourceTemplate({
      template,
      routerPath,
      completions,
      annotations: options.annotations ?? Context.empty(),
      handle: (uri, params) =>
        decode(params).pipe(
          Effect.mapError((error) => InvalidParams.make({ message: error.message })),
          Effect.flatMap((params: any) =>
            options.content(uri, ...params).pipe(
              Effect.map((content) => resolveResourceContent(uri, content)),
              Effect.catchCause((cause) => {
                const prettyError = Cause.prettyErrors(cause)[0];
                return Effect.fail(InternalError.make({ message: prettyError.message }));
              })
            )
          ),
          Effect.provide(services)
        ),
    });
  });
} as any;

/**
 * Creates a layer that registers an MCP resource or resource template.
 *
 * **When to use**
 *
 * Use to compose resource registration into an MCP server layer.
 *
 * @see {@link registerResource} for the Effect-level resource registration API
 *
 * @category resources
 * @since 0.0.0
 */
export const resource: {
  <E, R>(options: {
    readonly uri: string;
    readonly name: string;
    readonly description?: string | undefined;
    readonly mimeType?: string | undefined;
    readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
    readonly priority?: number | undefined;
    readonly content: Effect.Effect<ReadResourceResult | string | Uint8Array, E, R>;
  }): Layer.Layer<never, never, Exclude<R, McpServerClient>>;
  <const Schemas extends ReadonlyArray<S.Constraint>>(
    segments: TemplateStringsArray,
    ...schemas: Schemas
  ): <E, R, const Completions extends Partial<ResourceCompletions<Schemas>> = {}>(options: {
    readonly name: string;
    readonly description?: string | undefined;
    readonly mimeType?: string | undefined;
    readonly audience?: ReadonlyArray<"user" | "assistant"> | undefined;
    readonly priority?: number | undefined;
    readonly completion?: ValidateCompletions<Completions, keyof ResourceCompletions<Schemas>> | undefined;
    readonly content: (
      uri: string,
      ...params: { readonly [K in keyof Schemas]: Schemas[K]["Type"] }
    ) => Effect.Effect<ReadResourceResult | string | Uint8Array, E, R>;
  }) => Layer.Layer<
    never,
    never,
    Exclude<
      | R
      | (Completions[keyof Completions] extends (input: string) => infer Ret
          ? Ret extends Effect.Effect<infer _A, infer _E, infer _R>
            ? _R
            : never
          : never),
      McpServerClient
    >
  >;
} = function () {
  if (arguments.length === 1) {
    return Layer.effectDiscard(registerResource(arguments[0])).pipe(Layer.provide(McpServer.layer));
  }
  const register = registerResource(...(arguments as any as [any, any]));
  return (options: any) => Layer.effectDiscard(register(options)).pipe(Layer.provide(McpServer.layer));
} as any;

/**
 * Registers an MCP prompt from an Effect program.
 *
 * **When to use**
 *
 * Use when you are already inside an Effect program with an `McpServer`
 * service and need to add a prompt handler directly.
 *
 * **Details**
 *
 * Parameters are decoded with the supplied schema, completion handlers encode
 * per-parameter suggestions, and string prompt content is converted into a user
 * text message.
 *
 * @see {@link prompt} for the layer-based prompt registration wrapper
 *
 * @category prompts
 * @since 0.0.0
 */
export const registerPrompt = <
  E,
  R,
  Params extends S.Struct.Fields = {},
  const Completions extends {
    readonly [K in keyof Params]?: (input: string) => Effect.Effect<Array<Params[K]>, any, any>;
  } = {},
>(options: {
  readonly name: string;
  readonly description?: string | undefined;
  readonly parameters?: Params | undefined;
  readonly completion?: ValidateCompletions<Completions, Extract<keyof Params, string>> | undefined;
  readonly content: (params: S.Struct.Type<Params>) => Effect.Effect<Array<PromptMessage> | string, E, R>;
  readonly annotations?: Context.Context<never> | undefined;
}): Effect.Effect<void, never, Exclude<S.Struct.DecodingServices<Params> | R, McpServerClient> | McpServer> => {
  const args = A.empty<PromptArgument>();
  const props: Params = options.parameters ?? ({} as Params);
  for (const [name, prop] of Object.entries(props)) {
    args.push({
      name,
      description: SchemaAST.resolveDescription(prop.ast),
      required: !SchemaAST.isOptional(prop.ast),
    });
  }
  const prompt = Prompt.make({
    name: options.name,
    description: options.description,
    arguments: args,
  });
  const decode = P.isNotUndefined(options.parameters)
    ? S.decodeEffect(S.Struct(props))
    : () => Effect.succeed({} as S.Struct.Type<Params>);
  const completion: Record<string, (input: string) => Effect.Effect<any>> = options.completion ?? {};
  return Effect.gen(function* () {
    const registry = yield* McpServer;
    const services = yield* Effect.context<Exclude<R | S.Struct.DecodingServices<Params>, McpServerClient>>();
    const completions: Record<
      string,
      (input: string) => Effect.Effect<CompleteResult, InternalError, McpServerClient>
    > = {};
    for (const [param, handle] of Object.entries(completion)) {
      const encodeArray = S.encodeEffect(S.Array(props[param]));
      const handler = (input: string) =>
        handle(input).pipe(
          Effect.flatMap(encodeArray),
          Effect.map((values) => ({
            completion: {
              values: values as Array<string>,
              total: values.length,
              hasMore: false,
            },
          })),
          Effect.catchCause((cause) => {
            const prettyError = Cause.prettyErrors(cause)[0];
            return Effect.fail(InternalError.make({ message: prettyError.message }));
          }),
          Effect.provide(services)
        );
      completions[param] = handler as any;
    }
    const handlePrompt = (
      params: Record<string, string>
    ): Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient> =>
      decode(params as S.Struct.Encoded<Params>).pipe(
        Effect.mapError((error) => InvalidParams.make({ message: error.message })),
        Effect.flatMap((params) => options.content(params)),
        Effect.map((messages) => {
          messages =
            typeof messages === "string"
              ? [
                  {
                    role: "user",
                    content: TextContent.make({ text: messages }),
                  },
                ]
              : messages;
          return GetPromptResult.make({ messages, description: prompt.description });
        }),
        Effect.catchCause((cause) => {
          const prettyError = Cause.prettyErrors(cause)[0];
          return Effect.fail(InternalError.make({ message: prettyError.message }));
        }),
        Effect.provide(services)
      ) as unknown as Effect.Effect<GetPromptResult, InternalError | InvalidParams, McpServerClient>;

    yield* registry.addPrompt({
      prompt,
      completions,
      annotations: options.annotations ?? Context.empty(),
      handle: handlePrompt,
    });
  });
};

/**
 * Creates a layer that registers an MCP prompt.
 *
 * **When to use**
 *
 * Use to compose prompt registration into an MCP server layer.
 *
 * **Details**
 *
 * Parameters are decoded with the supplied schema, completion handlers encode
 * per-parameter suggestions, and string prompt content is converted into a user
 * text message.
 *
 * @see {@link registerPrompt} for the Effect-level prompt registration API
 *
 * @category prompts
 * @since 0.0.0
 */
export const prompt = <
  E,
  R,
  Params extends S.Struct.Fields = {},
  const Completions extends {
    readonly [K in keyof Params]?: (input: string) => Effect.Effect<Array<Params[K]["Type"]>, any, any>;
  } = {},
>(options: {
  readonly name: string;
  readonly description?: string | undefined;
  readonly parameters?: Params | undefined;
  readonly completion?: ValidateCompletions<Completions, Extract<keyof Params, string>> | undefined;
  readonly content: (params: S.Struct.Type<Params>) => Effect.Effect<Array<PromptMessage> | string, E, R>;
  readonly annotations?: Context.Context<never> | undefined;
}): Layer.Layer<never, never, Exclude<S.Struct.DecodingServices<Params> | R, McpServerClient>> =>
  Layer.effectDiscard(registerPrompt(options)).pipe(Layer.provide(McpServer.layer));

/**
 * Collects structured input from the current MCP client and decodes the
 * accepted response with `schema`.
 *
 * **Details**
 *
 * Accepted content is decoded with the supplied schema, declined requests fail
 * with `ElicitationDeclined`, and canceled requests interrupt the effect.
 *
 * @category elicitation
 * @since 0.0.0
 */
export const elicit: <Sch extends S.ConstraintEncoder<Record<string, unknown>, unknown>>(options: {
  readonly message: string;
  readonly schema: Sch;
}) => Effect.Effect<Sch["Type"], ElicitationDeclined, McpServerClient | Sch["DecodingServices"]> = Effect.fnUntraced(
  function* <Sch extends S.ConstraintEncoder<Record<string, unknown>, unknown>>(options: {
    readonly message: string;
    readonly schema: Sch;
  }) {
    const { getClient } = yield* McpServerClient;
    const client = yield* getClient;
    const schema = options.schema;
    const request = Elicit.payloadSchema.make({
      message: options.message,
      requestedSchema: Tool.getJsonSchemaFromSchema(schema),
    });
    const res = yield* client["elicitation/create"](request).pipe(
      Effect.catchCause((cause) => Effect.fail(ElicitationDeclined.make({ cause: Cause.squash(cause), request })))
    );
    switch (res.action) {
      case "accept":
        return yield* Effect.orDie(S.decodeUnknownEffect(schema)(res.content));
      case "cancel":
        return yield* Effect.interrupt;
      case "decline":
        return yield* ElicitationDeclined.make({ request });
    }
  },
  Effect.scoped
);

/**
 * Accesses the current client's capabilities.
 *
 * @category utilities
 * @since 0.0.0
 */
export const clientCapabilities: Effect.Effect<ClientCapabilities, never, McpServerClient> = McpServerClient.useSync(
  (_) => _.initializePayload.capabilities
);

// -----------------------------------------------------------------------------
// Internal
// -----------------------------------------------------------------------------

const makeUriMatcher = <A>() => {
  const router = FindMyWay.make<A>({
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
    caseSensitive: true,
  });
  const add = (uri: string, value: A) => {
    router.on("GET", uri as any, value);
  };
  const find = (uri: string) => router.find("GET", uri);

  return { add, find } as const;
};

const compileUriTemplate = (segments: TemplateStringsArray, ...schemas: ReadonlyArray<S.Constraint>) => {
  let routerPath = segments[0].replace(":", "::");
  let uriPath = segments[0];
  const params: Record<string, S.Top> = {};
  let pathSchema = S.Tuple([]) as S.Top;
  if (schemas.length > 0) {
    const arr: Array<S.Top> = [];
    for (let i = 0; i < schemas.length; i++) {
      const toCodecStringTree = S.toCodecStringTree(schemas[i]);
      const segment = segments[i + 1];
      const key = String(i);
      arr.push(toCodecStringTree);
      routerPath += `:${key}${segment.replace(":", "::")}`;
      const schema = schemas[i];
      const paramName = isParam(schema) ? (schema as Param<string, S.Top>).name : `param${key}`;
      params[paramName] = toCodecStringTree;
      uriPath += `{${paramName}}${segment}`;
    }
    pathSchema = S.Tuple(arr);
  }
  return {
    routerPath,
    uriPath,
    schema: pathSchema,
    params,
  } as const;
};

const layerHandlers = (
  serverInfo: {
    readonly name: string;
    readonly version: string;
    readonly extensions?: Record<`${string}/${string}`, unknown> | undefined;
  },
  options: {
    readonly clientSessions: Map<string, typeof Initialize.payloadSchema.Type>;
  }
) =>
  ClientRpcs.toLayer(
    Effect.gen(function* () {
      const server = yield* McpServer;
      let currentLogLevel = yield* CurrentLogLevel;

      return ClientRpcs.of({
        // Requests
        ping: () => Effect.succeed({}),
        initialize(params, { client }) {
          const requestedVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(params.protocolVersion)
            ? params.protocolVersion
            : LATEST_PROTOCOL_VERSION;
          if (requestedVersion !== params.protocolVersion) {
            params = {
              ...params,
              protocolVersion: requestedVersion,
            };
          }
          const capabilities: Types.DeepMutable<ServerCapabilities> = {
            completions: {},
          };
          if (server.tools.length > 0) {
            capabilities.tools = { listChanged: true };
          }
          if (server.resources.length > 0 || server.resourceTemplates.length > 0) {
            capabilities.resources = {
              listChanged: true,
              subscribe: false,
            };
          }
          if (server.prompts.length > 0) {
            capabilities.prompts = { listChanged: true };
          }
          if (P.isNotUndefined(serverInfo.extensions)) {
            capabilities.extensions = serverInfo.extensions as any;
          }
          return Effect.withFiber((fiber) => {
            const httpRequest = Context.getOrUndefined(fiber.context, HttpServerRequest.HttpServerRequest);
            if (P.isNotUndefined(httpRequest)) {
              return Random.nextInt.pipe(
                Effect.map((id) => {
                  const sessionId = String(id);
                  options.clientSessions.set(sessionId, params);
                  appendPreResponseHandlerUnsafe(
                    httpRequest,
                    (_req: HttpServerRequest.HttpServerRequest, res: HttpServerResponse.HttpServerResponse) =>
                      Effect.succeed(
                        HttpServerResponse.setHeaders(res, {
                          [mcpSessionIdHeader]: sessionId,
                          [mcpProtocolVersionHeader]: requestedVersion,
                        })
                      )
                  );
                  return {
                    capabilities,
                    serverInfo,
                    protocolVersion: requestedVersion,
                  };
                })
              );
            } else {
              options.clientSessions.set(String(client.id), params);
            }
            return Effect.succeed({
              capabilities,
              serverInfo,
              protocolVersion: requestedVersion,
            });
          });
        },
        "completion/complete": (r) =>
          server.completion(r).pipe(Effect.provideService(CurrentLogLevel, currentLogLevel)),
        "logging/setLevel": ({ level }) =>
          Effect.sync(() => {
            switch (level) {
              case "notice":
              case "info":
                currentLogLevel = "Info";
                break;
              case "error":
                currentLogLevel = "Error";
                break;
              case "debug":
                currentLogLevel = "Debug";
                break;
              case "warning":
                currentLogLevel = "Warn";
                break;
              case "critical":
              case "alert":
              case "emergency":
                currentLogLevel = "Fatal";
                break;
            }
          }),
        "prompts/get": (r) => server.getPromptResult(r).pipe(Effect.provideService(CurrentLogLevel, currentLogLevel)),
        "prompts/list": (_, { client, headers }) =>
          Effect.sync(() => {
            const initialized = getInitializedClient(options.clientSessions, client.id, headers);
            return ListPromptsResult.make({ prompts: filterByClient(initialized, server.prompts, "prompt") });
          }),
        "resources/list": (_, { client, headers }) =>
          Effect.sync(() => {
            const initialized = getInitializedClient(options.clientSessions, client.id, headers);
            return ListResourcesResult.make({ resources: filterByClient(initialized, server.resources, "resource") });
          }),
        "resources/read": ({ uri }) =>
          server.findResource(uri).pipe(Effect.provideService(CurrentLogLevel, currentLogLevel)),
        "resources/subscribe": () => InternalError.notImplemented,
        "resources/unsubscribe": () => InternalError.notImplemented,
        "resources/templates/list": (_, { client, headers }) =>
          Effect.sync(() => {
            const initialized = getInitializedClient(options.clientSessions, client.id, headers);
            return ListResourceTemplatesResult.make({
              resourceTemplates: filterByClient(initialized, server.resourceTemplates, "template"),
            });
          }),
        "tools/call": (r) => server.callTool(r).pipe(Effect.provideService(CurrentLogLevel, currentLogLevel)),
        "tools/list": (_, { client, headers }) =>
          Effect.sync(() => {
            const initialized = getInitializedClient(options.clientSessions, client.id, headers);
            return ListToolsResult.make({
              tools: filterByClient(initialized, server.tools, "tool"),
            });
          }),

        // Notifications
        "notifications/cancelled": (_) => Effect.void,
        "notifications/initialized": (_) => Effect.void,
        "notifications/progress": (_) => Effect.void,
        "notifications/roots/list_changed": (_) => Effect.void,
      });
    })
  );

const resolveResourceContent = (uri: string, content: ReadResourceResult | string | Uint8Array): ReadResourceResult => {
  if (typeof content === "string") {
    return {
      contents: [
        {
          uri,
          text: content,
        },
      ],
    };
  } else if (content instanceof Uint8Array) {
    return {
      contents: [
        {
          uri,
          blob: content,
        },
      ],
    };
  }
  return content;
};

const filterByClient = <
  Elem extends {
    readonly annotations: Context.Context<never>;
  },
  Part extends keyof Elem,
>(
  client: typeof Initialize.payloadSchema.Type | undefined,
  items: ReadonlyArray<Elem>,
  prop: Part
): Array<Elem[Part]> => {
  if (!P.isNotUndefined(client)) {
    return A.map(items, (item) => item[prop]);
  }
  const out = A.empty<Elem[Part]>();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const enabledWhen = Context.getOrUndefined(item.annotations, EnabledWhen);
    if (!P.isNotUndefined(enabledWhen) || enabledWhen(client)) {
      out.push(item[prop]);
    }
  }
  return out;
};

const getInitializedClient = (
  sessions: Map<string, typeof Initialize.payloadSchema.Type>,
  clientId: number,
  headers: Headers.Headers
) => {
  const sessionId = headers[mcpSessionIdHeader];
  if (sessionId === undefined) {
    return sessions.get(String(clientId));
  }
  return sessions.get(sessionId);
};
