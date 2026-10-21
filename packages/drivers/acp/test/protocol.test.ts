// Transport tests for `@beep/acp/protocol`: wire framing, id correlation, writer acknowledgement,
// handler isolation and termination. Behaviour cases port t3code effect-acp `protocol.test.ts`
// (31dcc7c513); the escaped-key, frame-decoder and property suites are beep-specific.
import * as AcpError from "@beep/acp/errors";
import * as AcpJson from "@beep/acp/json";
import * as AcpProtocol from "@beep/acp/protocol";
import * as AcpSchema from "@beep/acp/schema";
import { it } from "@beep/test-runner";
import { fcRuns } from "@beep/test-utils";
import { A, currentHostPlatform } from "@beep/utils";
import * as O from "@beep/utils/Option";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert } from "@effect/vitest";
import { assertNone, assertSome, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as Fiber from "effect/Fiber";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as References from "effect/References";
import * as Result from "effect/Result";
import * as RpcSerialization from "effect/rpc/RpcSerialization";
import * as S from "effect/Schema";
import * as Sink from "effect/Sink";
import * as Stdio from "effect/Stdio";
import * as Stream from "effect/Stream";
import {
  encodeJsonl,
  jsonRpcNotification,
  jsonRpcRequest,
  jsonRpcResponse,
  makeChildStdio,
  makeInMemoryStdio,
  makeTerminationError,
} from "./helpers.ts";
import type * as RpcMessage from "effect/rpc/RpcMessage";

const decodeAcpIncomingNotification = S.decodeEffect(AcpProtocol.AcpIncomingNotification);
const decodeAcpProtocolLogEvent = S.decodeEffect(AcpProtocol.AcpProtocolLogEvent);

const SessionCancelNotification = jsonRpcNotification("session/cancel", AcpSchema.CancelSessionNotification);
const SessionUpdateNotification = jsonRpcNotification("session/update", AcpSchema.UpdateSessionNotification);
const ElicitationCompleteNotification = jsonRpcNotification(
  "elicitation/complete",
  AcpSchema.CompleteElicitationNotification
);
const LegacyElicitationCompleteNotification = jsonRpcNotification(
  "session/elicitation/complete",
  AcpSchema.CompleteElicitationNotification
);
const RequestPermissionResponse = jsonRpcResponse(AcpSchema.RequestPermissionResponse);
const ExtRequest = jsonRpcRequest("x/test", S.Struct({ hello: S.String }));
const ExtResponse = jsonRpcResponse(S.Struct({ ok: S.Boolean }));
const InnerRequest = jsonRpcRequest("x/inner", S.Struct({ from: S.String }));
const OuterResponse = jsonRpcResponse(S.Struct({ inner: S.Struct({ ok: S.Boolean }) }));
const JsonRpcErrorResponse = S.Struct({
  error: S.Struct({ code: S.Finite, message: S.String }),
  id: S.Finite,
  jsonrpc: S.Literal("2.0"),
});
const decodeSessionCancelNotification = S.decodeEffect(AcpJson.fromJsonText(SessionCancelNotification));
const decodeExtRequest = S.decodeEffect(AcpJson.fromJsonText(ExtRequest));
const decodeInnerRequest = S.decodeEffect(AcpJson.fromJsonText(InnerRequest));
const decodeOuterResponse = S.decodeEffect(AcpJson.fromJsonText(OuterResponse));
const decodeJsonRpcErrorResponse = S.decodeEffect(AcpJson.fromJsonText(JsonRpcErrorResponse));
const decodeRequestPermissionResponse = S.decodeEffect(AcpJson.fromJsonText(RequestPermissionResponse));
const encodeSessionCancelNotification = S.encodeEffect(AcpJson.fromJsonText(SessionCancelNotification));
const encodeRequestPermissionResponse = S.encodeEffect(AcpJson.fromJsonText(RequestPermissionResponse));
const encodeUnknownJsonText = S.encodeUnknownEffect(AcpJson.fromJsonText(S.Unknown));
const SessionCancelNotificationArbitrary = Arbitrary.schema(SessionCancelNotification);
const RequestPermissionResponseArbitrary = Arbitrary.schema(RequestPermissionResponse);
const AcpProtocolLogEventArbitrary = Arbitrary.schema(AcpProtocol.AcpProtocolLogEvent);
const AcpProtocolLoggingOptionsArbitrary = Arbitrary.schema(AcpProtocol.AcpProtocolLoggingOptions);
const AcpIncomingNotificationArbitrary = Arbitrary.schema(AcpProtocol.AcpIncomingNotification);
const AcpRequestContextArbitrary = Arbitrary.schema(AcpProtocol.AcpRequestContext);
const AcpErrorArbitrary = Arbitrary.schema(AcpError.AcpError).pipe(
  Arbitrary.filter((error) =>
    AcpError.AcpError.match(error, {
      AcpInputStreamEndedError: () => true,
      AcpProcessExitedError: (failure) => O.isNone(failure.cause),
      AcpProtocolParseError: (failure) => O.isNone(failure.cause),
      AcpRequestError: (failure) => O.isNone(failure.cause),
      AcpSpawnError: (failure) => O.isNone(failure.cause),
      AcpTransportError: (failure) => O.isNone(failure.cause),
    })
  )
);
const childProcessProtocolTestTimeout = 30_000;
const decodeJsonWithHostParser = S.decodeUnknownEffect(S.fromJsonString(S.Json));
const encoder = new TextEncoder();

const encode = <Codec extends S.Codec<unknown, unknown>>(schema: Codec, value: Codec["Type"]): Codec["Encoded"] =>
  Result.getOrThrow(S.encodeResult(schema)(value));

const decode = <Codec extends S.Codec<unknown, unknown>>(schema: Codec, value: Codec["Encoded"]): Codec["Type"] =>
  Result.getOrThrow(S.decodeUnknownResult(schema)(value));

const assertEncodedRoundTrip = <Codec extends S.Codec<unknown, unknown>>(
  schema: Codec,
  value: Codec["Type"],
  options: { readonly compareDecoded?: boolean } = {}
): void => {
  const encoded = encode(schema, value);
  const decoded = decode(schema, encoded);
  if (options.compareDecoded !== false) {
    assertTrue(S.toEquivalence(schema)(decoded, value));
  }
  assert.deepEqual(encode(schema, decoded), encoded);
};

const jsonLine = Effect.fnUntraced(function* (value: unknown) {
  return encoder.encode(`${yield* encodeUnknownJsonText(value)}\n`);
});

const usageUpdate = (used: number) => ({
  sessionId: "session-1",
  update: { sessionUpdate: "usage_update", size: 100, used },
});

const spawnBunScript = Effect.fn("AcpProtocolTest.spawnBunScript")(function* (script: string) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  return yield* spawner.spawn(
    ChildProcess.make("bun", ["-e", script], {
      shell: currentHostPlatform === "win32",
      stderr: "inherit",
      stdin: "pipe",
      stdout: "pipe",
    })
  );
});

const terminatedDefectOf = (message: RpcMessage.FromServerEncoded) => {
  if (message._tag !== "ClientProtocolError" || message.error.reason._tag !== "RpcClientDefect") {
    return assert.fail("expected a ClientProtocolError carrying an RpcClientDefect");
  }
  assert.equal(message.error.reason.message, "ACP protocol terminated.");
  return message.error.reason.cause;
};

const expectFailure = <A, E>(effect: Effect.Effect<A, E>) =>
  effect.pipe(
    Effect.match({
      onFailure: (error) => error,
      onSuccess: () => assert.fail("expected the effect to fail"),
    })
  );

