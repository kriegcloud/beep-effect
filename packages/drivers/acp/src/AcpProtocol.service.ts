/**
 * Patched ACP JSON-RPC transport primitives.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AcpId } from "@beep/identity";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { A } from "@beep/utils";
import * as O from "@beep/utils/Option";
import * as Cause from "effect/Cause";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as FiberSet from "effect/FiberSet";
import { identity, pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as MutableHashSet from "effect/MutableHashSet";
import * as P from "effect/Predicate";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as RpcClient from "effect/rpc/RpcClient";
import * as RpcClientError from "effect/rpc/RpcClientError";
import * as RpcSerialization from "effect/rpc/RpcSerialization";
import * as RpcServer from "effect/rpc/RpcServer";
import * as S from "effect/Schema";
import * as Semaphore from "effect/Semaphore";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";
import { CLIENT_METHODS } from "./_generated/meta.gen.ts";
import * as AcpSchema from "./_generated/schema.gen.ts";
import * as AcpSchemaV1 from "./_generated/schema-v1.gen.ts";
import * as AcpError from "./Acp.errors.ts";
import * as AcpCompat from "./AcpCompat.models.ts";
import { fromJsonText } from "./AcpJson.codec.ts";
import { makeNdJsonRpcFrameDecoder } from "./internal/jsonrpc.ts";
import { isolateNotificationHandler } from "./internal/shared.ts";
import type * as PlatformError from "effect/PlatformError";
import type * as RpcMessage from "effect/rpc/RpcMessage";
import type * as Scope from "effect/Scope";
import type * as Stdio from "effect/Stdio";
import type { AcpWireMessage } from "./internal/jsonrpc.ts";

const $I = $AcpId.create("protocol");

const isAcpSchemaError = S.is(AcpSchema.Error);
const isAcpError = S.is(AcpError.AcpError);
// Typed Effect RPC ids are allocated as safe integers; anything else is not an RpcClient response.
const isEffectRpcRequestId = S.is(S.Int);

// CSF-017: every peer-fed queue is bounded. Notifications slide (dropping the oldest unread one)
// instead of suspending, so a consumer that never drains `incoming` cannot stall the reader.
const ACP_PROTOCOL_QUEUE_CAPACITY = 1_024;
const ACP_PROTOCOL_NOTIFICATION_CAPACITY = 1_024;
const ACP_PROTOCOL_DISCONNECT_QUEUE_CAPACITY = 16;
// Inbound extension requests run on their own fibers so a handler can await an outbound request
// whose response the reader still has to deliver. The bound keeps reader back-pressure.
const ACP_PROTOCOL_EXT_REQUEST_CONCURRENCY = 64;
const ACP_STDIO_CLIENT_ID = 0;

/**
 * First id allocated to typed Effect RPC requests.
 *
 * **Details**
 *
 * Typed RPC ids count up from here once per connection. The value stays inside signed int32,
 * because some ACP SDKs (the Kotlin SDK decodes ids as `Int`) do not answer larger ids, and far
 * above extension request ids, which count up from 1. The protocol forwards only responses with
 * safe-integer ids to the RPC client.
 *
 * **Example** (Allocate the first typed RPC id)
 *
 * ```ts
 * import { RPC_REQUEST_ID_START } from "@beep/acp/protocol"
 *
 * console.log(RPC_REQUEST_ID_START) // 1073741824
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const RPC_REQUEST_ID_START = 2 ** 30;

/**
 * Identity of an inbound ACP request, passed to request and extension handlers.
 *
 * **Details**
 *
 * `requestId` is the JSON-RPC id exactly as the peer sent it, so the number `1` and the string
 * `"1"` stay distinct.
 *
 * **Example** (Make a request context)
 *
 * ```ts
 * import { AcpRequestContext } from "@beep/acp/protocol"
 *
 * const context = AcpRequestContext.make({ method: "x/ping", requestId: 7 })
 * console.log(context.requestId) // 7
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AcpRequestContext extends S.Opaque<AcpRequestContext, { readonly brand: unique symbol }>()(
  S.Struct({
    method: S.String.annotateKey({
      description: "ACP method named by the inbound request.",
    }),
    requestId: AcpError.AcpRequestId.annotateKey({
      description: "JSON-RPC id of the inbound request, exactly as the peer sent it.",
    }),
  }).pipe(
    $I.annoteSchema("AcpRequestContext", {
      description: "Identity of an inbound ACP request, passed to request and extension handlers.",
    })
  )
) {}

/**
 * Handler for an inbound ACP request.
 *
 * **Example** (Echo handler)
 *
 * ```ts
 * import type { AcpRequestHandler } from "@beep/acp/protocol"
 * import * as Effect from "effect/Effect"
 *
 * const echo: AcpRequestHandler<string, string> = (request, context) =>
 *   Effect.succeed(`${context.method}: ${request}`)
 * console.log(echo)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export type AcpRequestHandler<Request, Response> = (
  request: Request,
  context: AcpRequestContext
) => Effect.Effect<Response, AcpError.AcpError>;

/**
 * Fallback handler for ACP extension requests.
 *
 * **Example** (Fallback request handler)
 *
 * ```ts
 * import type { AcpUnknownExtRequestHandler } from "@beep/acp/protocol"
 * import * as Effect from "effect/Effect";
 * const handler: AcpUnknownExtRequestHandler = (method, params, context) =>
 *   Effect.succeed({ method, params, requestId: context.requestId })
 * console.log(handler)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export type AcpUnknownExtRequestHandler = (
  method: string,
  params: unknown,
  context: AcpRequestContext
) => Effect.Effect<unknown, AcpError.AcpError>;

/**
 * Fallback handler for ACP extension notifications.
 *
 * **Example** (Fallback notification handler)
 *
 * ```ts
 * import type { AcpUnknownExtNotificationHandler } from "@beep/acp/protocol"
 * import * as Effect from "effect/Effect";
 * const handler: AcpUnknownExtNotificationHandler = (method) => Effect.sync(() => console.log(method))
 * console.log(handler)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export type AcpUnknownExtNotificationHandler = (
  method: string,
  params: unknown
) => Effect.Effect<void, AcpError.AcpError>;

/**
 * Common ACP extension-handler registration surface shared by agents and clients.
 *
 * **Example** (Register extension request)
 *
 * ```ts
 * import type { AcpExtensionRegistrars } from "@beep/acp/protocol"
 * import * as Effect from "effect/Effect";
 * import * as S from "effect/Schema"
 *
 * const registerPing = (registrars: AcpExtensionRegistrars) =>
 *   registrars.handleExtRequest("x/ping", S.Struct({ message: S.String }), ({ message }, context) =>
 *     Effect.succeed({ ok: message, requestId: context.requestId })
 *   )
 *
 * console.log(registerPing)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export interface AcpExtensionRegistrars {
  readonly handleExtNotification: <A, I>(
    method: string,
    payload: S.Codec<A, I>,
    handler: (payload: A) => Effect.Effect<void, AcpError.AcpError>
  ) => Effect.Effect<void>;
  readonly handleExtRequest: <A, I>(
    method: string,
    payload: S.Codec<A, I>,
    handler: AcpRequestHandler<A, unknown>
  ) => Effect.Effect<void>;
  readonly handleUnknownExtNotification: (handler: AcpUnknownExtNotificationHandler) => Effect.Effect<void>;
  readonly handleUnknownExtRequest: (handler: AcpUnknownExtRequestHandler) => Effect.Effect<void>;
}

/**
 * Standard I/O transport accepted by the ACP protocol.
 *
 * **Details**
 *
 * It is an Effect `Stdio` whose input stream may also fail with a classified `AcpError`, so a
 * process adapter can end the connection with, for example, an `AcpProcessExitedError` that
 * carries the peer's stderr tail. Every `Stdio.Stdio` is an `AcpStdio`.
 *
 * **Example** (Widen an Effect Stdio)
 *
 * ```ts
 * import type { AcpStdio } from "@beep/acp/protocol"
 * import type * as Stdio from "effect/Stdio"
 *
 * const widen = (stdio: Stdio.Stdio): AcpStdio => stdio
 * console.log(widen)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export type AcpStdio = Omit<Stdio.Stdio, "stdin"> & {
  readonly stdin: Stream.Stream<Uint8Array, PlatformError.PlatformError | AcpError.AcpError>;
};

/**
 * Callbacks that let tests observe the protocol's outgoing writer.
 *
 * **Details**
 *
 * `onOutgoingWriteAdmitted` runs after a response is admitted to the writer and before it is
 * queued. `onOutgoingWriterExit` runs when the writer completes, with whether the completion was
 * an intentional `serverProtocol.end`.
 *
 * **Example** (Observe writer exit)
 *
 * ```ts
 * import type { AcpPatchedProtocolTestHooks } from "@beep/acp/protocol"
 * import * as Effect from "effect/Effect"
 *
 * const hooks: AcpPatchedProtocolTestHooks = {
 *   onOutgoingWriterExit: (intentionalEnd) => Effect.sync(() => console.log(intentionalEnd)),
 * }
 * console.log(hooks)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export interface AcpPatchedProtocolTestHooks {
  readonly onOutgoingWriteAdmitted?: () => Effect.Effect<void>;
  readonly onOutgoingWriterExit?: (intentionalEnd: boolean) => Effect.Effect<void>;
}

/**
 * Re-export of the child-process termination classifier.
 *
 * **Details**
 *
 * A signal exit becomes `AcpProcessExitedError` with `signal`, an exit code becomes
 * `AcpProcessExitedError` with `code`, and any other exit-status failure becomes an
 * `AcpTransportError` for `read-process-exit-status`. Each error keeps the process id. Pass the
 * result as `terminationError` so an ended input stream reports how the peer process ended.
 *
 * **Example** (Classify a child process exit)
 *
 * ```ts
 * import { makeTerminationError } from "@beep/acp/protocol"
 * import * as Effect from "effect/Effect"
 * import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner"
 *
 * const error = makeTerminationError({
 *   exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(7)),
 *   pid: ChildProcessSpawner.ProcessId(42),
 * })
 * console.log(error)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export { makeTerminationError } from "./internal/stdio.ts";

type MinimalReadonlySet<T> = Iterable<T> & {
  readonly entries: () => IterableIterator<[T, T]>;
  readonly forEach: (callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void, thisArg?: unknown) => void;
  readonly has: (value: T) => boolean;
  readonly keys: () => IterableIterator<T>;
  readonly size: number;
  readonly values: () => IterableIterator<T>;
};

const singleValueSetIterator = <A>(value: A): IterableIterator<A> => {
  let isDone = false;
  const iterator: IterableIterator<A> = {
    [Symbol.iterator]: () => iterator,
    next: () => {
      if (isDone) {
        return {
          done: true,
          value: undefined,
        };
      }
      isDone = true;
      return {
        done: false,
        value,
      };
    },
  };
  return iterator;
};
const ACP_STDIO_CLIENT_IDS = {
  [Symbol.iterator]: () => singleValueSetIterator(ACP_STDIO_CLIENT_ID),
  entries: () => singleValueSetIterator<[number, number]>([ACP_STDIO_CLIENT_ID, ACP_STDIO_CLIENT_ID]),
  forEach: (callbackfn, thisArg?: unknown) => {
    callbackfn.call(thisArg, ACP_STDIO_CLIENT_ID, ACP_STDIO_CLIENT_ID, ACP_STDIO_CLIENT_IDS);
  },
  has: (value) => value === ACP_STDIO_CLIENT_ID,
  keys: () => singleValueSetIterator(ACP_STDIO_CLIENT_ID),
  size: 1,
  values: () => singleValueSetIterator(ACP_STDIO_CLIENT_ID),
} satisfies MinimalReadonlySet<number> as unknown as ReadonlySet<number>;

const AcpProtocolLogDirectionBase = LiteralKit(["incoming", "outgoing"]);
const AcpProtocolLogDirection = AcpProtocolLogDirectionBase.pipe(
  $I.annoteSchema("AcpProtocolLogDirection", {
    description: "Direction of an ACP protocol log event.",
  }),
  SchemaUtils.withLiteralKitStatics(AcpProtocolLogDirectionBase)
);
type AcpProtocolLogDirection = typeof AcpProtocolLogDirection.Type;
const AcpProtocolLogStageBase = LiteralKit(["raw", "decoded", "decode_failed"]);
const AcpProtocolLogStage = AcpProtocolLogStageBase.pipe(
  $I.annoteSchema("AcpProtocolLogStage", {
    description: "Processing stage represented by an ACP protocol log event.",
  }),
  SchemaUtils.withLiteralKitStatics(AcpProtocolLogStageBase)
);
type AcpProtocolLogStage = typeof AcpProtocolLogStage.Type;
type AcpProtocolLogEventMember<T extends AcpProtocolLogDirection> = {
  readonly direction: T;
  readonly payload: unknown;
  readonly stage: AcpProtocolLogStage;
};

/**
 * Structured log event emitted by the ACP protocol adapter.
 *
 * **Details**
 *
 * A `decode_failed` event carries only structural diagnostics (operation, method, request id and
 * schema issue counts), never the wire payload or the failure cause.
 *
 * **Example** (Create event from unknown)
 *
 * ```ts
 * import { AcpProtocolLogEvent } from "@beep/acp/protocol"
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 *
 * const event = S.decodeUnknownOption(AcpProtocolLogEvent)({
 *   direction: "incoming",
 *   stage: "raw",
 *   payload: "{}"
 * })
 * console.log(O.isSome(event))
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export const AcpProtocolLogEvent = pipe(
  AcpProtocolLogDirection.mapMembers(
    Tuple.evolve([
      (literal: S.Literal<"incoming">) =>
        S.Class<AcpProtocolLogEventMember<"incoming">>($I`AcpProtocolLogIncomingEvent`)(
          {
            direction: S.tag(literal.literal).annotateKey({
              description: "Incoming ACP protocol log-event direction.",
            }),
            payload: S.Unknown.annotateKey({
              description: "Raw or decoded ACP protocol payload observed at this stage.",
            }),
            stage: AcpProtocolLogStage.annotateKey({
              description: "Processing stage for the incoming ACP protocol payload.",
            }),
          },
          $I.annote("AcpProtocolLogIncomingEvent", {
            description: "Structured incoming log event emitted by the ACP protocol adapter.",
          })
        ),
      (literal: S.Literal<"outgoing">) =>
        S.Class<AcpProtocolLogEventMember<"outgoing">>($I`AcpProtocolLogOutgoingEvent`)(
          {
            direction: S.tag(literal.literal).annotateKey({
              description: "Outgoing ACP protocol log-event direction.",
            }),
            payload: S.Unknown.annotateKey({
              description: "Raw or decoded ACP protocol payload observed at this stage.",
            }),
            stage: AcpProtocolLogStage.annotateKey({
              description: "Processing stage for the outgoing ACP protocol payload.",
            }),
          },
          $I.annote("AcpProtocolLogOutgoingEvent", {
            description: "Structured outgoing log event emitted by the ACP protocol adapter.",
          })
        ),
    ])
  ),
  $I.annoteSchema("AcpProtocolLogEvent", {
    description: "Structured log event emitted by the ACP protocol adapter.",
  }),
  S.toTaggedUnion("direction")
);

/**
 * Structured log event emitted by the ACP protocol adapter.
 *
 * **Example** (Typed log event value)
 *
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
 * @category models
 * @since 0.0.0
 */
