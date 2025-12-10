import { BS } from "@beep/schema";
import { AuthContextRpcMiddleware } from "@beep/shared-domain/Policy";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { File, Folder } from "../entities";
import { SharedEntityIds } from "../entity-ids";

export const MAX_FILE_SIZE_MB = 8;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export class ListFilesRpc extends Rpc.make("list", {
  stream: true,
  success: S.Struct({
    rootFiles: S.Array(File.Model),
    folders: S.Array(Folder.WithUploadedFiles),
  }),
}) {}

export class InitiateUploadPayload extends S.Class<InitiateUploadPayload>("InitiateUploadPayload")({
  fileName: S.String,
  fileSize: S.Number.annotations({ description: "The size of the file in bytes." }),
  mimeType: BS.MimeType,
  folderId: S.NullOr(SharedEntityIds.FolderId),
  metadata: File.Model.fields.metadata,
}) {}

export class InitiateUploadSuccess extends S.Class<InitiateUploadSuccess>("InitiateUploadSuccess")({
  presignedUrl: S.String,
  fileKey: File.UploadKey,
  metadata: File.Model.fields.metadata,
}) {}

export class InitiateUploadRpc extends Rpc.make("initiateUpload", {
  payload: InitiateUploadPayload,
  success: InitiateUploadSuccess,
}) {}

export class CreateFolderPayload extends S.Class<CreateFolderPayload>("CreateFolderPayload")({
  folderName: S.String,
}) {}

export class CreateFolderRpc extends Rpc.make("createFolder", {
  payload: CreateFolderPayload,
  success: Folder.Model,
}) {}

export class DeleteFilesPayload extends S.Class<DeleteFilesPayload>("DeleteFilesPayload")({
  fileIds: S.Array(SharedEntityIds.FileId),
}) {}

export class DeleteFilesRpc extends Rpc.make("deleteFiles", {
  payload: DeleteFilesPayload,
  success: S.Void,
}) {}

export class DeleteFoldersPayload extends S.Class<DeleteFoldersPayload>("DeleteFoldersPayload")({
  folderIds: S.Array(SharedEntityIds.FolderId),
}) {}

export class DeleteFoldersRpc extends Rpc.make("deleteFolders", {
  payload: DeleteFoldersPayload,
  success: S.Void,
}) {}

export class MoveFilesPayload extends S.Class<MoveFilesPayload>("MoveFilesPayload")({
  fileIds: S.Array(SharedEntityIds.FileId),
  folderId: S.NullOr(SharedEntityIds.FolderId),
}) {}

export class MoveFilesRpc extends Rpc.make("moveFiles", {
  payload: MoveFilesPayload,
  success: S.Void,
}) {}

export class GetFilesByKeysPayload extends S.Class<GetFilesByKeysPayload>("GetFilesByKeysPayload")({
  uploadKeys: S.Array(File.UploadKey).pipe(
    S.maxItems(100, { description: "Maximum of 100 files can be retrieved at once." })
  ),
}) {}
export class GetFilesByKeysSuccess extends S.Array(S.NullOr(File.Model)) {}

export declare namespace GetFilesByKeysSuccess {
  export type Type = typeof GetFilesByKeysSuccess.Type;
  export type Encoded = typeof GetFilesByKeysSuccess.Encoded;
}
export class GetFilesByKeyRpc extends Rpc.make("getFilesByKeys", {
  payload: GetFilesByKeysPayload,
  success: GetFilesByKeysSuccess,
}) {}

export class FilesRpc extends RpcGroup.make(
  ListFilesRpc,
  InitiateUploadRpc,
  CreateFolderRpc,
  DeleteFilesRpc,
  DeleteFoldersRpc,
  MoveFilesRpc,
  GetFilesByKeyRpc
)
  .prefix("files_")
  .middleware(AuthContextRpcMiddleware) {}

export const FilesEvent = S.Union(
  S.TaggedStruct("Files.Uploaded", {
    file: File.Model,
  })
);

export type FilesEvent = typeof FilesEvent.Type;
