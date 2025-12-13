/**
 * Folder repository service for managing folder entities with database operations.
 *
 * @since 0.1.0
 */
import { $SharedInfraId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { Folder } from "@beep/shared-domain/entities";
import { SharedDb } from "@beep/shared-infra/db";
import { Repo } from "@beep/shared-infra/Repo";
import { folder } from "@beep/shared-tables/tables";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $SharedInfraId.create("repos/Folder");

/**
 * Repository service for managing Folder entities with database operations.
 *
 * Provides CRUD operations plus batch deletion of folders.
 *
 * @example
 * ```typescript
 * import { FolderRepo } from "@beep/shared-infra"
 * import { SharedEntityIds } from "@beep/shared-domain"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const folderRepo = yield* FolderRepo
 *
 *   // Delete multiple folders
 *   yield* folderRepo.deleteFolders({
 *     folderIds: [SharedEntityIds.FolderId.make(), SharedEntityIds.FolderId.make()]
 *   })
 * })
 * ```
 *
 * @category services
 * @since 0.1.0
 */
export class FolderRepo extends Effect.Service<FolderRepo>()($I`FolderRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { makeQueryWithSchema } = yield* SharedDb.SharedDb;
    const baseRepo = yield* Repo.make(SharedEntityIds.FolderId, Folder.Model, Effect.succeed({}));

    const deleteFolders = makeQueryWithSchema({
      inputSchema: S.Struct({
        folderIds: S.Array(SharedEntityIds.FolderId),
      }),
      outputSchema: S.Void,
      queryFn: (execute, { folderIds }) => {
        if (A.isEmptyReadonlyArray(folderIds)) {
          return Effect.void;
        }
        return execute((client) => client.delete(folder).where(d.inArray(folder.id, folderIds)));
      },
    });

    return {
      deleteFolders,
      ...baseRepo,
    };
  }),
}) {}