export type AcpProtocolLogEvent = typeof AcpProtocolLogEvent.Type;

/**
 * Schema-backed ACP protocol logging flags.
 *
 * **Example** (Make logging options)
 *
 * ```ts
 * import { AcpProtocolLoggingOptions } from "@beep/acp/protocol"
 *
 * const options = AcpProtocolLoggingOptions.make({ logIncoming: true })
 * console.log(options.logIncoming)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AcpProtocolLoggingOptions extends S.Opaque<AcpProtocolLoggingOptions, { readonly brand: unique symbol }>()(
  S.Struct({
    logIncoming: S.optionalKey(S.Boolean).annotateKey({
      description: "Whether incoming ACP protocol payloads should be logged.",
    }),
    logOutgoing: S.optionalKey(S.Boolean).annotateKey({
      description: "Whether outgoing ACP protocol payloads should be logged.",
    }),
  }).pipe(
    $I.annoteSchema("AcpProtocolLoggingOptions", {
      description: "Schema-backed ACP protocol logging flags.",
    })
  )
) {}

type AcpProtocolLoggingFields = typeof AcpProtocolLoggingOptions.Encoded;

// --- Incoming notification payloads --------------------------------------------------------------
// The accepted `session/update` params and `elicitation/complete` method names live here so the
// notification union can widen (generation 1 and compat shapes) in one place.
//
// `session/update` params decode as generation 2 first, then generation 1. The generation-2
// members are open structs, so an idle `state_update` that carries the prompt `error` some agents
// report keeps it (as JSON) instead of failing. The compat member is listed last: it is what a
// client's `transformSessionUpdate` returns, so dispatched notifications carry either the decoded
// wire shape or the normalized one.
const AcpSessionUpdateParams = S.Union([
  AcpSchema.UpdateSessionNotification,
  AcpSchemaV1.SessionNotification,
  AcpCompat.SessionNotification,
]);
type AcpSessionUpdateParams = typeof AcpSessionUpdateParams.Type;

const AcpElicitationCompleteMethodBase = LiteralKit([
  CLIENT_METHODS.elicitation_complete,
  "session/elicitation/complete",
]);
const AcpElicitationCompleteMethod = AcpElicitationCompleteMethodBase.pipe(
  $I.annoteSchema("AcpElicitationCompleteMethod", {
    description: "Method names accepted for the ACP elicitation-complete notification.",
  }),
  SchemaUtils.withLiteralKitStatics(AcpElicitationCompleteMethodBase)
);

const AcpSessionUpdateNotification = S.TaggedStruct("SessionUpdate", {
  method: S.Literal(CLIENT_METHODS.session_update).annotateKey({
    description: "ACP `session/update` method name.",
  }),
  params: AcpSessionUpdateParams.annotateKey({
    description: "Decoded ACP session update notification payload.",
  }),
});

const AcpElicitationCompleteNotification = S.TaggedStruct("ElicitationComplete", {
  method: AcpElicitationCompleteMethod.annotateKey({
    description: "ACP elicitation-complete method name (`elicitation/complete` or the legacy session-scoped name).",
  }),
  params: AcpSchema.CompleteElicitationNotification.annotateKey({
    description: "Decoded ACP elicitation-complete notification payload.",
  }),
});

const AcpExtensionNotification = S.TaggedStruct("ExtNotification", {
  method: S.String.annotateKey({
    description: "ACP extension notification method name.",
  }),
  params: S.Unknown.annotateKey({
    description: "ACP extension notification payload.",
  }),
});

/**
 * Schema for notifications decoded from the ACP peer stream.
 *
 * **Example** (Decode extension notification)
 *
 * ```ts
 * import { AcpIncomingNotification } from "@beep/acp/protocol"
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 *
 * const notification = S.decodeUnknownOption(AcpIncomingNotification)({
 *   _tag: "ExtNotification",
 *   method: "x/custom",
 *   params: { ok: true }
 * })
 * console.log(O.map(notification, ({ _tag }) => _tag))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AcpIncomingNotification = pipe(
  S.Union([AcpSessionUpdateNotification, AcpElicitationCompleteNotification, AcpExtensionNotification]),
  $I.annoteSchema("AcpIncomingNotification", {
    description: "Schema for notifications decoded from the ACP peer stream.",
  }),
  S.toTaggedUnion("_tag")
);

/**
 * Type for {@link AcpIncomingNotification}.
 *
 * **Example** (Extract notification tag)
 *
 * ```ts
 * import type { AcpIncomingNotification } from "@beep/acp/protocol"
 *
 * const tagOf = (notification: AcpIncomingNotification) => notification._tag
 * console.log(tagOf)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AcpIncomingNotification = typeof AcpIncomingNotification.Type;

/**
 * Options used to create the patched ACP protocol.
 *
 * **Details**
 *
 * - `serverRequestMethods` names the inbound requests handed to `serverProtocol` (the typed
 *   RpcServer); every other inbound request goes to `onExtRequest` on its own fiber.
 * - `onIncomingRequest` observes every inbound request before it is routed.
 * - `transformSessionUpdate` rewrites a decoded `session/update` before it is dispatched.
 * - `onOutgoingResponse` runs after a response was written to stdout;
 *   `onOutgoingResponseFailure` runs when a response could not be encoded or written.
 * - `terminationError` classifies an ended input stream; it defaults to
 *   `AcpInputStreamEndedError`.
 *
 * **Example** (Inspect server request methods)
 *
 * ```ts
 * import * as HashSet from "effect/HashSet"
 * import type { AcpPatchedProtocolOptions } from "@beep/acp/protocol"
 *
 * const methods = HashSet.empty<string>()
 * const hasServerMethods = (options: Omit<AcpPatchedProtocolOptions, "stdio">) =>
 *   HashSet.size(options.serverRequestMethods) >= HashSet.size(methods)
 * console.log(hasServerMethods)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export interface AcpPatchedProtocolOptions extends AcpProtocolLoggingFields {
  readonly logger?: (event: AcpProtocolLogEvent) => Effect.Effect<void>;
  readonly onExtRequest?: (
    method: string,
    params: unknown,
    context: AcpRequestContext
  ) => Effect.Effect<unknown, AcpError.AcpError>;
  readonly onIncomingRequest?: (
    requestId: AcpError.AcpRequestId,
    method: string,
    payload: unknown
  ) => Effect.Effect<void>;
  readonly onNotification?: (notification: AcpIncomingNotification) => Effect.Effect<void, AcpError.AcpError>;
  readonly onOutgoingResponse?: (requestId: AcpError.AcpRequestId) => Effect.Effect<void>;
  readonly onOutgoingResponseFailure?: (
    requestId: AcpError.AcpRequestId,
    error: AcpError.AcpError
  ) => Effect.Effect<void>;
  readonly onTermination?: (error: AcpError.AcpError) => Effect.Effect<void>;
  readonly serverRequestMethods: HashSet.HashSet<string>;
  readonly stdio: AcpStdio;
  readonly terminationError?: Effect.Effect<AcpError.AcpError>;
  readonly testHooks?: AcpPatchedProtocolTestHooks;
  readonly transformSessionUpdate?: (notification: AcpSessionUpdateParams) => AcpSessionUpdateParams;
}

/**
 * Runtime protocol handles used by ACP clients and agents.
 *
 * **Details**
 *
 * `request` sends an extension request with a numeric id counting up from 1 and waits for the
 * correlated response. `notify` sends a JSON-RPC notification without an `id`. Both fail at once
 * with the terminal error after the connection ended.
 *
 * **Example** (Access incoming stream)
 *
 * ```ts
 * import type { AcpPatchedProtocol } from "@beep/acp/protocol"
 *
 * const notificationsOf = (protocol: AcpPatchedProtocol) => protocol.incoming
 * console.log(notificationsOf)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export interface AcpPatchedProtocol {
  readonly clientProtocol: RpcClient.Protocol["Service"];
  readonly incoming: Stream.Stream<AcpIncomingNotification>;
  readonly notify: {
    (method: string, payload: unknown): Effect.Effect<void, AcpError.AcpError>;
    (method: string): (payload: unknown) => Effect.Effect<void, AcpError.AcpError>;
  };
  readonly request: {
    (method: string, payload: unknown): Effect.Effect<unknown, AcpError.AcpError>;
    (method: string): (payload: unknown) => Effect.Effect<unknown, AcpError.AcpError>;
  };
  readonly serverProtocol: RpcServer.Protocol["Service"];
}

interface AcpPendingRequest {
  readonly deferred: Deferred.Deferred<unknown, AcpError.AcpError>;
  readonly method: string;
}

type AcpAcknowledgement = Deferred.Deferred<void, AcpError.AcpError>;

interface AcpOutgoingWrite {
  readonly acknowledgement: O.Option<AcpAcknowledgement>;
  readonly payload: string | Uint8Array;
}

interface AcpOutgoingWriterState {
  readonly intentionalEnd: boolean;
  readonly outstandingAcknowledgements: HashSet.HashSet<AcpAcknowledgement>;
  readonly terminalError: O.Option<AcpError.AcpError>;
}

const decodeSessionUpdate = S.decodeUnknownEffect(AcpSessionUpdateParams);
const decodeElicitationComplete = S.decodeUnknownEffect(AcpSchema.CompleteElicitationNotification);
const isElicitationCompleteMethod = S.is(AcpElicitationCompleteMethod);
const JsonRpcNotificationFrame = S.Struct({
  jsonrpc: S.Literal("2.0"),
  method: S.String,
  params: S.Unknown,
});
const encodeJsonRpcNotification = S.encodeUnknownEffect(fromJsonText(JsonRpcNotificationFrame));
const parserFactory = RpcSerialization.ndJsonRpc();
const textDecoder = new TextDecoder();

const textFromWire = (value: string | Uint8Array): string => (P.isString(value) ? value : textDecoder.decode(value));

const decodeFailureDiagnostics = (error: AcpError.AcpProtocolParseError) => ({
  operation: error.operation,
  ...O.getSomesStruct({
    issueCount: error.issueCount,
    issueKinds: error.issueKinds,
    issueSummary: error.issueSummary,
    maximumPathDepth: error.maximumPathDepth,
    method: error.method,
    requestId: error.requestId,
  }),
});

const outgoingMethodOf = (message: AcpWireMessage): O.Option<string> =>
  message._tag === "Request" ? O.some(message.tag) : O.none();

const outgoingRequestIdOf = (message: AcpWireMessage): O.Option<AcpError.AcpRequestId> =>
  Match.value(message).pipe(
    Match.tag("Request", ({ id }): O.Option<AcpError.AcpRequestId> => O.some(id)),
    Match.tag(
      "Exit",
      "Chunk",
      "Ack",
      "Interrupt",
      ({ requestId }): O.Option<AcpError.AcpRequestId> => O.some(requestId)
    ),
    Match.orElse(O.none<AcpError.AcpRequestId>),
    O.filter((requestId) => requestId !== "")
  );

type ExitCauseEntry = Extract<RpcMessage.ExitEncoded<unknown, unknown>, { readonly _tag: "Failure" }>["cause"][number];

const protocolDefectOf = (entry: ExitCauseEntry): O.Option<AcpSchema.Error> =>
  entry._tag === "Die" && isAcpSchemaError(entry.defect) ? O.some(entry.defect) : O.none();

const protocolFailureOf = (entry: ExitCauseEntry): O.Option<AcpSchema.Error> =>
  entry._tag === "Fail" && isAcpSchemaError(entry.error) ? O.some(entry.error) : O.none();

// Effect RPC's JSON-RPC codec reads a standard JSON-RPC error object inside a `Cause` envelope
// whose data is not a cause array as a defect. A single defect that is a protocol error object is
// the peer's typed failure, so it is restored to a `Fail` entry.
const normalizeAcpJsonRpcError: (message: AcpWireMessage) => AcpWireMessage = Match.type<AcpWireMessage>().pipe(
  Match.tag("Exit", (message): AcpWireMessage => {
    if (message.exit._tag !== "Failure" || A.length(message.exit.cause) !== 1) {
      return message;
    }
    return O.match(O.flatMap(A.head(message.exit.cause), protocolDefectOf), {
      onNone: () => message,
      onSome: (error) => ({ ...message, exit: { _tag: "Failure", cause: [{ _tag: "Fail", error }] } }),
    });
  }),
  Match.orElse((message): AcpWireMessage => message)
);

/**
 * Builds the patched ACP protocol over an ACP `Stdio` transport.
 *
 * **Details**
 *
 * - After the connection ends, every send, request and notification fails at once with the
 *   terminal error, and pending extension requests fail with it.
 * - A response acknowledges only after its bytes reach stdout; a writer failure fails every
 *   current, queued and future response and ends the connection.
 * - An undecodable `session/update` or elicitation-complete notification is logged with
 *   structural diagnostics only and dropped; the connection keeps reading.
 * - Failing or dying notification handlers are isolated. A dying extension request handler is
 *   answered with an internal error.
 * - Inbound extension requests run on their own fibers (at most 64 at once), so a handler may
 *   await an outbound request on the same connection.
 * - Outbound `@effect/rpc/Interrupt` messages are dropped; ACP has no such method.
 *
 * **Example** (Build protocol over stdio)
 *
 * ```ts
 * import * as Effect from "effect/Effect";
 * import * as Stdio from "effect/Stdio";
 * import * as HashSet from "effect/HashSet"
 * import { makeAcpPatchedProtocol } from "@beep/acp/protocol"
 *
 * const program = Effect.flatMap(Effect.service(Stdio.Stdio), (stdio) =>
 *   makeAcpPatchedProtocol({
 *     stdio,
 *     serverRequestMethods: HashSet.empty()
 *   }).pipe(Effect.map((protocol) => typeof protocol.request))
 * )
 * console.log(program)
 * ```
 *
 * @effects Allocates scoped protocol queues, forks transport fibers, and reads
 * from or writes to the supplied `Stdio` streams when the returned Effect runs.
 * @category constructors
 * @since 0.0.0
 */
