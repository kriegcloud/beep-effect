import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { thunkSucceedEffect, thunkZero } from "@beep/utils";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../../db/Db";

const tableName = KnowledgeEntityIds.KnowledgeEntityId.tableName;

const encodeStringArrayJsonb = S.encode(S.parseJson(S.Array(S.String)));
const decodeEntity = S.decodeUnknownEither(Entities.Entity.Model);

const normalizeEntityTypesField = (row: unknown): unknown => {
  if (typeof row !== "object" || row === null) {
    return row;
  }
  const rawTypes = Reflect.get(row, "types");
  if (typeof rawTypes !== "string") {
    return row;
  }
  try {
    const parsed = JSON.parse(rawTypes);
    return Object.assign({}, row, { types: parsed });
  } catch {
    return row;
  }
};

const decodeEntityRow = (row: unknown): O.Option<Entities.Entity.Model> =>
  Either.match(decodeEntity(normalizeEntityTypesField(row)), {
    onLeft: (e) => {
      // eslint-disable-next-line no-console -- temporary debug logging for entity decode failures
      console.log("[ENTITY-DECODE-DEBUG] row keys:", typeof row === "object" && row !== null ? Object.keys(row) : "N/A");
      // eslint-disable-next-line no-console -- temporary debug logging for entity decode failures
      console.log("[ENTITY-DECODE-DEBUG] error:", String(e).slice(0, 500));
      return O.none();
    },
    onRight: O.some,
  });

class FindByIdsRequest extends S.Class<FindByIdsRequest>("FindByIdsRequest")({
  ids: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByOntologyRequest extends S.Class<FindByOntologyRequest>("FindByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class FindByTypeRequest extends S.Class<FindByTypeRequest>("FindByTypeRequest")({
  typeIri: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class CountByOrganizationRequest extends S.Class<CountByOrganizationRequest>("CountByOrganizationRequest")({
  organizationId: SharedEntityIds.OrganizationId,
}) {}

class FindByNormalizedTextRequest extends S.Class<FindByNormalizedTextRequest>("FindByNormalizedTextRequest")({
  normalizedText: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}

class CountResult extends S.Class<CountResult>("CountResult")({
  count: S.String,
}) {}

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
        onTrue: () =>
          findByIdsSchema({ ids: [...ids], organizationId }).pipe(
            Effect.catchTag("ParseError", () =>
              Effect.gen(function* () {
                const rawRows: ReadonlyArray<unknown> = yield* sql`
                  SELECT *
                  FROM ${sql(tableName)}
                  WHERE organization_id = ${organizationId}
                    AND id IN ${sql.in([...ids])}
                `;
                const decodedRows = A.filterMap(rawRows, decodeEntityRow);
                const droppedRows = A.length(rawRows) - A.length(decodedRows);

                if (droppedRows > 0) {
                  yield* Effect.logWarning("EntityRepo.findByIds: dropped invalid entity rows during recovery").pipe(
                    Effect.annotateLogs({ droppedRows, totalRows: A.length(rawRows), organizationId })
                  );
                }

                return decodedRows;
              })
            )
          ),
        onFalse: thunkSucceedEffect(A.empty<Entities.Entity.Model>()),
      }),
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

export const RepoLive: Layer.Layer<Entities.Entity.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.Entity.Repo,
  serviceEffect
).pipe(Layer.provide(KnowledgeDb.layer));
