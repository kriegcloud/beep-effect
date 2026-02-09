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

const $I = $KnowledgeServerId.create("db/repos/RelationEvidenceRepo");

const tableName = KnowledgeEntityIds.RelationEvidenceId.tableName;

class FindByRelationIdRequest extends S.Class<FindByRelationIdRequest>($I`FindByRelationIdRequest`)(
  {
    relationId: KnowledgeEntityIds.RelationId,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindByRelationIdRequest", {
    description: "SQL request schema: fetch relation_evidence rows for a relation (scoped to organization).",
  })
) {}

class FindByIdsRequest extends S.Class<FindByIdsRequest>($I`FindByIdsRequest`)(
  {
    ids: S.Array(KnowledgeEntityIds.RelationEvidenceId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByIdsRequest", {
    description: "SQL request schema: fetch relation_evidence by ids (scoped to organization).",
  })
) {}

class SearchByTextRequest extends S.Class<SearchByTextRequest>($I`SearchByTextRequest`)(
  {
    query: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("SearchByTextRequest", {
    description: "SQL request schema: search relation_evidence by snippet text (scoped to organization).",
  })
) {}

const makeExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findByRelationIdSchema = SqlSchema.findAll({
    Request: FindByRelationIdRequest,
    Result: Entities.RelationEvidence.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND relation_id = ${req.relationId}
      ORDER BY created_at DESC, id DESC
      LIMIT ${req.limit}
    `,
  });

  const findByIdsSchema = SqlSchema.findAll({
    Request: FindByIdsRequest,
    Result: Entities.RelationEvidence.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND id IN ${sql.in(req.ids)}
    `,
  });

  const searchByTextSchema = SqlSchema.findAll({
    Request: SearchByTextRequest,
    Result: Entities.RelationEvidence.Model,
    execute: (req) => {
      const pattern = `%${req.query}%`;
      return sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND text ILIKE ${pattern}
        ORDER BY created_at DESC, id DESC
        LIMIT ${req.limit}
      `;
    },
  });

  const findByRelationId = (
    relationId: KnowledgeEntityIds.RelationId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 200
  ): Effect.Effect<ReadonlyArray<Entities.RelationEvidence.Model>, DatabaseError> =>
    findByRelationIdSchema({ relationId, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("RelationEvidenceRepo.findByRelationId", {
        captureStackTrace: false,
        attributes: { relationId, organizationId, limit },
      })
    );

  const findByIds = (
    ids: ReadonlyArray<KnowledgeEntityIds.RelationEvidenceId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.RelationEvidence.Model>, DatabaseError> =>
    F.pipe(
      A.isEmptyReadonlyArray(ids),
      Effect.if({
        onTrue: () => Effect.succeed([] as const),
        onFalse: () => findByIdsSchema({ ids: [...ids], organizationId }),
      }),
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("RelationEvidenceRepo.findByIds", {
        captureStackTrace: false,
        attributes: { organizationId, count: A.length(ids) },
      })
    );

  const searchByText = (
    query: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 50
  ): Effect.Effect<ReadonlyArray<Entities.RelationEvidence.Model>, DatabaseError> =>
    searchByTextSchema({ query, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("RelationEvidenceRepo.searchByText", {
        captureStackTrace: false,
        attributes: { organizationId, limit },
      })
    );

  return { findByRelationId, findByIds, searchByText } as const;
});

const serviceEffect = DbRepo.make(
  KnowledgeEntityIds.RelationEvidenceId,
  Entities.RelationEvidence.Model,
  makeExtensions
);

export type RelationEvidenceRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class RelationEvidenceRepo extends Context.Tag($I`RelationEvidenceRepo`)<
  RelationEvidenceRepo,
  RelationEvidenceRepoShape
>() {}

export const RelationEvidenceRepoLive = Layer.effect(RelationEvidenceRepo, serviceEffect).pipe(
  Layer.provide(KnowledgeDb.layer)
);
