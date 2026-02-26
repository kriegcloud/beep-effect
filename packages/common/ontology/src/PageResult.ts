/**
 * Paged ontology query result helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/PageResult
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("PageResult");

/**
 * Types for paged result schemas.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace PageResult {
  /**
   * Generic page result schema type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Schema<T extends S.Top> = S.Schema<T>;

  /**
   * Decoded page result type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Type<T extends S.Top> = S.Schema.Type<Schema<T>>;

  /**
   * Encoded page result type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Encoded<T extends S.Top> = Schema<T>["Encoded"];
}

/**
 * Construct a standard page result schema for object fetch operations.
 *
 * @since 0.0.0
 * @category constructors
 */
export function PageResult<const T extends S.Top>(
  schema: S.Schema<T>
): S.Struct<{
  readonly data: S.$Array<S.Schema<T>>;
  readonly nextPageToken: S.OptionFromOptional<S.String>;
  readonly totalCount: S.String;
}> {
  return S.Struct({
    data: S.Array(schema),
    nextPageToken: S.OptionFromOptional(S.String),
    totalCount: S.String,
  }).pipe(
    S.annotate(
      $I.annote("PageResult", {
        description: "Paged result envelope containing data, next-page token, and total count.",
      })
    )
  );
}
