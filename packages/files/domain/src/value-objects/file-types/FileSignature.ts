import * as S from "effect/Schema";
export class FileSignature extends S.Class<FileSignature>("FileSignature")(
  {
    sequence: S.Array(S.Union(S.Number, S.NonEmptyString)),
    offset: S.optional(S.Int.pipe(S.greaterThan(0))),
    skippedBytes: S.optional(S.Array(S.Int.pipe(S.greaterThan(0)))),
    description: S.optional(S.NonEmptyString),
    compatibleExtensions: S.optional(S.NonEmptyArray(S.String)),
  },
  {
    schemaId: Symbol.for("@beep/files-domain/value-objects/file-types/FileSignature"),
    identifier: "FileSignature",
    title: "File Signature",
    description: "File signature",
  }
) {}

export declare namespace FileSignature {
  export type Type = S.Schema.Type<typeof FileSignature>;
  export type Encoded = S.Schema.Encoded<typeof FileSignature>;
}
