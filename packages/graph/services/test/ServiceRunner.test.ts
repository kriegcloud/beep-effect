import type { NatsMessage } from "@beep/graph-messaging/NatsClient";
import { NatsClient } from "@beep/graph-messaging/NatsClient";
import { makeServiceRunner } from "@beep/graph-services/ServiceRunner";
import { describe, expect, it } from "@effect/vitest";
import { Deferred, Effect, Layer, Schema, Stream } from "effect";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const TestRequest = Schema.Struct({ query: Schema.String });
const TestResponse = Schema.Struct({ answer: Schema.String });

type TestReq = typeof TestRequest.Type;
type TestRes = typeof TestResponse.Type;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeNatsMessage = (
  body: string,
  id: string,
  overrides?: { ack?: () => Effect.Effect<void>; nak?: () => Effect.Effect<void> }
): NatsMessage => ({
  data: new TextEncoder().encode(body),
  subject: "test.request",
  headers: { "Nats-Msg-Id": id },
  properties: { id },
  ack: overrides?.ack ?? (() => Effect.void),
  nak: overrides?.nak ?? (() => Effect.void),
});

/**
 * Create a mock NatsClient with a finite message stream.
 * Uses a Deferred to signal when the consumer loop has finished processing.
 */
const makeMockNats = (
  messages: NatsMessage[],
  published: Array<{ topic: string; data: string; headers?: Record<string, string> }>,
  done: Deferred.Deferred<void>
) =>
  Layer.succeed(NatsClient)(
    NatsClient.of({
      publish: (topic, data, headers) =>
        Effect.sync(() => {
          published.push({ topic, data: new TextDecoder().decode(data), headers });
        }),
      subscribe: () =>
        Effect.succeed(
          Stream.fromIterable(messages).pipe(
            Stream.concat(
              // Signal done after all messages are processed, then block
              // to keep the consumer alive until the scope closes
              Stream.fromEffect(
                Effect.gen(function* () {
                  yield* Deferred.succeed(done, undefined);
                  // Block forever — scope interruption will clean this up
                  yield* Effect.never;
                })
              )
            )
          )
        ),
      // biome-ignore lint/suspicious/noExplicitAny: test mock — jetstream not used
      jetstream: undefined as any,
    })
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ServiceRunner", () => {
  it.effect("decodes request, calls handler, encodes and publishes response", () =>
    Effect.gen(function* () {
      const published: Array<{ topic: string; data: string; headers?: Record<string, string> }> = [];
      const done = yield* Deferred.make<void>();
      const requestBody = JSON.stringify({ query: "What is Effect?" });
      const msg = makeNatsMessage(requestBody, "req-1");

      const MockNats = makeMockNats([msg], published, done);

      yield* Effect.gen(function* () {
        yield* makeServiceRunner<TestReq, TestRes, never, never>({
          name: "test-service",
          requestTopic: "test.request",
          responseTopic: "test.response",
          consumerGroup: "test-group",
          requestDecoder: TestRequest,
          responseEncoder: TestResponse,
          handler: (req, _id) => Effect.succeed({ answer: `Answer to: ${req.query}` }),
        });

        // Wait for the stream to finish processing all messages
        yield* Deferred.await(done);
      }).pipe(Effect.provide(MockNats), Effect.scoped);

      expect(published.length).toBeGreaterThanOrEqual(1);
      const response = JSON.parse(published[0]!.data);
      expect(response.answer).toBe("Answer to: What is Effect?");
      expect(published[0]!.headers?.["Nats-Msg-Id"]).toBe("req-1");
    })
  );

  it.effect("naks on decode failure and keeps consumer alive", () =>
    Effect.gen(function* () {
      const published: Array<{ topic: string; data: string; headers?: Record<string, string> }> = [];
      const nakCount = { value: 0 };
      const done = yield* Deferred.make<void>();

      const badMsg = makeNatsMessage("not valid json{", "bad-1", {
        nak: () =>
          Effect.sync(() => {
            nakCount.value++;
          }),
      });
      const goodMsg = makeNatsMessage(JSON.stringify({ query: "hello" }), "good-1");

      const MockNats = makeMockNats([badMsg, goodMsg], published, done);

      yield* Effect.gen(function* () {
        yield* makeServiceRunner<TestReq, TestRes, never, never>({
          name: "test-service",
          requestTopic: "test.request",
          responseTopic: "test.response",
          consumerGroup: "test-group",
          requestDecoder: TestRequest,
          responseEncoder: TestResponse,
          handler: (_req) => Effect.succeed({ answer: "ok" }),
        });

        yield* Deferred.await(done);
      }).pipe(Effect.provide(MockNats), Effect.scoped);

      // Bad message should have been nak'd
      expect(nakCount.value).toBeGreaterThanOrEqual(1);
      // Good message should have produced a published response
      expect(published.length).toBeGreaterThanOrEqual(1);
    })
  );

  it.effect("naks and continues when handler fails", () =>
    Effect.gen(function* () {
      const published: Array<{ topic: string; data: string; headers?: Record<string, string> }> = [];
      const nakCount = { value: 0 };
      const done = yield* Deferred.make<void>();

      const msg = makeNatsMessage(JSON.stringify({ query: "fail me" }), "fail-1", {
        nak: () =>
          Effect.sync(() => {
            nakCount.value++;
          }),
      });

      const MockNats = makeMockNats([msg], published, done);

      yield* Effect.gen(function* () {
        yield* makeServiceRunner({
          name: "test-service",
          requestTopic: "test.request",
          responseTopic: "test.response",
          consumerGroup: "test-group",
          requestDecoder: TestRequest,
          responseEncoder: TestResponse,
          handler: () => Effect.fail("boom" as never),
        });

        yield* Deferred.await(done);
      }).pipe(Effect.provide(MockNats), Effect.scoped);

      expect(nakCount.value).toBeGreaterThanOrEqual(1);
    })
  );
});