it.effect.prop(
  "round-trips schema-derived JSON-RPC notifications and responses through JSON boundaries",
  [SessionCancelNotificationArbitrary, RequestPermissionResponseArbitrary],
  Effect.fnUntraced(function* ([cancelNotification, permissionResponse]) {
    const encodedCancelNotification = yield* encodeSessionCancelNotification(cancelNotification);
    const decodedCancelNotification = yield* decodeSessionCancelNotification(encodedCancelNotification);
    assert.equal(yield* encodeSessionCancelNotification(decodedCancelNotification), encodedCancelNotification);

    const encodedPermissionResponse = yield* encodeRequestPermissionResponse(permissionResponse);
    const decodedPermissionResponse = yield* decodeRequestPermissionResponse(encodedPermissionResponse);
    assert.equal(yield* encodeRequestPermissionResponse(decodedPermissionResponse), encodedPermissionResponse);
  }),
  { arbitrary: fcRuns(25) }
);

// Node 24 (V8 12.8 through 13.7) `JSON.parse` resolves an escaped one-character object key through
// an existing map transition whenever the raw source prefix matches it, so once any object shaped
// `{ " ": …, "\\": … }` exists in the isolate, `{" ":0,"\u0000":1}` decodes with a "\\" key. The
// property above found this on 2026-09-11 (replay
// `[0,"5464242726500343",5009,3,[0,0,0,0,0,0],"PropertyError"]`); this pins the shrunk shape.
it.effect(
  "keeps escaped _meta keys after the host materialised a backslash key at the same position",
  Effect.fnUntraced(function* () {
    assert.deepEqual(yield* decodeJsonWithHostParser('{" ":0,"\\\\":0}'), { " ": 0, "\\": 0 });
    const notification = {
      jsonrpc: "2.0" as const,
      method: "session/cancel" as const,
      params: {
        _meta: {
          "9z({": { " ": -8.82839006083749e-189, "\u0000": { "<b^~+3>": [], ",i": 1.3931731468853144e287 } },
        },
        sessionId: "session-1",
      },
    };
    const encoded = yield* encodeSessionCancelNotification(notification);
    const decoded = yield* decodeSessionCancelNotification(encoded);
    assert.equal(yield* encodeSessionCancelNotification(decoded), encoded);
    assert.deepEqual(decoded.params._meta, notification.params._meta);
  })
);

it.effect(
  "keeps handwritten ACP schema encoded shapes byte-identical",
  Effect.fnUntraced(function* () {
    assert.deepEqual(
      encode(AcpError.AcpRequestError, AcpError.AcpRequestError.parseError("Parse error", { issue: "bad" })),
      {
        _tag: "AcpRequestError",
        code: -32700,
        data: { issue: "bad" },
        errorMessage: "Parse error",
      }
    );
    assert.deepEqual(encode(AcpError.AcpRequestError, AcpError.AcpRequestError.methodNotFound("x/test")), {
      _tag: "AcpRequestError",
      code: -32601,
      errorMessage: "Method not found: x/test",
    });
    assert.deepEqual(encode(AcpError.AcpProcessExitedError, AcpError.AcpProcessExitedError.make({ code: O.some(7) })), {
      _tag: "AcpProcessExitedError",
      code: 7,
    });
    assert.deepEqual(encode(AcpError.AcpProcessExitedError, AcpError.AcpProcessExitedError.make({})), {
      _tag: "AcpProcessExitedError",
    });
    assert.deepEqual(
      encode(AcpError.AcpProtocolParseError, AcpError.AcpProtocolParseError.make({ operation: "decode-wire-message" })),
      {
        _tag: "AcpProtocolParseError",
        operation: "decode-wire-message",
      }
    );
    assert.deepEqual(
      encode(AcpError.AcpTransportError, AcpError.AcpTransportError.make({ detail: O.some("stream closed") })),
      {
        _tag: "AcpTransportError",
        detail: "stream closed",
      }
    );
    assert.deepEqual(encode(AcpError.AcpInputStreamEndedError, AcpError.AcpInputStreamEndedError.make({})), {
      _tag: "AcpInputStreamEndedError",
    });
    assert.deepEqual(
      encode(AcpProtocol.AcpRequestContext, AcpProtocol.AcpRequestContext.make({ method: "x/test", requestId: 0 })),
      { method: "x/test", requestId: 0 }
    );
    assert.deepEqual(encode(AcpProtocol.AcpProtocolLoggingOptions, AcpProtocol.AcpProtocolLoggingOptions.make({})), {});
    assert.deepEqual(
      encode(AcpProtocol.AcpProtocolLoggingOptions, AcpProtocol.AcpProtocolLoggingOptions.make({ logIncoming: true })),
      {
        logIncoming: true,
      }
    );
    assert.deepEqual(
      encode(
        AcpProtocol.AcpProtocolLogEvent,
        yield* decodeAcpProtocolLogEvent({
          direction: "incoming",
          payload: "{}",
          stage: "raw",
        })
      ),
      {
        direction: "incoming",
        payload: "{}",
        stage: "raw",
      }
    );
    assert.deepEqual(
      encode(
        AcpProtocol.AcpIncomingNotification,
        yield* decodeAcpIncomingNotification({
          _tag: "ExtNotification",
          method: "x/custom",
          params: { ok: true },
        })
      ),
      {
        _tag: "ExtNotification",
        method: "x/custom",
        params: { ok: true },
      }
    );
  })
);

it.prop(
  "round-trips handwritten ACP schemas through encoded form",
  [
    AcpProtocolLogEventArbitrary,
    AcpProtocolLoggingOptionsArbitrary,
    AcpIncomingNotificationArbitrary,
    AcpRequestContextArbitrary,
    AcpErrorArbitrary,
  ],
  ([event, options, notification, context, error]) => {
    assertEncodedRoundTrip(AcpProtocol.AcpProtocolLogEvent, event);
    assertEncodedRoundTrip(AcpProtocol.AcpProtocolLoggingOptions, options);
    assertEncodedRoundTrip(AcpProtocol.AcpIncomingNotification, notification);
    assertEncodedRoundTrip(AcpProtocol.AcpRequestContext, context);
    assertEncodedRoundTrip(AcpError.AcpError, error);
  },
  { arbitrary: fcRuns(25) }
);

