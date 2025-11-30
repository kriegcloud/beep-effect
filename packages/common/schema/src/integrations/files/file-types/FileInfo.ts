import * as S from "effect/Schema";
import { FileSignature } from "./FileSignature";

export class FileInfo extends S.Class<FileInfo>("FileInfo")(
  {
    extension: S.String,
    mimeType: S.String,
    description: S.NonEmptyString,
    signatures: S.Array(FileSignature),
  },
  {
    schemaId: Symbol.for("@beep/schema/integrations/files/file-types/FileInfo"),
    identifier: "FileInfo",
    title: "File Info",
    description: "File information",
  }
) {}

export declare namespace FileInfo {
  export type Type = S.Schema.Type<typeof FileInfo>;
  export type Encoded = S.Schema.Encoded<typeof FileInfo>;
}

export class DetectedFileInfo extends S.Class<DetectedFileInfo>("DetectedFileInfo")(
  {
    extension: S.String,
    mimeType: S.String,
    description: S.String,
    signature: FileSignature,
  },
  {
    schemaId: Symbol.for("@beep/schema/integrations/files/file-types/DetectedFileInfo"),
    identifier: "DetectedFileInfo",
    title: "Detected File Info",
    description: "File information detected by signature",
  }
) {}

export declare namespace DetectedFileInfo {
  export type Type = S.Schema.Type<typeof DetectedFileInfo>;
  export type Encoded = S.Schema.Encoded<typeof DetectedFileInfo>;
}
