import { $KnowledgeServerId } from "@beep/identity/packages";
import type { EventBusError } from "@beep/knowledge-domain/errors";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

const $I = $KnowledgeServerId.create("Service/EventBus");

export interface EventEnvelope {
  readonly topic: string;
  readonly payload: unknown;
  readonly sequence: number;
  readonly publishedAt: number;
}

export interface QueuedJob {
  readonly jobId: string;
  readonly jobType: string;
  readonly payload: unknown;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly enqueuedAt: number;
}

export interface EnqueueJobInput {
  readonly jobId: string;
  readonly jobType: string;
  readonly payload: unknown;
  readonly attempts?: undefined | number;
  readonly maxAttempts?: undefined | number;
}

export interface EventBusShape {
  readonly publish: (topic: string, payload: unknown) => Effect.Effect<void, EventBusError>;
  readonly subscribe: (topic: string) => Stream.Stream<EventEnvelope>;
  readonly subscribeAll: () => Stream.Stream<EventEnvelope>;
  readonly enqueueJob: (input: EnqueueJobInput) => Effect.Effect<QueuedJob, EventBusError>;
  readonly takeJob: () => Effect.Effect<QueuedJob, EventBusError>;
  readonly queueSize: () => Effect.Effect<number, EventBusError>;
}

export class EventBus extends Context.Tag($I`EventBus`)<EventBus, EventBusShape>() {}

const serviceEffect: Effect.Effect<EventBusShape> = Effect.gen(function* () {
  const events = yield* PubSub.unbounded<EventEnvelope>();
  const jobs = yield* Queue.unbounded<QueuedJob>();
  const sequenceRef = yield* Ref.make(0);

  const publish: EventBusShape["publish"] = (topic, payload) =>
    Effect.gen(function* () {
      const sequence = yield* Ref.updateAndGet(sequenceRef, (current) => current + 1);
      const envelope: EventEnvelope = {
        topic,
        payload,
        sequence,
        publishedAt: Date.now(),
      };

      yield* PubSub.publish(events, envelope);
    });

  const subscribe: EventBusShape["subscribe"] = (topic) =>
    Stream.fromPubSub(events).pipe(Stream.filter((event) => event.topic === topic));

  const subscribeAll: EventBusShape["subscribeAll"] = () => Stream.fromPubSub(events);

  const enqueueJob: EventBusShape["enqueueJob"] = (input) =>
    Effect.gen(function* () {
      const job: QueuedJob = {
        jobId: input.jobId,
        jobType: input.jobType,
        payload: input.payload,
        attempts: input.attempts ?? 0,
        maxAttempts: input.maxAttempts ?? 3,
        enqueuedAt: Date.now(),
      };

      yield* Queue.offer(jobs, job);
      return job;
    });

  const takeJob: EventBusShape["takeJob"] = () => Queue.take(jobs);

  const queueSize: EventBusShape["queueSize"] = () => Queue.size(jobs);

  return EventBus.of({
    publish,
    subscribe,
    subscribeAll,
    enqueueJob,
    takeJob,
    queueSize,
  });
});

export const EventBusLive = Layer.effect(EventBus, serviceEffect);
