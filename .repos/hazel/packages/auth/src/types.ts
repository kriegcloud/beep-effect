import type { OrganizationId, UserId } from "@hazel/schema"
import type { User as WorkOSUser } from "@workos-inc/node"
import { Schema } from "effect"

// Re-export WorkOS types for consumers
export type { WorkOSUser }

/**
 * Validated session data that gets cached in Redis.
 * Contains everything needed to build a CurrentUser without hitting WorkOS again.
 */
export class ValidatedSession extends Schema.Class<ValidatedSession>("ValidatedSession")({
	/** WorkOS user ID (e.g., user_01KAA...) */
	workosUserId: Schema.String,
	/** User email address */
	email: Schema.String,
	/** WorkOS session ID from JWT sid claim */
	sessionId: Schema.String,
	/** WorkOS organization ID if user is in an org (e.g., org_01...) */
	organizationId: Schema.NullOr(Schema.String),
	/** Internal organization UUID (looked up from WorkOS externalId) */
	internalOrganizationId: Schema.NullOr(Schema.String),
	/** User role within the organization */
	role: Schema.NullOr(Schema.String),
	/** The JWT access token (for extracting additional claims) */
	accessToken: Schema.String,
	/** User's first name */
	firstName: Schema.NullOr(Schema.String),
	/** User's last name */
	lastName: Schema.NullOr(Schema.String),
	/** User's profile picture URL */
	profilePictureUrl: Schema.NullOr(Schema.String),
	/** Unix timestamp when the session expires */
	expiresAt: Schema.Number,
}) {}

/**
 * Authenticated user context returned by electric-proxy auth.
 * Includes the internal database user ID.
 */
export interface AuthenticatedUserContext {
	/** WorkOS user ID (e.g., user_01KAA...) */
	workosUserId: string
	/** Internal database user UUID */
	internalUserId: UserId
	/** User email address */
	email: string
	/** WorkOS organization ID if user is in an org */
	organizationId?: OrganizationId
	/** User role within the organization */
	role?: string
}
