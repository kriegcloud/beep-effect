import { type IamEntityIds, type SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { Entities } from "@beep/workspaces-domain";
import { WorkspacesDb } from "@beep/workspaces-server/db";
import { and, eq, isNull } from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const serviceEffect = Effect.gen(function* () {
  const { makeQuery } = yield* WorkspacesDb.Db;

  const baseRepo = yield* DbRepo.make(WorkspacesEntityIds.DocumentSourceId, Entities.DocumentSource.Model);

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
  } as unknown as Entities.DocumentSource.RepoShape;
});

export const RepoLive: Layer.Layer<Entities.DocumentSource.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.DocumentSource.Repo,
  serviceEffect
).pipe(Layer.provide(WorkspacesDb.layer));
