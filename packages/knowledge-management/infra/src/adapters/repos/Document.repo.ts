import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/knowledge-management-domain";
import { dependencies } from "@beep/knowledge-management-infra/adapters/repos/_common";
import { KnowledgeManagementDb } from "@beep/knowledge-management-infra/db";
import { KnowledgeManagementEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const SearchResultSchema = S.Struct({
  id: KnowledgeManagementEntityIds.DocumentId,
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

export class DocumentRepo extends Effect.Service<DocumentRepo>()(
  "@beep/knowledge-management-infra/adapters/repos/DocumentRepo",
  {
    dependencies,
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const { makeQuery } = yield* KnowledgeManagementDb.KnowledgeManagementDb;

      const baseRepo = yield* Repo.make(KnowledgeManagementEntityIds.DocumentId, Entities.Document.Model);

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

      const search = (params: typeof SearchRequest.Type) => searchSchema(params);

      /**
       * List documents by user
       */
      const listByUser = makeQuery(
        (
          execute,
          params: {
            readonly userId: SharedEntityIds.UserId.Type;
            readonly organizationId: SharedEntityIds.OrganizationId.Type;
          }
        ) =>
          execute((client) =>
            client.query.document.findMany({
              where: (table, { eq, and, isNull }) =>
                and(
                  eq(table.userId, params.userId),
                  eq(table.organizationId, params.organizationId),
                  isNull(table.deletedAt)
                ),
            })
          ).pipe(Effect.flatMap(S.decodeUnknown(S.Array(Entities.Document.Model))))
      );

      /**
       * List child documents (documents with a specific parent)
       */
      const listChildren = makeQuery(
        (
          execute,
          params: {
            readonly parentDocumentId: KnowledgeManagementEntityIds.DocumentId.Type;
          }
        ) =>
          execute((client) =>
            client.query.document.findMany({
              where: (table, { eq, isNull, and }) =>
                and(eq(table.parentDocumentId, params.parentDocumentId), isNull(table.deletedAt)),
            })
          ).pipe(Effect.flatMap(S.decodeUnknown(S.Array(Entities.Document.Model))))
      );

      return {
        ...baseRepo,
        search,
        listByUser,
        listChildren,
      } as const;
    }),
  }
) {}
