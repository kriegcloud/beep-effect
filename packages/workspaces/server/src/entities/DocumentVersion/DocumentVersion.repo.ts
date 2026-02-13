import { Entities } from "@beep/workspaces-domain";
import { WorkspacesDb } from "@beep/workspaces-server/db";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

export class VersionNotFoundError extends Data.TaggedError("VersionNotFoundError")<{
  readonly id: WorkspacesEntityIds.DocumentVersionId.Type;
}> {}

const VersionWithAuthorSchema = S.Struct({
  ...Entities.DocumentVersion.Model.fields,
  author: User.Model.select.pick("id", "_rowId", "name", "image"),
});

export type VersionWithAuthor = typeof VersionWithAuthorSchema.Type;

const serviceEffect = Effect.gen(function* () {
  const { makeQuery } = yield* WorkspacesDb.Db;

  const baseRepo = yield* DbRepo.make(WorkspacesEntityIds.DocumentVersionId, Entities.DocumentVersion.Model);

  const findByIdOrFail = (
    id: WorkspacesEntityIds.DocumentVersionId.Type
  ): Effect.Effect<typeof Entities.DocumentVersion.Model.Type, VersionNotFoundError | DbClient.DatabaseError> =>
    baseRepo.findById({ id }).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => Effect.fail(new VersionNotFoundError({ id })),
          onSome: ({ data }) => Effect.succeed(data),
        })
      ),
      Effect.withSpan("DocumentVersionRepo.findByIdOrFail", { attributes: { id } })
    );

  const getWithAuthor = makeQuery(
    (
      execute,
      params: {
        readonly id: WorkspacesEntityIds.DocumentVersionId.Type;
      }
    ) =>
      execute((client) =>
        client.query.documentVersion.findFirst({
          where: (table, { eq, isNull, and }) => and(eq(table.id, params.id), isNull(table.deletedAt)),
          with: {
            author: {
              columns: { id: true, _rowId: true, name: true, image: true },
            },
          },
        })
      ).pipe(
        Effect.filterOrFail(
          (result): result is NonNullable<typeof result> => result !== null && result !== undefined,
          () => new VersionNotFoundError({ id: params.id })
        ),
        Effect.flatMap((result) => S.decode(VersionWithAuthorSchema)(result)),
        Effect.mapError((e) => (e instanceof VersionNotFoundError ? e : DbClient.DatabaseError.$match(e))),
        Effect.withSpan("DocumentVersionRepo.getWithAuthor", { attributes: { id: params.id } })
      )
  );

  const listByDocument = makeQuery(
    (
      execute,
      params: {
        readonly documentId: WorkspacesEntityIds.DocumentId.Type;
      }
    ) =>
      execute((client) =>
        client.query.documentVersion.findMany({
          where: (table, { eq, isNull, and }) => and(eq(table.documentId, params.documentId), isNull(table.deletedAt)),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
          with: {
            author: {
              columns: { id: true, _rowId: true, name: true, image: true },
            },
          },
        })
      ).pipe(
        Effect.flatMap(S.decode(S.Array(VersionWithAuthorSchema))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DocumentVersionRepo.listByDocument", { attributes: { documentId: params.documentId } })
      )
  );

  const createSnapshot = Effect.fn("DocumentVersionRepo.createSnapshot")(function* (
    input: typeof Entities.DocumentVersion.Model.insert.Type
  ) {
    return yield* baseRepo.insert(input);
  });

  const hardDelete = (id: WorkspacesEntityIds.DocumentVersionId.Type) =>
    baseRepo.delete({ id }).pipe(Effect.withSpan("DocumentVersionRepo.hardDelete", { attributes: { id } }));

  return {
    ...baseRepo,
    findByIdOrFail,
    getWithAuthor,
    listByDocument,
    createSnapshot,
    hardDelete,
  } as unknown as Entities.DocumentVersion.RepoShape;
});

export const RepoLive: Layer.Layer<Entities.DocumentVersion.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.DocumentVersion.Repo,
  serviceEffect
).pipe(Layer.provide(WorkspacesDb.layer));
