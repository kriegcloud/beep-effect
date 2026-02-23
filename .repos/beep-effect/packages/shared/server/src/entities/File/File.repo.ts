import { SharedEntityIds } from "@beep/shared-domain";
import { File, Folder } from "@beep/shared-domain/entities";
import type { DbClient } from "@beep/shared-server";
import { SharedDb } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { file, folder } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const serviceEffect = Effect.gen(function* () {
  const { makeQueryWithSchema } = yield* SharedDb.Db;
  const baseRepo = yield* DbRepo.make(SharedEntityIds.FileId, File.Model);

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
    queryFn: Effect.fnUntraced(function* (execute, { userId, offset, limit }) {
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

      // 3. Transform: rename 'files' to 'uploadedFiles' while preserving all folder fields
      const folders = F.pipe(
        foldersWithFiles,
        A.map(({ files, ...folderFields }) => ({
          ...folderFields,
          uploadedFiles: files,
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
                folderId: folderId,
                updatedAt: d.sql`now()`,
              })
              .where(d.and(d.inArray(file.id, fileIds), d.eq(file.userId, userId)))
          ).pipe(Effect.asVoid);
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
        ).pipe(Effect.asVoid);
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
      queryFn: Effect.fnUntraced(function* (execute, { fileIds, userId }) {
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
      queryFn: Effect.fnUntraced(function* (execute, { keys, userId }) {
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
  } as unknown as File.RepoShape;
});

export const RepoLive: Layer.Layer<File.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  File.Repo,
  serviceEffect
).pipe(Layer.provide(SharedDb.layer));
