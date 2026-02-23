import { Policy } from "@beep/shared-domain";
import type { File, Folder } from "@beep/shared-domain/entities";
import { FileRepo } from "@beep/shared-server";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";

type HandlerEffect = () => Stream.Stream<
  {
    readonly rootFiles: readonly File.Model[];
    readonly folders: readonly Folder.WithUploadedFiles[];
  },
  never,
  FileRepo | Policy.AuthContext
>;
export const Handler: HandlerEffect = Effect.fnUntraced(function* () {
  const { user: currentUser } = yield* Policy.AuthContext;
  const fileRepo = yield* FileRepo;
  const limit = 100;
  return Stream.paginateEffect(0, (offset) =>
    fileRepo
      .listPaginated({
        userId: currentUser.id,
        offset,
        limit,
      })
      .pipe(
        Effect.map(
          (result) =>
            [
              { rootFiles: result.rootFiles, folders: result.folders },
              result.hasNext ? O.some(offset + limit) : O.none<number>(),
            ] as const
        ),
        Effect.catchTags({
          DatabaseError: Effect.die,
        })
      )
  );
}, Stream.unwrap);
