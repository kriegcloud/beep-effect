import { SharedEntityIds } from "@beep/shared-domain";
import { Folder } from "@beep/shared-domain/entities";
import type { DbClient } from "@beep/shared-server";
import { SharedDb } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { folder } from "@beep/shared-tables/tables";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

const serviceEffect = Effect.gen(function* () {
  const { makeQueryWithSchema } = yield* SharedDb.Db;
  const baseRepo = yield* DbRepo.make(SharedEntityIds.FolderId, Folder.Model);

  const deleteFolders = makeQueryWithSchema({
    inputSchema: S.Struct({
      folderIds: S.Array(SharedEntityIds.FolderId),
    }),
    outputSchema: S.Void,

    queryFn: (execute, { folderIds }) => {
      if (A.isEmptyReadonlyArray(folderIds)) {
        return Effect.void;
      }
      return execute((client) => client.delete(folder).where(d.inArray(folder.id, folderIds))).pipe(Effect.asVoid);
    },
  });

  return {
    deleteFolders,
    ...baseRepo,
  };
});

export const RepoLive: Layer.Layer<Folder.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Folder.Repo,
  serviceEffect
).pipe(Layer.provide(SharedDb.layer));
