import { Entities } from "@beep/documents-domain";
import { DocumentsDb } from "@beep/documents-server/db";
import { $DocumentsServerId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import { DbClient, DbRepo } from "@beep/shared-server";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $DocumentsServerId.create("db/repos/DocumentVersion.repo");
/**
 * Error when a document version is not found.
 * @identifier VersionNotFoundError
 * @description Runtime error indicating the requested document version does not exist
 */
export class VersionNotFoundError extends Data.TaggedError("VersionNotFoundError")<{
  readonly id: DocumentsEntityIds.DocumentVersionId.Type;
}> {}

/**
 * Schema for version with author info
 */
const VersionWithAuthorSchema = S.Struct({
  ...Entities.DocumentVersion.Model.fields,
  author: User.Model.select.pick("id", "_rowId", "name", "image"),
}).annotations(
  $I.annotations("VersionWithAuthorSchema", {
    description: "Document version with author information for version history display",
  })
);

export type VersionWithAuthor = typeof VersionWithAuthorSchema.Type;

export class DocumentVersionRepo extends Effect.Service<DocumentVersionRepo>()($I`DocumentVersionRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { makeQuery } = yield* DocumentsDb.Db;

    const baseRepo = yield* DbRepo.make(
      DocumentsEntityIds.DocumentVersionId,
      Entities.DocumentVersion.Model,
      Effect.succeed({})
    );

    /**
     * Find version by ID with proper error handling
     */
    const findByIdOrFail = (
      id: DocumentsEntityIds.DocumentVersionId.Type
    ): Effect.Effect<typeof Entities.DocumentVersion.Model.Type, VersionNotFoundError | DbClient.DatabaseError> =>
      baseRepo.findById(id).pipe(
        Effect.flatMap(
          O.match({
            onNone: () => Effect.fail(new VersionNotFoundError({ id })),
            onSome: Effect.succeed,
          })
        ),
        Effect.withSpan("DocumentVersionRepo.findByIdOrFail", { attributes: { id } })
      );

    /**
     * Get version with author info
     */
    const getWithAuthor = makeQuery(
      (
        execute,
        params: {
          readonly id: DocumentsEntityIds.DocumentVersionId.Type;
        }
      ) =>
        execute((client) =>
          client.query.documentVersion.findFirst({
            where: (table, { eq, isNull, and }) => and(eq(table.id, params.id), isNull(table.deletedAt)),
            with: {
              author: {
                columns: { id: true, _rowId: true, name: true, image: true },
              },
            },
          })
        ).pipe(
          Effect.filterOrFail(
            (result): result is NonNullable<typeof result> => result !== null && result !== undefined,
            () => new VersionNotFoundError({ id: params.id })
          ),
          Effect.flatMap((result) => S.decode(VersionWithAuthorSchema)(result)),
          Effect.mapError((e) => (e instanceof VersionNotFoundError ? e : DbClient.DatabaseError.$match(e))),
          Effect.withSpan("DocumentVersionRepo.getWithAuthor", { attributes: { id: params.id } })
        )
    );

    /**
     * List all versions for a document with author info
     */
    const listByDocument = makeQuery(
      (
        execute,
        params: {
          readonly documentId: DocumentsEntityIds.DocumentId.Type;
        }
      ) =>
        execute((client) =>
          client.query.documentVersion.findMany({
            where: (table, { eq, isNull, and }) =>
              and(eq(table.documentId, params.documentId), isNull(table.deletedAt)),
            orderBy: (table, { desc }) => [desc(table.createdAt)],
            with: {
              author: {
                columns: { id: true, _rowId: true, name: true, image: true },
              },
            },
          })
        ).pipe(
          Effect.flatMap(S.decode(S.Array(VersionWithAuthorSchema))),
          Effect.mapError(DbClient.DatabaseError.$match),
          Effect.withSpan("DocumentVersionRepo.listByDocument", { attributes: { documentId: params.documentId } })
        )
    );

    /**
     * Create a version snapshot from current document state
     */
    const createSnapshot = Effect.fn("DocumentVersionRepo.createSnapshot")(function* (
      input: typeof Entities.DocumentVersion.Model.insert.Type
    ) {
      return yield* baseRepo.insert(input);
    });

    /**
     * Hard delete a version
     */
    const hardDelete = (id: DocumentsEntityIds.DocumentVersionId.Type) =>
      baseRepo.delete(id).pipe(Effect.withSpan("DocumentVersionRepo.hardDelete", { attributes: { id } }));

    return {
      ...baseRepo,
      findByIdOrFail,
      getWithAuthor,
      listByDocument,
      createSnapshot,
      hardDelete,
    } as const;
  }),
}) {}
