import { $KnowledgeServerId } from "@beep/identity/packages";
import { EventBusError } from "@beep/knowledge-domain/errors";
import { thunkSucceedEffect } from "@beep/utils";
import * as EventJournal from "@effect/experimental/EventJournal";
import * as PersistedQueue from "@effect/experimental/PersistedQueue";
import * as MsgPack from "@effect/platform/MsgPack";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlEventJournal from "@effect/sql/SqlEventJournal";
import * as SqlPersistedQueue from "@effect/sql/SqlPersistedQueue";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as PubSub from "effect/PubSub";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Struct from "effect/Struct";

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

const EventEnvelopeMsgPack = MsgPack.schema(EventEnvelope);

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

class PersistedJob extends S.Class<PersistedJob>($I`PersistedJob`)(
  {
    jobId: S.String,
    jobType: S.String,
    payload: S.Unknown,
    maxAttempts: S.NonNegativeInt,
    enqueuedAt: S.NonNegativeInt,
  },
  $I.annotations("PersistedJob", {
    description: "Internal job payload persisted in a durable queue (attempts are tracked by the store metadata).",
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

const serviceEffectMemory: Effect.Effect<EventBusShape> = Effect.gen(function* () {
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

/**
 * In-memory implementation (default for dev/test).
 */
export const EventBusMemoryLive = Layer.effect(EventBus, serviceEffectMemory);

/**
 * Backwards compatible alias.
 */
export const EventBusLive = EventBusMemoryLive;

// =============================================================================
// SQL-backed implementation (durable)
// =============================================================================

const DURABLE_JOB_QUEUE_NAME = "knowledge.eventbus.jobs";
const SQL_EVENT_JOURNAL_TABLES = {
  entryTable: "beep_knowledge_event_journal",
  remotesTable: "beep_knowledge_event_remotes",
} as const;
const SQL_PERSISTED_QUEUE_TABLE = "beep_knowledge_persisted_queue";

const asEventBusError =
  (method: string, message: string) =>
  (cause: unknown): EventBusError =>
    new EventBusError({ method, message, cause });
const thunkEffectSucceedZero = thunkSucceedEffect(0);
const serviceEffectDurable: Effect.Effect<
  EventBusShape,
  never,
  EventJournal.EventJournal | PersistedQueue.PersistedQueueFactory
> = Effect.gen(function* () {
  const journal = yield* EventJournal.EventJournal;

  // Best-effort to preserve monotonic sequencing across restarts by reading the last entry.
  // Note: this reads all entries; acceptable for current usage but not ideal for unbounded logs.
  const lastSequence = yield* journal.entries.pipe(
    Effect.flatMap(
      Effect.fn((entries) =>
        O.fromNullable(entries[entries.length - 1]).pipe(
          O.match({
            onNone: thunkEffectSucceedZero,
            onSome: F.flow(
              Struct.get("payload"),
              S.decode(EventEnvelopeMsgPack),
              Effect.map(Struct.get("sequence")),
              Effect.catchAll(thunkEffectSucceedZero)
            ),
          })
        )
      )
    ),
    // If the journal can't be read (e.g. remote store error), default to a fresh counter.
    Effect.catchAll(thunkEffectSucceedZero)
  );

  const sequenceRef = yield* Ref.make(lastSequence);
  const queueSizeRef = yield* Ref.make(0);

  const jobsQueue = yield* PersistedQueue.make({
    name: DURABLE_JOB_QUEUE_NAME,
    schema: PersistedJob,
  });

  const publish: EventBusShape["publish"] = Effect.fn(
    function* (topic, payload) {
      const sequence = yield* Ref.updateAndGet(sequenceRef, (current) => current + 1);
      const envelope = EventEnvelope.make({
        topic,
        payload,
        sequence,
        publishedAt: Date.now(),
      });

      const encoded = yield* S.encode(EventEnvelopeMsgPack)(envelope);
      yield* journal.write({
        event: topic,
        primaryKey: crypto.randomUUID(),
        payload: encoded,
        effect: () => Effect.void,
      });
    },
    Effect.mapError(asEventBusError("publish", "Failed to publish event"))
  );

  const decodeEnvelope = Effect.fn(
    function* (entry: EventJournal.Entry) {
      return yield* S.decode(EventEnvelopeMsgPack)(entry.payload);
    },
    Effect.map(O.some),
    Effect.catchAllCause((cause) =>
      // Keep stream errorless for parity with the PubSub-based implementation.
      Effect.logWarning("EventBus durable: failed to decode EventEnvelope from journal entry", { cause }).pipe(
        Effect.as(O.none())
      )
    )
  );

  const changesStream = Stream.unwrapScoped(journal.changes.pipe(Effect.map(Stream.fromQueue)));

  const subscribeAll: EventBusShape["subscribeAll"] = () =>
    changesStream.pipe(Stream.mapEffect(decodeEnvelope), Stream.filterMap(F.identity));

  const subscribe: EventBusShape["subscribe"] = (topic) =>
    changesStream.pipe(
      Stream.filter(({ event }) => event === topic),
      Stream.mapEffect(decodeEnvelope),
      Stream.filterMap(F.identity)
    );

  const enqueueJob: EventBusShape["enqueueJob"] = Effect.fn(
    function* (input) {
      const job = QueuedJob.make({
        jobId: input.jobId,
        jobType: input.jobType,
        payload: input.payload,
        attempts: input.attempts ?? 0,
        maxAttempts: input.maxAttempts ?? 3,
        enqueuedAt: Date.now(),
      });

      // Avoid changing behavior vs the in-memory queue: don't use store-level dedupe on jobId.
      yield* jobsQueue.offer(
        PersistedJob.make({
          jobId: job.jobId,
          jobType: job.jobType,
          payload: job.payload,
          maxAttempts: job.maxAttempts,
          enqueuedAt: job.enqueuedAt,
        }),
        { id: undefined }
      );

      yield* Ref.update(queueSizeRef, (n) => n + 1);
      return job;
    },
    Effect.mapError(asEventBusError("enqueueJob", "Failed to enqueue job"))
  );

  const takeJob: EventBusShape["takeJob"] = Effect.fn(
    function* () {
      return yield* jobsQueue.take(
        Effect.fn(function* (job, meta) {
          return QueuedJob.make({
            jobId: job.jobId,
            jobType: job.jobType,
            payload: job.payload,
            attempts: meta.attempts,
            maxAttempts: job.maxAttempts,
            enqueuedAt: job.enqueuedAt,
          });
        }),
        { maxAttempts: 10 }
      );
    },
    Effect.tap(() => Ref.update(queueSizeRef, (n) => Math.max(0, n - 1))),
    Effect.mapError(asEventBusError("takeJob", "Failed to take job"))
  );

  const queueSizeFromSql = Effect.fn(function* (sqlClient: SqlClient.SqlClient) {
    const sql = sqlClient.withoutTransforms();
    const completedFalse = sql.onDialectOrElse({
      sqlite: () => sql.literal("0"),
      orElse: () => sql.literal("FALSE"),
    });

    const rows = yield* sql<{ readonly count: unknown }>`
          SELECT COUNT(*) as count
          FROM ${sql(SQL_PERSISTED_QUEUE_TABLE)}
          WHERE queue_name = ${DURABLE_JOB_QUEUE_NAME}
            AND completed = ${completedFalse}
      `;

    return Number(rows[0]?.count ?? 0);
  });

  const queueSize: EventBusShape["queueSize"] = () =>
    Effect.serviceOption(SqlClient.SqlClient).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => Ref.get(queueSizeRef),
          onSome: F.flow(
            queueSizeFromSql,
            Effect.catchAll((cause) =>
              // Dialect mismatch / missing table / etc: keep method working via local counter.
              Effect.logWarning("EventBus durable: failed to compute queue size from SQL", { cause }).pipe(
                Effect.zipRight(Ref.get(queueSizeRef))
              )
            )
          ),
        })
      ),
      Effect.mapError(asEventBusError("queueSize", "Failed to compute queue size"))
    );

  return EventBus.of({
    publish,
    subscribe,
    subscribeAll,
    enqueueJob,
    takeJob,
    queueSize,
  });
});

/**
 * Durable implementation. Requires an `EventJournal` and `PersistedQueueFactory`.
 * For SQL-backed usage, prefer `EventBusSqlLive`.
 */
export const EventBusDurable = Layer.effect(EventBus, serviceEffectDurable);

export const EventBusSqlLayers = Layer.mergeAll(
  // `SqlEventJournal.layer` has an option name mismatch (types vs runtime). Use `make()` directly to ensure table overrides work.
  Layer.effect(EventJournal.EventJournal, SqlEventJournal.make(SQL_EVENT_JOURNAL_TABLES)),
  SqlPersistedQueue.layerStore({ tableName: SQL_PERSISTED_QUEUE_TABLE })
).pipe(Layer.provideMerge(PersistedQueue.layer));

/**
 * SQL-backed durable implementation. Requires `SqlClient.SqlClient` upstream.
 */
export const EventBusSqlLive = EventBusDurable.pipe(Layer.provide(EventBusSqlLayers));
