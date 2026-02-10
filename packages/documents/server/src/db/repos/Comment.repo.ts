import { Entities } from "@beep/documents-domain";
import { Comment } from "@beep/documents-domain/entities";
import { DocumentsDb } from "@beep/documents-server/db";
import { $DocumentsServerId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $DocumentsServerId.create("db/repos/CommentRepo");



export class CommentRepo extends Effect.Service<CommentRepo>()($I`CommentRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { makeQuery } = yield* DocumentsDb.Db;

    const baseRepo = yield* DbRepo.make(DocumentsEntityIds.CommentId, Entities.Comment.Model, Effect.succeed({}));

    /**
     * Find comment by ID with proper error handling
     */
    const findByIdOrFail = (
      id: DocumentsEntityIds.CommentId.Type
    ): Effect.Effect<
      typeof Entities.Comment.Model.Type,
      Comment.CommentNotFoundError | DbClient.DatabaseError
    > =>
      baseRepo.findById(id).pipe(
        Effect.flatMap(
          O.match({
            onNone: () => Effect.fail(new Comment.CommentNotFoundError({ id })),
            onSome: Effect.succeed,
          })
        ),
        Effect.withSpan("CommentRepo.findByIdOrFail", { attributes: { id } })
      );

    /**
     * List all comments for a discussion
     */
    const listByDiscussion = makeQuery(
      (
        execute,
        params: {
          readonly discussionId: DocumentsEntityIds.DiscussionId.Type;
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

    /**
     * Create a new comment.
     * Accepts the insert.Type (decoded) and uses baseRepo.insert which handles encoding.
     */
    const create = flow(baseRepo.insert, Effect.withSpan("CommentRepo.create"));

    /**
     * Update a comment (marks as edited)
     */
    const updateContent = flow(
      (input: typeof Entities.Comment.Model.update.Type) => baseRepo.update({ ...input, isEdited: true }),
      Effect.withSpan("CommentRepo.updateContent")
    );

    /**
     * Hard delete a comment
     */
    const hardDelete = (id: DocumentsEntityIds.CommentId.Type) =>
      baseRepo.delete(id).pipe(Effect.withSpan("CommentRepo.hardDelete", { attributes: { id } }));

    return {
      ...baseRepo,
      findByIdOrFail,
      listByDiscussion,
      create,
      updateContent,
      hardDelete,
    } as const;
  }),
}) {}
