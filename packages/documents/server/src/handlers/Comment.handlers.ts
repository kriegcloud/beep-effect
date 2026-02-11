import { Comment } from "@beep/documents-domain/entities";
import { CommentRepo } from "@beep/documents-server/db";
import { Policy } from "@beep/shared-domain";
import { OperationFailedError } from "@beep/shared-domain/errors";
import { AuthContext } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

/**
 * RPC handlers for Comment entity operations.
 * Each handler implements the corresponding RPC defined in Comment.rpc.ts
 *
 * Error handling strategy:
 * - Expected errors (e.g., CommentNotFoundError) pass through to the RPC layer
 * - Database/parsing failures are translated into typed, deterministic failures (no defects)
 */
const CommentRpcsWithMiddleware = Comment.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

export const CommentHandlersLive = CommentRpcsWithMiddleware.toLayer(
  Effect.gen(function* () {
    const repo = yield* CommentRepo;

    // Decode function that applies defaults from the insert schema
    const decodeCommentInsert = S.decode(Comment.Model.insert);

    return {
      Get: (payload) =>
        repo.findByIdOrFail(payload.id).pipe(
          // Treat DB failures as "not found" to avoid leaking details and to keep caller behavior deterministic.
          Effect.catchTag("DatabaseError", () =>
            Effect.fail(new Comment.CommentErrors.CommentNotFoundError({ id: payload.id }))
          ),
          Effect.withSpan("CommentHandlers.get", { attributes: { id: payload.id } })
        ),

      ListByDiscussion: (payload) =>
        repo
          .listByDiscussion({
            discussionId: payload.discussionId,
          })
          .pipe(
            Effect.catchTag("DatabaseError", () => Effect.succeed([])),
            Effect.withSpan("CommentHandlers.ListByDiscussion", { attributes: { discussionId: payload.discussionId } })
          ),

      Create: Effect.fn("CommentHandlers.Create")(
        function* (payload) {
          const authContext = yield* AuthContext;
          // Decode to apply defaults from the insert schema
          const insertData = yield* decodeCommentInsert({
            organizationId: payload.organizationId,
            discussionId: payload.discussionId,
            userId: authContext.user.id,
            content: payload.content,
            contentRich: payload.contentRich,
          });
          const { data } = yield* repo.create(insertData);
          return data;
        },
        Effect.catchTag("DatabaseError", () =>
          Effect.fail(new OperationFailedError({ operation: "Comment.Create", reason: "database_error" }))
        ),
        Effect.catchTag("ParseError", () =>
          Effect.fail(new OperationFailedError({ operation: "Comment.Create", reason: "parse_error" }))
        )
      ),

      Update: (payload) =>
        Effect.gen(function* () {
          const comment = yield* repo.findByIdOrFail(payload.id);
          const { data } = yield* repo.updateContent({
            ...comment,
            ...(payload.content !== undefined && { content: payload.content }),
            ...(payload.contentRich !== undefined && { contentRich: O.some(payload.contentRich) }),
          });
          return data;
        }).pipe(
          Effect.catchTag("DatabaseError", () =>
            Effect.fail(new Comment.CommentErrors.CommentNotFoundError({ id: payload.id }))
          ),
          Effect.withSpan("CommentHandlers.update", { attributes: { id: payload.id } })
        ),

      Delete: (payload) =>
        repo.findByIdOrFail(payload.id).pipe(
          Effect.flatMap(() => repo.hardDelete(payload.id)),
          Effect.catchTag("DatabaseError", () =>
            Effect.fail(new Comment.CommentErrors.CommentNotFoundError({ id: payload.id }))
          ),
          Effect.withSpan("CommentHandlers.delete", { attributes: { id: payload.id } })
        ),
    };
  })
);
