import { Effect } from "effect"
import * as CurrentUser from "./current-user"
import { UnauthorizedError } from "./errors"

/**
 * Transform any error into an UnauthorizedError with context about the action.
 * Uses the current user context to provide detailed error information.
 *
 * @param entity - The type of entity being accessed (e.g., "channel", "message")
 * @param action - The action being performed (e.g., "update", "delete")
 * @returns A function that transforms effect errors into UnauthorizedError
 *
 * @example
 * ```typescript
 * yield* someEffect.pipe(refailUnauthorized("channel", "update"))
 * ```
 */
export const refailUnauthorized = (entity: string, action: string) => {
	return <A, E, R>(
		effect: Effect.Effect<A, E, R>,
	): Effect.Effect<A, UnauthorizedError, CurrentUser.Context | R> =>
		Effect.catchIf(
			effect,
			(e) => !UnauthorizedError.is(e),
			() =>
				Effect.flatMap(CurrentUser.Context, (actor) =>
					Effect.fail(
						new UnauthorizedError({
							message: `You can't ${action} this ${entity}`,
							detail: `You are not authorized to perform ${action} on ${entity} for ${actor.id}`,
						}),
					),
				),
		) as Effect.Effect<A, UnauthorizedError, CurrentUser.Context | R>
}
