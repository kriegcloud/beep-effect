import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/EmailTemplate/EmailTemplate.model");

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
