import { $ObservabilityId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { Clock, Duration, Effect, Exit, Match, Metric } from "effect";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("PhaseProfiler");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

/**
 * Terminal outcomes for profiled phases.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PhaseOutcome = LiteralKit(["completed", "failed", "interrupted"]).pipe(
  $I.annoteSchema("PhaseOutcome", {
    description: "Terminal outcomes for profiled phases.",
  })
);

/**
 * Runtime type for {@link PhaseOutcome}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PhaseOutcome = typeof PhaseOutcome.Type;

/**
 * Deterministic summary of one profiled phase.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category Observability
 */
export const profilePhase = <A, E, R>(
  options: {
    readonly phase: string;
    readonly attributes?: Record<string, string> | undefined;
    readonly started?: Metric.Counter<number> | undefined;
    readonly completed?: Metric.Counter<number> | undefined;
    readonly failed?: Metric.Counter<number> | undefined;
    readonly interrupted?: Metric.Counter<number> | undefined;
    readonly duration?: Metric.Metric<Duration.Duration, unknown> | undefined;
  },
  effect: Effect.Effect<A, E, R>
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
