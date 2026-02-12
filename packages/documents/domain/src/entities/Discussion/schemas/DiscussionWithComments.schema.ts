import { $DocumentsDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import * as Comment from "../../Comment/Comment.model";
import * as Discussion from "../Discussion.model";

const $I = $DocumentsDomainId.create("entities/Discussion/schemas/DiscussionWithComments.schema");

export const DiscussionWithComments = S.Struct({
  ...Discussion.Model.json.fields,
  user: User.Model.select.pick("image", "name", "id", "_rowId"),
  comments: S.Array(
    S.Struct({
      user: User.Model.select.pick("image", "name", "id", "_rowId"),
      ...Comment.Model.select.pick("id", "_rowId", "contentRich", "createdAt", "discussionId", "isEdited", "updatedAt")
        .fields,
    })
  ),
}).annotations(
  $I.annotations("DiscussionWithComments", {
    description: "Discussion with nested comments and user information.",
  })
);

export type DiscussionWithComments = typeof DiscussionWithComments.Type;
