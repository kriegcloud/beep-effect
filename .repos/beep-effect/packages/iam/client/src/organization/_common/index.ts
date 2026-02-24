// Organization schemas
export { FullOrganization } from "./full-organization.schema.ts";

// Invitation schemas
export { Invitation, InvitationStatus } from "./invitation.schema.ts";

// Member schemas
export { FullMember, Member } from "./member.schema.ts";
export { EmbeddedUser, Organization } from "./organization.schema.ts";

// Shared types
import * as S from "effect/Schema";

/**
 * Role type literal union for organization member roles.
 * This matches the Better Auth organization plugin's expected role types.
 */
export const RoleType = S.Literal("admin", "member", "owner");

/**
 * TypeScript type for RoleType.
 */
export type RoleType = S.Schema.Type<typeof RoleType>;

/**
 * Mutable array of role types.
 * Uses .pipe(S.mutable) to ensure compatibility with Better Auth's non-readonly array types.
 */
export const RoleArray = S.Array(RoleType).pipe(S.mutable);

/**
 * Role type that accepts either a single role or an array of roles.
 * Used for invitation payloads.
 */
export const RoleOrRoles = S.Union(RoleType, RoleArray);

/**
 * Metadata schema for organization metadata.
 */
export const Metadata = S.Record({ key: S.String, value: S.Any });
