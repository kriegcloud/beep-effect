import { $KnowledgeServerId } from "@beep/identity/packages";
import type { EventBusError } from "@beep/knowledge-domain/errors";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";

const $I = $KnowledgeServerId.create("Service/EventBus");

export class EventEnvelope extends S.Class<EventEnvelope>($I`EventEnvelope`)(
  {
    topic: S.String,
    payload: S.Unknown,
    sequence: S.NonNegativeInt,
    publishedAt: S.NonNegativeInt,
  },
  $I.annotations("EventEnvelope", {
    description:
      "In-process event envelope published on the event bus (topic, payload, monotonic sequence, timestamp).",
  })
) {}

export class QueuedJob extends S.Class<QueuedJob>($I`QueuedJob`)(
  {
    jobId: S.String,
    jobType: S.String,
    payload: S.Unknown,
    attempts: S.NonNegativeInt,
    maxAttempts: S.NonNegativeInt,
    enqueuedAt: S.NonNegativeInt,
  },
  $I.annotations("QueuedJob", {
    description: "Job queued for background processing (attempt tracking, max attempts, enqueue timestamp).",
  })
) {}

export class EnqueueJobInput extends S.Class<EnqueueJobInput>($I`EnqueueJobInput`)(
  {
    jobId: S.String,
    jobType: S.String,
    payload: S.Unknown,
    attempts: S.optional(S.NonNegativeInt),
    maxAttempts: S.optional(S.NonNegativeInt),
  },
  $I.annotations("EnqueueJobInput", {
    description: "Input for enqueueing a job (optional attempt counters are defaulted by the service).",
  })
) {}

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
      const envelope = EventEnvelope.make({
        topic,
        payload,
        sequence,
        publishedAt: Date.now(),
      });

      yield* PubSub.publish(events, envelope);
    });

  const subscribe: EventBusShape["subscribe"] = (topic) =>
    Stream.fromPubSub(events).pipe(Stream.filter((event) => event.topic === topic));

  const subscribeAll: EventBusShape["subscribeAll"] = () => Stream.fromPubSub(events);

  const enqueueJob: EventBusShape["enqueueJob"] = (input) =>
    Effect.gen(function* () {
      const job = QueuedJob.make({
        jobId: input.jobId,
        jobType: input.jobType,
        payload: input.payload,
        attempts: input.attempts ?? 0,
        maxAttempts: input.maxAttempts ?? 3,
        enqueuedAt: Date.now(),
      });

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
