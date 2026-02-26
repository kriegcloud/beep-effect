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
 * Paged result shape used by object fetch APIs.
 *
 * @since 0.0.0
 * @category models
 */
export interface PageResult<T> {
  readonly data: Array<T>;
  readonly nextPageToken?: string;
  readonly totalCount: string;
}

/**
 * Construct a schema for {@link PageResult}.
 *
 * @since 0.0.0
 * @category constructors
 */
export const PageResult = <const T extends S.Top>(schema: S.Schema<T>) =>
  S.Struct({
    data: S.Array(schema),
    nextPageToken: S.optionalKey(S.String),
    totalCount: S.String,
  }).pipe(
    S.annotate(
      $I.annote("PageResult", {
        description: "Paged result envelope containing data, next-page token, and total count.",
      })
    )
  );
