import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export class FileAttributes extends BS.Class<FileAttributes>("FileAttributes")(
  {
    size: S.NonNegativeInt,
    type: BS.MimeType,
    lastModifiedDate: BS.DateFromAllAcceptable,
    lastModified: BS.DateFromAllAcceptable,
    name: S.NonEmptyString,
    webkitRelativePath: S.optional(S.NonEmptyString),
    relativePath: S.optional(S.NonEmptyString),
    path: S.optional(S.NonEmptyString),
  },
  {
    schemaId: Symbol.for("@beep/files-domain/value-objects/FileAttributes"),
    identifier: "FileAttributes",
    title: "FileAttributes",
    description: "File attributes schema",
  }
) {}

export namespace FileAttributes {
  export type Type = S.Schema.Type<typeof FileAttributes>;
  export type Encoded = S.Schema.Encoded<typeof FileAttributes>;
}
