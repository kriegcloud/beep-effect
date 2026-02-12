import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { SharedEntityIds } from "../../entity-ids";

const $I = $SharedDomainId.create("entities/Team/Team.model");

export class Model extends M.Class<Model>($I`TeamModel`)(
  makeFields(SharedEntityIds.TeamId, {
    name: S.NonEmptyString.annotations({
      description: "The team's name",
    }),
    description: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Description of the team's purpose",
      })
    ),
    slug: BS.Slug.annotations({
      description: "URL-friendly team identifier",
    }),
    metadata: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "JSON metadata for additional team data",
      })
    ),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("TeamModel", {
    description: "Team model representing teams within organizations.",
  })
) {
  static readonly utils = modelKit(Model);
}
