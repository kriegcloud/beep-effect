import { Policy } from "@beep/shared-domain";
import { FileRepo } from "@beep/shared-server";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";

export const Handler = Effect.fnUntraced(function* () {
  const { user } = yield* Policy.AuthContext;
  const fileRepo = yield* FileRepo;
  const limit = 100;
  return Stream.paginateEffect(0, (offset) =>
    fileRepo
      .listPaginated({
        userId: user.id,
        offset,
        limit,
      })
      .pipe(
        Effect.catchTags({
          DatabaseError: Effect.die,
        }),
        Effect.map(
          (result) =>
            [
              { rootFiles: result.rootFiles, folders: result.folders },
              result.hasNext ? O.some(offset + limit) : O.none<number>(),
            ] as const
        )
      )
  );
}, Stream.unwrap);
