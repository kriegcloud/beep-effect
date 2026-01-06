import type { Files } from "@beep/shared-domain/rpc/v1/files";
import { FolderRepo } from "@beep/shared-server/db";
import { Effect } from "effect";

type HandlerEffect = (payload: Files.DeleteFolders.Payload) => Effect.Effect<void, never, FolderRepo>;
export const Handler: HandlerEffect = Effect.fn("files_deleteFolders")(
  function* (payload: Files.DeleteFolders.Payload) {
    const folderRepo = yield* FolderRepo;
    yield* folderRepo.deleteFolders(payload);
  },
  Effect.catchTags({
    DatabaseError: Effect.die,
  })
);