it.layer(NodeServices.layer, { timeout: "10 seconds" })("effect-acp protocol", (it) => {
  it.effect(
    "emits exact JSON-RPC notifications and decodes inbound session/update and both elicitation completions",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });

      const notifications = yield* Deferred.make<ReadonlyArray<AcpProtocol.AcpIncomingNotification>>();
      yield* transport.incoming.pipe(
        Stream.take(3),
        Stream.runCollect,
        Effect.flatMap((notificationChunk) => Deferred.succeed(notifications, notificationChunk)),
        Effect.forkScoped
      );

      yield* transport.notify("session/cancel", { sessionId: "session-1" });
      const outbound = yield* Queue.take(output);
      // A JSON-RPC notification carries no `id`; Grok CLI drops frames that do.
      assert.equal(outbound, '{"jsonrpc":"2.0","method":"session/cancel","params":{"sessionId":"session-1"}}\n');
      assert.deepEqual(yield* decodeSessionCancelNotification(outbound), {
        jsonrpc: "2.0",
        method: "session/cancel",
        params: {
          sessionId: "session-1",
        },
      });

      yield* Queue.offer(
        input,
        yield* encodeJsonl(SessionUpdateNotification, {
          jsonrpc: "2.0",
          method: "session/update",
          params: usageUpdate(10),
        })
      );
      yield* Queue.offer(
        input,
        yield* encodeJsonl(ElicitationCompleteNotification, {
          jsonrpc: "2.0",
          method: "elicitation/complete",
          params: { elicitationId: "elicitation-1" },
        })
      );
      yield* Queue.offer(
        input,
        yield* encodeJsonl(LegacyElicitationCompleteNotification, {
          jsonrpc: "2.0",
          method: "session/elicitation/complete",
          params: { elicitationId: "elicitation-2" },
        })
      );

      const [update, completion, legacyCompletion] = yield* Deferred.await(notifications);
      assert.equal(update?._tag, "SessionUpdate");
      assert.include(completion, { _tag: "ElicitationComplete", method: "elicitation/complete" });
      assert.include(legacyCompletion, { _tag: "ElicitationComplete", method: "session/elicitation/complete" });
    })
  );

  it.effect(
    "decodes escaped _meta keys on inbound frames after the host materialised a backslash key",
    Effect.fnUntraced(function* () {
      assert.deepEqual(yield* decodeJsonWithHostParser('{"beep-acp-regression":0,"\\\\":0}'), {
        "beep-acp-regression": 0,
        "\\": 0,
      });
      const { stdio, input } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });
      const notifications = yield* Deferred.make<ReadonlyArray<AcpProtocol.AcpIncomingNotification>>();
      yield* transport.incoming.pipe(
        Stream.take(1),
        Stream.runCollect,
        Effect.flatMap((notificationChunk) => Deferred.succeed(notifications, notificationChunk)),
        Effect.forkScoped
      );
      const meta = { "beep-acp-regression": 0, "\n": true };
      yield* Queue.offer(
        input,
        yield* encodeJsonl(SessionUpdateNotification, {
          jsonrpc: "2.0",
          method: "session/update",
          params: { ...usageUpdate(10), _meta: meta },
        })
      );
      const [update] = yield* Deferred.await(notifications);
      assert.equal(update?._tag, "SessionUpdate");
      if (update?._tag === "SessionUpdate") {
        assert.deepEqual(update.params._meta, meta);
      }
    })
  );

  it.effect(
    "terminates when a callback on the reader dies",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const termination = yield* Deferred.make<AcpError.AcpError>();
      yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        transformSessionUpdate: () => {
          throw new Error("normalizer bug");
        },
        onTermination: (error) => Deferred.succeed(termination, error).pipe(Effect.asVoid),
      });

      yield* Queue.offer(input, yield* jsonLine({ jsonrpc: "2.0", method: "session/update", params: usageUpdate(1) }));

      const error = yield* Deferred.await(termination);
      if (error._tag !== "AcpTransportError") {
        return assert.fail("expected a transport error");
      }
      assertSome(error.operation, "read-input-stream");
    })
  );

  it.effect(
    "logs outgoing notifications without an id or headers when logOutgoing is enabled",
    Effect.fnUntraced(function* () {
      const { stdio } = yield* makeInMemoryStdio();
      const events = A.empty<AcpProtocol.AcpProtocolLogEvent>();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        logOutgoing: true,
        logger: (event) =>
          Effect.sync(() => {
            A.appendInPlace(events, event);
          }),
      });

      yield* transport.notify("session/cancel", { sessionId: "session-1" });

      assert.deepEqual(events, [
        {
          direction: "outgoing",
          stage: "decoded",
          payload: {
            _tag: "Notification",
            tag: "session/cancel",
            payload: {
              sessionId: "session-1",
            },
          },
        },
        {
          direction: "outgoing",
          stage: "raw",
          payload: '{"jsonrpc":"2.0","method":"session/cancel","params":{"sessionId":"session-1"}}\n',
        },
      ]);
    })
  );

  it.effect(
    "logs decode failures without copying the cause or wire payload",
    Effect.fnUntraced(function* () {
      const secret = "acp-wire-secret-sentinel";
      const { stdio, input } = yield* makeInMemoryStdio();
      const events = A.empty<AcpProtocol.AcpProtocolLogEvent>();
      const termination = yield* Deferred.make<AcpError.AcpError>();
      yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        logIncoming: true,
        logger: (event) =>
          Effect.sync(() => {
            A.appendInPlace(events, event);
          }),
        onTermination: (error) => Deferred.succeed(termination, error).pipe(Effect.asVoid),
      });

      yield* Queue.offer(input, encoder.encode(`{"secret":"${secret}"\n`));
      yield* Deferred.await(termination);

      const event = A.findFirst(events, ({ stage }) => stage === "decode_failed");
      assertSome(event, {
        direction: "incoming",
        stage: "decode_failed",
        payload: {
          operation: "decode-wire-message",
        },
      });
      assert.notInclude(yield* event.pipe(O.getOrUndefined, encodeUnknownJsonText), secret);
    })
  );

  it.effect(
    "fails notification and request encoding through the declared ACP error channel",
    Effect.fnUntraced(function* () {
      const { stdio } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });

      const bigintError = yield* transport.notify("x/test", 1n).pipe(Effect.flip);
      if (bigintError._tag !== "AcpProtocolParseError") {
        return assert.fail("expected a protocol parse error");
      }
      assert.equal(bigintError.operation, "encode-message");
      assertSome(bigintError.method, "x/test");
      bigintError.cause.pipe(O.isSome, assertTrue);
      assert.equal(bigintError.message, "ACP protocol operation 'encode-message' failed for method 'x/test'.");

      const circular: Record<string, unknown> = {};
      circular.self = circular;
      const circularError = yield* transport.notify("x/test", circular).pipe(Effect.flip);
      if (circularError._tag !== "AcpProtocolParseError") {
        return assert.fail("expected a protocol parse error");
      }
      assert.equal(circularError.operation, "encode-message");
      assertSome(circularError.method, "x/test");

      const requestError = yield* expectFailure(transport.request("x/request", 1n));
      if (requestError._tag !== "AcpProtocolParseError") {
        return assert.fail("expected a protocol parse error");
      }
      assert.equal(requestError.operation, "encode-message");
      assertSome(requestError.method, "x/request");
      assertSome(requestError.requestId, 1);
    })
  );

  it.effect(
    "supports generic extension requests over the patched transport",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });

      const response = yield* transport.request("x/test", { hello: "world" }).pipe(Effect.forkScoped);
      const outbound = yield* Queue.take(output);
      assert.deepEqual(yield* decodeExtRequest(outbound), {
        jsonrpc: "2.0",
        id: 1,
        method: "x/test",
        params: {
          hello: "world",
        },
        headers: [],
      });

      yield* Queue.offer(input, yield* encodeJsonl(ExtResponse, { jsonrpc: "2.0", id: 1, result: { ok: true } }));

      assert.deepEqual(yield* Fiber.join(response), { ok: true });
    })
  );

  it.effect(
    "does not correlate a string response id with a numeric extension request id",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });

      const response = yield* transport.request("x/test", { hello: "world" }).pipe(Effect.forkScoped);
      yield* Queue.take(output);
      yield* Queue.offer(input, yield* jsonLine({ jsonrpc: "2.0", id: "1", result: { ok: false } }));
      yield* Effect.yieldNow;
      assert.isUndefined(response.pollUnsafe());

      yield* Queue.offer(input, yield* encodeJsonl(ExtResponse, { jsonrpc: "2.0", id: 1, result: { ok: true } }));
      assert.deepEqual(yield* Fiber.join(response), { ok: true });
    })
  );

  it.effect(
    "correlates extension response errors with the originating request",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });

      const response = yield* transport.request("x/private", { hello: "world" }).pipe(Effect.forkScoped);
      yield* Queue.take(output);
      yield* Queue.offer(
        input,
        yield* jsonLine({
          jsonrpc: "2.0",
          id: 1,
          error: {
            _tag: "Cause",
            code: -32602,
            message: "Invalid params",
            data: [{ _tag: "Fail", error: { code: -32602, message: "Invalid params", data: { field: "hello" } } }],
          },
        })
      );

      const error = yield* response.pipe(Fiber.join, expectFailure);
      if (error._tag !== "AcpRequestError") {
        return assert.fail("expected a request error");
      }
      assert.equal(error.code, -32602);
      assert.equal(error.errorMessage, "Invalid params");
      assertSome(error.method, "x/private");
      assertSome(error.requestId, 1);
      assertSome(error.operation, "receive-response");
    })
  );

  it.effect(
    "answers an extension request whose handler also dies as an internal error",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onExtRequest: () =>
          Effect.fail(AcpError.AcpRequestError.invalidParams("bad params")).pipe(
            Effect.ensuring(Effect.die("cleanup bug"))
          ),
      });

      yield* Queue.offer(
        input,
        yield* encodeJsonl(ExtRequest, {
          jsonrpc: "2.0",
          id: 9,
          method: "x/test",
          params: { hello: "world" },
          headers: [],
        })
      );

      const response = yield* decodeJsonRpcErrorResponse(yield* Queue.take(output));
      assert.equal(response.id, 9);
      assert.equal(response.error.code, -32603);
    })
  );

  it.effect(
    "preserves zero-valued ids for inbound core client requests",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const observed = yield* Deferred.make<readonly [AcpError.AcpRequestId, string]>();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.make("session/request_permission"),
        onIncomingRequest: (requestId, method) => Deferred.succeed(observed, [requestId, method]).pipe(Effect.asVoid),
      });
      const inboundRequest = yield* Deferred.make<unknown>();

      yield* transport.serverProtocol
        .run((_clientId, message) => Deferred.succeed(inboundRequest, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);

      const params = {
        sessionId: "session-1",
        title: "Allow mock action",
        subject: {
          type: "tool_call",
          toolCall: {
            toolCallId: "tool-1",
            title: "Allow mock action",
          },
        },
        options: [{ optionId: "allow", name: "Allow", kind: "allow_once" }],
      };
      yield* Queue.offer(
        input,
        yield* jsonLine({ jsonrpc: "2.0", id: 0, method: "session/request_permission", params, headers: [] })
      );

      assert.deepEqual(yield* Deferred.await(inboundRequest), {
        _tag: "Request",
        id: 0,
        tag: "session/request_permission",
        payload: params,
        headers: [],
      });
      assert.deepEqual(yield* Deferred.await(observed), [0, "session/request_permission"]);

      yield* transport.serverProtocol.send(0, {
        _tag: "Exit",
        requestId: 0,
        exit: {
          _tag: "Success",
          value: {
            outcome: {
              outcome: "selected",
              optionId: "allow",
            },
          },
        },
      });

      assert.deepEqual(yield* decodeRequestPermissionResponse(yield* Queue.take(output)), {
        jsonrpc: "2.0",
        id: 0,
        result: {
          outcome: {
            outcome: "selected",
            optionId: "allow",
          },
        },
      });
    })
  );

  it.effect(
    "acknowledges outgoing responses and reports encoding failures by request id",
    Effect.fnUntraced(function* () {
      const { stdio } = yield* makeInMemoryStdio();
      const acknowledged = yield* Deferred.make<AcpError.AcpRequestId>();
      const failed = yield* Deferred.make<readonly [AcpError.AcpRequestId, AcpError.AcpError]>();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onOutgoingResponse: (requestId) => Deferred.succeed(acknowledged, requestId).pipe(Effect.asVoid),
        onOutgoingResponseFailure: (requestId, error) =>
          Deferred.succeed(failed, [requestId, error]).pipe(Effect.asVoid),
      });

      yield* transport.serverProtocol.send(0, {
        _tag: "Exit",
        requestId: "success-1",
        exit: { _tag: "Success", value: { ok: true } },
      });
      assert.equal(yield* Deferred.await(acknowledged), "success-1");

      const circular: { self?: unknown } = {};
      circular.self = circular;
      yield* transport.serverProtocol
        .send(0, {
          _tag: "Exit",
          requestId: "failure-1",
          exit: { _tag: "Success", value: circular },
        })
        .pipe(Effect.exit);
      const [requestId, error] = yield* Deferred.await(failed);
      assert.equal(requestId, "failure-1");
      assert.instanceOf(error, AcpError.AcpProtocolParseError);
    })
  );

  it.effect(
    "acknowledges a response only after the stdout write completes",
    Effect.fnUntraced(function* () {
      const writeStarted = yield* Deferred.make<void>();
      const releaseWrite = yield* Deferred.make<void>();
      const acknowledged = yield* Deferred.make<AcpError.AcpRequestId>();
      const stdio = Stdio.make({
        args: Effect.succeed([]),
        stdin: Stream.never,
        stdout: () =>
          Sink.forEach(() =>
            Deferred.succeed(writeStarted, undefined).pipe(Effect.andThen(Deferred.await(releaseWrite)))
          ),
        stderr: () => Sink.drain,
      });
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onOutgoingResponse: (requestId) => Deferred.succeed(acknowledged, requestId).pipe(Effect.asVoid),
      });
      const sendFiber = yield* transport.serverProtocol
        .send(0, {
          _tag: "Exit",
          requestId: "held-write",
          exit: { _tag: "Success", value: { ok: true } },
        })
        .pipe(Effect.forkScoped);

      yield* Deferred.await(writeStarted);
      assert.isUndefined(sendFiber.pollUnsafe());
      assert.isFalse(yield* Deferred.isDone(acknowledged));
      yield* Deferred.succeed(releaseWrite, undefined);
      yield* Fiber.join(sendFiber);
      assert.equal(yield* Deferred.await(acknowledged), "held-write");
    })
  );

  it.effect(
    "fails current, queued, and future responses when the stdout writer fails",
    Effect.fnUntraced(function* () {
      const writeStarted = yield* Deferred.make<void>();
      const releaseFailure = yield* Deferred.make<void>();
      const failures = yield* Queue.unbounded<AcpError.AcpRequestId>();
      const terminated = yield* Deferred.make<AcpError.AcpError>();
      const stdio = Stdio.make({
        args: Effect.succeed([]),
        stdin: Stream.never,
        stdout: () =>
          Sink.forEach(() =>
            Deferred.succeed(writeStarted, undefined).pipe(
              Effect.andThen(Deferred.await(releaseFailure)),
              Effect.andThen(Effect.die("stdout failed"))
            )
          ),
        stderr: () => Sink.drain,
      });
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onOutgoingResponseFailure: (requestId) => Queue.offer(failures, requestId).pipe(Effect.asVoid),
        onTermination: (error) => Deferred.succeed(terminated, error).pipe(Effect.asVoid),
      });
      const send = (requestId: string) =>
        transport.serverProtocol
          .send(0, {
            _tag: "Exit",
            requestId,
            exit: { _tag: "Success", value: { ok: true } },
          })
          .pipe(Effect.exit);
      const current = yield* send("current").pipe(Effect.forkScoped);
      yield* Deferred.await(writeStarted);
      const queued = yield* send("queued").pipe(Effect.forkScoped);
      yield* Effect.yieldNow;
      assert.isUndefined(current.pollUnsafe());
      assert.isUndefined(queued.pollUnsafe());
      yield* Deferred.succeed(releaseFailure, undefined);
      assert.instanceOf(yield* Deferred.await(terminated), AcpError.AcpTransportError);
      yield* Fiber.join(current);
      yield* Fiber.join(queued);
      yield* send("future");

      assertTrue(
        Equal.equals(HashSet.fromIterable(yield* Queue.takeN(failures, 3)), HashSet.make("current", "queued", "future"))
      );
    })
  );

  it.effect(
    "atomically rejects an admitted response when the writer closes before queue offer",
    Effect.fnUntraced(function* () {
      const admitted = yield* Deferred.make<void>();
      const releaseAdmission = yield* Deferred.make<void>();
      const failures = yield* Queue.unbounded<AcpError.AcpRequestId>();
      const protocolReady = yield* Deferred.make<AcpProtocol.AcpPatchedProtocol>();
      const stdio = Stdio.make({
        args: Effect.succeed([]),
        stdin: Stream.never,
        stdout: () => Sink.drain,
        stderr: () => Sink.drain,
      });
      // The protocol lives in its own layer scope, held open by this fiber; interrupting it closes the
      // writer while a response is admitted but not yet queued.
      const protocolOwner = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onOutgoingResponseFailure: (requestId) => Queue.offer(failures, requestId).pipe(Effect.asVoid),
        testHooks: {
          onOutgoingWriteAdmitted: () =>
            Deferred.succeed(admitted, undefined).pipe(Effect.andThen(Deferred.await(releaseAdmission))),
        },
      }).pipe(
        Effect.flatMap((transport) => Deferred.succeed(protocolReady, transport)),
        Layer.effectDiscard,
        Layer.launch,
        Effect.forkScoped
      );
      const transport = yield* Deferred.await(protocolReady);
      const send = (requestId: string) =>
        transport.serverProtocol
          .send(0, {
            _tag: "Exit",
            requestId,
            exit: { _tag: "Success", value: { ok: true } },
          })
          .pipe(Effect.exit);
      const admittedSend = yield* send("admitted").pipe(Effect.forkScoped);

      yield* Deferred.await(admitted);
      yield* Fiber.interrupt(protocolOwner);
      yield* Deferred.succeed(releaseAdmission, undefined);
      yield* Fiber.join(admittedSend);
      yield* send("future");

      assert.deepEqual(yield* Queue.takeN(failures, 2), ["admitted", "future"]);
    })
  );

  it.effect(
    "drops agent-internal JSON-RPC responses with non-numeric request ids",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });
      const clientSeen = yield* Queue.unbounded<RpcMessage.FromServerEncoded>();
      yield* transport.clientProtocol
        .run(0, (message) => Queue.offer(clientSeen, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);
      const notifications = yield* Deferred.make<ReadonlyArray<AcpProtocol.AcpIncomingNotification>>();
      yield* transport.incoming.pipe(
        Stream.take(1),
        Stream.runCollect,
        Effect.flatMap((notificationChunk) => Deferred.succeed(notifications, notificationChunk)),
        Effect.forkScoped
      );

      yield* Queue.offer(input, yield* jsonLine({ jsonrpc: "2.0", id: "skills-reload", result: { reloaded: true } }));
      yield* Queue.offer(
        input,
        yield* encodeJsonl(SessionUpdateNotification, {
          jsonrpc: "2.0",
          method: "session/update",
          params: usageUpdate(5),
        })
      );

      const [update] = yield* Deferred.await(notifications);
      assert.equal(update?._tag, "SessionUpdate");
      assert.equal(yield* Queue.size(clientSeen), 0);
    })
  );

  it.effect(
    "cleans up interrupted extension requests before a late response arrives",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });
      const lateResponse = yield* Deferred.make<unknown>();

      yield* transport.clientProtocol
        .run(0, (message) => Deferred.succeed(lateResponse, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);

      const response = yield* transport.request("x/test", { hello: "world" }).pipe(Effect.forkScoped);
      assert.deepEqual(yield* decodeExtRequest(yield* Queue.take(output)), {
        jsonrpc: "2.0",
        id: 1,
        method: "x/test",
        params: {
          hello: "world",
        },
        headers: [],
      });

      yield* Fiber.interrupt(response);
      yield* Queue.offer(input, yield* encodeJsonl(ExtResponse, { jsonrpc: "2.0", id: 1, result: { ok: true } }));

      assert.deepEqual(yield* Deferred.await(lateResponse), {
        _tag: "Exit",
        requestId: 1,
        exit: {
          _tag: "Success",
          value: {
            ok: true,
          },
        },
      });
    })
  );

  it.effect(
    "does not treat intentional serverProtocol.end as a transport failure",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const terminations = yield* Ref.make(0);
      const writerExit = yield* Deferred.make<boolean>();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onTermination: () => Ref.update(terminations, (count) => count + 1),
        testHooks: {
          onOutgoingWriterExit: (intentionalEnd) => Deferred.succeed(writerExit, intentionalEnd).pipe(Effect.asVoid),
        },
      });

      yield* transport.serverProtocol.end(0);
      assertTrue(yield* Deferred.await(writerExit));
      assert.equal(yield* Ref.get(terminations), 0);

      yield* Queue.end(input);
    })
  );

  for (const operation of ["request", "notification"] as const) {
    it.effect(
      `rejects a ${operation} if the connection ends while its logger is running`,
      Effect.fnUntraced(function* () {
        const { stdio, input, output } = yield* makeInMemoryStdio();
        const writeStarted = yield* Deferred.make<void>();
        const releaseWrite = yield* Deferred.make<void>();
        const terminated = yield* Deferred.make<AcpError.AcpError>();
        const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
          stdio,
          serverRequestMethods: HashSet.empty(),
          logOutgoing: true,
          logger: (event) =>
            event.stage === "raw"
              ? Deferred.succeed(writeStarted, undefined).pipe(Effect.andThen(Deferred.await(releaseWrite)))
              : Effect.void,
          onTermination: (error) => Deferred.succeed(terminated, error).pipe(Effect.asVoid),
        });
        const send = yield* (
          operation === "request"
            ? transport.request("x/test", { hello: "world" })
            : transport.notify("session/cancel", { sessionId: "session-1" })
        ).pipe(Effect.forkScoped);

        yield* Deferred.await(writeStarted);
        yield* Queue.end(input);
        const error = yield* Deferred.await(terminated);
        yield* Deferred.succeed(releaseWrite, undefined);

        assert.strictEqual(yield* send.pipe(Fiber.join, expectFailure), error);
        assert.equal(yield* Queue.size(output), 0);
      })
    );
  }

  it.effect(
    "fails requests, notifications and responses at once after the connection ended",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const terminated = yield* Deferred.make<AcpError.AcpError>();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onTermination: (error) => Deferred.succeed(terminated, error).pipe(Effect.asVoid),
      });

      yield* Queue.end(input);
      const error = yield* Deferred.await(terminated);
      assert.instanceOf(error, AcpError.AcpInputStreamEndedError);

      assert.strictEqual(yield* expectFailure(transport.request("x/test", { hello: "world" })), error);
      assert.strictEqual(yield* expectFailure(transport.notify("session/cancel", { sessionId: "session-1" })), error);
      const clientSend = yield* expectFailure(
        transport.clientProtocol.send(0, { _tag: "Request", id: 5, tag: "x/test", payload: {}, headers: [] })
      );
      assert.equal(clientSend.reason._tag, "RpcClientDefect");
      assert.strictEqual(clientSend.reason.cause, error);
      assert.equal(yield* Queue.size(output), 0);
    })
  );

  it.effect(
    "never forwards @effect/rpc/Interrupt to the peer",
    Effect.fnUntraced(function* () {
      const { stdio, output } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });

      yield* transport.clientProtocol.send(0, { _tag: "Interrupt", requestId: AcpProtocol.RPC_REQUEST_ID_START });
      yield* transport.notify("session/cancel", { sessionId: "session-1" });

      assert.equal(
        yield* Queue.take(output),
        '{"jsonrpc":"2.0","method":"session/cancel","params":{"sessionId":"session-1"}}\n'
      );
      assert.equal(yield* Queue.size(output), 0);
    })
  );

  it.effect(
    "keeps answering after more than 1,024 notifications nobody drains",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const handled = yield* Ref.make(0);
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onNotification: () => Ref.update(handled, (count) => count + 1),
        onExtRequest: () => Effect.succeed({ ok: true }),
      });

      const notificationCount = 1_100;
      const lines = A.makeBy(notificationCount, (index) => `{"jsonrpc":"2.0","method":"x/note","params":${index}}\n`);
      yield* Queue.offer(
        input,
        encoder.encode(`${A.join(lines, "")}{"jsonrpc":"2.0","id":77,"method":"x/test","params":{"hello":"world"}}\n`)
      );

      assert.deepEqual(yield* S.decodeEffect(AcpJson.fromJsonText(ExtResponse))(yield* Queue.take(output)), {
        jsonrpc: "2.0",
        id: 77,
        result: { ok: true },
      });
      assert.equal(yield* Ref.get(handled), notificationCount);
      // The undrained buffer slides: the oldest notifications were dropped, the newest are kept.
      const [oldestKept] = yield* transport.incoming.pipe(Stream.take(1), Stream.runCollect);
      assert.deepEqual(oldestKept, { _tag: "ExtNotification", method: "x/note", params: notificationCount - 1_024 });
    })
  );

  it.effect(
    "lets an extension request handler await an outbound request on the same connection",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const protocolReady = yield* Deferred.make<AcpProtocol.AcpPatchedProtocol>();
      const contexts = yield* Queue.unbounded<AcpProtocol.AcpRequestContext>();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onExtRequest: (_method, _params, context) =>
          Queue.offer(contexts, context).pipe(
            Effect.andThen(Deferred.await(protocolReady)),
            Effect.flatMap((protocol) => protocol.request("x/inner", { from: String(context.requestId) })),
            Effect.map((inner) => ({ inner }))
          ),
      });
      yield* Deferred.succeed(protocolReady, transport);

      yield* Queue.offer(input, yield* jsonLine({ jsonrpc: "2.0", id: "outer-1", method: "x/outer", params: {} }));
      assert.deepEqual(yield* decodeInnerRequest(yield* Queue.take(output)), {
        jsonrpc: "2.0",
        id: 1,
        method: "x/inner",
        params: { from: "outer-1" },
        headers: [],
      });
      const context = yield* Queue.take(contexts);
      assert.equal(context.method, "x/outer");
      assert.equal(context.requestId, "outer-1");

      yield* Queue.offer(input, yield* encodeJsonl(ExtResponse, { jsonrpc: "2.0", id: 1, result: { ok: true } }));
      assert.deepEqual(yield* decodeOuterResponse(yield* Queue.take(output)), {
        jsonrpc: "2.0",
        id: "outer-1",
        result: { inner: { ok: true } },
      });
    })
  );

  it.effect(
    "skips whitespace-only lines instead of terminating",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const terminated = yield* Ref.make(false);
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onTermination: () => Ref.set(terminated, true),
      });

      yield* Queue.offer(input, encoder.encode('\n   \n\t\r\n{"jsonrpc":"2.0","method":"x/after-blank","params":1}\n'));
      const [notification] = yield* transport.incoming.pipe(Stream.take(1), Stream.runCollect);
      assert.deepEqual(notification, { _tag: "ExtNotification", method: "x/after-blank", params: 1 });
      assert.isFalse(yield* Ref.get(terminated));
    })
  );

  it.effect(
    "fails pending extension requests with the propagated exit code",
    Effect.fnUntraced(function* () {
      const { stdio, input, output } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        terminationError: Effect.succeed(AcpError.AcpProcessExitedError.make({ code: O.some(0) })),
        serverRequestMethods: HashSet.empty(),
      });

      const response = yield* transport.request("x/test", { hello: "world" }).pipe(Effect.forkScoped);
      yield* Queue.take(output);
      yield* Queue.end(input);

      const error = yield* response.pipe(Fiber.join, expectFailure);
      if (error._tag !== "AcpProcessExitedError") {
        return assert.fail("expected a process exit error");
      }
      assertSome(error.code, 0);
    })
  );

  it.effect(
    "propagates the real child exit code when the input stream ends",
    Effect.fnUntraced(function* () {
      const handle = yield* spawnBunScript("process.exit(7)");
      const firstMessage = yield* Deferred.make<RpcMessage.FromServerEncoded>();
      const termination = yield* Deferred.make<AcpError.AcpError>();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio: makeChildStdio(handle),
        terminationError: makeTerminationError(handle),
        serverRequestMethods: HashSet.empty(),
        onTermination: (error) => Deferred.succeed(termination, error).pipe(Effect.asVoid),
      });

      yield* transport.clientProtocol
        .run(0, (message) => Deferred.succeed(firstMessage, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);

      const defectCause = terminatedDefectOf(yield* Deferred.await(firstMessage));
      const exitError = yield* Deferred.await(termination);
      if (exitError._tag !== "AcpProcessExitedError") {
        return assert.fail("expected a process exit error");
      }
      assertSome(exitError.code, 7);
      assertSome(exitError.pid, handle.pid);
      assertNone(exitError.signal);
      assert.strictEqual(defectCause, exitError);
    }),
    childProcessProtocolTestTimeout
  );

  it.effect(
    "does not emit a second process-exit error after a decode failure",
    Effect.fnUntraced(function* () {
      const handle = yield* spawnBunScript('process.stdout.write("{not-json}\\n"); process.exit(23)');
      const terminationCalls = yield* Ref.make(0);
      const terminationObserved = yield* Deferred.make<void>();
      const firstMessage = yield* Deferred.make<RpcMessage.FromServerEncoded>();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio: makeChildStdio(handle),
        terminationError: makeTerminationError(handle),
        serverRequestMethods: HashSet.empty(),
        onTermination: () =>
          Ref.update(terminationCalls, (count) => count + 1).pipe(
            Effect.andThen(Deferred.succeed(terminationObserved, undefined))
          ),
      });

      yield* transport.clientProtocol
        .run(0, (message) => Deferred.succeed(firstMessage, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);

      const defectCause = terminatedDefectOf(yield* Deferred.await(firstMessage));
      yield* Deferred.await(terminationObserved);
      assert.equal(yield* Ref.get(terminationCalls), 1);
      assert.instanceOf(defectCause, AcpError.AcpProtocolParseError);
      assert.include(defectCause, { operation: "decode-wire-message" });

      assert.equal(yield* handle.exitCode, 23);
      assert.equal(yield* Ref.get(terminationCalls), 1);
    }),
    childProcessProtocolTestTimeout
  );
});

