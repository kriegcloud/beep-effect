import { Comment, Discussion } from "@beep/documents-domain/entities";
import { CommentRepo, DiscussionRepo } from "@beep/documents-server/db";
import { Policy } from "@beep/shared-domain";
import { OperationFailedError } from "@beep/shared-domain/errors";
import { AuthContext } from "@beep/shared-domain/Policy";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";

/**
 * Transform author field to user field to match RPC schema
 */
const transformToUser = <T extends { author: unknown }>(item: T): Omit<T, "author"> & { user: T["author"] } => {
  const { author, ...rest } = item;
  return { ...rest, user: author };
};

/**
 * RPC handlers for Discussion entity operations.
 * Each handler implements the corresponding RPC defined in Discussion.rpc.ts
 *
 * Error handling strategy:
 * - Expected errors (e.g., DiscussionNotFoundError) pass through to the RPC layer
 * - Database/parsing failures are translated into typed, deterministic failures (no defects)
 */
const DiscussionRpcsWithMiddleware = Discussion.DiscussionRpcs.Rpcs.middleware(Policy.AuthContextRpcMiddleware);

export const DiscussionHandlersLive = DiscussionRpcsWithMiddleware.toLayer(
  Effect.gen(function* () {
    const discussionRepo = yield* DiscussionRepo;
    const commentRepo = yield* CommentRepo;

    // Decode functions that apply defaults from the insert schema
    const decodeDiscussionInsert = S.decode(Discussion.Model.insert);
    const decodeCommentInsert = S.decode(Comment.Model.insert);

    return {
      get: (payload) =>
        discussionRepo.getWithComments({ id: payload.id }).pipe(
          Effect.map((discussion) => ({
            ...transformToUser(discussion),
            comments: pipe(discussion.comments, A.map(transformToUser)),
          })),
          // Treat DB failures as "not found" to avoid leaking details and to keep caller behavior deterministic.
          Effect.catchTag("DatabaseError", () =>
            Effect.fail(new Discussion.DiscussionErrors.DiscussionNotFoundError({ id: payload.id }))
          ),
          Effect.withSpan("DiscussionHandlers.get", { attributes: { id: payload.id } })
        ),

      listByDocument: (payload) =>
        discussionRepo
          .listByDocument({
            documentId: payload.documentId,
          })
          .pipe(
            Effect.map((discussions) =>
              Stream.fromIterable(
                F.pipe(
                  discussions,
                  A.map((discussion) => ({
                    ...transformToUser(discussion),
                    comments: F.pipe(discussion.comments, A.map(transformToUser)),
                  }))
                )
              )
            ),
            Effect.catchTag("DatabaseError", () => Effect.succeed(Stream.empty)),
            Stream.unwrap,
            Stream.withSpan("DiscussionHandlers.listByDocument")
          ),

      create: Effect.fn("DiscussionHandlers.create")(
        function* (payload) {
          const authContext = yield* AuthContext;
          // Decode to apply defaults from the insert schema
          const insertData = yield* decodeDiscussionInsert({
            organizationId: payload.organizationId,
            documentId: payload.documentId,
            userId: authContext.user.id,
            documentContent: payload.documentContent,
          });
          const { data: result } = yield* discussionRepo.create(insertData);
          return { id: result.id };
        },
        Effect.catchTag("DatabaseError", () =>
          Effect.fail(new OperationFailedError({ operation: "Discussion.Create", reason: "database_error" }))
        ),
        Effect.catchTag("ParseError", () =>
          Effect.fail(new OperationFailedError({ operation: "Discussion.Create", reason: "parse_error" }))
        )
      ),

      createWithComment: Effect.fn("DiscussionHandlers.createWithComment")(
        function* (payload) {
          const authContext = yield* AuthContext;

          // Create discussion - decode to apply defaults
          const discussionInsertData = yield* decodeDiscussionInsert({
            organizationId: payload.organizationId,
            documentId: payload.documentId,
            userId: authContext.user.id,
            documentContent: payload.documentContent,
          });
          const { data: discussion } = yield* discussionRepo.create(discussionInsertData);

          // Create initial comment if contentRich provided
          if (payload.contentRich) {
            const commentInsertData = yield* decodeCommentInsert({
              organizationId: payload.organizationId,
              discussionId: discussion.id,
              userId: authContext.user.id,
              content: "",
              contentRich: payload.contentRich,
            });
            yield* commentRepo.create(commentInsertData);
          }

          return { id: discussion.id };
        },
        Effect.catchTag("DatabaseError", () =>
          Effect.fail(new OperationFailedError({ operation: "Discussion.CreateWithComment", reason: "database_error" }))
        ),
        Effect.catchTag("ParseError", () =>
          Effect.fail(new OperationFailedError({ operation: "Discussion.CreateWithComment", reason: "parse_error" }))
        )
      ),

      resolve: (payload) =>
        discussionRepo.resolve(payload.id).pipe(
          Effect.catchTag("DatabaseError", () =>
            Effect.fail(new Discussion.DiscussionErrors.DiscussionNotFoundError({ id: payload.id }))
          ),
          Effect.withSpan("DiscussionHandlers.resolve", { attributes: { id: payload.id } })
        ),

      delete: (payload) =>
        discussionRepo.findByIdOrFail(payload.id).pipe(
          Effect.flatMap(() => discussionRepo.hardDelete(payload.id)),
          Effect.catchTag("DatabaseError", () =>
            Effect.fail(new Discussion.DiscussionErrors.DiscussionNotFoundError({ id: payload.id }))
          ),
          Effect.withSpan("DiscussionHandlers.delete", { attributes: { id: payload.id } })
        ),
    };
  })
);
