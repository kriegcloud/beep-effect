/**
 * File repository service for managing file entities with database operations.
 *
 * @since 0.1.0
 */
import { $SharedServerId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { File, Folder } from "@beep/shared-domain/entities";
import { SharedDb } from "@beep/shared-server/db";
import { Repo } from "@beep/shared-server/Repo";
import { file, folder } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $SharedServerId.create("repos/File");

/**
 * Repository service for managing File entities with database operations.
 *
 * Provides CRUD operations plus specialized methods for file organization:
 * listing files with pagination, moving files between folders, bulk deletion,
 * and key-based file retrieval.
 *
 * @example
 * ```typescript
 * import { FileRepo } from "@beep/shared-server"
 * import { SharedEntityIds } from "@beep/shared-domain"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const fileRepo = yield* FileRepo
 *
 *   // List files with pagination
 *   const result = yield* fileRepo.listPaginated({
 *     userId: SharedEntityIds.UserId.make(),
 *     offset: 0,
 *     limit: 20
 *   })
 *
 *   // Move files to a folder
 *   yield* fileRepo.moveFiles({
 *     fileIds: [SharedEntityIds.FileId.make()],
 *     folderId: SharedEntityIds.FolderId.make(),
 *     userId: SharedEntityIds.UserId.make()
 *   })
 * })
 * ```
 *
 * @category services
 * @since 0.1.0
 */
export class FileRepo extends Effect.Service<FileRepo>()($I`FileRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { makeQueryWithSchema } = yield* SharedDb.SharedDb;
    const baseRepo = yield* Repo.make(SharedEntityIds.FileId, File.Model, Effect.succeed({}));

    const listPaginated = makeQueryWithSchema({
      inputSchema: S.Struct({
        userId: SharedEntityIds.UserId,
        offset: S.NonNegativeInt,
        limit: S.NonNegativeInt,
      }),
      outputSchema: S.Struct({
        rootFiles: S.Array(File.Model),
        folders: S.Array(Folder.WithUploadedFiles),
        total: S.Number,
        offset: S.Number,
        limit: S.Number,
        hasNext: S.Boolean,
      }),
      queryFn: (execute, { userId, offset, limit }) =>
        Effect.gen(function* () {
          // 1. Count total folders for user
          const [countResult] = yield* execute((client) =>
            client.select({ count: d.count() }).from(folder).where(d.eq(folder.userId, userId))
          );
          const total = Number(countResult?.count ?? 0);

          // 2. Fetch folders with files using relational query
          const foldersWithFiles = yield* execute((client) =>
            client.query.folder.findMany({
              where: (t, { eq }) => eq(t.userId, userId),
              with: { files: true },
              orderBy: (t, { desc }) => [desc(t.updatedAt)],
              offset,
              limit,
            })
          );

          // 3. Transform: rename 'files' to 'uploadedFiles'
          const folders = F.pipe(
            foldersWithFiles,
            A.map((f) => ({
              id: f.id,
              organizationId: f.organizationId,
              userId: f.userId,
              name: f.name,
              createdAt: f.createdAt,
              updatedAt: f.updatedAt,
              uploadedFiles: f.files,
            }))
          );

          // 4. Fetch root files (no folder)
          const rootFiles = yield* execute((client) =>
            client.query.file.findMany({
              where: (t, { eq, isNull, and }) => and(eq(t.userId, userId), isNull(t.folderId)),
              orderBy: (t, { desc }) => [desc(t.updatedAt)],
            })
          );

          // 5. Return with pagination metadata
          return {
            rootFiles,
            folders,
            total,
            offset,
            limit,
            hasNext: offset + limit < total,
          };
        }),
    });

    const moveFiles = F.flow(
      makeQueryWithSchema({
        inputSchema: S.Struct({
          fileIds: S.Array(SharedEntityIds.FileId),
          folderId: S.NullOr(SharedEntityIds.FolderId),
          userId: SharedEntityIds.UserId,
        }),
        outputSchema: S.Void,
        queryFn: (execute, { fileIds, folderId, userId }) => {
          // CRITICAL: Empty array check prevents SQL syntax error
          // d.inArray() with [] generates "WHERE id IN ()" which is invalid SQL
          if (A.isEmptyReadonlyArray(fileIds)) {
            return Effect.void;
          }

          // Move to root (no authorization check needed - user owns files)
          if (folderId === null) {
            return execute((client) =>
              client
                .update(file)
                .set({
                  folderId: null,
                  updatedAt: d.sql`now()`,
                })
                .where(d.and(d.inArray(file.id, fileIds), d.eq(file.userId, userId)))
            );
          }

          // Move to folder (with EXISTS authorization check)
          // Only moves if: files belong to user AND folder belongs to user
          return execute((client) =>
            client
              .update(file)
              .set({
                folderId,
                updatedAt: d.sql`now()`,
              })
              .where(
                d.and(
                  d.inArray(file.id, fileIds),
                  d.eq(file.userId, userId),
                  d.exists(
                    client
                      .select({ one: d.sql`1` })
                      .from(folder)
                      .where(d.and(d.eq(folder.id, folderId), d.eq(folder.userId, userId)))
                  )
                )
              )
          );
        },
      }),
      Effect.withSpan("FileRepo.moveFiles")
    );

    const deleteFiles = F.flow(
      makeQueryWithSchema({
        inputSchema: S.Struct({
          fileIds: S.Array(SharedEntityIds.FileId),
          userId: SharedEntityIds.UserId,
        }),
        outputSchema: S.Array(File.UploadKey),
        queryFn: (execute, { fileIds, userId }) =>
          Effect.gen(function* () {
            // CRITICAL: Empty array check prevents SQL syntax error
            // d.inArray() with [] generates "WHERE id IN ()" which is invalid SQL
            if (A.isEmptyReadonlyArray(fileIds)) {
              return A.empty<File.UploadKey.Type>();
            }

            // Delete files and return their keys for S3 cleanup
            const results = yield* execute((client) =>
              client
                .delete(file)
                .where(d.and(d.inArray(file.id, fileIds), d.eq(file.userId, userId)))
                .returning({ key: file.key })
            );

            // Extract keys using Effect Array utility
            return F.pipe(
              results,
              A.map((r) => r.key)
            );
          }),
      }),
      Effect.withSpan("FileRepo.deleteFiles")
    );

    const getFilesByKeys = F.flow(
      makeQueryWithSchema({
        inputSchema: S.Struct({
          keys: S.Array(File.Model.fields.key),
          userId: SharedEntityIds.UserId,
        }),
        outputSchema: S.Array(S.NullOr(File.Model)),
        queryFn: (execute, { keys, userId }) =>
          Effect.gen(function* () {
            // Handle empty input
            if (A.isEmptyReadonlyArray(keys)) {
              return A.empty<File.Model | null>();
            }

            // Fetch files matching any of the keys
            const results = yield* execute((client) =>
              client.query.file.findMany({
                where: (t, { inArray, eq, and }) => and(inArray(t.key, keys), eq(t.userId, userId)),
              })
            );

            // Build lookup HashMap: key -> file
            const resultsByKey = F.pipe(
              results,
              A.map((f) => [f.key, f] as const),
              HashMap.fromIterable
            );
            return F.pipe(
              keys,
              //
              A.map((key) => F.pipe(HashMap.get(resultsByKey, key), O.getOrNull))
            );
          }),
      }),
      Effect.withSpan("FileRepo.getFilesByKeys")
    );
    return {
      moveFiles,
      deleteFiles,
      listPaginated,
      getFilesByKeys,
      ...baseRepo,
    };
  }),
}) {}
