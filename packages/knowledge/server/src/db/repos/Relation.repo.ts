import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import { thunkSucceedEffect, thunkZero } from "@beep/utils";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/RelationRepo");

const tableName = KnowledgeEntityIds.RelationId.tableName;

class FindBySourceIdsRequest extends S.Class<FindBySourceIdsRequest>($I`FindBySourceIdsRequest`)(
  {
    sourceIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindBySourceIdsRequest", {
    description: "SQL request schema: fetch relations by subject ids (scoped to organization).",
  })
) {}

class FindByTargetIdsRequest extends S.Class<FindByTargetIdsRequest>($I`FindByTargetIdsRequest`)(
  {
    targetIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByTargetIdsRequest", {
    description: "SQL request schema: fetch relations by object ids (scoped to organization).",
  })
) {}

class FindByEntityIdsRequest extends S.Class<FindByEntityIdsRequest>($I`FindByEntityIdsRequest`)(
  {
    entityIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByEntityIdsRequest", {
    description:
      "SQL request schema: fetch relations where either side matches provided entity ids (scoped to organization).",
  })
) {}

class FindByPredicateRequest extends S.Class<FindByPredicateRequest>($I`FindByPredicateRequest`)(
  {
    predicateIri: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindByPredicateRequest", {
    description: "SQL request schema: fetch relations by predicate IRI (scoped to organization, limited).",
  })
) {}

class CountByOrganizationRequest extends S.Class<CountByOrganizationRequest>($I`CountByOrganizationRequest`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("CountByOrganizationRequest", {
    description: "SQL request schema: count relations for an organization.",
  })
) {}

class CountResult extends S.Class<CountResult>($I`CountResult`)(
  {
    count: S.String,
  },
  $I.annotations("CountResult", {
    description: "SQL count query result (string-typed count from database).",
  })
) {}

const makeRelationExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findBySourceIdsSchema = SqlSchema.findAll({
    Request: FindBySourceIdsRequest,
    Result: Entities.Relation.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND subject_id IN ${sql.in(req.sourceIds)}
    `,
  });

  const findByTargetIdsSchema = SqlSchema.findAll({
    Request: FindByTargetIdsRequest,
    Result: Entities.Relation.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND object_id IN ${sql.in(req.targetIds)}
    `,
  });

  const findByEntityIdsSchema = SqlSchema.findAll({
    Request: FindByEntityIdsRequest,
    Result: Entities.Relation.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND (subject_id IN ${sql.in(req.entityIds)} OR object_id IN ${sql.in(req.entityIds)})
    `,
  });

  const findByPredicateSchema = SqlSchema.findAll({
    Request: FindByPredicateRequest,
    Result: Entities.Relation.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND predicate = ${req.predicateIri}
        ORDER BY created_at DESC
            LIMIT ${req.limit}
    `,
  });

  const countByOrganizationSchema = SqlSchema.findAll({
    Request: CountByOrganizationRequest,
    Result: CountResult,
    execute: (req) => sql`
        SELECT COUNT(*) as count
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
    `,
  });

  const findBySourceIds = (
    sourceIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<readonly Entities.Relation.Model[], DatabaseError> =>
    F.pipe(
      A.isEmptyReadonlyArray(sourceIds),
      Effect.if({
        onFalse: thunkSucceedEffect([]),
        onTrue: () => findBySourceIdsSchema({ sourceIds: [...sourceIds], organizationId }),
      }),
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("RelationRepo.findBySourceIds", {
        captureStackTrace: false,
        attributes: { count: A.length(sourceIds), organizationId },
      })
    );

  const findByTargetIds = (
    targetIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.Relation.Model>, DatabaseError> =>
    F.pipe(
      A.isEmptyReadonlyArray(targetIds),
      Effect.if({
        onFalse: thunkSucceedEffect([]),
        onTrue: () => findByTargetIdsSchema({ targetIds: [...targetIds], organizationId }),
      }),
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("RelationRepo.findByTargetIds", {
        captureStackTrace: false,
        attributes: { count: A.length(targetIds), organizationId },
      })
    );

  const findByEntityIds = (
    entityIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.Relation.Model>, DatabaseError> =>
    F.pipe(
      A.isEmptyReadonlyArray(entityIds),
      Effect.if({
        onFalse: thunkSucceedEffect([]),
        onTrue: () => findByEntityIdsSchema({ entityIds: [...entityIds], organizationId }),
      }),
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("RelationRepo.findByEntityIds", {
        captureStackTrace: false,
        attributes: { count: A.length(entityIds), organizationId },
      })
    );

  const findByPredicate = (
    predicateIri: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.Relation.Model>, DatabaseError> =>
    findByPredicateSchema({ predicateIri, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("RelationRepo.findByPredicate", {
        captureStackTrace: false,
        attributes: { predicateIri, organizationId, limit },
      })
    );

  const countByOrganization = (
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<number, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* countByOrganizationSchema({ organizationId });
      return O.match(A.head(result), {
        onNone: thunkZero,
        onSome: (row) => Number.parseInt(row.count, 10),
      });
    }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("RelationRepo.countByOrganization", {
        captureStackTrace: false,
        attributes: { organizationId },
      })
    );

  return {
    findBySourceIds,
    findByTargetIds,
    findByEntityIds,
    findByPredicate,
    countByOrganization,
  };
});

const serviceEffect = DbRepo.make(KnowledgeEntityIds.RelationId, Entities.Relation.Model, makeRelationExtensions);

export type RelationRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class RelationRepo extends Context.Tag($I`RelationRepo`)<RelationRepo, RelationRepoShape>() {}

export const RelationRepoLive = Layer.effect(RelationRepo, serviceEffect).pipe(Layer.provide(KnowledgeDb.layer));
