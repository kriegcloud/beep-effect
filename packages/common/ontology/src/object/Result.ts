/**
 * Tagged result schemas and guards for ontology object operations.
 *
 * @since 0.0.0
 * @module @beep/ontology/object/Result
 */
import { $OntologyId } from "@beep/identity/packages";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $OntologyId.create("object/Result");

/**
 * Error result payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface ErrorResult {
  readonly error: Error;
  readonly value?: never;
}

/**
 * Runtime schema for {@link ErrorResult}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ErrorResult = S.Struct({
  error: S.instanceOf(Error),
  value: S.optionalKey(S.Never),
}).pipe(
  S.annotate(
    $I.annote("ErrorResult", {
      description: "Result branch representing an error value.",
    })
  )
);

/**
 * Success result payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface OkResult<V> {
  readonly value: V;
  readonly error?: never;
}

/**
 * Runtime schema constructor for {@link OkResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OkResult = <const V extends S.Top>(valueSchema: V) =>
  S.Struct({
    value: valueSchema,
    error: S.optionalKey(S.Never),
  }).pipe(
    S.annotate(
      $I.annote("OkResult", {
        description: "Result branch representing a successful value.",
      })
    )
  );

/**
 * Union of success and error result payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Result<V> = OkResult<V> | ErrorResult;

/**
 * Runtime schema constructor for {@link Result}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Result = <const V extends S.Top>(valueSchema: V) =>
  S.Union([OkResult(valueSchema), ErrorResult]).pipe(
    S.annotate(
      $I.annote("Result", {
        description: "Union of successful and error operation results.",
      })
    )
  );

/**
 * Check whether a result contains a successful value.
 *
 * @since 0.0.0
 * @category Validation
 */
export function isOk<V>(a: Result<V>): a is OkResult<V> {
  return P.hasProperty(a, "value");
}

/**
 * Check whether a result contains an error value.
 *
 * @since 0.0.0
 * @category Validation
 */
export function isError<V>(a: Result<V>): a is ErrorResult {
  return P.hasProperty(a, "error");
}
