import * as S from "effect/Schema";

export class FileSignature extends S.Class<FileSignature>("FileSignature")(
  {
    sequence: S.Array(S.Union(S.Number, S.String)),
    offset: S.optional(S.Number),
    skippedBytes: S.optional(S.Array(S.Number)),
    description: S.optional(S.String),
    compatibleExtensions: S.optional(S.Array(S.String)),
  },
  {
    schemaId: Symbol.for("@beep/schema/custom/file/FileSignature"),
    identifier: "FileSignature",
    title: "File Signature",
    description: "File signature",
  }
) {}

export namespace FileSignature {
  export type Type = S.Schema.Type<typeof FileSignature>;
  export type Encoded = S.Schema.Encoded<typeof FileSignature>;
}
