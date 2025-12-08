import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Filename, UploadPath } from "@beep/shared-domain/entities/File/schemas";
import { AuthContextRpcMiddleware } from "@beep/shared-domain/Policy";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import { AnyEntityId, EntityKind } from "../../entity-ids";
import { Model } from "./File.model.ts";

const $I = $SharedDomainId.create("entities/File/rpc");

export const MAX_FILE_SIZE_MB = 8;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export class InitiateUploadPayload extends S.Class<InitiateUploadPayload>($I`InitiateUploadRpcPayload`)(
  {
    fileName: Filename,
    fileSize: S.NonNegativeInt.annotations({ description: "The size of the file in bytes" }),
    mimeType: BS.MimeType,
    entityKind: EntityKind,
    entityIdentifier: AnyEntityId,
    entityAttribute: S.String,
    fileItemExtension: BS.FileExtension,
  },
  $I.annotations("InitiateUploadPayload", {
    description: "Payload for initiating a file upload",
  })
) {}

export class InitiateUploadSuccess extends S.Class<InitiateUploadSuccess>($I`InitiateUploadSuccess`)(
  {
    presignedUrl: BS.URLString,
    fileKey: UploadPath,
    fields: S.Record({
      key: S.String,
      value: S.String,
    }),
  },
  $I.annotations("InitiateUploadSuccess", {
    description: "Success response for initiating a file upload",
  })
) {}

// export class DeleteFilesPayload extends S.Class<DeleteFilesPayload>($I`DeleteFilesPayload`)(
//   {
//     fileIds: S.NonEmptyArray(SharedEntityIds.FileId),
//   },
//   $I.annotations("DeleteFilesPayload", {
//     description: "Payload for deleting files",
//   })
// ) {}
//
// export declare namespace DeleteFilesPayload {
//   export type Type = S.Schema.Type<typeof DeleteFilesPayload>;
//   export type Encoded = S.Schema.Encoded<typeof DeleteFilesPayload>;
// }

// export class GetFilesByKeysPayload extends S.Class<GetFilesByKeysPayload>($I`GetFilesByKeysPayload`)(
//   {
//     fileKeys: S.NonEmptyArray(UploadPath).pipe(S.maxItems(100, { description: "Maximum 100 keys per batch request" })),
//   },
//   $I.annotations("GetFilesByKeysPayload", {
//     description: "Payload for getting files by keys",
//   })
// ) {}
//
// export class GetFilesByKeysSuccess extends S.Array(S.NullOr(Model)).annotations(
//   $I.annotations("GetFilesByKeysSuccess", {
//     description: "Success response for getting files by keys",
//   })
// ) {}

// export declare namespace GetFilesByKeysSuccess {
//   export type Type = S.Schema.Type<typeof GetFilesByKeysSuccess>;
//   export type Encoded = S.Schema.Encoded<typeof GetFilesByKeysSuccess>;
// }

export class InitiateUploadRpc extends Rpc.make("initiateUpload", {
  payload: InitiateUploadPayload,
  success: InitiateUploadSuccess,
}) {}

// export class DeleteFilesRpc extends Rpc.make("deleteFiles", {
//   payload: DeleteFilesPayload,
// }) {}
//
// export class GetFilesByKeysRpc extends Rpc.make("getFilesByKeys", {
//   payload: GetFilesByKeysPayload,
//   success: GetFilesByKeysSuccess,
// }) {}

export class FileRpc extends RpcGroup.make(InitiateUploadRpc).prefix("files_").middleware(AuthContextRpcMiddleware) {}

export class FileUploadedEvent extends S.TaggedClass<FileUploadedEvent>($I`FileUploadedEvent`)(
  "File.Uploaded",
  {
    file: Model,
  },
  $I.annotations("FileUploadedEvent", {
    description: "Event for when a file is uploaded",
  })
) {}

export class FileEvent extends S.Union(FileUploadedEvent).annotations(
  $I.annotations("FileEvent", {
    description: "Event for when a file is uploaded",
  })
) {}

export declare namespace FileEvent {
  export type Type = S.Schema.Type<typeof FileEvent>;
  export type Encoded = S.Schema.Encoded<typeof FileEvent>;
}
