import { MimeType } from "@beep/schema/custom/file/extensions";
import * as S from "effect/Schema";
import { Class } from "../Class.schema";
import { DateFromAllAcceptable } from "../dates";

export class FileBase extends S.declare((i: unknown): i is File => i instanceof File).annotations({
  schemaId: Symbol.for("@beep/schema/custom/file/FileBase"),
  identifier: "FileBase",
  title: "FileBase",
  description: "Base file schema",
}) {}

export namespace FileBase {
  export type Type = S.Schema.Type<typeof FileBase>;
  export type Encoded = S.Schema.Encoded<typeof FileBase>;
}

export class FileAttributes extends Class<FileAttributes>("FileAttributes")(
  {
    size: S.NonNegativeInt,
    type: MimeType,
    lastModifiedDate: DateFromAllAcceptable,
    lastModified: DateFromAllAcceptable,
    name: S.NonEmptyString,
    webkitRelativePath: S.optional(S.NonEmptyString),
    relativePath: S.optional(S.NonEmptyString),
    path: S.optional(S.NonEmptyString),
  },
  {
    schemaId: Symbol.for("@beep/schema/custom/file/FileAttributes"),
    identifier: "FileAttributes",
    title: "FileAttributes",
    description: "File attributes schema",
  }
) {}

export namespace FileAttributes {
  export type Type = S.Schema.Type<typeof FileAttributes>;
  export type Encoded = S.Schema.Encoded<typeof FileAttributes>;
}
