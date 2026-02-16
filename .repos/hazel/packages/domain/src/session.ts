import { OrganizationId } from "@hazel/schema"
import { Schema } from "effect"

/**
 * JWT payload decoded from WorkOS session accessToken
 */
export class JwtPayload extends Schema.Class<JwtPayload>("JwtPayload")({
	name: Schema.String,
	email: Schema.String,
	picture: Schema.NullishOr(Schema.String),
	given_name: Schema.NullishOr(Schema.String),
	updated_at: Schema.String,
	family_name: Schema.NullishOr(Schema.String),
	email_verified: Schema.Boolean,
	externalOrganizationId: Schema.NullishOr(OrganizationId),
	role: Schema.NullishOr(Schema.String),
}) {}
