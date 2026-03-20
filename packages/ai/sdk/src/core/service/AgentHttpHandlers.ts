import type { ServiceMap } from "effect";
import { Cause, Effect, Stream } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { AgentRuntime } from "../AgentRuntime.js";
import type { AgentSdkError } from "../Errors.js";
import {
  normalizeAccountInfo,
  normalizeModelInfoList,
  normalizeQueryResultOutput,
  normalizeSlashCommandList,
} from "../internal/normalize.js";
import type { QueryHandle } from "../Query.js";
import { collectResultSuccess } from "../QueryResult.js";
import { type QuerySupervisorError, QuerySupervisorStats } from "../QuerySupervisor.js";
import type { SDKUserMessage } from "../Schema/Message.js";
import type {
  QueryInput as QueryInputType,
  SessionCreateOutput as SessionCreateOutputType,
} from "../Schema/Service.js";
import { SessionCreateOutput } from "../Schema/Service.js";
import { SessionPool } from "../SessionPool.js";
import { AgentHttpApi } from "./AgentHttpApi.js";
import { AgentServerAccess } from "./AgentServerAccess.js";
import { SessionPoolUnavailableError } from "./SessionErrors.js";
import { resolveRequestTenant } from "./TenantAccess.js";

type AgentRuntimeService = ServiceMap.Service.Shape<typeof AgentRuntime>;
type SessionPoolService = ServiceMap.Service.Shape<typeof SessionPool>;

const textEncoder = new TextEncoder();
const encodeSsePayload = S.encodeUnknownOption(S.UnknownFromJsonString);

const toSseChunk = (data: unknown, event?: string) => {
  const payload = O.getOrElse(encodeSsePayload(data), () => String(data));
  const eventLine = event === undefined ? "" : `event: ${event}\n`;
  return textEncoder.encode(`${eventLine}data: ${payload}\n\n`);
};

const toSseStream = <E>(stream: Stream.Stream<unknown, E>) =>
  stream.pipe(
    Stream.map((message) => toSseChunk(message)),
    Stream.catchCause((cause) => Stream.fromIterable([toSseChunk({ error: Cause.pretty(cause) }, "error")]))
  );

const toAsyncIterable = (messages: ReadonlyArray<SDKUserMessage>): AsyncIterable<SDKUserMessage> => ({
  async *[Symbol.asyncIterator]() {
    for (const message of messages) {
      yield message;
    }
  },
});

const toPrompt = (input: QueryInputType): string | AsyncIterable<SDKUserMessage> =>
  P.isString(input.prompt) ? input.prompt : toAsyncIterable(input.prompt);

const withProbeHandle = <A>(
  runtime: AgentRuntimeService,
  use: (handle: QueryHandle) => Effect.Effect<A, AgentSdkError>
): Effect.Effect<A, AgentSdkError | QuerySupervisorError> =>
  Effect.scoped(
    Effect.acquireUseRelease(runtime.queryRaw(" ", {}), use, (handle) =>
      Effect.all([handle.closeInput, handle.interrupt], {
        concurrency: "unbounded",
        discard: true,
      }).pipe(Effect.ignore)
    )
  );

const sseHeaders = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache",
  connection: "keep-alive",
};

const authorizeRequest = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    const access = yield* AgentServerAccess;
    yield* access.authorizeRequest;
    return yield* effect;
  });

/**
 * @since 0.0.0
 * @category Integration
 */
