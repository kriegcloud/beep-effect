import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { SharedEntityIds } from "../../entity-ids";

export const TeamModelSchemaId = Symbol.for("@beep/shared-domain/TeamModel");

/**
 * Team model representing teams within organizations.
 * Maps to the `team` table in the database.
 */
export class Model extends M.Class<Model>(`TeamModel`)(
  makeFields(SharedEntityIds.TeamId, {
    /** Team name */
    name: S.NonEmptyString.annotations({
      description: "The team's name",
    }),

    /** Team description */
    description: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Description of the team's purpose",
      })
    ),

    /** Team slug for URLs */
    slug: BS.Slug.annotations({
      description: "URL-friendly team identifier",
    }),

    /** Team metadata */
    metadata: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "JSON metadata for additional team data",
      })
    ),
    /**
     *
     */
    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "Team Model",
    description: "Team model representing teams within organizations.",
    schemaId: TeamModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
