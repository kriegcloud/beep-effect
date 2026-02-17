import { CurrentUser } from "@hazel/domain"
import { Effect, Layer, Redacted } from "effect"
import { SessionManager } from "./session-manager"

export const AuthorizationLive = Layer.effect(
	CurrentUser.Authorization,
	Effect.gen(function* () {
		yield* Effect.logDebug("Initializing Authorization middleware...")

		const sessionManager = yield* SessionManager

		return {
			bearer: (bearerToken) =>
				Effect.gen(function* () {
					yield* Effect.logDebug("checking bearer token")

					// Use SessionManager to handle bearer token authentication
					return yield* sessionManager.authenticateWithBearer(Redacted.value(bearerToken))
				}),
		}
	}),
)
