/**
 * Placeholder entity model for Comms slice
 *
 * This is a starter entity to demonstrate the pattern.
 * Rename or replace with your actual domain entities.
 *
 * @module comms-domain/entities/Placeholder
 * @since 0.1.0
 */
import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/email-template");

/**
 * EmailTemplate model for the comms slice.
 *
 * Replace this with your actual domain entity model.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/comms-domain";
 *
 * const placeholder = Entities.EmailTemplate.Model.make({
 *   id: CommsEntityIds.EmailTemplateId.make("placeholder__123"),
 *   name: "Example",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`EmailTemplateModel`)(
  makeFields(CommsEntityIds.EmailTemplateId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId.privateSchema,
    name: S.NonEmptyTrimmedString.annotations({
      title: "Name",
      description: "The name of the placeholder entity",
    }),
    subject: BS.FieldOptionOmittable(S.String),
    body: BS.FieldOptionOmittable(S.String),
    to: BS.FieldOptionOmittable(BS.EmailFromCommaDelimitedString),
    cc: BS.FieldOptionOmittable(BS.EmailFromCommaDelimitedString),
    bcc: BS.FieldOptionOmittable(BS.EmailFromCommaDelimitedString),
  }),
  $I.annotations("EmailTemplateModel", {
    description: "EmailTemplate model for the comms domain context.",
  })
) {
  static readonly utils = modelKit(Model);
}