// One bad update must not end a session whose later updates are fine; each distinct failure is
// warned about once per connection, with structural diagnostics only.
const capturedWarnings = A.empty<unknown>();
const warningCollector = Logger.make(({ fiber, logLevel }) => {
  if (logLevel === "Warn") {
    A.appendInPlace(capturedWarnings, fiber.getRef(References.CurrentLogAnnotations));
  }
});

it.layer(Logger.layer([warningCollector]), { timeout: "10 seconds" })("effect-acp notification decoding", (it) => {
  it.effect(
    "drops a session/update that fails to decode and keeps reading",
    Effect.fnUntraced(function* () {
      const secret = "acp-core-notification-secret-sentinel";
      const { stdio, input } = yield* makeInMemoryStdio();
      const events = A.empty<AcpProtocol.AcpProtocolLogEvent>();
      const terminated = yield* Ref.make(false);
      let transformCalls = 0;
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        logIncoming: true,
        logger: (event) =>
          Effect.sync(() => {
            A.appendInPlace(events, event);
          }),
        transformSessionUpdate: (notification) => {
          transformCalls += 1;
          return notification;
        },
        onTermination: () => Ref.set(terminated, true),
      });
      const received = yield* Deferred.make<AcpProtocol.AcpIncomingNotification>();
      yield* transport.incoming.pipe(
        Stream.runForEach((notification) => Deferred.succeed(received, notification)),
        Effect.forkScoped
      );

      const malformed = {
        sessionId: "session-1",
        update: { sessionUpdate: "usage_update", cost: { amount: 1, currency: secret } },
      };
      yield* Queue.offer(input, yield* jsonLine({ jsonrpc: "2.0", method: "session/update", params: malformed }));
      yield* Queue.offer(input, yield* jsonLine({ jsonrpc: "2.0", method: "session/update", params: malformed }));
      yield* Queue.offer(input, yield* jsonLine({ jsonrpc: "2.0", method: "session/update", params: usageUpdate(10) }));

      const notification = yield* Deferred.await(received);
      assert.equal(notification._tag, "SessionUpdate");
      assert.deepEqual(notification.params, usageUpdate(10));
      assert.isFalse(yield* Ref.get(terminated));
      assert.equal(transformCalls, 1);

      const decodeFailures = A.filter(events, ({ stage }) => stage === "decode_failed");
      assert.lengthOf(decodeFailures, 2);
      assert.include(decodeFailures[0]?.payload, {
        method: "session/update",
        operation: "decode-notification-payload",
      });
      assert.lengthOf(capturedWarnings, 1);
      assert.include(yield* encodeUnknownJsonText(capturedWarnings[0]), "update.used missing");
      assert.include(yield* encodeUnknownJsonText(decodeFailures[0]?.payload), "update.used missing");
      assert.notInclude(yield* encodeUnknownJsonText({ decodeFailures, capturedWarnings }), secret);
    })
  );
});

