import { $SharedClientId } from "@beep/identity/packages";
import type { BS } from "@beep/schema";
import { AnyEntityId, EntityKind, SharedEntityIds } from "@beep/shared-domain";
import { File as BeepFile, type File, type Folder } from "@beep/shared-domain/entities";
import * as Data from "effect/Data";
import * as S from "effect/Schema";

const $I = $SharedClientId.create("atom/files/types");

export type UploadPhase = Data.TaggedEnum<{
  readonly Compressing: {};
  readonly Uploading: {};
  readonly Syncing: {};
  readonly Done: {};
}>;

export const UploadPhase = Data.taggedEnum<UploadPhase>();

export type UploadInput = {
  readonly file: BS.FileFromSelf.Type;
  readonly folderId: SharedEntityIds.FolderId.Type | null;
  readonly entityKind: EntityKind.Type;
  readonly entityIdentifier: AnyEntityId.Type;
  readonly entityAttribute: string;
  readonly metadata: typeof File.Model.fields.metadata.Type;
};

export type UploadState = Data.TaggedEnum<{
  readonly Idle: { readonly input: UploadInput };
  readonly Compressing: { readonly input: UploadInput };
  readonly Uploading: { readonly input: UploadInput; readonly fileToUpload: BS.FileFromSelf.Type };
  readonly Syncing: { readonly input: UploadInput; readonly fileKey: File.UploadKey.Type };
  readonly Done: {};
}>;

export const UploadState = Data.taggedEnum<UploadState>();

export type ActiveUpload = {
  readonly id: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly folderId: SharedEntityIds.FolderId.Type | null;
};

export type FileCacheUpdate = Data.TaggedEnum<{
  readonly DeleteFolders: { readonly folderIds: readonly SharedEntityIds.FolderId.Type[] };
  readonly DeleteFiles: { readonly fileIds: readonly SharedEntityIds.FileId.Type[] };
  readonly CreateFolder: { readonly folder: Folder.WithUploadedFiles };
  readonly MoveFiles: {
    readonly fileIds: readonly SharedEntityIds.FileId.Type[];
    readonly fromFolderId: SharedEntityIds.FolderId.Type | null;
    readonly toFolderId: SharedEntityIds.FolderId.Type | null;
  };
  readonly AddFile: {
    readonly file: File.Model;
    readonly folderId: SharedEntityIds.FolderId.Type | null;
  };
}>;

export const { DeleteFiles, DeleteFolders, CreateFolder, MoveFiles, AddFile } = Data.taggedEnum<FileCacheUpdate>();

const startUploadFieldsShared = {
  entityKind: EntityKind,
  entityIdentifier: AnyEntityId,
  entityAttribute: S.String,
  metadata: BeepFile.Model.fields.metadata,
} as const;

export class StartUploadRoot extends S.TaggedClass<StartUploadRoot>($I`StartUploadRoot`)(
  "Root",
  startUploadFieldsShared,
  $I.annotations("StartUploadRoot", {
    description: "Start upload for a root entity",
  })
) {}

export class StartUploadFolder extends S.TaggedClass<StartUploadFolder>($I`StartUploadFolder`)(
  "Folder",
  {
    ...startUploadFieldsShared,
    id: SharedEntityIds.FolderId,
  },
  $I.annotations("StartUploadFolder", {
    description: "Start upload operation for a specific folder destination",
  })
) {}

export class StartUploadInput extends S.Union(StartUploadFolder, StartUploadRoot).annotations(
  $I.annotations("StartUploadInput", {
    description: "Start upload for a root entity or a folder",
  })
) {
  static readonly makeFolder = (input: Omit<StartUploadFolder, "_tag">) => new StartUploadFolder(input);
  static readonly makeRoot = (input: Omit<StartUploadRoot, "_tag">) => new StartUploadRoot(input);
}

export declare namespace StartUploadInput {
  export type Type = typeof StartUploadInput.Type;
  export type Encoded = typeof StartUploadInput.Encoded;
}
