import { Entities } from "@beep/documents-domain";
import { Document } from "@beep/documents-domain/entities";
import { DocumentsDb } from "@beep/documents-server/db";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DbClient, DbRepo } from "@beep/shared-server";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const SearchResultSchema = S.Struct({
  id: DocumentsEntityIds.DocumentId,
  _rowId: DocumentsEntityIds.DocumentId.privateSchema,
  title: S.NullOr(S.String),
  content: S.NullOr(S.String),
  rank: S.Number,
});

const SearchRequest = S.Struct({
  query: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  userId: S.optional(SharedEntityIds.UserId),
  includeArchived: S.optional(S.Boolean),
  limit: S.optional(S.Int.pipe(S.positive())),
  offset: S.optional(S.Int.pipe(S.nonNegative())),
});

export class DocumentRepo extends Effect.Service<DocumentRepo>()("@beep/documents-server/adapters/repos/DocumentRepo", {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const { makeQuery } = yield* DocumentsDb.Db;

    const baseRepo = yield* DbRepo.make(DocumentsEntityIds.DocumentId, Document.Model, Effect.succeed({}));

    /**
     * Find document by ID with proper error handling
     */
    const findByIdOrFail = (
      id: DocumentsEntityIds.DocumentId.Type
    ): Effect.Effect<
      typeof Entities.Document.Model.Type,
      Document.DocumentErrors.DocumentNotFoundError | DbClient.DatabaseError
    > =>
      baseRepo.findById(id).pipe(
        Effect.flatMap(
          O.match({
            onNone: () => Effect.fail(new Document.DocumentErrors.DocumentNotFoundError({ id })),
            onSome: Effect.succeed,
          })
        ),
        Effect.withSpan("DocumentRepo.findByIdOrFail", { attributes: { id } })
      );

    /**
     * Full-text search across document title and content using PostgreSQL's
     * built-in full-text search with weighted ranking.
     *
     * Title matches are weighted higher (A) than content matches (B).
     * Uses websearch_to_tsquery for flexible search syntax support.
     */
    const searchSchema = SqlSchema.findAll({
      Request: SearchRequest,
      Result: SearchResultSchema,
      execute: (request) => sql`
          SELECT
            id,
            _row_id,
            title,
            content,
            ts_rank(
              setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
              setweight(to_tsvector('english', coalesce(content, '')), 'B'),
              websearch_to_tsquery('english', ${request.query})
            ) AS rank
          FROM document
          WHERE
            organization_id = ${request.organizationId}
            AND deleted_at IS NULL
            ${request.includeArchived ? sql`` : sql`AND is_archived = false`}
            ${request.userId ? sql`AND user_id = ${request.userId}` : sql``}
            AND (
              to_tsvector('english', coalesce(title, '')) ||
              to_tsvector('english', coalesce(content, ''))
            ) @@ websearch_to_tsquery('english', ${request.query})
          ORDER BY rank DESC
          LIMIT ${request.limit ?? 20}
          OFFSET ${request.offset ?? 0}
        `,
    });

    const search = (params: typeof SearchRequest.Type) =>
      searchSchema(params).pipe(
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DocumentRepo.search", { attributes: { query: params.query } })
      );

    /**
     * List documents by user with pagination support
     */
    const listByUser = makeQuery(
      (
        execute,
        params: {
          readonly userId: SharedEntityIds.UserId.Type;
          readonly organizationId: SharedEntityIds.OrganizationId.Type;
          readonly cursor?: DocumentsEntityIds.DocumentId.Type;
          readonly limit?: number;
        }
      ) =>
        execute((client) =>
          client.query.document.findMany({
            where: (table, { eq, and, isNull, lt }) =>
              and(
                eq(table.userId, params.userId),
                eq(table.organizationId, params.organizationId),
                isNull(table.deletedAt),
                eq(table.isArchived, false),
                params.cursor ? lt(table.id, params.cursor) : undefined
              ),
            orderBy: (table, { desc }) => [desc(table.updatedAt)],
            limit: params.limit ?? 50,
          })
        ).pipe(
          Effect.flatMap(S.decode(S.Array(Entities.Document.Model))),
          Effect.mapError(DbClient.DatabaseError.$match),
          Effect.withSpan("DocumentRepo.listByUser", { attributes: { userId: params.userId } })
        )
    );

    /**
     * List documents with pagination and optional parent filter
     */
    const list = makeQuery(
      (
        execute,
        params: {
          readonly organizationId: SharedEntityIds.OrganizationId.Type;
          readonly parentDocumentId?: DocumentsEntityIds.DocumentId.Type | null;
          readonly search?: string;
          readonly cursor?: DocumentsEntityIds.DocumentId.Type;
          readonly limit?: number;
        }
      ) =>
        execute((client) =>
          client.query.document.findMany({
            where: (table, { eq, and, isNull, lt, like }) =>
              and(
                eq(table.organizationId, params.organizationId),
                isNull(table.deletedAt),
                eq(table.isArchived, false),
                params.parentDocumentId !== undefined
                  ? params.parentDocumentId === null
                    ? isNull(table.parentDocumentId)
                    : eq(table.parentDocumentId, params.parentDocumentId)
                  : undefined,
                params.search ? like(table.title, `%${params.search}%`) : undefined,
                params.cursor ? lt(table.id, params.cursor) : undefined
              ),
            orderBy: (table, { desc }) => [desc(table.updatedAt)],
            limit: params.limit ?? 50,
          })
        ).pipe(
          Effect.flatMap(S.decode(S.Array(Entities.Document.Model))),
          Effect.mapError(DbClient.DatabaseError.$match),
          Effect.withSpan("DocumentRepo.list", { attributes: { organizationId: params.organizationId } })
        )
    );

    /**
     * List archived (trashed) documents
     */
    const listArchived = makeQuery(
      (
        execute,
        params: {
          readonly organizationId: SharedEntityIds.OrganizationId.Type;
          readonly userId: SharedEntityIds.UserId.Type;
          readonly search?: string;
        }
      ) =>
        execute((client) =>
          client.query.document.findMany({
            where: (table, { eq, and, isNull, like }) =>
              and(
                eq(table.organizationId, params.organizationId),
                eq(table.userId, params.userId),
                isNull(table.deletedAt),
                eq(table.isArchived, true),
                params.search ? like(table.title, `%${params.search}%`) : undefined
              ),
            orderBy: (table, { desc }) => [desc(table.updatedAt)],
          })
        ).pipe(
          Effect.flatMap(S.decode(S.Array(Entities.Document.Model))),
          Effect.mapError(DbClient.DatabaseError.$match),
          Effect.withSpan("DocumentRepo.listArchived", { attributes: { organizationId: params.organizationId } })
        )
    );

    /**
     * List child documents (documents with a specific parent)
     */
    const listChildren = makeQuery(
      (
        execute,
        params: {
          readonly parentDocumentId: DocumentsEntityIds.DocumentId.Type;
        }
      ) =>
        execute((client) =>
          client.query.document.findMany({
            where: (table, { eq, isNull, and }) =>
              and(
                eq(table.parentDocumentId, params.parentDocumentId),
                isNull(table.deletedAt),
                eq(table.isArchived, false)
              ),
            orderBy: (table, { desc }) => [desc(table.updatedAt)],
          })
        ).pipe(
          Effect.flatMap(S.decode(S.Array(Entities.Document.Model))),
          Effect.mapError(DbClient.DatabaseError.$match),
          Effect.withSpan("DocumentRepo.listChildren", { attributes: { parentDocumentId: params.parentDocumentId } })
        )
    );

    /**
     * Archive a document (soft delete to trash)
     */
    const archive = (id: DocumentsEntityIds.DocumentId.Type) =>
      Effect.gen(function* () {
        const doc = yield* findByIdOrFail(id);
        return yield* baseRepo.update({ ...doc, isArchived: true });
      }).pipe(Effect.withSpan("DocumentRepo.archive", { attributes: { id } }));

    /**
     * Restore a document from trash
     */
    const restore = (id: DocumentsEntityIds.DocumentId.Type) =>
      Effect.gen(function* () {
        const doc = yield* findByIdOrFail(id);
        return yield* baseRepo.update({ ...doc, isArchived: false });
      }).pipe(Effect.withSpan("DocumentRepo.restore", { attributes: { id } }));

    /**
     * Publish a document (make publicly accessible)
     */
    const publish = (id: DocumentsEntityIds.DocumentId.Type) =>
      Effect.gen(function* () {
        const doc = yield* findByIdOrFail(id);
        return yield* baseRepo.update({ ...doc, isPublished: true });
      }).pipe(Effect.withSpan("DocumentRepo.publish", { attributes: { id } }));

    /**
     * Unpublish a document
     */
    const unpublish = (id: DocumentsEntityIds.DocumentId.Type) =>
      Effect.gen(function* () {
        const doc = yield* findByIdOrFail(id);
        return yield* baseRepo.update({ ...doc, isPublished: false });
      }).pipe(Effect.withSpan("DocumentRepo.unpublish", { attributes: { id } }));

    /**
     * Lock a document (prevent editing)
     */
    const lock = (id: DocumentsEntityIds.DocumentId.Type) =>
      Effect.gen(function* () {
        const doc = yield* findByIdOrFail(id);
        return yield* baseRepo.update({ ...doc, lockPage: true });
      }).pipe(Effect.withSpan("DocumentRepo.lock", { attributes: { id } }));

    /**
     * Unlock a document
     */
    const unlock = (id: DocumentsEntityIds.DocumentId.Type) =>
      Effect.gen(function* () {
        const doc = yield* findByIdOrFail(id);
        return yield* baseRepo.update({ ...doc, lockPage: false });
      }).pipe(Effect.withSpan("DocumentRepo.unlock", { attributes: { id } }));

    /**
     * Hard delete a document permanently
     */
    const hardDelete = (id: DocumentsEntityIds.DocumentId.Type) =>
      baseRepo.delete(id).pipe(Effect.withSpan("DocumentRepo.hardDelete", { attributes: { id } }));

    return {
      ...baseRepo,
      findByIdOrFail,
      search,
      listByUser,
      list,
      listArchived,
      listChildren,
      archive,
      restore,
      publish,
      unpublish,
      lock,
      unlock,
      hardDelete,
    } as const;
  }),
}) {}
