import { $AiSdkId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/QuerySupervisorError");

/**
 * Raised when the pending queue rejects a new submission.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export class QueryQueueFullError extends TaggedErrorClass<QueryQueueFullError>($I`QueryQueueFullError`)(
  "QueryQueueFullError",
  {
    message: S.String,
    queryId: S.String,
    capacity: S.Number,
    strategy: S.String,
  },
  $I.annote("QueryQueueFullError", {
    description: "Raised when the pending queue rejects a new submission.",
  })
) {}

/**
 * Raised when a pending query waits too long before starting.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export class QueryPendingTimeoutError extends TaggedErrorClass<QueryPendingTimeoutError>($I`QueryPendingTimeoutError`)(
  "QueryPendingTimeoutError",
  {
    message: S.String,
    queryId: S.String,
    timeoutMs: S.Number,
  },
  $I.annote("QueryPendingTimeoutError", {
    description: "Raised when a pending query waits too long before starting.",
  })
) {
  static readonly make = (params: Pick<QueryPendingTimeoutError, "message" | "queryId" | "timeoutMs">) =>
    new QueryPendingTimeoutError(params);
}

/**
 * Raised when the submitting scope closes before a query starts.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export class QueryPendingCanceledError extends TaggedErrorClass<QueryPendingCanceledError>(
  $I`QueryPendingCanceledError`
)(
  "QueryPendingCanceledError",
  {
    message: S.String,
    queryId: S.String,
  },
  $I.annote("QueryPendingCanceledError", {
    description: "Raised when the submitting scope closes before a query starts.",
  })
) {}

/**
 * Union of all query supervisor errors.
 */
/**
 * @since 0.0.0
 * @category DomainModel
 */
export const QuerySupervisorError = S.Union([
  QueryQueueFullError,
  QueryPendingTimeoutError,
  QueryPendingCanceledError,
]).pipe(
  S.annotate(
    $I.annote("QuerySupervisorError", {
      description: "Union of all query supervisor errors.",
    })
  )
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QuerySupervisorError = typeof QuerySupervisorError.Type;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QuerySupervisorErrorEncoded = typeof QuerySupervisorError.Encoded;
