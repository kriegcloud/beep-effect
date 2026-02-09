import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/MentionRepo");

const tableName = KnowledgeEntityIds.MentionId.tableName;

class FindByEntityIdRequest extends S.Class<FindByEntityIdRequest>($I`FindByEntityIdRequest`)(
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindByEntityIdRequest", {
    description: "SQL request schema: fetch mentions for an entity (scoped to organization).",
  })
) {}

class FindByIdsRequest extends S.Class<FindByIdsRequest>($I`FindByIdsRequest`)(
  {
    ids: S.Array(KnowledgeEntityIds.MentionId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByIdsRequest", {
    description: "SQL request schema: fetch mentions by ids (scoped to organization).",
  })
) {}

class FindByDocumentIdRequest extends S.Class<FindByDocumentIdRequest>($I`FindByDocumentIdRequest`)(
  {
    documentId: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindByDocumentIdRequest", {
    description: "SQL request schema: fetch mentions by document id (scoped to organization).",
  })
) {}

const makeMentionExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findByEntityIdSchema = SqlSchema.findAll({
    Request: FindByEntityIdRequest,
    Result: Entities.Mention.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND entity_id = ${req.entityId}
      ORDER BY created_at DESC, id DESC
      LIMIT ${req.limit}
    `,
  });

  const findByIdsSchema = SqlSchema.findAll({
    Request: FindByIdsRequest,
    Result: Entities.Mention.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND id IN ${sql.in(req.ids)}
    `,
  });

  const findByDocumentIdSchema = SqlSchema.findAll({
    Request: FindByDocumentIdRequest,
    Result: Entities.Mention.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND document_id = ${req.documentId}
      ORDER BY created_at DESC, id DESC
      LIMIT ${req.limit}
    `,
  });

  const findByEntityId = (
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 200
  ): Effect.Effect<ReadonlyArray<Entities.Mention.Model>, DatabaseError> =>
    findByEntityIdSchema({ entityId, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MentionRepo.findByEntityId", {
        captureStackTrace: false,
        attributes: { entityId, organizationId, limit },
      })
    );

  const findByIds = (
    ids: ReadonlyArray<KnowledgeEntityIds.MentionId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.Mention.Model>, DatabaseError> =>
    F.pipe(
      A.isEmptyReadonlyArray(ids),
      Effect.if({
        onTrue: () => Effect.succeed([] as const),
        onFalse: () => findByIdsSchema({ ids: [...ids], organizationId }),
      }),
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MentionRepo.findByIds", {
        captureStackTrace: false,
        attributes: { organizationId, count: A.length(ids) },
      })
    );

  const findByDocumentId = (
    documentId: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 200
  ): Effect.Effect<ReadonlyArray<Entities.Mention.Model>, DatabaseError> =>
    findByDocumentIdSchema({ documentId, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("MentionRepo.findByDocumentId", {
        captureStackTrace: false,
        attributes: { documentId, organizationId, limit },
      })
    );

  return { findByEntityId, findByIds, findByDocumentId } as const;
});

const serviceEffect = DbRepo.make(KnowledgeEntityIds.MentionId, Entities.Mention.Model, makeMentionExtensions);

export type MentionRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class MentionRepo extends Context.Tag($I`MentionRepo`)<MentionRepo, MentionRepoShape>() {}

export const MentionRepoLive = Layer.effect(MentionRepo, serviceEffect).pipe(Layer.provide(KnowledgeDb.layer));