const effectFrameParser = RpcSerialization.ndJsonRpc().makeUnsafe();

// Inbound ids pass through verbatim, so effect's own ndjson decoder output is the parity oracle for
// the package frame decoder.
const oracle = (line: string): ReadonlyArray<unknown> => effectFrameParser.decode(`${line}\n`);

it.layer(NodeServices.layer, { timeout: "10 seconds" })("effect-acp frame decoder parity", (it) => {
  it.effect(
    "routes every JSON-RPC frame kind exactly like effect's ndjson serializer",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.make("session/request_permission"),
      });
      const serverSeen = yield* Queue.unbounded<unknown>();
      const clientSeen = yield* Queue.unbounded<unknown>();
      yield* transport.serverProtocol
        .run((_clientId, message) => Queue.offer(serverSeen, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);
      yield* transport.clientProtocol
        .run(0, (message) => Queue.offer(clientSeen, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);

      const serverFrames = [
        '{"jsonrpc":"2.0","id":7,"method":"session/request_permission","params":{"sessionId":"s","toolCall":{"toolCallId":"t","title":"x"},"options":[]}}',
        '{"jsonrpc":"2.0","method":"@effect/rpc/Ping"}',
        '{"jsonrpc":"2.0","method":"@effect/rpc/Ack","params":{"requestId":"r1"}}',
      ];
      for (const line of serverFrames) {
        yield* Queue.offer(input, encoder.encode(`${line}\n`));
        assert.deepEqual([yield* Queue.take(serverSeen)], oracle(line));
      }

      const clientFrames = [
        '{"jsonrpc":"2.0","id":6,"result":{"ok":true}}',
        '{"jsonrpc":"2.0","id":8,"error":{"code":-32000,"message":"boom","data":{"k":1}}}',
        '{"jsonrpc":"2.0","id":9,"error":{"_tag":"Cause","code":-32602,"message":"bad","data":[{"_tag":"Fail","error":{"code":-32602,"message":"bad"}},{"_tag":"Die","defect":"x"}]}}',
        '{"jsonrpc":"2.0","id":10,"error":{"_tag":"Defect","code":-32603,"message":"defect","data":{"boom":true}}}',
        '{"jsonrpc":"2.0","id":11,"chunk":true,"result":[1,2]}',
      ];
      for (const line of clientFrames) {
        yield* Queue.offer(input, encoder.encode(`${line}\n`));
        assert.deepEqual([yield* Queue.take(clientSeen)], oracle(line));
      }
    })
  );

  it.effect(
    "splits batch frames and reassembles UTF-8 fragmented across chunks",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });
      const notifications = yield* Queue.unbounded<AcpProtocol.AcpIncomingNotification>();
      yield* transport.incoming.pipe(
        Stream.runForEach((notification) => Queue.offer(notifications, notification)),
        Effect.forkScoped
      );

      yield* Queue.offer(
        input,
        encoder.encode(
          '[{"jsonrpc":"2.0","method":"x/one","params":1},{"jsonrpc":"2.0","method":"x/two","params":2}]\n'
        )
      );
      assert.deepEqual(yield* Queue.take(notifications), { _tag: "ExtNotification", method: "x/one", params: 1 });
      assert.deepEqual(yield* Queue.take(notifications), { _tag: "ExtNotification", method: "x/two", params: 2 });

      const bytes = encoder.encode('{"jsonrpc":"2.0","method":"x/utf8","params":{"text":"😀é"}}\n');
      // Cut inside the four-byte emoji, then again right before the newline.
      const insideEmoji = bytes.indexOf(0xf0) + 2;
      yield* Queue.offer(input, bytes.slice(0, insideEmoji));
      yield* Queue.offer(input, bytes.slice(insideEmoji, bytes.length - 1));
      yield* Queue.offer(input, bytes.slice(bytes.length - 1));
      assert.deepEqual(yield* Queue.take(notifications), {
        _tag: "ExtNotification",
        method: "x/utf8",
        params: { text: "😀é" },
      });
    })
  );

  it.effect(
    "terminates with a parse error when a frame exceeds the buffer limit",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const termination = yield* Deferred.make<AcpError.AcpError>();
      yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        onTermination: (error) => Deferred.succeed(termination, error).pipe(Effect.asVoid),
      });

      yield* Queue.offer(input, new Uint8Array(16 * 1024 * 1024 + 1).fill(0x20));

      assert.include(expectParseTermination(yield* Deferred.await(termination)), {
        _tag: "MaxBufferSizeExceeded",
        maxBufferSize: 16 * 1024 * 1024,
      });
    })
  );
});

