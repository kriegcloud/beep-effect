/**
 * Context packet entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import { ContextPacketProfilePack } from "./ContextPacket.values.js";

const $I = $WorkspaceDomainId.create("entities/ContextPacket/ContextPacket.model");

/**
 * Bounded context packet returned through the SDK facade.
 *
 * @example
 * ```ts
 * import { ContextPacket } from "@beep/workspace-domain"
 *
 * console.log(ContextPacket.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ContextPacket extends BaseEntity.extend<ContextPacket>($I`ContextPacket`)(
  Workspace.ContextPacketId,
  ContextPacketProfilePack,
  {},
  $I.annote("ContextPacket", {
    description: "Bounded context packet returned through the SDK facade.",
  })
) {}
