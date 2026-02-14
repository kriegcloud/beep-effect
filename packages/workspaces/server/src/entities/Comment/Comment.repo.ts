import { WorkspacesEntityIds } from "@beep/shared-domain";
import { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { Entities } from "@beep/workspaces-domain";
import { Comment } from "@beep/workspaces-domain/entities";
import { WorkspacesDb } from "@beep/workspaces-server/db";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const serviceEffect = Effect.gen(function* () {
  const { makeQuery } = yield* WorkspacesDb.Db;

  const baseRepo = yield* DbRepo.make(WorkspacesEntityIds.CommentId, Entities.Comment.Model);

  const findByIdOrFail = (
    id: WorkspacesEntityIds.CommentId.Type
  ): Effect.Effect<
    typeof Entities.Comment.Model.Type,
    Comment.CommentErrors.CommentNotFoundError | DbClient.DatabaseError
  > =>
    baseRepo.findById({ id }).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => new Comment.CommentErrors.CommentNotFoundError({ id }),
          onSome: ({ data }) => Effect.succeed(data),
        })
      ),
      Effect.withSpan("CommentRepo.findByIdOrFail", { attributes: { id } })
    );

  const listByDiscussion = makeQuery(
    (
      execute,
      params: {
        readonly discussionId: WorkspacesEntityIds.DiscussionId.Type;
      }
    ) =>
      execute((client) =>
        client.query.comment.findMany({
          where: (table, { eq, isNull, and }) =>
            and(eq(table.discussionId, params.discussionId), isNull(table.deletedAt)),
          orderBy: (table, { asc }) => [asc(table.createdAt)],
        })
      ).pipe(
        Effect.flatMap(S.decode(S.Array(Entities.Comment.Model))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("CommentRepo.listByDiscussion", { attributes: { discussionId: params.discussionId } })
      )
  );

  const create = flow(baseRepo.insert, Effect.withSpan("CommentRepo.create"));

  const updateContent = flow(
    (input: typeof Entities.Comment.Model.update.Type) => baseRepo.update({ ...input, isEdited: true }),
    Effect.withSpan("CommentRepo.updateContent")
  );

  const hardDelete = (id: WorkspacesEntityIds.CommentId.Type) =>
    baseRepo.delete({ id }).pipe(Effect.withSpan("CommentRepo.hardDelete", { attributes: { id } }));

  return {
    ...baseRepo,
    findByIdOrFail,
    listByDiscussion,
    create,
    updateContent,
    hardDelete,
  } as unknown as Entities.Comment.RepoShape;
});

export const RepoLive: Layer.Layer<Entities.Comment.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.Comment.Repo,
  serviceEffect
).pipe(Layer.provide(WorkspacesDb.layer));
