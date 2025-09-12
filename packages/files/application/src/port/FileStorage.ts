import type { BS } from "@beep/schema";
import type { File } from "@beep/shared-domain/entities";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

export class FileStorage extends Context.Tag("@beep/files-application/FileStorage")<
  FileStorage,
  {
    readonly uploadFile: (uploadPath: File.UploadPath.Type) => Effect.Effect<void, Error, never>;
    readonly getPresignedUploadUrl: (
      uploadPath: File.UploadPath.Type,
      data: BS.Uint8Arr.Type
    ) => Effect.Effect<string, Error, never>;
    readonly deleteFile: (uploadPath: File.UploadPath.Type) => Effect.Effect<void, Error, never>;
    readonly deleteFiles: (uploadPaths: File.UploadPath.Type[]) => Effect.Effect<void, Error, never>;
  }
>() {}