const expectParseTermination = (error: AcpError.AcpError): unknown =>
  AcpError.AcpError.match(error, {
    AcpInputStreamEndedError: () => assert.fail("expected a protocol parse error"),
    AcpProcessExitedError: () => assert.fail("expected a protocol parse error"),
    AcpProtocolParseError: (failure) => O.getOrThrow(failure.cause),
    AcpRequestError: () => assert.fail("expected a protocol parse error"),
    AcpSpawnError: () => assert.fail("expected a protocol parse error"),
    AcpTransportError: () => assert.fail("expected a protocol parse error"),
  });

it.layer(NodeServices.layer, { timeout: "10 seconds" })("effect-acp frame decoder edge cases", (it) => {
  it.effect(
    "routes the remaining control frames, cause shapes, and params-less requests",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.make("session/request_permission"),
      });
      const serverSeen = yield* Queue.unbounded<unknown>();
      const clientSeen = yield* Queue.unbounded<unknown>();
      yield* transport.serverProtocol
        .run((_clientId, message) => Queue.offer(serverSeen, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);
      yield* transport.clientProtocol
        .run(0, (message) => Queue.offer(clientSeen, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);

      const serverFrames = [
        '{"jsonrpc":"2.0","method":"@effect/rpc/Interrupt","params":{"requestId":3}}',
        '{"jsonrpc":"2.0","method":"@effect/rpc/Eof"}',
        '{"jsonrpc":"2.0","id":12,"method":"session/request_permission"}',
        '{"jsonrpc":"2.0","id":16,"method":"session/request_permission","params":{},"headers":[["x-trace","1"]]}',
      ];
      for (const line of serverFrames) {
        yield* Queue.offer(input, encoder.encode(`${line}\n`));
        assert.deepEqual([yield* Queue.take(serverSeen)], oracle(line));
      }

      yield* Queue.offer(input, encoder.encode('{"jsonrpc":"2.0","method":"@effect/rpc/Pong"}\n'));
      assert.deepEqual(yield* Queue.take(clientSeen), { _tag: "Pong" });
      // A response without an id is not a typed RPC response, so it never reaches the RpcClient.
      yield* Queue.offer(input, encoder.encode('{"jsonrpc":"2.0","result":1}\n'));

      // An Interrupt cause entry always materialises its fiberId key, and cause data that is not a
      // cause array degrades to a single Die entry carrying the whole error object.
      yield* Queue.offer(
        input,
        encoder.encode(
          '{"jsonrpc":"2.0","id":13,"error":{"_tag":"Cause","code":1,"message":"stop","data":[{"_tag":"Interrupt"}]}}\n'
        )
      );
      assert.deepEqual(yield* Queue.take(clientSeen), {
        _tag: "Exit",
        requestId: 13,
        exit: { _tag: "Failure", cause: [{ _tag: "Interrupt", fiberId: undefined }] },
      });
      // Effect's JSON RPC codec encodes a missing interrupt fiberId as null; it stays an Interrupt.
      yield* Queue.offer(
        input,
        encoder.encode(
          '{"jsonrpc":"2.0","id":113,"error":{"_tag":"Cause","code":1,"message":"stop","data":[{"_tag":"Interrupt","fiberId":null}]}}\n'
        )
      );
      assert.deepEqual(yield* Queue.take(clientSeen), {
        _tag: "Exit",
        requestId: 113,
        exit: { _tag: "Failure", cause: [{ _tag: "Interrupt", fiberId: null }] },
      });
      // That single Die entry is a protocol-shaped error object, so it is restored to a typed Fail.
      yield* Queue.offer(
        input,
        encoder.encode('{"jsonrpc":"2.0","id":14,"error":{"_tag":"Cause","code":2,"message":"odd","data":"oops"}}\n')
      );
      assert.deepEqual(yield* Queue.take(clientSeen), {
        _tag: "Exit",
        requestId: 14,
        exit: {
          _tag: "Failure",
          cause: [{ _tag: "Fail", error: { _tag: "Cause", code: 2, message: "odd", data: "oops" } }],
        },
      });
    })
  );

  const terminations: ReadonlyArray<readonly [title: string, frame: Uint8Array, tag: string]> = [
    ["an empty chunk result", encoder.encode('{"jsonrpc":"2.0","id":15,"chunk":true,"result":[]}\n'), "SchemaError"],
    [
      "a control frame without a requestId",
      encoder.encode('{"jsonrpc":"2.0","method":"@effect/rpc/Ack","params":{}}\n'),
      "SchemaError",
    ],
    [
      "a line longer than the buffer limit",
      encoder.encode(`${" ".repeat(16 * 1024 * 1024 + 1)}\n`),
      "MaxBufferSizeExceeded",
    ],
  ];
  for (const [title, frame, tag] of terminations) {
    it.effect(
      `terminates with a parse error on ${title}`,
      Effect.fnUntraced(function* () {
        const { stdio, input } = yield* makeInMemoryStdio();
        const termination = yield* Deferred.make<AcpError.AcpError>();
        yield* AcpProtocol.makeAcpPatchedProtocol({
          stdio,
          serverRequestMethods: HashSet.empty(),
          onTermination: (error) => Deferred.succeed(termination, error).pipe(Effect.asVoid),
        });
        yield* Queue.offer(input, frame);
        assert.include(expectParseTermination(yield* Deferred.await(termination)), { _tag: tag });
      })
    );
  }
});

