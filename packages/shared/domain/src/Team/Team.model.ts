import { BS } from "@beep/schema";
import * as Common from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/EntityIds";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const TeamModelSchemaId = Symbol.for("@beep/shared-domain/TeamModel");

/**
 * Team model representing teams within organizations.
 * Maps to the `team` table in the database.
 */
export class Model extends M.Class<Model>(`TeamModel`)(
  {
    /** Primary key identifier for the team */
    _rowId: M.Generated(SharedEntityIds.TeamId.privateSchema),
    id: M.Generated(SharedEntityIds.TeamId),

    /** Team name */
    name: S.NonEmptyString.annotations({
      description: "The team's name",
    }),

    /** Team description */
    description: M.FieldOption(
      S.String.annotations({
        description: "Description of the team's purpose",
      })
    ),

    /** Team slug for URLs */
    slug: M.FieldOption(
      BS.Slug.annotations({
        description: "URL-friendly team identifier",
      })
    ),

    /** Team metadata */
    metadata: M.FieldOption(
      S.String.annotations({
        description: "JSON metadata for additional team data",
      })
    ),

    // Default columns include organizationId
    ...Common.defaultColumns,
  },
  {
    title: "Team Model",
    description: "Team model representing teams within organizations.",
    schemaId: TeamModelSchemaId,
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
