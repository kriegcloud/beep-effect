import { DateTimeUtcFromAllAcceptable } from "@beep/schema/primitives";
import * as S from "effect/Schema";
import { MimeType } from "./mime-types";

export class FileAttributes extends S.Class<FileAttributes>("FileAttributes")(
  {
    size: S.NonNegativeInt,
    type: MimeType,
    lastModifiedDate: DateTimeUtcFromAllAcceptable,
    lastModified: DateTimeUtcFromAllAcceptable,
    name: S.NonEmptyString,
    webkitRelativePath: S.optional(S.NonEmptyString),
    relativePath: S.optional(S.NonEmptyString),
    path: S.optional(S.NonEmptyString),
  },
  {
    schemaId: Symbol.for("@beep/schema/integrations/files/FileAttributes"),
    identifier: "FileAttributes",
    title: "FileAttributes",
    description: "File attributes schema",
  }
) {}

export declare namespace FileAttributes {
  export type Type = S.Schema.Type<typeof FileAttributes>;
  export type Encoded = S.Schema.Encoded<typeof FileAttributes>;
}
