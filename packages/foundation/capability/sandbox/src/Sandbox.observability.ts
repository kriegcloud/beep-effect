/**
 * Observability helpers for sandbox workflows.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { profilePhase } from "@beep/observability";
import { Str } from "@beep/utils";
import { Effect, Metric } from "effect";
import { dual } from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $SandboxId.create("Sandbox.observability");

const SECRET_ASSIGNMENT_PATTERN =
  /\b([A-Z][A-Z0-9_]*(?:API[_-]?KEY|KEY|TOKEN|SECRET|PASSWORD|PASS|PWD|AUTH|CREDENTIAL)[A-Z0-9_]*)\s*=\s*("[^"]*"|'[^']*'|[^\s;&|]+)/giu;
const AUTH_HEADER_PATTERN = /\b(authorization|proxy-authorization)\s*:\s*([^\n\r]+)/giu;
const BEARER_PATTERN = /\b(Bearer|Basic)\s+([A-Za-z0-9._~+/=-]{8,})/giu;
const OPENAI_KEY_PATTERN = /\b(sk-[A-Za-z0-9_-]{8,})\b/gu;

const sandboxPhaseStarted = Metric.counter("sandbox_phase_started_total");
const sandboxPhaseCompleted = Metric.counter("sandbox_phase_completed_total");
const sandboxPhaseFailed = Metric.counter("sandbox_phase_failed_total");
const sandboxPhaseInterrupted = Metric.counter("sandbox_phase_interrupted_total");
const sandboxPhaseDuration = Metric.timer("sandbox_phase_duration");

class SandboxPhaseOptions extends S.Class<SandboxPhaseOptions>($I`SandboxPhaseOptions`)(
  {
    attributes: S.optionalKey(S.Record(S.String, S.String)),
    phase: S.String,
  },
  $I.annote("SandboxPhaseOptions", {
    description: "Options for tracking sandbox phases with observability metrics",
  })
) {}

const isProfileDataFirst = (args: IArguments): boolean => args.length >= 2 || Effect.isEffect(args[0]);

/**
 * Redact secret-shaped values from text before it is displayed or logged.
 *
 * @example
 * ```ts
 * import { redactSensitiveText } from "@beep/sandbox"
 *
 * const safe = redactSensitiveText("OPENAI_API_KEY=sk-test-secret")
 *
 * console.log(safe)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const redactSensitiveText = (text: string): string =>
  Str.replace(
    OPENAI_KEY_PATTERN,
    "[REDACTED_SECRET]"
  )(
    Str.replace(
      BEARER_PATTERN,
      "$1 [REDACTED]"
    )(Str.replace(AUTH_HEADER_PATTERN, "$1: [REDACTED]")(Str.replace(SECRET_ASSIGNMENT_PATTERN, "$1=[REDACTED]")(text)))
  );

/**
 * Profile a named sandbox phase with spans, logs, and phase metrics.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { profileSandboxPhase } from "@beep/sandbox"
 *
 * const program = Effect.succeed("ok").pipe(
 *   profileSandboxPhase({ phase: "sandbox.example" })
 * )
 *
 * void program
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const profileSandboxPhase: {
  <A, E, R>(effect: Effect.Effect<A, E, R>, options: SandboxPhaseOptions): Effect.Effect<A, E, R>;
  <A, E, R>(options: SandboxPhaseOptions, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
  (options: SandboxPhaseOptions): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
} = dual(
  isProfileDataFirst,
  <A, E, R>(
    effect: Effect.Effect<A, E, R> | SandboxPhaseOptions,
    options: SandboxPhaseOptions | Effect.Effect<A, E, R> | undefined
  ): Effect.Effect<A, E, R> => {
    const run =
      Effect.isEffect(effect) && options !== undefined && !Effect.isEffect(options)
        ? {
            effect,
            options,
          }
        : !Effect.isEffect(effect) && Effect.isEffect(options)
          ? {
              effect: options,
              options: effect,
            }
          : undefined;

    if (run === undefined) {
      return Effect.die("Invalid profileSandboxPhase arguments");
    }

    const attributes: Record<string, string> = {
      package: "@beep/sandbox",
    };
    for (const [key, value] of R.toEntries(run.options.attributes ?? {})) {
      attributes[redactSensitiveText(key)] = redactSensitiveText(value);
    }

    return profilePhase(run.effect, {
      attributes,
      completed: sandboxPhaseCompleted,
      duration: sandboxPhaseDuration,
      failed: sandboxPhaseFailed,
      interrupted: sandboxPhaseInterrupted,
      phase: run.options.phase,
      started: sandboxPhaseStarted,
    }).pipe(Effect.withSpan(run.options.phase, { attributes }));
  }
);

/**
 * Schema for safe observability phase attributes.
 *
 * @category schemas
 * @since 0.0.0
 */
export const SandboxPhaseAttributes = S.Record(S.String, S.String).pipe(
  $I.annoteSchema("SandboxPhaseAttributes", {
    description: "Schema for safe sandbox observability phase attributes.",
  })
);

/**
 * Runtime type for {@link SandboxPhaseAttributes}.
 *
 * @category models
 * @since 0.0.0
 */
export type SandboxPhaseAttributes = typeof SandboxPhaseAttributes.Type;
