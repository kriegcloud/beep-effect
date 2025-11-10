import {BS} from "@beep/schema";
import {TaskEntityIds, SharedEntityIds} from "@beep/shared-domain";
import {makeFields} from "@beep/shared-domain/common";
import {modelKit} from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Todo model representing external OAuth provider accounts linked to users.
 * Maps to the `account` table in the database.
 */

export class Model extends M.Class<Model>(`TodoModel`)(
  makeFields(TaskEntityIds.TodoId, {
    title: BS.NameAttribute,
    description: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "The description of the todo",
      })
    ),
    team: BS.FieldOptionOmittable(
      SharedEntityIds.TeamId.annotations({
        description: "The team the todo belongs to",
      })
    ),
    author: SharedEntityIds.UserId.annotations({
      description: "The author of the todo",
    }),
    completed: BS.BoolWithDefault(false).annotations({
      description: "Whether the todo is completed",
    })

  })
) {
  static readonly utils = modelKit(Model);
}

export class ModelTagged extends M.Class<ModelTagged>(`ModelTagged`)({
  _tag: BS.toOptionalWithDefault(S.Literal("Todo"))("Todo"),
  ...Model.fields,
}) {
  static readonly utils = modelKit(ModelTagged);
}
