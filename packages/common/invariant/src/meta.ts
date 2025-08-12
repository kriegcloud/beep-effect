import * as S from "effect/Schema";

/**
 * Metadata captured when asserting an invariant.
 * Keep this small and serializable; it's often logged or reported.
 */
export namespace CallMetadata {
  export class Schema extends S.Class<Schema>(
    "@beep/invariant/meta/CallMetadata.Schema"
  )({
    /** File where the invariant is defined/called. */
    file: S.NonEmptyString,
    /** Line number, as reported by the caller. */
    line: S.NonNegativeInt,
    /** Raw argument list provided to the invariant. */
    args: S.Array(S.Unknown),
  }) {}
  export type Type = S.Schema.Type<typeof Schema>;
}
