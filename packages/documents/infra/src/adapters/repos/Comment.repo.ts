import { Entities } from "@beep/documents-domain";
import { CommentNotFoundError } from "@beep/documents-domain/entities/Comment/Comment.errors";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { Db } from "@beep/shared-infra/Db";
import { Repo } from "@beep/shared-infra/Repo";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
export class CommentRepo extends Effect.Service<CommentRepo>()("@beep/documents-infra/adapters/repos/CommentRepo", {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { makeQuery } = yield* DocumentsDb.DocumentsDb;

    const baseRepo = yield* Repo.make(DocumentsEntityIds.CommentId, Entities.Comment.Model);

    /**
     * Find comment by ID with proper error handling
     */
    const findByIdOrFail = (
      id: DocumentsEntityIds.CommentId.Type
    ): Effect.Effect<typeof Entities.Comment.Model.Type, CommentNotFoundError | Db.DatabaseError> =>
      baseRepo.findById(id).pipe(
        Effect.flatMap(
          O.match({
            onNone: () => Effect.fail(new CommentNotFoundError({ id })),
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
          Effect.mapError(Db.DatabaseError.$match),
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