export const layer = HttpApiBuilder.group(AgentHttpApi, "agent", (handlers) =>
  Effect.gen(function* () {
    const runtime = yield* AgentRuntime;
    const poolOption = yield* Effect.serviceOption(SessionPool);

    const requirePool = <A, E, R>(
      use: (pool: SessionPoolService) => Effect.Effect<A, E, R>
    ): Effect.Effect<A, E | SessionPoolUnavailableError, R> =>
      O.isSome(poolOption)
        ? use(poolOption.value)
        : Effect.fail(
            SessionPoolUnavailableError.make({
              message: "SessionPool is not configured for this server",
            })
          );

    return handlers
      .handle("query", ({ payload }) =>
        authorizeRequest(
          collectResultSuccess(runtime.stream(toPrompt(payload), payload.options)).pipe(
            Effect.scoped,
            Effect.flatMap((result) =>
              normalizeQueryResultOutput({
                result: result.result,
                metadata: result,
              })
            )
          )
        )
      )
      .handle("stream", ({ query }) =>
        authorizeRequest(
          Effect.succeed(HttpServerResponse.stream(toSseStream(runtime.stream(query.prompt)), { headers: sseHeaders }))
        )
      )
      .handle("streamPost", ({ payload }) =>
        authorizeRequest(
          Effect.succeed(
            HttpServerResponse.stream(toSseStream(runtime.stream(toPrompt(payload), payload.options)), {
              headers: sseHeaders,
            })
          )
        )
      )
      .handle("stats", () =>
        authorizeRequest(runtime.stats.pipe(Effect.map((stats) => new QuerySupervisorStats(stats))))
      )
      .handle("interruptAll", () => authorizeRequest(runtime.interruptAll))
      .handle("models", () =>
        authorizeRequest(
          withProbeHandle(runtime, (handle) => handle.supportedModels).pipe(Effect.flatMap(normalizeModelInfoList))
        )
      )
      .handle("commands", () =>
        authorizeRequest(
          withProbeHandle(runtime, (handle) => handle.supportedCommands).pipe(Effect.flatMap(normalizeSlashCommandList))
        )
      )
      .handle("account", () =>
        authorizeRequest(
          withProbeHandle(runtime, (handle) => handle.accountInfo).pipe(Effect.flatMap(normalizeAccountInfo))
        )
      )
      .handle("createSession", ({ payload }) =>
        authorizeRequest(
          requirePool((pool) =>
            resolveRequestTenant(payload.tenant).pipe(
              Effect.flatMap((tenant) =>
                pool.create(payload.options, tenant).pipe(
                  Effect.flatMap((handle) => handle.sessionId),
                  Effect.map((sessionId): SessionCreateOutputType => new SessionCreateOutput({ sessionId }))
                )
              )
            )
          )
        )
      )
      .handle("listSessions", ({ query }) =>
        authorizeRequest(
          requirePool((pool) =>
            resolveRequestTenant(query.tenant).pipe(Effect.flatMap((tenant) => pool.listByTenant(tenant)))
          )
        )
      )
      .handle("getSession", ({ params, query }) =>
        authorizeRequest(
          requirePool((pool) =>
            resolveRequestTenant(query.tenant).pipe(
              Effect.flatMap((tenant) =>
                pool.get(params.id, undefined, tenant).pipe(Effect.andThen(pool.info(params.id, tenant)))
              )
            )
          )
        )
      )
      .handle("sendSession", ({ params, payload }) =>
        authorizeRequest(
          requirePool((pool) =>
            resolveRequestTenant(payload.tenant).pipe(
              Effect.flatMap((tenant) =>
                pool.get(params.id, undefined, tenant).pipe(
                  Effect.flatMap((handle) => handle.send(payload.message)),
                  Effect.asVoid
                )
              )
            )
          )
        )
      )
      .handle("streamSession", ({ params, query }) =>
        authorizeRequest(
          requirePool((pool) =>
            resolveRequestTenant(query.tenant).pipe(
              Effect.flatMap((tenant) =>
                pool
                  .get(params.id, undefined, tenant)
                  .pipe(
                    Effect.map((handle) =>
                      HttpServerResponse.stream(toSseStream(handle.stream), { headers: sseHeaders })
                    )
                  )
              )
            )
          )
        )
      )
      .handle("closeSession", ({ params, query }) =>
        authorizeRequest(
          requirePool((pool) =>
            resolveRequestTenant(query.tenant).pipe(
              Effect.flatMap((tenant) => pool.close(params.id, tenant).pipe(Effect.asVoid))
            )
          )
        )
      );
  })
);
