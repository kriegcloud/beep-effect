import { EventBus, EventBusLive } from "@beep/knowledge-server/Service/EventBus";
import { assertTrue, deepStrictEqual, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";

describe("Service/EventBus", () => {
  effect(
    "publishes events to topic subscribers",
    Effect.fn(function* () {
      const bus = yield* EventBus;

      const subscriber = yield* bus.subscribe("ontology.updated").pipe(Stream.runHead, Effect.fork);
      yield* Effect.yieldNow();
      yield* bus.publish("ontology.updated", { iri: "https://schema.org", changed: true });

      const received = yield* Fiber.join(subscriber);
      assertTrue(O.isSome(received));
      if (O.isSome(received)) {
        strictEqual(received.value.topic, "ontology.updated");
        strictEqual(received.value.sequence, 1);
        deepStrictEqual(received.value.payload, { iri: "https://schema.org", changed: true });
      }
    }, Effect.provide(EventBusLive))
  );

  effect(
    "filters events by topic",
    Effect.fn(function* () {
      const bus = yield* EventBus;

      const subscriber = yield* bus.subscribe("job.completed").pipe(Stream.runHead, Effect.fork);
      yield* Effect.yieldNow();
      yield* bus.publish("job.failed", { id: "j1" });
      yield* bus.publish("job.completed", { id: "j2" });

      const received = yield* Fiber.join(subscriber);
      assertTrue(O.isSome(received));
      if (O.isSome(received)) {
        strictEqual(received.value.topic, "job.completed");
        deepStrictEqual(received.value.payload, { id: "j2" });
      }
    }, Effect.provide(EventBusLive))
  );

  effect(
    "supports minimal FIFO job queue operations",
    Effect.fn(function* () {
      const bus = yield* EventBus;

      yield* bus.enqueueJob({
        jobId: "job-1",
        jobType: "refresh-index",
        payload: { documentId: "doc-1" },
      });

      yield* bus.enqueueJob({
        jobId: "job-2",
        jobType: "refresh-index",
        payload: { documentId: "doc-2" },
      });

      const queued = yield* bus.queueSize();
      strictEqual(queued, 2);

      const first = yield* bus.takeJob();
      const second = yield* bus.takeJob();

      strictEqual(first.jobId, "job-1");
      strictEqual(second.jobId, "job-2");
      deepStrictEqual(first.payload, { documentId: "doc-1" });
      deepStrictEqual(second.payload, { documentId: "doc-2" });
    }, Effect.provide(EventBusLive))
  );
});
