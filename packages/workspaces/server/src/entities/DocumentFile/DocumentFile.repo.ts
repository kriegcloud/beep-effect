import { type SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { Entities } from "@beep/workspaces-domain";
import { WorkspacesDb } from "@beep/workspaces-server/db";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

export class FileNotFoundError extends Data.TaggedError("FileNotFoundError")<{
  readonly id: WorkspacesEntityIds.DocumentFileId.Type;
}> {}

const serviceEffect = Effect.gen(function* () {
  const { makeQuery } = yield* WorkspacesDb.Db;

  const baseRepo = yield* DbRepo.make(WorkspacesEntityIds.DocumentFileId, Entities.DocumentFile.Model);

  const findByIdOrFail = (
    id: WorkspacesEntityIds.DocumentFileId.Type
  ): Effect.Effect<typeof Entities.DocumentFile.Model.Type, FileNotFoundError | DbClient.DatabaseError> =>
    baseRepo.findById({ id }).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => Effect.fail(new FileNotFoundError({ id })),
          onSome: ({ data }) => Effect.succeed(data),
        })
      ),
      Effect.withSpan("DocumentFileRepo.findByIdOrFail", { attributes: { id } })
    );

  const listByDocument = makeQuery(
    (
      execute,
      params: {
        readonly documentId: WorkspacesEntityIds.DocumentId.Type;
      }
    ) =>
      execute((client) =>
        client.query.documentFile.findMany({
          where: (table, { eq, isNull, and }) => and(eq(table.documentId, params.documentId), isNull(table.deletedAt)),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        })
      ).pipe(
        Effect.flatMap(S.decode(S.Array(Entities.DocumentFile.Model))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DocumentFileRepo.listByDocument", { attributes: { documentId: params.documentId } })
      )
  );

  const listByUser = makeQuery(
    (
      execute,
      params: {
        readonly userId: SharedEntityIds.UserId.Type;
        readonly organizationId: SharedEntityIds.OrganizationId.Type;
      }
    ) =>
      execute((client) =>
        client.query.documentFile.findMany({
          where: (table, { eq, isNull, and }) =>
            and(
              eq(table.userId, params.userId),
              eq(table.organizationId, params.organizationId),
              isNull(table.deletedAt)
            ),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        })
      ).pipe(
        Effect.flatMap(S.decode(S.Array(Entities.DocumentFile.Model))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DocumentFileRepo.listByUser", { attributes: { userId: params.userId } })
      )
  );

  const create = Effect.fn("DocumentFileRepo.create")(function* (
    input: typeof Entities.DocumentFile.Model.insert.Type
  ) {
    return yield* baseRepo.insert(input);
  });

  const hardDelete = (id: WorkspacesEntityIds.DocumentFileId.Type) =>
    baseRepo.delete({ id }).pipe(Effect.withSpan("DocumentFileRepo.hardDelete", { attributes: { id } }));

  return {
    ...baseRepo,
    findByIdOrFail,
    listByDocument,
    listByUser,
    create,
    hardDelete,
  } as unknown as Entities.DocumentFile.RepoShape;
});

export const RepoLive: Layer.Layer<Entities.DocumentFile.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.DocumentFile.Repo,
  serviceEffect
).pipe(Layer.provide(WorkspacesDb.layer));
