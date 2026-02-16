import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as Schema from "effect/Schema";
import { CurrentUserRpcMiddleware } from "../../policy.js";

export const MAX_FILE_SIZE_MB = 8;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const FolderId = Schema.UUID.pipe(Schema.brand("FolderId"));
export type FolderId = typeof FolderId.Type;

export class Folder extends Schema.Class<Folder>("Folder")({
  id: FolderId,
  name: Schema.String,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

export const UploadedFileId = Schema.UUID.pipe(Schema.brand("FileId"));
export type UploadedFileId = typeof UploadedFileId.Type;

export class UploadedFile extends Schema.Class<UploadedFile>("UploadedFile")({
  id: UploadedFileId,
  name: Schema.String,
  mimeType: Schema.String,
  size: Schema.String,
  folderId: Schema.NullOr(FolderId),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
  uploadthingKey: Schema.String,
  uploadthingUrl: Schema.String,
}) {}

export namespace Folder {
  export class WithUploadedFiles extends Schema.Class<WithUploadedFiles>("WithUploadedFiles")({
    ...Folder.fields,
    files: Schema.Array(UploadedFile),
  }) {}
}

export class ListFilesRpc extends Rpc.make("list", {
  stream: true,
  success: Schema.Struct({
    rootFiles: Schema.Array(UploadedFile),
    folders: Schema.Array(Folder.WithUploadedFiles),
  }),
}) {}

export class InitiateUploadRpc extends Rpc.make("initiateUpload", {
  payload: Schema.Struct({
    fileName: Schema.String,
    fileSize: Schema.Number.annotations({ description: "The size of the file in bytes" }),
    mimeType: Schema.String,
    folderId: Schema.NullOr(FolderId),
  }),
  success: Schema.Struct({
    presignedUrl: Schema.String,
    fileKey: Schema.String,
    fields: Schema.Record({ key: Schema.String, value: Schema.String }),
  }),
}) {}

export class CreateFolderRpc extends Rpc.make("createFolder", {
  payload: Schema.Struct({
    folderName: Schema.String,
  }),
  success: Folder,
}) {}

export class DeleteFilesRpc extends Rpc.make("deleteFiles", {
  payload: Schema.Struct({
    fileIds: Schema.Array(UploadedFileId),
  }),
  success: Schema.Void,
}) {}

export class DeleteFoldersRpc extends Rpc.make("deleteFolders", {
  payload: Schema.Struct({
    folderIds: Schema.Array(FolderId),
  }),
  success: Schema.Void,
}) {}

export class MoveFilesRpc extends Rpc.make("moveFiles", {
  payload: Schema.Struct({
    fileIds: Schema.Array(UploadedFileId),
    folderId: Schema.NullOr(FolderId),
  }),
  success: Schema.Void,
}) {}

export class GetFilesByKeysRpc extends Rpc.make("getFilesByKeys", {
  payload: Schema.Struct({
    uploadthingKeys: Schema.Array(Schema.String).pipe(
      Schema.maxItems(100, { description: "Maximum 100 keys per batch request" }),
    ),
  }),
  success: Schema.Array(Schema.NullOr(UploadedFile)),
}) {}

export class FilesRpc extends RpcGroup.make(
  ListFilesRpc,
  InitiateUploadRpc,
  CreateFolderRpc,
  DeleteFilesRpc,
  DeleteFoldersRpc,
  MoveFilesRpc,
  GetFilesByKeysRpc,
)
  .prefix("files_")
  .middleware(CurrentUserRpcMiddleware) {}

export const FilesEvent = Schema.Union(
  Schema.TaggedStruct("Files.Uploaded", {
    file: UploadedFile,
  }),
);
export type FilesEvent = typeof FilesEvent.Type;
