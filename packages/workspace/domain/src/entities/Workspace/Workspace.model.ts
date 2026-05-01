/**
 * Workspace entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { WorkspaceProfilePack } from "./Workspace.values.js";

const $I = $WorkspaceDomainId.create("entities/Workspace/Workspace.model");

/**
 * User or team work area.
 *
 * @example
 * ```ts
 * import { Workspace } from "@beep/workspace-domain"
 *
 * console.log(Workspace.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Workspace extends BaseEntity.extend<Workspace>($I`Workspace`)(
  WorkspaceIdentity.WorkspaceId,
  WorkspaceProfilePack,
  {},
  $I.annote("Workspace", {
    description: "User or team work area participating in a runtime scenario.",
  })
) {}
