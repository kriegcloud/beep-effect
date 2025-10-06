import * as S from "effect/Schema";

/**
 * InvariantViolation — schema-backed error for failed invariants.
 *
 * Use this *everywhere* for consistency so you can parse/serialize and
 * pattern match in Effects.
 */
export class InvariantViolation extends S.TaggedError<InvariantViolation>("@beep/invariant/InvariantViolation")(
  "InvariantViolation",
  {
    /** Human-readable message; avoid PII if this can cross boundaries. */
    message: S.NonEmptyString,
    /** File where the invariant was defined/called (best-effort trimmed path). */
    file: S.optional(S.NonEmptyString),
    /** Line number (0-based or 1-based depending on environment; treat as opaque). */
    line: S.optional(S.NonNegativeInt),
    /** Best-effort, JSON-serializable view of extra args (may be lossy). */
    args: S.optional(S.Array(S.Unknown)),
  }
) {}

/** Schema to refine/parse unknowns back into an InvariantViolation instance. */
export const InvariantViolationSchema = S.instanceOf(InvariantViolation);
