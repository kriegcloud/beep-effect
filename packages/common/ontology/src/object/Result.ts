/**
 * Tagged result schemas for ontology object operations.
 *
 * @since 0.0.0
 * @module @beep/ontology/object/Result
 */
import { $OntologyId } from "@beep/identity/packages";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $OntologyId.create("object/Result");

/**
 * Error variant for a result.
 *
 * @since 0.0.0
 * @category models
 */
export class ErrorResult extends S.TaggedClass<ErrorResult>($I`ErrorResult`)(
  "Error",
  {
    error: S.OptionFromOptionalKey(S.DefectWithStack),
    value: S.optionalKey(S.Never),
  },
  $I.annote("ErrorResult", {
    description: "Result variant indicating an operation failed and may include defect details.",
  })
) {}

/**
 * Success result schema constructor.
 *
 * @since 0.0.0
 * @category constructors
 */
export const OkResult = <V extends S.Top>(valueSchema: S.Schema<V>) =>
  S.TaggedStruct("Ok", {
    value: valueSchema,
    error: S.optionalKey(S.Never),
  }).pipe(
    S.annotate(
      $I.annote("OkResult", {
        description: "Result variant indicating success with a typed value payload.",
      })
    )
  );

/**
 * Types for {@link OkResult}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace OkResult {
  /**
   * Success tagged schema.
   *
   * @since 0.0.0
   * @category models
   */
  export type Schema<V extends S.Top> = S.TaggedStruct<
    "Ok",
    {
      readonly value: S.Schema<V>;
      readonly error: S.optionalKey<S.Never>;
    }
  >;

  /**
   * Decoded success value type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Type<V extends S.Top> = {
    readonly _tag: "Ok";
    readonly value: Schema<V>;
    readonly error?: never;
  };

  /**
   * Encoded success value type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Encoded<V extends S.Top> = Schema<V>["Encoded"];
}

/**
 * Tagged result union constructor with helper guards.
 *
 * @since 0.0.0
 * @category constructors
 */
export const Result = <V extends S.Top>(valueSchema: S.Schema<V>) => {
  const base = S.Union([OkResult(valueSchema), ErrorResult]).pipe(
    S.toTaggedUnion("_tag"),
    S.annotate(
      $I.annote("Result", {
        description: "Tagged union of successful and failed operation results.",
      })
    )
  );

  return Object.assign(base, {
    /**
     * Check if a result is successful.
     *
     * @since 0.0.0
     */
    isOk: (a: Result.Type<V>): a is S.Schema.Type<OkResult.Schema<V>> =>
      P.and(P.hasProperty("value"), P.isTagged("Ok"))(a),

    /**
     * Check if a result is an error.
     *
     * @since 0.0.0
     */
    isError: (a: Result.Type<V>): a is ErrorResult => P.and(P.hasProperty("error"), P.isTagged("Error"))(a),
  });
};

/**
 * Types for {@link Result}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace Result {
  /**
   * Tagged result union schema.
   *
   * @since 0.0.0
   * @category models
   */
  export type Schema<V extends S.Top> = S.toTaggedUnion<
    "_tag",
    readonly [
      S.TaggedStruct<
        "Ok",
        {
          readonly value: S.Schema<V>;
          readonly error: S.optionalKey<S.Never>;
        }
      >,
      typeof ErrorResult,
    ]
  >;

  /**
   * Decoded tagged result type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Type<V extends S.Top> = S.Schema.Type<Schema<V>>;

  /**
   * Encoded tagged result type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Encoded<V extends S.Top> = Schema<V>["Encoded"];
}
