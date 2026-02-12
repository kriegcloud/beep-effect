import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

const tableName = KnowledgeEntityIds.EntityClusterId.tableName;

const encodeMemberIdsJsonbArray = S.encode(S.parseJson(S.Array(KnowledgeEntityIds.KnowledgeEntityId)));

class FindByCanonicalEntityRequest extends S.Class<FindByCanonicalEntityRequest>("FindByCanonicalEntityRequest")({
  canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByMemberRequest extends S.Class<FindByMemberRequest>("FindByMemberRequest")({
  memberId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindClustersByOntologyRequest extends S.Class<FindClustersByOntologyRequest>("FindClustersByOntologyRequest")({
  ontologyId: KnowledgeEntityIds.OntologyId,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class FindHighCohesionRequest extends S.Class<FindHighCohesionRequest>("FindHighCohesionRequest")({
  minCohesion: S.Number,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class DeleteByOntologyRequest extends S.Class<DeleteByOntologyRequest>("DeleteByOntologyRequest")({
  ontologyId: KnowledgeEntityIds.OntologyId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}

const makeEntityClusterExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findByCanonicalEntitySchema = SqlSchema.findOne({
    Request: FindByCanonicalEntityRequest,
    Result: Entities.EntityCluster.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE canonical_entity_id = ${req.canonicalEntityId}
        AND organization_id = ${req.organizationId}
      LIMIT 1
    `,
  });

  const findByMemberSchema = SqlSchema.findOne({
    Request: FindByMemberRequest,
    Result: Entities.EntityCluster.Model,
    execute: (req) =>
      Effect.gen(function* () {
        const memberIdsJson = yield* encodeMemberIdsJsonbArray([req.memberId]).pipe(Effect.orDie);
        return yield* sql`
          SELECT *
          FROM ${sql(tableName)}
          WHERE organization_id = ${req.organizationId}
            AND member_ids @> ${memberIdsJson}::jsonb
          LIMIT 1
        `;
      }),
  });

  const findByOntologySchema = SqlSchema.findAll({
    Request: FindClustersByOntologyRequest,
    Result: Entities.EntityCluster.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND ontology_id = ${req.ontologyId}
      LIMIT ${req.limit}
    `,
  });

  const findHighCohesionSchema = SqlSchema.findAll({
    Request: FindHighCohesionRequest,
    Result: Entities.EntityCluster.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND cohesion >= ${req.minCohesion}
      ORDER BY cohesion DESC
      LIMIT ${req.limit}
    `,
  });

  const deleteByOntologySchema = SqlSchema.void({
    Request: DeleteByOntologyRequest,
    execute: (req) => sql`
      DELETE
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND ontology_id = ${req.ontologyId}
    `,
  });

  const findByCanonicalEntity = (
    canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<import("effect/Option").Option<Entities.EntityCluster.Model>, DatabaseError> =>
    findByCanonicalEntitySchema({ canonicalEntityId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.findByCanonicalEntity", {
        captureStackTrace: false,
        attributes: { canonicalEntityId, organizationId },
      })
    );

  const findByMember = (
    memberId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<import("effect/Option").Option<Entities.EntityCluster.Model>, DatabaseError> =>
    findByMemberSchema({ memberId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.findByMember", {
        captureStackTrace: false,
        attributes: { memberId, organizationId },
      })
    );

  const findByOntology = (
    ontologyId: KnowledgeEntityIds.OntologyId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.EntityCluster.Model>, DatabaseError> =>
    findByOntologySchema({ ontologyId, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.findByOntology", {
        captureStackTrace: false,
        attributes: { ontologyId, organizationId, limit },
      })
    );

  const findHighCohesion = (
    minCohesion: number,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.EntityCluster.Model>, DatabaseError> =>
    findHighCohesionSchema({ minCohesion, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.findHighCohesion", {
        captureStackTrace: false,
        attributes: { minCohesion, organizationId, limit },
      })
    );

  const deleteByOntology = (
    ontologyId: KnowledgeEntityIds.OntologyId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<void, DatabaseError> =>
    deleteByOntologySchema({ ontologyId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityClusterRepo.deleteByOntology", {
        captureStackTrace: false,
        attributes: { ontologyId, organizationId },
      })
    );

  return {
    findByCanonicalEntity,
    findByMember,
    findByOntology,
    findHighCohesion,
    deleteByOntology,
  };
});

const serviceEffect = DbRepo.make(
  KnowledgeEntityIds.EntityClusterId,
  Entities.EntityCluster.Model,
  makeEntityClusterExtensions
);

export const RepoLive: Layer.Layer<Entities.EntityCluster.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.EntityCluster.Repo,
  Effect.map(serviceEffect, (_) => _ as Entities.EntityCluster.RepoShape)
).pipe(Layer.provide(KnowledgeDb.layer));
