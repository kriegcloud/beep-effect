/**
 * Approval gate entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import { ApprovalGateProfilePack } from "./ApprovalGate.values.js";

const $I = $WorkspaceDomainId.create("entities/ApprovalGate/ApprovalGate.model");

/**
 * Human approval gate for candidate work.
 *
 * @example
 * ```ts
 * import { ApprovalGate } from "@beep/workspace-domain"
 *
 * console.log(ApprovalGate.definition.entityId.entityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ApprovalGate extends BaseEntity.extend<ApprovalGate>($I`ApprovalGate`)(
  Workspace.ApprovalGateId,
  ApprovalGateProfilePack,
  {},
  $I.annote("ApprovalGate", {
    description: "Human approval gate for candidate work.",
  })
) {}
