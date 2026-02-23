import { WorkspacesEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { Entities } from "@beep/workspaces-domain";
import { DiscussionNotFoundError } from "@beep/workspaces-domain/entities/Discussion/Discussion.errors";
import { WorkspacesDb } from "@beep/workspaces-server/db";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const DiscussionWithCommentsSchema = S.Struct({
  ...Entities.Discussion.Model.fields,
  author: User.Model.select.pick("image", "name", "id", "_rowId"),
  comments: S.Array(
    S.Struct({
      author: User.Model.select.pick("image", "name", "id", "_rowId"),
      ...Entities.Comment.Model.select.pick(
        "id",
        "_rowId",
        "contentRich",
        "createdAt",
        "discussionId",
        "isEdited",
        "updatedAt"
      ).fields,
    })
  ),
});

const serviceEffect = Effect.gen(function* () {
  const { makeQuery } = yield* WorkspacesDb.Db;

  const baseRepo = yield* DbRepo.make(WorkspacesEntityIds.DiscussionId, Entities.Discussion.Model);

  const findByIdOrFail = (
    id: WorkspacesEntityIds.DiscussionId.Type
  ): Effect.Effect<typeof Entities.Discussion.Model.Type, DiscussionNotFoundError | DbClient.DatabaseError> =>
    baseRepo.findById({ id }).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => Effect.fail(new DiscussionNotFoundError({ id })),
          onSome: ({ data }) => Effect.succeed(data),
        })
      ),
      Effect.withSpan("DiscussionRepo.findByIdOrFail", { attributes: { id } })
    );

  const getWithComments = makeQuery(
    (
      execute,
      params: {
        readonly id: WorkspacesEntityIds.DiscussionId.Type;
      }
    ) =>
      execute((client) =>
        client.query.discussion.findFirst({
          where: (table, { eq, isNull, and }) => and(eq(table.id, params.id), isNull(table.deletedAt)),
          with: {
            author: {
              columns: { id: true, _rowId: true, name: true, image: true },
            },
            comments: {
              where: (table, { isNull }) => isNull(table.deletedAt),
              orderBy: (table, { asc }) => [asc(table.createdAt)],
              columns: {
                id: true,
                _rowId: true,
                contentRich: true,
                createdAt: true,
                discussionId: true,
                isEdited: true,
                updatedAt: true,
              },
              with: {
                author: {
                  columns: { id: true, _rowId: true, name: true, image: true },
                },
              },
            },
          },
        })
      ).pipe(
        Effect.filterOrFail(
          (result): result is NonNullable<typeof result> => result !== null && result !== undefined,
          () => new DiscussionNotFoundError({ id: params.id })
        ),
        Effect.flatMap((result) => S.decode(DiscussionWithCommentsSchema)(result)),
        Effect.mapError((e) => (e instanceof DiscussionNotFoundError ? e : DbClient.DatabaseError.$match(e))),
        Effect.withSpan("DiscussionRepo.getWithComments", { attributes: { id: params.id } })
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
        client.query.discussion.findMany({
          where: (table, { eq, isNull, and }) => and(eq(table.documentId, params.documentId), isNull(table.deletedAt)),
          orderBy: (table, { desc }) => [desc(table.createdAt)],
          with: {
            author: {
              columns: { id: true, _rowId: true, name: true, image: true },
            },
            comments: {
              where: (table, { isNull }) => isNull(table.deletedAt),
              orderBy: (table, { asc }) => [asc(table.createdAt)],
              columns: {
                id: true,
                _rowId: true,
                contentRich: true,
                createdAt: true,
                discussionId: true,
                isEdited: true,
                updatedAt: true,
              },
              with: {
                author: {
                  columns: { id: true, _rowId: true, name: true, image: true },
                },
              },
            },
          },
        })
      ).pipe(
        Effect.flatMap(S.decode(S.Array(DiscussionWithCommentsSchema))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DiscussionRepo.listByDocument", { attributes: { documentId: params.documentId } })
      )
  );

  const create = flow(
    (input: typeof Entities.Discussion.Model.insert.Type) => baseRepo.insert(input),
    Effect.withSpan("DiscussionRepo.create")
  );

  const resolve = (id: WorkspacesEntityIds.DiscussionId.Type) =>
    Effect.gen(function* () {
      const discussion = yield* findByIdOrFail(id);
      const { data } = yield* baseRepo.update({ ...discussion, isResolved: true });
      return data;
    }).pipe(Effect.withSpan("DiscussionRepo.resolve", { attributes: { id } }));

  const unresolve = (id: WorkspacesEntityIds.DiscussionId.Type) =>
    Effect.gen(function* () {
      const discussion = yield* findByIdOrFail(id);
      const { data } = yield* baseRepo.update({ ...discussion, isResolved: false });
      return data;
    }).pipe(Effect.withSpan("DiscussionRepo.unresolve", { attributes: { id } }));

  const hardDelete = (id: WorkspacesEntityIds.DiscussionId.Type) =>
    baseRepo.delete({ id }).pipe(Effect.withSpan("DiscussionRepo.hardDelete", { attributes: { id } }));

  return {
    ...baseRepo,
    findByIdOrFail,
    getWithComments,
    listByDocument,
    create,
    resolve,
    unresolve,
    hardDelete,
  } as unknown as Entities.Discussion.RepoShape;
});

export const RepoLive: Layer.Layer<Entities.Discussion.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.Discussion.Repo,
  serviceEffect
).pipe(Layer.provide(WorkspacesDb.layer));
