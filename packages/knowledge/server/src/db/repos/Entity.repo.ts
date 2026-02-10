import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-server/factories";
import { thunkSucceedEffect, thunkZero } from "@beep/utils";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/EntityRepo");

const tableName = KnowledgeEntityIds.KnowledgeEntityId.tableName;

const encodeStringArrayJsonb = S.encode(S.parseJson(S.Array(S.String)));

class FindByIdsRequest extends S.Class<FindByIdsRequest>($I`FindByIdsRequest`)(
  {
    ids: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByIdsRequest", {
    description: "SQL request schema: fetch entities by id list (scoped to organization).",
  })
) {}

class FindByOntologyRequest extends S.Class<FindByOntologyRequest>($I`FindByOntologyRequest`)(
  {
    ontologyId: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindByOntologyRequest", {
    description: "SQL request schema: fetch entities by ontology id (scoped to organization, limited).",
  })
) {}

class FindByTypeRequest extends S.Class<FindByTypeRequest>($I`FindByTypeRequest`)(
  {
    typeIri: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindByTypeRequest", {
    description: "SQL request schema: fetch entities by type IRI (scoped to organization, limited).",
  })
) {}

class CountByOrganizationRequest extends S.Class<CountByOrganizationRequest>($I`CountByOrganizationRequest`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("CountByOrganizationRequest", {
    description: "SQL request schema: count entities for an organization.",
  })
) {}

class FindByNormalizedTextRequest extends S.Class<FindByNormalizedTextRequest>($I`FindByNormalizedTextRequest`)(
  {
    normalizedText: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindByNormalizedTextRequest", {
    description:
      "SQL request schema: fuzzy-search entities by normalized mention text (scoped to organization, limited).",
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

const makeEntityExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findByIdsSchema = SqlSchema.findAll({
    Request: FindByIdsRequest,
    Result: Entities.Entity.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND id IN ${sql.in(req.ids)}
    `,
  });

  const findByOntologySchema = SqlSchema.findAll({
    Request: FindByOntologyRequest,
    Result: Entities.Entity.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND ontology_id = ${req.ontologyId}
        ORDER BY created_at DESC
            LIMIT ${req.limit}
    `,
  });

  const findByTypeSchema = SqlSchema.findAll({
    Request: FindByTypeRequest,
    Result: Entities.Entity.Model,
    execute: (req) =>
      Effect.gen(function* () {
        const typeIrisJson = yield* encodeStringArrayJsonb([req.typeIri]).pipe(Effect.orDie);
        return yield* sql`
          SELECT *
          FROM ${sql(tableName)}
          WHERE organization_id = ${req.organizationId}
            AND types @ > ${typeIrisJson}::jsonb
          ORDER BY created_at DESC
          LIMIT ${req.limit}
        `;
      }),
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

  const findByNormalizedTextSchema = SqlSchema.findAll({
    Request: FindByNormalizedTextRequest,
    Result: Entities.Entity.Model,
    execute: (req) => sql`
        SELECT *
        FROM ${sql(tableName)}
        WHERE organization_id = ${req.organizationId}
          AND similarity(mention, ${req.normalizedText}) > 0.3
        ORDER BY similarity(mention, ${req.normalizedText}) DESC
        LIMIT ${req.limit}
    `,
  });

  const findByIds = (
    ids: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
    F.pipe(
      A.isNonEmptyReadonlyArray(ids),
      Effect.if({
        onTrue: thunkSucceedEffect(A.empty<Entities.Entity.Model>()),
        onFalse: () => findByIdsSchema({ ids: [...ids], organizationId }),
      }),
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityRepo.findByIds", {
        captureStackTrace: false,
        attributes: { count: A.length(ids), organizationId },
      })
    );

  const findByOntology = (
    ontologyId: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
    findByOntologySchema({ ontologyId, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityRepo.findByOntology", {
        captureStackTrace: false,
        attributes: { ontologyId, organizationId, limit },
      })
    );

  const findByType = (
    typeIri: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
    findByTypeSchema({ typeIri, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityRepo.findByType", {
        captureStackTrace: false,
        attributes: { typeIri, organizationId, limit },
      })
    );

  const countByOrganization = (
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<number, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* countByOrganizationSchema({ organizationId });
      return O.match(A.head(result), {
        onNone: thunkZero,
        onSome: (row) => O.getOrElse(Num.parse(row.count), thunkZero),
      });
    }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityRepo.countByOrganization", {
        captureStackTrace: false,
        attributes: { organizationId },
      })
    );

  const findByNormalizedText = (
    normalizedText: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 50
  ): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
    findByNormalizedTextSchema({ normalizedText, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", (e) => Effect.die(e)),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("EntityRepo.findByNormalizedText", {
        captureStackTrace: false,
        attributes: { normalizedText, organizationId, limit },
      })
    );

  return {
    findByIds,
    findByOntology,
    findByType,
    countByOrganization,
    findByNormalizedText,
  };
});

const serviceEffect = DbRepo.make(KnowledgeEntityIds.KnowledgeEntityId, Entities.Entity.Model, makeEntityExtensions);

export type EntityRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class EntityRepo extends Context.Tag($I`EntityRepo`)<EntityRepo, EntityRepoShape>() {}

export const EntityRepoLive = Layer.effect(EntityRepo, serviceEffect).pipe(Layer.provide(KnowledgeDb.layer));
