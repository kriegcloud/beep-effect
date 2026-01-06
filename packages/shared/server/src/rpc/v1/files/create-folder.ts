import { Policy, SharedEntityIds } from "@beep/shared-domain";
import type { Folder } from "@beep/shared-domain/entities";
import type { Files } from "@beep/shared-domain/rpc/v1/files";
import { FolderRepo } from "@beep/shared-server";
import { Effect } from "effect";
import * as O from "effect/Option";

type HandlerEffect = (
  payload: Files.CreateFolder.Payload
) => Effect.Effect<Folder.Model, never, Policy.AuthContext | FolderRepo>;

export const Handler: HandlerEffect = Effect.fn("files_createFolder")(
  function* (payload: Files.CreateFolder.Payload) {
    const { user, organization } = yield* Policy.AuthContext;
    const folderRepo = yield* FolderRepo;
    return yield* folderRepo.insert({
      id: SharedEntityIds.FolderId.create(),
      source: O.some("user"),
      createdBy: O.some(user.id),
      updatedBy: O.some(user.id),
      deletedAt: O.none(),
      deletedBy: O.none(),
      organizationId: organization.id,
      userId: user.id,
      name: payload.folderName,
    });
  },
  Effect.catchTags({
    DatabaseError: Effect.die,
  })
);