export const makeAcpPatchedProtocol = Effect.fn($I`makeAcpPatchedProtocol`)(function* (
  options: AcpPatchedProtocolOptions
): Effect.fn.Return<AcpPatchedProtocol, never, Scope.Scope> {
  const encoder = parserFactory.makeUnsafe();
  // Inbound frames bypass the effect ndjson parser: `JSON.parse` on V8 12.8 through 13.7 (Node 24,
  // Electron 36 and 37) resolves an escaped object key through an existing map transition whenever
  // the raw source prefix matches it, turning `_meta` keys such as "\n" into "\\". The package
  // reader keeps native parsing for texts without escaped keys and reads the rest strictly.
  const decodeFrames = makeNdJsonRpcFrameDecoder();
  const serverQueue = yield* Queue.bounded<RpcMessage.FromClientEncoded>(ACP_PROTOCOL_QUEUE_CAPACITY);
  const clientQueue = yield* Queue.bounded<RpcMessage.FromServerEncoded>(ACP_PROTOCOL_QUEUE_CAPACITY);
  const notificationQueue = yield* Queue.sliding<AcpIncomingNotification>(ACP_PROTOCOL_NOTIFICATION_CAPACITY);
  const disconnects = yield* Queue.bounded<number>(ACP_PROTOCOL_DISCONNECT_QUEUE_CAPACITY);
  const outgoing = yield* Queue.bounded<AcpOutgoingWrite, AcpError.AcpError | Cause.Done>(ACP_PROTOCOL_QUEUE_CAPACITY);
  const writerState = yield* Ref.make<AcpOutgoingWriterState>({
    intentionalEnd: false,
    outstandingAcknowledgements: HashSet.empty(),
    terminalError: O.none(),
  });
  const nextRequestId = yield* Ref.make(1);
  const warnedDecodeFailures = MutableHashSet.empty<string>();
  const terminationHandled = yield* Ref.make(false);
  const terminationFailure = yield* Deferred.make<never, AcpError.AcpError>();
  // Keyed by the raw JSON-RPC id: HashMap equality keeps the number 1 and the string "1" apart.
  const extPending = yield* Ref.make(HashMap.empty<AcpError.AcpRequestId, AcpPendingRequest>());
  const extRequestFibers = yield* FiberSet.make<void>();
  const extRequestPermits = yield* Semaphore.make(ACP_PROTOCOL_EXT_REQUEST_CONCURRENCY);

  const ensureActive = Ref.get(terminationHandled).pipe(
    Effect.flatMap((terminated) => (terminated ? Deferred.await(terminationFailure) : Effect.void))
  );

  const logProtocol = Effect.fn($I`logProtocol`)((event: AcpProtocolLogEvent) => {
    const emit = () =>
      options.logger?.(event) ?? Effect.logDebug("ACP protocol event").pipe(Effect.annotateLogs({ event }));
    return AcpProtocolLogEvent.match(event, {
      incoming: () => (options.logIncoming === true ? emit() : Effect.void),
      outgoing: () => (options.logOutgoing === true ? emit() : Effect.void),
    });
  });

  // --- Outgoing writer --------------------------------------------------------------------------

  const removeAcknowledgement = (acknowledgement: AcpAcknowledgement) =>
    Ref.update(writerState, (state) => ({
      ...state,
      outstandingAcknowledgements: HashSet.remove(state.outstandingAcknowledgements, acknowledgement),
    }));

  // Admission is atomic with the writer's terminal state, so a response admitted while the writer
  // closes is failed together with the rest instead of waiting forever for an acknowledgement.
  const admitOutgoing = (acknowledgement: O.Option<AcpAcknowledgement>) =>
    Ref.modify(writerState, (state): readonly [O.Option<AcpError.AcpError>, AcpOutgoingWriterState] =>
      O.isSome(state.terminalError)
        ? [state.terminalError, state]
        : [
            O.none(),
            O.match(acknowledgement, {
              onNone: () => state,
              onSome: (pending) => ({
                ...state,
                outstandingAcknowledgements: HashSet.add(state.outstandingAcknowledgements, pending),
              }),
            }),
          ]
    ).pipe(Effect.flatMap(O.match({ onNone: () => Effect.void, onSome: Effect.fail })));

  const enqueueOutgoing = Effect.fn($I`enqueueOutgoing`)((write: AcpOutgoingWrite) =>
    Queue.offer(outgoing, write).pipe(
      Effect.filterOrFail(identity, () =>
        AcpError.AcpTransportError.make({
          detail: O.some("The ACP output queue was closed before accepting a message"),
        })
      ),
      Effect.tapError((error) =>
        O.match(write.acknowledgement, {
          onNone: () => Effect.void,
          onSome: (acknowledgement) =>
            removeAcknowledgement(acknowledgement).pipe(Effect.andThen(Deferred.fail(acknowledgement, error))),
        })
      ),
      Effect.asVoid
    )
  );

  const offerOutgoing = Effect.fn($I`offerOutgoing`)(function* (message: AcpWireMessage) {
    // RpcClient emits `@effect/rpc/Interrupt` when a pending typed call is interrupted. ACP has no
    // such method and agents log it as an error, so it never reaches the wire.
    if (message._tag === "Interrupt") {
      return;
    }
    yield* ensureActive;
    yield* logProtocol({ direction: "outgoing", payload: message, stage: "decoded" });

    const encoded = yield* Effect.try({
      try: () => encoder.encode(message),
      catch: (cause) =>
        AcpError.AcpProtocolParseError.fromEncodingError(
          O.getOrUndefined(outgoingMethodOf(message)),
          O.getOrUndefined(outgoingRequestIdOf(message)),
          cause
        ),
    });
    if (encoded === undefined || (P.isString(encoded) && encoded.length === 0)) {
      return;
    }
    if (options.logOutgoing === true) {
      yield* logProtocol({ direction: "outgoing", payload: textFromWire(encoded), stage: "raw" });
    }

    yield* ensureActive;
    const acknowledgement =
      message._tag === "Exit" ? O.some(yield* Deferred.make<void, AcpError.AcpError>()) : O.none<AcpAcknowledgement>();
    yield* admitOutgoing(acknowledgement);
    if (options.testHooks?.onOutgoingWriteAdmitted !== undefined) {
      yield* options.testHooks.onOutgoingWriteAdmitted();
    }
    yield* enqueueOutgoing({ acknowledgement, payload: encoded });
    if (O.isSome(acknowledgement)) {
      yield* Deferred.await(acknowledgement.value);
    }
    if (message._tag === "Exit" && options.onOutgoingResponse !== undefined) {
      yield* options.onOutgoingResponse(message.requestId);
    }
  });

  // --- Extension request bookkeeping ------------------------------------------------------------

  const resolveExtPending = (
    requestId: AcpError.AcpRequestId,
    onFound: (pending: AcpPendingRequest) => Effect.Effect<void>
  ) =>
    Ref.modify(extPending, (pending) =>
      O.match(HashMap.get(pending, requestId), {
        onNone: () => [Effect.void, pending] as const,
        onSome: (found) => [onFound(found), HashMap.remove(pending, requestId)] as const,
      })
    ).pipe(Effect.flatten);

  const removeExtPending = (requestId: AcpError.AcpRequestId) =>
    Ref.update(extPending, (pending) => HashMap.remove(pending, requestId));

  const completeExtPendingFailure = (requestId: AcpError.AcpRequestId, error: AcpError.AcpError) =>
    resolveExtPending(requestId, ({ deferred }) => Deferred.fail(deferred, error).pipe(Effect.asVoid));

  const completeExtPendingSuccess = (requestId: AcpError.AcpRequestId, value: unknown) =>
    resolveExtPending(requestId, ({ deferred }) => Deferred.succeed(deferred, value).pipe(Effect.asVoid));

  const failAllExtPending = (error: AcpError.AcpError) =>
    Ref.getAndSet(extPending, HashMap.empty()).pipe(
      Effect.flatMap((pending) =>
        Effect.forEach(HashMap.values(pending), ({ deferred }) => Deferred.fail(deferred, error), {
          discard: true,
        })
      )
    );

  // --- Termination ------------------------------------------------------------------------------

  const emitClientProtocolError = (error: AcpError.AcpError) =>
    Queue.offer(clientQueue, {
      _tag: "ClientProtocolError",
      error: RpcClientError.RpcClientError.make({
        reason: RpcClientError.RpcClientDefect.make({
          cause: error,
          message: "ACP protocol terminated.",
        }),
      }),
    }).pipe(Effect.asVoid);

  const handleTermination = Effect.fn($I`handleTermination`)((classification: Effect.Effect<AcpError.AcpError>) =>
    Ref.modify(terminationHandled, (handled) => {
      if (handled) {
        return [Effect.void, true] as const;
      }
      return [
        Effect.gen(function* () {
          yield* Queue.offer(disconnects, ACP_STDIO_CLIENT_ID);
          const error = yield* classification;
          yield* Deferred.fail(terminationFailure, error);
          yield* failAllExtPending(error);
          yield* emitClientProtocolError(error);
          if (options.onTermination !== undefined) {
            yield* options.onTermination(error);
          }
        }),
        true,
      ] as const;
    }).pipe(Effect.flatten)
  );

  // --- Responses --------------------------------------------------------------------------------

  const respondWithSuccess = (requestId: AcpError.AcpRequestId, value: unknown) =>
    offerOutgoing({
      _tag: "Exit",
      exit: { _tag: "Success", value },
      requestId,
    });

  const respondWithError = (requestId: AcpError.AcpRequestId, error: AcpError.AcpRequestError) =>
    offerOutgoing({
      _tag: "Exit",
      exit: { _tag: "Failure", cause: [{ _tag: "Fail", error: error.toProtocolError() }] },
      requestId,
    });

  const answerExtensionHandlerFailure = (message: RpcMessage.RequestEncoded, cause: Cause.Cause<AcpError.AcpError>) =>
    // A defect wins over a typed failure: the handler is broken, so the peer gets a generic error.
    O.match(Cause.hasDies(cause) ? O.none() : Cause.findErrorOption(cause), {
      onNone: () =>
        Effect.logError(`ACP extension request handler failed for '${message.tag}'`, cause).pipe(
          Effect.andThen(
            respondWithError(
              message.id,
              AcpError.AcpRequestError.internalError(
                `ACP extension request handler failed for method '${message.tag}'`,
                undefined,
                AcpError.AcpRequestDiagnostics.make({
                  cause: cause.pipe(Cause.squash, O.some),
                  method: O.some(message.tag),
                  operation: O.some("handle-extension-request"),
                })
              )
            )
          )
        ),
      onSome: (error) =>
        respondWithError(message.id, AcpError.AcpRequestError.fromExtensionHandlerError(error, message.tag)),
    });

  const handleExtRequest = Effect.fn($I`handleExtRequest`)((message: RpcMessage.RequestEncoded) =>
    options.onExtRequest === undefined
      ? respondWithError(message.id, AcpError.AcpRequestError.methodNotFound(message.tag))
      : options
          .onExtRequest(
            message.tag,
            message.payload,
            AcpRequestContext.make({ method: message.tag, requestId: message.id })
          )
          .pipe(
            Effect.matchCauseEffect({
              onFailure: (cause) => answerExtensionHandlerFailure(message, cause),
              onSuccess: (value) => respondWithSuccess(message.id, value),
            })
          )
  );

  const answerExtRequest = (message: RpcMessage.RequestEncoded) =>
    handleExtRequest(message).pipe(
      Effect.catchTag("AcpProtocolParseError", (error) =>
        Effect.logWarning(error).pipe(
          Effect.annotateLogs({ method: message.tag, operation: error.operation, requestId: message.id }),
          Effect.andThen(
            respondWithError(
              message.id,
              AcpError.AcpRequestError.fromExtensionResponseEncodingError(message.tag, message.id, error)
            )
          )
        )
      ),
      // The response could not be delivered because the connection ended; termination already
      // reported that to every observer.
      Effect.catchCause((cause) => Effect.logDebug("ACP extension response was not delivered", cause))
    );

  const forkExtRequest = Effect.fn($I`forkExtRequest`)(function* (message: RpcMessage.RequestEncoded) {
    yield* Semaphore.take(extRequestPermits, 1);
    yield* answerExtRequest(message).pipe(
      Effect.ensuring(Semaphore.release(extRequestPermits, 1)),
      FiberSet.run(extRequestFibers)
    );
  });

  // --- Incoming notifications -------------------------------------------------------------------

  const dispatchNotification = (notification: AcpIncomingNotification) =>
    Queue.offer(notificationQueue, notification).pipe(
      // A failing or dying handler must not stop the reader, or every later message on the
      // connection goes unanswered.
      Effect.andThen(
        options.onNotification === undefined
          ? Effect.void
          : isolateNotificationHandler(options.onNotification(notification))
      ),
      Effect.asVoid
    );

  const markDecodeFailureWarned = (key: string) =>
    Effect.sync(() => {
      const firstOfItsKind = !MutableHashSet.has(warnedDecodeFailures, key);
      MutableHashSet.add(warnedDecodeFailures, key);
      return firstOfItsKind;
    });

  // A notification has no reply to fail, so one the schema rejects is logged and dropped. Ending
  // the connection over it would kill a working session because one update, possibly from a newer
  // spec, did not parse. An agent repeats a bad shape on every update, so each distinct failure is
  // warned about once per connection.
  const dropUndecodableNotification = (method: string) => (cause: S.SchemaError) => {
    const error = AcpError.AcpProtocolParseError.fromSchemaError("decode-notification-payload", method, cause);
    const diagnostics = decodeFailureDiagnostics(error);
    return logProtocol({ direction: "incoming", payload: diagnostics, stage: "decode_failed" }).pipe(
      Effect.andThen(markDecodeFailureWarned(`${method}\n${O.getOrElse(error.issueSummary, () => "")}`)),
      Effect.flatMap((firstOfItsKind) =>
        firstOfItsKind
          ? Effect.logWarning("Dropped an ACP notification that failed to decode").pipe(
              Effect.annotateLogs(diagnostics)
            )
          : Effect.void
      )
    );
  };

  const handleIncomingNotification = (message: RpcMessage.RequestEncoded) => {
    if (message.tag === CLIENT_METHODS.session_update) {
      return decodeSessionUpdate(message.payload).pipe(
        Effect.matchEffect({
          onFailure: dropUndecodableNotification(CLIENT_METHODS.session_update),
          onSuccess: (params) =>
            dispatchNotification({
              _tag: "SessionUpdate",
              method: CLIENT_METHODS.session_update,
              params: options.transformSessionUpdate === undefined ? params : options.transformSessionUpdate(params),
            }),
        })
      );
    }
    const method = message.tag;
    if (isElicitationCompleteMethod(method)) {
      return decodeElicitationComplete(message.payload).pipe(
        Effect.matchEffect({
          onFailure: dropUndecodableNotification(method),
          onSuccess: (params) => dispatchNotification({ _tag: "ElicitationComplete", method, params }),
        })
      );
    }
    return dispatchNotification({ _tag: "ExtNotification", method, params: message.payload });
  };

  // --- Inbound routing --------------------------------------------------------------------------

  const handleRequestEncoded = Effect.fn($I`handleRequestEncoded`)((message: RpcMessage.RequestEncoded) => {
    if (message.id === "") {
      return handleIncomingNotification(message);
    }
    const observeIncoming =
      options.onIncomingRequest === undefined
        ? Effect.void
        : options.onIncomingRequest(message.id, message.tag, message.payload);
    return observeIncoming.pipe(
      Effect.andThen(
        HashSet.has(options.serverRequestMethods, message.tag)
          ? Queue.offer(serverQueue, message).pipe(Effect.asVoid)
          : forkExtRequest(message)
      )
    );
  });

  // Responses to ids this side never issued as typed RPC calls (agent-internal string ids, for
  // example) are dropped instead of being handed to the RpcClient.
  const forwardToRpcClient = (message: RpcMessage.ResponseChunkEncoded | RpcMessage.ResponseExitEncoded) =>
    isEffectRpcRequestId(message.requestId) ? Queue.offer(clientQueue, message).pipe(Effect.asVoid) : Effect.void;

  const settlePendingExit = (message: RpcMessage.ResponseExitEncoded, pending: AcpPendingRequest) =>
    Match.value(message.exit).pipe(
      Match.tag("Success", (exit) => completeExtPendingSuccess(message.requestId, exit.value)),
      Match.tag("Failure", (exit) =>
        completeExtPendingFailure(
          message.requestId,
          O.match(
            O.flatMap(
              A.findFirst(exit.cause, (entry) => entry._tag === "Fail"),
              protocolFailureOf
            ),
            {
              onNone: () =>
                AcpError.AcpRequestError.fromExtensionResponseFailure(pending.method, message.requestId, exit.cause),
              onSome: (error) =>
                AcpError.AcpRequestError.fromProtocolError(
                  error,
                  AcpError.AcpRequestDiagnostics.make({
                    cause: O.some(exit.cause),
                    method: O.some(pending.method),
                    requestId: O.some(message.requestId),
                  })
                ),
            }
          )
        )
      ),
      Match.exhaustive
    );

  const handleExitEncoded = Effect.fn($I`handleExitEncoded`)((message: RpcMessage.ResponseExitEncoded) =>
    Ref.get(extPending).pipe(
      Effect.flatMap((pending) =>
        O.match(HashMap.get(pending, message.requestId), {
          onNone: () => forwardToRpcClient(message),
          onSome: (found) => settlePendingExit(message, found),
        })
      )
    )
  );

  const handleChunkEncoded = Effect.fn($I`handleChunkEncoded`)((message: RpcMessage.ResponseChunkEncoded) =>
    Ref.get(extPending).pipe(
      Effect.flatMap((pending) =>
        O.match(HashMap.get(pending, message.requestId), {
          onNone: () => forwardToRpcClient(message),
          onSome: ({ method }) =>
            completeExtPendingFailure(
              message.requestId,
              AcpError.AcpRequestError.unsupportedStreamingResponse(method, message.requestId)
            ),
        })
      )
    )
  );

  const offerClientMessage = (message: RpcMessage.FromServerEncoded) =>
    Queue.offer(clientQueue, message).pipe(Effect.asVoid);

  const offerServerMessage = (message: RpcMessage.FromClientEncoded) =>
    Queue.offer(serverQueue, message).pipe(Effect.asVoid);

  const routeDecodedMessage: (message: AcpWireMessage) => Effect.Effect<void, AcpError.AcpError> =
    Match.type<AcpWireMessage>().pipe(
      Match.tag("Request", handleRequestEncoded),
      Match.tag("Exit", handleExitEncoded),
      Match.tag("Chunk", handleChunkEncoded),
      Match.tag("Defect", offerClientMessage),
      Match.tag("ClientProtocolError", offerClientMessage),
      Match.tag("Pong", offerClientMessage),
      Match.tag("Ack", offerServerMessage),
      Match.tag("Interrupt", offerServerMessage),
      Match.tag("Ping", offerServerMessage),
      Match.tag("Eof", offerServerMessage),
      Match.exhaustive
    );

  // --- Reader -----------------------------------------------------------------------------------

  const readChunk = (data: Uint8Array) =>
    (options.logIncoming === true
      ? logProtocol({ direction: "incoming", payload: textFromWire(data), stage: "raw" })
      : Effect.void
    ).pipe(
      Effect.andThen(
        Effect.fromResult(decodeFrames(data)).pipe(
          Effect.mapBoth({
            onFailure: (cause) =>
              AcpError.AcpProtocolParseError.make({ cause: O.some(cause), operation: "decode-wire-message" }),
            onSuccess: A.map(normalizeAcpJsonRpcError),
          })
        )
      ),
      Effect.tap((messages) => logProtocol({ direction: "incoming", payload: messages, stage: "decoded" })),
      Effect.tapErrorTag("AcpProtocolParseError", (error) =>
        logProtocol({ direction: "incoming", payload: decodeFailureDiagnostics(error), stage: "decode_failed" })
      ),
      Effect.flatMap((messages) => Effect.forEach(messages, routeDecodedMessage, { discard: true }))
    );

  const classifyReaderFailure = (cause: Cause.Cause<unknown>): AcpError.AcpError => {
    const failure = O.getOrElse(Cause.findErrorOption(cause), () => Cause.squash(cause));
    return isAcpError(failure)
      ? failure
      : AcpError.AcpTransportError.make({ cause: O.some(failure), operation: O.some("read-input-stream") });
  };

  yield* options.stdio.stdin.pipe(
    Stream.runForEach(readChunk),
    // Anything that ends the reader, including a defect in a callback it runs, terminates the
    // connection so pending requests fail instead of hanging.
    Effect.matchCauseEffect({
      onFailure: (cause) => cause.pipe(classifyReaderFailure, Effect.succeed, handleTermination),
      onSuccess: () =>
        handleTermination(options.terminationError ?? Effect.succeed(AcpError.AcpInputStreamEndedError.make({}))),
    }),
    Effect.forkScoped
  );

  // --- Writer -----------------------------------------------------------------------------------

  const failOutgoingWrites = (error: AcpError.AcpError) =>
    Ref.modify(writerState, (state) => {
      const terminalError = O.getOrElse(state.terminalError, () => error);
      return [
        Tuple.make(terminalError, state.outstandingAcknowledgements),
        { ...state, outstandingAcknowledgements: HashSet.empty(), terminalError: O.some(terminalError) },
      ] as const;
    }).pipe(
      Effect.flatMap(([terminalError, acknowledgements]) =>
        Effect.forEach(acknowledgements, (acknowledgement) => Deferred.fail(acknowledgement, terminalError), {
          concurrency: "unbounded",
          discard: true,
        })
      ),
      Effect.andThen(Queue.fail(outgoing, error)),
      Effect.asVoid
    );

  const completeOutgoingWrites = Ref.getAndUpdate(writerState, (state) => ({
    ...state,
    outstandingAcknowledgements: HashSet.empty<AcpAcknowledgement>(),
  })).pipe(
    Effect.flatMap(({ outstandingAcknowledgements }) =>
      Effect.forEach(outstandingAcknowledgements, (acknowledgement) => Deferred.succeed(acknowledgement, undefined), {
        concurrency: "unbounded",
        discard: true,
      })
    )
  );

  const acknowledgeOutgoingWrite = (acknowledgement: AcpAcknowledgement) =>
    removeAcknowledgement(acknowledgement).pipe(
      Effect.andThen(Deferred.succeed(acknowledgement, undefined)),
      Effect.asVoid
    );

  const failWriter = (detail: string, cause: unknown, terminate: boolean) => {
    const error = AcpError.AcpTransportError.make({ cause: O.some(cause), detail: O.some(detail) });
    return failOutgoingWrites(error).pipe(
      Effect.andThen(terminate ? error.pipe(Effect.succeed, handleTermination) : Effect.void)
    );
  };

  const handleWriterExit = (exit: Exit.Exit<void, unknown>) =>
    Exit.match(exit, {
      onFailure: (cause) =>
        Cause.hasInterruptsOnly(cause)
          ? failWriter("The ACP output writer was interrupted while closing", cause, false)
          : failWriter("Failed to write an outgoing ACP message", cause, true),
      onSuccess: () =>
        Ref.get(writerState).pipe(
          Effect.flatMap(({ intentionalEnd }) =>
            (intentionalEnd
              ? completeOutgoingWrites
              : failWriter("ACP output writer ended before the protocol closed", "Output writer ended", true)
            ).pipe(
              Effect.andThen(
                options.testHooks?.onOutgoingWriterExit === undefined
                  ? Effect.void
                  : options.testHooks.onOutgoingWriterExit(intentionalEnd)
              )
            )
          )
        ),
    });

  yield* Stream.fromQueue(outgoing).pipe(
    Stream.flatMap((write) =>
      Stream.make(write.payload).pipe(
        Stream.concat(
          O.match(write.acknowledgement, {
            onNone: () => Stream.empty,
            onSome: (acknowledgement) =>
              acknowledgement.pipe(acknowledgeOutgoingWrite, Stream.fromEffect, Stream.drain),
          })
        )
      )
    ),
    Stream.run(options.stdio.stdout()),
    Effect.onExit(handleWriterExit),
    Effect.forkScoped
  );

  // --- Protocols --------------------------------------------------------------------------------

  const clientProtocol = RpcClient.Protocol.of({
    run: Effect.fn($I`AcpClient_Protocol_run`)((_clientId, f) =>
      Stream.fromQueue(clientQueue).pipe(
        Stream.runForEach((message) => f(message)),
        Effect.forever
      )
    ),
    send: Effect.fn($I`AcpClient_Protocol_send`)((_clientId, request) =>
      offerOutgoing(request).pipe(
        Effect.mapError((error) =>
          RpcClientError.RpcClientError.make({
            reason: RpcClientError.RpcClientDefect.make({
              cause: error,
              message: "Failed to send ACP protocol message.",
            }),
          })
        )
      )
    ),
    supportsAck: true,
    supportsTransferables: false,
    codecFor: parserFactory.codecFor,
  });

  const serverProtocol = RpcServer.Protocol.of({
    clientIds: Effect.succeed(ACP_STDIO_CLIENT_IDS),
    disconnects,
    end: Effect.fn($I`AcpServer_Protocol_end`)((_clientId) =>
      Ref.update(writerState, (state) => ({ ...state, intentionalEnd: true })).pipe(
        Effect.andThen(Queue.end(outgoing)),
        Effect.asVoid
      )
    ),
    initialMessage: Effect.succeedNone,
    run: Effect.fn($I`AcpServer_Protocol_run`)((f) =>
      Stream.fromQueue(serverQueue).pipe(
        Stream.runForEach((message) => f(ACP_STDIO_CLIENT_ID, message)),
        Effect.forever
      )
    ),
    send: Effect.fn($I`AcpServer_Protocol_send`)((_clientId, response) =>
      offerOutgoing(response).pipe(
        Effect.tapError((error) =>
          response._tag === "Exit" && options.onOutgoingResponseFailure !== undefined
            ? options.onOutgoingResponseFailure(response.requestId, error)
            : Effect.void
        ),
        Effect.orDie
      )
    ),
    supportsAck: true,
    supportsNotifications: true,
    supportsSpanPropagation: true,
    supportsTransferables: false,
    codecFor: parserFactory.codecFor,
  });

  // --- Raw requests and notifications -----------------------------------------------------------

  // JSON-RPC notifications carry no `id`. Encoding a Request without `isNotification` emits one,
  // which real agents (Grok CLI) read as a malformed request and silently drop.
  const sendNotificationEffect = Effect.fn($I`sendNotification`)(function* (method: string, payload: unknown) {
    yield* ensureActive;
    yield* logProtocol({
      direction: "outgoing",
      payload: { _tag: "Notification", payload, tag: method },
      stage: "decoded",
    });
    const encoded = yield* encodeJsonRpcNotification({ jsonrpc: "2.0", method, params: payload }).pipe(
      Effect.mapError((cause) => AcpError.AcpProtocolParseError.fromEncodingError(method, undefined, cause)),
      Effect.map((text) => `${text}\n`)
    );
    if (options.logOutgoing === true) {
      yield* logProtocol({ direction: "outgoing", payload: encoded, stage: "raw" });
    }
    yield* ensureActive;
    // FIFO queue admission keeps wire order: a session/prompt sent after session/cancel cannot
    // overtake it.
    yield* enqueueOutgoing({ acknowledgement: O.none(), payload: encoded });
  });

  function sendNotification(method: string, payload: unknown): Effect.Effect<void, AcpError.AcpError>;
  function sendNotification(method: string): (payload: unknown) => Effect.Effect<void, AcpError.AcpError>;
  function sendNotification(
    method: string,
    payload?: unknown
  ): Effect.Effect<void, AcpError.AcpError> | ((payload: unknown) => Effect.Effect<void, AcpError.AcpError>) {
    if (arguments.length === 1) {
      return (curriedPayload: unknown) => sendNotificationEffect(method, curriedPayload);
    }
    return sendNotificationEffect(method, payload);
  }

  const sendRequestEffect = Effect.fn($I`sendRequest`)(function* (method: string, payload: unknown) {
    yield* ensureActive;
    const requestId = yield* Ref.getAndUpdate(nextRequestId, (current) => current + 1);
    const deferred = yield* Deferred.make<unknown, AcpError.AcpError>();
    yield* Ref.update(extPending, (pending) => HashMap.set(pending, requestId, { deferred, method }));
    yield* offerOutgoing({
      _tag: "Request",
      headers: [],
      id: requestId,
      payload,
      tag: method,
    }).pipe(Effect.tapError(() => removeExtPending(requestId)));
    return yield* Deferred.await(deferred).pipe(Effect.onInterrupt(() => removeExtPending(requestId)));
  });

  function sendRequest(method: string, payload: unknown): Effect.Effect<unknown, AcpError.AcpError>;
  function sendRequest(method: string): (payload: unknown) => Effect.Effect<unknown, AcpError.AcpError>;
  function sendRequest(
    method: string,
    payload?: unknown
  ): Effect.Effect<unknown, AcpError.AcpError> | ((payload: unknown) => Effect.Effect<unknown, AcpError.AcpError>) {
    if (arguments.length === 1) {
      return (curriedPayload: unknown) => sendRequestEffect(method, curriedPayload);
    }
    return sendRequestEffect(method, payload);
  }

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
