import { Policy } from "@beep/shared-domain";
import type { Files } from "@beep/shared-domain/rpc/v1/files";
import { FileRepo } from "@beep/shared-server";
import { Effect } from "effect";

type HandlerEffect = (payload: Files.MoveFiles.Payload) => Effect.Effect<void, never, FileRepo | Policy.AuthContext>;

export const Handler: HandlerEffect = Effect.fn("files_moveFiles")(
  function* (payload: Files.MoveFiles.Payload) {
    const { user } = yield* Policy.AuthContext;
    const fileRepo = yield* FileRepo;
    yield* fileRepo.moveFiles({
      fileIds: payload.fileIds,
      folderId: payload.folderId,
      userId: user.id,
    });
  },
  Effect.catchTags({
    DatabaseError: Effect.die,
  })
);
