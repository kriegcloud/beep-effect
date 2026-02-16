import { ProxyAuth, ProxyAuthenticationError } from "@hazel/auth/proxy"
import type { UserId } from "@hazel/schema"
import { Effect } from "effect"

/**
 * Authenticated user context extracted from session
 */
export interface AuthenticatedUser {
	userId: string // WorkOS external ID (e.g., user_01KAA...)
	internalUserId: UserId // Internal database UUID
	email: string
	organizationId?: string
	role?: string
}

/**
 * Validate authentication and return authenticated user.
 * Requires a Bearer token (JWT) in the Authorization header.
 * Uses @hazel/auth for JWT validation with user lookup caching.
 */
export const validateSession = Effect.fn("ElectricProxy.validateSession")(function* (request: Request) {
	const proxyAuth = yield* ProxyAuth

	// Require Bearer token
	const authHeader = request.headers.get("Authorization")
	if (!authHeader?.startsWith("Bearer ")) {
		yield* Effect.annotateCurrentSpan("auth.header.present", false)
		return yield* new ProxyAuthenticationError({
			message: "No Bearer token provided",
			detail: "Authentication requires a Bearer token in the Authorization header",
		})
	}

	const token = authHeader.slice(7)
	yield* Effect.annotateCurrentSpan("auth.header.present", true)
	yield* Effect.annotateCurrentSpan("auth.scheme", "bearer")

	const authContext = yield* proxyAuth.validateBearerToken(token)
	yield* Effect.annotateCurrentSpan("auth.organization.present", !!authContext.organizationId)
	yield* Effect.annotateCurrentSpan("auth.role.present", !!authContext.role)

	return {
		userId: authContext.workosUserId,
		internalUserId: authContext.internalUserId,
		email: authContext.email,
		organizationId: authContext.organizationId,
		role: authContext.role,
	} satisfies AuthenticatedUser
})
