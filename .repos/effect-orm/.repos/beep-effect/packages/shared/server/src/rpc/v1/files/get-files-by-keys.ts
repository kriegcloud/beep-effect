import { Policy } from "@beep/shared-domain";
import type { File } from "@beep/shared-domain/entities";
import type { Files } from "@beep/shared-domain/rpc/v1/files";
import { FileRepo } from "@beep/shared-server";
import { Effect } from "effect";

type HandlerEffect = (
  payload: Files.GetFilesByKeys.Payload
) => Effect.Effect<readonly (File.Model | null)[], never, FileRepo | Policy.AuthContext>;

export const Handler: HandlerEffect = Effect.fn("files_getFilesByKeys")(
  function* (payload: Files.GetFilesByKeys.Payload) {
    const fileRepo = yield* FileRepo;
    const { user } = yield* Policy.AuthContext;
    return yield* fileRepo.getFilesByKeys({
      keys: payload.uploadKeys,
      userId: user.id,
    });
  },
  Effect.catchTags({
    DatabaseError: Effect.die,
  })
);
