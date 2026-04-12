import { NatsClient } from "@beep/beepgraph-messaging/NatsClient";
import { makeTypedProducer } from "@beep/beepgraph-services/TypedProducer";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Schema } from "effect";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const TestMessage = Schema.Struct({
  query: Schema.String,
  count: Schema.Number,
});

type TestMsg = typeof TestMessage.Type;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TypedProducer", () => {
  it.effect("encodes and publishes a typed message with the correct headers", () =>
    Effect.gen(function* () {
      const published: Array<{ topic: string; data: string; headers?: Record<string, string> }> = [];

      const MockNats = Layer.succeed(NatsClient)(
        NatsClient.of({
          publish: (topic, data, headers) =>
            Effect.sync(() => {
              published.push({ topic, data: new TextDecoder().decode(data), headers });
            }),
          // biome-ignore lint/suspicious/noExplicitAny: test mock — subscribe not used
          subscribe: () => Effect.succeed(undefined as any),
          // biome-ignore lint/suspicious/noExplicitAny: test mock — jetstream not used
          jetstream: undefined as any,
        })
      );

      const producer = yield* makeTypedProducer<TestMsg>("test.topic", TestMessage).pipe(Effect.provide(MockNats));

      yield* producer.send("msg-1", { query: "hello", count: 42 }).pipe(Effect.provide(MockNats));

      expect(published.length).toBe(1);
      const parsed = JSON.parse(published[0]!.data);
      expect(parsed.query).toBe("hello");
      expect(parsed.count).toBe(42);
      expect(published[0]!.headers?.["Nats-Msg-Id"]).toBe("msg-1");
    })
  );

  it.effect("fails with MessageSendError when encoding fails", () =>
    Effect.gen(function* () {
      // Use a schema that requires a string for `query`, then pass a number
      const StrictSchema = Schema.Struct({ query: Schema.String });

      const MockNats = Layer.succeed(NatsClient)(
        NatsClient.of({
          publish: () => Effect.void,
          // biome-ignore lint/suspicious/noExplicitAny: test mock — subscribe not used
          subscribe: () => Effect.succeed(undefined as any),
          // biome-ignore lint/suspicious/noExplicitAny: test mock — jetstream not used
          jetstream: undefined as any,
        })
      );

      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing wrong type to test error path
      const producer = yield* makeTypedProducer<any>("test.topic", StrictSchema).pipe(Effect.provide(MockNats));

      // Passing a number where string is expected should fail encoding
      // biome-ignore lint/suspicious/noExplicitAny: intentionally passing wrong type to test error path
      const exit = yield* producer.send("bad-1", { query: 12345 } as any).pipe(Effect.provide(MockNats), Effect.exit);

      expect(exit._tag).toBe("Failure");
    })
  );
});
