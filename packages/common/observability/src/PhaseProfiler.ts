/**
 * Phase profiling for named application lifecycle phases (startup, migrations, etc.).
 *
 * Wraps an effect with span annotations, structured logs, and optional metric
 * recording to produce a {@link PhaseProfile} summary upon completion.
 *
 * @example
 * ```typescript
 * import { Effect, Metric } from "effect"
 * import { profilePhase } from "@beep/observability"
 *
 * const migrate = Effect.log("running migrations")
 *
 * const profiled = profilePhase(
 *
 *
 * )
 *
 * void Effect.runPromise(profiled)
 * ```
 *
 * @module
 * @since 0.0.0
 */
import { $ObservabilityId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { Clock, Duration, Effect, Exit, Match, Metric } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("PhaseProfiler");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

interface ProfilePhaseOptions {
  readonly attributes?: Record<string, string> | undefined;
  readonly completed?: Metric.Counter<number> | undefined;
  readonly duration?: Metric.Metric<Duration.Duration, unknown> | undefined;
  readonly failed?: Metric.Counter<number> | undefined;
  readonly interrupted?: Metric.Counter<number> | undefined;
  readonly phase: string;
  readonly started?: Metric.Counter<number> | undefined;
}

const isProfilePhaseDataFirst = (args: IArguments): boolean => args.length >= 2 || Effect.isEffect(args[0]);

/**
 * Terminal outcomes for profiled phases: `"completed"`, `"failed"`, or `"interrupted"`.
 *
 * @example
 * ```typescript
 * import { PhaseOutcome } from "@beep/observability"
 *
 * void PhaseOutcome
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PhaseOutcome = LiteralKit(["completed", "failed", "interrupted"]).pipe(
  $I.annoteSchema("PhaseOutcome", {
    description: "Terminal outcomes for profiled phases.",
  })
);

/**
 * Runtime type for {@link PhaseOutcome}.
 *
 * @example
 * ```typescript
 * import type { PhaseOutcome } from "@beep/observability"
 *
 * const outcome: PhaseOutcome = "completed"
 * void outcome
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PhaseOutcome = typeof PhaseOutcome.Type;

/**
 * Deterministic summary of one profiled phase with outcome, duration, and attributes.
 *
 * @example
 * ```typescript
 * import { NonNegativeInt } from "@beep/schema"
 * import * as S from "effect/Schema"
 * import { PhaseProfile } from "@beep/observability"
 *
 * const durationMs = S.decodeUnknownSync(NonNegativeInt)(42)
 * const profile = new PhaseProfile({
 *
 *
 *
 *
 * })
 *
 * console.log(profile.phase) // "startup"
 * console.log(profile.outcome) // "completed"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class PhaseProfile extends S.Class<PhaseProfile>($I`PhaseProfile`)(
  {
    phase: S.String,
    outcome: PhaseOutcome,
    durationMs: NonNegativeInt,
    attributes: S.Record(S.String, S.String),
  },
  $I.annote("PhaseProfile", {
    description: "Deterministic summary of one profiled phase.",
  })
) {}

const metricWithAttributes = <Input, State>(
  metric: Metric.Metric<Input, State>,
  attributes: Record<string, string>
): Metric.Metric<Input, State> => Metric.withAttributes(metric, attributes);

const incrementMetric = (
  metric: Metric.Counter<number> | undefined,
  attributes: Record<string, string>
): Effect.Effect<void> =>
  metric === undefined ? Effect.void : Metric.update(metricWithAttributes(metric, attributes), 1);

const toPhaseOutcome = <A, E>(exit: Exit.Exit<A, E>): PhaseOutcome =>
  Exit.isSuccess(exit) ? "completed" : Exit.hasInterrupts(exit) ? "interrupted" : "failed";

const logPhaseProfile = (profile: PhaseProfile): Effect.Effect<void> =>
  Match.value(profile.outcome).pipe(
    Match.when("completed", () =>
      Effect.logInfo({
        message: "phase completed",
        phase: profile.phase,
        durationMs: profile.durationMs,
        attributes: profile.attributes,
      })
    ),
    Match.when("interrupted", () =>
      Effect.logWarning({
        message: "phase interrupted",
        phase: profile.phase,
        durationMs: profile.durationMs,
        attributes: profile.attributes,
      })
    ),
    Match.when("failed", () =>
      Effect.logError({
        message: "phase failed",
        phase: profile.phase,
        durationMs: profile.durationMs,
        attributes: profile.attributes,
      })
    ),
    Match.exhaustive
  );

/**
 * Profile one named phase with spans, logs, and optional metrics.
 *
 * Wraps an effect and records:
 * - A `started` counter increment on entry
 * - Span annotations for `phase`, `phase_outcome`, and `phase_duration_ms`
 * - A structured log at the appropriate level on exit
 * - Optional `completed`, `failed`, `interrupted` counters and duration metric
 *
 * @example
 * ```typescript
 * import { Effect, Metric } from "effect"
 * import { profilePhase } from "@beep/observability"
 *
 * const started = Metric.counter("phase_started_total")
 * const completed = Metric.counter("phase_completed_total")
 * const duration = Metric.timer("phase_duration")
 *
 * const migrate = Effect.log("running migrations")
 *
 * const profiled = profilePhase(
 *
 *
 *
 *
 *
 *
 *
 *
 * )
 *
 * void Effect.runPromise(profiled)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
const profilePhaseImpl = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  options: ProfilePhaseOptions
): Effect.Effect<A, E, R> =>
  Clock.currentTimeMillis.pipe(
    Effect.flatMap((startedAt) => {
      const baseAttributes = {
        phase: options.phase,
        ...options.attributes,
      };

      return Effect.annotateCurrentSpan(baseAttributes).pipe(
        Effect.andThen(incrementMetric(options.started, baseAttributes)),
        Effect.andThen(effect),
        Effect.onExit((exit) =>
          Clock.currentTimeMillis.pipe(
            Effect.flatMap((endedAt) => {
              const durationMs = Math.max(0, endedAt - startedAt);
              const outcome = toPhaseOutcome(exit);
              const profile = new PhaseProfile({
                phase: options.phase,
                outcome,
                durationMs: decodeNonNegativeInt(durationMs),
                attributes: baseAttributes,
              });
              const outcomeAttributes = {
                ...baseAttributes,
                outcome,
              };
              const durationEffect =
                options.duration === undefined
                  ? Effect.void
                  : Metric.update(
                      metricWithAttributes(options.duration, outcomeAttributes),
                      Duration.millis(durationMs)
                    );
              const outcomeEffect = Match.value(outcome).pipe(
                Match.when("completed", () => incrementMetric(options.completed, outcomeAttributes)),
                Match.when("failed", () => incrementMetric(options.failed, outcomeAttributes)),
                Match.when("interrupted", () => incrementMetric(options.interrupted, outcomeAttributes)),
                Match.exhaustive
              );

              return Effect.annotateCurrentSpan({
                phase: options.phase,
                phase_outcome: outcome,
                phase_duration_ms: durationMs,
              }).pipe(
                Effect.andThen(durationEffect),
                Effect.andThen(outcomeEffect),
                Effect.andThen(logPhaseProfile(profile))
              );
            })
          )
        )
      );
    })
  );

export const profilePhase: {
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: ProfilePhaseOptions): Effect.Effect<A, E, R>;
  <A, E, R>(options: ProfilePhaseOptions, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
  (options: ProfilePhaseOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
} = dual(
  isProfilePhaseDataFirst,
  <A, E, R>(
    effect: Effect.Effect<A, E, R> | ProfilePhaseOptions,
    options: ProfilePhaseOptions | Effect.Effect<A, E, R> | undefined
  ): Effect.Effect<A, E, R> => {
    if (Effect.isEffect(effect) && P.isNotUndefined(options) && !Effect.isEffect(options)) {
      return profilePhaseImpl(effect, options);
    }

    if (!Effect.isEffect(effect) && Effect.isEffect(options)) {
      return profilePhaseImpl(options, effect);
    }

    return Effect.die("Invalid profilePhase arguments");
  }
);
