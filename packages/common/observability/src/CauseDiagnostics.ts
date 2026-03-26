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
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type CauseClassification = typeof CauseClassification.Type;

/**
 * High-level classification for an exit.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type ExitOutcome = typeof ExitOutcome.Type;

/**
 * Deterministic string fingerprint for a cause.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * Summary information for a full Effect cause.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * Summary information for an exit.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * Classify a cause by its reason makeup.
 *
 * @since 0.0.0
 * @category Diagnostics
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
 * @since 0.0.0
 * @category Diagnostics
 */
export const fingerprintCause = (cause: Cause.Cause<unknown>): CauseFingerprint =>
  new CauseFingerprint({
    value: fingerprintValue(cause, classifyCause(cause)),
  });

/**
 * Summarize a cause into transport-safe diagnostics.
 *
 * @since 0.0.0
 * @category Diagnostics
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
 * Summarize an exit into transport-safe diagnostics.
 *
 * @since 0.0.0
 * @category Diagnostics
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
 * @since 0.0.0
 * @category Diagnostics
 */
export const renderObservedCause = (cause: Cause.Cause<unknown>): string => {
  const summary = summarizeCause(cause);
  return `[${summary.classification}] ${summary.fingerprint.value}\n${summary.pretty}`;
};
