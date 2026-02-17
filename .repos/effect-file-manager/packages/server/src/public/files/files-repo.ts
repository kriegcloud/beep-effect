import { PgLive } from "@/db/pg-live";
import * as SqlClient from "@effect/sql/SqlClient";
import * as SqlSchema from "@effect/sql/SqlSchema";
import { Folder, FolderId, UploadedFile, UploadedFileId } from "@example/domain/api/files/files-rpc";
import { UserId } from "@example/domain/policy";
import * as Arr from "effect/Array";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as Schema from "effect/Schema";

export class FilesRepo extends Effect.Service<FilesRepo>()(
  "@example/server/public/files/files-repo/FilesRepo",
  {
    dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const listPaginated = flow(
        SqlSchema.single({
          Request: Schema.Struct({
            userId: UserId,
            offset: Schema.Number,
            limit: Schema.Number,
          }),
          Result: Schema.Struct({
            rootFiles: Schema.parseJson(Schema.Array(UploadedFile)),
            folders: Schema.parseJson(Schema.Array(Folder.WithUploadedFiles)),
            total: Schema.Number,
            offset: Schema.Number,
            limit: Schema.Number,
            hasNext: Schema.Boolean,
          }),
          execute: (req) => sql`
            WITH
              counts AS (
                SELECT
                  COUNT(ff.id)::int AS total_folders
                FROM
                  public.file_folders ff
                WHERE
                  ff.user_id = ${req.userId}
              ),
              page_folders AS (
                SELECT
                  ff.id,
                  ff.user_id,
                  ff.name,
                  ff.created_at,
                  ff.updated_at
                FROM
                  public.file_folders ff
                WHERE
                  ff.user_id = ${req.userId}
                ORDER BY
                  ff.updated_at DESC
                OFFSET ${req.offset} LIMIT ${req.limit}
              )
            SELECT
              (
                COALESCE(
                  (
                    SELECT
                      json_agg(
                        json_build_object(
                          'id',
                          f.id,
                          'name',
                          f.name,
                          'mimeType',
                          f.mime_type,
                          'size',
                          f.size::text,
                          'folderId',
                          f.folder_id,
                          'uploadthingKey',
                          f.uploadthing_key,
                          'uploadthingUrl',
                          f.uploadthing_url,
                          'createdAt',
                          f.created_at,
                          'updatedAt',
                          f.updated_at
                        )
                        ORDER BY
                          f.updated_at DESC
                      )
                    FROM
                      public.files f
                    WHERE
                      f.folder_id IS NULL
                      AND f.user_id = ${req.userId}
                  ),
                  '[]'
                )
              ) AS "rootFiles",
              (
                COALESCE(
                  (
                    SELECT
                      json_agg(
                        json_build_object(
                          'id',
                          pf.id,
                          'name',
                          pf.name,
                          'createdAt',
                          pf.created_at,
                          'updatedAt',
                          pf.updated_at,
                          'files',
                          COALESCE(folder_files.files, '[]'::json)
                        )
                        ORDER BY
                          pf.updated_at DESC
                      )
                    FROM
                      page_folders pf
                      LEFT JOIN LATERAL (
                        SELECT
                          json_agg(
                            json_build_object(
                              'id',
                              f.id,
                              'name',
                              f.name,
                              'mimeType',
                              f.mime_type,
                              'size',
                              f.size::text,
                              'folderId',
                              f.folder_id,
                              'uploadthingKey',
                              f.uploadthing_key,
                              'uploadthingUrl',
                              f.uploadthing_url,
                              'createdAt',
                              f.created_at,
                              'updatedAt',
                              f.updated_at
                            )
                            ORDER BY
                              f.updated_at DESC
                          ) AS files
                        FROM
                          public.files f
                        WHERE
                          f.folder_id = pf.id
                      ) folder_files ON TRUE
                  ),
                  '[]'
                )
              ) AS folders,
              (SELECT total_folders FROM counts) AS total,
              CAST(${req.offset} AS int) AS offset,
              CAST(${req.limit} AS int) AS limit,
              (
                (CAST(${req.offset} AS int) + CAST(${req.limit} AS int)) < (
                  SELECT
                    total_folders
                  FROM
                    counts
                )
              ) AS "hasNext"
          `,
        }),
        Effect.orDie,
        Effect.withSpan("FilesRepo.listPaginated"),
      );

      const insertFolder = flow(
        SqlSchema.single({
          Request: Schema.Struct({
            userId: UserId,
            name: Schema.String,
          }),
          Result: Folder,
          execute: (req) => sql`
            INSERT INTO
              public.file_folders (user_id, name)
            VALUES
              (
                ${req.userId},
                ${req.name}
              )
            RETURNING
              id,
              name,
              created_at AS "createdAt",
              updated_at AS "updatedAt"
          `,
        }),
        Effect.orDie,
        Effect.withSpan("FilesRepo.insertFolder"),
      );

      const insertFile = flow(
        SqlSchema.single({
          Request: Schema.Struct({
            userId: UserId,
            folderId: Schema.NullOr(FolderId),
            uploadthingKey: Schema.String,
            uploadthingUrl: Schema.String,
            name: Schema.String,
            size: Schema.String,
            mimeType: Schema.String,
            uploadedByUserId: Schema.UUID,
          }),
          Result: UploadedFile,
          execute: (req) =>
            req.folderId === null
              ? sql`
                  INSERT INTO
                    public.files (
                      user_id,
                      folder_id,
                      uploadthing_key,
                      uploadthing_url,
                      name,
                      size,
                      mime_type,
                      uploaded_by_user_id
                    )
                  VALUES
                    (
                      ${req.userId},
                      ${req.folderId},
                      ${req.uploadthingKey},
                      ${req.uploadthingUrl},
                      ${req.name},
                      ${req.size},
                      ${req.mimeType},
                      ${req.uploadedByUserId}
                    )
                  RETURNING
                    id,
                    name,
                    mime_type AS "mimeType",
                    size::text,
                    folder_id AS "folderId",
                    uploadthing_key AS "uploadthingKey",
                    uploadthing_url AS "uploadthingUrl",
                    created_at AS "createdAt",
                    updated_at AS "updatedAt"
                `
              : sql`
                  WITH
                    folder_check AS (
                      SELECT
                        id,
                        user_id
                      FROM
                        public.file_folders
                      WHERE
                        id = ${req.folderId}
                        AND user_id = ${req.userId}
                    )
                  INSERT INTO
                    public.files (
                      user_id,
                      folder_id,
                      uploadthing_key,
                      uploadthing_url,
                      name,
                      size,
                      mime_type,
                      uploaded_by_user_id
                    )
                  SELECT
                    fc.user_id,
                    ${req.folderId},
                    ${req.uploadthingKey},
                    ${req.uploadthingUrl},
                    ${req.name},
                    ${req.size},
                    ${req.mimeType},
                    ${req.uploadedByUserId}
                  FROM
                    folder_check fc
                  RETURNING
                    id,
                    name,
                    mime_type AS "mimeType",
                    size::text,
                    folder_id AS "folderId",
                    uploadthing_key AS "uploadthingKey",
                    uploadthing_url AS "uploadthingUrl",
                    created_at AS "createdAt",
                    updated_at AS "updatedAt"
                `,
        }),
        Effect.orDie,
        Effect.withSpan("FilesRepo.insertFile"),
      );

      const deleteFiles = flow(
        SqlSchema.findAll({
          Request: Schema.Struct({
            fileIds: Schema.Array(UploadedFileId),
            userId: UserId,
          }),
          Result: Schema.Struct({
            uploadthingKey: Schema.String,
          }),
          execute: (req) => sql`
            DELETE FROM public.files f
            WHERE
              ${sql.in("f.id", req.fileIds)}
              AND f.user_id = ${req.userId}
            RETURNING
              f.uploadthing_key AS "uploadthingKey"
          `,
        }),
        Effect.map((results) => results.map((r) => r.uploadthingKey)),
        Effect.orDie,
        Effect.withSpan("FilesRepo.deleteFiles"),
      );

      const deleteFolders = (req: { folderIds: ReadonlyArray<FolderId>; userId: UserId }) =>
        Effect.gen(function* () {
          const results = yield* SqlSchema.findAll({
            Request: Schema.Struct({
              folderIds: Schema.Array(FolderId),
              userId: UserId,
            }),
            Result: Schema.Struct({
              uploadthingKey: Schema.String,
            }),
            execute: (req) => sql`
              SELECT
                f.uploadthing_key AS "uploadthingKey"
              FROM
                public.files f
                INNER JOIN public.file_folders folder ON f.folder_id = folder.id
              WHERE
                ${sql.in("folder.id", req.folderIds)}
                AND folder.user_id = ${req.userId}
            `,
          })(req);

          yield* SqlSchema.void({
            Request: Schema.Struct({
              folderIds: Schema.Array(FolderId),
              userId: UserId,
            }),
            execute: (req) => sql`
              DELETE FROM public.file_folders
              WHERE
                ${sql.in("id", req.folderIds)}
                AND user_id = ${req.userId}
            `,
          })(req);

          return results.map((r) => r.uploadthingKey);
        }).pipe(Effect.orDie, Effect.withSpan("FilesRepo.deleteFolders"));

      const moveFiles = flow(
        SqlSchema.void({
          Request: Schema.Struct({
            fileIds: Schema.Array(UploadedFileId),
            folderId: Schema.NullOr(FolderId),
            userId: UserId,
          }),
          execute: (req) =>
            req.folderId === null
              ? sql`
                  UPDATE public.files f
                  SET
                    folder_id = NULL,
                    updated_at = now()
                  WHERE
                    ${sql.in("f.id", req.fileIds)}
                    AND f.user_id = ${req.userId}
                `
              : sql`
                  UPDATE public.files f
                  SET
                    folder_id = ${req.folderId},
                    updated_at = now()
                  WHERE
                    ${sql.in("f.id", req.fileIds)}
                    AND f.user_id = ${req.userId}
                    AND EXISTS (
                      SELECT
                        1
                      FROM
                        public.file_folders folder
                      WHERE
                        folder.id = ${req.folderId}
                        AND folder.user_id = ${req.userId}
                    )
                `,
        }),
        Effect.orDie,
        Effect.withSpan("FilesRepo.moveFiles"),
      );

      const getFilesByKeys = (req: {
        readonly uploadthingKeys: ReadonlyArray<string>;
        readonly userId: UserId;
      }) =>
        Effect.gen(function* () {
          if (Arr.isEmptyReadonlyArray(req.uploadthingKeys)) {
            return Arr.empty<UploadedFile | null>();
          }

          const results = yield* SqlSchema.findAll({
            Request: Schema.Struct({
              uploadthingKeys: Schema.Array(Schema.String),
              userId: UserId,
            }),
            Result: UploadedFile,
            execute: (req) => sql`
              SELECT
                f.id,
                f.name,
                f.mime_type AS "mimeType",
                f.size::text,
                f.folder_id AS "folderId",
                f.uploadthing_key AS "uploadthingKey",
                f.uploadthing_url AS "uploadthingUrl",
                f.created_at AS "createdAt",
                f.updated_at AS "updatedAt"
              FROM
                public.files f
              WHERE
                ${sql.in("f.uploadthing_key", req.uploadthingKeys)}
                AND f.user_id = ${req.userId}
            `,
          })(req);

          const resultsByKey = new Map(
            Arr.map(results, (file) => [file.uploadthingKey, file] as const),
          );

          return Arr.map(req.uploadthingKeys, (key) => resultsByKey.get(key) ?? null);
        }).pipe(Effect.orDie, Effect.withSpan("FilesRepo.getFilesByKeys"));

      return {
        listPaginated,
        insertFolder,
        insertFile,
        deleteFiles,
        deleteFolders,
        moveFiles,
        getFilesByKeys,
      } as const;
    }),
  },
) {}
