import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DatabaseError } from "@beep/shared-domain/errors";
import { DbRepo } from "@beep/shared-server/factories";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/SameAsLinkRepo");

const tableName = KnowledgeEntityIds.SameAsLinkId.tableName;

class FindByCanonicalRequest extends S.Class<FindByCanonicalRequest>($I`FindByCanonicalRequest`)(
  {
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByCanonicalRequest", {
    description: "SQL request schema: fetch same-as links by canonical entity id (scoped to organization).",
  })
) {}

class FindByMemberRequest extends S.Class<FindByMemberRequest>($I`FindByMemberRequest`)(
  {
    memberId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindByMemberRequest", {
    description: "SQL request schema: fetch same-as link for a member entity id (scoped to organization).",
  })
) {}

class ResolveCanonicalRequest extends S.Class<ResolveCanonicalRequest>($I`ResolveCanonicalRequest`)(
  {
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("ResolveCanonicalRequest", {
    description: "SQL request schema: resolve canonical entity id for a member entity id via recursive traversal.",
  })
) {}

class ResolveCanonicalResult extends S.Class<ResolveCanonicalResult>($I`ResolveCanonicalResult`)(
  {
    canonical_id: S.String,
  },
  $I.annotations("ResolveCanonicalResult", {
    description: "SQL result row for canonical resolution (canonical_id as returned from database).",
  })
) {}

class FindHighConfidenceRequest extends S.Class<FindHighConfidenceRequest>($I`FindHighConfidenceRequest`)(
  {
    minConfidence: S.Number,
    organizationId: SharedEntityIds.OrganizationId,
    limit: S.Number,
  },
  $I.annotations("FindHighConfidenceRequest", {
    description: "SQL request schema: fetch high-confidence same-as links (scoped to organization, limited).",
  })
) {}

class FindBySourceRequest extends S.Class<FindBySourceRequest>($I`FindBySourceRequest`)(
  {
    sourceId: S.String,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("FindBySourceRequest", {
    description: "SQL request schema: fetch same-as links by source id (scoped to organization).",
  })
) {}

class CountMembersRequest extends S.Class<CountMembersRequest>($I`CountMembersRequest`)(
  {
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("CountMembersRequest", {
    description: "SQL request schema: count same-as members under a canonical entity id (scoped to organization).",
  })
) {}

class DeleteByCanonicalRequest extends S.Class<DeleteByCanonicalRequest>($I`DeleteByCanonicalRequest`)(
  {
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("DeleteByCanonicalRequest", {
    description: "SQL request schema: delete same-as links for a canonical entity id (scoped to organization).",
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

const makeSameAsLinkExtensions = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const findByCanonicalSchema = SqlSchema.findAll({
    Request: FindByCanonicalRequest,
    Result: Entities.SameAsLink.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE canonical_id = ${req.canonicalId}
        AND organization_id = ${req.organizationId}
    `,
  });

  const findByMemberSchema = SqlSchema.findOne({
    Request: FindByMemberRequest,
    Result: Entities.SameAsLink.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE member_id = ${req.memberId}
        AND organization_id = ${req.organizationId}
      LIMIT 1
    `,
  });

  const resolveCanonicalSchema = SqlSchema.findAll({
    Request: ResolveCanonicalRequest,
    Result: ResolveCanonicalResult,
    execute: (req) => sql`
      WITH RECURSIVE chain AS (
        SELECT member_id, canonical_id
        FROM ${sql(tableName)}
        WHERE member_id = ${req.entityId}
          AND organization_id = ${req.organizationId}

        UNION

        SELECT l.member_id, l.canonical_id
        FROM ${sql(tableName)} l
        INNER JOIN chain c ON l.member_id = c.canonical_id
        WHERE l.organization_id = ${req.organizationId}
      )
      SELECT canonical_id
      FROM chain
      ORDER BY canonical_id
      LIMIT 1
    `,
  });

  const findHighConfidenceSchema = SqlSchema.findAll({
    Request: FindHighConfidenceRequest,
    Result: Entities.SameAsLink.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND confidence >= ${req.minConfidence}
      ORDER BY confidence DESC
      LIMIT ${req.limit}
    `,
  });

  const findBySourceSchema = SqlSchema.findAll({
    Request: FindBySourceRequest,
    Result: Entities.SameAsLink.Model,
    execute: (req) => sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND source_id = ${req.sourceId}
    `,
  });

  const countMembersSchema = SqlSchema.findAll({
    Request: CountMembersRequest,
    Result: CountResult,
    execute: (req) => sql`
      SELECT COUNT(*) as count
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND canonical_id = ${req.canonicalId}
    `,
  });

  const deleteByCanonicalSchema = SqlSchema.void({
    Request: DeleteByCanonicalRequest,
    execute: (req) => sql`
      DELETE
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND canonical_id = ${req.canonicalId}
    `,
  });

  const findByCanonical = (
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.SameAsLink.Model>, DatabaseError> =>
    findByCanonicalSchema({ canonicalId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.findByCanonical", {
        captureStackTrace: false,
        attributes: { canonicalId, organizationId },
      })
    );

  const findByMember = (
    memberId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<O.Option<Entities.SameAsLink.Model>, DatabaseError> =>
    findByMemberSchema({ memberId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.findByMember", {
        captureStackTrace: false,
        attributes: { memberId, organizationId },
      })
    );

  const resolveCanonical = (
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<KnowledgeEntityIds.KnowledgeEntityId.Type, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* resolveCanonicalSchema({ entityId, organizationId });

      const first = A.head(result);
      if (O.isSome(first)) {
        return KnowledgeEntityIds.KnowledgeEntityId.make(first.value.canonical_id);
      }
      return entityId;
    }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.resolveCanonical", {
        captureStackTrace: false,
        attributes: { entityId, organizationId },
      })
    );

  const findHighConfidence = (
    minConfidence: number,
    organizationId: SharedEntityIds.OrganizationId.Type,
    limit = 100
  ): Effect.Effect<ReadonlyArray<Entities.SameAsLink.Model>, DatabaseError> =>
    findHighConfidenceSchema({ minConfidence, organizationId, limit }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.findHighConfidence", {
        captureStackTrace: false,
        attributes: { minConfidence, organizationId, limit },
      })
    );

  const findBySource = (
    sourceId: string,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<ReadonlyArray<Entities.SameAsLink.Model>, DatabaseError> =>
    findBySourceSchema({ sourceId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.findBySource", {
        captureStackTrace: false,
        attributes: { sourceId, organizationId },
      })
    );

  const deleteByCanonical = (
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<void, DatabaseError> =>
    deleteByCanonicalSchema({ canonicalId, organizationId }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.deleteByCanonical", {
        captureStackTrace: false,
        attributes: { canonicalId, organizationId },
      })
    );

  const countMembers = (
    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
    organizationId: SharedEntityIds.OrganizationId.Type
  ): Effect.Effect<number, DatabaseError> =>
    Effect.gen(function* () {
      const result = yield* countMembersSchema({ canonicalId, organizationId });
      const first = A.head(result);
      return O.isSome(first) ? Number.parseInt(first.value.count, 10) : 0;
    }).pipe(
      Effect.catchTag("ParseError", Effect.die),
      Effect.mapError(DatabaseError.$match),
      Effect.withSpan("SameAsLinkRepo.countMembers", {
        captureStackTrace: false,
        attributes: { canonicalId, organizationId },
      })
    );

  return {
    findByCanonical,
    findByMember,
    resolveCanonical,
    findHighConfidence,
    findBySource,
    deleteByCanonical,
    countMembers,
  };
});

const serviceEffect = DbRepo.make(KnowledgeEntityIds.SameAsLinkId, Entities.SameAsLink.Model, makeSameAsLinkExtensions);

export type SameAsLinkRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class SameAsLinkRepo extends Context.Tag($I`SameAsLinkRepo`)<SameAsLinkRepo, SameAsLinkRepoShape>() {}

export const SameAsLinkRepoLive = Layer.effect(SameAsLinkRepo, serviceEffect).pipe(Layer.provide(KnowledgeDb.layer));
