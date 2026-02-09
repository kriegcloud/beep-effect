import { Entities } from "@beep/documents-domain";
import { DocumentsDb } from "@beep/documents-server/db";
import { $DocumentsServerId } from "@beep/identity/packages";
import { DocumentsEntityIds, IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import { DbClient } from "@beep/shared-server";
import { and, eq, isNull } from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $DocumentsServerId.create("db/repos/DocumentSource.repo");

export class DocumentSourceRepo extends Effect.Service<DocumentSourceRepo>()($I`DocumentSourceRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { makeQuery } = yield* DocumentsDb.Db;

    const baseRepo = yield* DbRepo.make(DocumentsEntityIds.DocumentSourceId, Entities.DocumentSource.Model, Effect.succeed({}));

    const findByMappingKey = makeQuery(
      (
        execute,
        params: {
          readonly organizationId: SharedEntityIds.OrganizationId.Type;
          readonly providerAccountId: IamEntityIds.AccountId.Type;
          readonly sourceType: string;
          readonly sourceId: string;
          readonly includeDeleted?: boolean | undefined;
        }
      ) =>
        execute((client) =>
          client.query.documentSource.findFirst({
            where: (table) =>
              and(
                eq(table.organizationId, params.organizationId),
                eq(table.providerAccountId, params.providerAccountId),
                eq(table.sourceType, params.sourceType),
                eq(table.sourceId, params.sourceId),
                params.includeDeleted ? undefined : isNull(table.deletedAt)
              ),
          })
        ).pipe(
          Effect.map((row) => O.fromNullable(row)),
          Effect.flatMap(
            O.match({
              onNone: () => Effect.succeed(O.none()),
              onSome: (row) => S.decodeUnknown(Entities.DocumentSource.Model)(row).pipe(Effect.map(O.some)),
            })
          ),
          Effect.mapError(DbClient.DatabaseError.$match),
          Effect.withSpan("DocumentSourceRepo.findByMappingKey", {
            captureStackTrace: false,
            attributes: {
              organizationId: params.organizationId,
              providerAccountId: params.providerAccountId,
              sourceType: params.sourceType,
            },
          })
        )
    );

    return {
      ...baseRepo,
      findByMappingKey,
    } as const;
  }),
}) {}

export const DocumentSourceRepoLive: Layer.Layer<DocumentSourceRepo, never, DbClient.SliceDbRequirements | DocumentsDb.Db> =
  DocumentSourceRepo.Default;
