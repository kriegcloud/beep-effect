import * as S from "effect/Schema";
import { Class } from "@beep/schema/custom/Class.schema";
import { Ext } from "@beep/schema/custom/file/extensions";
import { MimeType } from "@beep/schema/custom/file/extensions";
import { FileSignature } from "@beep/schema/custom/file/FileSignature.schema";

export class FileInfo extends Class<FileInfo>("FileInfo")({
  extension: Ext,
  mimeType: MimeType,
  description: S.NonEmptyString,
  signatures: S.Array(FileSignature)
}, {
  schemaId: Symbol.for("@beep/schema/custom/file/FileInfo"),
  identifier: "FileInfo",
  title: "File Info",
  description: "File information",
}) {}

export namespace FileInfo {
  export type Type = S.Schema.Type<typeof FileInfo>
  export type Encoded = S.Schema.Encoded<typeof FileInfo>
}

export class DetectedFileInfo extends Class<DetectedFileInfo>("DetectedFileInfo")({
  extension: Ext,
  mimeType: MimeType,
  description: S.String,
  signature: FileSignature,
}, {
  schemaId: Symbol.for("@beep/schema/custom/file/DetectedFileInfo"),
  identifier: "DetectedFileInfo",
  title: "Detected File Info",
  description: "File information detected by signature",
}) {}

export namespace DetectedFileInfo {
  export type Type = S.Schema.Type<typeof DetectedFileInfo>
  export type Encoded = S.Schema.Encoded<typeof DetectedFileInfo>
}
