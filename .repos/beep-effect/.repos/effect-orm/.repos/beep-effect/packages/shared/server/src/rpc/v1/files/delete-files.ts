import { Policy } from "@beep/shared-domain";
import type { Files } from "@beep/shared-domain/rpc/v1/files";
import { FileRepo } from "@beep/shared-server";
import { Effect } from "effect";
import * as A from "effect/Array";

type HandlerEffect = (payload: Files.DeleteFiles.Payload) => Effect.Effect<void, never, Policy.AuthContext | FileRepo>;
export const Handler: HandlerEffect = Effect.fn("files_deleteFiles")(
  function* (payload: Files.DeleteFiles.Payload) {
    const { user } = yield* Policy.AuthContext;
    const fileRepo = yield* FileRepo;
    const keys = yield* fileRepo.deleteFiles({
      fileIds: payload.fileIds,
      userId: user.id,
    });
    if (A.isNonEmptyReadonlyArray(keys)) {
      yield* Effect.logInfo("delete in s3");
    }
  },
  Effect.catchTags({
    DatabaseError: Effect.die,
  })
);
