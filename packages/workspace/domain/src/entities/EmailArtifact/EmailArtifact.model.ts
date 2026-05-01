/**
 * Email artifact entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import { EmailArtifactProfilePack } from "./EmailArtifact.values.js";

const $I = $WorkspaceDomainId.create("entities/EmailArtifact/EmailArtifact.model");

/**
 * Normalized email artifact imported into a workspace thread.
 *
 * @example
 * ```ts
 * import { EmailArtifact } from "@beep/workspace-domain"
 *
 * console.log(EmailArtifact.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EmailArtifact extends BaseEntity.extend<EmailArtifact>($I`EmailArtifact`)(
  Workspace.EmailArtifactId,
  EmailArtifactProfilePack,
  {},
  $I.annote("EmailArtifact", {
    description: "Normalized email artifact imported into a workspace thread.",
  })
) {}
