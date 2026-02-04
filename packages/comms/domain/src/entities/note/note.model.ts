import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/note/note.model");

export class Model extends M.Class<Model>($I`NoteModel`)(
  makeFields(CommsEntityIds.NoteId, {
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user who created this note",
    }),

    connectionId: CommsEntityIds.ConnectionId.annotations({
      description: "ID of the email connection this note belongs to",
    }),

    threadId: S.String.annotations({
      description: "Provider's thread ID this note is attached to",
    }),

    content: S.String.annotations({
      description: "The note content",
    }),

    isPinned: BS.BoolWithDefault(false).annotations({
      description: "Whether this note is pinned for visibility",
    }),
  }),
  $I.annotations("NoteModel", {
    title: "Note Model",
    description: "User note attached to an email thread",
  })
) {
  static readonly utils = modelKit(Model);
}
