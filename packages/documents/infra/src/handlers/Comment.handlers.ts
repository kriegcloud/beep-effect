import { Comment } from "@beep/documents-domain/entities";
import { CommentRepo } from "@beep/documents-infra/adapters/repos/Comment.repo";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";

/**
 * RPC handlers for Comment entity operations.
 * Each handler implements the corresponding RPC defined in Comment.rpc.ts
 *
 * Error handling strategy:
 * - Expected errors (e.g., CommentNotFoundError) pass through to the RPC layer
 * - Unexpected errors (e.g., DbError) are converted to defects via Effect.orDie
 */
export const CommentHandlersLive = Comment.CommentRpcs.Rpcs.toLayer(
  Effect.gen(function* () {
    const repo = yield* CommentRepo;

    // Decode function that applies defaults from the insert schema
    const decodeCommentInsert = S.decode(Comment.Model.insert);

    return {
      get: (payload) =>
        repo
          .findByIdOrFail(payload.id)
          .pipe(
            Effect.catchTag("DbError", Effect.die),
            Effect.withSpan("CommentHandlers.get", { attributes: { id: payload.id } })
          ),

      listByDiscussion: (payload) =>
        repo
          .listByDiscussion({
            discussionId: payload.discussionId,
          })
          .pipe(
            Effect.map(Stream.fromIterable),
            Effect.catchTag("DbError", Effect.die),
            Stream.unwrap,
            Stream.withSpan("CommentHandlers.listByDiscussion")
          ),

      create: (payload) =>
        Effect.gen(function* () {
          const authContext = yield* AuthContext;
          // Decode to apply defaults from the insert schema
          const insertData = yield* decodeCommentInsert({
            organizationId: payload.organizationId,
            discussionId: payload.discussionId,
            userId: authContext.user.id,
            content: payload.content,
            contentRich: payload.contentRich,
          });
          return yield* repo.create(insertData);
        }).pipe(
          Effect.catchTag("DbError", Effect.die),
          Effect.catchTag("ParseError", Effect.die),
          Effect.withSpan("CommentHandlers.create")
        ),

      update: (payload) =>
        Effect.gen(function* () {
          const comment = yield* repo.findByIdOrFail(payload.id);
          return yield* repo.updateContent({
            ...comment,
            ...(payload.content !== undefined && { content: payload.content }),
            ...(payload.contentRich !== undefined && { contentRich: O.some(payload.contentRich) }),
          });
        }).pipe(
          Effect.catchTag("DbError", Effect.die),
          Effect.withSpan("CommentHandlers.update", { attributes: { id: payload.id } })
        ),

      delete: (payload) =>
        repo.findByIdOrFail(payload.id).pipe(
          Effect.flatMap(() => repo.hardDelete(payload.id)),
          Effect.catchTag("DbError", Effect.die),
          Effect.withSpan("CommentHandlers.delete", { attributes: { id: payload.id } })
        ),
    };
  })
);
