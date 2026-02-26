import {$AiSdkId} from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/QuerySupervisorError");

/**
 * Raised when the pending queue rejects a new submission.
 */
export class QueryQueueFullError extends S.TaggedErrorClass<QueryQueueFullError>($I`QueryQueueFullError`)(
	"QueryQueueFullError",
	{
		message: S.String,
		queryId: S.String,
		capacity: S.Number,
		strategy: S.String
	},
	$I.annote("QueryQueueFullError", {
		description: "Raised when the pending queue rejects a new submission."
	})
) {
}

/**
 * Raised when a pending query waits too long before starting.
 */
export class QueryPendingTimeoutError extends S.TaggedErrorClass<QueryPendingTimeoutError>()(
	"QueryPendingTimeoutError",
	{
		message: S.String,
		queryId: S.String,
		timeoutMs: S.Number
	},
	$I.annote("QueryPendingTimeoutError", {
		description: "Raised when a pending query waits too long before starting."
	})
) {
	static readonly make = (params: Pick<QueryPendingTimeoutError, "message" | "queryId" | "timeoutMs">) => new QueryPendingTimeoutError(params)
}

/**
 * Raised when the submitting scope closes before a query starts.
 */
export class QueryPendingCanceledError extends S.TaggedErrorClass<QueryPendingCanceledError>()(
	"QueryPendingCanceledError",
	{
		message: S.String,
		queryId: S.String
	},
	$I.annote("QueryPendingCanceledError", {
		description: "Raised when the submitting scope closes before a query starts."
	})
) {
}

/**
 * Union of all query supervisor errors.
 */
export const QuerySupervisorError = S.Union([
	QueryQueueFullError,
	QueryPendingTimeoutError,
	QueryPendingCanceledError
]).pipe(
	S.toTaggedUnion("_tag"),
	S.annotate($I.annote("QuerySupervisorError", {
		description: "Union of all query supervisor errors."
	}))
);

export type QuerySupervisorError = typeof QuerySupervisorError.Type
export type QuerySupervisorErrorEncoded = typeof QuerySupervisorError.Encoded
