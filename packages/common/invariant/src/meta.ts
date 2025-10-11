import * as S from "effect/Schema";

/**
 * Metadata captured when asserting an invariant.
 * Keep this small and serializable; it's often logged or reported.
 */

export const CallMetadata: S.Struct<{
  file: typeof S.NonEmptyString;
  line: S.refine<number, typeof S.NonNegative>;
  args: S.Array$<typeof S.Unknown>;
}> = S.Struct({
  file: S.NonEmptyString,
  line: S.NonNegativeInt,
  args: S.Array(S.Unknown),
});

export declare namespace CallMetadata {
  export type Type = S.Schema.Type<typeof CallMetadata>;
}