it.layer(NodeServices.layer, { timeout: "30 seconds" })("effect-acp untagged error decoding", (it) => {
  it.effect(
    "surfaces an untagged JSON-RPC error response as a Fail cause entry, never a Die defect",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });
      const clientSeen = yield* Queue.unbounded<unknown>();
      yield* transport.clientProtocol
        .run(0, (message) => Queue.offer(clientSeen, message).pipe(Effect.asVoid))
        .pipe(Effect.forkScoped);

      yield* Queue.offer(
        input,
        encoder.encode('{"jsonrpc":"2.0","id":8,"error":{"code":-32000,"message":"boom","data":{"k":1}}}\n')
      );

      // effect rc.117 parity: RpcSerialization maps a plain error object to `Fail`, so ACP
      // consumers receive a typed error on the Cause channel rather than a `Die` defect.
      assert.deepEqual(yield* Queue.take(clientSeen), {
        _tag: "Exit",
        requestId: 8,
        exit: {
          _tag: "Failure",
          cause: [{ _tag: "Fail", error: { code: -32000, message: "boom", data: { k: 1 } } }],
        },
      });
    })
  );
});

it.layer(NodeServices.layer, { timeout: "10 seconds" })("effect-acp dual-generation session updates", (it) => {
  // Raw `session/update` frames: generation-1 and future updates the generation-2 codec rejects.
  const RawSessionUpdateNotification = jsonRpcNotification("session/update", S.Unknown);

  it.effect(
    "decodes generation-1 updates and a generation-2 idle that carries the prompt error",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
      });
      const notifications = yield* Deferred.make<ReadonlyArray<AcpProtocol.AcpIncomingNotification>>();
      yield* transport.incoming.pipe(
        Stream.take(3),
        Stream.runCollect,
        Effect.flatMap((chunk) => Deferred.succeed(notifications, chunk)),
        Effect.forkScoped
      );

      const v1Chunk = { sessionUpdate: "agent_message_chunk", content: { type: "text", text: "hi" } };
      const v1ToolCall = { sessionUpdate: "tool_call", toolCallId: "tool-1", title: "Read file" };
      const idle = {
        sessionUpdate: "state_update",
        state: "idle",
        stopReason: "end_turn",
        error: { code: -32603, message: "Internal error" },
      };
      for (const update of [v1Chunk, v1ToolCall, idle]) {
        yield* Queue.offer(
          input,
          yield* encodeJsonl(RawSessionUpdateNotification, {
            jsonrpc: "2.0",
            method: "session/update",
            params: { sessionId: "s-1", update },
          })
        );
      }

      const received = yield* Deferred.await(notifications);
      assert.deepEqual(
        A.map(received, (notification) =>
          notification._tag === "SessionUpdate" ? notification.params.update : assert.fail("expected a session update")
        ),
        [v1Chunk, v1ToolCall, idle]
      );
    })
  );

  it.effect(
    "dispatches the transformed (compat) session update",
    Effect.fnUntraced(function* () {
      const { stdio, input } = yield* makeInMemoryStdio();
      const transport = yield* AcpProtocol.makeAcpPatchedProtocol({
        stdio,
        serverRequestMethods: HashSet.empty(),
        transformSessionUpdate: (notification) => ({
          sessionId: notification.sessionId,
          update: {
            sessionUpdate: "_acp_unknown",
            originalSessionUpdate: notification.update.sessionUpdate,
            raw: null,
          },
        }),
      });
      const notification = yield* Deferred.make<AcpProtocol.AcpIncomingNotification>();
      yield* transport.incoming.pipe(
        Stream.runHead,
        Effect.flatMap((head) => Deferred.succeed(notification, O.getOrThrow(head))),
        Effect.forkScoped
      );

      yield* Queue.offer(
        input,
        yield* encodeJsonl(RawSessionUpdateNotification, {
          jsonrpc: "2.0",
          method: "session/update",
          params: { sessionId: "s-1", update: { sessionUpdate: "timeline_update", entries: [] } },
        })
      );

      assert.deepEqual(yield* Deferred.await(notification), {
        _tag: "SessionUpdate",
        method: "session/update",
        params: {
          sessionId: "s-1",
          update: { sessionUpdate: "_acp_unknown", originalSessionUpdate: "timeline_update", raw: null },
        },
      });
    })
  );
});
