/**
 * Concept-local Organization value vocabulary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { LiteralKit, OptionFromOptionalNullishKey, Slug } from "@beep/schema";
import { PosInt } from "@beep/schema/Int";
import * as S from "effect/Schema";
import * as EntityMixin from "../../entity/EntityMixin.js";
import * as Shared from "../../identity/Shared.js";

const $I = $SharedDomainId.create("entities/Organization/Organization.values");

/**
 * Commercial license tier assigned to an organization.
 *
 * @example
 * ```ts
 * import { Organization } from "@beep/shared-domain/entities"
 *
 * const isEnterprise = Organization.LicenseTier.is.enterprise("enterprise")
 * console.log(isEnterprise)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const LicenseTier = LiteralKit(["free", "team", "enterprise"]).annotate(
  $I.annote("LicenseTier", {
    description: "Commercial license tier assigned to a shared-kernel organization.",
  })
);

/**
 * Runtime type for {@link LicenseTier}.
 *
 * @example
 * ```ts
 * import type { Organization } from
 * "@beep/shared-domain/entities"
 *
 * const tier: Organization.LicenseTier = "team" as const
 * console.log(tier)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LicenseTier = typeof LicenseTier.Type;

/**
 * Compliance and automation settings owned by an organization.
 *
 * @example
 * ```ts
 * import { Organization } from
 * "@beep/shared-domain/entities"
 * import * as S from "effect/Schema"
 *
 * const settings = S.decodeUnknownSync(Organization.Settings)({
 *   allowAgentActions: true,
 *   defaultRetentionDays: 90,
 * })
 * console.log(settings.allowAgentActions)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Settings extends S.Class<Settings>($I`Settings`)(
  {
    allowAgentActions: S.Boolean,
    defaultRetentionDays: PosInt,
  },
  $I.annote("Settings", {
    description: "Compliance and audit settings owned by a shared-kernel organization.",
  })
) {}

/**
 * Profile fields contributed to the Organization entity through an entity mixin.
 *
 * @example
 * ```ts
 * import { Organization } from
 * "@beep/shared-domain/entities"
 *
 * console.log(Organization.ProfileMixin.fieldMap.slug.columnName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ProfileMixin = EntityMixin.make($I`ProfileMixin`)(
  {
    legalName: S.NonEmptyString,
    licenseTier: LicenseTier,
    name: S.NonEmptyString,
    parentOrgId: OptionFromOptionalNullishKey(Shared.OrganizationId, {
      onNoneEncoding: null,
    }),
    settings: Settings,
    slug: Slug,
  },
  {
    description: "Product-facing profile fields owned by the shared Organization entity.",
    fields: {
      legalName: {
        columnName: "legal_name",
        description: "Legal organization name used for compliance and billing records.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      licenseTier: {
        columnName: "license_tier",
        description: "Commercial license tier assigned to the organization.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      name: {
        columnName: "name",
        description: "Display name for the organization.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      parentOrgId: {
        columnName: "parent_org_id",
        description: "Optional parent organization id for account hierarchies.",
        nullable: true,
        storageKind: "entityId",
        valueStrategy: "provided",
      },
      settings: {
        columnName: "settings",
        description: "Compliance and audit settings stored as JSON.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
      slug: {
        columnName: "slug",
        description: "Unique lowercase slug used in organization-scoped URLs.",
        indexHints: [EntityMixin.IndexHint.unique],
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Organization profile mixin used by entity and table constructors.
 *
 * @example
 * ```ts
 * import { Organization } from
 * "@beep/shared-domain/entities"
 *
 * console.log(Organization.ProfilePack.fieldMap.licenseTier.storageKind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ProfilePack = EntityMixin.pack(ProfileMixin);
