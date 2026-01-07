import { Entities } from "@beep/documents-domain";
import { DocumentsDb } from "@beep/documents-server/db";
import { $DocumentsServerId } from "@beep/identity/packages";
import { DocumentsEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { DbClient, DbRepo } from "@beep/shared-server";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $DocumentsServerId.create("db/repos/DocumentFile.repo");

/**
 * Error when a document file is not found.
 * @identifier FileNotFoundError
 * @description Runtime error indicating the requested document file does not exist
 */
export class FileNotFoundError extends Data.TaggedError("FileNotFoundError")<{
  readonly id: DocumentsEntityIds.DocumentFileId.Type;
}> {}

export class DocumentFileRepo extends Effect.Service<DocumentFileRepo>()($I`DocumentFileRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { makeQuery } = yield* DocumentsDb.Db;

    const baseRepo = yield* DbRepo.make(
      DocumentsEntityIds.DocumentFileId,
      Entities.DocumentFile.Model,
      Effect.succeed({})
    );

    /**
     * Find file by ID with proper error handling
     */
    const findByIdOrFail = (
      id: DocumentsEntityIds.DocumentFileId.Type
    ): Effect.Effect<typeof Entities.DocumentFile.Model.Type, FileNotFoundError | DbClient.DatabaseError> =>
      baseRepo.findById(id).pipe(
        Effect.flatMap(
          O.match({
            onNone: () => Effect.fail(new FileNotFoundError({ id })),
            onSome: Effect.succeed,
          })
        ),
        Effect.withSpan("DocumentFileRepo.findByIdOrFail", { attributes: { id } })
      );

    /**
     * List all files for a document
     */
    const listByDocument = makeQuery(
      (
        execute,
        params: {
          readonly documentId: DocumentsEntityIds.DocumentId.Type;
        }
      ) =>
        execute((client) =>
          client.query.documentFile.findMany({
            where: (table, { eq, isNull, and }) =>
              and(eq(table.documentId, params.documentId), isNull(table.deletedAt)),
            orderBy: (table, { desc }) => [desc(table.createdAt)],
          })
        ).pipe(
          Effect.flatMap(S.decode(S.Array(Entities.DocumentFile.Model))),
          Effect.mapError(DbClient.DatabaseError.$match),
          Effect.withSpan("DocumentFileRepo.listByDocument", { attributes: { documentId: params.documentId } })
        )
    );

    /**
     * List all files uploaded by a user
     */
    const listByUser = makeQuery(
      (
        execute,
        params: {
          readonly userId: SharedEntityIds.UserId.Type;
          readonly organizationId: SharedEntityIds.OrganizationId.Type;
        }
      ) =>
        execute((client) =>
          client.query.documentFile.findMany({
            where: (table, { eq, isNull, and }) =>
              and(
                eq(table.userId, params.userId),
                eq(table.organizationId, params.organizationId),
                isNull(table.deletedAt)
              ),
            orderBy: (table, { desc }) => [desc(table.createdAt)],
          })
        ).pipe(
          Effect.flatMap(S.decode(S.Array(Entities.DocumentFile.Model))),
          Effect.mapError(DbClient.DatabaseError.$match),
          Effect.withSpan("DocumentFileRepo.listByUser", { attributes: { userId: params.userId } })
        )
    );

    /**
     * Create a file record
     */
    const create = Effect.fn("DocumentFileRepo.create")(function* (
      input: typeof Entities.DocumentFile.Model.insert.Type
    ) {
      return yield* baseRepo.insert(input);
    });

    /**
     * Hard delete a file record
     */
    const hardDelete = (id: DocumentsEntityIds.DocumentFileId.Type) =>
      baseRepo.delete(id).pipe(Effect.withSpan("DocumentFileRepo.hardDelete", { attributes: { id } }));

    return {
      ...baseRepo,
      findByIdOrFail,
      listByDocument,
      listByUser,
      create,
      hardDelete,
    } as const;
  }),
}) {}
