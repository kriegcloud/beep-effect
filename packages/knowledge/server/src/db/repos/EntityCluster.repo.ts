import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-domain/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/EntityClusterRepo");

const tableName = KnowledgeEntityIds.EntityClusterId.tableName;

const encodeMemberIdsJsonbArray = S.encode(S.parseJson(S.Array(KnowledgeEntityIds.KnowledgeEntityId)));

class FindByCanonicalEntityRequest extends S.Class<FindByCanonicalEntityRequest>($I`FindByCanonicalEntityRequest`)(
  {
    canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByCanonicalEntityRequest", {
    description: "SQL request schema: fetch entity cluster by canonical entity id (scoped to organization).",
  })
) {}

class FindByMemberRequest extends S.Class<FindByMemberRequest>($I`FindByMemberRequest`)(
  {
    memberId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByMemberRequest", {
    description: "SQL request schema: fetch entity cluster containing a member entity id (scoped to organization).",
  })
) {}

class FindClustersByOntologyRequest extends S.Class<FindClustersByOntologyRequest>($I`FindClustersByOntologyRequest`)(
  {
    ontologyId: KnowledgeEntityIds.OntologyId,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindClustersByOntologyRequest", {
    description: "SQL request schema: fetch entity clusters by ontology id (scoped to organization, limited).",
  })
) {}

class FindHighCohesionRequest extends S.Class<FindHighCohesionRequest>($I`FindHighCohesionRequest`)(
  {
    minCohesion: S.Number,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindHighCohesionRequest", {
    description:
      "SQL request schema: fetch clusters with cohesion above a threshold (scoped to organization, limited).",
  })
) {}

class DeleteByOntologyRequest extends S.Class<DeleteByOntologyRequest>($I`DeleteByOntologyRequest`)(
  {
    ontologyId: KnowledgeEntityIds.OntologyId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("DeleteByOntologyRequest", {
    description: "SQL request schema: delete clusters for an ontology (scoped to organization).",
  })
) {}

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
  ): Effect.Effect<O.Option<Entities.EntityCluster.Model>, DatabaseError> =>
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
  ): Effect.Effect<O.Option<Entities.EntityCluster.Model>, DatabaseError> =>
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

export type EntityClusterRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class EntityClusterRepo extends Context.Tag($I`EntityClusterRepo`)<
  EntityClusterRepo,
  EntityClusterRepoShape
>() {}

export const EntityClusterRepoLive = Layer.effect(EntityClusterRepo, serviceEffect).pipe(
  Layer.provide(KnowledgeDb.layer)
);
