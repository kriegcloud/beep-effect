import { Entities } from "@beep/workspaces-domain";
import { Page } from "@beep/workspaces-domain/entities";
import { WorkspacesDb } from "@beep/workspaces-server/db";
import { SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const SearchResultSchema = S.Struct({
  id: WorkspacesEntityIds.DocumentId,
  _rowId: WorkspacesEntityIds.DocumentId.privateSchema,
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

const serviceEffect = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const { makeQuery } = yield* WorkspacesDb.Db;

  const baseRepo = yield* DbRepo.make(WorkspacesEntityIds.DocumentId, Page.Model);

  const findByIdOrFail = (
    id: WorkspacesEntityIds.DocumentId.Type
  ): Effect.Effect<
    typeof Entities.Page.Model.Type,
    Page.PageErrors.DocumentNotFoundError | DbClient.DatabaseError
  > =>
    baseRepo.findById({ id }).pipe(
      Effect.flatMap(
        O.match({
          onNone: () => Effect.fail(new Page.PageErrors.DocumentNotFoundError({ id })),
          onSome: ({ data }) => Effect.succeed(data),
        })
      ),
      Effect.withSpan("DocumentRepo.findByIdOrFail", { attributes: { id } })
    );

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

  const listByUser = makeQuery(
    (
      execute,
      params: {
        readonly userId: SharedEntityIds.UserId.Type;
        readonly organizationId: SharedEntityIds.OrganizationId.Type;
        readonly cursor?: WorkspacesEntityIds.DocumentId.Type;
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
        Effect.flatMap(S.decode(S.Array(Entities.Page.Model))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DocumentRepo.listByUser", { attributes: { userId: params.userId } })
      )
  );

  const list = makeQuery(
    (
      execute,
      params: {
        readonly organizationId: SharedEntityIds.OrganizationId.Type;
        readonly parentDocumentId?: WorkspacesEntityIds.DocumentId.Type | null;
        readonly search?: string;
        readonly cursor?: WorkspacesEntityIds.DocumentId.Type;
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
        Effect.flatMap(S.decode(S.Array(Entities.Page.Model))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DocumentRepo.list", { attributes: { organizationId: params.organizationId } })
      )
  );

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
        Effect.flatMap(S.decode(S.Array(Entities.Page.Model))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DocumentRepo.listArchived", { attributes: { organizationId: params.organizationId } })
      )
  );

  const listChildren = makeQuery(
    (
      execute,
      params: {
        readonly parentDocumentId: WorkspacesEntityIds.DocumentId.Type;
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
        Effect.flatMap(S.decode(S.Array(Entities.Page.Model))),
        Effect.mapError(DbClient.DatabaseError.$match),
        Effect.withSpan("DocumentRepo.listChildren", { attributes: { parentDocumentId: params.parentDocumentId } })
      )
  );

  const archive = (id: WorkspacesEntityIds.DocumentId.Type) =>
    Effect.gen(function* () {
      const doc = yield* findByIdOrFail(id);
      const { data } = yield* baseRepo.update({ ...doc, isArchived: true });
      return data;
    }).pipe(Effect.withSpan("DocumentRepo.archive", { attributes: { id } }));

  const restore = (id: WorkspacesEntityIds.DocumentId.Type) =>
    Effect.gen(function* () {
      const doc = yield* findByIdOrFail(id);
      const { data } = yield* baseRepo.update({ ...doc, isArchived: false });
      return data;
    }).pipe(Effect.withSpan("DocumentRepo.restore", { attributes: { id } }));

  const publish = (id: WorkspacesEntityIds.DocumentId.Type) =>
    Effect.gen(function* () {
      const doc = yield* findByIdOrFail(id);
      const { data } = yield* baseRepo.update({ ...doc, isPublished: true });
      return data;
    }).pipe(Effect.withSpan("DocumentRepo.publish", { attributes: { id } }));

  const unpublish = (id: WorkspacesEntityIds.DocumentId.Type) =>
    Effect.gen(function* () {
      const doc = yield* findByIdOrFail(id);
      const { data } = yield* baseRepo.update({ ...doc, isPublished: false });
      return data;
    }).pipe(Effect.withSpan("DocumentRepo.unpublish", { attributes: { id } }));

  const lock = (id: WorkspacesEntityIds.DocumentId.Type) =>
    Effect.gen(function* () {
      const doc = yield* findByIdOrFail(id);
      const { data } = yield* baseRepo.update({ ...doc, lockPage: true });
      return data;
    }).pipe(Effect.withSpan("DocumentRepo.lock", { attributes: { id } }));

  const unlock = (id: WorkspacesEntityIds.DocumentId.Type) =>
    Effect.gen(function* () {
      const doc = yield* findByIdOrFail(id);
      const { data } = yield* baseRepo.update({ ...doc, lockPage: false });
      return data;
    }).pipe(Effect.withSpan("DocumentRepo.unlock", { attributes: { id } }));

  const hardDelete = (id: WorkspacesEntityIds.DocumentId.Type) =>
    baseRepo.delete({ id }).pipe(Effect.withSpan("DocumentRepo.hardDelete", { attributes: { id } }));

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
  } as unknown as Entities.Page.RepoShape;
});

export const RepoLive: Layer.Layer<Entities.Page.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.Page.Repo,
  serviceEffect
).pipe(Layer.provide(WorkspacesDb.layer));
