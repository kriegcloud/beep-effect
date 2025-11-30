import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/documents-domain";
import {
  KnowledgePageCircularReferenceError,
  KnowledgePageNotFoundError,
  KnowledgePageSlugConflictError,
} from "@beep/documents-domain/entities/KnowledgePage/KnowledgePage.errors";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { DocumentsDbSchema } from "@beep/documents-tables";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as SqlClient from "@effect/sql/SqlClient";
import type * as SqlError from "@effect/sql/SqlError";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import type * as Cause from "effect/Cause";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import type * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

type DeleteError = Cause.NoSuchElementException | ParseResult.ParseError | SqlError.SqlError;

const matchDeleteError = (args: { readonly id: DocumentsEntityIds.KnowledgePageId.Type }) =>
  Match.type<DeleteError>().pipe(
    Match.tagsExhaustive({
      NoSuchElementException: () => new KnowledgePageNotFoundError({ id: args.id }),
      ParseError: Effect.die,
      SqlError: Effect.die,
    })
  );

export class KnowledgePageRepo extends Effect.Service<KnowledgePageRepo>()(
  "@beep/documents-infra/adapters/repos/KnowledgePageRepo",
  {
    dependencies,
    accessors: true,
    effect: Effect.gen(function* () {
      const now = F.pipe(F.pipe(DateTime.now, Effect.map(DateTime.toDateUtc)), F.constant);
      const bindDeletedAt = Effect.bind("deletedAt", now);
      const sql = yield* SqlClient.SqlClient;
      const { makeQuery } = yield* DocumentsDb.DocumentsDb;
      const baseRepo = yield* Repo.make(
        DocumentsEntityIds.KnowledgePageId,
        Entities.KnowledgePage.Model,
        Effect.succeed({})
      );
      const findBySlug = makeQuery(
        (
          execute,
          params: {
            readonly slug: string;
          }
        ) =>
          execute((client) =>
            client.query.knowledgePage.findFirst({
              where: (table, { eq }) => eq(table.slug, params.slug),
            })
          ).pipe(
            Effect.map(O.fromNullable),
            Effect.flatMap(
              O.match({
                onNone: F.constant(Effect.fail(new KnowledgePageNotFoundError({ slug: params.slug }))),
                onSome: Effect.succeed,
              })
            ),
            Effect.flatMap(S.decode(Entities.KnowledgePage.Model)),
            Effect.catchTag("ParseError", Effect.die)
          )
      );

      const listBySpace = makeQuery(
        (
          execute,
          params: {
            readonly spaceId: DocumentsEntityIds.KnowledgeSpaceId.Type;
          }
        ) =>
          execute((client) =>
            client.query.knowledgePage.findMany({
              where: (table, { eq }) => eq(table.spaceId, params.spaceId),
            })
          ).pipe(Effect.flatMap(S.decode(S.Array(Entities.KnowledgePage.Model))))
      );

      const listChildren = makeQuery(
        (
          execute,
          params: {
            readonly parentPageId: DocumentsEntityIds.KnowledgePageId.Type;
          }
        ) =>
          execute((client) =>
            client.query.knowledgePage.findMany({
              where: (table, { eq }) => eq(table.parentPageId, params.parentPageId),
            })
          ).pipe(Effect.flatMap(S.decode(S.Array(Entities.KnowledgePage.Model))))
      );

      const CheckCircularReferenceRequest = S.Struct({
        pageId: DocumentsEntityIds.KnowledgePageId,
        newParentId: DocumentsEntityIds.KnowledgePageId,
      });
      type CheckCircularReferenceRequest = typeof CheckCircularReferenceRequest.Type;
      const checkCircularReferenceSchema = SqlSchema.single({
        Request: CheckCircularReferenceRequest,
        Result: S.Array(
          S.Struct({
            id: DocumentsEntityIds.KnowledgePageId,
            parentPageId: DocumentsEntityIds.KnowledgePageId,
          })
        ),
        execute: (request) => sql`
            WITH RECURSIVE ancestors AS (SELECT id, parent_page_id
                                         FROM knowledge_page
                                         WHERE ${DocumentsDbSchema.knowledgePage.id} = ${request.newParentId}
                                         UNION ALL
                                         SELECT p.id, p.parent_page_id
                                         FROM knowledge_page p
                                                  INNER JOIN ancestors a ON p.id = a.parent_page_id)
            SELECT id
            FROM ancestors
        `,
      });

      const checkCircularReference = F.flow((request: CheckCircularReferenceRequest) =>
        F.pipe(
          checkCircularReferenceSchema(request),
          Effect.map(A.some((ancestor) => ancestor.id === request.pageId)),
          Effect.map(
            Bool.match({
              onTrue: () =>
                new KnowledgePageCircularReferenceError({
                  pageId: request.pageId,
                  newParentId: request.newParentId,
                }),
              onFalse: () => Effect.void,
            })
          )
        )
      );

      const movePage = makeQuery(
        (
          execute,
          params: {
            readonly pageId: DocumentsEntityIds.KnowledgePageId.Type;
            readonly newParentId: DocumentsEntityIds.KnowledgePageId.Type;
          }
        ) =>
          Effect.gen(function* () {
            yield* checkCircularReference({
              pageId: params.pageId,
              newParentId: params.newParentId,
            });

            yield* execute((client) =>
              client
                .update(DocumentsDbSchema.knowledgePage)
                .set({
                  parentPageId: params.newParentId,
                })
                .where(d.eq(DocumentsDbSchema.knowledgePage.id, params.pageId))
            );
          })
      );

      const checkSlugConflict = makeQuery(
        (
          execute,
          params: {
            readonly spaceId: DocumentsEntityIds.KnowledgeSpaceId.Type;
            readonly slug: string;
            readonly excludeId?: DocumentsEntityIds.KnowledgePageId.Type;
          }
        ) =>
          execute((client) =>
            client.query.knowledgePage.findFirst({
              where: (_, { ne, eq, isNull, and }) =>
                and(
                  eq(DocumentsDbSchema.knowledgePage.slug, params.slug),
                  isNull(DocumentsDbSchema.knowledgePage.deletedAt),
                  ...(params.excludeId ? [ne(DocumentsDbSchema.knowledgePage.id, params.excludeId)] : [])
                ),
            })
          ).pipe(
            Effect.map(O.fromNullable),
            Effect.map(
              O.match({
                onNone: () => new KnowledgePageSlugConflictError({ slug: params.slug }),
                onSome: Effect.succeed,
              })
            )
          )
      );

      const create = Effect.fn("KnowledgePageRepo.create")(function* (
        input: typeof Entities.KnowledgePage.Model.insert.Type
      ) {
        yield* checkSlugConflict({
          spaceId: input.spaceId,
          slug: input.slug,
        });
        return yield* baseRepo.insert(input);
      });

      const update = Effect.fn("KnowledgePageRepo.update")(function* (
        input: typeof Entities.KnowledgePage.Model.update.Type
      ) {
        if (input.slug) {
          yield* checkSlugConflict({
            spaceId: input.spaceId,
            slug: input.slug,
            excludeId: input.id,
          });
        }
        return yield* baseRepo.update(input);
      });

      const DeleteRequest = S.Struct({
        id: DocumentsEntityIds.KnowledgePageId,
      });

      const deleteSchema = SqlSchema.single({
        Request: DeleteRequest,
        Result: S.Void,
        execute: (request) =>
          F.pipe(
            Effect.Do,
            bindDeletedAt,
            Effect.andThen(
              ({ deletedAt }) => sql`
              UPDATE ${sql(DocumentsEntityIds.KnowledgePageId.tableName)}
              SET deleted_at = ${deletedAt}
              WHERE id = ${request.id}
                AND deleted_at IS NULL
          `
            )
          ),
      });

      const bindAttributes = <A extends Record<string, unknown>>(args: A) =>
        Effect.bind("attributes", F.constant(Effect.succeed({ arguments: args })));

      const _delete = Effect.fn("KnowledgePageRepo.delete")(deleteSchema, (effect, args) =>
        F.pipe(
          Effect.Do,
          bindAttributes(args),
          Effect.map(({ attributes }) =>
            effect.pipe(
              Effect.tap(Effect.annotateCurrentSpan(attributes)),
              Effect.annotateLogs(attributes),
              Effect.mapError(matchDeleteError(args))
            )
          )
        )
      );

      const findById = Effect.fn("KnowledgePageRepo.get")(
        function* (payload: { readonly id: DocumentsEntityIds.KnowledgePageId.Type }) {
          return yield* baseRepo.findById(payload.id);
        },
        (effect, n) =>
          effect.pipe(
            Effect.flatMap(
              O.match({
                onNone: () => new Entities.KnowledgePage.KnowledgePageNotFoundError(n),
                onSome: Effect.succeed,
              })
            ),
            Effect.catchTag("DbError", Effect.die)
          )
      );

      return {
        ...baseRepo,
        delete: _delete,
        findById,
        create,
        findBySlug,
        listBySpace,
        listChildren,
        movePage,
        update,
      } as const;
    }),
  }
) {}
