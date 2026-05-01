/**
 * Workspace value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WorkspaceDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/Workspace/Workspace.values");

/**
 * Entity-specific fields contributed to the Workspace entity.
 *
 * @example
 * ```ts
 * import { WorkspaceProfileMixin } from "@beep/workspace-domain"
 *
 * console.log(WorkspaceProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const WorkspaceProfileMixin = EntityMixin.make($I`WorkspaceProfileMixin`)(
  {
    fixtureKey: S.String,
    name: S.String,
    organizationFixtureKey: S.String,
    ownerPrincipalFixtureKey: S.String,
  },
  {
    description: "Runtime proof fields owned by the Workspace entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier used by deterministic runtime scenarios.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      name: {
        columnName: "name",
        description: "Workspace display name.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      organizationFixtureKey: {
        columnName: "organization_fixture_key",
        description: "Fixture key of the owning organization.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      ownerPrincipalFixtureKey: {
        columnName: "owner_principal_fixture_key",
        description: "Fixture key of the principal that owns the workspace.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Workspace profile mixin.
 *
 * @example
 * ```ts
 * import { WorkspaceProfilePack } from "@beep/workspace-domain"
 *
 * console.log(WorkspaceProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const WorkspaceProfilePack = EntityMixin.pack(WorkspaceProfileMixin);
