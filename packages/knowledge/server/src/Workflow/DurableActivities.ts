import { $KnowledgeServerId } from "@beep/identity/packages";
import { ActivityFailedError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import type * as SqlError from "@effect/sql/SqlError";
import * as Clock from "effect/Clock";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Schedule from "effect/Schedule";
import { WorkflowPersistence } from "./WorkflowPersistence";

const $I = $KnowledgeServerId.create("Workflow/DurableActivities");

export interface DurableActivityOptions<A> {
  readonly maxRetries?: number;
  readonly retrySchedule?: Schedule.Schedule<unknown>;
  readonly serialize?: (a: A) => Record<string, unknown>;
  readonly deserialize?: (json: Record<string, unknown>) => A;
}

const DEFAULT_MAX_RETRIES = 3;

const makeDefaultRetrySchedule = () =>
  Schedule.exponential(Duration.seconds(1)).pipe(Schedule.intersect(Schedule.recurs(DEFAULT_MAX_RETRIES)));

export interface DurableActivitiesShape {
  readonly runActivity: <A, E, R>(
    executionId: KnowledgeEntityIds.WorkflowExecutionId.Type,
    organizationId: string,
    activityName: string,
    effect: Effect.Effect<A, E, R>,
    options?: DurableActivityOptions<A>
  ) => Effect.Effect<A, E | ActivityFailedError | SqlError.SqlError, R>;
}

export class DurableActivities extends Context.Tag($I`DurableActivities`)<
  DurableActivities,
  DurableActivitiesShape
>() {}

const serviceEffect = Effect.gen(function* () {
  const persistence = yield* WorkflowPersistence;

  const runActivity: DurableActivitiesShape["runActivity"] = <A, E, R>(
    executionId: KnowledgeEntityIds.WorkflowExecutionId.Type,
    organizationId: string,
    activityName: string,
    activityEffect: Effect.Effect<A, E, R>,
    options?: DurableActivityOptions<A>
  ): Effect.Effect<A, E | ActivityFailedError | SqlError.SqlError, R> =>
    Effect.gen(function* () {
      const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
      const retrySchedule = options?.retrySchedule ?? makeDefaultRetrySchedule();

      // Check if activity was already completed (crash recovery / replay)
      const existing = yield* persistence.findCompletedActivity(executionId, activityName);
      if (O.isSome(existing) && existing.value.output !== null && options?.deserialize) {
        yield* Effect.logInfo("DurableActivity: replaying cached result").pipe(
          Effect.annotateLogs({ executionId, activityName })
        );
        return options.deserialize(existing.value.output);
      }

      // Record activity start
      const activityId = KnowledgeEntityIds.WorkflowActivityId.create();
      const startTime = yield* Clock.currentTimeMillis;

      yield* persistence.recordActivityStart({
        id: activityId,
        executionId,
        organizationId,
        activityName,
        attempt: 1,
        input: {},
      });

      // Update execution status to running with current activity
      yield* persistence.updateExecutionStatus(executionId, "running", {
        lastActivityName: activityName,
      });

      // Execute with retry, recording failure on final error
      const result: A = yield* activityEffect.pipe(
        Effect.retry(retrySchedule),
        Effect.tapError((error) =>
          Effect.gen(function* () {
            const endTime = yield* Clock.currentTimeMillis;
            const elapsed = Number(endTime - startTime);
            yield* persistence.recordActivityFailed(activityId, String(error), elapsed);
          })
        ),
        Effect.mapError(
          (error): E | ActivityFailedError =>
            new ActivityFailedError({
              executionId,
              activityName,
              attempt: maxRetries,
              cause: String(error),
            })
        )
      );

      // Record success
      const endTime = yield* Clock.currentTimeMillis;
      const elapsed = Number(endTime - startTime);
      const output = options?.serialize ? options.serialize(result) : {};
      yield* persistence.recordActivityComplete(activityId, output, elapsed);

      yield* Effect.logInfo("DurableActivity: completed").pipe(
        Effect.annotateLogs({
          executionId,
          activityName,
          durationMs: elapsed,
        })
      );

      return result;
    });

  return DurableActivities.of({ runActivity });
});

export const DurableActivitiesLive = Layer.effect(DurableActivities, serviceEffect);
