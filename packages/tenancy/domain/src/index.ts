/**
 * Tenancy domain models for the Agentic Professional Runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { LiteralKit } from "@beep/schema";
import { EntityIdValue } from "@beep/shared-domain/entity/EntityId";
import * as S from "effect/Schema";

/**
 * Organization kind used by the first runtime proof.
 *
 * @category models
 * @since 0.0.0
 */
export const OrganizationKind = LiteralKit(["solo_practice", "wealth_firm"] as const);

/**
 * Runtime type for {@link OrganizationKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type OrganizationKind = typeof OrganizationKind.Type;

/**
 * Tenant organization participating in a professional workspace.
 *
 * @category models
 * @since 0.0.0
 */
export class Organization extends S.Class<Organization>("@beep/tenancy-domain/Organization")({
  fixtureKey: S.String,
  id: EntityIdValue,
  kind: OrganizationKind,
  licenseTier: S.String,
  name: S.String,
}) {}

/**
 * Human account inside an organization.
 *
 * @category models
 * @since 0.0.0
 */
export class User extends S.Class<User>("@beep/tenancy-domain/User")({
  displayName: S.String,
  fixtureKey: S.String,
  id: EntityIdValue,
  role: S.String,
}) {}

/**
 * Relationship between a user and an organization.
 *
 * @category models
 * @since 0.0.0
 */
export class Membership extends S.Class<Membership>("@beep/tenancy-domain/Membership")({
  fixtureKey: S.String,
  id: EntityIdValue,
  organizationFixtureKey: S.String,
  role: S.String,
  status: S.String,
  userFixtureKey: S.String,
}) {}

/**
 * Actor reference used by the fixture proof before authoritative writes exist.
 *
 * @category models
 * @since 0.0.0
 */
export class Principal extends S.Class<Principal>("@beep/tenancy-domain/Principal")({
  agentFixtureKey: S.optionalKey(S.String),
  fixtureKey: S.String,
  id: EntityIdValue,
  kind: S.String,
  userFixtureKey: S.optionalKey(S.String),
}) {}
