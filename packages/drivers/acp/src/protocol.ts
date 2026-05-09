/**
 * Patched ACP JSON-RPC transport primitives.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AcpId } from "@beep/identity";
import { Deferred, Effect, HashMap, HashSet, Inspectable, Queue, Ref, Stream } from "effect";
import type * as Cause from "effect/Cause";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as Scope from "effect/Scope";
import type * as Stdio from "effect/Stdio";
import * as RpcClient from "effect/unstable/rpc/RpcClient";
import * as RpcClientError from "effect/unstable/rpc/RpcClientError";
import type * as RpcMessage from "effect/unstable/rpc/RpcMessage";
import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";
import * as RpcServer from "effect/unstable/rpc/RpcServer";
import { CLIENT_METHODS } from "./_generated/meta.gen.ts";
import * as AcpSchema from "./_generated/schema.gen.ts";
import * as AcpError from "./errors.ts";

const $I = $AcpId.create("protocol");
const isAcpError = S.is(AcpError.AcpError);
const isAcpRequestError = S.is(AcpError.AcpRequestError);

/**
 * Structured log event emitted by the ACP protocol adapter.
 *
 * @example
 * ```ts
 * import type { AcpProtocolLogEvent } from "@beep/acp/protocol"
 *
 * const event: AcpProtocolLogEvent = {
 *   direction: "incoming",
 *   stage: "raw",
 *   payload: "{}"
 * }
 * console.log(event.stage)
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export class AcpProtocolLogEvent extends S.Class<AcpProtocolLogEvent>($I`AcpProtocolLogEvent`)(
  {
    direction: S.Union([S.Literal("incoming"), S.Literal("outgoing")]),
    payload: S.Unknown,
    stage: S.Union([S.Literal("raw"), S.Literal("decoded"), S.Literal("decode_failed")]),
  },
  $I.annote("AcpProtocolLogEvent", {
    description: "Structured log event emitted by the ACP protocol adapter.",
  })
) {}

/**
 * Schema-backed ACP protocol logging flags.
 *
 * @example
 * ```ts
 * import { AcpProtocolLoggingOptions } from "@beep/acp/protocol"
 *
 * const options = new AcpProtocolLoggingOptions({ logIncoming: true })
 * console.log(options.logIncoming)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AcpProtocolLoggingOptions extends S.Class<AcpProtocolLoggingOptions>($I`AcpProtocolLoggingOptions`)(
  {
    logIncoming: S.optionalKey(S.Boolean),
    logOutgoing: S.optionalKey(S.Boolean),
  },
  $I.annote("AcpProtocolLoggingOptions", {
    description: "Schema-backed ACP protocol logging flags.",
  })
) {}

const AcpSessionUpdateIncomingNotification = S.TaggedStruct("SessionUpdate", {
  method: S.Literal(CLIENT_METHODS.session_update),
  params: AcpSchema.SessionNotification,
});

const AcpElicitationCompleteIncomingNotification = S.TaggedStruct("ElicitationComplete", {
  method: S.Literal(CLIENT_METHODS.session_elicitation_complete),
  params: AcpSchema.ElicitationCompleteNotification,
});

const AcpExtIncomingNotification = S.TaggedStruct("ExtNotification", {
  method: S.String,
  params: S.Unknown,
});

/**
 * Schema for notifications decoded from the ACP peer stream.
 *
 * @example
 * ```ts
 * import { AcpIncomingNotification } from "@beep/acp/protocol"
 *
 * console.log(AcpIncomingNotification.ast)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AcpIncomingNotification = S.Union([
  AcpSessionUpdateIncomingNotification,
  AcpElicitationCompleteIncomingNotification,
  AcpExtIncomingNotification,
]).pipe(
  $I.annoteSchema("AcpIncomingNotification", {
    description: "Schema for notifications decoded from the ACP peer stream.",
  })
);

/**
 * Type for {@link AcpIncomingNotification}.
 *
 * @example
 * ```ts
 * import type { AcpIncomingNotification } from "@beep/acp/protocol"
 *
 * const tagOf = (notification: AcpIncomingNotification) => notification._tag
 * void tagOf
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AcpIncomingNotification = typeof AcpIncomingNotification.Type;

/**
 * Options used to create the patched ACP protocol.
 *
 * @example
 * ```ts
 * import * as HashSet from "effect/HashSet"
 * import type { AcpPatchedProtocolOptions } from "@beep/acp/protocol"
 *
 * const methods = HashSet.empty<string>()
 * const hasServerMethods = (options: Omit<AcpPatchedProtocolOptions, "stdio">) =>
 *   HashSet.size(options.serverRequestMethods) >= HashSet.size(methods)
 * void hasServerMethods
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export interface AcpPatchedProtocolOptions extends AcpProtocolLoggingOptions {
  readonly logger?: (event: AcpProtocolLogEvent) => Effect.Effect<void, never>;
  readonly onExtRequest?: (method: string, params: unknown) => Effect.Effect<unknown, AcpError.AcpError, never>;
  readonly onNotification?: (notification: AcpIncomingNotification) => Effect.Effect<void, AcpError.AcpError, never>;
  readonly onTermination?: (error: AcpError.AcpError) => Effect.Effect<void, never, never>;
  readonly serverRequestMethods: HashSet.HashSet<string>;
  readonly stdio: Stdio.Stdio;
  readonly terminationError?: Effect.Effect<AcpError.AcpError>;
}

/**
 * Runtime protocol handles used by ACP clients and agents.
 *
 * @example
 * ```ts
 * import type { AcpPatchedProtocol } from "@beep/acp/protocol"
 *
 * const notificationsOf = (protocol: AcpPatchedProtocol) => protocol.incoming
 * void notificationsOf
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export interface AcpPatchedProtocol {
  readonly clientProtocol: RpcClient.Protocol["Service"];
  readonly incoming: Stream.Stream<AcpIncomingNotification>;
  readonly notify: (method: string, payload: unknown) => Effect.Effect<void, AcpError.AcpError>;
  readonly request: (method: string, payload: unknown) => Effect.Effect<unknown, AcpError.AcpError>;
  readonly serverProtocol: RpcServer.Protocol["Service"];
}

const decodeSessionUpdate = S.decodeUnknownEffect(AcpSchema.SessionNotification);
const decodeElicitationComplete = S.decodeUnknownEffect(AcpSchema.ElicitationCompleteNotification);
const parserFactory = RpcSerialization.ndJsonRpc();
const textDecoder = new TextDecoder();

const textFromWire = (value: string | Uint8Array): string => (P.isString(value) ? value : textDecoder.decode(value));

/**
 * Builds the patched ACP protocol over an Effect `Stdio` transport.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Stdio } from "effect"
 * import * as HashSet from "effect/HashSet"
 * import { makeAcpPatchedProtocol } from "@beep/acp/protocol"
 *
 * const program = Effect.flatMap(Effect.service(Stdio.Stdio), (stdio) =>
 *   makeAcpPatchedProtocol({
 *     stdio,
 *     serverRequestMethods: HashSet.empty()
 *   })
 * )
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeAcpPatchedProtocol = Effect.fn($I`makeAcpPatchedProtocol`)(function* (
  options: AcpPatchedProtocolOptions
): Effect.fn.Return<AcpPatchedProtocol, never, Scope.Scope> {
  const parser = parserFactory.makeUnsafe();
  const serverQueue = yield* Queue.unbounded<RpcMessage.FromClientEncoded>();
  const clientQueue = yield* Queue.unbounded<RpcMessage.FromServerEncoded>();
  const notificationQueue = yield* Queue.unbounded<AcpIncomingNotification>();
  const disconnects = yield* Queue.unbounded<number>();
  const outgoing = yield* Queue.unbounded<string | Uint8Array, Cause.Done<void>>();
  const nextRequestId = yield* Ref.make(1n);
  const terminationHandled = yield* Ref.make(false);
  const extPending = yield* Ref.make(HashMap.empty<string, Deferred.Deferred<unknown, AcpError.AcpError>>());

  const logProtocol = (event: AcpProtocolLogEvent) => {
    if (event.direction === "incoming" && options.logIncoming !== true) {
      return Effect.void;
    }
    if (event.direction === "outgoing" && options.logOutgoing !== true) {
      return Effect.void;
    }
    return options.logger?.(event) ?? Effect.logDebug("ACP protocol event").pipe(Effect.annotateLogs({ event }));
  };

  const offerOutgoing = Effect.fn($I`offerOutgoing`)(function* (
    message: RpcMessage.FromClientEncoded | RpcMessage.FromServerEncoded
  ) {
    yield* logProtocol({
      direction: "outgoing",
      payload: message,
      stage: "decoded",
    });

    const encoded = yield* Effect.try({
      try: () => parser.encode(message),
      catch: (cause) =>
        new AcpError.AcpProtocolParseError({
          cause,
          detail: "Failed to encode ACP message",
        }),
    });

    if (encoded !== undefined && (!P.isString(encoded) || encoded.length > 0)) {
      yield* logProtocol({
        direction: "outgoing",
        payload: textFromWire(encoded),
        stage: "raw",
      });

      yield* Queue.offer(outgoing, encoded).pipe(Effect.asVoid);
    }
  });

  const resolveExtPending = (
    requestId: string,
    onFound: (deferred: Deferred.Deferred<unknown, AcpError.AcpError>) => Effect.Effect<void>
  ) =>
    Ref.modify(extPending, (pending) => {
      const deferred = HashMap.get(pending, requestId);
      if (O.isNone(deferred)) {
        return [Effect.void, pending] as const;
      }
      return [onFound(deferred.value), HashMap.remove(pending, requestId)] as const;
    }).pipe(Effect.flatten);

  const removeExtPending = (requestId: string) =>
    Ref.update(extPending, (pending) => HashMap.remove(pending, requestId));

  const completeExtPendingFailure = (requestId: string, error: AcpError.AcpError) =>
    resolveExtPending(requestId, (deferred) => Deferred.fail(deferred, error));

  const completeExtPendingSuccess = (requestId: string, value: unknown) =>
    resolveExtPending(requestId, (deferred) => Deferred.succeed(deferred, value));

  const failAllExtPending = (error: AcpError.AcpError) =>
    Ref.getAndSet(extPending, HashMap.empty()).pipe(
      Effect.flatMap((pending) =>
        Effect.forEach(HashMap.values(pending), (deferred) => Deferred.fail(deferred, error), {
          discard: true,
        })
      )
    );

  const dispatchNotification = (notification: AcpIncomingNotification) =>
    Queue.offer(notificationQueue, notification).pipe(
      Effect.andThen(
        options.onNotification !== undefined
          ? options.onNotification(notification).pipe(Effect.catch(() => Effect.void))
          : Effect.void
      ),
      Effect.asVoid
    );

  const emitClientProtocolError = (error: AcpError.AcpError) =>
    Queue.offer(clientQueue, {
      _tag: "ClientProtocolError",
      error: new RpcClientError.RpcClientError({
        reason: new RpcClientError.RpcClientDefect({
          cause: error,
          message: error.message,
        }),
      }),
    }).pipe(Effect.asVoid);

  const handleTermination = (classify: () => Effect.Effect<AcpError.AcpError | undefined>) =>
    Ref.modify(terminationHandled, (handled) => {
      if (handled) {
        return [Effect.void, true] as const;
      }
      return [
        Effect.gen(function* () {
          yield* Queue.offer(disconnects, 0);
          const error = yield* classify();
          if (error === undefined) {
            return;
          }
          yield* failAllExtPending(error);
          yield* emitClientProtocolError(error);
          if (options.onTermination !== undefined) {
            yield* options.onTermination(error);
          }
        }),
        true,
      ] as const;
    }).pipe(Effect.flatten);

  const respondWithSuccess = (requestId: string, value: unknown) =>
    offerOutgoing({
      _tag: "Exit",
      exit: {
        _tag: "Success",
        value,
      },
      requestId,
    });

  const respondWithError = (requestId: string, error: AcpError.AcpRequestError) =>
    offerOutgoing({
      _tag: "Exit",
      exit: {
        _tag: "Failure",
        cause: [
          {
            _tag: "Fail",
            error: error.toProtocolError(),
          },
        ],
      },
      requestId,
    });

  const handleExtRequest = (message: RpcMessage.RequestEncoded) => {
    if (options.onExtRequest === undefined) {
      return respondWithError(message.id, AcpError.AcpRequestError.methodNotFound(message.tag));
    }
    return options.onExtRequest(message.tag, message.payload).pipe(
      Effect.matchEffect({
        onFailure: (error) => respondWithError(message.id, normalizeToRequestError(error)),
        onSuccess: (value) => respondWithSuccess(message.id, value),
      })
    );
  };

  const handleRequestEncoded = (message: RpcMessage.RequestEncoded) => {
    if (message.id === "") {
      if (message.tag === CLIENT_METHODS.session_update) {
        return decodeSessionUpdate(message.payload).pipe(
          Effect.map(
            (params) =>
              ({
                _tag: "SessionUpdate",
                method: CLIENT_METHODS.session_update,
                params,
              }) satisfies AcpIncomingNotification
          ),
          Effect.mapError(
            (cause) =>
              new AcpError.AcpProtocolParseError({
                cause,
                detail: `Invalid ${CLIENT_METHODS.session_update} notification payload`,
              })
          ),
          Effect.flatMap(dispatchNotification)
        );
      }
      if (message.tag === CLIENT_METHODS.session_elicitation_complete) {
        return decodeElicitationComplete(message.payload).pipe(
          Effect.map(
            (params) =>
              ({
                _tag: "ElicitationComplete",
                method: CLIENT_METHODS.session_elicitation_complete,
                params,
              }) satisfies AcpIncomingNotification
          ),
          Effect.mapError(
            (cause) =>
              new AcpError.AcpProtocolParseError({
                cause,
                detail: `Invalid ${CLIENT_METHODS.session_elicitation_complete} notification payload`,
              })
          ),
          Effect.flatMap(dispatchNotification)
        );
      }
      return dispatchNotification({
        _tag: "ExtNotification",
        method: message.tag,
        params: message.payload,
      });
    }

    if (!HashSet.has(options.serverRequestMethods, message.tag)) {
      return handleExtRequest(message).pipe(
        Effect.catch(() => respondWithError(message.id, AcpError.AcpRequestError.internalError())),
        Effect.asVoid
      );
    }

    return Queue.offer(serverQueue, message).pipe(Effect.asVoid);
  };

  const handleExitEncoded = (message: RpcMessage.ResponseExitEncoded) =>
    Ref.get(extPending).pipe(
      Effect.flatMap((pending) => {
        if (!HashMap.has(pending, message.requestId)) {
          return Queue.offer(clientQueue, message).pipe(Effect.asVoid);
        }
        if (message.exit._tag === "Success") {
          return completeExtPendingSuccess(message.requestId, message.exit.value);
        }
        const failure = message.exit.cause.find((entry) => entry._tag === "Fail");
        if (failure !== undefined && isProtocolError(failure.error)) {
          return completeExtPendingFailure(
            message.requestId,
            AcpError.AcpRequestError.fromProtocolError(failure.error)
          );
        }
        return completeExtPendingFailure(
          message.requestId,
          AcpError.AcpRequestError.internalError("Extension request failed")
        );
      })
    );

  const routeDecodedMessage = (
    message: RpcMessage.FromClientEncoded | RpcMessage.FromServerEncoded
  ): Effect.Effect<void, AcpError.AcpError> => {
    switch (message._tag) {
      case "Request":
        return handleRequestEncoded(message);
      case "Exit":
        return handleExitEncoded(message);
      case "Chunk":
        return Ref.get(extPending).pipe(
          Effect.flatMap((pending) =>
            HashMap.has(pending, message.requestId)
              ? completeExtPendingFailure(
                  message.requestId,
                  AcpError.AcpRequestError.internalError("Streaming extension responses are not supported")
                )
              : Queue.offer(clientQueue, message).pipe(Effect.asVoid)
          )
        );
      case "Defect":
      case "ClientProtocolError":
      case "Pong":
        return Queue.offer(clientQueue, message).pipe(Effect.asVoid);
      case "Ack":
      case "Interrupt":
      case "Ping":
      case "Eof":
        return Queue.offer(serverQueue, message).pipe(Effect.asVoid);
    }
  };

  yield* options.stdio.stdin.pipe(
    Stream.runForEach((data) =>
      logProtocol({
        direction: "incoming",
        payload: textFromWire(data),
        stage: "raw",
      }).pipe(
        Effect.flatMap(() =>
          Effect.try({
            try: () =>
              parser.decode(data) as ReadonlyArray<RpcMessage.FromClientEncoded | RpcMessage.FromServerEncoded>,
            catch: (cause) =>
              new AcpError.AcpProtocolParseError({
                cause,
                detail: "Failed to decode ACP wire message",
              }),
          })
        ),
        Effect.tap((messages) =>
          logProtocol({
            direction: "incoming",
            payload: messages,
            stage: "decoded",
          })
        ),
        Effect.tapErrorTag("AcpProtocolParseError", (error) =>
          logProtocol({
            direction: "incoming",
            payload: {
              cause: error.cause,
              detail: error.detail,
            },
            stage: "decode_failed",
          })
        ),
        Effect.flatMap((messages) =>
          Effect.forEach(messages, routeDecodedMessage, {
            discard: true,
          })
        )
      )
    ),
    Effect.matchEffect({
      onFailure: (error) => {
        const normalized: AcpError.AcpError = isAcpError(error)
          ? error
          : new AcpError.AcpTransportError({
              cause: error,
              detail: Inspectable.toStringUnknown(error, 0),
            });
        return handleTermination(() => Effect.succeed(normalized));
      },
      onSuccess: () =>
        handleTermination(
          () =>
            options.terminationError ??
            Effect.succeed(
              new AcpError.AcpTransportError({
                cause: "ACP input stream ended",
                detail: "ACP input stream ended",
              })
            )
        ),
    }),
    Effect.forkScoped
  );

  yield* Stream.fromQueue(outgoing).pipe(Stream.run(options.stdio.stdout()), Effect.forkScoped);

  const clientProtocol = RpcClient.Protocol.of({
    run: Effect.fn($I`AcpClient_Protocol_run`)((_clientId, f) =>
      Stream.fromQueue(clientQueue).pipe(
        Stream.runForEach((message) => f(message)),
        Effect.forever
      )
    ),
    send: Effect.fn($I`AcpClient_Protocol_send`)((_clientId, request) =>
      offerOutgoing(request).pipe(Effect.mapError(toRpcClientError))
    ),
    supportsAck: true,
    supportsTransferables: false,
  });

  const serverProtocol = RpcServer.Protocol.of({
    clientIds: Effect.succeed(HashSet.make(0) as unknown as ReadonlySet<number>),
    disconnects,
    end: Effect.fn($I`AcpServer_Protocol_end`)((_clientId) => Queue.end(outgoing)),
    initialMessage: Effect.succeedNone,
    run: Effect.fn($I`AcpServer_Protocol_run`)((f) =>
      Stream.fromQueue(serverQueue).pipe(
        Stream.runForEach((message) => f(0, message)),
        Effect.forever
      )
    ),
    send: Effect.fn($I`AcpServer_Protocol_send`)((_clientId, response) => offerOutgoing(response).pipe(Effect.orDie)),
    supportsAck: true,
    supportsSpanPropagation: true,
    supportsTransferables: false,
  });

  const sendNotification = Effect.fn($I`sendNotification`)(function* (method: string, payload: unknown) {
    yield* offerOutgoing({
      _tag: "Request",
      headers: [],
      id: "",
      payload,
      tag: method,
    });
  });

  const sendRequest = Effect.fn($I`sendRequest`)(function* (method: string, payload: unknown) {
    const requestId = yield* Ref.modify(nextRequestId, (current) => [current, current + 1n] as const);
    const requestIdString = String(requestId);
    const deferred = yield* Deferred.make<unknown, AcpError.AcpError>();
    yield* Ref.update(extPending, (pending) => HashMap.set(pending, requestIdString, deferred));
    yield* offerOutgoing({
      _tag: "Request",
      headers: [],
      id: requestIdString,
      payload,
      tag: method,
    }).pipe(Effect.catch((error) => removeExtPending(requestIdString).pipe(Effect.andThen(Effect.fail(error)))));
    return yield* Deferred.await(deferred).pipe(Effect.onInterrupt(() => removeExtPending(requestIdString)));
  });

  return {
    clientProtocol,
    get incoming() {
      return Stream.fromQueue(notificationQueue);
    },
    notify: sendNotification,
    request: sendRequest,
    serverProtocol,
  } satisfies AcpPatchedProtocol;
});

function isProtocolError(value: unknown): value is { code: number; message: string; data?: unknown } {
  return (
    P.isObject(value) && "code" in value && P.isNumber(value.code) && "message" in value && P.isString(value.message)
  );
}

function normalizeToRequestError(error: AcpError.AcpError): AcpError.AcpRequestError {
  return isAcpRequestError(error) ? error : AcpError.AcpRequestError.internalError(error.message);
}

function toRpcClientError(error: AcpError.AcpError): RpcClientError.RpcClientError {
  return new RpcClientError.RpcClientError({
    reason: new RpcClientError.RpcClientDefect({
      cause: error,
      message: error.message,
    }),
  });
}
