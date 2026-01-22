import { Entities } from "@beep/documents-domain";
import { DiscussionNotFoundError } from "@beep/documents-domain/entities/discussion/discussion.errors";
import { DocumentsDb } from "@beep/documents-server/db";
import { $DocumentsServerId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import { DbRepo } from "@beep/shared-domain/factories";
import { DbClient } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $DocumentsServerId.create("db/repos/DiscussionRepo");
/**
 * Schema for discussion with nested comments and user info
 * Matches the DiscussionWithComments schema in the RPC definitions
 */
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
}).annotations(
  $I.annotations("DiscussionWithCommentsSchema", {
    description: "Discussion with nested comments and author information for repository queries",
  })
);

export type DiscussionWithComments = typeof DiscussionWithCommentsSchema.Type;

export class DiscussionRepo extends Effect.Service<DiscussionRepo>()($I`DiscussionRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { makeQuery } = yield* DocumentsDb.Db;

    const baseRepo = yield* DbRepo.make(DocumentsEntityIds.DiscussionId, Entities.Discussion.Model, Effect.succeed({}));

    /**
     * Find discussion by ID with proper error handling
     */
    const findByIdOrFail = (
      id: DocumentsEntityIds.DiscussionId.Type
    ): Effect.Effect<typeof Entities.Discussion.Model.Type, DiscussionNotFoundError | DbClient.DatabaseError> =>
      baseRepo.findById(id).pipe(
        Effect.flatMap(
          O.match({
            onNone: () => Effect.fail(new DiscussionNotFoundError({ id })),
            onSome: Effect.succeed,
          })
        ),
        Effect.withSpan("DiscussionRepo.findByIdOrFail", { attributes: { id } })
      );

    /**
     * Get discussion with all comments and user information
     */
    const getWithComments = makeQuery(
      (
        execute,
        params: {
          readonly id: DocumentsEntityIds.DiscussionId.Type;
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

    /**
     * List all discussions for a document with comments
     */
    const listByDocument = makeQuery(
      (
        execute,
        params: {
          readonly documentId: DocumentsEntityIds.DocumentId.Type;
        }
      ) =>
        execute((client) =>
          client.query.discussion.findMany({
            where: (table, { eq, isNull, and }) =>
              and(eq(table.documentId, params.documentId), isNull(table.deletedAt)),
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

    /**
     * Create a new discussion.
     * Accepts the insert.Type (decoded) and uses baseRepo.insert which handles encoding.
     */
    const create = flow(
      (input: typeof Entities.Discussion.Model.insert.Type) => baseRepo.insert(input),
      Effect.withSpan("DiscussionRepo.create")
    );

    /**
     * Resolve a discussion
     */
    const resolve = (id: DocumentsEntityIds.DiscussionId.Type) =>
      Effect.gen(function* () {
        const discussion = yield* findByIdOrFail(id);
        return yield* baseRepo.update({ ...discussion, isResolved: true });
      }).pipe(Effect.withSpan("DiscussionRepo.resolve", { attributes: { id } }));

    /**
     * Unresolve a discussion
     */
    const unresolve = (id: DocumentsEntityIds.DiscussionId.Type) =>
      Effect.gen(function* () {
        const discussion = yield* findByIdOrFail(id);
        return yield* baseRepo.update({ ...discussion, isResolved: false });
      }).pipe(Effect.withSpan("DiscussionRepo.unresolve", { attributes: { id } }));

    /**
     * Hard delete a discussion (cascade deletes comments via FK)
     */
    const hardDelete = (id: DocumentsEntityIds.DiscussionId.Type) =>
      baseRepo.delete(id).pipe(Effect.withSpan("DiscussionRepo.hardDelete", { attributes: { id } }));

    return {
      ...baseRepo,
      findByIdOrFail,
      getWithComments,
      listByDocument,
      create,
      resolve,
      unresolve,
      hardDelete,
    } as const;
  }),
}) {}
