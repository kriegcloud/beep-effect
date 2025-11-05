import * as S from "effect/Schema";

export class FileInstance extends S.declare((i: unknown): i is File => i instanceof File).annotations({
  schemaId: Symbol.for("@beep/files-domain/value-objects/FileInstance"),
  identifier: "FileInstance",
  title: "FileInstance",
  description: "Base file instance schema",
}) {}

export declare namespace FileInstance {
  export type Type = S.Schema.Type<typeof FileInstance>;
  export type Encoded = S.Schema.Encoded<typeof FileInstance>;
}
