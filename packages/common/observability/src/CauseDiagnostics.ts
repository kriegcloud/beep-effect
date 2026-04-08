/**
 * Diagnostic utilities for inspecting, classifying, and summarizing Effect causes and exits.
 *
 * Provides transport-safe schemas and pure functions for converting runtime
 * failure information into structured diagnostics suitable for logging,
 * metrics, and error reporting.
 *
 * @example
 * ```typescript
 * import { Cause } from "effect"
 * import { classifyCause, summarizeCause } from "@beep/observability"
 *
 * const cause = Cause.fail(new Error("boom"))
 * const classification = classifyCause(cause)
 * const summary = summarizeCause(cause)
 *
 * console.log(classification) // "failure"
 * console.log(summary.primaryMessage) // "boom"
 * ```
 *
 * @module @beep/observability/CauseDiagnostics
 * @since 0.0.0
 */
import { $ObservabilityId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { Cause, Exit } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("CauseDiagnostics");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

/**
 * High-level classification for a full Effect cause.
 *
 * One of `"empty"`, `"failure"`, `"defect"`, `"interrupted"`, or `"mixed"`.
 *
 * @example
 * ```typescript
 * import { Cause } from "effect"
 * import { classifyCause } from "@beep/observability"
 *
 * console.log(classifyCause(Cause.empty)) // "empty"
 * console.log(classifyCause(Cause.fail("err"))) // "failure"
 * console.log(classifyCause(Cause.die("bug"))) // "defect"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const CauseClassification = LiteralKit(["empty", "failure", "defect", "interrupted", "mixed"]).pipe(
  $I.annoteSchema("CauseClassification", {
    description: "High-level classification for a full Effect cause.",
  })
);

/**
 * Runtime type for {@link CauseClassification}.
 *
 * @since 0.0.0
 * @category models
 */
export type CauseClassification = typeof CauseClassification.Type;

/**
 * High-level classification for an exit: `"success"` or `"failure"`.
 *
 * @example
 * ```typescript
 * import { ExitOutcome } from "@beep/observability"
 *
 * void ExitOutcome
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const ExitOutcome = LiteralKit(["success", "failure"]).pipe(
  $I.annoteSchema("ExitOutcome", {
    description: "High-level classification for an exit.",
  })
);

/**
 * Runtime type for {@link ExitOutcome}.
 *
 * @since 0.0.0
 * @category models
 */
export type ExitOutcome = typeof ExitOutcome.Type;

/**
 * Deterministic string fingerprint for a cause, useful for deduplication and grouping.
 *
 * @example
 * ```typescript
 * import { CauseFingerprint } from "@beep/observability"
 *
 * const fp = new CauseFingerprint({ value: "failure:fail:1:error:boom" })
 * console.log(fp.value) // "failure:fail:1:error:boom"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class CauseFingerprint extends S.Class<CauseFingerprint>($I`CauseFingerprint`)(
  {
    value: S.String,
  },
  $I.annote("CauseFingerprint", {
    description: "Deterministic string fingerprint for a cause.",
  })
) {}

/**
 * Transport-safe summary of a full Effect cause with classification, fingerprint, and counts.
 *
 * @example
 * ```typescript
 * import { Cause } from "effect"
 * import { summarizeCause } from "@beep/observability"
 *
 * const summary = summarizeCause(Cause.fail(new Error("timeout")))
 *
 * console.log(summary.classification) // "failure"
 * console.log(summary.errorCount) // 1
 * console.log(summary.defectCount) // 0
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class CauseSummary extends S.Class<CauseSummary>($I`CauseSummary`)(
  {
    classification: CauseClassification,
    fingerprint: CauseFingerprint,
    reasonCount: NonNegativeInt,
    errorCount: NonNegativeInt,
    defectCount: NonNegativeInt,
    interruptCount: NonNegativeInt,
    primaryMessage: S.String,
    pretty: S.String,
  },
  $I.annote("CauseSummary", {
    description: "Summary information for a full Effect cause.",
  })
) {}

/**
 * Transport-safe summary of an exit with outcome, classification, and fingerprint.
 *
 * @example
 * ```typescript
 * import { Exit, Cause } from "effect"
 * import { summarizeExit } from "@beep/observability"
 *
 * const success = summarizeExit(Exit.succeed(42))
 * console.log(success.outcome) // "success"
 *
 * const failure = summarizeExit(Exit.fail(new Error("oops")))
 * console.log(failure.outcome) // "failure"
 * console.log(failure.classification) // "failure"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class ObservedExitSummary extends S.Class<ObservedExitSummary>($I`ObservedExitSummary`)(
  {
    outcome: ExitOutcome,
    classification: CauseClassification,
    fingerprint: CauseFingerprint,
    interrupted: S.Boolean,
    reasonCount: NonNegativeInt,
    primaryMessage: S.String,
  },
  $I.annote("ObservedExitSummary", {
    description: "Summary information for an exit.",
  })
) {}

const primaryMessageFromCause = (cause: Cause.Cause<unknown>): string =>
  pipeFirstPrettyError(cause).pipe(
    O.match({
      onNone: () => Cause.pretty(cause),
      onSome: (error) => error.message,
    })
  );

const pipeFirstPrettyError = (cause: Cause.Cause<unknown>): O.Option<Error> => A.head(Cause.prettyErrors(cause));

const summarizeReasonCounts = (cause: Cause.Cause<unknown>) => {
  let errorCount = 0;
  let defectCount = 0;
  let interruptCount = 0;

  for (const reason of cause.reasons) {
    switch (reason._tag) {
      case "Fail": {
        errorCount += 1;
        break;
      }
      case "Die": {
        defectCount += 1;
        break;
      }
      case "Interrupt": {
        interruptCount += 1;
        break;
      }
    }
  }

  return {
    errorCount,
    defectCount,
    interruptCount,
    reasonCount: cause.reasons.length,
  };
};

const fingerprintChunk = (value: string): string => value.trim().replaceAll(/\s+/g, " ").slice(0, 80).toLowerCase();

const fingerprintValue = (cause: Cause.Cause<unknown>, classification: CauseClassification): string => {
  const prettyErrors = Cause.prettyErrors(cause);
  const reasonTags = cause.reasons.map((reason) => reason._tag.toLowerCase()).join("+");
  const primaryChunk = pipeFirstPrettyError(cause).pipe(
    O.match({
      onNone: () => fingerprintChunk(Cause.pretty(cause)),
      onSome: (error) => fingerprintChunk(`${error.name}:${error.message}`),
    })
  );

  return `${classification}:${reasonTags}:${prettyErrors.length}:${primaryChunk}`;
};

/**
 * Classify a cause by its reason makeup into a single {@link CauseClassification} label.
 *
 * Returns `"empty"` for empty causes, `"mixed"` when multiple reason kinds are
 * present, or the single kind (`"failure"`, `"defect"`, `"interrupted"`) otherwise.
 *
 * @example
 * ```typescript
 * import { Cause } from "effect"
 * import { classifyCause } from "@beep/observability"
 *
 * console.log(classifyCause(Cause.empty)) // "empty"
 * console.log(classifyCause(Cause.fail("err"))) // "failure"
 * console.log(classifyCause(Cause.die("bug"))) // "defect"
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const classifyCause = (cause: Cause.Cause<unknown>): CauseClassification => {
  const counts = summarizeReasonCounts(cause);
  const presentKinds = [counts.errorCount > 0, counts.defectCount > 0, counts.interruptCount > 0].filter(
    Boolean
  ).length;

  if (counts.reasonCount === 0) {
    return "empty";
  }

  if (presentKinds > 1) {
    return "mixed";
  }

  if (counts.interruptCount > 0) {
    return "interrupted";
  }

  if (counts.defectCount > 0) {
    return "defect";
  }

  return "failure";
};

/**
 * Generate a deterministic fingerprint for a cause.
 *
 * The fingerprint combines the classification, reason tags, reason count,
 * and a truncated primary message chunk for grouping similar failures.
 *
 * @example
 * ```typescript
 * import { Cause } from "effect"
 * import { fingerprintCause } from "@beep/observability"
 *
 * const fp = fingerprintCause(Cause.fail(new Error("connection refused")))
 * console.log(fp.value) // "failure:fail:1:error:connection refused"
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const fingerprintCause = (cause: Cause.Cause<unknown>): CauseFingerprint =>
  new CauseFingerprint({
    value: fingerprintValue(cause, classifyCause(cause)),
  });

/**
 * Summarize a cause into a transport-safe {@link CauseSummary} with classification,
 * fingerprint, reason counts, primary message, and pretty-printed output.
 *
 * @example
 * ```typescript
 * import { Cause } from "effect"
 * import { summarizeCause } from "@beep/observability"
 *
 * const summary = summarizeCause(Cause.fail(new Error("timeout")))
 *
 * console.log(summary.classification) // "failure"
 * console.log(summary.errorCount) // 1
 * console.log(summary.primaryMessage) // "timeout"
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const summarizeCause = (cause: Cause.Cause<unknown>): CauseSummary => {
  const counts = summarizeReasonCounts(cause);
  const classification = classifyCause(cause);

  return new CauseSummary({
    classification,
    fingerprint: fingerprintCause(cause),
    reasonCount: decodeNonNegativeInt(counts.reasonCount),
    errorCount: decodeNonNegativeInt(counts.errorCount),
    defectCount: decodeNonNegativeInt(counts.defectCount),
    interruptCount: decodeNonNegativeInt(counts.interruptCount),
    primaryMessage: primaryMessageFromCause(cause),
    pretty: Cause.pretty(cause),
  });
};

/**
 * Summarize an exit into a transport-safe {@link ObservedExitSummary}.
 *
 * For successful exits the outcome is `"success"` with an empty classification.
 * For failed exits the cause is analyzed via {@link summarizeCause}.
 *
 * @example
 * ```typescript
 * import { Exit } from "effect"
 * import { summarizeExit } from "@beep/observability"
 *
 * const ok = summarizeExit(Exit.succeed("done"))
 * console.log(ok.outcome) // "success"
 *
 * const err = summarizeExit(Exit.fail(new Error("oops")))
 * console.log(err.outcome) // "failure"
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const summarizeExit = <A, E>(exit: Exit.Exit<A, E>): ObservedExitSummary =>
  Exit.isSuccess(exit)
    ? new ObservedExitSummary({
        outcome: "success",
        classification: "empty",
        fingerprint: new CauseFingerprint({ value: "success" }),
        interrupted: false,
        reasonCount: decodeNonNegativeInt(0),
        primaryMessage: "success",
      })
    : (() => {
        const summary = summarizeCause(exit.cause);

        return new ObservedExitSummary({
          outcome: "failure",
          classification: summary.classification,
          fingerprint: summary.fingerprint,
          interrupted: Exit.hasInterrupts(exit),
          reasonCount: summary.reasonCount,
          primaryMessage: summary.primaryMessage,
        });
      })();

/**
 * Render a compact human-readable representation of a cause.
 *
 * Combines the classification, fingerprint, and pretty-printed cause into
 * a single multiline string suitable for console or log output.
 *
 * @example
 * ```typescript
 * import { Cause } from "effect"
 * import { renderObservedCause } from "@beep/observability"
 *
 * const rendered = renderObservedCause(Cause.fail(new Error("boom")))
 * console.log(rendered)
 * // [failure] failure:fail:1:error:boom
 * // Error: boom
 * // ...
 * ```
 *
 * @since 0.0.0
 * @category diagnostics
 */
export const renderObservedCause = (cause: Cause.Cause<unknown>): string => {
  const summary = summarizeCause(cause);
  return `[${summary.classification}] ${summary.fingerprint.value}\n${summary.pretty}`;
};
