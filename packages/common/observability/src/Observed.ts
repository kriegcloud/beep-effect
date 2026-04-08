/**
 * Transport-safe schemas for serializing Effect errors, defects, causes, and exits.
 *
 * These schemas annotate the core `S.Error`, `S.Defect`, `S.Cause`, and `S.Exit`
 * schemas with identity metadata for the observability package.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { ObservedError, ObservedCause } from "@beep/observability"
 *
 * void ObservedError
 * void ObservedCause
 * ```
 *
 * @module @beep/observability/Observed
 * @since 0.0.0
 */
import { $ObservabilityId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("Observed");

/**
 * A transport-safe schema for expected errors (message only, no stack).
 *
 * @since 0.0.0
 * @category models
 */
export const ObservedError = S.Error.pipe(
  S.annotate(
    $I.annote("ObservedError", {
      description: "A transport-safe schema for expected errors.",
    })
  )
);

/**
 * Runtime type for {@link ObservedError}.
 *
 * @since 0.0.0
 * @category models
 */
export type ObservedError = typeof ObservedError.Type;

/**
 * A transport-safe schema for expected errors that preserves stacks.
 *
 * @since 0.0.0
 * @category models
 */
export const ObservedErrorWithStack = S.ErrorWithStack.pipe(
  S.annotate(
    $I.annote("ObservedErrorWithStack", {
      description: "A transport-safe schema for expected errors that preserves stacks.",
    })
  )
);

/**
 * Runtime type for {@link ObservedErrorWithStack}.
 *
 * @since 0.0.0
 * @category models
 */
export type ObservedErrorWithStack = typeof ObservedErrorWithStack.Type;

/**
 * A transport-safe schema for defects.
 *
 * @since 0.0.0
 * @category models
 */
export const ObservedDefect = S.Defect.pipe(
  S.annotate(
    $I.annote("ObservedDefect", {
      description: "A transport-safe schema for defects.",
    })
  )
);

/**
 * Runtime type for {@link ObservedDefect}.
 *
 * @since 0.0.0
 * @category models
 */
export type ObservedDefect = typeof ObservedDefect.Type;

/**
 * A transport-safe schema for defects that preserves stacks when possible.
 *
 * @since 0.0.0
 * @category models
 */
export const ObservedDefectWithStack = S.DefectWithStack.pipe(
  S.annotate(
    $I.annote("ObservedDefectWithStack", {
      description: "A transport-safe schema for defects that preserves stacks when possible.",
    })
  )
);

/**
 * Runtime type for {@link ObservedDefectWithStack}.
 *
 * @since 0.0.0
 * @category models
 */
export type ObservedDefectWithStack = typeof ObservedDefectWithStack.Type;

/**
 * One serialized failure reason from a Cause.
 *
 * @since 0.0.0
 * @category models
 */
export const ObservedCauseReason = S.CauseReason(ObservedErrorWithStack, ObservedDefectWithStack).pipe(
  S.annotate(
    $I.annote("ObservedCauseReason", {
      description: "One serialized failure reason from a Cause.",
    })
  )
);

/**
 * Runtime type for {@link ObservedCauseReason}.
 *
 * @since 0.0.0
 * @category models
 */
export type ObservedCauseReason = typeof ObservedCauseReason.Type;

/**
 * A transport-safe schema for full Effect causes.
 *
 * @since 0.0.0
 * @category models
 */
export const ObservedCause = S.Cause(ObservedErrorWithStack, ObservedDefectWithStack).pipe(
  S.annotate(
    $I.annote("ObservedCause", {
      description: "A transport-safe schema for full Effect causes.",
    })
  )
);

/**
 * Runtime type for {@link ObservedCause}.
 *
 * @since 0.0.0
 * @category models
 */
export type ObservedCause = typeof ObservedCause.Type;

/**
 * A transport-safe schema for exits carrying unknown success values.
 *
 * @since 0.0.0
 * @category models
 */
export const ObservedExit = S.Exit(S.Unknown, ObservedErrorWithStack, ObservedDefectWithStack).pipe(
  S.annotate(
    $I.annote("ObservedExit", {
      description: "A transport-safe schema for exits carrying unknown success values.",
    })
  )
);

/**
 * Runtime type for {@link ObservedExit}.
 *
 * @since 0.0.0
 * @category models
 */
export type ObservedExit = typeof ObservedExit.Type;
